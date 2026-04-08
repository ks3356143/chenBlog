import { type CollectionEntry, getCollection } from "astro:content"
import { getCategoryUrl } from "./url-utils"

export type Category = {
    name: string
    count: number
    url: string
}

// 1.获取分类列表
export async function getCategoryList() {
    const allBlogPosts = await getCollection("posts", ({ data }) => {
        // 在开发模式草稿可以出现
        return import.meta.env.PROD ? data.draft !== true : true
    })
    const count: { [key: string]: number } = {}
    allBlogPosts.forEach((post) => {
        if (!post.data.category) {
            const key = "暂未分类"
            count[key] = count[key] ? count[key] + 1 : 1
        }
        const categoryName =
            typeof post.data.category === "string" ? post.data.category.trim() : String(post.data.category).trim()
        count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1
    })

    // 排序分类-数量相同则使用字母顺序
    const lst = Object.keys(count).sort((a, b) => {
        return count[b] - count[a] || a.toLowerCase().localeCompare(b.toLowerCase())
    })

    const ret: Category[] = []
    for (const c of lst) {
        ret.push({
            name: c,
            count: count[c],
            url: getCategoryUrl(c),
        })
    }
    return ret
}

// 获取标签列表
export type Tag = {
    name: string
    count: number
}
export async function getTagList(): Promise<Tag[]> {
    const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
        return import.meta.env.PROD ? data.draft !== true : true
    })

    const countMap: { [key: string]: number } = {}
    allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
        post.data.tags.forEach((tag: string) => {
            if (!countMap[tag]) countMap[tag] = 0
            countMap[tag]++
        })
    })

    // sort tags
    const keys: string[] = Object.keys(countMap).sort((a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase())
    })

    return keys.map((key) => ({ name: key, count: countMap[key] }))
}

// 获取排序的文章
async function getRawSortedPosts() {
    const allBlogPosts = await getCollection("posts", ({ data }) => {
        return import.meta.env.PROD ? data.draft !== true : true
    })

    const sorted = allBlogPosts.sort((a, b) => {
        // 首先按置顶状态排序，置顶文章在前
        if (a.data.pinned && !b.data.pinned) return -1
        if (!a.data.pinned && b.data.pinned) return 1

        // 如果置顶状态相同，则按发布日期排序
        const dateA = new Date(a.data.published)
        const dateB = new Date(b.data.published)
        return dateA > dateB ? -1 : 1
    })
    return sorted
}
export async function getSortedPosts() {
    const sorted = await getRawSortedPosts()

    for (let i = 1; i < sorted.length; i++) {
        sorted[i].data.nextSlug = sorted[i - 1].id
        sorted[i].data.nextTitle = sorted[i - 1].data.title
    }
    for (let i = 0; i < sorted.length - 1; i++) {
        sorted[i].data.prevSlug = sorted[i + 1].id
        sorted[i].data.prevTitle = sorted[i + 1].data.title
    }

    return sorted
}
