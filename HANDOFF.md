# HANDOFF — 会话交接

> **分工**：`AGENTS.md` 存长期不变的规则与事实；本文件存**会变的状态**与**下一步该做什么**。
> 本文件不重复 AGENTS.md 的内容，只引用。每次会话结束前必须更新本文件。
>
> 最后更新：**2026-09-28 夜：文章下拉 + `/series/` + `/tags/` + SeriesNav 已实现并本地实测，待用户验收与部署**

---

## 一、下次会话第一件事

### 🔴 待验收 + 待部署：顶部「文章」下拉与系列/标签页（2026-09-28 夜实现）

本地已提交、**线上还没有**（线上仍是 09-28 白天那版：无下拉、无 /series/、无 /tags/）。
用户验收点：
1. 桌面（≥1024px）hover/点击「文章」出下拉，四项 归档/分类/标签/系列；键盘 Tab→Enter/Space/↑↓/Esc 能用。
2. 移动端汉堡里「文章」可展开子菜单，箭头旋转、不撑破面板。
3. `/series/` 两张卡片（CSS100Day 25 篇 / CodePen 1 篇），点开手风琴、互斥收起。
4. 文章页「属于系列：CSS100Day」导航盒展开后当前篇标"本篇"、序号按天数排。
5. **Swup 软导航前后**上述交互都还工作（这是本项目最容易坏的一块）。
→ 认可后走 AGENTS 第六节标准流程部署；细节与规矩在 AGENTS 第五节 16、17。

### ✅ 已完成（不用再管）

- **2026-09-28 白天**：全站体检 5 处修复（about 死链+邮箱、空 h1、重复 h1、标题层级、分页假链接）
  已部署并公网验收。
- **2026-09-24 夜**：过渡/分类栏/归档/横幅/品牌标识 6 笔，用户验收通过。

### 🟠 悬着的事，需要用户点头

1. **部署上面那批** + **推送远端**（本地领先 `origin/main` 29 个提交；铁律：推送前先问）。
2. **about 页对外邮箱**：已统一到 `314298729@qq.com`；若 `xiaye@msn.com` 才是收件地址，显示文本也要一起换。
3. **`storybook` 技能搬不进仓库**：`E:\works\skills\storybook` 在本机不存在（E 盘没有 `works` 目录；
   C/D/E 盘按目录名与 `SKILL.md` 内容全搜过，也没有任何 storybook 技能）。它已作为插件技能注册
   （列表里的 `qoder-guide:storybook`），可直接用。要落进仓库需用户给出真实源路径，
   且注意本仓库公开——第三方技能正文入库等于发布到公网。

### 🟡 AGENTS.md 第九节的存量待办

- 3 个文章方向等用户拍板（URL 用不用中文 / 要不要配封面 / 要不要文章脚手架）
- 宝塔面板密码曾在对话中明文出现过，用户选择暂不改；面板 IP 白名单未开

---

## 二、历次会话做了什么

### 2026-09-28 夜：顶部「文章」下拉 + `/series/` + `/tags/` + 文章页系列导航盒

用户点名照 `firefly.cuteleaf.cn/series/` 做。先扒参考站编译产物、再 sparse clone Firefly 仓库读实现
（`navBarConfig.ts` 的 children 结构、`getSeriesList`/`sortBySeriesOrder`、`series/index.astro` 手风琴、
`SeriesNav.astro`、frontmatter `series`/`seriesOrder`），确认它**没有 `/series/<slug>/` 详情页**，
所以系列页做成单页手风琴。四个决策由用户拍板：下拉四项（含分类）、新建 `/tags/`（pill 仍跳归档筛选）、
一起加 SeriesNav、系列名用 `CSS100Day`（跟标题前缀，而非 tag 的"CSS100天"）。
改动分三笔：① schema + 26 篇 frontmatter + utils 聚合函数；② `/series/` `/tags/` + SeriesNav
（手风琴 CSS 放全局 `mainSingles.css`，避开 Swup 不换 head 的坑）；③ 导航配置化 + 桌面/移动下拉。
唯一一处**主动偏离参考站**：桌面下拉额外支持点击展开（触屏没有 hover），已在 AGENTS 五-16 标明。
验证用定宽 iframe（1440/375）+ 注入 `transition:none` 取稳定态读计算样式：
下拉 opacity 0→1、箭头 `rotate:180deg`、手风琴 maxHeight 0→1234px 且互斥收起、
SeriesNav 38px→960px 且当前篇带"本篇"、移动端子菜单 0→160px 零横向溢出、
从首页经下拉软导航到 `/tags/` `/series/` 正常。dist 重扫 40 页 0 缺失引用、标题审计 0 问题。

