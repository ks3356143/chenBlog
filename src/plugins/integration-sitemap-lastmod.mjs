/**
 * 给 sitemap 补 `<lastmod>`（Astro integration，`astro:build:done` 里后处理）。
 *
 * 背景：`@astrojs/sitemap` 只有在传了统一 `lastmod` 选项、或自己在 `serialize` 里
 * 给值时才输出 `<lastmod>`。我们此前两个都没给 → 全站 44 条 URL **零 lastmod**，
 * 搜索引擎没法判断哪些页面真正更新过（五-59）。
 *
 * 🔴 **不用统一时间**：给所有页面盖同一个"今天"等于告诉搜索引擎"全站今天都改过"，
 * 是假信号、比没有更糟。这里按页面类型取真实来源：
 *   - 文章页 → 该篇 frontmatter 的 `updated`，没写就退回 `published`
 *   - 列表/聚合页（首页分页、归档、分类、标签、系列）→ 全站最新一篇的更新时间
 *   - 相册页 → 该相册目录里最新文件的 mtime（换了图页面就变了）
 *   - 其余静态页（about / guestbook）→ **不写**，宁可没有也不造
 *
 * ⚠️ 为什么不用 `serialize` 选项：那个回调跑在 sitemap 集成内部，
 * 拿不到 content collections（`astro:content` 只在页面/端点渲染上下文可用），
 * 而 `astro:build:done` 里我们能直接读源文件与产物。
 *
 * ⚠️ 解析 frontmatter 只用最朴素的正则匹配 `key: value` 单行形式 ——
 * 本项目 28 篇全是这种写法（schema 里是 z.date()）。匹配不到就**跳过不写**。
 */
import fs from "node:fs"
import path from "node:path"

/** 从 markdown 文件的 frontmatter 里取日期字段；取不到返回 null */
function readFrontmatterDate(filePath, key) {
	try {
		const text = fs.readFileSync(filePath, "utf8")
		// frontmatter 必须在文件最开头（允许 BOM）
		const fm = text.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---/)
		if (!fm) return null
		const m = fm[1].match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"))
		if (!m) return null
		// 去掉可能的引号
		const raw = m[1].replace(/^["']|["']$/g, "")
		const d = new Date(raw)
		return Number.isNaN(d.getTime()) ? null : d
	} catch {
		return null
	}
}

/** 目录里最新文件的 mtime；目录不存在返回 null */
function latestMtime(dir) {
	try {
		if (!fs.statSync(dir).isDirectory()) return null
		let latest = 0
		for (const f of fs.readdirSync(dir)) {
			const st = fs.statSync(path.join(dir, f))
			if (st.isFile()) latest = Math.max(latest, st.mtimeMs)
		}
		return latest > 0 ? new Date(latest) : null
	} catch {
		return null
	}
}

/** 把某个 Date 写成 sitemap 认的 W3C 日期时间（UTC，秒精度） */
function toW3C(d) {
	return d.toISOString().replace(/\.\d{3}Z$/, "+00:00")
}

export default function sitemapLastmod() {
	return {
		name: "sitemap-lastmod",
		hooks: {
			"astro:build:done": async ({ dir }) => {
				const outDir = dir instanceof URL ? dir : new URL(`file://${String(dir)}`)
				const sitemapPath = path.join(outDir.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "sitemap-0.xml")

				if (!fs.existsSync(sitemapPath)) {
					console.warn("[sitemap-lastmod] 没找到 sitemap-0.xml，跳过（sitemap 集成可能没跑）")
					return
				}

				/** url path（带尾斜杠、已 percent-encode）→ Date */
				const lastmod = new Map()

				// ① 文章页
				const postsDir = path.join(process.cwd(), "src", "content", "posts")
				let newestPost = 0
				if (fs.existsSync(postsDir)) {
					for (const f of fs.readdirSync(postsDir)) {
						if (!/\.(md|mdx)$/.test(f)) continue
						const abs = path.join(postsDir, f)
						const updated = readFrontmatterDate(abs, "updated")
						const published = readFrontmatterDate(abs, "published")
						const stamp = updated ?? published
						if (!stamp) continue
						newestPost = Math.max(newestPost, stamp.getTime())
						const id = f.replace(/\.(md|mdx)$/, "")
						lastmod.set(`/posts/${encodeURIComponent(id)}/`, stamp)
					}
				}

				// ② 列表/聚合页：内容随最新文章变
				if (newestPost > 0) {
					const newest = new Date(newestPost)
					for (const p of ["/", "/archive/", "/categories/", "/tags/", "/series/"]) {
						lastmod.set(p, newest)
					}
					for (let i = 2; i <= 30; i++) lastmod.set(`/${i}/`, newest)
				}

				// ③ 相册页
				const galleryDir = path.join(process.cwd(), "public", "gallery")
				if (fs.existsSync(galleryDir)) {
					let newestAlbum = 0
					for (const album of fs.readdirSync(galleryDir)) {
						const d = latestMtime(path.join(galleryDir, album))
						if (!d) continue
						newestAlbum = Math.max(newestAlbum, d.getTime())
						lastmod.set(`/gallery/${encodeURIComponent(album)}/`, d)
					}
					if (newestAlbum > 0) lastmod.set("/gallery/", new Date(newestAlbum))
				}

				// ④ 重写 sitemap：给每个 <loc> 补 <lastmod>（已有则不动）
				let xml = fs.readFileSync(sitemapPath, "utf8")
				let added = 0
				let total = 0

				xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (whole, inner) => {
					total++
					if (/<lastmod>/.test(inner)) return whole
					const locMatch = inner.match(/<loc>([^<]+)<\/loc>/)
					if (!locMatch) return whole
					let pathname
					try {
						pathname = new URL(locMatch[1]).pathname
					} catch {
						return whole
					}
					const stamp = lastmod.get(pathname)
					if (!stamp) return whole
					added++
					return `<url>${inner}<lastmod>${toW3C(stamp)}</lastmod></url>`
				})

				fs.writeFileSync(sitemapPath, xml, "utf8")
				console.log(`[sitemap-lastmod] ${added}/${total} 条 URL 补上了 lastmod`)
			},
		},
	}
}
