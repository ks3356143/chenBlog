// 由文章数据生成**每篇独立**的社交分享图（og:image），1200×630。
// 改了文章标题/分类/tags，或改了封面素材之后跑一次：npm run og
//
// 为什么需要：原先全站 45 页共用一张 public/og-image.jpg —— 不管分享哪篇文章，
// 微信/X 的卡片都是同一张图，完全看不出内容（2026-10-20 用户选定要做）。
//
// 设计：不直接裁封面（4 张 800×800 抽象图轮播给 28 篇用，裁出来仍然只有 4 种、照样重复），
// 而是「封面做背景 + 标题压在上面」→ 每篇因标题不同而**天然唯一**。
//
// 字体：用系统中文黑体。⚠️ 本脚本只在**构建机**跑（产物入库），
// 所以不需要考虑 Linux 服务器有没有这些字体；换机器时若字体缺失会 fallback 到 sans-serif。
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const POSTS = path.join(ROOT, "src/content/posts");
const COVERS = path.join(ROOT, "src/assets/postImages/covers");
const OUT = path.join(ROOT, "public/og");

const W = 1200;
const H = 630;

// 与站点主色同族（--primary: #00705c）
const BRAND = "#00705c";
const BRAND_DARK = "#052b24";

const IMG_RE = /\.(webp|jpe?g|png|avif)$/i;

