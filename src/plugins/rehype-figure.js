import { h } from "hastscript"
import { visit } from "unist-util-visit"
import { shouldAddNoReferrer } from "../utils/image-utils.ts"
import { getPublicImageSizeSync } from "../utils/image-size.ts"

/**
 * 将带有 alt 文本的图片转换为包含 figcaption 的 figure 元素的 rehype 插件
 *
 * @returns {Function} A transformer function for the rehype plugin
 */
export default function rehypeFigure() {
    return (tree) => {
        visit(tree, "element", (node, index, parent) => {
            // 只处理 img 元素
            if (node.tagName !== "img") {
                return
            }

            const imgProps = { ...node.properties }

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
