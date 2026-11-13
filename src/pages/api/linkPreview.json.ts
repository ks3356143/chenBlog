import { getSortedPostsList } from "@/utils/content-utils"
import { getPostUrlBySlug } from "@/utils/url-utils"
import { siteConfig } from "@/config/siteConfig"
import { existsSync } from "node:fs"
import { join } from "node:path"

/**
 * 用与浏览器 `new URL(href).pathname` 完全同源的口径生成 key。
 * `siteConfig.site_url` 在 build 时是线上域名、dev 时是 localhost，但这里只取 pathname，
 * 与 origin 无关 → 本地和线上的 JSON key 逐字节一致。
 */
function pathKey(href: string): string {
    const u = new URL(href, "http://key.invalid")
    const path = u.pathname.replace(/\/{2,}/g, "/")
    return path.endsWith("/") ? path : path + "/"
}

/**
 * 站内链接悬停预览卡（2026-11-13）的数据源。
 *
 * 🔴 四条设计约束：
 * ① **构建期静态 JSON**：零额外接口逻辑、零运行时文章集合；不引新依赖。
 *    与 /api/allPostMeta.json 同族，但那份是「日历/猜你喜欢」用、字段不同，别改它。
 * ② **只收有独立 OG 图的文章**（public/og/<slug>.jpg 真实存在才写 image）→
 *    预览卡里的图用裸 <img>，不经过 Astro <Picture>（它要构建期 glob，这里只有字符串路径）。
 *    ⚠️ 绝不拼一个可能 404 的 URL 出来。
 * ③ **key 用 `URL.pathname` 口径**（见 `pathKey`），绝不 `encodeURI` 二次编码：
 *    `URL.pathname` 已经把中文 slug 变成 `%E5%A4%A9`，再编一次会成 `%25E5...`（双重编码）。
 *    组件侧 `keyOf()` 用同一口径。本批首版在这里踩过坑：ASCII slug 正常、26 个中文 slug 全查不到。
 * ④ **`image` 路径必须保持中文原文**：磁盘上的 `public/og/css100天-第28天.jpg` 是原始 Unicode
 *    文件名，写成 `%E5%A4%A9` 后构建期 `existsSync` 判不到、线上也 404（本批第一版实测 26 条全错）。
 *    中文 URL 交给浏览器自动 percent-encode，不要手工编。
 */
export async function GET() {
    const posts = await getSortedPostsList()
    const map: Record<string, { title: string; description: string; date: string; category: string; image?: string }> = {}

    for (const post of posts) {
        const href = getPostUrlBySlug(post.id)
        const key = pathKey(href)
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
