/**
 * asar 等长原地补丁工具（`node scripts/dsh-patch.mjs <patches.json> [--apply]`）
 *
 * 背景：2026-10-13 用户反复报 opendesign"怎么老是断"。真因是 DSH 的 pi-ai 适配层会把
 * assistant 的空 text 块、空 system 折返出的空 user 消息原样发给 BytePlus Responses 网关，
 * 被按「message content must contain non-empty text」整条 400 打回（harness.md B-21）。
 * 修法是**等长原地替换** asar 内两个文件的字节区间：`size` 不变 → asar header 完全不动。
 *
 * ⚠️ 为什么必须"等长原地"而不是重新打包（三条硬教训，全在 B-21）：
 *   ① 原 asar 的 sumSize(355MB) > 文件体积(121MB)：`libreoffice-kit.exe`(178MB) /
 *      `libvips-42.dll`(19MB) / `onnxruntime.dll`(17.8MB) 的 offset 是 undefined ——
 *      它们是 `app.asar.unpacked/` 里的条目，asar 只留索引没有正文。按 size 去 subarray
 *      读它们会越界，重新打包出来 315MB（2.6 倍）的坏文件。
 *   ② 同一 asar 的多个文件补丁必须叠在同一个工作副本上，否则后一个覆盖前一个。
 *   ③ 校验"目标区间外字节一致"时要排除**所有**已声明区间，否则误报 drift。
 *
 * 用法：
 *   node scripts/dsh-patch.mjs scripts/dsh-pi-ai-patches.json            # 预演（不写盘）
 *   node scripts/dsh-patch.mjs scripts/dsh-pi-ai-patches.json --apply    # 写出 <asar>.patched-new
 *
 * ⚠️ **不会覆盖运行中的 app.asar**（会被 EPERM 挡，且那是保护）：只写 `<asar>.patched-new`，
 *    由使用者在退出 DSH 后自行替换。DSH 每次升级都会覆盖 asar → 补丁会丢 → 重跑本工具即可。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { createHash } from "node:crypto"
import { homedir } from "node:os"
import { join } from "node:path"

const DEFAULT_ASAR = join("D:\\programs\\deepseek harness", "dsh", "resources", "app.asar")

/** 读 asar 头部，展平成 path -> {offset,size} */
function readAsarIndex(buf) {
	const jsonLen = buf.readUInt32LE(12)
	const header = JSON.parse(buf.subarray(16, 16 + jsonLen).toString("utf8"))
	const base = 16 + jsonLen
	const flat = new Map()
	const walk = (node, pre) => {
		for (const [k, v] of Object.entries(node.files ?? {})) {
			const p = pre ? `${pre}/${k}` : k
			if (v.files) walk(v, p)
			else flat.set(p, v)
		}
	}
	walk(header, "")
	return { jsonLen, base, flat }
}

const patchesPath = process.argv[2]
const apply = process.argv.includes("--apply")
if (!patchesPath) {
	console.error("用法: node scripts/dsh-patch.mjs <patches.json> [--apply]")
	process.exit(2)
}
const spec = JSON.parse(readFileSync(patchesPath, "utf8"))

// 同一 asar 的工作副本只建一次（硬教训②）
const work = new Map()
for (const g of spec) {
	const asarPath = g.asar === "DEFAULT" ? DEFAULT_ASAR : g.asar
	if (!existsSync(asarPath)) {
		console.error(`[fatal] 找不到 asar: ${asarPath}`)
		process.exit(2)
	}
	const orig = readFileSync(asarPath)
	if (!work.has(asarPath)) work.set(asarPath, { orig, out: Buffer.from(orig) })
	const { orig: origBuf, out } = work.get(asarPath)
	const { base, flat } = readAsarIndex(origBuf)

	// 本 asar 的全部目标区间（供校验时排除，硬教训③）
	const ranges = spec.filter(s => (s.asar === "DEFAULT" ? DEFAULT_ASAR : s.asar) === asarPath).map(s => {
		const e = flat.get(s.inner)
		if (!e) return null
		const a = base + Number(e.offset ?? 0)
		return [a, a + Number(e.size)]
	})
	if (ranges.some(r => r === null)) {
		console.error(`[fatal] 有补丁指向 asar 里不存在的文件`)
		process.exit(2)
	}
	const inAnyRange = i => ranges.some(([a, b]) => i >= a && i < b)

	console.log(`\n[asar] ${asarPath}`)
	console.log(`       sha256=${createHash("sha256").update(origBuf).digest("hex").slice(0, 16)} bytes=${origBuf.length}`)

	for (const p of g.patches) {
		const e = flat.get(g.inner)
		if (!e) { console.error(`[fatal] 找不到 ${g.inner}`); process.exit(2) }
		const start = base + Number(e.offset ?? 0)
		const size = Number(e.size)
		const find = Buffer.from(p.find, "utf8")
		const repl = Buffer.from(p.replace, "utf8")

		if (repl.length !== find.length) {
			console.error(`[fatal] 不等长：replace ${repl.length} != find ${find.length} —— ${p.note}`)
			process.exit(3)
		}
		const region = out.subarray(start, start + size)
		const i = region.indexOf(find)
		if (i === -1) {
			// 已经打过补丁了：replace 已在 → 这不是错误，是"无需重打"
			if (region.indexOf(repl) !== -1) {
				console.log(`  [skip] 已是补丁后状态 —— ${p.note}`)
				continue
			}
			console.error(`[fatal] 找不到目标片段，且也不是已打补丁的状态 —— ${p.note}`)
			console.error(`        可能 DSH 升级后这段源码被改过，需要重新核对 find 片段。`)
			process.exit(4)
		}
		if (region.indexOf(find, i + 1) !== -1) {
			console.error(`[fatal] 目标片段出现多次，不唯一 —— ${p.note}`)
			process.exit(5)
		}
		repl.copy(region, i)
		console.log(`  [ok] +${i} 等长替换 —— ${p.note}`)
	}

	let drift = -1
	for (let i = 0; i < out.length; i++) {
		if (inAnyRange(i)) continue
		if (out[i] !== origBuf[i]) { drift = i; break }
	}
	if (drift !== -1) { console.error(`[fatal] 区间外字节漂移于 ${drift}`); process.exit(6) }
	console.log(`  [verify] 目标区间外逐字节一致（${out.length} B，${ranges.length} 个已声明区间）`)

	if (apply) {
		const dest = asarPath + ".patched-new"
		writeFileSync(dest, out)
		console.log(`  [write] ${dest}`)
		console.log(`          sha256=${createHash("sha256").update(out).digest("hex")}`)
	}
}

console.log(apply ? "\n[apply] 完成。退出 DSH 后把 .patched-new 覆盖成 app.asar 再启动。" : "\n[dry-run] 通过，未写盘。加 --apply 才写出。")
console.log("[hint] 原盘备份：Copy-Item app.asar app.asar.bak-before-<日期>；回滚就是覆盖回去。")
