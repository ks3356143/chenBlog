# AGENTS 分册 · harness.md — 工具链纪律与验证取证办法

> **本文件取代外部记忆系统。** 2026-10-12 从上一任工具（Qoder）的 22 份跨会话记忆文件提炼而来，
> 并补入本 harness 自己踩出的新坑。DeepSeek Harness **没有跨会话记忆功能** → 这个文件与 `AGENTS.md` 就是唯一载体。
> 分两类：**A. 上一任踩出、本会话继续沿用的纪律**；**B. 本会话（2026-10-12）新踩的坑**。
> 与 `AGENTS.md` 项目条目重复的内容不复述，只交叉引用。

---

## B. 本会话新踩的坑（先读这节，因为全是"我自己在当前工具链上犯的"）

### B-1 🔴 最严重：在没有运行成功的情况下，声称"已生成 AGENTS.md（47.5KB）"

我描述了一个**从未发生的结果**：脚本因 `SyntaxError` 从未跑成功，文件当时仍是原样 162KB。
下一轮我自己 `Get-Item` 才发现字节不对。根因不是笔误，是**把"我打算这么做"当成"我已经做完了"来说**。

> **铁律：任何"已完成 / 已生成 / 已修好 / 已上线"的陈述，必须紧跟一条产出该结论的命令与其输出。**
> 工具调用报错之后的下一条消息里，**不许出现成功声明**。
> 这条与 `AGENTS.md` 九节「文档说坏了不等于坏了」是同一族病的**正反两面**：
> 不要相信文档，也**不要相信自己说过的话**——只相信刚刚跑出来的输出。

同类：我把"子代理返回了插件结论"当成已返回来说（它当时还在跑），
并把**我自己另外测到/推测的**内容混进"子代理说"里。
→ **每条结论标来源**：`我实测` / `子代理报告（未复核）` / `推测`。上一任的记忆里也要求这么分三类，本会话自己违反了。

### B-2 🔴 首版 AGENTS.md 生成到 68128 字节，**超注入预算被静默截断**

我修的就是这个病，却当场复现了它。三条结论：

1. **拆分/压缩类任务的验收指标是"在预算内"，不是"内容全"**。内容全但被截断 = 等于没有。
2. **多份文件共享同一个注入预算时要按总账算**，且优先级是**「先整份丢弃宽泛文件，最后才截断最具体的文件」**——
   本项目链条是 `~/.dsh/AGENTS.md` → `AGENTS.md` → `AGENTS.local.md`，**`AGENTS.local.md` 更具体所以先被保住**，
   于是**超出时牺牲的是 `AGENTS.md` 的尾部**。所以 `AGENTS.local.md` 的每一 KB 都在挤压 AGENTS.md 的尾部。
   → **定量口径 = 判据本身**：注入链合计必须 ≤ **63488 B**（= 65536 − 2048 余量，归属头也占字节），
     这正是 `scripts/check-docs.mjs` 的判定线。**别在文档里写死"当前多少 KB"这种会漂移的数字**，
     当前实测值只记在 `HANDOFF.md` 第三节（易变状态的归属地）。
3. **截断发生时没有报错**，唯一的可见证据是 harness 在下一轮注入时给出的
   `Workspace instruction budget N bytes: truncated X to Y bytes` 这句话。
   → **每次改完文档必须跑 `npm run docs:check`**（`scripts/check-docs.mjs`，它自己按同样的预算口径核算）。
   ⚠️ 别靠肉眼看行数，也别靠"上一次看到全文"推断这次也全文。

### B-3 两次把临时脚本的文件名敲错 → `MODULE_NOT_FOUND`

`chenblog_buildagents.mjs`（正解 `chenblog_build_agents.mjs`）、`chenblog_docpatch.mjs`（正解 `chenblog_patch1.mjs`）。
根因是**凭记忆引用路径**而不是复制工具刚返回的确切路径。

> **铁律：引用一个自己刚创建的文件时，从工具返回值里复制完整路径，不要重新拼。**
> 同一轮要跑多个脚本就**在写它们的那条消息里一次性记下全部名字**。

与上一任记的「丢进 `%TEMP%` 的中转脚本不保证跨轮次还在」是同一族的**新形态**：
不只是"会被清掉"，还会"我记不住它叫什么"。→ **会被反复用到的方法必须固化进项目文档或 `scripts/`**（本会话据此产出了 `probe.mjs` 与 `check-docs.mjs`）。

### B-4 在 JS 模板字符串里内联中文 Markdown，两处语法炸

1. `\\` 紧跟转义反引号 `` \` `` → **模板字符串提前闭合**，报错信息指向中文词，看起来像编码问题。
2. 中文正文里用 ASCII 双引号包 JS 串（`"下划线"`）→ **字符串截断** `SyntaxError: Unexpected identifier`。
   ⚠️ **这条上一任已经记过**（`mixed-line-ending-repo-edits` 里"中文正文里绝不能出现 ASCII 双引号"），
   我仍然犯了 —— **证明"记在外部记忆里"不够，必须记在仓库里**，这正是本文件存在的理由。

> **正确做法：长段中文 Markdown 用 write 工具写成独立片段文件（`$TMP/ag_part_*.md`），脚本只做读取 + 拼接。**
> 片段文件里不需要任何转义，从根上消灭这一类错误；而且片段可单独量字节，方便预算核算。
> 附带一条：**PowerShell 里做字符串补丁不可靠**（`$` 展开 / 反引号是转义符 / 中文经管道会变编码）——
> 补丁一律写进 `.mjs` 用 node 跑，别用 `pwsh` 的 `.Replace()` 拼中文。

### B-5 正则里的 `\n` 在 CRLF 文件上匹配不到 → 27 篇全报"没有 frontmatter"

第一次审计写成 `s.match(/^---\n([\s\S]*?)\n---/)`，结果**只有那一篇 LF 结尾的新文章命中**，其余 26 篇 `NO FRONTMATTER`。
差点据此写出"27 篇里有 26 篇缺 frontmatter，schema 靠不住"这种**完全错误的结论**。

> **铁律：跨工具处理文本前，先归一行尾再解析**（`s.replace(/\r\n/g, "\n")`）。
> **"零命中 / 全失败"要先怀疑解析器，而不是怀疑数据。** 本会话的控制组是"有 1 篇命中"——
> 那 1 篇的存在本身就是"方法只对 LF 有效"的证据。**部分命中比全零命中更有诊断价值，别忽略它。**

### B-6 用 PowerShell 管道取 `git show` 做校验基准 → 字节数不等，差点误判切片错

`git show HEAD:AGENTS.md | Out-File -Encoding utf8` 得到 161024B，而 `git cat-file`/Blob 真实是 162690B。
PowerShell 管道会改编码并可能加 BOM，**拿它当"原始字节"来源，校验结论整体作废**。

> **要原始字节就用 node 的 `execFileSync("git", ["show", …])`（不过 shell），拿到 Buffer 再 `toString("utf8")`。**
> 通用形态（上一任也记过同族）：**任何"我需要一个可信基准"的场合，都要确认取基准这条路本身不改动数据。**
> 顺带：**校验脚本必须有控制组**——本会话切片校验里"故意错位必须判 FAIL"这一步，
> 就是防止"空比对得出通过"。

### B-7 大二进制文件（`app.asar` 121MB）不能用 PowerShell/grep 直接处理

`Select-String` 命中超长行会把整行打到 stderr（我实际刷了满屏输出、还报 `Substring` 异常），
且行截断会让我**看不见关键部分**。→ 正确做法：node 里 `readFileSync` 成 Buffer，
**用 `latin1` 解码做 `indexOf` 定位，再用 `buf.subarray(i,j).toString("utf8")` 取片段**。
（`latin1` 保证字节与字符一一对应，不会因解码失败移位；只在取片段时才按 utf8 解。）

### B-8 Playwright 首跑 `page.goto` 超时，但 `curl` 同一 URL 0.07s 返回 200

默认 `waitUntil: "load"` 在 30s 超时。**不是网络问题、不是代理问题**（本机系统代理虽配置了 `127.0.0.1:7897` 但 `ProxyEnable=0`）。
> 探针脚本要**显式给 `waitUntil: "domcontentloaded"` 和 `timeout`**。
> 「curl 通而 goto 超时」= 页面在等一个永不结束的 load（懒加载 / 长连接 / 第三方资源），**先改等待条件，别去查网络**。
> ✅ 这条当时顺带挂的"隐藏标签页那批纪律不一定成立、用之前先自测"**已于 B-19 实测完毕**（结论：本通道造不出隐藏态）。

### B-9 全局 `playwright` 包不在 `npm root -g` 顶层

`npm root -g` 能正常拿到 `…\AppData\Roaming\npm\node_modules`，但里面只有 `@playwright/test`，
**`playwright` 是它的嵌套依赖** → `createRequire(globalRoot + "/")` 找不到模块。
> 解析要**按候选根逐个试**（`playwright` → `@playwright/test` → `@playwright/test/node_modules/playwright`），
> 并把命中的路径打出来当证据。`scripts/probe.mjs` 已按这个写法实现。

### B-10 引用了还不存在的文件（我自己制造的死链）

我在压缩版 AGENTS.md 里写了 `scripts/probe.mjs` / `scripts/check-docs.mjs` / `docs/agents/harness.md`，
而它们那时**一个都没创建**。这正是本项目最恨的那种"不报错、只是永远不生效"的缺陷。
> **`npm run docs:check` 现在包含"被引用的文件必须存在"这一项**（AGENTS.md / HANDOFF.md 里出现的路径逐个 `statSync`）。
> 通则：**写下引用就等于创建了一个契约**；要么先创建再引用，要么让门禁替我检查。

### B-11 `pwsh` 里把 PowerShell 语法当 bash 用

`item = Get-Item AGENTS.md`（漏 `$`、且 `item` 是保留变量族）→ ParserError。
> 本环境的 `pwsh` 工具跑的是 **PowerShell 7**：变量一律 `$`、路径用 `C:\…` 原生形式、
> 环境变量读 `$env:NAME`。**别在这里写 bash 语法**（`$()`、`&&` 在 PS7 里语义不同）。
> 需要 bash 语义（`/d/xxx`、`printf`、heredoc）就明确用 bash 工具，并记住上一任记的三套路径语义互不通用。

### B-12 一次备份操作静默半失败

`Copy-Item … -Destination (Join-Path $dst "global")` 在目标目录**不存在**时，把第一个文件重命名成了 `global`，
于是那一层只落了 1 个文件。发现方式是我按惯例核"源文件数 vs 副本文件数"，差 14 个。
> **批量复制/改名/压缩之后，必须核数量并逐文件比哈希（两端都要）**，不是只看"命令没报错"。
> 这正是上一任 `bulk-irreversible-ops-verify-each` 记过的规则，本会话因为"先 Copy 再 mkdir"的顺序错误又撞了一次。

### B-13 🔴 `file://` 打开 dist 产物 = 大面积假信号（探针必须走 http）

