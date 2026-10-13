import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

/*
 * 文档自检（npm run docs:check）
 * // 组件自述：AGENTS.md 分层改造（2026-10-12）产生的契约，由本脚本把关：
 * //   ① 注入预算：~/.dsh/AGENTS.md + AGENTS.md + AGENTS.local.md 合计必须 ≤ 64KB（超出被**静默截断**，见 harness.md B-2）
 * //   ② 分册存在性：AGENTS.md 里索引的 docs/agents/*.md 必须真的存在
 * //   ③ 编号引用完整性：AGENTS.md 里写的 五-N / 八-N / 十-N，分册里必须有同编号条目
 * //   ④ 死引用：文档里反引号包住的仓库内路径必须存在（上一任制造过一次"引用了还不存在的文件"，harness.md B-10）
 * //   ⑤ A/B 编号引用：AGENTS.md 写「见 harness.md B-19」这类引用，harness.md 里必须有同编号小节
 * //      （③ 只认中文数字 五-N，A/B 系列一直没人管 —— 2026-10-12 补）
 * //   ⑥ 余量告警：常驻层快撑满时提前喊，而不是等下一次编辑被静默截断
 * //   ⑦ 表格竖线一致性：某行多一个 | 会渲染出坏单元格，**不报错、只是看着怪**（2026-10-12 实测踩到）
 */

const root = process.cwd();
const BUDGET = 65536;
const MARGIN = 2048; // 归属头（"Instructions from: …"等）也占字节
const HEADROOM_WARN = 1024; // 常驻层余量低于此值就告警：再写一段就可能撑爆 → 静默截断
const errors = [];
const warns = [];
const notes = [];

const readIf = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), "utf8").replace(/\r\n/g, "\n") : null);

/* ---------- ① 注入预算 ---------- */
const chain = [
  { label: "AGENTS.md", file: "AGENTS.md", required: true },
  { label: "AGENTS.local.md", file: "AGENTS.local.md", required: false },
];
let total = 0;
for (const c of chain) {
  const txt = readIf(c.file);
  if (txt === null) {
    if (c.required) errors.push(`缺少 ${c.file}`);
    else notes.push(`${c.file} 不存在（部署目标真实值应放这里，见 AGENTS 六节）`);
    continue;
  }
  const b = Buffer.byteLength(txt, "utf8");
  total += b;
  notes.push(`${c.file}: ${b} B`);
  if (c.file === "AGENTS.md" && b > 60 * 1024) {
    warns.push(`AGENTS.md 已达 ${b} B（>60KB）——分册里还有可下沉的内容，注意给私密层留位置`);
  }
}
const hom = (process.env.USERPROFILE || process.env.HOME || "").replace(/\\/g, "/");
const globalFile = join(hom, ".dsh/AGENTS.md");
if (existsSync(globalFile)) {
  const gb = statSync(globalFile).size;
  total += gb;
  notes.push(`~/.dsh/AGENTS.md: ${gb} B`);
}
if (total + MARGIN > BUDGET) {
  errors.push(
    `注入链合计 ${total} B + 余量 ${MARGIN} 超出预算 ${BUDGET} → **会被静默截断**。` +
      `超出 ${total + MARGIN - BUDGET} B，必须下沉到 docs/agents/ 分册。`
  );
} else {
  const headroom = BUDGET - MARGIN - total;
  notes.push(`注入链合计 ${total} B / 预算 ${BUDGET} B（含余量 ${MARGIN}，尚可用 ${headroom} B）`);
  if (headroom < HEADROOM_WARN) {
    warns.push(
      `常驻层余量只剩 ${headroom} B（< ${HEADROOM_WARN} B）：**下次往 AGENTS.md / AGENTS.local.md 加内容前，必须先下沉到 docs/agents/ 分册**。` +
        `超出预算会**静默截断**——不报错、不告警，只有下一轮注入时出现 truncated 字样，且被牺牲的总是 AGENTS.md 尾部（harness.md B-2）`
    );
  }
}

