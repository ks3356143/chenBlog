import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import { siteConfig } from "@/config/siteConfig"
import { getPostUrlBySlug } from "@/utils/url-utils"

/**
 * RSS 2.0 源。
 *
 * 🔴 2026-11-11 改成**摘要版**（原先是全文）。真病：
 *    `content:encoded` 占了整份源 **96%** 的体积 —— 实测 409,089 B 里 **327,746 B**
 *    是 33 篇全文（平均 9.9 KB/篇），gzip 后仍有 75.7 KB；
 *    而 RSS 客户端每次轮询都会整份重下。
 * 现在只发 frontmatter 的 description + 原文链接 → 正文部分约 **12 KB**，
 * gzip 后约 3 KB。
 *
 * ⚠️ **想改回全文只要两行**：把 `content` 那两行取消注释、删掉现在的 description 那行即可
 * （需要 `sanitize-html` + `markdown-it`，两者仍在 dependencies 里，没删）。
 * ⚠️ 注意 `markdown-it` 不会处理 MDX 里的组件与 JSX 表达式 —— 全文模式对 .mdx 文章本来就是残缺的
 * （本站 2 篇），这也是改摘要的一个附带理由。
 */
export async function GET(context) {
    const posts = await getCollection("posts", ({ data }) => !data.draft)
    return rss({
        title: siteConfig.siteMeta.name,
        description: siteConfig.siteMeta.description,
        site: context.site,
        // 本站路由是 /posts/<id>/ 带尾斜杠；false 会把它剥掉，让每个订阅者都多吃一次 301
        trailingSlash: true,
        items: posts
            .sort((a, b) => Date.parse(b.data.published) - Date.parse(a.data.published))
            .map(post => ({
                title: post.data.title,
                ...(post.data.description && { description: post.data.description }),
                // 集合条目没有 slug 字段，路由用的是 post.id（见 [...slug].astro 的 getStaticPaths）
                link: getPostUrlBySlug(post.id),
                // published 在 schema 里是 z.date()，本来就是 Date。
                // 先前写成 dayjs(`${published}+08:00`, "YYYY-MM-DD HH:mm:ssZ")：
                // 模板串出来是 ISO 带 T 和毫秒，再按空格分隔的格式解析就全乱，26 条 pubDate 错成未来日期
                pubDate: post.data.published,
                categories: [post.data.category, ...(post.data.tags || [])].filter(Boolean),
                // ← 想要全文就把下面两行放回来（并删掉上面 description 那行）：
                // content: sanitizeHtml(parser.render(post.body), { allowedTags: ... }),
            })),
    })
}
