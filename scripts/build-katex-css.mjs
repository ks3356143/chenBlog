// 生成只含 woff2 的 KaTeX 精简 CSS。
// 原版 katex.min.css 每个 @font-face 都并列 woff2/woff/ttf 三种格式（IE 时代的兼容写法），
// 三种字体全进 dist 共 1.02MB，而本站 33 篇里公式使用数为 0。
// 现代浏览器都支持 woff2（Chrome 36+ / Firefox 39+ / Safari 16+ / Edge 14+），只留 woff2。
//
// ⚠️ 关键点：原 CSS 里写的是 url(fonts/X.woff2)，那是**相对 katex.min.css 自身位置**的路径。
// 生成的 CSS 落在 src/styles/ 下，两者不在同一目录 → 必须把字体 URL 改写成能从 src/styles/
// 解析到 node_modules/katex/dist/fonts/ 的相对路径，否则 vite 找不到字体、一个都不会复制进产物
// （实测过：不改写则 dist 里字体数 = 0）。
//
// 生成物 src/styles/katex-woff2.css 入库，不要手改；升级 katex 后重跑本脚本：
//   node scripts/build-katex-css.mjs
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'node_modules/katex/dist/katex.min.css')
const OUT = path.join(ROOT, 'src/styles/katex-woff2.css')

// 从 src/styles/ 指向 node_modules/katex/dist/fonts/（src/styles/ → 项目根要退两级）
const FONT_REL = '../../node_modules/katex/dist/fonts'

if (!fs.existsSync(SRC)) {
	console.error('找不到 katex.min.css，先 npm ci')
	process.exit(1)
}

let css = fs.readFileSync(SRC, 'utf8')
const before = Buffer.byteLength(css)
const facesBefore = (css.match(/@font-face/g) || []).length

// ① 只保留 woff2 那一段 src
css = css.replace(
	/(src:url\([^)]*\.woff2\)\s*format\("woff2"\))(?:,url\([^)]*\.woff\)\s*format\("woff"\))?(?:,url\([^)]*\.ttf\)\s*format\("truetype"\))?/g,
	'$1'
)

// ② 把 url(fonts/X.woff2) 改写成从 src/styles/ 出发的相对路径
css = css.replace(/url\(fonts\/([^)]+\.woff2)\)/g, `url(${FONT_REL}/$1)`)

const woffLeft = (css.match(/\.woff\)/g) || []).length
const ttfLeft = (css.match(/\.ttf\)/g) || []).length
const woff2Left = (css.match(/\.woff2\)/g) || []).length
const resolved = (css.match(/\.\.\/node_modules\/katex\/dist\/fonts\//g) || []).length

// 保留 katex 原有声明顺序与层叠，只动 src 的格式与路径
const banner = `/* 由 scripts/build-katex-css.mjs 生成（源：node_modules/katex/dist/katex.min.css），只保留 woff2。不要手改。 */\n`
css = banner + css

fs.writeFileSync(OUT, css, 'utf8')

console.log('源文件:', (before / 1024).toFixed(1), 'KB')
console.log('输出  :', (Buffer.byteLength(css) / 1024).toFixed(1), 'KB')
console.log('@font-face:', facesBefore, '->', (css.match(/@font-face/g) || []).length)
console.log('引用计数  woff2:', woff2Left, '| woff:', woffLeft, '| ttf:', ttfLeft)
console.log('已改写为可解析路径:', resolved, '处')
console.log('写入:', path.relative(ROOT, OUT))
