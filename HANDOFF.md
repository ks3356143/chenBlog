# HANDOFF — 会话交接

> **分工**：`AGENTS.md` 存长期不变的规则与事实；本文件存**会变的状态**与**下一步该做什么**。
> 本文件不重复 AGENTS.md 的内容，只引用。每次会话结束前必须更新本文件。
>
> 最后更新：**2026-09-23 夜，Swup 页面过渡已上线**

---

## 一、下次会话第一件事

### 🔴 等用户反馈：Swup 过渡的观感

我的 in-app 浏览器 surface 是**零尺寸隐藏态**（`innerWidth=0`），resize morph 与遮罩节奏**无法肉眼验证**，
只做了机制层验证。等用户硬刷新后确认：

1. 拖窗口边缘跨断点：是否为"拖拽期间布局保持 → 松手后 240ms morph"。
2. 从滚动位置点分页/相关文章/前进后退：是否还跳顶（应被 `#page-veil` 遮住）。
3. 观感不对的可调项：时长/缓动（`transitions.css`）、或给侧栏/主栏加 `view-transition-name`
   做元素级 morph（更丝滑，工作量更大）。

### 🟠 悬着的事，需要用户点头

1. **推送远端**：本提交后本地领先 `origin/main` **6 个提交**。按铁律「推送前先问」，未推。
2. **3 个 Astro Audit a11y 提示未修**（dev toolbar，生产无）：空 `<h1 class="sr-only">`
   （`Layout.astro:94` 首页 title 为空）、分页禁用态 `<a href="#">`（`Pagination.astro:60`）、
   一条偶发 h3（首页复现不出，疑似 hydration 前瞬时态）。用户尚未决定修不修。

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

---

## 三、当前状态快照（2026-09-23 夜部署后实测）

| 项 | 状态 |
|---|---|
| 本地 HEAD | 本次「Swup 过渡」提交 |
| 与远端 | **ahead 6**，全部未推送（推送前先问） |
| 本地构建 | 退出码 0，37 页，dist **261** 个文件 / 26M |
| `npm audit` | **0 vulnerabilities** |
| 线上站点 | **Swup 版已上线**（2026-09-23 夜部署），HTTP 200 |
| 服务器回滚资产 | `dist.old`（本次替换前的 Swup 前版本）+ `dist_backup_20260920_234618`，**保留中** |
| dev server | 后台运行中（本会话起的，PID 见任务 `bdm0n7hx3`） |
| 我的浏览器 surface | 零尺寸隐藏态，**不能用于观感验证**，只能跑机制断言 |
| 临时文件 | `/tmp/firefly-ref`（调研克隆）待清；服务器 `/tmp` 包已按流程删除 |

---

## 四、维护本文件的规矩

1. **每次会话结束前更新**：改「最后更新」日期、刷新第三节状态快照、
   把本次做的事并进第二节（旧内容可压缩，别无限堆积）、更新第一节的下一步。
2. **不复述 AGENTS.md**：规则、部署流程、版本天花板、依赖坑位都在那边，这里只写"现在什么状态、接下来干什么"。
3. **同样受凭据纪律约束**：面板端口、密码、token、私钥一律不写。仓库是公开的。
4. 第一节永远放**下次该做什么**，让新会话打开文件第一眼就知道从哪接手。
