// 由 public/favicon.svg 生成整套站点图标：favicon-16/32/96.png、favicon.ico（内嵌 16/32/48）、
// apple-touch-icon.png(180，满幅不透明)、web-app-manifest-192/512.png。
// 改了 favicon.svg 之后跑一次：npm run icons
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.resolve(import.meta.dirname, "../public");
const baseSvg = fs.readFileSync(path.join(PUBLIC, "favicon.svg"), "utf8");

// iOS 会把图标自己裁成圆角，所以 apple-touch-icon 要满幅不透明：去掉圆角、铺满、压平到白底
const fullBleedSvg = baseSvg.replace('rx="14"', 'rx="0"');

// SVG 无单位时 librsvg 按 72dpi 解释，直接 resize 会糊；给足 density 让它按矢量放大再缩放
const png = (svg, size) =>
	sharp(Buffer.from(svg), { density: 1152 })
		.resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: svg === fullBleedSvg ? 1 : 0 } })
		.png()
		.toBuffer();

const targets = [
	["favicon-16x16.png", 16, baseSvg],
	["favicon-32x32.png", 32, baseSvg],
	["favicon-96x96.png", 96, baseSvg],
	["apple-touch-icon.png", 180, fullBleedSvg],
	["web-app-manifest-192x192.png", 192, baseSvg],
	["web-app-manifest-512x512.png", 512, baseSvg],
];

for (const [name, size, svg] of targets) {
	const buf = await png(svg, size);
	fs.writeFileSync(path.join(PUBLIC, name), buf);
	console.log(`  ${name}  ${size}x${size}  ${(buf.length / 1024).toFixed(1)}K`);
}

// favicon.ico：PNG-in-ICO 容器，内嵌 16/32/48，Windows 浏览器与任务栏都要照顾到
const icoSizes = [16, 32, 48];
const images = [];
for (const s of icoSizes) images.push(await png(baseSvg, s));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);
let offset = header.length + 16 * images.length;
const entries = images.map((img, i) => {
	const e = Buffer.alloc(16);
	e.writeUInt8(icoSizes[i] >= 256 ? 0 : icoSizes[i], 0); // width
	e.writeUInt8(icoSizes[i] >= 256 ? 0 : icoSizes[i], 1); // height
	e.writeUInt16LE(1, 4); // planes
	e.writeUInt16LE(32, 6); // bit count
	e.writeUInt32LE(img.length, 8);
	e.writeUInt32LE(offset, 12);
	offset += img.length;
	return e;
});
const ico = Buffer.concat([header, ...entries, ...images]);
fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), ico);
console.log(`  favicon.ico  ${icoSizes.join("/")}  ${(ico.length / 1024).toFixed(1)}K`);
console.log("完成");