/* ---------- ② 分册存在性 ---------- */
const agentsMd = readIf("AGENTS.md") || "";
const volumes = ["config", "deploy", "collab", "writing", "todo", "swup", "harness"];
for (const v of volumes) {
  const p = `docs/agents/${v}.md`;
  if (!existsSync(join(root, p))) errors.push(`分册缺失：${p}`);
  else {
    const b = Buffer.byteLength(readFileSync(join(root, p), "utf8"), "utf8");
    notes.push(`${p}: ${b} B`);
  }
}
// AGENTS.md 里提到的每个 docs/agents/*.md 都要存在
for (const m of agentsMd.matchAll(/docs\/agents\/([A-Za-z0-9_-]+\.md)/g)) {
  const p = "docs/agents/" + m[1];
  if (!existsSync(join(root, p))) errors.push(`AGENTS.md 引用了不存在的分册：${p}`);
}

/* ---------- ③ 编号引用完整性 ---------- */
const volumeOf = { 五: "config", 八: "writing", 十: "swup", 九: "todo", 七: "collab", 六: "deploy" };
const present = new Set();
for (const m of agentsMd.matchAll(/([五六七八九十])-(\d{1,2})/g)) present.add(m[1] + "-" + m[2]);
for (const m of agentsMd.matchAll(/(?<![五六七八九十-])([五六七八九十])\s*第?\s*(\d{1,2})\s*条/g)) present.add(m[1] + "-" + m[2]);
const cache = {};
for (const key of [...present].sort()) {
  const sec = key.slice(0, key.indexOf("-"));
  const no = key.slice(key.indexOf("-") + 1);
  const file = volumeOf[sec];
  if (!file) continue;
  cache[file] ||= readIf(`docs/agents/${file}.md`) || "";
  // 分册里条目行首形如 "N. " 或 "> N. "（原文编号）
  const ok = new RegExp("^\\s*" + no + "\\.\\s", "m").test(cache[file]) || cache[file].includes(`${sec}-${no}`);
  if (!ok) warns.push(`编号引用可能悬空：AGENTS.md 写 ${key}，但 docs/agents/${file}.md 里没找到第 ${no} 条`);
}