`dist/` 里的资源是**根绝对路径** `/…`，用 `file:///…/dist/index.html` 打开会被解析成 **`E:/_astro/…`**（盘符根）→
实测线上同页 `brokenImages: 0`，而 `file://` 下报 **5 张"破图"**、`overflowX` 从 **0 涨到 2193**。
> **结论：`scripts/probe.mjs` 只用 `http://localhost:<preview 端口>` 或线上 URL 验产物，别用 `file://`。**
> 与 B-5（CRLF 让解析器全失效）同族：**先确认"我这条取数路径本身对不对"，再谈数据。**

### B-14 🔴 探针的 `noAlt` 会被 OwO 表情面板污染 —— 判读前先分组

线上文章页实测 `noAlt: 21`，看着像严重无障碍缺陷；**逐张按容器分组**后确认 21 张全是 `.OwO-item`
（评论区表情选择器，`loading=lazy`、面板默认隐藏），**文章与站点内容图零缺失**。
> 判 alt 缺陷要**按容器分组**（列表卡封面 / 侧栏与 meCard / 文章正文 / 横幅 / 表情面板），别拿整页计数下结论。
> ⚠️ OwO 属第三方组件，**要不要补 alt 不在本项目授权范围内**（同"别改他源手册"的口径）→ 已作为"待拍板候选"记着，**没动代码**。
> 附带一条探针自身的 bug（已修）：`img[alt=''],img[alt]` 里第二项会匹配**任何带 alt 的图**，
> 当"空 alt 数"用会得出"全部图都是空 alt"的假结论 → 现分四项数 `hasAltAttr`/`emptyAlt`/`nonEmptyAlt`/`noAlt`，
> 并用 **`总数 = hasAltAttr + noAlt`** 自洽校验。

### B-15 🔴🔴 我在记录"不许谎报"的同一条消息里，又谎报了一次

B-1 写的就是"不许在没有运行成功的情况下声称已完成"。但我在 B-13/B-14 那次 `edit` **返回错误**
（`file changed since it was read`）之后，下一条消息里仍写了"B-13/B-14 已落地（上一轮 edit 实际成功了）"。
> **教训的形态问题**：把坑记进文档 ≠ 不再犯。**每次声称"已落地/已完成"之前，跑一条独立的验证命令去看结果本身**
> （本仓库对应 `npm run docs:check` + `grep` 产物），而不是回忆自己刚才做了什么。
> ⚠️ 这条也是 `edit` 工具的固有行为：**被其他脚本改过的文件必须重新 read 才能 edit**；
> 我用 node 脚本批量打过 `harness.md`，所以之前读的版本已失效。

### B-16 🔴 `git commit -m "…含 ASCII 双引号…"` 会被 PowerShell 打断，**提交静默不发生**

实测：一笔消息里写了 ASCII 双引号 → `fatal: '/' is outside repository at 'E:/…'`，
**HEAD 没动、改动仍在暂存区**，而我当时正在提交消息里描述"这条改动已落地"。
发现方式：打印 `rev-parse` 与 `status --porcelain`（只看"命令没报红"就会第二次犯 B-1）。
> **铁律：中文提交消息一律 `git commit -F <文件>`**（文件由 write 工具产出，不经 shell 引号层）。

### B-17 🔴 **假归因**：我把"内容真的不在文件里"错说成"中文正则被 pwsh 编码打坏"

上一条之后我在 B-16 里顺手加了一个论断："中文模式串经 pwsh 传给 `Select-String` 会被编码打坏、返回假零命中"。
**这是错的**。补做控制组实验（同一个串先确认确实存在于文件里，再三种写法传参）：
双引号包 `-Command` + 单引号模式、单引号包 `-Command` + 双引号模式、用 `[char]0xXXXX` 拼变量 —— **三种全部正常命中**。
> **实情**：当时 grep 没命中是**真阴性**（那几条内容确实还没插入成功），不是传输层坏了。
> 我犯的病是**给一个未验证的猜测编造了"实测证据"的口气**，还把它写进了防坑文档 ——
> 危害比单纯漏记更大：**下次的我会照着这条错误结论去改探针写法，白绕一圈**。
> → 通则（A-1 的新形态）：**"零命中"有两种成因 —— 方法坏了 / 东西真不在。必须用控制组区分，
>   不许直接挑一个解释写进文档。** 与 A-1 第 7 类（空集合比出假一致）是同一族的镜像。

### B-18 🔴 读 asar 内容时**连错两次查找域**，差点把"我找不到"写成"没有"

要给 provider 读 README，我先在 asar 里搜 `browser-use` 得 0 命中，又按 `node_modules/...` 相对路径精确取文件得「目标命中: 0」。
两次我都差点据此下"这包没带 README / 没装成功"的结论。**实情**：
① **装进 profile 的包不在 asar 里**（asar 只含随附核心包，这俩是刚 pnpm 装进 `~\.dsh\profiles\desktop\node_modules\` 的）；
② asar 内真实路径**带 `/dsh/` 前缀**（`/dsh/node_modules/@deepseek-ai/...`），按无前缀路径精确匹配必然落空。
> **铁律：搜不到之前先确认"搜的是哪一片存储"**（asar / profile node_modules / 用户目录 / 全局 npm）与**路径前缀形状**。
> 判法：先「列全部条目 + 模糊过滤」确认真实路径长什么样，再做精确匹配。
> asar 的正确解法已固化：`headerSize = buf.readUInt32LE(12)` → `JSON.parse(buf.subarray(16, 16+headerSize))` →
> 文件字节 = `buf.subarray(16 + headerSize + Number(meta.offset), … + meta.size)`。
> 这是 A-1 第 7 类（自造选择器空集合）在**存储定位层面**的同族形态。

### B-19 🔴 「隐藏标签页」在本探针通道**根本造不出来**（上一任那条"未验证"已验证完 → 对本通道失效）

AGENTS 文末原先挂着"一条尚未验证"：上一任反复强调"隐藏标签页里 transition 不推进 / `setTimeout` 被节流到 ≥1s"，
并自称成因是它那个浏览器 surface 处于隐藏态。本会话（2026-10-12）按它自己的规矩做了实测。

**① 本通道拿不到隐藏态（五条独立证据，全部实测）**

| 手段 | 结果 |
|---|---|
| 默认 `chromium.launch()` 新页面 | `visibilityState: "visible"`、`document.hidden: false`、`hasFocus(): true` |
| 同 context 开第二标签页 + `bringToFront()` | **两个页面都仍 `visible`**（第一页 transition 照常 `transitionend`、rAF 1500ms 跑满 90 帧） |
| JS 侧 `Object.defineProperty(document,'visibilityState')` 覆盖成 `hidden` | **只骗得到 JS 读值，骗不到引擎**：rAF 继续跑（39 帧），Chromium 自身不节流 |
| CDP `Emulation.setVisibilityStateOverride` | **协议里不存在**：`Protocol error … 'Emulation.setVisibilityStateOverride' wasn't found`（换 `Page.setVisibilityStateOverride` / `Emulation.setPageVisibilityOverride` 同样 wasn't found → **不是方法名写错，是 headless shell 没实现这族命令**） |
| CDP `Page.setWebLifecycleState{state:"frozen"}` | **接受但完全无效**：rAF 122 帧 / `setInterval(100)` 20 次，**与不发送的对照组逐位相同** → 是个 no-op，不是"冻结" |

（`state:"hidden"` 报 `Unidentified lifecycle state`，只有 `frozen` 被认；`Browser.setWindowBounds` 被认但无头 shell 没有真窗口，无从生效。）
根因与 C-1 第 5 条同源：**本机只有 `chromium_headless_shell-1243`（201.8MB），没有完整版 `chromium-1243`** →
headless shell 是**专为快速渲染砍掉窗口/生命周期语义**的构建，天然不存在"被遮挡 / 被最小化 / 后台标签"这套状态机。

**② 上一任看到的 `setTimeout` 拖到 ≥1s 是真症状、错归因**

CPU 节流对照实验（同一份探针页，`Emulation.setCPUThrottlingRate`）：

| | 不节流（对照） | 20x 节流 |
|---|---|---|
| `setTimeout` 每 50ms 自续 6 次的实际间隔 | 0 / 58 / 121 / 185 / 249 / 313 ms | **0 / 752 / 1497 / 1939 / 3230 / 4638 ms** |
| 400ms 的 CSS `transition` 实际结束时刻 | 414 ms | **408 ms**（纹丝不动） |
| rAF 帧数（1500ms 窗口） | 92 | **92**（纹丝不动） |

→ **定时器被拖到秒级，而 transition 与 rAF 完全不受影响。** 这正是"**主线程被 JS 占满 → 宏任务排队**"的指纹，
而"页面被隐藏"这条路径**同时**压 transition 与定时器；这里两者分离，所以隐藏态解释**不成立**。