### 2026-09-28：验收通过 + 全站体检（4 条待办里 2 条是假的，5 处真问题已修）

用户说"看还有哪些有问题，不要问我直接解决"，于是把 AGENTS/HANDOFF 里的待办**逐条实测复核**再动手。

**两条"已知缺陷"被证伪**（都记了不止一次会话，白挂着）：
1. `heart.svg` 线上 404 —— 引用在 ` ``` ` 围栏内，是示例代码文本，页面没有 `<img>` 元素、不发请求。
   grep 得到是 expressive-code 把整段代码塞进复制按钮 `data-code` 属性所致；第6天那处实际还是
   `./jessica-potter.jpg`，文件名都记错了。
2. "代码块语言徽章与行号从未渲染过" —— **两者一直正常**：徽章是 `[data-language]::before` 伪元素
   （不在 HTML 文本里），行号是 `div.gutter > div.ln`（第10天页实测 124 个）；上次拿 `ec-line-numbers`
   这类不存在的类名去查，自然"零产出"。
3. 附带更正：第五节 4 原先说 `dark:` class 无效——`global.css:3` 早把 dark 变体绑到 `[data-theme=dark]`，
   `dark:` 是好用的（差点把 20 个文件里的 dark: 当死代码"清理"掉）。

**真正修掉的 5 处**（`npm run build` 通过、dist 重扫 0 缺失、标题审计 38 页 0 问题）：
- `about.md` 的 `[暂未部署](暂未部署)` 死链 → `[亦林](/)`（全站唯一真 404）
- `about.md` 邮箱 `mailto` 与显示文本不一致 → 统一为 `314298729@qq.com`
- 空 h1：`Layout.astro` 的 sr-only h1 加 `?? "YILIn"` 兜底（首页与 `/2/` `/3/` 之前是空的）
- 重复 h1：`/about/` 正文自带 h1，加 `contentHasH1` 属性抑制注入；`/categories/` 删掉页面自己那个多余 h1
- 层级跳变与假链接：悬浮目录 / 评论区 / 相册卡 `h3`→`h2`；分页禁用态去掉 `href="#"`（改由 Astro 省略属性）

**排查方法固化**：按源码围栏逐行判定 + 逐路径核 dist，别 grep HTML 字符串当证据 → 写进 AGENTS 第九节。
新规矩（每页一个非空 h1、区块标题从 h2 起、禁用态不写 `href="#"`）→ AGENTS 第五节 13、14。
另按用户要求把**参考源**固化进 AGENTS 第一节：`firefly.cuteleaf.cn` + `github.com/CuteLeaf/Firefly`。
当天用户授权后按 AGENTS 第六节标准流程部署上线，并从公网逐项验收（死链引用 0、`/ /2/ /3/` h1 均为 `YILIn`、
categories 单 h1、首页 `href="#"` 0 次、目录/评论区/相册卡均为 h2）。

### 2026-09-24 夜：过渡 1:1 照搬参考站 + 一批对齐（已上线，6 笔，09-28 验收通过）

用户三次否掉自创过渡后点名 cuteleaf；扒其编译产物发现**数值本就逐字节相同，差在挂载位置**，
于是 `.transition-main` 移到 `#swup-container`，编排（进度条 / `visit:start` 回顶 / `is-page-transitioning`）、
CategoryBar（不隐藏 + 软高亮 + 更多 pill）、`/categories/` 页、归档 SSR、横幅高矮过渡、品牌标识全部照搬或对齐。
提交 `4a97845 ffda5c0 da68cd4 a512fc5 902b56e b713fbf`，用户当次授权部署，已按第六节流程上线
（线上核对：mark 的 `stroke="var(--primary)"`、`--banner-height-non-home` 在 CSS bundle、logo.png 引用 0）。
细节在 AGENTS 第五节 12、第十节 5/9。
教训入记忆 `page-transition-copy-cuteleaf.md` 与 `measure-visual-bugs-programmatically.md`（隐藏标签页测不了时序）。

