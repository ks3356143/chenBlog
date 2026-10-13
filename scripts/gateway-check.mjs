/**
 * 网关参数自检（`npm run gateway:check`）
 *
 * 背景：2026-10-13 用户报"怎么老是断"，真因是 DSH 的 pi-ai 适配层把 assistant 的
 * 空 text 块 / 空 system 折返出的空 user 消息原样发给 BytePlus Responses 网关，
 * 被按「message content must contain non-empty text」整条 400 打回（harness.md B-21）。
 * 另一条是 `cordis.patch.yml` 没声明 `reasoningEfforts`，导致模型选择器里思考强度
 * 空面板（B-22）。
 *
 * 本脚本只做**只读自检**，不发任何模型请求、不需要 API key：
 *   ① `cordis.patch.yml` 里每个模型是否声明了 `reasoningEfforts`（且 off 留空、至少一档非 off）
 *   ② `maxTokens` 是否还在危险的高位（256000 会把单回合输出预算顶到上下文边缘）
 *   ③ `dsh-llm-pi-ai` / `pi-ai` 源码里的三道空内容块守卫是否在位（防回归）
 *   ④ `app.asar` 的哈希与已知补丁盘是否一致
 *
 * 退出码：0 = 全过；1 = 有 FAIL。⚠️ 这是**自检**不是门禁：它只报告，不改任何东西。
 */
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { homedir } from "node:os"

const results = []
const ok = (name, detail) => results.push({ name, pass: true, detail })
const bad = (name, detail) => results.push({ name, pass: false, detail })

const PROFILE = join(homedir(), ".dsh", "profiles", "desktop", "cordis.patch.yml")
// DSH 安装目录：允许用环境变量覆盖（换机器/换盘时不必改脚本）
const RES = process.env.DSH_RES_DIR ?? join("D:\\programs\\deepseek harness", "dsh", "resources")
const ASAR = join(RES, "app.asar")

// ---------- ① ② cordis.patch.yml ----------
if (!existsSync(PROFILE)) {
	bad("cordis.patch.yml 存在", `未找到 ${PROFILE}（不在本机或路径变了）`)
} else {
	ok("cordis.patch.yml 存在", PROFILE)
	const yml = readFileSync(PROFILE, "utf8")
	const lines = yml.split(/\r?\n/)

	// 逐模型解析：缩进 10 空的 `- id:` 是一个模型起点，其后 12 空的字段属于它
	const models = []
	let cur = null
	let inProviderModels = false
	for (const l of lines) {
		if (/^\s{8}models:\s*$/.test(l)) { inProviderModels = true; continue }
		if (inProviderModels && /^\s{10}- id: (\S+)/.test(l)) { cur = { id: RegExp.$1, efforts: null, maxTokens: null }; models.push(cur); continue }
		if (cur && /^\s{12}reasoningEfforts:\s*$/.test(l)) { cur.efforts = {}; continue }
		if (cur?.efforts && /^\s{14}(\w+):\s*(\S*)/.test(l)) { cur.efforts[RegExp.$1] = RegExp.$2; continue }
		if (cur && /^\s{12}maxTokens:\s*(\d+)/.test(l)) { cur.maxTokens = Number(RegExp.$1); continue }
		if (/^\S/.test(l)) inProviderModels = false
	}

	if (models.length === 0) bad("解析出模型", "cordis.patch.yml 里没解析到任何模型（缩进规则变了？）")
	else ok("解析出模型", `${models.length} 个`)

	const noEfforts = models.filter(m => m.efforts === null)
	// claude-haiku-5.5 走 anthropic-messages 协议，effort 由 pi-ai 安装目录自管，
	// 在 cordis.patch.yml 里声明 reasoningEfforts 反而会被判「no wire protocol declares」（harness.md B-22）
	const EXEMPT = new Set(["claude-haiku-5.5"])
	const reallyMissing = noEfforts.filter(m => !EXEMPT.has(m.id))
	if (reallyMissing.length) bad("reasoningEfforts 声明", `缺：${reallyMissing.map(m => m.id).join(", ")}`)
	else if (noEfforts.length) ok("reasoningEfforts 声明", `${models.length - noEfforts.length}/${models.length} 有；${noEfforts.map(m => m.id).join(", ")} 走 Anthropic 协议、按目录自管（B-22 定的例外）`)
	else ok("reasoningEfforts 声明", `${models.length}/${models.length} 都有`)

	for (const m of models) {
		if (!m.efforts) continue
		const nonOff = Object.keys(m.efforts).filter(k => k !== "off")
		if (nonOff.length === 0) bad(`${m.id} 至少一档非 off`, "只有 off 会被判配置错误")
		else if (!("off" in m.efforts)) bad(`${m.id} off 档留空`, "off 必须显式写 `off: null`（省略=用目录默认）")
		else ok(`${m.id} 强度档`, `${nonOff.join("/")}（off 已留空）`)
	}

	const hi = models.filter(m => m.maxTokens !== null && m.maxTokens > 64000)
	if (hi.length) bad("maxTokens 高位", `${hi.map(m => `${m.id}=${m.maxTokens}`).join(", ")} → 建议 ≤64000`)
	else ok("maxTokens", `${models.filter(m => m.maxTokens !== null).map(m => `${m.id}=${m.maxTokens}`).join(", ")}`)
}

