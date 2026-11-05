// 由 src/assets/postImages/covers/cover-*.svg 渲染列表页的自动封面素材（webp）。
//
// ⚠️ 本目录里还有一组 **app-*.webp**（app-5 ~ app-9）：那是最近五篇文章的专属封面，
//    由**软件实际截图**合成（模糊底 + 完整截图居中），**不是本脚本产物**。
//    本脚本只扫 `cover-N.svg`，不会碰它们 —— 但**别以为"跑一遍 covers 就会重新生成"**，
//    要改那五张得重跑合成逻辑（见 HANDOFF 第三十四批）。
// 改了 SVG 之后跑一次：npm run covers
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve(import.meta.dirname, "../src/assets/postImages/covers");
const SIZE = 800;

// 列表卡片实际只显示到 240x176（桌面）/ 144x272（移动竖条），800 方图足够，
// 且方形 + 无焦点构图才能同时喂饱这两种完全不同的裁切比例
const sources = fs.readdirSync(DIR).filter(f => /^cover-\d+\.svg$/.test(f)).sort();
if (sources.length === 0) {
	console.error(`❌ ${DIR} 下找不到 cover-N.svg`);
	process.exit(1);
}

for (const name of sources) {
	const svg = fs.readFileSync(path.join(DIR, name));
	// librsvg 对无单位的 SVG 按 72dpi 解释，density 给足再缩放才不会糊
	const info = await sharp(svg, { density: 288 }).resize(SIZE, SIZE).webp({ quality: 82 }).toFile(path.join(DIR, name.replace(/\.svg$/, ".webp")));
	console.log(`${name.replace(".svg", ".webp")}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)}KB`);
}
