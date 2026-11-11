// 把 KaTeX 的 CSS + 字体生成到 public/vendor/katex/，供文章页**按需**用 <link> 引入。
//
// 为什么不用组件里 `import "…css"`（2026-11-11 实测）：
// Astro/Vite 会把被 import 的 CSS **无条件**挂进渲染了该组件的那一页 —— 即使组件是条件渲染、
// 甚至改成 `await import()` 动态导入，CSS 照样进产物（实测按需前后都是 33/33 页引用）。
// 唯一能真正做到"只有这页才加载"的办法是：CSS 不进打包，走 public/ 静态文件 + 条件 <link>。
//
// 字体只保留 woff2（原版每个 @font-face 并列 woff2/woff/ttf，三套全进产物 1.02MB）；
// 且浏览器只在页面上真出现对应字形时才下载字体 → 没公式的页面一个字体都不会请求。
//
// 升级 katex 后重跑：node scripts/build-katex-assets.mjs
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const SRC_CSS = path.join(ROOT, "node_modules/katex/dist/katex.min.css")
const SRC_FONTS = path.join(ROOT, "node_modules/katex/dist/fonts")
const OUT_DIR = path.join(ROOT, "public", "vendor", "katex")
const OUT_FONTS = path.join(OUT_DIR, "fonts")

if (!fs.existsSync(SRC_CSS)) {
    console.error("找不到 katex/dist/katex.min.css，先 npm ci")
    process.exit(1)
}

let css = fs.readFileSync(SRC_CSS, "utf8")
const before = Buffer.byteLength(css)
const facesBefore = (css.match(/@font-face/g) || []).length

// ① 只保留 woff2 那一段 src
css = css.replace(
    /(src:url\([^)]*\.woff2\)\s*format\("woff2"\))(?:,url\([^)]*\.woff\)\s*format\("woff"\))?(?:,url\([^)]*\.ttf\)\s*format\("truetype"\))?/g,
    "$1"
)

// ② url(fonts/X.woff2) 保持相对路径不变就行（CSS 与 fonts/ 是同级目录结构）
const fontRefs = [...new Set([...css.matchAll(/url\(fonts\/([^)]+\.woff2)\)/g)].map(m => m[1]))]

fs.mkdirSync(OUT_FONTS, { recursive: true })
let copied = 0
for (const f of fontRefs) {
    const from = path.join(SRC_FONTS, f)
    if (!fs.existsSync(from)) {
        console.error("缺少字体文件:", f)
        process.exit(1)
    }
    fs.copyFileSync(from, path.join(OUT_FONTS, f))
    copied++
}

const banner = `/* 由 scripts/build-katex-assets.mjs 生成（源：node_modules/katex/dist/katex.min.css），只保留 woff2。不要手改。 */\n`
css = banner + css
fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(path.join(OUT_DIR, "katex.css"), css, "utf8")

const woff2Left = (css.match(/\.woff2\)/g) || []).length
const woffLeft = (css.match(/\.woff\)/g) || []).length
const ttfLeft = (css.match(/\.ttf\)/g) || []).length

console.log("源文件      :", (before / 1024).toFixed(1), "KB")
console.log("输出 CSS    :", (Buffer.byteLength(css) / 1024).toFixed(1), "KB →", path.relative(ROOT, path.join(OUT_DIR, "katex.css")))
console.log("@font-face  :", facesBefore, "->", (css.match(/@font-face/g) || []).length)
console.log("字体复制    :", copied, "个 woff2 →", path.relative(ROOT, OUT_FONTS))
console.log("引用计数    : woff2", woff2Left, "| woff", woffLeft, "| ttf", ttfLeft)