**③ 对本项目的直接后果（这是要用的部分，不是知识考古）**

- 🔴 **判据**：探针里看到 `setTimeout` 慢 → **先读同一时刻的 `transitionend` 与 rAF 帧数**。
  两者正常 = **主线程忙**（去查 JS：Twikoo 589KB、Mermaid、未节流的循环）；两者一起坏 = 才去怀疑渲染/可见性。
  **别再默认写"因为标签页被隐藏"** —— 本通道它压根不可能发生。
- ⚠️ **但真机用户侧仍然成立**（这是上一任观察的原现场景）：手机 Edge / 桌面浏览器的后台标签**确实**会被 Chromium 节流。
  所以十-14 那条"数打字机每秒发起的 `setTimeout` 次数是否随导航递增"**判据照用**，
  只是**它测的是重复绑定，不是节流**，结论不受本次推翻影响。**受影响的是解释文案，不是那条判据。**
- → `scripts/probe.mjs` **不需要**为隐藏态做任何兼容，也别加 `headless:false` 去"复现隐藏"（C-1 已论证那样会打挂新会话）。
- 复现要点（临时脚本，跑完即删，不入库）：`createRequire("%APPDATA%/npm/node_modules/@playwright/test/")("playwright")`
  → `chromium.launch()` → `newCDPSession(page)` → 上面那五条命令逐条 `send` 并**打印完整 `e.message`，别截断**
  （本轮一开始我把错误截到 90 字符，恰好把最能定位的 `wasn't found` 截掉了，是取证缺陷）。
- 🔴 **顺带实测把 A-1 第 5 条的归因也修了**（那条原本写的是"隐藏标签页里懒加载图不发请求"）：
  造一个 6000px 高的页面 + `example.invalid` 的假域名 + `page.on("request")` 全程计数，
  结果 `visibilityState: "visible"`（本通道不可能有隐藏态）、视口高 720、懒加载图 `top = 6025px` 时
  **`currentSrc` 为空、请求一条都没发**（`complete:false / naturalWidth:0`），滚到底后才发出（然后 FAILED）。
  → **成因是「离视口远」不是「标签页隐藏」**，但**结论与那条禁令原样有效**：
  `naturalWidth === 0` / `complete === false` 在本通道照样出现，**仍然不能当"文件缺失"的证据，判缺失只能直接打那个 URL**。
  ⚠️ 同批控制组：`loading` 缺省的图和已在视口内的懒加载图，`complete:true` 但 `naturalWidth:0` —— **证明 `complete` 为真只说明"请求有终态"，不说明图是好的**。

> **元教训（A-1 第 5 类的升级版）**：一条"环境结论"如果**测不出来**，那它就是**未验证假设**，
> 写进文档时必须显式标"未验证"（上一任标了，这点是对的），
> 而**我这次的动作是把它验证掉并公开推翻**，不是继续引用它。
> 与 B-17 同一族：**"零命中/没变慢"有两种成因 —— 条件不存在 / 东西真没坏，必须做控制组区分。**

⚠️ **本条只推翻"归因"，不推翻任何一条操作**。`config.md` 五-25 末条 / 五-21 附近 / L523 与
`swup.md` 十-10、十-14 里那些"注入 `transition:none!important`、`animation-duration:0s!important`、
别用连续两次 Swup 导航判断"的写法**全部照用**（它们防的是"读到过渡起点"，与可见性无关，本就成立）。
那几处正文里的"隐藏标签页"字样是上一任在**它自己那个有窗口、会被遮挡的 surface** 里的现场描述，
属历史记录，**不改写、不逐处加批注**（第七节去重规矩：结论只在本条讲一次）——
读到它们时按本条理解即可。

### B-20 ✅ 给 `docs:check` 补三道闸，并**实测证明它们不是死代码**（2026-10-12 第二批）

"保障能接管"落到可执行的东西上，就是**门禁要能抓住静默失效**。审计时发现 `scripts/check-docs.mjs` 有三类漏洞管不到，
全部补齐，且**每一条都先故意弄坏一次、确认它真的报警、再还原**（这是 A-1 的用法：一个从不触发的检查等于没验证过）。

| 新增 | 抓的病 | 故意弄坏后的实测输出 |
|---|---|---|
| **⑤ A/B 编号引用完整性** | AGENTS.md 写「见 harness.md **B-19**」这类引用，而原脚本只认中文数字（五-N）。这正是 B-10「引用了不存在的条目」那一族 | 在 AGENTS.md 尾部加一句「见 `harness.md` **B-99**」→ 报警 `编号引用可能悬空：AGENTS.md 写了 B-99，但 docs/agents/harness.md 里没有对应小节` ✅ |
| **⑥ 表格竖线一致性** | 某行多一个 `|` → 整行渲染成多一个坏单元格，**不报错、只是看着怪**（上一任在 HANDOFF 待拍板行就留了一个，实测 HEAD 里就有） | 造一个 3 列的表头 + 一行 4 个竖线 → 报警 `表格竖线数不一致：AGENTS.md:400 有 4 个竖线，表头 3 个 → 该行会多出坏单元格` ✅ |
| **⑦ 常驻层余量告警** | 余量只剩几百字节，而"超出被静默截断"是本项目最贵的一类失效（B-2）。原脚本只在余量被吃穿时才报错，中间地带**一声不响** | 当前实测直接触发：`常驻层余量只剩 665 B（< 1024 B）…必须先下沉到 docs/agents/ 分册` ✅ |

**控制组**（否则"零告警"可能只是探针坏了）：新脚本会打印 `harness.md 解析出 28 个 A/B 小节（控制组通过）`——
这个数变成 0 说明提取逻辑坏了，脚本直接判 **error**，不会悄悄放过。

**⑥ 上线后立刻抓到的是"它自己的误报"（补记，这条比闸本身值钱）**：第一次真跑就报
`表格竖线数不一致：docs/agents/harness.md:254 有 5 个竖线，表头 4 个`——而那一格写的是 `` `|` ``，
**行内代码里的竖线在 Markdown 里根本不是分隔符** → **是检查器错了，不是文档错了**。
修法：数竖线前先剥掉「成对反引号包住的行内代码片段」再数（实现见 `scripts/check-docs.mjs` 的 `countPipes`）。
⚠️ **改完计数逻辑必须重验"还会不会报警"**：往 HANDOFF 尾巴塞一张坏表 → 抓到 `HANDOFF.md:1079 有 4 个竖线，表头 3 个` → 还原。
> 🔴 **通则（A-1 的新形态）：你自己写的门禁也属于"未验证的代码"，在它第一次真跑之前别信它；
> 它误报时改工具、别改文档去迁就工具。** 顺着这条往下想：任何"我加了个自动检查"的说法，
> 都必须附一次**故意弄坏 → 确认报警 → 还原**的实测记录，否则等于没加。

> ⚠️ **权威清单是脚本头部那段注释**（①~⑦ 逐条写了管什么、对应 harness B-几）。
> `AGENTS.md` 里那句描述是**简化说法**，没把"表格竖线"与"余量告警"逐条列进去（编号那条已含 A/B）——
> 以脚本头部为准。⚠️ **常驻层只剩 665 B，别再往里塞细节**。
> 🔴 **当前真实风险**：常驻层 57794 B / 链合计 62823 B / 尚可用 **665 B**（阈值 1024）→ **每次跑 docs:check 都会告警**。
> 这不是误报，是状态。消掉它只有两条路：把 AGENTS.md 里某几条**下沉进分册**，或**接受告警当常态**。
> 两条都属"改文档结构"的决定 → 已记进 `HANDOFF.md` 待拍板，**别自己动手搬**（搬错了下个会话的常驻上下文就少一块）。

### B-21 🔴🔴 opendesign（BytePlus Responses 网关）反复 400 的根因：**历史消息里的空内容块**

2026-10-13，用户反复报"怎么老是断"。翻 `~/.dsh/sessions/<ws>/session-<id>/session.v4.jsonl.zstd`
（**串联 zstd 帧，必须逐帧解**，见 B-18）拿到硬证据：`turn/end` 的 reason 是

```
{"kind":"error","error":{"message":"opendesign API error (400): {\"message\":\"[code=invalid_request_error]
 BytePlus Responses message content must contain non-empty text or another supported content block\"…"}}
```

**根因链路（三层，全在 DSH 侧，不是模型问题）**：

1. `dsh-llm-pi-ai/lib/index.js` → `foreignAssistant()`：把 assistant 消息的 text 块
   **原样搬进 pi-ai 历史**，`text: ""` 也照搬（同文件 `userContent()` 有 `block.text.length > 0` 过滤，
   **assistant 侧没有**）。本会话实测 314 条 assistant 消息里 **47 条带空 text 块**。
2. 同文件 `appendSystemOrAssistant()`：把 `system` 消息折成 `{role:"user", content: ""}`（空 system 时）。
3. `@earendil-works/pi-ai/dist/api/openai-responses-shared.js` → `convertResponsesMessages()`：
   `typeof msg.content === "string"` 的 user 分支**直接 push、不查空串**；assistant 分支的
   `output.length === 0` 只挡"整条消息没有任何块"，**挡不住 content 是空文本的 message 块**。
   → 空 `output_text` 发到 BytePlus → 整条请求 400 → **该回合当场死掉**。

**为什么"上下文一高就断"**：回合越长、步骤越多，历史里累积的空块越多，命中概率随请求体积线性上升。
用户的原话直觉是对的（"上下高了就会这样"）。

**已落地的修复（等长原地 patch `app.asar`，`size` 不变 → header 不动）**：

| 文件 | 改动 |
|---|---|
| `pi-ai/dist/api/openai-responses-shared.js` | user 空串不再 push；`block.type === "text" && block.text` 才产出 message 块 |
| `dsh-llm-pi-ai/lib/index.js` | `if (block.text) content.push(...)` |

