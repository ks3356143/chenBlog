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
        dynamics.map(async (entry) => ({
            id: entry.id,
            published: entry.data.published.getTime(),
            html: (await processor.render(entry.body ?? "")).code,
            pinned: entry.data.pinned,
            location: entry.data.location,
        })),
    )

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
    })
}