/** 极简 frontmatter 解析：只取本脚本要的字段，不引额外依赖 */
function parseFrontmatter(raw) {
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) return {};
	const fm = m[1];
	const get = key => {
		const re = new RegExp("^" + key + ":\\s*(.+)$", "m");
		const hit = fm.match(re);
		if (!hit) return "";
		return hit[1].trim().replace(/^["']|["']$/g, "");
	};
	// tags 可能是行内数组 [a, b] 或 - a 列表
	let tags = [];
	const inline = fm.match(/^tags:\s*\[(.*?)\]/m);
	if (inline) {
		tags = inline[1]
			.split(",")
			.map(s => s.trim().replace(/^["']|["']$/g, ""))
			.filter(Boolean);
	} else {
		const block = fm.match(/^tags:\s*\r?\n((?:\s*-\s*.+\r?\n?)+)/m);
		if (block) {
			tags = block[1]
				.split(/\r?\n/)
				.map(s => s.replace(/^\s*-\s*/, "").trim().replace(/^["']|["']$/g, ""))
				.filter(Boolean);
		}
	}
	return { title: get("title"), category: get("category"), image: get("image"), tags, seriesOrder: get("seriesOrder") };
}

/**
 * 按显示宽度切行。
 *
 * 🔴 宽度系数必须**偏保守**：第一版把 ASCII 当 0.55 个单位 → 估算比实际渲染窄很多，
 * 「CCNewTools V1.5.0 使用手册」被算成一行、实际渲染直接溢出画布右侧被裁掉（截图实测）。
 * 现在：中文 1.0、ASCII 0.62、大写字再宽一点按 0.68 —— 宁可多切一行，也不能溢出。
 */
function charUnits(ch) {
	if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(ch)) return 1
	if (/[A-Z0-9]/.test(ch)) return 0.68
	if (/[a-z]/.test(ch)) return 0.58
	return 0.42 // 空格与标点
}

function wrap(text, maxUnits) {
	const chars = [...text]
	const lines = []
	let cur = ""
	let units = 0
	for (const ch of chars) {
		const w = charUnits(ch)
		if (units + w > maxUnits && cur) {
			lines.push(cur)
			cur = ch
			units = w
		} else {
			cur += ch
			units += w
		}
	}
	if (cur) lines.push(cur)
	return lines
}

function esc(s) {
	return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

if (!fs.existsSync(POSTS)) {
	console.error(`❌ 找不到 ${POSTS}`);
	process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

const covers = fs.existsSync(COVERS)
	? fs
			.readdirSync(COVERS)
			.filter(f => IMG_RE.test(f) && !/\.svg$/i.test(f))
			.sort()
	: [];
if (covers.length === 0) {
	console.error(`❌ ${COVERS} 下没有可用封面`);
	process.exit(1);
}

const files = fs
	.readdirSync(POSTS, { recursive: true })
	.map(f => String(f))
	.filter(f => /\.(md|mdx)$/i.test(f))
	.sort();

let made = 0;
let failed = 0;
const manifest = {};

for (const rel of files) {
	const abs = path.join(POSTS, rel);
	const raw = fs.readFileSync(abs, "utf8");
	const fm = parseFrontmatter(raw);
	const slug = rel.replace(/\.(md|mdx)$/i, "").split(/[\\/]/).pop();
	if (!slug) continue;

	// 与 content-utils 的 getPostCover 同策略：手写 image 优先，否则按 seriesOrder 轮播
	let coverFile = fm.image?.trim();
	if (!coverFile) {
		const order = fm.seriesOrder === "" ? undefined : Number(fm.seriesOrder);
		if (Number.isFinite(order)) coverFile = covers[((order - 1) % covers.length + covers.length) % covers.length];
		else {
			let hash = 0;
			for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) % 1_000_000;
			coverFile = covers[hash % covers.length];
		}
	}
	// image 可能写成 "assets/postImages/covers/cover-1.webp" 或裸文件名
	const coverPath = path.join(COVERS, path.basename(coverFile));
	const coverOk = fs.existsSync(coverPath);

	try {
		// 背景：封面铺满 + 深色渐变（保证白字可读）
		const bg = coverOk
			? await sharp(coverPath).resize(W, H, { fit: "cover", position: "center" }).toBuffer()
			: await sharp({ create: { width: W, height: H, channels: 3, background: BRAND_DARK } }).png().toBuffer();

		// 15 个单位 ≈ 1000px 可用宽度（画布 1200 − 左右各 80 边距 − 主色竖条）。
		// 字号越大每单位占的 px 越多，所以行数与字号要联动。
		const titleLines = wrap(fm.title || slug, 15).slice(0, 3);
		const titleSize = titleLines.length >= 3 ? 58 : titleLines.length === 2 ? 68 : 78;
		const lineH = Math.round(titleSize * 1.32);
		// 标题块垂直居中（略偏上），让下方的分类/tags 有位置
		const blockH = titleLines.length * lineH;
		const startY = Math.round((H - blockH) / 2 + titleSize * 0.35 - 20);

		const titleSvg = titleLines
			.map((line, i) => `<text x="80" y="${startY + i * lineH}" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="${titleSize}" font-weight="700" fill="#ffffff">${esc(line)}</text>`)
			.join("");

		// 分类 + tags 去重：本篇 category="工具" 而 tags=[工具,测试,效率] 也有「工具」，
		// 不去重会渲染成「工具 · 工具 · 测试」（截图实测到的重复）。
		const metaParts = [];
		if (fm.category) metaParts.push(fm.category);
		for (const t of fm.tags || []) {
			if (t && !metaParts.includes(t)) metaParts.push(t);
			if (metaParts.length >= 3) break;
		}
		const meta = metaParts.join("  ·  ");

		const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND_DARK}" stop-opacity="0.72"/>
      <stop offset="45%" stop-color="${BRAND_DARK}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${BRAND_DARK}" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <!-- 左侧主色竖条 -->
  <rect x="0" y="0" width="10" height="${H}" fill="${BRAND}"/>
  ${titleSvg}
  ${
		meta
			? `<text x="80" y="${startY + blockH + 26}" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="30" fill="#d7f0e7">${esc(meta)}</text>`
			: ""
	}
  <!-- 底部站点名 -->
  <text x="80" y="${H - 56}" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="28" font-weight="600" fill="#ffffff" opacity="0.92">亦林 YILIn</text>
  <text x="${W - 80}" y="${H - 56}" text-anchor="end" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="24" fill="#ffffff" opacity="0.6">47.108.230.220</text>
</svg>`;

		const outFile = path.join(OUT, `${slug}.jpg`);
		await sharp(bg)
			.composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
			.jpeg({ quality: 86, mozjpeg: true })
			.toFile(outFile);

		const size = fs.statSync(outFile).size;
		made++;
		manifest[slug] = { file: `/og/${slug}.jpg`, bytes: size };
	} catch (err) {
		console.warn(`  ⚠️ 生成失败 ${slug}：${err.message}`);
		failed++;
	}
}

fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, "\t") + "\n", "utf8");

const total = Object.values(manifest).reduce((a, b) => a + b.bytes, 0);
console.log(`✅ 分享图完成：${made} 张，失败 ${failed} 张`);
console.log(`   输出：public/og/<slug>.jpg  合计 ${(total / 1024).toFixed(0)}KB（平均 ${(total / Math.max(1, made) / 1024).toFixed(0)}KB/张）`);
console.log(`   清单：public/og/manifest.json`);