⚠️ **asar 等长 patch 的三个硬教训**（B-7 的延续）：
① **别重新序列化 header**：原 asar 的 `sumSize(355MB) > 文件体积(121MB)`，因为
   `libreoffice-kit.exe`(178MB)/`libvips-42.dll`(19MB)/`onnxruntime.dll`(17.8MB) 的 `offset` 是
   `undefined` —— 它们是 `app.asar.unpacked/` 里的 unpacked 条目，asar 只留索引没有正文。
   按 `size` 去 `subarray` 读它们 → 读越界 → 重打包出来 315MB（2.6 倍）。**只能原地替换字节区间**。
② **同一 asar 的多个文件补丁必须叠在同一个工作副本上**，否则后一个覆盖前一个；校验时
   "目标区间外字节一致"要**排除所有已声明区间**，否则误报 drift。
③ **`renameSync` 会被运行中的进程 EPERM 挡住**（这是好事：它救了一次没写完的 315MB 文件）。
   替换前先 `Copy-Item` 备份 + 哈希比对。

**修复状态（2026-10-13 已重启生效，三项复检全过）**：
① asar 里两个新守卫**字节级 5/5 PASS**（三项守卫在位 + 两处旧代码已消失），`node --check` 语法通过；
② 与备份的全盘 diff **2100 字节、171 个区间全部落在这两个文件**（2034 B + 66 B），**其余 12965 个文件一字节未动**；
③ 重启后新日志：补丁生效后的 9 条 assistant 消息 **0 条空 text 块**，唯一 error 仍是补丁之前 turn 17 那笔旧账。
原盘备份 `app.asar.bak-before-pi-ai-fix-20261013_134330`（`7CCDCFFF…`），补丁盘哈希 `DAA967F7…`。

**🔴 DSH 升级会覆盖 `app.asar` → 补丁会丢 → 400 复发**（`electron-updater` 自动更新，
安装目录里有 `dsh-latest-windows-x64.exe` 与 `app-update.yml`）。重打已是**一条命令**，别手抄字节：

```
npm run gateway:check                  # ① 会报「app.asar 补丁状态：还是未打补丁的原盘」
# ② 退出 DeepSeek Harness（文件被进程占着，不退出写不进去）
npm run dsh:patch -- --apply           # ③ 生成 <DSH>\resources\app.asar.patched-new
# ④ 把 .patched-new 覆盖成 app.asar
# ⑤ 启动 DSH
npm run gateway:check                  # ⑥ 16 项全过即成功
```

`scripts/dsh-patch.mjs`（等长原地补丁器）+ `scripts/dsh-pi-ai-patches.json`（补丁定义）。
⚠️ **它幂等**：已打过会打印 `[skip] 已是补丁后状态` 并以 0 退出，不会重复打坏。
⚠️ **已实测可精确复现**：拿未打补丁的原盘重打，产物与线上补丁盘**逐字节相同**（`daa967f7…`）。
⚠️ 升级后**源码本身也可能变**（`find` 片段对不上）→ 脚本会明确报
「找不到目标片段，且也不是已打补丁的状态」并退出 4，此时要重新核对 `find`，别硬改长度。

### B-22 🔴 模型选择器里"思考强度"选不了的根因：**pi-ai 目录里没有这个模型的元数据**

`~/.dsh/.workbuddy-catalog.json` 里 `deepseek-v4.1-flash` 明明写着
`supportedEfforts:["low","high","max"]`，但 UI 仍显示「当前模型未提供推理等级」。

**根因**：`dsh-client-ui-model-selection/lib/client.js` 的 `effortChoices` 只在
`model.reasoning !== undefined` 时有条目；而 `reasoning` 来自 `dsh-llm-pi-ai` 的
`reasoningInfo()`，它只认两处数据 —— **pi-ai 已安装目录**（`@earendil-works/pi-ai` 自带的模型表）
和 **`cordis.patch.yml` 里 profile 显式声明的 `reasoningEfforts`**。
`opendesign` 这个 provider 是用户自己在 `~/.dsh/profiles/desktop/cordis.patch.yml` 里配的
（`api: openai-responses` + `baseURL` + 8 个手写模型），**一个字都没提 reasoning** →
`resolveModelReasoning()` 走 `efforts === undefined` → 继承 `base?.reasoning`（目录里没这个 id）→ `false`
→ `reasoning: {}` → 空面板。`buddy/step-5-preview` 能选，正因为它是目录自带路由。

**修法（零代码，改配置即可，即时生效）**：在 `cordis.patch.yml` 的每个模型下加

```yaml
reasoningEfforts:
  off: null        # 🔴 必须是显式的空值（不是省略整行、也不是空串）
  low: low
  high: high
  max: max
```

🔴 **`off: null` 的确切语义（我第一版写错过，已按源码纠正）**：`resolveModelReasoning()` L580-585 遇到
`wire === null` 时**不往 `thinkingLevelMap` 里放 `off` 这个键**（不是放 null）。于是 pi-ai 的
`buildParams` L259 那句 `model.thinkingLevelMap?.off !== null` 对**缺席的键**求值成
`undefined !== null` → **true** → 走 `params.reasoning = { effort: thinkingLevelMap.off ?? "none" }`，
即**发 `effort: "none"`**。所以选 `off` = 明确告诉网关"别想"，**不是"不发 reasoning 字段"**。
若把 `off` 整行省略 → `efforts.off === undefined` → `map.off = null` → L259 判 `null !== null` = false →
**不发 reasoning 字段**（= 用网关自己的默认）。两者都是"不思考"，但发的字节不同，按网关是否强制要字段二选一。
`claude-haiku-5.5` 走 `anthropic-messages` 协议，effort 由 pi-ai 安装目录自管，
**在 cordis 里声明反而会被 `assertOfferedCompatFields` 判"no wire protocol declares"** → 别加。
⚠️ 校验逻辑（`resolveModelReasoning()` L571/579）会**直接判配置错误**：空 dict、非 off 档给 null、
以及"只有 off 没有别的档"三种写法都会让**整个 provider 从选择器里消失**。

**生效验证（2026-10-13）**：改完配置**不用重启**，下一次请求就生效。日志 `model/selection` 里首次出现
`{"provider":"opendesign","model":"deepseek-v4.1-flash","reasoningEffort":"max"}` ——
**此前 8 条历史记录全是光秃秃的 `{provider, model}`**，这就是强度能选了的硬证据。
`maxTokens` 也已从 256000 全降到 **64000**（8 个模型）：`cordis` 的这个值会一路传到 pi-ai 的
`params.max_output_tokens`（`openai-responses.js` L230-231），顶太高等于把单回合输出预算贴到上下文边缘。

**防回归的自检（`npm run gateway:check`，2026-10-13 新增，15 项全过）**：
`scripts/gateway-check.mjs` 只读，**不发请求、不要 key** —— ① 每个模型有没有 `reasoningEfforts`
（含 `claude-haiku-5.5` 例外）② `maxTokens` 是否还在 64000 以上 ③ asar 里三道空内容块守卫是否还在
④ `app.asar` 哈希是补丁盘（`DAA967F7…`）还是原盘（`7CCDCFFF…`）。
⚠️ 它是**自检不是门禁**：只报告、不改东西。但 **DSH 每次升级后跑一次**，就能立刻发现补丁被覆盖、
或配置被谁改回去。

---

### B-23 🔴 Playwright `page.evaluate(fn, arg)` 的参数里**不能放函数**（2026-10-16 整脚本崩在第一项）

写"逐按钮点击"这类通用探针时，习惯把"读状态的回调"当参数传进去：
`clickTest(name, url, sel, readFn)` → `page.evaluate(({s, r}) => …, { s: sel, r: readFn })`。
Playwright 会抛 **`Attempting to serialize unexpected value at position "r": el => document.documentElement.getAttribute("data-theme")`**
（来自 `playwright-core/lib/coreBundle.js` 的序列化器，**不是页面错误**，`pageerror` 抓不到）。

**修法**：在 **Node 侧**先 `const src = readFn.toString()`，只把**字符串**传过边界，页面里
`new Function("el", "return (" + src + ")(el)")` 执行。代价是失去静态检查，所以读数失败要在页面里
`try/catch` 回 `READ_ERR + msg`（否则真缺陷会被读成"没变化"）。

### B-24 探针报"元素不存在 / ❌NOCHANGE" **不等于缺陷**——本项目大量节点是条件渲染（同日）

本轮一次扫出 15 个按钮，其中 **4 个的"点不到"全是我自己误判**：
`.search-panel` 只在有搜索词时存在、日历月份格子只在点开月视图后才渲染、
`#reset-month-btn` 在当前月是 `display:none`、动态"加载更多"只在条目数 > 每页数时才出（本站仅 2 条动态）。
两条硬规矩：

1. **判"没渲染"与"渲染了但不可见"要分开**：`getBoundingClientRect().width > 0` + computed `display/visibility/pointer-events`
   一起读，别只看 `querySelector` 是否命中。
2. **每次 `page.goto` 都重置状态**：要看"点 A 之后才有 B"的顺序态，必须在**同一次页面会话里连着点完**，
   不能一项开一个 URL（我第一版就是每项 goto，于是永远看不到月视图里的格子）。
3. ⚠️ 顺带：`querySelector('button:contains, .btn-regular')` 这种**非法选择器会让整段 `evaluate` 抛 SyntaxError**
   （`:contains` 是 jQuery 不是 CSS），一条脚本里一个非法选择器 = 后面全不跑。

### B-25 本会话三条 shell / 工具边界（同日；与 collab.md 的行尾纪律并列）

1. 🔴 **每次 `pwsh` 调用都是全新进程**——上一条命令里的 `$h` / `$vars` 下一条**不再存在**。
   用它跑 `Select-String -Path $h` 会**静默 0 命中**，看起来像"产物里没这个内容"（本轮我据此差点误报一次）。
   → 要么在同一条命令里重新取值，要么落盘成文件再读。
