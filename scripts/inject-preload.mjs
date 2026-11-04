// 给首屏壁纸注入 <link rel="preload">。
//
// 为什么是后处理而不是在组件里写：
//   在 Cover.astro 里另调一次 getImage() 会让 Astro 把**同一张图编码两次**（实测两个不同哈希名、
//   内容 MD5 完全相同、各 328.5KB）→ dist 白多 328KB，且 preload 与真实 srcset 不同名，
//   浏览器仍会为真实请求再下一次。所以改成构建后从**产物本身的 srcset** 取 URL，零重复编码。
//
// 做法：扫 dist 里每个 HTML，找 #banner-images-container 里那张 <img> 的 srcset，
//   取其中最大一档（桌面 LCP 命中的就是这档），插到 </head> 前。
// 已有 preload 的页面跳过（幂等，可重复跑）。
//
// 由 package.json 的 build 脚本在 astro build 之后、pagefind 之前调用。
import fs from 'node:fs'
import path from 'node:path'

const DIST = path.resolve(import.meta.dirname, '../dist')
const MARK = 'data-preload-banner'

function walk(dir, out = []) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name)
		if (e.isDirectory()) walk(p, out)
		else if (e.name.endsWith('.html')) out.push(p)
	}
	return out
}

if (!fs.existsSync(DIST)) {
	console.error('dist 不存在，先跑 astro build')
	process.exit(1)
}

const files = walk(DIST)
let injected = 0
let skipped = 0
let noBanner = 0

for (const f of files) {
	let html = fs.readFileSync(f, 'utf8')

	if (html.includes(MARK)) { skipped++; continue }

	// 定位横幅容器里的第一张 img
	const container = html.indexOf('id="banner-images-container"')
	if (container === -1) { noBanner++; continue }

	// 从容器往后找第一个 <img ...>（横幅图就在容器内部）
	const imgStart = html.indexOf('<img', container)
	if (imgStart === -1) { noBanner++; continue }
	const imgEnd = html.indexOf('>', imgStart)
	if (imgEnd === -1) { noBanner++; continue }
	const imgTag = html.slice(imgStart, imgEnd + 1)

	// 从 srcset 取最大档
	const m = imgTag.match(/srcset="([^"]+)"/)
	if (!m) { noBanner++; continue }

	const entries = m[1]
		.split(',')
		.map(s => s.trim())
		.filter(Boolean)
		.map(s => {
			const mm = s.match(/^(\S+)\s+(\d+)w$/)
			return mm ? { url: mm[1], w: Number(mm[2]) } : null
		})
		.filter(Boolean)

	if (!entries.length) { noBanner++; continue }

	// 取与「桌面视口」匹配的那档：最大档通常是 2560（DPR2 才用），
	// 实际 LCP 在 1440 视口 / DPR1 下命中的是 1920 档。取 >=1440 里最小的一档。
	const target =
		entries.filter(e => e.w >= 1440).sort((a, b) => a.w - b.w)[0] ||
		entries.sort((a, b) => b.w - a.w)[0]

	const link = `<link rel="preload" as="image" href="${target.url}" imagesrcset="${m[1]}" imagesizes="${(imgTag.match(/sizes="([^"]*)"/) || [, '100vw'])[1]}" fetchpriority="high" ${MARK}>`

	const headEnd = html.indexOf('</head>')
	if (headEnd === -1) { noBanner++; continue }

	html = html.slice(0, headEnd) + link + '\n' + html.slice(headEnd)
	fs.writeFileSync(f, html, 'utf8')
	injected++
}

console.log(`壁纸 preload：注入 ${injected} 页 / 跳过 ${skipped} 页（已有）/ ${noBanner} 页无横幅`)
