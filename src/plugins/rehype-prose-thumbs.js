import { visit } from "unist-util-visit"
import { getProseImageSrcset, getProseThumbWidth } from "../utils/prose-thumb.ts"
import { getPublicImageSizeSync } from "../utils/image-size.ts"

/**
 * 给正文图注入 srcset —— 用 `npm run thumbs` 生成的缩略图。
 *
 * 为什么需要：`public/images/` 下的图**原样拷进 dist、不走 Astro 图片优化**，
 * 浏览器只能整张下载原图。2026-10-19 实测（移动 390@2x）：
 * 正文图显示 324px、实际下发 1600px（**2.5 倍**），16 张合计 **582KB**；
 * 生成 640/960 两档后同一批图只要 **约 110KB（-81%）**。
 *
 * 🔴 必须放**全局样式表之外**、且在 rehypeFigure 之前：
 * 后者会把 img 包进 figure/center 并复制 properties，
 * 本插件只改 properties，两者顺序不冲突；但若 figure 先跑、它复制的是旧 props，
 * srcset 就丢了 —— 所以注册顺序要保证本插件在前（见 astro.config.mjs）。
 *
 * ⚠️ 三种"没有缩略图"的情形都优雅退回原图（见 utils/prose-thumb.ts）：
 * 没跑过脚本 / 单张缺 / 原图比该档还窄。退回原图只损失优化，不影响功能。
 */
export default function rehypeProseThumbs() {
	return tree => {
		visit(tree, "element", node => {
			if (node.tagName !== "img") return
			const src = node.properties?.src
			if (typeof src !== "string") return
			// 已经有 srcset 的不动（作者显式写了就按作者的来）
			if (node.properties.srcset) return

			const srcset = getProseImageSrcset(src)
			if (!srcset) return

			node.properties.srcset = srcset
			// sizes 要贴近**实测显示宽度**，否则会多挑一档、白付体积：
			// 正文图实测桌面显示 **640px**、手机 324px。
			// ⚠️ 这里写 640 而不是 660/768：sizes 一旦略大于 640，DPR1 下 need 就 >640，
			// 引擎只能挑 960 档（9KB）而不是 640 档（5KB）—— 桌面每张白付 4KB、16 张≈64KB。
			// ⚠️ 文件名带 `-full` 的是「整屏截图」，CSS 让它通栏（约 742px @1440），
			// sizes 必须跟着放大，否则 DPR1 下浏览器只挑 640 档、把图拉伸到 742 显示 = 糊。
			// 2026-10-30 实测：写 640px 时 currentSrc 落 -640.webp、naturalWidth 640 而显示 742。
			const isFullBleed = /-full\.[a-z]+$/i.test(src)
			if (!node.properties.sizes) {
				node.properties.sizes = isFullBleed ? "(min-width: 1024px) 742px, 100vw" : "(min-width: 768px) 640px, 100vw"
			}

			// width/height 换成**实际下发那一档**：三者（width、sizes、srcset 的 w）
			// 数字互相矛盾时 Chromium 会把 naturalWidth 报成第三种值，
			// 这条坑在相册那边已经踩过一次（config.md 五-62）。
			//
			// ⚠️ 本插件排在 rehypeFigure **之前**，那时 width/height 还是作者原样（通常没有）——
			// rehypeFigure 才去补原图尺寸。所以这里不能读 node 上已有的宽高，
			// 必须**自己按原图取比例**，否则会读到空值、property 原封不动（第一版就是这个错）。
			const thumbW = getProseThumbWidth(src)
			if (!thumbW) return
			const orig = getPublicImageSizeSync(src)
			if (!orig || !orig.width || !orig.height) return
			node.properties.width = thumbW
			node.properties.height = Math.round((thumbW * orig.height) / orig.width)
		})
	}
}