### 更早（2026-09-23 ~ 09-24 晚，均已上线，细节在 AGENTS 第十节）

- 09-23：依赖 patch 升级（audit 21→0）+ Swup 页面过渡首版 + 窗口缩放 morph；四个坑入第十节 1-4。
- 09-24 白天：手机滑动重影修复（resize 只在宽度变化时 morph，第十节 6）+ 归档时间线移动端列宽。
- 09-24 下午~晚：过渡观感三轮迭代（veil 否 → 幕布否 → Firefly 式 120ms 滑移）+ PostCard scoped 样式
  移入 global.css（Swup 不换 head 的入口页依赖，第十节 2）+ 时间线年份列宽回修。

---

## 三、当前状态快照（2026-09-28 夜实测）

| 项 | 状态 |
|---|---|
| 本地 HEAD | 本次功能 4 笔：`0ea14c3` 文章页接入 SeriesNav、`2c51e26` 导航配置化+下拉、`9b5ec12` /series/ + /tags/ + SeriesNav、`39c9ae1` schema + 26 篇 frontmatter（其前是白天 4 笔体检与文档提交，末为 `1e1b365`） |
| 工作区 | 只剩 AGENTS/HANDOFF 文档改动（收尾提交） |
| 与远端 | **ahead 29**，全部未推送（推送前先问） |
| 本地构建 | 退出码 0，**40 页 / dist 261 文件 / `_astro` 187 / 27M**，热缓存 3.6~7s；引用扫描 **0 缺失**、标题审计 **0 问题** |
| `npm audit` | **0 vulnerabilities** |
| 线上站点 | 停在 09-28 白天那版（5 处体检修复）；**下拉 / /series/ / /tags/ / SeriesNav 均未上线** |
| 服务器回滚资产 | `dist.old` + `dist_backup_20260928_121051` + 多个 `dist_backup_20260924_*` + `dist_backup_20260920_234618`。**均保留中** |
| dev server | 后台运行中（任务 `b91ngmhhy`，端口 4321），下次可直接用 |
| 本机网络提示 | `curl https://github.com/...` 返回 `HTTP 000` 是 Windows schannel 吊销检查失败（`CRYPT_E_NO_REVOCATION_CHECK`），**不是站点问题** |
| 既存小坑（本次未动） | `--radius-large` 被 `markdown.css:150` 与 about 页使用却从未定义；`MobileMenu.astro` 里 `transform: translateY()` 是空参数非法声明；`--panel-border-color` 同样未定义（下拉面板已改用 `--line-divider`）。都是历史遗留，改动前先确认意图 |
| 临时文件 | 本地与服务器 `/tmp` 已清（扫描脚本、sparse clone 的 Firefly 仓库、参考站 HTML） |

---

## 四、维护本文件的规矩

1. **每次会话结束前更新**：改「最后更新」日期、刷新第三节状态快照、
   把本次做的事并进第二节（旧内容可压缩，别无限堆积）、更新第一节的下一步。
2. **不复述 AGENTS.md**：规则、部署流程、版本天花板、依赖坑位都在那边，这里只写"现在什么状态、接下来干什么"。
3. **同样受凭据纪律约束**：面板端口、密码、token、私钥一律不写。仓库是公开的。
4. 第一节永远放**下次该做什么**，让新会话打开文件第一眼就知道从哪接手。
