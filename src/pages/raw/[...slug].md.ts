import type { APIRoute } from "astro"
import { getSortedPostsList } from "@/utils/content-utils"
import { removeFileExtension } from "@/utils/url-utils"
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

/**
 * C5 每篇 Markdown 原文直链（2026-11-15 第五十七批）。
 *
 * URL 口径：`/raw/<slug>.md`（独立前缀，不与 `/posts/<slug>/` 冲突，也不与文章页动态路由撞）。
 * 输出的是**带 frontmatter 的原始 Markdown 源文件**，最忠实、可直接喂给 LLM，
 * 不做渲染、不剥 YAML、不改写图片路径 —— 站内规矩（宽表包装、弯引号等）是渲染层的事，原文保持作者写下的样子。
 *
 * 🔴 五条：
 * ① 事实来源与 llms.txt / 首页一致：getSortedPostsList()（PROD 自动排 draft）。
 * ② ⚠️ **Astro 7 的 glob() loader 不提供 `post.body`**（实测 34 个文件全是 0 字节）→ 必须直接从
 *    `src/content/posts/<id>.md|.mdx` 读盘。id 一般不带扩展名；两种扩展名都试，读不到就抛错，
 *    **绝不静默输出空文件**（这次就是靠构建后 `Length=0` 抓出来的）。
 * ③ `params.slug` 用 removeFileExtension(post.id)：残留 .mdx 也要拆掉，否则 URL 会变 `/raw/xxx.mdx.md`。
 * ④ 中文 slug 原样写进 params；构建期生成带中文的目录名，浏览器请求时自动 percent-encode
 *    （与 26 篇现存中文文章 URL 同一机制，见六节坑④ / linkPreview.json.ts 注释④）。
 * ⑤ 文件名 `[...slug].md.ts` → Astro 输出到 `dist/raw/<slug>.md`（已实测 34 个文件全部落在预期路径）。
 *
 * ⚠️ 构建期读盘用 process.cwd() 拼路径，与 inject-preload.mjs 同族；不做编码转换（源文件 UTF-8）。
 */
function readRawMarkdown(id: string): string {
    const base = join(process.cwd(), "src", "content", "posts")
    const stem = removeFileExtension(id)
    for (const ext of [".md", ".mdx"]) {
        const file = join(base, stem + ext)
        if (existsSync(file)) return readFileSync(file, "utf8")
    }
    throw new Error(`[C5] 找不到 Markdown 源文件：${stem}（.md / .mdx 都不存在）`)
}

export async function getStaticPaths() {
    const posts = await getSortedPostsList()
    return posts.map((post) => ({
        params: { slug: removeFileExtension(post.id) },
        props: { body: readRawMarkdown(post.id) },
    }))
}

export const GET: APIRoute = ({ props }) => {
    const body = typeof props.body === "string" ? props.body : ""
    return new Response(body, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
    })
}
