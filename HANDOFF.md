# HANDOFF — 会话交接

> **分工**：`AGENTS.md` 存长期不变的规则与事实；本文件存**会变的状态**与**下一步该做什么**。
> 本文件不重复 AGENTS.md 的内容，只引用。每次会话结束前必须更新本文件。
>
> 最后更新：**2026-09-24 晚，收尾：Firefly 式过渡 + 两处移动端修复均已上线**

---

## 一、下次会话第一件事

### 🔴→已实现待用户验收：过渡观感换成 Firefly 式（2026-09-24）

历程：09-23 上线的"整体渐隐"（veil+容器 opacity）被否 → 09-24 上午做的"幕布滑动盖板"也被否 →
用户点名"参考 Firefly 的那种变化"。已扒 Firefly 仓库（sparse clone 只取 src，全量 clone 太慢）：
它的过渡是 **120ms 的 CSS transition 滑移+淡入淡出**（`src/styles/transition.css`），只动内容、
chrome 是固定壁纸所以敢在 visit:start 即时回顶；Swup 走 `@swup/astro` + `animationClass: "transition-swup-"`。
本仓库已照搬并适配：`transition-main` 挂在封面块 + `#page-shell`（我们的 chrome 会随滚动移动，
回顶仍留在载体 opacity 0 的窗口里），`animationSelector` 改为 `[class~="transition-main"]`，
幕布与 veil 全部删除。dev 实测时间线：out 130ms → 隐藏窗口内回顶 → in 120ms 滑入，无死锁、console 干净。
**下一步：等用户在手机上验收 Firefly 式观感**（2026-09-24 晚已部署）；若仍不满意，Firefly 还有两样可补：
WAAPI 顶部进度条（`swup-transitions.ts` 的 startProgressBar/finishProgressBar）与首页↔非首页的内容面板 FLIP 平移。

### 🟠 悬着的事，需要用户点头

1. **推送远端**：本地领先 `origin/main` **12 个提交**。按铁律「推送前先问」，未推。
   09-23、09-24 多次问过，均未获答。
2. **3 个 Astro Audit a11y 提示未修**（dev toolbar，生产无）：空 `<h1 class="sr-only">`
   （`Layout.astro:94` 首页 title 为空）、分页禁用态 `<a href="#">`（`Pagination.astro:60`）、
   一条偶发 h3（首页复现不出，疑似 hydration 前瞬时态）。

### 🟡 AGENTS.md 第九节的存量待办

- 3 个文章方向等用户拍板（URL 用不用中文 / 要不要配封面 / 要不要文章脚手架）
- 2 处 `./heart.svg` 线上 404（真 bug）
- 代码块语言徽章与行号**从未渲染过**（既存缺陷，怀疑方向见第九节）
- 宝塔面板密码曾在对话中明文出现过，用户选择暂不改；面板 IP 白名单未开

---

## 二、本次会话（2026-09-23）做了什么

### 依赖 patch 升级（已上线）

`npm update` 4 个 patch：astro 7.3.4、@astrojs/mdx 8.0.2、prettier 3.9.9、material-symbols 1.2.93。
干净 `npm ci` + 构建验证，audit 0 漏洞，产物与基线逐项一致（37 页 / 260→261 文件 / 26M）。
mermaid 11.17.2 / typescript 6.0.3 天花板复查仍未松动。
**教训已固化**：`npm update` 后又 `rm -rf node_modules && npm ci` 是装两遍（白等 3 分钟），
正确序列 `npm update --package-lock-only && npm ci`，已写进 AGENTS.md 第九节与记忆
`record-mistakes-as-memory.md`。

### Swup 页面过渡 + 窗口缩放 morph（已上线）

用户指定参考 Firefly；对比后选 Swup（仓库 12 处 `swup:*` 接线、`#swup-container`、
`window.swup.navigate` 全是 Swup 形状；原生 VT 需改 ~10 个文件并伪造 `window.swup`）。
新增 `swup@4.10.0` + `@swup/scripts-plugin@2.1.0`；新文件 `effectsConfig.ts` /
`SwupManager.astro` / `transitions.css` / 设计文档 `docs/superpowers/specs/2026-09-23-*.md`。
**四个实测踩到的坑全部记在 AGENTS.md 第十节**（animationSelector 死锁、head 脚本不执行、
define:vars 内联、三套事件名），此处不复述。

浏览器实测通过：客户端导航（window 标记法）、评论/分享/推荐位/gallery 自定义元素导航后复活、
前进后退、同 URL 平滑滚顶、reduced-motion 整页降级、console 零报错。

### 部署（2026-09-23 夜，用户当次授权）

