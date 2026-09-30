import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import sanitizeHtml from "sanitize-html"
import MarkdownIt from "markdown-it"
import { siteConfig } from "@/config/siteConfig"
import { getPostUrlBySlug } from "@/utils/url-utils"
const parser = new MarkdownIt()

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
                // 注意：这不会处理 MDX 文件中的组件或 JSX 表达式。
                content: sanitizeHtml(parser.render(post.body), {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
                }),
            })),
    })
}
