import { h } from "hastscript"
import { visit } from "unist-util-visit"
import { shouldAddNoReferrer } from "../utils/image-utils.ts"
import { getPublicImageSizeSync } from "../utils/image-size.ts"
import { transformRawImages, readRawSrc, rawHasAttr, appendRawAttr } from "./raw-img-utils.mjs"

/**
 * 将带有 alt 文本的图片转换为包含 figcaption 的 figure 元素的 rehype 插件
 *
 * @returns {Function} A transformer function for the rehype plugin
 */
export default function rehypeFigure() {
    return (tree) => {
        // 正文里第几张图（用于首图不懒加载）
        let imgIndex = 0

        /* 🔴 markdown 里手写的整段 HTML（`<div class="dis">…<img>…</div>`）在 hast 树里是
           **raw 节点**，不是 element —— `visit(tree, "element")` 根本看不见它。
           2026-11-11 实测：33 篇里 12 个 img 因此完全没有 loading / alt / decoding
           （都藏在 100daysCSS 那几篇的 raw HTML 里）。这段单独扫 raw，只改 <img> 开标签，
           其余字节原样保留。
           ⚠️ 这里**不做首图 eager**：正文第一张那个计数只在 element 分支里维护，
           raw 里的图一律 lazy（它们都在演示块内部，本来就不是 LCP 元素）。 */
        visit(tree, "raw", node => {
            const { value } = transformRawImages(node.value, tag => {
                let out = tag
                if (!rawHasAttr(tag, "loading")) {
                    out = appendRawAttr(out, "loading", "lazy")
                }
                if (!rawHasAttr(out, "decoding")) {
                    out = appendRawAttr(out, "decoding", "async")
                }
                if (!rawHasAttr(out, "alt")) {
                    out = appendRawAttr(out, "alt", "")
                }
                // 站内图补 referrerpolicy / 尺寸（与 element 分支同一套规则）
                const src = readRawSrc(out)
                if (src && shouldAddNoReferrer(src) && !rawHasAttr(out, "referrerpolicy")) {
                    out = appendRawAttr(out, "referrerpolicy", "no-referrer")
                }
                if (src && !rawHasAttr(out, "width") && !rawHasAttr(out, "height")) {
                    const size = getPublicImageSizeSync(src)
                    if (size) {
                        out = appendRawAttr(out, "width", String(size.width))
                        out = appendRawAttr(out, "height", String(size.height))
                    }
                }
                return out
            })
            node.value = value
        })

        visit(tree, "element", (node, index, parent) => {
            // 只处理 img 元素
            if (node.tagName !== "img") {
                return
            }

            const imgProps = { ...node.properties }

            /* 懒加载与解码提示（2026-11-11 加）。
               真病：正文图一个 loading 属性都没有 → 全部跟着首屏一起下载。
               实测 `/posts/testplantai/` 一页 23 张 / 1.17MB，而首屏只看得到 1~2 张。
               体检数据：全站 582 个 img 里 **116 个**没有任何 loading 属性。

               规则（与浏览器默认行为一致，只在"没写"时补）：
               - 正文**第一张**留 `eager` + `fetchpriority=high`：它是最可能的 LCP 元素，
                 懒加载反而会推迟首屏最大内容绘制；
               - 其余一律 `lazy` + `decoding=async`。
               ⚠️ 作者显式写了 `loading` 就完全不动（有文章自己标过 eager）。 */
            if (!imgProps.loading) {
                if (imgIndex === 0) {
                    imgProps.loading = "eager"
                    if (!imgProps.fetchpriority) imgProps.fetchpriority = "high"
                } else {
                    imgProps.loading = "lazy"
                }
            }
            if (!imgProps.decoding) imgProps.decoding = "async"
            imgIndex++

            /* 补空 alt（2026-11-11）。
               真病：正文里手写的 `<img src="…">` 没有 alt → 产物里 12 个 img 缺这个属性。
               语义上「纯装饰图」的正确写法是 `alt=""`（空串），不是省略 ——
               省略时部分读屏器会念文件名，空 alt 才会被明确跳过。
               ⚠️ 只在**完全没有 alt 属性**时补空串；作者写了文字 alt 的一律不动。
               ⚠️ 空 alt 在产物里序列化成**裸属性 `alt`**，核查别用 `alt="([^"]*)"` 匹配。 */
            if (imgProps.alt === undefined || imgProps.alt === null) imgProps.alt = ""

            // 添加 referrerpolicy（如果需要）解决 403 问题
            // 无论是否有 alt，都要检查并添加 referrerpolicy
            if (imgProps.src && shouldAddNoReferrer(imgProps.src)) {
                imgProps.referrerpolicy = "no-referrer"
            }

            // 补 width/height 治 CLS：public/ 下的图不走 Astro 图片优化，构建期没有 ImageMetadata。
            // 只对站内 /images/ 与 /gallery/ 生效（外链需要联网探测，构建期不干这事）；
            // 解析不到就**原样不写**，绝不瞎猜数字。见 docs/agents/config.md 五-59。
            if (imgProps.src && !imgProps.width && !imgProps.height) {
                const size = getPublicImageSizeSync(imgProps.src)
                if (size) {
                    imgProps.width = size.width
                    imgProps.height = size.height
                }
            }

            // 获取 alt 属性
            const alt = imgProps.alt

            // 如果没有 alt 属性或 alt 为空字符串，则只更新属性并保持原样
            if (!alt || alt.trim() === "") {
                node.properties = imgProps
                return
            }

            // 创建 figure 元素，包含处理后的 img 和居中的 figcaption
            const figure = h("figure", [
                // 使用原始属性的 img 节点
                h("img", {
                    ...imgProps,
                }),
                h("figcaption", alt),
            ])

            // 居中显示
            const centerFigure = h("center", figure)

            // 替换当前的 img 节点为 figure 节点
            if (parent && typeof index === "number") {
                parent.children[index] = centerFigure
            }
        })
    }
}
