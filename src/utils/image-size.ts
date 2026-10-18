import * as path from "node:path"
import * as fs from "node:fs"

/**
 * 取 public/ 下静态图片的真实像素尺寸，用于给 <img> 补 width/height（治 CLS）。
 *
 * 为什么需要：这些图走 public/ 原样拷贝、不经 Astro 图片优化，构建期拿不到
 * ImageMetadata → 产物里的 <img> 没有尺寸属性 → 浏览器排版时不知道该留多高，
 * 图加载完就往下挤内容（Cumulative Layout Shift）。
 *
 * 🔴 **零依赖**：只读文件头自己解析 webp / jpeg，不 import sharp
 * （sharp 是 astro 的传递依赖、package.json 里没声明，直接 import 属隐式依赖）。
 * 本项目只要 webp（35 张）与 jpeg（2 张）两种格式；解析不出来一律返回 null。
 *
 * ⚠️ 调用方必须把 null 当"没有尺寸"原样输出，**不要瞎猜数字** ——
 * 猜错了浏览器会按错误宽高比预留空间，比不写更糟。
 *
 * 缓存：一次构建里同一张图常被多处引用，模块级 Map 避免重复读盘。
 */

type Size = { width: number; height: number }
const cache = new Map<string, Size | null>()

/** 只处理站内 public/ 静态资源；外链与 data: 一律不碰（构建期不该联网） */
function toFsPath(url: string): string | null {
	const clean = url.split(/[?#]/)[0]
	if (!clean.startsWith("/images/") && !clean.startsWith("/gallery/")) return null
	const rel = clean.replace(/^\/+/, "")
	const pub = path.join(process.cwd(), "public") + path.sep
	const abs = path.resolve(path.join(process.cwd(), "public", rel))
	return abs.startsWith(pub) ? abs : null
}

/** WebP：RIFF 容器，三种子格式（VP8 有损 / VP8L 无损 / VP8X 扩展）尺寸位置各不相同 */
function parseWebp(buf: Buffer): Size | null {
	if (buf.length < 30) return null
	if (buf.toString("ascii", 0, 4) !== "RIFF") return null
	if (buf.toString("ascii", 8, 12) !== "WEBP") return null

	const fourcc = buf.toString("ascii", 12, 16)

	if (fourcc === "VP8 ") {
		// 有损：帧头 3 字节 0x9d 0x01 0x2a 之后，14 位宽 + 14 位高（小端）
		if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null
		const width = buf.readUInt16LE(26) & 0x3fff
		const height = buf.readUInt16LE(28) & 0x3fff
		return width && height ? { width, height } : null
	}

	if (fourcc === "VP8L") {
		// 无损：签名 0x2f 后紧跟 14 位宽-1、14 位高-1
		if (buf[20] !== 0x2f) return null
		const bits = buf.readUInt32LE(21)
		const width = (bits & 0x3fff) + 1
		const height = ((bits >> 14) & 0x3fff) + 1
		return width && height ? { width, height } : null
	}

	if (fourcc === "VP8X") {
		// 扩展：24 位宽-1、24 位高-1
		const width = (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1
		const height = (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1
		return width && height ? { width, height } : null
	}

	return null
}

/** JPEG：扫标记段，找 SOF0/1/2/…（C0-CF 去掉 C4/C8/CC）里的高宽 */
function parseJpeg(buf: Buffer): Size | null {
	if (buf.length < 4) return null
	if (buf[0] !== 0xff || buf[1] !== 0xd8) return null

	let offset = 2
	while (offset + 9 < buf.length) {
		if (buf[offset] !== 0xff) {
			offset++
			continue
		}
		const marker = buf[offset + 1]
		// 填充字节 0xFF
		if (marker === 0xff) {
			offset++
			continue
		}
		// 无长度字段的独立标记
		if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
			offset += 2
			continue
		}
		// 图像数据开始 / 结束
		if (marker === 0xd9 || marker === 0xda) return null

		const segLen = buf.readUInt16BE(offset + 2)
		// SOF：0xC0–0xCF，排除 DHT(C4)/JPG(C8)/DAC(CC)
		if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
			const height = buf.readUInt16BE(offset + 5)
			const width = buf.readUInt16BE(offset + 7)
			return width && height ? { width, height } : null
		}
		offset += 2 + segLen
	}
	return null
}

export function getPublicImageSizeSync(url: string | undefined | null): Size | null {
	if (!url || typeof url !== "string") return null
	const hit = cache.get(url)
	if (hit !== undefined) return hit

	const abs = toFsPath(url)
	let result: Size | null = null
	if (abs) {
		try {
			if (fs.existsSync(abs)) {
				// 文件头最多需要前 32 字节；JPEG 需略多，读 64KB 足够
				const fd = fs.openSync(abs, "r")
				const buf = Buffer.alloc(65536)
				const n = fs.readSync(fd, buf, 0, buf.length, 0)
				fs.closeSync(fd)
				const head = buf.subarray(0, n)
				if (head.toString("ascii", 0, 4) === "RIFF") result = parseWebp(head)
				else if (head[0] === 0xff && head[1] === 0xd8) result = parseJpeg(head)
			}
		} catch {
			result = null // 解不出来就当没有，绝不打断构建
		}
	}

	cache.set(url, result)
	return result
}