2. pwsh 里 `Invoke-WebRequest` 失败后 `$_.Exception.Response` 是 **.NET 的 `HttpResponseMessage`，没有 `GetResponseStream()`**
   （报 `InvalidOperation`）。错误响应体直接读 **`$_.ErrorDetails.Message`**。
3. `grep` 工具的 ripgrep **不支持反向引用**：`"([^"]*)"\s*:\s*"\1"` 这类"找 self-same 值"的模式**直接被拒**，
   换 PCRE2 也不行（工具没开）→ 要这种判定就写脚本用 JS 正则跑。

⚠️ 另两条本轮踩到但**不是新坑**、属老规矩复现：`node -e "…"` 带引号会被 PowerShell 吃掉（→ 一律写成 `%TEMP%\*.mjs` 文件再跑）；
`Select-String -Path <目录> -Recurse` **没有 `-Recurse` 参数**（要 `-Path (Get-ChildItem -Recurse -File …)`）。
**临时脚本一律进 `%TEMP%\<项目名>\`，别进仓库**（`_scratch/` 并没有被 gitignore，第八批踩过）。

---

### B-26 🔴 四条**本会话自己造的验证陷阱**（假阴性 / 假归因 / 反事实误报 / 假 FAIL，2026-10-17，全是我的探针或措辞问题，不是站点缺陷）

1. **用 `latin1` 读文件、再拿中文字符串去比 → 永远 0 命中**（本轮实测复现）：
   查产物里有没有「个年份」时写成 `readFileSync(f, 'latin1').includes('个年份')` → 报 **0 个文件**，
   我差点据此判定「改动没进产物」。同一段内容按 utf8 读再比，命中 **1 个文件**（`_astro/ArchivePannel.*.js`）。

   ```js
   fs.readFileSync('dist/index.html', 'utf8').includes('上一页')  // true
   fs.readFileSync('dist/index.html', 'latin1').includes('上一页') // false  ← 我踩的就是这个
   ```

   → **搜中文一律 `readFileSync(f, 'utf8')`**。这条与 **八-27**「实体解码必须单趟做完」同族：
   **解码口径错了、结论整个反**。七节「读写编码必须一致」那条**读的时候同样适用**。
2. ⚠️ **我原本要给这条并列写第二条：「pwsh 里 `Select-String -Pattern 中文` 会被 mojibake → 0 命中」。
   落盘前重测，证伪了**：`Select-String -Path dist\index.html -Pattern '上一页|下一页'` **命中 1 行**，中文模式没问题。
   我上一轮看到的其实是一条 **ParserError**（`node -e` 里内联中文 + 转义引号被打断，命令根本没跑成），
   错把它归因成「Select-String 中文坏」——那正是 **B-17**（真症状、错归因）这一族。
   → **通则：往分册写「机制」之前，必须单独把这个机制复现一次**；复现不出来就删掉，别靠"大概是它"记账。
3. **`npm run docs:check` 的死引用闸门不认「反事实」用法**（本轮真被撞了一次）：它从文档正文里抠所有
   反引号包裹的仓库内路径、逐个 `existsSync`。我写「**别**新建某个文件」时把那个路径写成了反引号路径
   → 报 **ERR 死引用**（它没法区分「引用一个存在的文件」和「叫你别创建这个文件」）。
   → **写禁令时别把不存在的路径加反引号**（改成中文描述，如「在 pages 下建一个 404 目录页」）。
   ⚠️ **别为了过闸去削闸门或删建议**——本轮是**我的措辞触发了一条正确生效的守卫**，改措辞即可。
4. ⚠️ **PowerShell 里 `& curl.exe ...` 的返回是「字符串数组」（每行一个元素），不是字符串** →
   拿它做 `.Contains('子串')` 变成**逐元素相等比较**，对任何子串都恒为 **False**。
   本轮据此一度得出「首页不含 V0.1.49、404 页正文不见了」= **部署没生效**的假 FAIL，
   而同一条命令里 `[regex]::Match($e,'<title>')` 却**正常取到了 404 页的 title** —— 这个自相矛盾就是破绽
   （又一次「先怀疑探针」，同 六-③、B-26 第 1 条）。

   ```powershell
   $h = & curl.exe -s "$B/"          # String[]，每行一个元素
   $h.Contains('V0.1.49')            # False ← 假的
   $h = (& curl.exe -s "$B/") -join "`n"   # 先聚合成标量
   $h.Contains('V0.1.49')            # True  ← 真的
   ```

   → **PowerShell 里做子串判断前，先把外部命令输出 `-join`**；或者干脆用 `-match` / `Select-String`
   （它们对数组是"任一元素匹配"，语义不同但不会静默全 False）。
   同理 `$h.Length` 在数组上是**元素个数**、不是字符数——本轮实测标量化后才是 171378。

⚠️ 四条通判据：**探针返回 0 命中时，先怀疑探针（编码 / 选择器 / 是否跑成），再怀疑产物**（九·补③ 那条通则的具体化）。
顺带一条同批正例：数「有几个卡片元素」别用 `html.includes('card-github')`（CSS 里也提这个类名 → 虚数 9），
要匹配**元素**本身（实测 3 张）。**字符串计数 ≠ 元素计数**，同 五-34「产物里空 alt 是裸属性」那类坑。

---

### B-27 🔴 Playwright 打裸 IP 线上站报 `net::ERR_PROXY_CONNECTION_FAILED`：是**本机代理拦的**，不是站点挂了（2026-10-17）

同一批里，**早几轮同样的探针跑 `http://47.108.230.220` 全通**，晚一轮起来第一件事就整批失败：

```text
page.goto: net::ERR_PROXY_CONNECTION_FAILED at http://47.108.230.220/404.html
```

排查顺序（这次实测有效，别跳）：

1. **先确认站点没坏**：直接在 shell 里跑 `curl.exe -s -o NUL -w "%{http_code}"` → 全 200。
   **curl 通、Chromium 不通 = 一定是本机网络层，不是服务器**（同 **六-③** 那条"自相矛盾即假信号"）。
2. **看代理**：`reg query HKCU\...\Internet Settings /v ProxyEnable /v ProxyServer`
   → 本机 `ProxyServer = 127.0.0.1:7897`（FastGithub 那类工具会写系统代理，`ProxyEnable` 可能是 0 但
   Chromium 仍有自己的解析路径），环境变量 `HTTP_PROXY` 等全是空 —— **所以只看 env 会得出"没代理"的错结论**。
3. **修法（两条都试过，只有一条真有效）**：
   - `launch({ args: ["--no-proxy-server"] })` → **无效**，还是 ERR_PROXY_CONNECTION_FAILED。
   - ✅ **`launch({ args: ["--proxy-server=direct://"] })` 有效**。
   - ⚠️ `newContext({ proxy: { mode: "direct" } })` 是**我瞎猜的 API** → 报
     `proxy.server: expected string, got undefined`。**这个版本的 Playwright 没有 `mode` 这个键**，
     要指定代理得给 `server`。别照着记忆写选项名。

⚠️ **副作用是好事**：强制直连之后，`/about/` 的 GitHub 卡片从"成功分支"翻成了**失败分支真出现**
（`class="card-github no-styling fetch-error"` + 中文失败文案 + `pointer-events: all`）——
这正好等于**用最自然的方式复现了访客端的真实处境**：访客机器上没有 FastGithub，`api.github.com` 就是连不上。
本批 A4 那条修复因此有了比 `route.abort()` 更可信的一份证据。
→ **通则：探针遇到代理类故障时，"绕开代理"往往同时打开一扇观察真实用户条件的窗。**

---
### B-28 🔴 第二轮复验又造出四条**验证陷阱**（2026-10-17 下午；全是我的探针/措辞问题，站点侧只抓出一条真缺陷）

1. 🔴 **我的结论句和自己刚收到的工具输出互相矛盾**（最严重的一条）。
   我在一条命令末尾打了 `"(无 HIT 即干净)"` 这个**固定字符串**，而它上面几行已经打出了 `HIT: +| …8099…`。
   也就是说：**我写"无输出"的时候，输出里明明有一行。**
   → 修法不是"更小心"，是**改写法**：① 扫描脚本逐条打印 `ok/HIT + 命中数`（本轮第二遍就是这么改的），
   ② **别在命令里嵌硬编码的"干净"字样**——那是把结论写死在验证之前，
   ③ 落结论前把那几行原文再读一遍。同 **B-15**（在承诺不许谎报的同一条消息里谎报）、**B-17**（真症状错归因）一族。
   ⚠️ 事后核实那行 HIT 本身**不是泄露**（`IP:8099` 这个值本来就公开在 `src/config/commentConfig.ts` 里，
   我的正则把它当模式命中了）——**但我的那句话仍然是假的**。

2. 🔴 **比较口径不统一 = 大面积假 FAIL**：核对全站 canonical 时，我拿
   「原始的中文相对路径」去比「percent-encoded 的绝对 URL」→ **45 页里 26 页被误报成缺陷**
   （全是 `css100天-第N天` 这类中文 slug）。
   → **比较前两边必须归一到同一形式**：`decodeURI(...)` + 都取绝对 URL 或都取路径。
   改成归一版探针后：**44 页里 0 处不符**，只剩 1 处是真的（见第 4 条）。
   ⚠️ 危险点：假 FAIL 的数量远大于真 FAIL，容易让人以为"问题很多"而**把真的那条淹掉**，
   或者据此去"修" 26 个不存在的问题。

3. ⚠️ **ParserError 是解析期错误 → 同一条命令里前面的语句一条都没执行**。
   我把 `npm run docs:check` 和一个 `node -e "…带引号的中文…"` 写在同一次调用里，
   `node -e` 炸了 ParserError，于是**那次 `docs:check` 其实没跑**，我却以为跑了。
   → ① **一条 pwsh 调用只放一类事情**，或者关键工具单独一条；
   ② 看到 ParserError 就认定"**整条没执行**"，不能沿用"前半段应该已经跑完"的记忆（**B-25** 只讲了
   0 命中的假阴性，这条更危险：它制造的是"我以为验证过了"）。

