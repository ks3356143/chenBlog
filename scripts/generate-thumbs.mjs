// 由 public/ 下的原图生成显示用缩略图（webp）。
// 改了/新增了相册图或正文配图之后跑一次：npm run thumbs
//
// 为什么需要：public/ 下的图**原样拷进 dist、不走 Astro 图片优化** → 浏览器只能整张下载原图。
// 实测两处都严重超供：
//   · 相册网格：桌面显示 237px、下发 1600px（6.8 倍）→ /gallery/ 一次 1.38MB
//   · 文章正文图：手机显示 324px、下发 1600px（2.5 倍）→ 16 张共 582KB
//
// 处理两个根目录：
//   ① public/gallery/<相册>/  → 输出到 <相册>/thumbs/<原名>-<宽>.webp
//      ⚠️ 必须是**子目录**：scanAlbumPhotos() 只 readdirSync 一层且按扩展名过滤，
//      "thumbs" 这个目录名不匹配图片正则 → 天然不会被当成照片。
//      同时它在 /gallery/ 路径下 → 吃现成的「相册图片缓存 7 天」规则。
//   ② public/images/**        → 输出到同目录 thumbs/<原名>-<宽>.webp
//      （正文图由 rehype-prose-thumbs.js 注入 srcset）
//
// 原图一张不动：灯箱与点击放大仍指向原图，看大图是高清的。
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// 两档：640 覆盖 DPR≤2、960 覆盖 DPR3。
// 依据实测的最大显示宽度：相册网格 301px、正文图 742px（桌面）→ 742×1.3≈960 已够，
// 再大的档位无处显示、白占体积（正文图原图 1600px 只显示到 742px）。
const WIDTHS = [640, 960];
const QUALITY = 78;
const IMG_RE = /\.(jpe?g|png|webp|avif)$/i;
// 生成物自己的命名：<原名>-<宽>.webp —— 必须排除，否则重跑会把缩略图当原图再缩一遍
const THUMB_RE = /-\d+\.webp$/i;

const PUBLIC = path.resolve(import.meta.dirname, "../public");

let made = 0;
let skipped = 0;
let failed = 0;
let bytesBefore = 0;
let bytesAfter = 0;

/** 处理一个目录下的图片，输出到 <dir>/thumbs/ */
async function processDir(dir, label) {
	const files = fs
		.readdirSync(dir, { withFileTypes: true })
		.filter((d) => d.isFile() && IMG_RE.test(d.name) && !THUMB_RE.test(d.name))
		.map((d) => d.name)
		.sort();
	if (files.length === 0) return;

	const outDir = path.join(dir, "thumbs");
	fs.mkdirSync(outDir, { recursive: true });

	for (const file of files) {
		const src = path.join(dir, file);
		let meta;
		try {
			meta = await sharp(src).metadata();
		} catch (err) {
			console.warn(`  ⚠️ 读不出 ${label}/${file}：${err.message}`);
			failed++;
			continue;
		}
		if (!meta.width || !meta.height) {
			console.warn(`  ⚠️ 无尺寸，跳过：${label}/${file}`);
			failed++;
			continue;
		}

		const stem = file.replace(IMG_RE, "");
		const before = fs.statSync(src).size;
		bytesBefore += before;
		let smallest = before;

		for (const w of WIDTHS) {
			const out = path.join(outDir, `${stem}-${w}.webp`);
			// 🔴 原图**比目标档还窄** → 整档跳过、一个文件都不生成。
			// 2026-10-19 实测：public/images/jessica-potter.jpg 只有 140×140，
			// withoutEnlargement 会让 640 与 960 两档都产出 140×140 → 两个文件字节完全相同（2498B），
			// 且 srcset 里挂两个同宽度候选是**错的**（浏览器按 w 描述符挑，会以为 960w 真更清晰）。
			// 这种图让浏览器直接用原图，加缩略图毫无收益。
			// （注意与"原图恰好等于某档宽"区分：那种情况该档**要保留**，
			//  否则 DPR3 会退到更小一档、白降清晰度。）
			if (meta.width < w) {
				skipped++;
				continue;
			}
			const info = await sharp(src)
				.resize({ width: w, withoutEnlargement: true })
				.webp({ quality: QUALITY })
				.toFile(out);
			made++;
			smallest = Math.min(smallest, info.size);
			// 另一种该删的情形：这一档**比原图文件还大**（q78 重编码有时会比已压过的原图更胖），
			// 留着只会误导浏览器去下更大的文件。
			if (info.size >= before) {
				fs.unlinkSync(out);
				made--;
				skipped++;
			}
		}
		bytesAfter += smallest;
	}
}

// ① 相册：每个子目录各处理一次
const GALLERY = path.join(PUBLIC, "gallery");
if (fs.existsSync(GALLERY)) {
	const albums = fs
		.readdirSync(GALLERY, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name)
		.sort();
	for (const album of albums) await processDir(path.join(GALLERY, album), `gallery/${album}`);
}

// ② 正文配图：public/images 下递归（子目录如 ccnewtools/）
const IMAGES = path.join(PUBLIC, "images");
if (fs.existsSync(IMAGES)) {
	const walk = (dir) => {
		for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
			// 跳过 thumbs 自身，避免把生成物当源图
			if (d.isDirectory() && d.name !== "thumbs") walk(path.join(dir, d.name));
		}
	};
	const dirs = [];
	const collect = (dir) => {
		if (fs.readdirSync(dir, { withFileTypes: true }).some((d) => d.isFile() && IMG_RE.test(d.name) && !THUMB_RE.test(d.name)))
			dirs.push(dir);
		for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
			if (d.isDirectory() && d.name !== "thumbs") collect(path.join(dir, d.name));
		}
	};
	collect(IMAGES);
	for (const dir of dirs) await processDir(dir, path.relative(PUBLIC, dir));
}

console.log(`✅ 缩略图完成：生成 ${made} 个，跳过 ${skipped} 个，失败 ${failed} 个`);
console.log(`   按每张最小可用档估算：${(bytesBefore / 1024).toFixed(0)}KB → ${(bytesAfter / 1024).toFixed(0)}KB`);
console.log(`   输出目录：public/gallery/<相册>/thumbs/ 与 public/images/**/thumbs/`);
