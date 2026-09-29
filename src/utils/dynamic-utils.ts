import type { CollectionEntry } from "astro:content"

export type DynamicItem = {
    id: string
    // epoch ms；可读文本由客户端按站点格式渲染
    published: number
    html: string
    pinned: boolean
    location: string
}

// 置顶优先，其次按发布时间降序
export const sortDynamics = (
    entries: CollectionEntry<"dynamic">[],
): CollectionEntry<"dynamic">[] =>
    entries.sort((a, b) => {
        if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1
        return b.data.published.getTime() - a.data.published.getTime()
    })
