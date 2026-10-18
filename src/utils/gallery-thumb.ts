import * as path from "node:path"
import * as fs from "node:fs"

/**
 * 相册缩略图工具：`npm run thumbs` 会在 public/gallery/<相册>/thumbs/ 下
 * 生成 `<原名>-640.webp` / `<原名>-960.webp`。本模块负责把这些文件拼成 srcset。
 *
 * 🔴 为什么必须存在：相册图走 public/ 原样拷贝、不经 Astro 图片优化，
 * 而网格里最大只显示 301px（1920 屏实测）→ 不改的话浏览器整张下载原图
 * （桌面 237px 的位置下发 1600px，超供 6.8 倍；/gallery/ 一次 1.38MB）。
 *
 * ⚠️ 三种"没有缩略图"的情形都必须优雅退回原图，绝不能给出坏 URL：
 *   ① 还没跑过 npm run thumbs（thumbs/ 整个不存在）
 *   ② 某一张单独缺（新增了图但忘了重跑脚本）
 *   ③ 原图比该档还窄（脚本会把无意义的档删掉）
 * 退回原图只是损失优化，功能与观感不受影响。
 */

export const THUMB_WIDTHS = [640, 960] as const

const IMG_EXT_RE = /\.(jpe?g|png|webp|avif|gif)$/i

/** 缓存：一次构建里同一张图可能被多处引用 */
const cache = new Map<string, string>()
const pickCache = new Map<string, number | null>()

/** /gallery/<相册>/<文件> → /gallery/<相册>/thumbs/<文件名主干>-<宽>.webp */
function thumbUrl(src: string, width: number): string | null {
	const clean = src.split(/[?#]/)[0]
	if (!clean.startsWith("/gallery/")) return null
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

/**
 * 返回可直接传给 <img srcset> 的字符串，没有可用缩略图时返回 undefined。
 * 调用方拿到 undefined 就该完全不写 srcset（而不是写空串）。
 */
export function getGallerySrcset(src: string | undefined | null): string | undefined {
	if (!src || typeof src !== "string") return undefined
	const hit = cache.get(src)
	if (hit !== undefined) return hit || undefined

	const parts: string[] = []
	for (const w of THUMB_WIDTHS) {
		const u = thumbUrl(src, w)
		if (u && exists(u)) parts.push(`${u} ${w}w`)
	}

	const result = parts.length > 0 ? parts.join(", ") : ""
	cache.set(src, result)
	return result || undefined
}

/**
 * <img src> 用哪一条：有缩略图就给最小档（不支持 srcset 的老浏览器也能拿到小图），
 * 没有就退回原图。**srcset/sizes 生效时浏览器不会用这条**，它只是兜底。
 */
export function getGalleryDisplaySrc(src: string | undefined | null): string {
	if (!src || typeof src !== "string") return src || ""
	for (const w of THUMB_WIDTHS) {
		const u = thumbUrl(src, w)
		if (u && exists(u)) return u
	}
	return src
}

/**
 * 实际会下发的缩略图象素宽；没有缩略图返回 null。
 *
 * 🔴 **必须用它来写 `<img width/height>`**（配合原图比例算出 height），不能写原图宽高：
 * 2026-10-18 实测，`width="1440"` + `sizes="320px"` + srcset 的 `640w/960w` 三个数字互相矛盾时，
 * Chromium 会把 `naturalWidth` 报成 **320**（不是文件的 640，也不是属性的 1440），
 * 页面观感没问题（CSS 用 w-full 定宽）但属性与实际对不上、后续按 naturalWidth 做的判断全错。
 * width/height 的作用只是「下载完成前让浏览器知道比例」，所以写**实际会下发的那一档**最诚实。
 */
export function getGalleryThumbWidth(src: string | undefined | null): number | null {
	if (!src || typeof src !== "string") return null
	const hit = pickCache.get(src)
	if (hit !== undefined) return hit
	let picked: number | null = null
	for (const w of THUMB_WIDTHS) {
		const u = thumbUrl(src, w)
		if (u && exists(u)) {
			picked = w
			break
		}
	}
	pickCache.set(src, picked)
	return picked
}