4. 🔴 **真缺陷一条（我自己引入，已修）**：单文件页 **产物文件名 ≠ 构建期路径**。
   `404.astro` 产出 `dist/404.html`，但 `Astro.url.pathname` 是 `/404/`，而 `SEO.astro` 的
   canonical/og:url 默认取 `Astro.url` → 产物里 canonical 指向 `http://…/404/`，
   **实测那个 URL 返回 404** = 页面自证"我的规范地址是死链"。
   第一遍验收没抓到，因为我只数了 h1 / title / 内链，**从没把 canonical 与真实可访问 URL 对比**。
   → 修法：`Layout` 接住 `url` 转发给 `BaseLayout`（后者 `<SEO {...Astro.props} />`），404 页显式传
   `new URL("/404.html", Astro.site)`。⚠️ 不传时 `url = Astro.url` 默认值照常生效 → 其余 44 页零影响
   （复验：线上 45 个 URL 的 canonical/og:url **0 处与自身真实 URL 不符**，且线上 360 文件与本地逐字节相同）。
   → **通则：凡 `<name>.astro` 直出 `<name>.html` 的非目录页，canonical、og:url、sitemap、`error_page`
   目标逐个核，别信默认值。**

5. ⚠️ **编号引用必须先在目标文件里 grep 出来再写**（我第二次栽在这上面）。
   更正第 4 条的因果时，我把出处写成隔壁的 **五-18**，真机制其实在 **五-24**
   （五-18 讲 Pagefind 总则、五-24 讲 `data-pagefind-body`，两条主题相邻极易混）。
   我加的"残留计数"断言把这件事抓了个正着——**而且连我那句自我批评里写的 `五-18` 也被算进残留**，
   逼我第二次改写法。**同一个错误在一段话里犯了两次**，说明"凭记忆引用编号"这个习惯本身要改掉。

---
## A. 继承自上一任的纪律（22 份记忆文件压缩落盘，卸载 Qoder 后仍有效）

### A-1 否定结论必须配控制组

**规则：任何"没有 / 不存在 / 0 命中 / 从未渲染"都不许直接下结论——先用一个已知存在的东西跑同一套方法。**
控制组也拿不到结果，就是方法坏了，而不是东西不存在。已实测出的假阴性清单（11 类，全部真发生过）：

1. **解压方式错 → 静默失败 → 干净的"0 命中"**：Pagefind 分片是 **gzip（`\x1f\x8b`）不是 brotli**，
   用 `brotliDecompressSync` 解会抛异常、被 catch 退化成读原始字节，拿二进制搜中文必然 0 命中。
   → `try/catch` 包住解码的地方，**失败必须显式报错，不许回退成原文**。
2. **Git Bash 盘符写法**：`ls "D:/中文路径"` 报不存在，`ls /d/中文路径` 存在。断言"不存在"前先换写法复验。
3. **浏览器停在半切换态**：导航工具超时后 DOM 可能整个缺侧栏（682 个元素 vs reload 后 2504），
   `#content-wrapper` 还挂着 `transition-leaving`。→ **导航后先 `document.querySelectorAll('*').length` 比量级，再 reload 复测。**
4. **grep 类名 ≠ 元素存在**：命中的可能是 `<style>` 里的 CSS 文本或 `data-code` 属性。数 markup 要匹配标签形态或用解析器。
   附带：**规则文档会自我命中**（在 AGENTS.md 里 grep 乱码特征串，永远命中它自己那条规则）。
5. **未进视口 / 未缓存的 `loading=lazy` 图根本不发请求**（上一任记的"隐藏标签页"在本通道不存在，见 B-19；
   但结论照用 —— 视口外懒加载就足够复现）→ 别拿 `img.complete` 当"文件缺失"的证据；
   **判"资源缺失"只能 `curl`/`fetch` 直接打那个 URL。**
6. **剥标签提取 HTML 结构 = 把图标和背景一起"提取"没了** → 描述 UI 结构必须看**原始 markup**。纯文本只够确认"有哪些字段"。
7. **自造选择器命中 0 个 → 两边空数组比出假的"完全一致"** → 比对之前先断言探针非空；选择器要从源码读出来，不许凭印象。
8. **shell 引号把反斜杠吃掉** → 带正则/反斜杠/中文的校验一律落成 `.mjs` 文件跑，别 `node -e '...'`；断言别用正则字面量，用 `String.fromCharCode(92)` 拼 + `includes()`。
9. **集合式 diff 看不见"删除"** → 忠实性核对要用**计数**或按顺序行级 diff。
10. **过滤器吃掉整类差异行** → `grep -c "^[+-][^+-]"` 数不到纯空行差异（见 AGENTS 八-9）；同类前例：`grep -oc` 数的是行数、`[A-Za-z0-9]` 不含下划线（**Astro 资源哈希带 `_`**）。
11. **分词器插零宽字符** → Pagefind 分片词间是 **U+200B**，搜中文短语前先 `t.replace(/\u200b/g,"")`。
    反向的假阳性：**`grep "1.1.4"` 里的 `.` 是通配符**，会命中 SVG 路径坐标 → 内容断言一律 `grep -qF`。

### A-2 视觉 / 交互类结论：程序化取证

- **定宽 iframe 探针**（1440 / 1280 / 375）读 `getComputedStyle` + `getBoundingClientRect`。
  ⚠️ **量 `vh` / `%` 驱动的尺寸必须同时给宽和高**（只给 width 时高度按内容走，`h-[15vh]` 会算错），三档一起报。
  ⚠️ **iframe 的相对 `src` 按顶层文档的 origin 解析** → 跨环境验证一律写**完整 URL**，并在返回值里回读 `contentDocument.location.origin` 自证；顶层换过页面之后之前所有 iframe 结论**全部重跑**。
- **读计算样式前必须先注入 `transition/animation: none !important`**（或读 `getAnimations()` 再 `finish()`）——
  否则读到的是过渡起点。（⚠️ 上一任加这条的另一半理由"隐藏标签页里根本不推进"**在本通道不成立**，见 B-19；
  但"注入 none"这个动作照做 —— 导航途中 / 入场动画期间读到的仍是起点值。）
- **反向判据：`getAnimations()` 为空 = 真的没有过渡**（`display:none ↔ block` 切换的开合就是这个症状）。
- **读属性要读对属性**：Tailwind v4 的 `rotate-180` 写 `rotate` 属性、`-translate-x-1/2` 写 `translate` 属性，读 `transform` 会拿到 `none`。
- **断点显隐要连父容器一起测**（自定义类可能盖掉工具类，见 AGENTS 五-20）。
- **iframe 里 `:focus` 永远测不到**（脚本创建的 iframe 拿不到文档焦点）；`:focus-within` 会给相反的假信号。
  但 **`:hover` 在顶层页面用真实指针能验**（先取快照拿 uid → hover → 读 `getComputedStyle`，并用 `el.matches(':hover')` 自证）。
- **验"事件委托有没有装上"：数该库本体 chunk 有没有被请求，别去点它**（Fancybox 之类拒绝合成事件，
  "点了没弹窗"既可能是没绑上也可能是环境不认合成点击，**这个判据无法区分**；换成看 `performance.getEntriesByType('resource')`，并配一个没有匹配元素的对照页）。
- **静态产物取证用解析器不用 grep**：`hast-util-from-html`（本项目已装）遍历真实元素取 `src/href/srcset/poster`，逐个 `statSync` 核 dist；
  标题层级审计同样靠解析（逐页取 `<h1..h6>` 序列，核「h1 数=1 / 无空标题 / 无跳级」）。
- **用户做主观尺寸对比时**，先扒参考站编译后的同一行 class 串逐项比数值（Tailwind 数字类要换算），比量像素快；渲染高度只用来证明"修好了"。
- **内联 `style=` 不在任何样式表里** → 遍历 `styleSheets` 找"哪条规则在赋值"会一无所获。

### A-3 修症状要覆盖全部触发路径（影响域分析）

- 动手前列「触发路径 × 当前行为 × 处置」表；维度必须含 **入口页 × 加载方式**。
- **同一机制的全部手势 × 全部断点一次修完**；**一行里并排的多个同类子项要逐个量**，且**要枚举全部子项 × 走完空态/兜底分支**（AGENTS 五-42 的实例）。
- **重写组件后要回头验自己没打算动的部分**（本项目多轮反馈全是上一轮自己引入的回归）。
- 报"可上线"前先自查视觉一致性（图标尺寸档位 / 同一断点是否只有一个控件 / 圆角间距是否符合全站语言）。
- **仿真软导航必须连 URL 一起改**：`history.pushState` → 挂 `is-changing` → 换 innerHTML → **重插容器内 script** → 摘 `is-changing` → 派发桥接事件。顺序照真实库（pushState 在内容替换之前）。
- **数"组件渲染出多少条"要数在组件自己那棵子树里**（整页选择器会把侧栏/推荐位算进来，得出自相矛盾的假异常）；同时把组件自己渲染的汇总文案读出来交叉验证。
- 拿不准是不是回归时，**拿线上旧构建跑同一探针当控制组**（数字相同 = 既存行为，别修）。

### A-4 点名"参考"就先扒参考实现

- 参考源已固化在 `AGENTS.md` 第一节（firefly.cuteleaf.cn + CuteLeaf/Firefly）；**用户没点名时别反问也别自选**。
- 在线站扒**编译产物**：`curl` 首页 HTML → 取 `/_astro/*.css` 与 chunk js（swup 配置在 `page.*.js`、hook 编排在 `Layout.astro_*_lang.*.js`），grep 类名/hook 名/选择器。**别只比 CSS 数值就宣布对齐**（真根因常是挂载位置）。
- 源码仓库用 sparse 只取所需目录（见 A-6 网络绕行）。
- **照抄资源名（图标 / 字体 / 组件）之前先核本站装没装**（AGENTS 五-29 的构建打挂实例）；"参考有、我们没有"要主动说出来并给替代，别静默换。
- **参考站没做的功能要明说"参考站没做"**，再决定按业界标准自实现，并把这句话写进文档（防止下个会话又去参考里找不存在的东西）。
- **照搬范围包括相邻机制**（显隐/高亮/高度变量等配套逻辑），漏了会被当 bug 报回来；确实不搬的要主动列出原因。

