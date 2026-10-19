import * as path from "node:path"
import * as fs from "node:fs"

/**
 * 正文配图缩略图工具：`npm run thumbs` 会在 `public/images/` 各子目录的 `thumbs/` 下
 * 生成 `<原名>-640.webp` / `<原名>-960.webp`，本模块负责把它们拼成 srcset。
 *
 * 🔴 为什么需要：`public/` 下的图原样拷进 dist、不经 Astro 图片优化。
 * 2026-10-19 实测移动端正文图显示 324px、下发 1600px（2.5 倍），16 张 582KB → 约 110KB。
 *
 * ⚠️ 只处理**站内** `/images/` 路径、且**同目录 thumbs/ 下确实存在**的那几档；
 * 任何不确定的情形一律返回 undefined（= 不写 srcset，浏览器用原图），绝不给出坏 URL。
 *
 * 📌 本注释第一版写成 `public/images/**` + `/thumbs/` 连着写，其中的 `*` + `/` 提前
 * 闭合了块注释 → 整个文件语法错误、tsc 报 TS1351/TS1005 一堆。**写 JSDoc 时别让
 * 星号后紧跟斜杠**，尤其 glob 路径。
 */

export const PROSE_THUMB_WIDTHS = [640, 960] as const

const IMG_EXT_RE = /\.(jpe?g|png|webp|avif|gif)$/i

const srcsetCache = new Map<string, string | undefined>()
const widthCache = new Map<string, number | null>()

/** /images/ccnewtools/06-x.webp → /images/ccnewtools/thumbs/06-x-640.webp */
function thumbUrl(src: string, width: number): string | null {
	const clean = src.split(/[?#]/)[0]
	// 只处理站内 /images/：相册另有一套（gallery-thumb.ts），外链构建期不碰
	if (!clean.startsWith("/images/")) return null
	if (!IMG_EXT_RE.test(clean)) return null
	const dir = path.posix.dirname(clean)
	const file = path.posix.basename(clean)
	const stem = file.replace(IMG_EXT_RE, "")
	return `${dir}/thumbs/${stem}-${width}.webp`
}

function exists(url: string): boolean {
	const clean = url.split(/[?#]/)[0]
	const pub = path.join(process.cwd(), "public") + path.sep
	const abs = path.resolve(path.join(process.cwd(), "public", clean.replace(/^\/+/, "")))
	if (!abs.startsWith(pub)) return false
	try {
		return fs.statSync(abs).isFile()
	} catch {
		return false
	}
}

/** 可直接给 `<img srcset>` 的字符串；没有任何可用缩略图时返回 undefined */
export function getProseImageSrcset(src: string | undefined | null): string | undefined {
	if (!src || typeof src !== "string") return undefined
	if (srcsetCache.has(src)) return srcsetCache.get(src)

	const parts: string[] = []
	for (const w of PROSE_THUMB_WIDTHS) {
		const u = thumbUrl(src, w)
		if (u && exists(u)) parts.push(`${u} ${w}w`)
	}
	const result = parts.length > 0 ? parts.join(", ") : undefined
	srcsetCache.set(src, result)
	return result
}

/** 最小可用那一档的宽度；没有缩略图返回 null（用于把 width/height 换成实际下发值） */
export function getProseThumbWidth(src: string | undefined | null): number | null {
	if (!src || typeof src !== "string") return null
	if (widthCache.has(src)) return widthCache.get(src) ?? null
	let picked: number | null = null
	for (const w of PROSE_THUMB_WIDTHS) {
		const u = thumbUrl(src, w)
		if (u && exists(u)) {
			picked = w
			break
		}
	}
	widthCache.set(src, picked)
	return picked
}
