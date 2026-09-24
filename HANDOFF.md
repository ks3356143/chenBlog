# HANDOFF — 会话交接

> **分工**：`AGENTS.md` 存长期不变的规则与事实；本文件存**会变的状态**与**下一步该做什么**。
> 本文件不重复 AGENTS.md 的内容，只引用。每次会话结束前必须更新本文件。
>
> 最后更新：**2026-09-24 午后，手机重影修复已上线**

---

## 一、下次会话第一件事

### 🔴 用户指定：换掉"整体渐隐"的跳转动画

用户 2026-09-23 上线后反馈：**不喜欢跳转时整体渐隐的观感**，要求换其他方式。
当前实现里"渐隐"有两个来源，**先确认用户指的是哪个（或都要换）**：

1. `#page-veil` 遮罩：out 阶段整屏淡到 `var(--page-bg)` 再揭（为藏瞬时滚动复位而加）。
2. `#swup-container` 的 zoom 过渡自带 opacity 淡出/淡入（`transitions.css` 的 zoom-out/zoom-in）。

候选方向（按我判断的可行性排序，动手前自行核实）：

1. **整页 transform 滑动（翻页感）**：header/封面/侧栏/主栏一起 translateX/Y 滑出滑入，
   不用透明度。滚动复位发生在旧页已滑出视口之后 → 天然遮跳顶，可删 veil。
2. **元素级 View Transitions morph**：给各区块加 `view-transition-name`，用
   `document.startViewTransition` 包裹 Swup 的内容替换，各区块各自 morph，无整页淡。
   工作量最大，观感最"丝滑"。
3. **clip-path 几何擦除**（圆形自点击处扩散 / 线性擦除）：遮的是裁剪不是透明度，不像渐隐。
4. **纯 transform 的 container 缩放/位移**：去掉 container 的 opacity 淡出，只留 scale/translate；
   但 chrome 跳顶遮不住，需与方向 1 组合。

⚠️ 约束（AGENTS.md 第十节）：不要用 body/祖先淡入淡出（Swup 会卡死）；
换方案时 12 个组件的事件桥接与 scripts-plugin 不动，只改视觉层。
建议先做方向 1 与方向 2 的两个原型，dev 里给用户对比选。

### 🟠 悬着的事，需要用户点头

1. **推送远端**：本地领先 `origin/main` **9 个提交**（含 2026-09-24 的重影修复提交）。按铁律「推送前先问」，未推。
   2026-09-23 与 09-24 各问过，均未获答。
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

---

## 三、当前状态快照（2026-09-24 午后部署后实测）

| 项 | 状态 |
|---|---|
| 本地 HEAD | `8f96606` 重影修复 + 归档标题加宽（其前 `be89c6c` 收尾、`ea04f8b` Swup 过渡） |
| 与远端 | **ahead 9**，全部未推送（推送前先问；09-23、09-24 问过未获答） |
| 本地构建 | 退出码 0，37 页，dist **261** 个文件 / 26M |
| `npm audit` | **0 vulnerabilities** |
| 线上站点 | **2026-09-24 午后已上重影修复 + 标题加宽**（chunk md5 核对一致）；veil 整体渐隐仍在、待换（第一节 🔴） |
| 服务器回滚资产 | `dist.old` 与 `dist_backup_20260924_*` = 含重影 bug 的 Swup 版；`dist_backup_20260920_234618` = pre-Swup 版。**均保留中** |
| dev server | 后台运行中（任务 `b5wk43iua`），可直接用 |
| 我的浏览器 surface | 尺寸时有时无（本会话一度 506×718 可用、截图偶发不可用）；**观感验证仍交给用户** |
| 临时文件 | 本会话 `/tmp/chenblog_dist.tar.gz` 本地与服务器均已清 |

---

## 四、维护本文件的规矩

1. **每次会话结束前更新**：改「最后更新」日期、刷新第三节状态快照、
   把本次做的事并进第二节（旧内容可压缩，别无限堆积）、更新第一节的下一步。
2. **不复述 AGENTS.md**：规则、部署流程、版本天花板、依赖坑位都在那边，这里只写"现在什么状态、接下来干什么"。
3. **同样受凭据纪律约束**：面板端口、密码、token、私钥一律不写。仓库是公开的。
4. 第一节永远放**下次该做什么**，让新会话打开文件第一眼就知道从哪接手。
