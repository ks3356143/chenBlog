import { h } from "hastscript"
import { visit } from "unist-util-visit"

const ADMONITION_TYPES = [
    "note",
    "tip",
    "important",
    "warning",
    "caution",
    "abstract",
    "summary",
    "tldr",
    "info",
    "todo",
    "success",
    "check",
    "done",
    "question",
    "help",
    "faq",
    "attention",
    "failure",
    "missing",
    "fail",
    "danger",
    "error",
    "bug",
    "example",
    "quote",
    "cite",
]

// ⚠️ 只有真正注册成组件的指令名才允许转成自定义标签（2026-10-17 修）。
// remark-directive 的**文本指令语法是 `:name`**，于是作者正文里的 CSS 写法
// `rotate:45deg` / `margin-bottom:16px` / `z-index:1` / `:checked` 全被解析成指令，
// 再经下面 else 分支渲染成 `<45deg></45deg>` 这类非法标签 → 读者看到的正文是错的。
// 根因、复现与验证见 docs/agents/config.md 五-52。
// 组件注册表在 astro.config.mjs 的 rehypeComponents（`components: { github }`）。
// ⚠️ 判定对 text / leaf **两种写法一起放行**（`:github{…}` 与 `::github{…}` 都渲染同一个组件），
//    否则只放行 leaf 会让 text 写法的卡片静默退回成纯文本。
const COMPONENT_NAMES = ["github"]

export function parseDirectiveNode() {
    return (tree, file) => {
        visit(tree, (node, index, parent) => {
            if (node.type === "containerDirective" || node.type === "leafDirective" || node.type === "textDirective") {
                const name = node.name ? node.name.toLowerCase() : ""

                // 检查是否是 Admonition 类型
                // 仅对 containerDirective 进行 Admonition 转换
                if (node.type === "containerDirective" && ADMONITION_TYPES.includes(name)) {
                    const type = name.toUpperCase()

                    // 处理 label (自定义标题)
                    const firstChild = node.children[0]
                    if (firstChild?.data?.directiveLabel) {
                        // 如果有 label，注入 [!TYPE] 到 label 开头
                        if (firstChild.children.length > 0 && firstChild.children[0].type === "text") {
                            firstChild.children[0].value = `[!${type}] ${firstChild.children[0].value}`
                        } else {
                            firstChild.children.unshift({
                                type: "text",
                                value: `[!${type}] `,
                            })
                        }
                    } else {
                        // 没有 label，插入包含 [!TYPE] 的新段落作为第一个子节点
                        node.children.unshift({
                            type: "paragraph",
                            children: [{ type: "text", value: `[!${type}]` }],
                        })
                    }

                    // 转换为 Blockquote
                    node.type = "blockquote"
                    node.data = node.data || {}
                    node.data.hName = "blockquote"
                    // 关键：清除可能存在的 hProperties，防止变为自定义标签
                    delete node.data.hProperties
                } else if (
                    (node.type === "textDirective" || node.type === "leafDirective") &&
                    !COMPONENT_NAMES.includes(name)
                ) {
                    // 未注册的 text/leaf 指令 = 作者的普通文字，退回**原始文本**，不生成自定义标签。
                    // 用 node.position 从 file.value 抠原文，而不是凭 ":" + name 重构：
                    // 重构会丢 `{attrs}`、`(label)` 与原始大小写（实测 name 保留大小写，但属性不保留在 name 里）。
                    const pos = node.position
                    const raw =
                        typeof file?.value === "string" && pos
                            ? file.value.slice(pos.start.offset, pos.end.offset)
                            : null
                    if (raw === null || !parent || typeof index !== "number") {
                        // 宁可让构建大声失败，也不静默丢字或造非法标签
                        throw new Error(
                            `[remark-directive-rehype] 无法还原未注册指令的原文：${node.type} ${JSON.stringify(node.name)} ` +
                                `position=${JSON.stringify(pos?.start)} file.value=${typeof file?.value}`,
                        )
                    }
                    parent.children[index] = { type: "text", value: raw, position: pos }
                    return
                } else {
                    // 其他 Directive，保留原有逻辑：转换为自定义 HTML 标签
                    const data = node.data || {}
                    node.data = data
                    node.attributes = node.attributes || {}

                    // Add specific attributes for directive labels
                    if (node.children.length > 0 && node.children[0].data && node.children[0].data.directiveLabel) {
                        node.attributes["has-directive-label"] = true
                    }

                    const hast = h(node.name, node.attributes)
                    data.hName = hast.tagName
                    data.hProperties = hast.properties
                }
            }
        })
    }
}
