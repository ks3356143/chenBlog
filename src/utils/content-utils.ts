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