// ---------- ③ 源码守卫 ----------
const GUARDS = [
	{
		file: "dsh/node_modules/@earendil-works/pi-ai/dist/api/openai-responses-shared.js",
		needle: 'block.type === "text" && block.text',
		what: "pi-ai：assistant 空文本块守卫",
	},
	{
		file: "dsh/node_modules/@earendil-works/pi-ai/dist/api/openai-responses-shared.js",
		needle: "if (msg.content)\n                    messages.push({",
		what: "pi-ai：user 空串守卫",
	},
	{
		file: "dsh/node_modules/@deepseek-ai/dsh-llm-pi-ai/lib/index.js",
		needle: 'if (block.text) content.push({type:"text",text:block.text})',
		what: "DSH：foreignAssistant 空 text 守卫",
	},
]

// 用 asar 头做偏移定位，只读目标文件（不依赖外部 asar 库）
function readFromAsar(inner) {
	const buf = readFileSync(ASAR)
	const jsonLen = buf.readUInt32LE(12)
	const header = JSON.parse(buf.subarray(16, 16 + jsonLen).toString("utf8"))
	const base = 16 + jsonLen
	const flat = new Map()
	const walk = (n, pre) => {
		for (const [k, v] of Object.entries(n.files ?? {})) {
			const q = pre ? `${pre}/${k}` : k
			if (v.files) walk(v, q)
			else flat.set(q, v)
		}
	}
	walk(header, "")
	const e = flat.get(inner)
	if (!e) return null
	const s = base + Number(e.offset ?? 0)
	return buf.subarray(s, s + Number(e.size)).toString("utf8")
}

for (const g of GUARDS) {
	let src = null
	try { src = readFromAsar(g.file) } catch { /* 读不到就走备份副本 */ }
	if (src === null) {
		bad(g.what, `读不到 ${g.file}`)
		continue
	}
	if (src.includes(g.needle)) ok(g.what, "在位")
	else bad(g.what, `守卫不在 ${g.file} —— 可能被更新覆盖了，需重打补丁`)
}

// ---------- ④ asar 哈希 + ⑤ 补丁资产 ----------
try {
	const { createHash } = await import("node:crypto")
	const h = createHash("sha256").update(readFileSync(ASAR)).digest("hex").toUpperCase()
	const PATCHED = "DAA967F7B1BA4522DF245B3B66296B774511C912BF48F3B365B64A83E10988A2"
	const ORIGINAL = "7CCDCFFF8585D5D37F653F868063B5D4D2C2D77AC72DB692554DFF9A4E8A9D52"
	if (h === PATCHED) ok("app.asar 补丁状态", "已是补丁盘")
	else if (h === ORIGINAL) bad("app.asar 补丁状态", "还是未打补丁的原盘（B-21 修复未生效）")
	else bad("app.asar 补丁状态", `哈希既不是补丁盘也不是原盘：${h.slice(0, 16)}…`)
} catch (e) {
	bad("app.asar 补丁状态", e.message)
}

// 补丁资产：DSH 升级覆盖 asar 后，靠这两份仓库文件重打（harness.md B-21）
const PATCH_TOOL = join(process.cwd(), "scripts", "dsh-patch.mjs")
const PATCH_DEF = join(process.cwd(), "scripts", "dsh-pi-ai-patches.json")
if (existsSync(PATCH_TOOL) && existsSync(PATCH_DEF)) {
	ok("补丁资产齐全", "scripts/dsh-patch.mjs + dsh-pi-ai-patches.json（升级后跑 npm run dsh:patch 重打）")
} else {
	bad("补丁资产齐全", `缺 ${!existsSync(PATCH_TOOL) ? "dsh-patch.mjs" : "dsh-pi-ai-patches.json"}`)
}

// ---------- 输出 ----------
const width = Math.max(...results.map(r => r.name.length), 10)
console.log("\n网关参数自检（只读，不发请求、不需要 key）\n")
for (const r of results) {
	console.log(`  ${r.pass ? "✅" : "❌"} ${r.name.padEnd(width)}  ${r.detail}`)
}
const fails = results.filter(r => !r.pass).length
console.log(`\n${results.length} 项，${fails} 项未过${fails === 0 ? " —— 全部通过" : ""}\n`)
process.exit(fails === 0 ? 0 : 1)
