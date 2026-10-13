import { getCollection } from "astro:content"
import { createMarkdownProcessor } from "@astrojs/markdown-remark"
import { sortDynamics, type DynamicItem } from "@/utils/dynamic-utils"

// 纯静态站没有运行时后端：这个端点在 build 时被预渲染成 dist/api/dynamic.json，
// 页面再由 DynamicFeed 在客户端取数据填进 <template> 骨架（照 firefly.cuteleaf.cn 的做法）。
export const prerender = true

export async function GET(): Promise<Response> {
    const processor = await createMarkdownProcessor()
    const dynamics = sortDynamics(await getCollection("dynamic"))

    const data: DynamicItem[] = await Promise.all(
        dynamics.map(async (entry) => {
            const html = (await processor.render(entry.body ?? "")).code
            return {
                id: entry.id,
                published: entry.data.published.getTime(),
                html,
                // 搜索用的纯文本：构建期一次算好，客户端直接 includes，不必在每条渲染时再去剥标签。
                // 必须**单趟**解实体：markdown-remark 输出 &#x26; / &#x3C;（不是 &amp; / &lt;），
                // 分多趟 replace 会把解出来的 &lt; 再解一次，短文本就变乱码（AGENTS 五-27）。
                searchText: html
                    .replace(/<[^>]+>/g, " ")
                    .replace(/&(?:#x([\da-f]+)|#(\d+)|([a-zA-Z]+));/gi, (whole, hex, dec, name) => {
                        if (hex) return String.fromCodePoint(parseInt(hex, 16))
                        if (dec) return String.fromCodePoint(Number(dec))
                        const named: Record<string, string> = {
                            nbsp: " ",
                            amp: "&",
                            lt: "<",
                            gt: ">",
                            quot: '"',
                            apos: "'",
                        }
                        return named[name.toLowerCase()] ?? whole
                    })
                    .replace(/\s+/g, " ")
                    .trim(),
                pinned: entry.data.pinned,
                location: entry.data.location,
            }
        }),
    )

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
    })
}