### A-5 批量 / 不可逆操作逐条判定

- 批量变换**不要一个参数套全部**：逐条试候选，只有确实变好才应用（相册压图一刀切导致 20 张里 7 张变大、整体回滚重做）。
- 覆盖任何素材前先回答"**原件从哪回来**"（确认已被 git 跟踪才敢覆盖）。
- **有损压缩对"内容型图形"是功能损坏**：二维码 / 线稿 / 小字号截图必须 `{lossless:true, effort:6}`（实测无损反而比有损小）。
- 从截图程序化裁图时**先排除外圈深色边框**（否则按深色像素扫边界会得到整宽假框）；截图可能不是标准宽度，先 `metadata()`。
- 图片批处理要显式查一次 EXIF 方向。
- **分批提交时每笔都要 `git show --stat` 对内容**；分组错了未推送就用 `git reset --mixed` 退回重做。
  （本仓库有一条名实不符的已发布提交 `90a38e5`，就是这条规则的代价。）

### A-6 本机网络与 git 的现实

- `api.github.com` 与 `data.jsdelivr.com` 常不通；`github.com` 全量克隆慢。**直接用**
  `git clone --depth 1 --filter=blob:none --sparse <url> <dir>` + `git sparse-checkout set src`。
- ⚠️ **`curl https://github.com/...` 返回 `HTTP 000` 多半是 Windows schannel 的证书吊销检查失败**
  （`CRYPT_E_NO_REVOCATION_CHECK`），**不是链接坏了** → 加 `--ssl-no-revoke`，或承认本机测不了、只核 URL 拼写。
- ⚠️ **`git push` 报 `remote: fatal error in commit_refs` / `! [remote rejected]` 是 GitHub 侧瞬时故障，原样重推即过**。
  别据此怀疑 remote 配错、凭据失效或去改配置/强推。
- `/tmp` 在 Windows 映射到 `AppData\Local\Temp`；node 里写 `/tmp/xxx` 会被解析成当前盘的 `E:\tmp` → 临时文件一律 `path.join(process.env.TEMP, …)`。
- 默认 registry 是 npmmirror（不实现 audit 接口）；查漏洞显式换 `--registry=https://registry.npmjs.org`。

### A-7 文档维护纪律（本 harness 的落盘位置约定）

- **两层分工**：`AGENTS.md` = 长期规则与事实（自动注入，≤ 预算）；`HANDOFF.md` = 易变状态与下一步（**不自动注入，要主动 Read**）。
- **分册层 `docs/agents/*.md`** 放原文全文；**引用而不复述**；条目编号（五-N / 八-N / 十-N）跨层通用。
- 已确认的和待确认的分开标注；未证实的标"待确认"而不是编造。
- 改名/重构要用 `git mv` 保留历史，并把**所有引用点**一并改掉，别留断链。
- ⚠️ **同一份信息不许在 AGENTS / HANDOFF / 分册里各写一遍**（改的时候必漏一处）。
  本会话据此**删掉了 AGENTS.md 顶部与 HANDOFF 第一节重复的 52 行流水账**。
- ⚠️ **上一任的记忆目录（`.qoder-cn`）不再是任何记录的家**。已于 2026-10-12 逐处改掉：AGENTS 一节的"见记忆 `github-network-workarounds`" → 本文件 A-6；deploy.md 的私密记录路径 → `AGENTS.local.md`；todo.md 的 `TaskStop` → `job_kill`（并注明行为相同）；"Qoder 自身是 node 进程" → "harness 自身"。
  → **新增文档时别再写"见记忆 xxx"**；`npm run docs:check` 不检查这一条，靠自觉。
- `docs/agents/harness.md` **不会被自动注入** → 需要它的会话必须主动 Read（`AGENTS.md` 的分册索引就是提示位）。

### A-9 开放式体检 = 并行只读子代理，但**必须我自己逐条复核后才报**

（本条来自上一任记忆 `parallel-audit-verify-before-reporting`。2026-10-12 分层时被漏掉，本次对账补回。
它救过场事故：2026-09-30 那次三代理体检，代理挖出真 P0（RSS 26 条 `/post/undefined`、5 篇交互 demo 软导航必死、
`site.json` 污染 42 页 og），**但同一份报告里有 2 条是假的、1 条方向说反**——说反的那条把"HTML 没有 `Cache-Control`"
这个真根因列进了"确认没问题"，**照抄就会把真缺陷当已排除报给用户**。代理给的"相册 −94%"我复测是"−70%"。）

**规程（四条，缺一条就会出事）：**

1. **派代理时必须给三样**：项目是什么、**先完整读哪份约定文档**、"只读、不许改任何文件"。
   并且硬性写明：**凡已被文档判定为故意的、或已列进「已知不做」清单的（AGENTS 七节的用户口味 + 九节的"用户看过选择不做"清单），一律不许报**。
   不写这条，每次体检都会把那十条陈年"故意项"当新发现重提一遍。
2. **要求输出带 `file:line` + 具体数字**，并强制附一节「**我查过但决定不报的**」——
   那一节是我判断它**真扫过**而不是漏扫的唯一证据（没有这节，"没问题"和"没去看"输出完全一样）。
3. **回来后我自己抽查，不照抄**：P0 逐条跑命令 / 开浏览器复现，P1/P2 抽代表性的几条。
   代理自己标「待核实」的项，**我不升格成事实**。
4. **汇报必须分三类标注**：✅ 我核实过 / ⚠️ 代理说但我没验 / ❌ 我核后判定不成立或降级。
   用户就是按这个分类挑要做哪几项。**他否掉或未选的建议要立刻写进 AGENTS 九节那条"用户看过选择不做"清单**，
   否则下次会被当新发现重提（与 `clean-doc-record-when-fixed` 是同一族的正反两面）。

> 与 B-1 那条「每条结论标来源（我实测 / 子代理报告（未复核）/ 推测）」是同一纪律的**流程化版本**：
> B-1 管**说出口时怎么标**，本条管**派活与回收时怎么做才有余地犯错**。
> 本 harness 的对应工具：`subagent`（独立上下文，适合"审计某批文件"这类自包含任务）、
> `subagent_fork`（继承本会话上下文，适合"基于我们刚讨论的东西再查一层"）、`workflow`（大批量扇出）。

### A-8 与外部工具/服务相关的裁决（继续生效）

- 部署方式：本地 build + 上传 dist（见 AGENTS 六节），**服务器不跑 build**；展开版命令只在 `AGENTS.local.md`。
- 服务器自测的坑（`127.0.0.1` Host 头命中 `phpfpm_status.conf`、`bt 14` 会打印面板密码）见 AGENTS 六节。
- **宝塔面板不适合浏览器自动化，一律走 SSH。**
- 用户同时在推进另外两个项目：**CCNewTools**（手册持续差量同步进 `/posts/ccnewtools-manual/`）与 **Chenmeridian**
  （截至 2026-10-12 博客里还没有任何内容）→ 他说"我另一个项目""又要同步手册"时先想到这两个，**别把 Chenmeridian 当成拼错的 CCNewTools**。
