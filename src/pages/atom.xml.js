import { getCollection } from "astro:content"
import { siteConfig } from "@/config/siteConfig"
import { getPostUrlBySlug } from "@/utils/url-utils"

/**
 * Atom 1.0 源（对应参考站的 /atom.xml）。
 *
 * 与 `/rss.xml` 并存而不是替代：RSS 2.0 兼容老客户端与各种聚合器，
 * Atom 1.0 的字段更严格（时间必须 RFC3339、必须有 id 与 self 链接），
 * 部分客户端（尤其 Java / .NET 生态）更认 Atom。
 *
 * 内容策略与 RSS 保持一致：**只发摘要**（`summary`），不发全文 ——
 * 2026-11-11 把 RSS 从 409KB 压到 16.7KB 时定的口径，两个源不能一个发全文一个发摘要，
 * 否则订阅者换个地址就能绕过这个决定。
 *
 * ⚠️ `updated` 必须取**最新一篇**的发布时间，不能写构建时间：
 *    Atom 的语义是"内容最后更新"，写构建时间会让阅读器每次部署都以为全站更新了。
 */
const escapeXml = s =>
    String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")

export async function GET(context) {
    const site = context.site ?? new URL(siteConfig.site_url)
    const posts = (await getCollection("posts", ({ data }) => !data.draft)).sort(
        (a, b) => Date.parse(b.data.published) - Date.parse(a.data.published)
    )

    const updated = posts.length ? new Date(posts[0].data.published).toISOString() : new Date(0).toISOString()
    const selfUrl = new URL("atom.xml", site).href
    const homeUrl = new URL("/", site).href

    const entries = posts
        .map(post => {
            const link = new URL(getPostUrlBySlug(post.id), site).href
            const when = new Date(post.data.published).toISOString()
            return `  <entry>
    <title type="text">${escapeXml(post.data.title)}</title>
    <link rel="alternate" type="text/html" href="${escapeXml(link)}"/>
    <id>${escapeXml(link)}</id>
    <published>${when}</published>
    <updated>${new Date(post.data.updated ?? post.data.published).toISOString()}</updated>
    ${post.data.category ? `<category term="${escapeXml(post.data.category)}"/>` : ""}
    <summary type="text">${escapeXml(post.data.description || post.data.title)}</summary>
  </entry>`
        })
        .join("\n")

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(homeUrl)}</id>
  <title type="text">${escapeXml(siteConfig.siteMeta.name)}</title>
  <subtitle type="text">${escapeXml(siteConfig.siteMeta.description)}</subtitle>
  <updated>${updated}</updated>
  <link rel="alternate" type="text/html" href="${escapeXml(homeUrl)}"/>
  <link rel="self" type="application/atom+xml" href="${escapeXml(selfUrl)}"/>
  <author><name>${escapeXml(siteConfig.siteMeta.name)}</name></author>
  <generator uri="https://astro.build/">Astro</generator>
${entries}
</feed>
`

    return new Response(xml, {
        // ⚠️ 这条 header 在 **SSG 下不生效**：`atom.xml` 是构建期落盘成静态文件的，
        //    真正发出去的是 nginx 按扩展名给的 `text/xml`（实测；参考站给的是 `application/xml`）。
        //    两种都是合法 XML 类型，订阅客户端都认 —— 别为了这条去改服务器 mime.types。
        //    留着它没有任何副作用（dev / 将来若改 SSR 时才有用）。
        headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
    })
}
