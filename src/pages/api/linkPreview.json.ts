import { getSortedPostsList } from "@/utils/content-utils"
import { getPostUrlBySlug } from "@/utils/url-utils"
import { siteConfig } from "@/config/siteConfig"
import { existsSync } from "node:fs"
import { join } from "node:path"

/**
 * 站内链接悬停预览卡（2026-11-13）的数据源。
 *
 * 🔴 三条设计约束：
 * ① **构建期静态 JSON**：零额外接口逻辑、零运行时文章集合；不引新依赖。
 *    与 /api/allPostMeta.json 同族，但那份是「日历/猜你喜欢」用、字段不同，别改它。
 * ② **只收有独立 OG 图的文章**（public/og/<slug>.jpg 真实存在才写 image）→
 *    预览卡里的图用裸 <img>，不经过 Astro <Picture>（它要构建期 glob，这里只有字符串路径）。
 *    ⚠️ 绝不拼一个可能 404 的 URL 出来。
 * ③ **中文 slug 的 key 用 encodeURI 编码**（正文里的 href 已是百分号形式，查表前两边都归一化），
 *    但 **`image` 路径必须保持中文原文**：磁盘上的 `public/og/css100天-第28天.jpg` 是原始 Unicode
 *    文件名，写成 `%E5%A4%A9` 后构建期 `existsSync` 判不到、线上也 404（本批第一版实测 26 条全错）。
 *    中文 URL 交给浏览器自动 percent-encode，不要手工编。
 *    URL 作为 key 写进 JSON 时统一用 encodeURI，避免中文 key 在 JS 里出歧义。
 */
export async function GET() {
    const posts = await getSortedPostsList()
    const map: Record<string, { title: string; description: string; date: string; category: string; image?: string }> = {}

    for (const post of posts) {
        const href = getPostUrlBySlug(post.id)
        const key = encodeURI(href)
        const og = join(process.cwd(), "public", "og", `${post.id}.jpg`)
        const date = new Date(post.data.published).toISOString().slice(0, 10)
        map[key] = {
            title: post.data.title,
            description: post.data.description || siteConfig.siteMeta.description,
            date,
            category: post.data.category || "",
            ...(existsSync(og) ? { image: `/og/${post.id}.jpg` } : {}),
        }
    }

    return new Response(JSON.stringify(map), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
    })
}
