import type { CollectionEntry } from "astro:content"

export type DynamicItem = {
    id: string
    // epoch ms；可读文本由客户端按站点格式渲染
    published: number
    html: string
    // 构建期算好的纯文本（已剥标签 + 单趟解实体），供客户端搜索直接 includes 用
    searchText: string
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