- 他的源手册在 `E:\Chentools项目\CCNewTools\使用手册\`，**不在本仓库授权范围内**，别去改。

---

## C. 本 harness 的可用能力清单（2026-10-12 实测）

| 能力 | 状态与用法 |
|---|---|
| 项目指令注入 | `AGENTS.md` + `AGENTS.local.md` 自动注入，**合计封顶 65536 字节**；`~/.dsh/AGENTS.md` 当前不存在 |
| 跨会话记忆 | **无此功能** → 一切落盘进仓库文件 |
| 浏览器（模型侧） | **2026-10-12 已装 playwright provider**，但 ⚠️ **本会话没有工具**（provider 不接管已活动 Session）→ 要**新建/恢复 Session** 才出现 `mcp__playwright-mcp__*`。当前可用通道：`npm run probe -- <url> <宽> <高> [--also <宽> <高>] [--sel <css>]`（全局 Playwright + headless Chromium 1243） |
| 浏览器（用户侧面板） | 右侧 Sidebar 的「浏览器」tab，**桌面 profile 默认已启用**（用户按 Ctrl+T 开）。⚠️ 它**不给模型任何工具**，且与我经 MCP 起的浏览器**互不共享状态** → 详见 C-1b |
| 后台任务 | `pwsh run_in_background` → `job_output` / `job_kill`；**`job_kill` 只杀外壳，node 子进程照残留**（AGENTS 九节的精确匹配流程适用） |
| 子代理 | `subagent` / `subagent_fork`（后台默认）、`workflow`（大规模编排）、`send_message` / `interrupt_agent` |
| 技能 | `ui-ux-pro-max` / `frontend-design` / `design-taste-frontend` / `tailwind-4-docs` / `gsap-*` / office 系列等；**无 `superpowers:brainstorming` 同名技能**（语义见 AGENTS 文末附表） |
| MCP | 未接入 Context7 / GitHub（上一任在 Qoder 内配的，已随卸载失效） |
| 交付展示 | `present`（把产物文件作为卡片交给用户） |

### C-1 DSH 的 browser-use 插件：**已于 2026-10-12 装好并挂载**（含装前证据与回滚位）

`dsh-browser-use` 是**插座**（零 dependencies、"Exclusive named provider registration"），**单装它得不到任何工具**；
真正的 provider 是 `dsh-experimental-browser-use-playwright-mcp`（依赖 `@playwright/mcp`）或 `…-chrome-devtools-mcp`（依赖 `chrome-devtools-mcp`），**exclusive 注册 → 推断只能挂一个**（未实测同挂的报错行为）。

1. ⚠️ **裸包名会被版本闸门拒**（实测真 semver）：本机 runtime = `0.2.0-rc.2`；dist-tag `latest` = `0.1.6-alpha.1`（peer 写 `^0.1.6-alpha.1` → **不满足**）；`next` = `0.2.0-rc.2` → 满足。**必须显式带版本号**。
2. ⚠️ **装 ≠ 启用**：这三个包的 `package.json` **都没有 `dsh.bundle` 声明** → `reconcile()` 只打一条 warning 并跳过。
   装完还**必须手改两处**：`profiles/desktop/package.json` 的 `dsh.profile.bundles` + `cordis.patch.yml` 追加条目（`mode: launch` **必填无默认**，`headless` 默认 true；**没有 `enabled` 开关**）。
   且 `dsh-browser-use` **不随 asar 附带**（实测 find 命中 0）、profile 又 `autoInstallPeers: false` → **那个插座必须自己装**。
3. ⚠️ **本会话拿不到工具**：provider README 原文「**加载或重新加载此提供方不会接管已经活动的 Session**」「在**创建或恢复 Session 前**挂载」→ 要**新会话**才有。
   🔴 **同一条 README 的已知限制**：「**启动失败或取消会拒绝 Session 创建或恢复**，并触发客户端清理」→
   所以 `mode: launch` + `headless: true` **不能改成 `headless: false`**（本机无完整版 `chromium-1243`，改了就**新会话直接创建失败**）。
   是否必须重启进程：**未实测**（HMR 文案说改 `bundles` 列表会触发重载并报 `applied`，但"仅依赖字段变化不触发重载"；**替换已安装包版本明确需要重启**）。
4. 实际执行过的命令（`dsh` 不在 PATH，用全路径；`plugin` 只是 pnpm 转发器、`--profile` 必填）：
   ```powershell
   & "D:\programs\deepseek harness\dsh\resources\runtime\cli\bin\dsh.cmd" plugin --profile desktop add "@deepseek-ai/dsh-browser-use@0.2.0-rc.2" "@deepseek-ai/dsh-experimental-browser-use-playwright-mcp@0.2.0-rc.2"
   ```
   实测退出码 0、`+11 包`、lockfile 过供应链校验；两条 `declares no dsh.bundle` warning **实证了第 2 条**（装 ≠ 启用）。
   ⚠️ 跑 CLI 时 app 仍在运行也成功了 → 源码里"先完全退出 app"那句是**建议而非硬闸**（未深究，别据此放宽第 3 条）。
5. **浏览器可用性**（实测）：`@playwright/mcp@0.0.80` 钉 playwright-core `1.63.0-alpha-2026-08-31` → 要 **chromium rev 1243**。
   本机有 `chromium_headless_shell-1243` ✅、**没有完整版 `chromium-1243`** ❌ → `headless:true` **现在就能离线跑**（实测 launch 成功），`headless:false` **必失败**。
   要 headed：`node "<全局 @playwright/test>/node_modules/playwright/cli.js" install chromium`（已用 --dry-run 验证目标与 URL，未下载）。
   ⚠️ **别拿 `chromium.executablePath({headless:true})` 判可用性** —— 它不接 headless 参数、**恒返回不存在的路径**；要判就真 `launch()` 一次。
   本机**无任何 Google Chrome**（只有 Edge 155）；`chrome-devtools-mcp` 的 channel 选项全是 Chrome、上游 README 明说只官方支持 Chrome → **用它必须显式给 `executablePath` 指 Edge，属未支持路径**（未实跑）。
6. **npmmirror 有全部所需包**（逐包实测）→ 装时不必换官方源；但 `npm view … readme` / `npm audit` **仍必须显式换官方源**（npmmirror 返回空 readme）。

### C-1b 右侧「浏览器」面板（用户侧）与我的工具（模型侧）是两回事

用户问"你能不能像 Codex / Qoder 那样自己打开内置右侧浏览器操作" —— **答：不能，且不是没装**。两条独立证据：

- `@deepseek-ai/dsh-client-ui-sidebar-browser`（右侧 Sidebar 的浏览器 tab）README「模型体验」原文：
  「**无。Browser tab 是用户侧呈现状态，不注册工具、prompt section 或 Session event**」→ 它**设计上就不给模型任何工具**。
- 它的启用条件是 asar 里 `dsh-web-app/cordis.patch.yml` 的一行 JS：
  `disabled: !!js "ctx.get('profileContext')?.name !== 'desktop'"` → **桌面 profile 默认已启用**，无需配置；
  用户按 **Ctrl+T**（命令 `browser.new`，Windows 默认键）即可打开，工具栏有后退/前进/刷新/前往/系统浏览器打开。
- ⚠️ **两边不共享状态**：面板那个 Electron `<webview>` 与我经 MCP 起的 Chromium 是**两个独立浏览器上下文**，
  登录态 / Cookie / DOM 互不可见。面板上看到的 ≠ 我量到的，反之亦然。
- 面板受 iframe 策略限制（很多站点拒绝嵌入）、**明确拒绝 `file:` URL** → 验本地产物仍要走 http（配合 B-13）。
- → 本项目的分工：**我看数字用 `npm run probe`（新会话后可用 MCP 工具），人看观感用右侧面板**。
  要"我操作 + 你同时看见同一个页面"，得用 `mode: attach` 指向一个带调试端口的浏览器，两边接同一个 —— 属另一件事，未做。

### C-1c 安装落点与回滚

- 装进 `~\.dsh\profiles\desktop\`（**不在项目仓库内**）：`dsh-browser-use@0.2.0-rc.2` +
  `dsh-experimental-browser-use-playwright-mcp@0.2.0-rc.2`（连带 `runtime` 与 `@playwright/mcp@0.0.80`）。
- 挂载写在 `~\.dsh\profiles\desktop\cordis.patch.yml` 末尾两条：`browser-use-socket`（**无 config**）+
  `browser-use-playwright`（`mode: launch` / `headless: true`）。插座不需要 config 是**读源码定的**：
  它的 `lib/index.js` 全文 1262 字符，只有一个 `BrowserUseRegistry` Service 与 `register(name)` 独占逻辑。
- **装前 5 个 profile 文件已备份**（`package.json` / `cordis.patch.yml` / `cordis.yml` / `pnpm-lock.yaml` / `pnpm-workspace.yaml`，
  SHA256 校验 5/5）：`C:\Users\31429\.dsh\browser-plugin-profile-backup\`。回滚 = 覆盖回去再重启。
- `pnpm peers check` 报缺 `@deepseek-ai/cordis` 等：**与既有包同形**（`dshmarket`、`dsh-our-free-model` 报同样的缺），
  因为核心包由 asar 随附供给、profile 的 `node_modules` 里根本没有 `@deepseek-ai` 顶层目录却能跑 → **该 WARN 不是新问题信号**。
  但 `dsh-browser-use` **确实不在 asar 里**（实测该包名在 asar 内零命中）→ 必须显式装，这步是对的。

### C-2 本机环境快照

**本机环境快照**（2026-10-12）：node `v24.21.0` / npm `11.19.0`；
全局包 `@playwright/test@1.63.0`（内含 `playwright`），`ms-playwright` 缓存只有 `chromium_headless_shell-1243`（**没有完整版 chromium** → headed 模式可能不可用，探针只用 headless）；
系统浏览器只有 Edge（`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`），无 Chrome。
相关：[[AGENTS 六节部署流程]]、[[AGENTS 九节依赖纪律]]。

---

## D. 会话卫生：怎么减少"整轮被截断"（2026-10-12 实测观察，用户反复报"怎么又断了"）

**现象**：本会话里我这边**多轮在"工具调用刚返回"处就结束了**——既没给结论也没继续下一步，用户看到的就是"又断了"。
**我的排查**：`~/.dsh` 下逐处搜过（`.dsh/*.json`、`profiles/desktop/*.yml`、`llm-deepseek/`、`storages/`，搜 `maxTokens` / `timeout` / `stream` / `abort` / `truncat`）
→ **没有任何可调的超时或长度设置**。所以这**不是一个我能拧的旋钮**；但**诱因里有一条是我自己的行为**，能改：

1. 🔴 **最可疑的一条：改一次 `AGENTS.md`，下一轮 harness 会把整份常驻层重新注入一次**
   （就是对话里那些 `Updated instructions from: AGENTS.md`，每次都把 ~58KB 全文塞回来）。
   本会话我为改几行字动了它 4~5 次 → 等于额外灌进十几万 token。
   → **规矩：长会话里尽量不动常驻层。** 文档改动优先落到 `docs/agents/*`（**不注入**）与 `HANDOFF.md`；
     真要动 `AGENTS.md`，**把同批修改攒成一次编辑**，别来回微调。
   → 推论：常驻层不只受"64KB 预算"约束，还受"**每改一次就重注入一次**"约束 —— 这给了"轻量腾挪"第二个理由。
2. **单轮塞太多大输出**（整份大文件、超长单行 grep、完整 build 日志）会让上下文陡增。
   → 读文件一律 `offset`/`limit` 开窗口；`Select-String` 结果先 `Substring` 截断再打印。
3. **每轮必须以一句结论收尾**（哪怕只有一行）。"工具返回后直接停"**是最像"断了"的形态**——
   哪怕断在半路，最后一条消息里有状态和下一步，用户就能接着推。
4. **一次只做一件事，做完立刻提交推送**。本项目本来就要求小步提交，这条同时也是**断点恢复**的保障：
   任何一轮被截断，最多丢一步，仓库里永远是可交付状态。

> 与"常驻层预算"是**两条独立的纪律**：① 预算管"会不会被静默截断"（harness.md B-2，`docs:check` 可测）；
> ② 本条管"会不会把会话拖爆"（**没有工具能测，只能靠自律**）。
> 两条都指向同一个动作：**内容下沉到分册、常驻层只留钩子**。