走 AGENTS.md 第六节流程：本地 build → tar → scp → `dist.new` 校验 → `mv` 原子替换。
**未做时间戳备份**（服务器已有 `dist.old` + `dist_backup_20260920_234618`，避免堆满磁盘；
`dist.old` 即回滚资产）。线上已从"升级前产物"变为"Swup 版"。

### 收尾（2026-09-24 凌晨）

删掉 SwupManager 里我留的验证用调试计数器 `window.__resizeMorphs`；
AGENTS.md 第十节第 5 条标记「veil 整体渐隐用户不喜欢、方案待换」；
用户反馈与明天任务记入本文件第一节。既有组件里的 console.log（Twikoo/github-card）非本次引入，未动。

### 手机滑动重影修复 + 归档时间线标题加宽（2026-09-24 白天，已上线）

用户手机反馈：滑动重影、首页卡片数据与右箭头"重叠"、首进正常但 Swup 返回后才出现。
**根因（程序化取证）**：resize morph 不区分宽高，手机地址栏收起/展开**只改高度**也触发 resize
→ 滚动中反复 `startViewTransition` 整页快照交叉淡化 → 重影 + 旧快照（old(root) 在上层）与已滚动页面叠印。
**修复**：`SwupManager.astro` resize 监听宽度不变直接 return（桌面拖窗行为不变）。
**顺带**：归档/分类时间线移动端标题 `pr-8`→`pr-0 md:pr-8`、圆点列 15%→8%、标题列 70%→77%
（`ArchivePannel.svelte`，表头行同步），标题可用宽度 +52.6px，圆点仍对齐；桌面列比例未动。
坑已写进 AGENTS.md 第十节第 6 条。提交 `8f96606`，**用户当次授权部署**，已按第六节流程上线并
用 chunk md5 指纹核对（Svelte 时间线是客户端渲染，静态 HTML 里没有行，别去 grep HTML）。

### 过渡观感三轮迭代 + 移动端两处布局修复（2026-09-24 下午~晚，已上线）

过渡：整页平移方案推演时发现**文档级滚动下平移整页藏不住瞬时回顶**（页面几千像素高，移一屏仍在
视口里）→ 改幕布滑动盖板 → 用户仍否 → 点名 Firefly → 扒仓库确认其过渡是 120ms transition 滑移+淡入淡出，
照搬并适配（`transition-main` 挂封面块+#page-shell），幕布/veil 删除。提交 `13341f5`。
移动端布局：① PostCard 的 scoped 样式在不渲染卡片的入口页 head 里缺失（Swup 不换 head）→
"归档整页刷新后 Swup 回首页卡片重叠 64px"；布局 CSS 移入 `global.css`、每实例变量内联。
② 我收窄时间线圆点列的副作用：text-2xl 年份溢出压圆点、日期换行点不齐；列宽改 18/7/75 + 年份移动端 text-xl。
提交 `44e739a`。**教训已入 AGENTS.md 第十节第 2 条**（scoped style 的入口页依赖）。

---

## 三、当前状态快照（2026-09-24 晚收尾时实测）

| 项 | 状态 |
|---|---|
| 本地 HEAD | `44e739a` 移动端两处布局修复（其前 `13341f5` Firefly 式过渡、`8f96606` 重影修复） |
| 与远端 | **ahead 12**，全部未推送（推送前先问；多次问过未获答） |
| 本地构建 | 退出码 0，37 页，dist **261** 个文件 |
| `npm audit` | **0 vulnerabilities** |
| 线上站点 | 2026-09-24 晚已上：Firefly 式 120ms 过渡 + PostCard 全局样式 + 时间线列宽（chunk md5 核对一致） |
| 服务器回滚资产 | `dist.old` 与多个 `dist_backup_20260924_*` = 当日各版本；`dist_backup_20260920_234618` = pre-Swup 版。**均保留中** |
| dev server | 后台运行中（任务 `b5wk43iua`），下次可直接用 |
| 我的浏览器 surface | 尺寸时有时无；**观感验收交给用户手机**，布局类 bug 用定宽 iframe 程序化测量 |
| 临时文件 | 本地与服务器 `/tmp` 已清（含 `/tmp/firefly-sparse`、tar 包） |

---

## 四、维护本文件的规矩

1. **每次会话结束前更新**：改「最后更新」日期、刷新第三节状态快照、
   把本次做的事并进第二节（旧内容可压缩，别无限堆积）、更新第一节的下一步。
2. **不复述 AGENTS.md**：规则、部署流程、版本天花板、依赖坑位都在那边，这里只写"现在什么状态、接下来干什么"。
3. **同样受凭据纪律约束**：面板端口、密码、token、私钥一律不写。仓库是公开的。
4. 第一节永远放**下次该做什么**，让新会话打开文件第一眼就知道从哪接手。