/* ---------- ④ 死引用（仓库内路径） ---------- */
const scanFiles = ["AGENTS.md", "HANDOFF.md", ...volumes.map((v) => `docs/agents/${v}.md`)].filter((f) => existsSync(join(root, f)));
// 扩展名要"全词"匹配，否则 site.json 会被截成 site.js
const pathLike = /(?:src|scripts|public|docs)\/[A-Za-z0-9_\-.[\]/*{}]+\.(?:mjs|cjs|js|ts|astro|svelte|css|styl|md|mdx|yml|svg|json|xml)(?![A-Za-z0-9_])/g;
// 占位符/模式路径不算引用（YYYY-MM-DD、<id>、cover-N、$ 变量等）
const PLACEHOLDER = /(YYYY|MM|DD|\{|<|>|\$|XXX|xxx|(^|[/\W])N(\.|\W|$))/;
// "历史说明"语境（明说已删/不再引用）里的路径不是契约
const HISTORICAL = /(已删|已移除|不再引|别再引|历史遗留|曾经|此前|已废弃|删除|git rm|已被)/;
const checked = new Set();
for (const f of scanFiles) {
  const lines = readFileSync(join(root, f), "utf8").replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(pathLike)) {
      const rel = m[0];
      // 通配符路径（docs/agents/*.md）是模式，不是引用
      if (rel.includes("*") || PLACEHOLDER.test(rel) || HISTORICAL.test(lines[i])) continue;
      if (checked.has(rel)) continue;
      checked.add(rel);
      if (!existsSync(join(root, rel))) errors.push(`死引用：${f}:${i + 1} 写了 ${rel}，但文件不存在`);
    }
  }
}
// 控制组：探针必须命中过东西，否则"零错误"是假结论（harness.md A-1 第 7 条）
if (checked.size === 0) errors.push("路径探针一个都没命中 —— 方法失效，别把零错误当通过");
else notes.push(`路径探针命中 ${checked.size} 个（控制组通过）`);
// 三个脚本必须真的可跑（本会话差点留下两个"引用了不存在文件"的坑）
for (const s of ["scripts/probe.mjs", "scripts/check-docs.mjs", "scripts/new-post.mjs"]) {
  if (!existsSync(join(root, s))) errors.push(`脚本缺失：${s}`);
}
// package.json 里声明的 scripts 必须指向存在的文件
try {
  const pj = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  for (const [k, v] of Object.entries(pj.scripts || {})) {
    const mm = String(v).match(/node\s+([\w./-]+\.mjs)/);
    if (mm && !existsSync(join(root, mm[1]))) errors.push(`package.json script "${k}" 指向不存在的 ${mm[1]}`);
  }
} catch (e) {
  errors.push("package.json 解析失败: " + e.message);
}

/* ---------- ⑤ harness.md 的 A-N / B-N 引用完整性 ---------- */
/* AGENTS.md 会写「见 harness.md B-19」这类引用，而 ③ 只认中文数字（五-N）。
   本节正是 B-10「引用了还不存在的条目」那一族；控制组 = harness.md 必须能解析出小节。 */
const harnessTxt = readIf("docs/agents/harness.md") || "";
const harnessIds = new Set([...harnessTxt.matchAll(/^#{2,4}\s+(A-\d+|B-\d+)(?=\s|$)/gm)].map((m) => m[1]));
const abRefs = new Set(
  [...agentsMd.matchAll(/(?:^|[^A-Za-z0-9])([AB])-(\d{1,2})(?![0-9])/g)].map((m) => m[1] + "-" + m[2])
);
if (harnessIds.size === 0) {
  errors.push("harness.md 里一个 A-N/B-N 小节都没解析出来 —— 提取方法失效（控制组失败），别把零告警当通过");
} else {
  notes.push(`harness.md 解析出 ${harnessIds.size} 个 A/B 小节（控制组通过），AGENTS.md 引用其中 ${[...abRefs].filter((r) => harnessIds.has(r)).length} / ${abRefs.size} 个`);
  for (const r of [...abRefs].sort()) {
    if (!harnessIds.has(r)) warns.push(`编号引用可能悬空：AGENTS.md 写了 ${r}，但 docs/agents/harness.md 里没有对应小节`);
  }
}

/* ---------- ⑥ Markdown 表格竖线一致性 ---------- */
/* 实测踩过：HANDOFF 某行多一个 | → 整行渲染成多一个坏单元格，**不报错、只是看着怪**。
   这类静默排版损坏正是本项目最恨的一类，纳入门禁。代码块围栏内的竖线不算。 */
/* 数竖线：必须先剥掉「行内代码span」再数 —— `|` 写在反引号里在 Markdown 里不是分隔符。
   （这是本闸自己的误报教训：B-20 表格里写了 `|` 就误报了一条，见 harness.md B-20 末条） */
const countPipes = (s) => (s.replace(/`[^`]*`/g, "").replace(/\\\|/g, "").match(/\|/g) || []).length;
for (const f of ["AGENTS.md", "HANDOFF.md", ...volumes.map((v) => `docs/agents/${v}.md`)]) {
  const p = join(root, f);
  if (!existsSync(p)) continue;
  const lines = readFileSync(p, "utf8").replace(/\r\n/g, "\n").split("\n");
  const inFence = new Array(lines.length).fill(false);
  let fence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) { fence = !fence; inFence[i] = true; continue; }
    inFence[i] = fence;
  }
  let tables = 0;
  let badRows = 0;
  for (let i = 0; i + 1 < lines.length; i++) {
    if (inFence[i] || !/^\s*\|/.test(lines[i])) continue;
    if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) continue; // 下一行不是分隔行 → 不是表头
    const head = countPipes(lines[i]);
    tables++;
    let j = i + 2;
    for (; j < lines.length && !inFence[j] && /^\s*\|/.test(lines[j]); j++) {
      const n = countPipes(lines[j]);
      if (n !== head) {
        badRows++;
        warns.push(`表格竖线数不一致：${f}:${j + 1} 有 ${n} 个竖线，表头 ${head} 个 → 该行会多出坏单元格（静默排版损坏）`);
      }
    }
    i = j - 1;
  }
  if (tables) notes.push(`${f}: ${tables} 个表格已核竖线一致性${badRows ? `（${badRows} 行不一致）` : ""}`);
}

/* ---------- 输出 ---------- */
for (const n of notes) console.log("  ok  " + n);
for (const w of warns) console.log(" WARN " + w);
for (const e of errors) console.log(" ERR  " + e);
console.log(
  `\n文档自检：${errors.length} 个错误、${warns.length} 个提醒（扫描 ${scanFiles.length} 份文件、${checked.size} 个路径引用）`
);
process.exit(errors.length ? 1 : 0);
