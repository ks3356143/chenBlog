// 文章脚手架：一条命令生成带正确 frontmatter 的模板文件，避免每次手抄字段。
// 系列文章走 css100day-<天数>.md，非系列必须显式给 --slug（中文标题不做音译，猜错就是永久错 URL）。
// 用法：
//   npm run new:post -- --day 29 --title "3D 翻转卡片"
//   npm run new:post -- --slug flex-center --title "弹性布局居中" --desc "…" --tags css,布局

import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.resolve(import.meta.dirname, "../src/content/posts");
const SERIES_NAME = "CSS100Day";
const today = new Date().toISOString().slice(0, 10);

const SERIES_BODY = `## 设计简介

关键点如下

1. 知识点1：

## 效果展示

<div class="frame">

</div>

## 实现代码和步骤

\`\`\`css

\`\`\`
`;

const PLAIN_BODY = `## 设计简介

## 实现代码和步骤
`;

const args = parseArgs(process.argv.slice(2));
if (args.help) {
	console.log(
		"用法：npm run new:post -- --day <天数> --title <标题> [--desc 摘要] [--tags a,b]\n" +
			"     npm run new:post -- --slug <ascii-kebab> --title <标题> [...同上]\n" +
			"可选：--category 分类（默认 设计灵感）  --series <系列名>  --force 覆盖同名文件"
	);
	process.exit(0);
}

const title = args.title;
if (!title) fail('缺少 --title。示例：npm run new:post -- --day 29 --title "3D 翻转卡片"');

// --- 决定文件名、系列归属与标题前缀 ---
let slug;
let fullTitle = title;
let series = args.series ?? "";
let seriesOrder;
let defaultTags;

if (args.day !== undefined) {
	const day = Number(args.day);
	if (!Number.isInteger(day) || day <= 0) fail(`--day 要是正整数，收到的是 ${args.day}`);
	slug = `${SERIES_NAME.toLowerCase()}-${day}`;
	series = args.series ?? SERIES_NAME;
	seriesOrder = day;
	defaultTags = ["CSS100天", "css"];
	// 现有系列标题一律是 CSS100Day(N)-xxx，顺手补齐前缀，省得忘了写不进系列页
	if (!title.startsWith(`${SERIES_NAME}(`)) fullTitle = `${SERIES_NAME}(${day})-${title}`;
} else {
	if (!args.slug) fail("非系列文章必须给 --slug（ASCII kebab-case），或者用 --day 走系列命名");
	slug = args.slug;
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(`--slug 要的是 ASCII kebab-case（小写字母、数字、连字符），收到的是 ${slug}`);
	defaultTags = ["css"];
}

const tags = args.tags ? args.tags.split(",").map(t => t.trim()).filter(Boolean) : defaultTags;
const filePath = path.join(POSTS_DIR, `${slug}.md`);
if (fs.existsSync(filePath) && !args.force) fail(`${path.relative(process.cwd(), filePath)} 已存在，要覆盖就加 --force`);

if (seriesOrder !== undefined) {
	const dup = findDuplicateOrder(seriesOrder);
	if (dup) console.warn(`⚠️ ${SERIES_NAME} 第 ${seriesOrder} 天已有文章（${dup}），确认不是重复建？`);
}

fs.writeFileSync(
	filePath,
	buildFrontmatter({
		title: fullTitle,
		description: args.desc ?? "",
		tags,
		category: args.category ?? "设计灵感",
		series,
		seriesOrder,
		body: series ? SERIES_BODY : PLAIN_BODY,
	}),
	"utf8"
);

console.log(`✅ 已生成 ${path.relative(process.cwd(), filePath)}`);
console.log(`   下一步：npm run dev → http://localhost:4321/posts/${slug}/`);
console.log("   写完正文记得核 description（列表页按 2 行截断）");

// --- 模板 ---
function buildFrontmatter({ title, description, tags, category, series, seriesOrder, body }) {
	// JSON.stringify 出来的双引号串正好是合法的 YAML 双引号标量，标题里带引号也不会炸
	const lines = [
		"---",
		`title: ${title}`,
		`published: ${today}`,
		`updated: ${today}`,
		`description: ${JSON.stringify(description)}`,
		`tags: [${tags.join(", ")}]`,
		`category: ${JSON.stringify(category)}`,
	];
	if (series) {
		lines.push(`series: ${JSON.stringify(series)}`);
		if (seriesOrder !== undefined) lines.push(`seriesOrder: ${seriesOrder}`);
	}
	lines.push("draft: false", "---", "", body);
	return lines.join("\n");
}

// --- 小工具 ---
function parseArgs(argv) {
	const out = {};
	for (let i = 0; i < argv.length; i++) {
		const token = argv[i];
		if (!token.startsWith("--")) continue;
		const key = token.slice(2);
		if (key === "force" || key === "help") {
			out[key] = true;
			continue;
		}
		const value = argv[i + 1];
		if (value === undefined || value.startsWith("--")) fail(`--${key} 缺值`);
		out[key] = value;
		i++;
	}
	return out;
}

function findDuplicateOrder(order) {
	for (const name of fs.readdirSync(POSTS_DIR)) {
		if (!/\.(md|mdx)$/.test(name)) continue;
		const text = fs.readFileSync(path.join(POSTS_DIR, name), "utf8");
		if (!new RegExp(`^series: ["']?${SERIES_NAME}`, "m").test(text)) continue;
		if (new RegExp(`^seriesOrder: ${order}\\s*$`, "m").test(text)) return name;
	}
	return null;
}

function fail(message) {
	console.error(`❌ ${message}`);
	process.exit(1);
}
