import { readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * 判断一篇 markdown / MDX 正文里有没有数学公式。
 *
 * 用途：文章页据此决定要不要 `<link rel="stylesheet" href="/vendor/katex/katex.css">`。
 * 2026-11-11 实测：33 篇文章有公式的是 **0 篇**，但 KaTeX 的 CSS（27.9KB / gzip 7.8KB）
 * 被无条件打进**全部 33 个文章页**，还连带 19 个字体文件（250KB）进 dist。
 *
 * 判据必须与 remark-math 一致，所以先剥掉**不该被当成公式**的区域：
 *   ① 围栏代码块 ``` ``` / ~~~ ~~~
 *   ② 行内 code span ` `
 *   ③ HTML 注释
 * 然后只看两种定界符：块级 `$$…$$`、行内 `$…$`（`$` 前不能是反斜杠、行内至少要有一个非空白字符）。
 *
 * ⚠️ 不做完整解析是有意的：这里只需要一个**保守**的布尔值 —— 判 false 就会漏加载 CSS，
 * 所以正则只要求"看起来像公式"就返回 true（宁可多加载一页，也不能让公式裸奔）。
 */
export function hasMath(body: string | undefined): boolean {
    if (!body) return false

    const stripped = body
        // 围栏代码块（``` 或 ~~~，允许语言标注与缩进）
        .replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm, "")
        // 行内 code span（单反引号或双反引号，不跨行）
        .replace(/`[^`\n]*`/g, "")
        // HTML 注释
        .replace(/<!--[\s\S]*?-->/g, "")

    // 块级 $$…$$
    if (/\$\$[\s\S]+?\$\$/.test(stripped)) return true

    // 行内 $…$
    // ⚠️ 不能写成 `[^\n$]*`：remark-math **允许行内公式跨行**（同一个段落内），
    // 用「不跨行」当判据会漏掉 `$a\nb$` 这种（实测 remark-math 判 true、我判 false）。
    // 真正的边界是**空行**（段落分隔）—— 行内公式不会跨段。
    for (const m of stripped.matchAll(/(^|[^\\$])\$(?!\$)([\s\S]*?)\$(?!\$)/g)) {
        const inner = m[2]
        if (!inner) continue
        if (/\n[ \t]*\n/.test(inner)) continue // 跨了段落，不是行内公式
        if (!/[^\s$]/.test(inner)) continue // 里面只有空白，不是公式
        return true
    }
    return false
}

/**
 * 给构建期脚本用：直接按 id 读源文件。文章集合条目自带 `body`，一般用不上这个。
 */
export function postHasMathBySlug(slug: string, dir = join(process.cwd(), "src", "content", "posts")): boolean {
    for (const ext of [".md", ".mdx"]) {
        try {
            return hasMath(readFileSync(join(dir, slug + ext), "utf8"))
        } catch {
            // 换下一个扩展名
        }
    }
    return false
}
