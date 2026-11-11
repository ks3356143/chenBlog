// 1) modulepreload 注入：扫产物 HTML 里的 ESM <script src>，为它们（及其一层静态依赖）补 <link rel="modulepreload">
//
// 为什么后处理：这些 <script type="module" src> 是 Astro 从组件里抽出来的 chunk，
// 浏览器要"解析到 script 标签"才开始下（串行瀑布）；而它们静态 import 的子 chunk
// （实测 `toc-utils.*.js` 被 SiderBarToc / FloatingToc 共用）还要等父 chunk 下完才知道。
// modulepreload 让浏览器在解析 head 时就并行预取，把这些请求压平。
// ⚠️ 只加**本站** /_astro/*.js；同域但非 ESM 的（/assets/js/reinit.js 是经典脚本）跳过。
// ⚠️ 只跟**一层**静态依赖：实测这些 chunk 的 import 深度就是 1，跟到底没必要，也更容易踩到循环。
import fs from "node:fs"
import path from "node:path"

const DIST = path.resolve(import.meta.dirname, "../dist")
const MARK = "data-modulepreload"

function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) walk(p, out)
        else if (e.name.endsWith(".html")) out.push(p)
    }
    return out
}

/** 读一个 /_astro/x.js，返回它静态 import 的同目录兄弟 chunk（一层） */
function siblingsOf(url) {
    const abs = path.join(DIST, url.replace(/^\//, ""))
    if (!fs.existsSync(abs)) return []
    let code
    try {
        code = fs.readFileSync(abs, "utf8")
    } catch {
        return []
    }
    // 只认相对路径的静态 import（Vite 产物里是 from"./x.js" / import"./x.js"）
    const names = [...new Set([...code.matchAll(/(?:from|import)\s*"\.\/([A-Za-z0-9_.\-]+\.js)"/g)].map(m => m[1]))]
    return names.map(n => "/_astro/" + n)
}

if (!fs.existsSync(DIST)) {
    console.error("dist 不存在，先跑 astro build")
    process.exit(1)
}

let injected = 0, skipped = 0, noModules = 0
const counts = []

for (const f of walk(DIST)) {
    let html = fs.readFileSync(f, "utf8")
    if (html.includes(MARK)) { skipped++; continue }

    // 收集所有 type="module" 且带 src 的脚本
    const mods = [...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*>/g)]
        .map(m => m[1])
        .filter(u => u.startsWith("/_astro/") && u.endsWith(".js"))

    if (!mods.length) { noModules++; continue }

    // 入口 + 一层静态依赖，去重
    const all = new Set()
    for (const u of mods) {
        all.add(u)
        for (const s of siblingsOf(u)) all.add(s)
    }
    const list = [...all]
    const links = list.map(u => `<link rel="modulepreload" href="${u}" ${MARK}>`).join("")

    const headEnd = html.indexOf("</head>")
    if (headEnd === -1) { noModules++; continue }

    html = html.slice(0, headEnd) + links + "\n" + html.slice(headEnd)
    fs.writeFileSync(f, html, "utf8")
    injected++
    counts.push(list.length)
}

const total = counts.reduce((a, b) => a + b, 0)
console.log(
    `modulepreload：注入 ${injected} 页 / 跳过 ${skipped} 页（已有）/ ${noModules} 页无 ESM 脚本；共 ${total} 条 link` +
        (counts.length ? `（每页 ${Math.min(...counts)}~${Math.max(...counts)} 条）` : "")
)
