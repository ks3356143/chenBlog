import type { APIRoute } from "astro"
import { getSortedPostsList } from "@/utils/content-utils"
import { getPostUrlBySlug, removeFileExtension } from "@/utils/url-utils"
import { siteConfig } from "@/config/siteConfig"

/**
 * C5 llms.txt（2026-11-15 第五十七批）。
 *
 * 给 LLM / 阅读器一份纯文本站点索引：站点名 → 简介 → 文章清单（网页 URL + Markdown 原文 URL）。
 * 事实来源一律走 getSortedPostsList()，与首页 / RSS / 侧栏同一过滤口径（PROD 自动排 draft），
 * 不另起一套扫描，避免「索引里有但线上 404」。
 *
 * 🔴 三条口径：
 * ① 每条同时给两个链接：`/posts/<slug>/`（给人看）与 `/raw/<slug>.md`（给机器读，同批新增）。
 * ② URL 用 siteConfig.site_url 绝对地址（build 期就是线上域名），slug 保持中文原文 ——
 *    浏览器/客户端会自己 percent-encode，手工 encodeURI 会二次编码（六节坑④ / 五-27）。
 * ③ 纯文本、无 HTML、无依赖；产物是 dist/llms.txt 单个静态文件。
 */
export const GET: APIRoute = async ({ site }) => {
    const posts = await getSortedPostsList()
    const base = (site?.href || siteConfig.site_url + "/").replace(/\/$/, "")

    const lines: string[] = [
        `# ${siteConfig.siteMeta.name}`,
        "",
        `> ${siteConfig.siteMeta.description}`,
        "",
        `站点地址：${base}/`,
        `文章总数：${posts.length}`,
        "",
        "## 文章",
        "",
    ]

    for (const post of posts) {
        const slug = removeFileExtension(post.id)
        const pageUrl = base + getPostUrlBySlug(post.id)
        const rawUrl = `${base}/raw/${slug}.md`
        const date = new Date(post.data.published).toISOString().slice(0, 10)
        const desc = post.data.description ? ` — ${post.data.description}` : ""
        lines.push(`- [${post.data.title}](${pageUrl})（${date}${desc}）`)
        lines.push(`  - Markdown 原文：${rawUrl}`)
    }

    lines.push("", "## 说明", "", "`/raw/<slug>.md` 为带 frontmatter 的原始 Markdown 源文件，可直接喂给 LLM。", "")

    return new Response(lines.join("\n"), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
}
