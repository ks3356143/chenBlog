// LQIP（Low Quality Image Placeholder）采样工具。
//
// 对照参考站的产物形态：`.lqip-placeholder` 是一个内联 `linear-gradient(135deg, c1 0%, c2 50%, c3 100%)`，
// 加载完成后由 JS 加 `.loaded` 类淡出（`.lqip-placeholder{transition:opacity .5s ease-out}` +
// `.lqip-placeholder.loaded{opacity:0}`）。
//
// 本站做法：构建期用 sharp 把图缩到 3×1，取三个像素当渐变三段色 —— 与参考站同形态，
// 但颜色是从**这张图自己**采出来的，不是人工配色。
//
// ⚠️ 必须缓存：33 篇封面 + 相册缩略图，同一张图会被多次请求（列表页 / 详情页 / og），
//    不缓存会让构建时间线性膨胀。
import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import path from "node:path"
import sharp from "sharp"

const cache = new Map<string, string | null>()

function toHex(r: number, g: number, b: number): string {
	return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("")
}

/**
 * 从一张本地图片采样，返回可直接塞进 `style="background: ..."` 的渐变串。
 * 采样失败（文件不存在 / sharp 不支持该格式 / 远程 URL）返回 null —— 调用方退回无占位。
 *
 * @param filePath 绝对或相对 cwd 的图片路径
 */
export async function getLqipGradient(filePath: string): Promise<string | null> {
	const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
	const key = createHash("sha1").update(abs).digest("hex")
	if (cache.has(key)) return cache.get(key) ?? null

	if (!existsSync(abs)) {
		cache.set(key, null)
		return null
	}

	try {
		// 3×1 = 左 / 中 / 右 三个采样点，与参考站渐变的三段色一一对应
		const { data, info } = await sharp(abs)
			.resize(3, 1, { fit: "fill" })
			.raw()
			.toBuffer({ resolveWithObject: true })

		const channels = info.channels
		const colors: string[] = []
		for (let i = 0; i < 3; i++) {
			const o = i * channels
			colors.push(toHex(data[o], data[o + 1], data[o + 2]))
		}
		const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`
		cache.set(key, gradient)
		return gradient
	} catch {
		cache.set(key, null)
		return null
	}
}
