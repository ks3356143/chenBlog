// 由 public/gallery/<相册>/ 的原图生成瀑布流用的缩略图（webp）。
// 改了/新增了相册图之后跑一次：npm run thumbs
//
// 为什么要缩略图：相册网格里的图最大只显示到 301px（1920 屏实测），
// 而 public/ 下的图原样拷进 dist、不走 Astro 图片优化 → 浏览器只能整张下载原图。
// 实测桌面 1440 下封面显示 237px、实际下发 1600px（超供 6.8 倍），
// /gallery/ 一次加载 1.38MB 图片、相册页 1.24MB。
//
// 输出位置：public/gallery/<相册>/thumbs/<原名>-<宽>.webp
//   ⚠️ 必须放在相册目录的**子目录**里：scanAlbumPhotos() 只 readdirSync 一层且按扩展名过滤，
//   "thumbs" 这个目录名不匹配图片正则 → 天然不会被当成照片。
//   同时它在 /gallery/ 路径下 → 吃现成的「相册图片缓存 7 天」规则。
//
// 原图一张不动：灯箱（Fancybox 的 data-src）仍指向原图，看大图是高清的。
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// 两档：640 覆盖 DPR≤2 的全部情形（最大 301px × 2 = 602），
// 960 覆盖 DPR3（301 × 3 = 903）；再大的档位实测无处显示，白占体积
const WIDTHS = [640, 960];
const QUALITY = 78;
const IMG_RE = /\.(jpe?g|png|webp|avif)$/i;

const GALLERY = path.resolve(import.meta.dirname, "../public/gallery");

if (!fs.existsSync(GALLERY)) {
	console.error(`❌ 找不到 ${GALLERY}`);
	process.exit(1);
}

const albums = fs
	.readdirSync(GALLERY, { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => d.name)
	.sort();

if (albums.length === 0) {
	console.error(`❌ ${GALLERY} 下没有相册目录`);
	process.exit(1);
}

let made = 0;
let skipped = 0;
let savedBefore = 0;
let savedAfter = 0;

for (const album of albums) {
	const dir = path.join(GALLERY, album);
	const outDir = path.join(dir, "thumbs");
	const files = fs
		.readdirSync(dir)
		.filter((f) => IMG_RE.test(f))
		.sort();
	if (files.length === 0) continue;

	fs.mkdirSync(outDir, { recursive: true });

	for (const file of files) {
		const src = path.join(dir, file);
		const meta = await sharp(src).metadata();
		if (!meta.width || !meta.height) {
			console.warn(`  ⚠️ 读不出尺寸，跳过：${album}/${file}`);
			continue;
		}
		const stem = file.replace(IMG_RE, "");
		const before = fs.statSync(src).size;
		savedBefore += before;

		let smallest = before;
		for (const w of WIDTHS) {
			const out = path.join(outDir, `${stem}-${w}.webp`);
			// withoutEnlargement：原图比目标还窄时不放大，直接输出原尺寸
			// （所以 960 宽的原图在 960 档会产出同样宽度的文件 —— 这是**正确**的，
			//   srcset 里那一档仍然有意义：DPR3 的 320px 槽位要 960w 才会挑到它。
			//   删掉它会让浏览器退到 640w，白白降清晰度。）
			const info = await sharp(src)
				.resize({ width: w, withoutEnlargement: true })
				.webp({ quality: QUALITY })
				.toFile(out);
			made++;
			smallest = Math.min(smallest, info.size);
			// 唯一该删的情形：这一档**比原图文件还大**（q78 重编码有时会比已压过的原图更胖），
			// 那它存在只会误导浏览器去下一个更大的文件。
			if (info.size >= before) {
				fs.unlinkSync(out);
				made--;
				skipped++;
			}
		}
		savedAfter += smallest;
	}
}

console.log(`✅ 缩略图完成：新生成 ${made} 个，跳过 ${skipped} 个`);
console.log(`   按每张图最小可用档估算：${(savedBefore / 1024).toFixed(0)}KB → ${(savedAfter / 1024).toFixed(0)}KB`);
console.log(`   输出目录：public/gallery/<相册>/thumbs/`);
