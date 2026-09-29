import type { CollectionEntry } from "astro:content"
import { siteConfig } from "../config/siteConfig"

/**
 * 取文章在列表页的封面
 * 手写在 frontmatter 的 image 永远优先；没写的按 seriesOrder 在 siteConfig.autoCoverPaths 里轮播，
 * 让第 2 天落在第 1 张。只服务列表卡片，详情页与 og:image 仍读原始 frontmatter。
 */
export function getPostCover(post: CollectionEntry<"posts">): string {
    const manual = post.data.image?.trim()
    if (manual) return manual

    const covers = siteConfig.autoCoverPaths
    if (!covers || covers.length === 0) return ""

    // 判空必须用 !== undefined：seriesOrder 合法值可以是 0
    const order = post.data.seriesOrder
    if (order !== undefined) return covers[mod(order - 1, covers.length)]

    // 不归入任何系列的文章按 id 取稳定哈希，同一篇每次构建拿到同一张
    let hash = 0
    for (const ch of post.id) hash = mod(hash * 31 + ch.charCodeAt(0), 1_000_000)
    return covers[mod(hash, covers.length)]
}

// JS 的 % 会跟着被除数变负，这里要的是数学意义上的取模
function mod(n: number, m: number): number {
    return ((n % m) + m) % m
}
