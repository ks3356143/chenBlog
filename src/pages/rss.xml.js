import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import sanitizeHtml from "sanitize-html"
import MarkdownIt from "markdown-it"
import siteData from "@/data/site.json"
const parser = new MarkdownIt()

dayjs.extend(customParseFormat)
export async function GET(context) {
    const posts = await getCollection("posts")
    return rss({
        title: siteData.title,
        description: siteData.description,
        site: context.site,
        trailingSlash: false,
        items: posts
            .sort((a, b) => Date.parse(b.data.published) - Date.parse(a.data.published))
            .map(({ data: { published, title, description }, slug, body }) => ({
                title,
                ...(description && { description }),
                link: `/post/${slug}/`,
                pubDate: dayjs(`${published}+08:00`, "YYYY-MM-DD HH:mm:ssZ").toDate(),
                // 注意：这不会处理 MDX 文件中的组件或 JSX 表达式。
                content: sanitizeHtml(parser.render(body), {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
                }),
            })),
    })
}
