# AGENTS.md — 项目长期指令（常驻层）

> 陈俊亦的个人博客。本文件是**每次对话由 harness 自动注入的常驻规则层**。
> 最后更新：**2026-10-12（从 Qoder 交接给 DeepSeek Harness，同日完成文档分层改造）**。

## ⛁ 分层规矩（接手的人先读这一段）

harness 注入链 = `~/.dsh/AGENTS.md` → `AGENTS.md` → `AGENTS.local.md`，**合计封顶 65536 字节，超出被静默截断（不报错不告警）**。
本文件原先 162KB，等于**第六~十节从来没进过任何会话的上下文** —— 这就是"每场会话都重新查一遍同样的坑"的根因。现在拆三层：

| 层 | 位置 | 内容 |
|---|---|---|
| **常驻层** | `AGENTS.md`（本文件） | 每场会话都要用到的结论、禁令、**分册索引** | 
| **私密层** | `AGENTS.local.md`（不入库） | 部署目标真实值 + 展开版部署命令 |
| **分册层** | `docs/agents/*.md`（**不自动注入，要自己 Read**） | 原第五~十节的**逐字全文** |

- `config.md` — 原第五节全文（**五-1 ~ 五-42**，每条的根因与实测数字）
- `deploy.md` — 原第六节全文（路径表 / 缓存策略 / 标准流程 / 已知坑 / 面板与凭据 / 铁律）
- `collab.md` — 原第七节全文（收尾铁律 + 日常约定，含行尾与跨工具路径引号的全部细则）
- `writing.md` — 原第八节全文（发稿流程 8 条 + **八-9 同步自检标准与「站内故意加」清单** + frontmatter + 图片规矩）
- `todo.md` — 原第九节全文（历批记录 / 版本天花板 / 依赖坑 / 运维）
- `swup.md` — 原第十节全文（Swup 过渡的坑 **1 ~ 17**）
- `harness.md` — **新增**：工具链纪律与验证取证办法（2026-10-12 从上一任的 22 份跨会话记忆里提炼）

🔴 **条目编号（五-16 / 八-9 / 十-14）两层通用**。本文件每条只留"钩子 + 禁令"，**够判断要不要去读全文，不够动手**。
🔴 **动到下列任一类工作前，必须先 Read 对应分册**：改 markdown 插件链 / 部署 / 发稿与手册同步 / Swup 与重 init / 批量改写文件 / 验收取证。
⚠️ **改完本文件或 `AGENTS.local.md` 必须跑 `npm run docs:check`**（核注入预算 + 分册存在性 + 编号引用完整性）。原先"顶部 52 行第 X 趟流水账"已删（与 HANDOFF 第一节重复）→ **易变状态只看 `HANDOFF.md`。**

> 本次交接（2026-10-12）：① 分层（六份分册与原文件 L196–末行逐字节相同，控制组校验过）② 上一任的跨会话记忆全部落盘进 `harness.md` + `AGENTS.local.md`（原先散在用户目录 `.qoder-cn`，卸载即消失）③ 清掉上一任专属提法（见文末附表）④ 产物基线与 `dist` 实测对齐。

## 📌 开始工作前先读 [`HANDOFF.md`](./HANDOFF.md)

**分工**：本文件存**长期不变的规则与事实**；`HANDOFF.md` 存**会变的状态与下一步**。
用户会定期删会话记录 → 对话上下文不可依赖。新会话：先看 HANDOFF 第一节知道**从哪继续**，再按索引读需要的分册。
用户说「**参考**」时基准固定是这两个：https://firefly.cuteleaf.cn/ 与 https://github.com/CuteLeaf/Firefly 。
**每次会话结束前必须更新 `HANDOFF.md`**（第七节收尾铁律）。

## 一、这是什么项目

个人博客，**纯静态站点**（Astro SSG），部署在阿里云 + 宝塔面板 + Nginx 上。

- 线上地址：http://47.108.230.220/ （目前是 IP，**没有域名**）
- 文章 28 篇（26 篇中文 URL 的 CSS100Day/CodePen + 2 篇 ASCII slug 的 `/posts/ccnewtools-manual*`），
  UI 和提交信息全部为中文

### 参考源（用户说"参考"时，默认指这两个）

本项目基于 **Firefly** 模板裁剪，所以效果对标一律看这一对：

| 用途 | 地址 |
|---|---|
| **线上参考站**（看效果、扒编译产物） | https://firefly.cuteleaf.cn/ —— 文章页样例 https://firefly.cuteleaf.cn/posts/firefly/ |
| **模板源码仓库**（读实现、查组件结构） | https://github.com/CuteLeaf/Firefly |

用法约定：

1. 先扒**参考实现**再动手，不要凭想象自创。参考站是 Astro 产物，直接 `curl` 它的
   `/_astro/*.css` 与 `page.*.js` / `Layout.astro_*.js` 等 chunk 看真实数值与挂载位置；
   源码仓库用 sparse / `--filter=blob:none` 浅克隆只取所需目录
   （本机直连 GitHub API 与 jsDelivr 常不通，绕行办法见 `docs/agents/harness.md` A-6）。
2. 参考里没有的功能要明说"参考站没做"，再决定是否按业界标准做法自行实现
   （例如窗口缩放 morph 就是 Firefly 本体没有的，见第十节 6）。
3. 参考站自身也是 Astro + Swup + Tailwind，对比时**只看它编译后的产物**，别被别的技术栈的教程带偏。
4. 页面过渡这一项已有更细的"1:1 照搬"结论与踩坑，统一见第十节 5。
5. ⚠️ **照抄参考站要连 Tailwind 的数值类一起核，别只核结构**（2026-10-10 波纹那条）：
   同一行 `class` 里的 `max-h-*` / `min-h-*` / `h-[Nvh]` 这类**尺寸类**走样时不报错、不告警，只是"看着小一圈"。
   本次 `#header-waves` 我们写 `max-h-12.5`（50px 上限），参考站是 `max-h-37.5 min-h-12.5`（150px 上限 / 50px 下限），
   于是横幅下那道波纹带一直比参考站矮 2.7 倍。
   → 核法：把两边的**渲染高度量出来对比**（定宽定高 iframe + `getBoundingClientRect`，`vh` 类必须给 iframe 真实高度才准），
     光比源码字符串会漏掉 `--spacing` 换算这一层（Tailwind v4 里 `12.5` = 50px、`37.5` = 150px）。

## 二、技术栈

| 层 | 选型 |
|---|---|
| 框架 | Astro **7.3.4**（SSG，非 SSR） |
| 交互组件 | Svelte 5.57.1（runes 语法）+ `@astrojs/svelte` 9.0.1 |
| 样式 | Tailwind CSS **4.3.3**（`@tailwindcss/vite`，**v4 无 tailwind.config.js**，配置写在 CSS 里） |
| 语言 | TypeScript **6.0.3**（⚠️ 不能升 7，见第九节） |
| 内容 | MDX（`@astrojs/mdx` **8.0.2**）+ Content Collections |
| Markdown 处理 | `@astrojs/markdown-remark` **7.3.1**（⚠️ 必须显式声明，见第五节）|
| 代码高亮 | astro-expressive-code **0.44.2**（one-light / one-dark-pro，内部重命名为 `light` / `dark`） |
| 图表 / 公式 | Mermaid **11.17.2**（⚠️ 不能升 12）、KaTeX **0.18.7** |
| 页面过渡 | Swup **4.10.0**（脚本重执行改为自己写容器作用域钩子，**2026-09-30 弃用 `@swup/scripts-plugin`**，原因见第十节 11） |
| 其他 | Fancybox 图库、astro-icon 1.2.0 + Iconify |

> 2026-09-21 做过一次全量依赖升级，`npm audit` 从 21 个漏洞（2 critical）降到 **0**（**当时快照，非现状**），
> 并通过干净 `npm ci` + 构建验证。升级中的坑与版本天花板全部记在第五、九节。

**注意**：Tailwind 4 + Astro 7 + Svelte 5 都是较新的大版本，网上很多教程是旧版写法，改配置前先确认版本。


## 三、常用命令

```bash
npm run dev        # 本地开发，http://localhost:4321
npm run build      # astro build + Pagefind 索引，产物在 dist/（含 dist/pagefind/）
npm run preview    # 预览构建产物——【搜索与交互类验证只能在这里或线上做】
npm run check      # astro check（@astrojs/check 0.9.10）：覆盖 .astro/.svelte，tsc 看不到这两类
npm run docs:check # 核 AGENTS.md/AGENTS.local.md 注入预算 + 分册编号引用完整性（改文档后必跑）
npm run probe      # 定宽浏览器探针（Playwright），用法见 docs/agents/harness.md
npm run icons      # 由 public/favicon.svg 重生成整套站点图标（PNG/ICO）
npm run covers     # 由 src/assets/postImages/covers/*.svg 重生成列表页自动封面（webp）
npm run new:post -- --day 29 --title "标题"   # 文章脚手架（ASCII slug + 只写 9 个真在用的 frontmatter）
```

**验证手段只有三样**：`dev` 看效果 + `build` 确认能构建通过 + `npm run check` 查类型。没有 lint / test 脚本，也没有部署脚本。

> `npm run check` 当前基线：**0 error / 3 条 hint**，**这 3 条是故意留的、别当 error 追**：
> ① `SiteStatus.astro:123` `siteStartDate` 是 `define:vars` 注入的（tsc 看不到但运行时真有）；②③ `meCard` / `CopyShare`
> 各一条 `execCommand` 的 ts(6387) deprecated（纯 HTTP 下没别的出路，五-38；且 `CopyShare` 那条脚本是 `is:inline`，**不能写 TS 断言去压**，五-39）。
> `src/modules.d.ts` 里那条 `declare module "@rehype-callouts-theme"` 是给 check 准备的——它是 `astro.config.mjs` 的
> **vite alias**，tsc/Volar 不解析 alias，删了报 ts(2882)。它比 tsc 慢得多（冷启动 20~30s），别每改一行就跑。
> 老的 `npx tsc --noEmit -p tsconfig.json` 仍应退出码 0（它快，适合随手核）。

查漏洞要**显式换官方源**（默认 registry 是 npmmirror，它不实现 audit 接口，会报 `404 NOT_IMPLEMENTED` 而不是给结论）：
`npm audit --registry=https://registry.npmjs.org` —— **每次现跑、别引用旧数字**（2026-10-12 实测 **23 条 / 退出码 1**；2026-09-21 那次是 0）。⚠️ **禁用 `npm audit fix --force`**（会把 mermaid 降级撞第九节天花板，细则见 `todo.md`）。

🔴 **每天开工跑 `npm outdated` + 上面那条 audit（都只读）**；**`Latest` 不是升级目标**（mermaid/ts 撞天花板），大版本升级要他点头（细则 `todo.md`）。

⚠️ **`dev` 下站内搜索一定不可用**：Pagefind 索引是 `astro build` 之后才生成的，dev 服务不认 `dist/pagefind/`，
组件会显示"开发模式下没有搜索索引"——**这是设计，不是 bug**（参考站在 dev 下塞假结果，我们塞真提示）。

## 四、目录结构（关键位置）

```
AGENTS.md             # 常驻规则层（本文件；是否超注入预算由 npm run docs:check 判定，别在这里写死数字）
AGENTS.local.md       # 🔒 私密层：部署目标真实值 + 展开版部署命令。已 .gitignore，绝不入库
docs/agents/*.md      # 分册层：原 AGENTS 五~十节全文 + harness.md（不自动注入，按需 Read）
docs/superpowers/     # 历史设计文档（上一任留的，含影响域分析），保留不动
astro.config.mjs      # 所有插件和 markdown 处理链的唯一配置入口
src/content.config.ts # 文章 frontmatter schema（改文章字段前必看）
src/config/siteConfig.ts    # 站点总开关：分页数、图片格式、页面开关、site_url
src/config/navBarConfig.ts  # 顶部菜单项（含「文章」子菜单）——改菜单只改这里
src/config/           # 另有 backgroundWallpaper / commentConfig / effectsConfig / galleryConfig（相册清单，见五-28）
public/gallery/<id>/  # 相册图片本体，按 1.jpg 2.jpg 序号命名；与 galleryConfig 的 id 一一对应
src/content/posts/    # 28 篇文章（26 .md + 2 .mdx）；images/ 是空的历史遗留目录
src/content/spec/     # 单页内容（about 等）
src/content/dynamic/  # 动态（说说）：一条一个 md，文件名 YYYY-MM-DD-HHMMSS.md 即条目 id
src/pages/            # 路由：about / archive / categories / tags / series / dynamic / guestbook / gallery / posts/[...slug] / [...page]
src/pages/api/dynamic.json.ts  # 动态数据端点：build 时预渲染成 dist/api/dynamic.json
src/pages/rss.xml.js  # RSS 已实现
src/components/pages/dynamic/  # DynamicFeed.svelte（取数+分页）+ DynamicItemTemplate.astro（<template> 骨架）
src/components/card/  # 侧栏卡片：SiteStatus / Calender / DynamicSidebar（最新动态）/ SiteInfo（站点信息，均构建期静态）
src/layouts/          # BaseLayout.astro + Layout.astro
src/plugins/          # 8 个自研 remark/rehype 插件（见下）
src/modules.d.ts      # 只有一条 declare module "@rehype-callouts-theme"（给 astro check 用，三节有说明）
public/assets/js/reinit.js  # ⚠️「导航后重 init」注册表：onReinit/reinitOnce 的唯一实现，BaseLayout head 同步加载（十-14）
scripts/generate-icons.mjs  # 由 public/favicon.svg 生成全套图标（npm run icons）
scripts/generate-covers.mjs # 由 src/assets/postImages/covers/*.svg 生成自动封面 webp（npm run covers）
scripts/new-post.mjs        # 文章脚手架（npm run new:post）
scripts/check-docs.mjs      # 文档自检：注入预算 + 分册存在性 + 编号引用完整性（npm run docs:check）
scripts/probe.mjs           # 定宽浏览器探针（Playwright）：给 URL/宽度，返回计算样式、溢出、元素计数
pagefind.yml                # 搜索索引排除规则（KaTeX、data-pagefind-ignore、搜索面板自身）
src/styles/                 # CSS + 一处 Stylus（markdown-extend.styl）
src/utils/                  # content/cover/date/gallery/image/layout/toc/url 工具函数
```

### 自研插件（`src/plugins/`）

这些是项目特色，**改动前务必先读源码**，不要凭想象重写：

- `rehype-email-protection.mjs` — 邮箱 base64 混淆防爬
- `rehype-external-links.mjs` — 外链处理（依赖 `siteConfig.site_url`）
- `rehype-figure.js` — 图片包 figure
- `rehype-component-github-card.mjs` — Markdown 里用 `<github>` 标签渲染仓库卡片
- `remark-image-grid.js` — 图片网格语法
- `remark-excerpt.js` — 摘要提取
- `remark-reading-time.mjs` — 阅读时长
- `remark-directive-rehype.js` — 指令节点转换

## 五、配置约定（**索引** — 全文 `docs/agents/config.md`，编号五-N 两层通用）

> 每条只留钩子与禁令；**根因、实测数字、修法、验证步骤都在分册同编号处**。

**环境与产物**
- **1** `site_url` 随环境变（dev `localhost:4321` / build `47.108.230.220`）→ 改地址必须同步改，否则外链、sitemap、RSS 全错乱。
- **2** 封面路径以 `src/` 为基准。**3** 代码块超 15 行自动折叠（"代码消失"就是这个）。**6** 统一 webp q80。**7** `dist/` `.astro/` `node_modules/` 不入库。
- **8** ⚠️ **Astro 7 下不能留空的 `<script></script>`** → `Cannot find the built path for …`，**整页含首页渲染失败**（Astro 6 容忍、7 报错）。
- **9** 基线（2026-10-12 实测）**44 页 / 359 文件 / 21.57MB**，28 篇。**报数字必须带方法**（`du -sh` 按 4K 分块虚高）：`find dist -name index.html|wc -l`、`find dist -type f|wc -l`。⚠️ **加一条动态不动这些数字**。
- **10** `@astrojs/markdown-remark` **必须显式声明**。通则：`astro.config.mjs` 里 import 的每个包都要显式声明，**别赌 peer 自动安装**。
- **11** `allowScripts` 钉精确版本（现只剩 `esbuild@0.28.2`）→ 升级忘了改，npm **静默跳过 postinstall**，只有全新克隆才崩。
- **21** 🔴 **改 `src/plugins/**` 或 markdown 链 → 必须 `rm -f node_modules/.astro/data-store.json` 再构建 + grep 产物确认**（内容缓存在 `node_modules/.astro/`、**按内容哈希失效、插件源码变了它不管** → 退出码 0 但产物是旧的）。⚠️ **别在 dev 运行时删**；同族 `node_modules/.vite/` 会造成"整块功能静默消失、完全像 JS 回归"。
- **30** 构建期记忆化只认 `PROD`；**缓存的是对象引用 → 消费方不许就地改**。
- **31** `<html lang>` = `zh-Hans-CN`；改它要重建 + 搜索 A/B。"中文无词干还原"提示**属正常**。
- **32** 品牌名唯一来源 `siteConfig.siteMeta.name`（「亦林 YILIn」）→ **别在组件里写第五种拼法**。

**UI 与组件**
- **4** 主题走 `<html data-theme>` → **`dark:` 前缀有效**。**12** 品牌标识是内联 SVG，**别换回位图**。**13** 每页恰好一个非空 `<h1>`（正文自带可见 h1 的页面要传 `contentHasH1`），区块标题从 `h2` 起。**14** 禁用态分页箭头别 `href="#"`。**15** `href="#"`+`data-encoded-email` 是邮箱防爬设计，**别当死链修**。
- **16** **改菜单只改 `navBarConfig.ts`**。三条同族禁令：① 只在部分页面渲染的组件 → **布局类 CSS 必须进全局**（Swup 不换 head）② `.astro` 三元分支里**别写 `class:list=[…,cond&&"x"]`**（实测渲染成 `class=""`）③ **本站面板一律直角**。⚠️ Header 在容器外 → `aria-expanded`/`:focus-within` 浮层跳页后不自动清，要三件齐全。
- **17** `seriesOrder` **判空必须 `!== undefined`**（否则 `0` 排到最后）。系列 `CSS100Day` 与 tag `CSS100天` 是两套写法。`/series/` 是单页手风琴。
- **18** Pagefind：**懒加载的索引 URL 必须是变量**（写字面量构建直接失败）；聚焦用 `tick().then()` 不用 `rAF`；毛玻璃 + 直角。
- **19** 图标只有一个源 `public/favicon.svg` → `npm run icons`；**别手改脚本产物**；图标缓存极强，先硬刷新再判断。
- **20** ⚠️ **`.btn-plain` 会盖掉 Tailwind 显隐类** → **把显隐类放到外层不带 `btn-plain` 的容器上**。
- **22** ⚠️ **`style=` 内联压过一切样式表规则（含 `dark:`）** → 内联传主题色必须同时在 `global.css` 亮暗两块定义变量。`var(--x, fallback)` **有 fallback ≠ 没定义也没事**。排查"暗色不生效"**先看有没有 `style=`**。
- **26** 新文章一律 ASCII slug + `npm run new:post`；已有 26 篇中文 URL 不动。非系列必须显式 `--slug`（**不做中文音译，猜错就是永久错 URL**）。
- **34** ⚠️ 装饰图 `alt` **必须留空串**（未解码时 Chromium 把 alt 画进图框、跟 Ken Burns 一起飘）。⚠️ **只改调用方等于白改**：`ImageWrapper` 某分支 `alt={alt || "图片"}` 会把空串填回 → **多条渲染分支逐条核**。产物里空 alt 是**裸属性 `alt`**，别用 `alt="([^"]*)"` 匹配。正文截图 alt 有意义，别误伤。
- **35** ⚠️ `CoverImage`：**任何终态都要摘掉 `data-loading`**（否则遮罩无限盖着）。真 bug 判据 `complete===true && naturalWidth>0 && data-loading!=="false"`；**视口外懒加载图带遮罩属正常**。
- **36** ⚠️ **inline 元素的 `border` 会撑高行盒 → hover 画下划线绝不能用 `border-bottom`**（+0.762px，配 `transition:all` 就是 150ms 渐进撑开 = 用户报的"框选/点文字时文字跳"）。**`::selection` 不背这个锅**。`:hover` 无法用 JS 触发 → 用 `Range` 量行 + `style.cssText` 施加声明复测。
- **37** ⚠️ `forwards` 把 `to` 帧 `transform` 永久留在元素上 = 常驻合成层；**换 `backwards` 必须同时删基础 `opacity:0`**（否则动画一结束正文隐形）。
- **38** ⚠️ **裸 IP + 纯 HTTP → 访客浏览器没有 `navigator.clipboard`** → 复制要退回 `execCommand`。**本地 preview 是安全上下文，测不出这个病**。
- **39** ⚠️ `<script is:inline>` **不转译，只能写纯 JS**（TS 断言报 ts(8016) 且浏览器语法报错）。
- **40** ⚠️ **`hidden` 浮层里的图别标 `loading="lazy"`**（`visibility:hidden` 同理）→ `naturalWidth===0` 在此不等于坏图。
- **41** ⚠️ **开合浮层不要靠 `hidden`/`display` 切换**（`display:none` 上没有可插值属性，过渡根本不跑）→ 由**按钮 `aria-expanded` 驱动 `opacity/visibility/transform`**。⚠️ Tailwind **v4** 的 `-translate-x-1/2` 在 `translate` 属性、与 `transform` 互不覆盖（**v3 不成立**）。取证读 `getAnimations()`。
- **42** ⚠️ 图标+文字间距靠**文字侧 `p-1.5`** 撑出（实测 14px vs 裸 span 8px）→ **量实际像素别只看 margin**；**要枚举全部子项 × 全部断点 × 走完空态分支**（本项目就是"只测第一条"漏了「暂无标签」）。

**「看着不对其实是设计/有意为之」清单**（别再当缺陷查）
- **5** ⚠️ **`password` 不是加密文章**（只隐藏评论区 + 猜你喜欢里排除）：**没有密码门 UI、没有解密逻辑，正文照常进 HTML 并进索引**。列表卡锁图标已补（2026-10-13，当前零篇用到）。
- **23** ⚠️ 带时分的日期**必须写 `+08:00`**（Astro YAML 按 UTC、`new Date(str)` 按本地 → **差 8 小时**）；展示端也要显式传 `timezone`。
- **24** ⚠️ 动态 = 构建期 JSON + 客户端克隆 `<template>` → **条目不在 HTML 里、不进搜索索引**（别为此改配置）。侧栏「最新动态」是**构建期静态渲染（主动偏离参考站的岛）**，挂两处；**768–1279px 两处都不显示是参考站同款，别补**。2026-10-13 已补**搜索 / 年份筛选 / 图片画廊**。

**横幅与波浪（2026-10-13 修三处；细节在 `config.md` 五-43 / 五-44）**
- **43** ⚠️ 内容面板起点 = **横幅高 − 3.5rem**（`.content-panel`，切页时 `top` 跟着过渡）。写死 `top-[30vh]` 会比参考站高 99px → 内容压住波浪带、壁纸图与页面底色的硬切交界露出。
- **44** ⚠️ 波浪四层 `<use>` 的 **`x` = `-42.000 / 2.641 / 48.944 / 92.468`**；全写同一个值 → 四条波重叠成一条平的。横幅底部必须有 **`#wallpaper-gradient`**。
- **25** 自动封面 `getPostCover()`：手写 `image` 优先 → 按 `seriesOrder` 轮播 → 无序号按 id 稳定哈希。**只作用于列表卡片**（详情页 banner 与 `og:image` 读原始 `image`，**刻意收紧**）。⚠️ 别把 `.svg` 填进 `autoCoverPaths`（→ **静默不出图**）。卡片**所有断点都是右侧竖条** → **封面要按「无焦点、四角均匀」画**。
- **27** ⚠️ markdown 结果转纯文本时**实体解码必须单趟做完**：`markdown-remark` 输出 **`&#x26;`/`&#x3C;`**（不是 `&amp;`/`&lt;`）→ 多趟 replace 一条都命中不了。**先去标签再一趟解实体**。
- **28** 相册 = **改两处**（`public/gallery/<id>/1.jpg…` 序号命名 + `galleryConfig.albums`）；**每加一个相册页数 +1**；⚠️ **`public/` 原样拷进 dist、不走 Astro 图片优化**。不写 `cover` 时第一张就是封面。地点用间隔号写法（`中国·成都`）。
- **29** 站点信息卡：`博客版本` 读 `package.json.version`（**就是对外展示口径**，发版就改）；`Astro`/`Node`/`系统` 是**构建机的值**（显示 `Windows / x64` **正确**）；构建时间**必须显式传 `timeZone`**。⚠️ **挂两处 = 两个节点 → 必须 `querySelectorAll` 逐个绑定，用 `getElementById` 第二份点不开**。⚠️ **图标只能用真装了的集合**（`material-symbols`/`fa-solid`/`fa6-solid`/`fa7-solid`/`mingcute` + `src/icons/`）：配置里那四个 `mdi`/`simple-icons`/`fa7-brands`/`fa7-regular` **根本没装**（用户拍板先不删也不装）→ **照抄参考站图标名会把构建打挂且 `dist/` 已被清空**。核图标名要读 `icons.json` 的 **`icons` 与 `aliases` 两张表**。
- **33** 🔴 **纯静态 SSG 无 SSR** → ① `Astro.url.searchParams` **构建期恒空**（访客的 `?category=` 永远回不到服务端）→ 必须客户端读 `window.location.search`；② **组件不写 `client:*` 就只出静态 HTML、零 JS** → **判据是数 `<astro-island>`，不是看 HTML 里有没有内容**。两条一起成立 = **代码全对、退出码 0、零报错，功能却恒不生效**。验证**必须硬加载 + 软导航两条都测**，且**仿真软导航要连 URL 一起改**；**数条数要数在岛内部**。

## 六、部署（**摘要** — 全文 `docs/agents/deploy.md`）

> 🔴 本节的登录目标 / 服务器路径 / 宝塔配置文件名**一律是占位符**（仓库公开 = 写进去等于发布）。
> **真实值 + 展开后的可直接执行部署命令在 `AGENTS.local.md`**（仓库根，已被 `.gitignore` 挡掉；**不要提交、不要贴进任何入库文件**）。
> 取不到那份记录**不要猜路径，问用户**。**面板密码 / SSH 私钥 / 任何 token 哪份记录都不存。**

**方式**：本地 `npm run build` + 上传 `dist`；**服务器不跑 build**（那台依赖停在 Astro 6.1.6，`npm ci` 会 peer 冲突失败）。
Nginx 根直接指向 `<NGINX_ROOT>` = `<REPO_DIR>/dist` → **build 完成即上线**，无需拷贝或 reload。
`npm run build` 含 `pagefind --site dist` → **只跑 `astro build` 就打包，线上搜索 404**。

**标准流程（唯一已验证方式，优先于任何部署类技能）**：tar → `scp` 到 `<ECS_SSH>:/tmp/` → 服务器上 `cp -a dist "dist_backup_<ts>"` → 解到 `dist.new` → `test -f dist.new/index.html` → **`chown -R root:root`（必须，坑①）** → `rm -rf dist.old && mv dist dist.old && mv dist.new dist`。
回滚 = `rm -rf dist && mv dist.old dist`；**`dist.old` + 时间戳备份一律保留**（删需用户明确同意）。

**六条已知坑（全部实测踩过）**：① Windows 的 tar 带数字 UID → 解压后属主 `UNKNOWN`，**必须 `chown -R root:root`**；② 服务器上 `curl http://127.0.0.1/` **测不到博客**（Host 头命中 `phpfpm_status.conf`）→ 加 `-H "Host: 47.108.230.220"` 或从外部打公网 IP；③ node 的 `execSync` 在 Windows 走 `cmd.exe` 而非 bash → `/dev/null` 与 `%{http_code}` 被吃掉，出现"所有请求都失败"的假象 → **HTTP 测试直接用 shell 跑 curl**；④ **中文文章 URL 必须 `encodeURIComponent`**，否则 nginx 404；⑤ 服务器仓库的 `package.json`/`package-lock.json` 常是 modified（历史 `npm install` 的垃圾改动），pull 前先 `git checkout --`；宝塔生成的 `.htaccess` `.user.ini` `404.html` `index.html` **无害，别删**；⑥ **线上版本极易滞后**（曾躺三个月）→ 改完必须真部署并**实际访问线上确认**，别只看本地 build 通过。

**缓存策略**（改在 `<CACHE_CONF>`，放 extension 目录是有意的：宝塔不重写它，且在 vhost 顶部被 include）：`/_astro/*` immutable 一年 · `/pagefind/*` no-cache · gallery **图片** 7 天 · 其余（所有 HTML / rss / api json）no-cache must-revalidate（**治的真病是：HTML 原先没有 `Cache-Control` → 浏览器启发式缓存 + 每次部署旧哈希 chunk 消失 → 客户端 404 掉脚本，表现成"某些交互整体失效"**）。
三条铁规：**HTML 要用兜底 `location /` 匹配（写 `\.html$` 一条都命中不了，因为请求的 URI 是 `/` 和 `/posts/xxx/`）**；**gallery 不能用 `location ^~ /gallery/`**（会把那两个 HTML 页一起吃进 7 天缓存）；改完 `nginx -t` 过了再 reload、**动 vhost 前先 `cp -a` 备份到 `<CONF_BACKUP_DIR>`**。`no-cache` ≠ 每次重下（实测带 `If-None-Match` 返回首页 **304**）。
⚠️ `public/` 下**稳定文件名**吃宝塔 js/css 规则的 `max-age=43200`（12h）→ 改 `reinit.js` 这类必须带内容哈希（十-14 末条）。

**面板与凭据**：宝塔是**自签名证书 + 安全入口，不适合浏览器自动化，一律走 SSH**；勿跑 `bt 14` / `bt default`（会明文打印面板密码）。改密码应由用户自己在面板 UI 操作。

**🔴 铁律（2026-10-07 用户改的规矩）**：**改完就推送 + 部署，不用每次问。**
前置条件一条不能省：`npm run build` 退出码 0 + 该做的产物 / 浏览器核验做完 + **把验收结论报给他**，才允许推与上线；**验证不过就不推**。
⚠️ **仍要当次点头的四类**：① **改服务器配置**（Nginx / 宝塔 vhost / extension / 重启 —— 会波及同机**其他项目**）② **任何强推或重写已发布历史**（`--force`、`filter-repo`、`reset --hard` 后推送）③ **删回滚资产**（`dist.old` / `dist_backup_*` / stash）④ **动服务器上的 git 仓库或其他项目目录**。
⚠️ 服务器 `<WWW_ROOT>` 下**并存其他项目**，动手前先只读确认目标是 `chenBlog/dist`（推错目录会毁掉另一个项目）。
⚠️ **该仓库是公开的**（可匿名 `git ls-remote`）→ 任何写进仓库的文件等于发布到公网，**提交前 grep 一遍敏感信息**。

## 七、协作约定（**索引** — 全文 `docs/agents/collab.md`）

### 收尾铁律（用户说「下班 / 结束会话 / 收工 / 今天到这儿」时必须跑完，不要只回一句再见）

1. **清临时文件** — 本地与服务器 `/tmp` 下本次的 tar / curl html / 探测脚本；**临时脚本别丢进项目根**。⚠️ **回滚资产不算临时文件**（`dist.old`、`dist_backup_*`、stash 一律保留；**只有用户明确说"清掉备份"才删**，拿不准就保留并告知）。
2. **整理代码** — 清 `console.log` / 临时注释 / 死代码 / 写死的测试值；无半截实现；`npm run build` 通过。
3. **整理 MD** — **更新 `HANDOFF.md` 是收尾核心动作**：①「下次该做什么」放第一节 ②状态快照（HEAD / 与远端差距 / 产物基线 / 线上版本 / 回滚资产）③本次做了什么 ④悬而未决的事。
4. **去重** — 一件事只在一处讲清，其他引用。**AGENTS 存长期规则、HANDOFF 存易变状态，不互相复述。**
5. **Git 收尾** — `git status` 干净（保留改动要说明原因）；改完就推送 + 部署；**提交前扫敏感信息**。
6. **任务清单** — 关闭已完成的，未完成的写清卡在哪、下次从哪继续。
7. **一句话总结** — 改了什么、线上状态、遗留事项。**不复述过程。**

⚠️ **向他提过但他还没答的问题，收尾时必须逐条落进 HANDOFF 的「待用户拍板」清单** —— 只在对话里说过等于没说。
⚠️ **修好一项就当场删掉它在 AGENTS / HANDOFF / 分册里的记录**，别留"~~已修~~"式堆积；**动手前先核实这条待办是否还成立**（本节曾连续证伪三条假缺陷，见九节）。**推测要么验证要么删**；文档里的因果陈述要能拿出命令输出佐证。

### 🔴 协作边界（用户明确要求，别再重新试探）

| 场景 | 口径 |
|---|---|
| **修缺陷** | **别回问，直接解决**（原话"不要问我直接解决"）。小决策选一个合理方案落地，**事后一句话说明选了啥 + 可回退路径**。 |
| **做设计 / 定范围 / 数据建模 / 选素材** | **要问，但一次问完、给结构化选项**（2–4 个带「推荐」，他基本选推荐项）。他欢迎批量收决策，**讨厌挤牙膏式追问**。 |
| 他话里带「我想…可以吗 / 能不能 / 到时候给你 X」 | **先答他真正问的那句**；需要的信息压到收到素材之后，**只问不可替代的那一项**（如永久 URL）。 |
| 需求前提不成立 | **先核前提、把数据事实摆出来、带证据重新给选项**，别默默实现退化版本。 |
| 他的素材自相矛盾 | **问一次，然后把裁决留给以后**；同类冲突沿用裁决、只在报告里说一句。**明说我不动他的源文件**。 |
| 他给了一条其实已做完的指令 | **回状态、别重做**：`HEAD == origin/main` 短 SHA、`git status` 计数 0、线上状态与版本号、临时文件与残留进程计数 0。交付固定四项：**URL + 三方是否一致 + 要不要硬刷新 + 残留计数**。 |
| "直接解决"的边界 | 授权的是**决策**，不是**爆炸半径**。扩张到上线/推送就是越权；把"该问"省成猜就是返工。他放行后仍会立刻追加视觉问题 → **部署前先做完视觉自查**。 |

### 日常约定 + 用户口味

- **改之前先跑起来看现状**，不凭想象动手；**改完必须 build 通过再报完成**（但**退出码 0 ≠ 产物是新的**，见五-21）。
- **UI 改动要在浏览器里实测**：通道是 `scripts/probe.mjs`（取证纪律见 `docs/agents/harness.md`）；**交互类缺陷一律 `build` + `preview` 或线上验**（dev 下大多测不出来）。**报"可上线"前先自查视觉一致性**（图标尺寸与相邻控件同档、同一断点只有一个控件、圆角间距跟全站语言一致）。
- **修症状要覆盖全部触发路径**：动手前列「触发路径 × 当前行为 × 处置」表；维度要含**入口页 × 加载方式**（整页加载决定 head 里有什么，客户端导航不换 head）；他说"刷新"就**逐字复现**。⚠️ **重写组件后要回头验自己没打算动的部分**（本项目多轮反馈全是上一轮修复引入的回归）。
- 提交粒度小、一次一件事；提交信息中文。**不引入新依赖前先问；不擅自升级大版本**（他对新增依赖保守，宁可功能降级 → **把零依赖版放第一个并标推荐**）。不确定就问，别猜。
- ⚠️ **批量改文件的行尾与编码纪律**（全文 collab.md）：本仓库 `core.autocrlf=true` 且**没有 `.gitattributes`**，**索引里行尾本身就混杂**（同一文件 CRLF 段与 LF 段并存）。
  → 改完先看 **`git diff HEAD --numstat`**，每个文件只应有你真正动过的那几行；"1 行变 40/40"就是行尾被整片翻转（⚠️ **不只脚本会翻，编辑工具改混合行尾文件也会整片归一化**）。
  → 可靠修法：`git show HEAD:<file>` 取**原始字节**、在 Buffer 上替换（每处先断言命中数 === 1），**全程不做编码转换**。
  → **读写编码必须一致**：utf8 读 + latin1 写（或反过来）会**把整篇中文打灭**（实测 10.9KB→5.1KB、991 个 U+FFFD，且那次是未跟踪新文件、**没有回退路径**）。改完必查三件事：`CRLF=`/`裸LF=` 计数、**`U+FFFD` 必须为 0**、grep 几个正文中文词。
  → ⚠️ **看 diff 规模要带 `HEAD`**（`reset --soft` 后裸 `git diff` 比的是工作区 vs 脏索引）。**别"好心"把全项目统一行尾**（整文件重写式 diff）。
- 组件自述写 frontmatter 的 `//` 注释，**不要声明成 `const DES="…"`**（14 个文件里是只声明不读的死变量）。
- **图像素材一律不要动漫/二次元风格**：要「**景色或技术感的抽象图形**」且**渲染要小**（体积是他关心的维度）。需要新素材**先给选项或样张** —— **"仓库里现成且零引用"不构成采用理由**。走「矢量源 + 脚本渲染 webp」（4 张抽象图形 36KB vs 动漫位图 238KB）。
- **验收靠真机**：他会用自己的浏览器**同时开着同一个 dev server** 边看边点，也用**安卓 + Edge 强刷**验收 → 他报"没效果"**先提示硬刷新**再怀疑实现；观感以他肉眼为准；交付永远附"**手机强刷再看**"。他的反馈常是**口语短句、连发带打断** → **收到打断时等他最后那条整合消息再动手**；"一句好评 + 编号列细节"里**好评不用回，直接处理编号项**（那些常正是我说过"只能你肉眼验"的那些）。复现不出来时他会**发真机截图**（走会话附件）→ 当一手证据：裁切放大 + 采样像素，比在自动化浏览器里推演可靠。
- 他会把技术选型委托给我（"看你觉得性能哪个好"），但**期望我先扒参考实现再给结论**；点名"参考 X"是真的要我对齐 X。

## 八、文章写作规范（**索引** — 全文 `docs/agents/writing.md`）

> 🔴 改到任何文章 / 手册内容前先 Read `writing.md`：**八-9 的同步自检标准与「站内故意加」清单只能从那里读。**

- 他说"发文章"时 **不要发前置问卷** —— 唯一必须问的是**归位（永久 URL）**。语法特性、摘要、分类、标签、日期一律自己定并事后说明。
- **现状**：28 篇 = 26 `.md` + 2 `.mdx`，无草稿。`category` 两个值（设计灵感 26 / 工具 2）→ **再新增分类值先确认**（新值会立刻进分类栏 / `/categories/` / 归档筛选）。
- **分工**：他给 MD 正文 → 特殊语法（Mermaid / `$$` / `:::` / 图片网格 / `<github>` / 外链图）**我自己扫**，扫到就逐项验，**不许"配置装了就当它能用"**；`description` 没给就提草稿；tag「CSS100天」vs series「CSS100Day」两套写法别混。
- ⚠️ **图片路径已在 2026-10-10 更正**（writing.md 原文还写着"本地路径我读不到"，**以这里为准**）：**会话附件发来的图，消息里那个绝对路径能直接读**（哪怕是微信/电脑管家临时目录）→ **别再让他"先放 `public/` 或改成 URL"**。只有他**口头写一个路径**时才受跨工具路径限制（`D:/xxx` vs `/d/xxx`，见 harness.md）。

**正文改写三条硬规矩**（细节在 writing.md）
- **不写 `# 一级标题`**（`Layout.astro` 已注入 sr-only `<h1>`）；小节从 `##` 起。
- **成对英文直引号改中文 `“”`，但 `<` … `>` 之间的内容一律不碰** —— 2026-10-07 把 `class="horizontal-scroll-container"` 的**属性引号**也改了 → 产物 class 带弯引号 → 选择器永不匹配 → **宽表滚动容器死了一个多星期、不报错不告警**。`code span`、围栏、**frontmatter**（`description: "…"` 那对是 YAML 定界符）都要保护。验收要**同时** grep 产物属性 + 在 375px iframe 实测 `scrollWidth > clientWidth`。
- **宽表格必须自己包 `.horizontal-scroll-container`**（`<div>` 后空行、`</div>` 前空行）：表格按最大内容宽排 + 文章页 `overflow-x:hidden` → 375px 下超出部分**既不出滚动条也看不见 = 内容丢失**。既存未修：`css100天-第8天.md`（缩进在列表项内 → **要改他的旧文章，等他点头**）。

**⚠️ 八-9 差量同步手册（必然再现：他发版很快，一天改几次）**
- 他说"软件又升级了使用手册，更新吧"→ **不要重跑发稿流程**（不问归位、不重建文件），做**差量同步**：两边归一化（剥 frontmatter / 去一级标题 / 图片路径映射成 `IMG:NN` / 弯引号还原 / 折叠块引用空行）→ 逐行 diff → **剩余差异必须只剩"站内规矩"四类**。
- **站内规矩四类**：① 宽表包 `.horizontal-scroll-container` ② 围栏补 `text` ③ `**Qn：**` 与答案之间补空行 ④ **顶部块引用第 2 行的平台说明**（`支持平台：Windows x64 / Linux x64 / 银河麒麟 V10 …`，**他手册没有**，2026-10-10 他要求加的 → **别当噪声抹掉**）。
- 🔴 **他要求在站内加的"站内独有"内容（含整句新增），必须当场登记进八-9 清单**（加在哪、原文、为什么、diff 里长什么样）—— **清单本身是下次同步的输入**，漏登记就被抹掉。
- **数 diff 的正确写法**：`grep -cE "^[+-]([^+-]|$)"`，**并单独再数 `grep -cE "^[+-]$"`** —— 纯空行的差异行只有一个字符 `+`/`-`，`^[+-][^+-]` 会把这一整类**全部滤掉**，而它恰是本类同步最多的一类（曾据此差点宣布"自检通过"）。
- **图要不要重转，用"同参数重转一遍比 md5"判定，别看 mtime**（他常重存同名同内容的图）；反向也要防：**截图 mtime 可能比手册还晚** → "手册没动"**不等于**"图没动"。
- **配图不动时，正文凡与图里可读数值冲突都以图为准**并逐条登记偏离；**图一旦重拍，旧偏离自动作废**，必须逐张重新核。
- **改标题 ≠ 改 slug**（URL 仍是 `/posts/ccnewtools-manual/`，只动 `title`）。⚠️ **他说"新发布一篇文章"不一定是要新 URL** → 撞上"内容已存在"时**先把冲突摆出来问一次归位**，别按字面建新的、也别擅自合并。
- 源手册两个反复坑按已定裁决处理并事后说明：版本号滞后 → **全统一成实际版本**；带 `# 一级标题`/直引号/中文图名 → 按上面三条改写。**他的源手册不在本仓库授权范围内，别去改，只提醒。**
- 一次会话他会连发多批小改动 → **每批独立 build + 核验 + 提交推送 + 上线**，不攒大提交；**每批版本号各自 +1**（他看侧栏"博客版本"确认）。
- "他说更新了但 diff 为零"→ **先把 mtime / 字节数 / 搜索结果摆出来问他**（大概率编辑器没存盘），**别自己编内容**。

**frontmatter**（2026-10-12 脚本实测）：schema 13 个业务字段（+4 个 `prev*/next*` 内部字段），**只有 9 个真被写过**：`title` `published` `updated` `description` `tags` `category` `draft`（7 个每篇都有）+ `series` `seriesOrder`（26 篇）。`image` **只在 10 篇且全是空串** → 封面全走兜底。`pinned`/`comment`/`password` **零篇写过**。**新增字段必须先改 `content.config.ts` 的 schema**；**写完文章要顺手写 `series`+`seriesOrder`，否则不进系列。**

**图片唯一正确写法**：`![说明](/images/xxx.jpg)` + 文件放 `public/images/`。❌ 正文里 `<img src="./x.svg">` → 解析成 `/posts/<slug>/x.svg` → 404。✅ 写在 ``` 围栏里**无害**（不发请求 —— 曾害我误报"heart.svg 404"）。相对路径不行、**中文文件名也不行**（一组图放一个子目录，文件名 `NN-语义`）。`src/assets/covers/1,2,3.jpg` 是**站头轮播壁纸**不是文章封面。

⚠️ **配置齐全但从未在生产用过**：**Mermaid、KaTeX、`:::` callout、图片网格** —— 28 篇零使用，四条渲染路径**零实战验证**，首篇用到必须在 `dev` 逐项确认再上线。**已在生产用的别混进去**：代码块折叠（28+ 产物含 `ec-collapse`）、`<github>` 卡片（`/about/` 实渲染 3 张）。

## 九、长期结论与别再尝试的清单（**索引** — 全文 `docs/agents/todo.md`）

> 易变状态与待拍板清单在 `HANDOFF.md` 第一节。这里只留"不看就会重犯"的结论。

**🔴 版本天花板（撞过墙）**：`mermaid` **11.17.2**（`astro-mermaid` peer 只允许 `^10||^11`）；`typescript` **6.0.3**（`@astrojs/svelte` peer 只允许 `^5.3.3||^6.0.0`）。硬升 → `npm ci` ERESOLVE（TS 7 那次实测删掉 `node_modules` 后**装不回来**）。

**🔴 依赖纪律（三条能毁项目）**
- **增量安装不可信，只有干净 `npm ci` 算验证过**（`npm install` 遇 peer 冲突只 warn 一行就静默放行、构建照过，换台机器就失败）。正确序列（**只装一次**）：`npm update --package-lock-only` → `npm ci` → `npm run build`。⚠️ 别先 `npm update` 再 `rm -rf node_modules && npm ci`（白等 3 分钟）、别在 `ci` 前手动删（ci 自己会清）。
- ⚠️ **动 `node_modules` 前必须精确停掉 dev/preview**：开着 dev 就 `npm ci` → `lightningcss-*.node` 被进程锁住 → `EPERM` 删到一半 → **node_modules 被删空、项目当场不可用**。**"停止后台任务"只杀外壳，`astro dev`/`astro preview` 的 node 子进程会变孤儿继续存活** → 按**可执行文件路径 + 尾参数**精确匹配 PID（`$_.Name -eq 'node.exe'` 且 `$_.CommandLine -like '*astro\bin\astro.mjs*preview*'`），杀完用同一条件复查计数 = 0。⚠️ **别拿"项目名 + 关键词"当过滤器**（包装 shell 的命令行带着我发出的命令全文 → **会把自己的 shell 一起吃掉**）。**别批量杀所有 node.exe**。已失败先 `npm install`（增量）救回来再重试。
- `npm ci`/`npm install` 接 `| tail` **会把退出码换成 tail 的** → 失败显示成"成功"。要真实退出码就重定向到文件，**别信管道后的 `$?`**。
- `expressive-code-language-badge` 有**假的 starlight peer**（上游写坏，dist 零 starlight 引用）→ 白装约 19 个包、**不进网站产物**。⚠️ **别用 `legacy-peer-deps` "解决"**（会全局关掉 peer 校验、掩盖真冲突）。
- ⚠️ **prettier 全站格式不符是既存状态**（只有 `tabWidth:4`、没有 `useTabs:true`，源码全用制表符）→ **不要顺手跑 `prettier --write`**。`markdown-extend.styl` 是 Stylus、报 parse error 属正常。

**✅ 已证伪的"已知缺陷"（别再当悬案重查、更别再"修"）**：`heart.svg` 404 · 语言徽章与行号 · "`dark:` 无效" · `CoverImage` 的 `import { Image }` · `--collapsedHeight` · twikoo 尾斜杠 · TypeMechine 每趟 6 次 init（`hooks.on` 从没注册上）。✅ 成立一条：`rounded-(--radius-large)` 这个变量**从未定义** → 该处按**直角**渲染。
🔴 **通则：「文档说坏了」≠ 坏了，也 ≠ 修法对**；取证用 DOM 解析器不用 grep、**选择器必须先在产物里实测出来**。
📖 **完整措辞与"当初怎么查错的"在 `docs/agents/todo.md` 九·补③。**

**⚠️ 用户看过选择不做 / 我判定降级（别当新发现重提）**：Twikoo 无 `defer` · 横幅 `srcset` 缺 750w 档 · 每页两个 `<title>` · 重复 id `cardTags`/`announcement`/`banner` · 两份 `__allPostMetaCache` fetch · 配置里那四行"写了但没装"的假图标集 · Mermaid 两个未定义变量 · 单分类卡收起态更高 · `/site.webmanifest` Content-Type · `tsconfig.json` 的 React jsx 残留。细节见 `todo.md` 九·补②。

**🔴 安全与授权边界**：全历史 **零凭据泄露**；文档已脱敏但**历史未重写**（要 `git filter-repo` + 强推，**他没批准**）。仍未处理：**Twikoo `envId` 是裸 `IP:8099`**（改同域反代要他拍）、面板 IP 白名单未开、一笔已发布提交消息写错（`90a38e5`，当次点头类，没点头没动）。
**凭据纪律：面板密码 / SSH 私钥 / 任何 token 一律不入库、不在对话里明文传递。** 全文见 `todo.md` 九·补①。

## 十、Swup 页面过渡的坑（**摘要** — 全文 `docs/agents/swup.md`）

入口 `SwupManager.astro`；开关 `effectsConfig.ts`；动画 CSS `transitions.css`；容器 `Layout.astro` 的 `#swup-container`。
🔴 **任何"切页后不生效 / 重复生效"的问题，先 Read 分册再动手。**

- **1** `animationSelector` **必须收紧成 `[class*="transition-swup-"]`**。默认值会命中全站 Tailwind 的 `transition-*`，而 `display:none` 子树里**永不结束**的过渡被算进等待集合 → **visit 死锁在 `is-changing is-animating is-rendering`，之后所有导航静默失效（不报错、路径不变）**。
- **2** ⚠️ **Swup 不替换 head，也默认不执行容器内新 script** → ① `slot="head"` 的脚本导航过去**永不执行**；② **组件的 scoped `<style>` 只存在于渲染了它的那一页的 head** → **只在部分页面渲染的组件，布局类与状态机类 CSS 必须进全局样式表**（两次真事故：PostCard 重叠 64px；`CoverImage` 遮罩规则缺失 → **图已下载解码、白遮罩永远盖着、转圈塌成 0px，看起来完全像"资源没加载"** → 排查顺序：**先读 `img.naturalWidth` 与遮罩的 `getComputedStyle().opacity`**，一个 >0 一个 =1 就一定是样式缺失，**别去查网络**；**Svelte 岛同罪且更隐蔽：其 scoped CSS 被内联进单页 head，见十-16**）。
- **3** 别给 `<script>` 用 `define:vars` 传配置 → 会把脚本**内联进每一页**（曾重复嵌入 37 页）。配置在脚本里 `import`。
- **4** **事件名三套并存，改前先 grep**：Swup4 原生 `swup:content:replace`；Swup3 旧名 `swup:contentReplaced`（12 个组件在听，Swup4 **不再派发**）；`astro:page-load`/`astro:after-swap`。SwupManager 统一桥接派发，消费组件一行未改。
- **5** 过渡观感 = **1:1 照搬 blog.cuteleaf.cn 编译产物**。数值两边本来逐字节相同，**决定"跳不跳"的是挂载位置**。⚠️ **不要用 body/祖先元素的淡入淡出** → 实测 Swup 卡死 `is-rendering`、页面停在 opacity 0。
- **6** 窗口缩放 = 冻结 + View Transitions morph（**Firefly 本体没做这块**）。⚠️ **必须只在 `innerWidth` 真变了才触发**（手机地址栏收放只改高度也触发 `resize` → 滚动中反复整页快照交叉淡化，2026-09-24 线上事故）。
- **7** 同 URL 点击被 capture 监听拦截 → 平滑滚顶、不走 visit。**8** `prefers-reduced-motion: reduce` → 不初始化 Swup。
- **9** 首页↔非首页横幅高矮过渡：`visit:end` 后 **500ms 才摘** `is-wallpaper-transitioning`（过渡 450ms，早摘会撤掉 transition 属性、高度瞬间跳变）。**非首页横幅比首页矮是设计如此**。
- **10** `client:load` 的岛**放容器内可用**（重新插入内联 module 即重新求值）。⚠️ 做这类实验**别用连续两次 Swup 导航判断**（动画时序会卡死，看起来像"岛坏了"）→ 用手动换 innerHTML 绕开。⚠️ **Astro 排除以 `_` 开头的文件** → 临时探针页别用下划线开头。
- **11** ⚠️ **`@swup/scripts-plugin` 已于 2026-09-30 弃用卸载**：`{head:true,body:true}` 时 `getScope()` **直接返回 `document`** → 每次导航给**容器外永不被替换的元素**再叠监听（汉堡"一次点击=两次 toggle"净零；还抛 `Identifier 'setTheme' has already been declared`）。现只扫各 container 内 `script:not([data-swup-ignore-script])`。
  → 🔴 **通用结论：「切页后某个开关点了没反应」先怀疑重复绑定，不是监听器丢了。** 判据 = **一次点击引发几次状态变更**（挂 `MutationObserver` 数 class 变更；1 监听 = 2 次），**别用"能不能打开"当判据**（叠成奇数个会诡异地"又好了"，那正是"有时候不灵"的来源）。
- **12** ⚠️ 容器内脚本每次进该页仍重新求值 → 注册在 `document`/`window` 上的监听**按访问页数累加**。现由 `reinit.js` 从结构上消掉（见 14）。
- **13** `twikoo.init()` 会吃掉挂载点：`#tcomment` 渲染后变成 `#twikoo`，**第二次 `getElementById("tcomment")` 必然 null**。查"评论没了"要看 `#twikoo` 在不在。
- **14** 🔴 **「导航后重 init」只能走 `window.onReinit(key, fn, opts)` / `window.reinitOnce(key, fn)`**（实现 `public/assets/js/reinit.js`，`BaseLayout` **head** 同步加载）。**不要再手写 `window.__xxxInit`，不要再直接监听 `swup:contentReplaced`/`astro:page-load` 做重初始化。**
  - 一趟导航被派发**两个事件名** → 同时听两个名字的组件**每换一页跑两遍**（TypeMechine 一趟 6 遍）；helper 用 token 压成一趟一次。
  - **`fn` 每次调用都必须重新查 DOM**（容器整片被换，抓住引用会指到已移除节点）。同一 key 重复注册只换闭包。
  - **选哪个**：被绑元素**会**随容器被换 → `onReinit`；**不会**（`document`/`window`/容器外元素）→ **`reinitOnce`**（两条真漏：`CategoryBar.initScrollFeatures` 让**横滚位移按访问页数叠加**；`FloatingToc.setupAutoClose` 每趟多挂 7 个监听 + 多包一层 `history.pushState`）。`reinitOnce` 的 `fn` **显式 `return false` = 下次再试**，否则被锁死。
  - ⚠️ **真洞**（2026-10-08 用户报"文章页 F5 → 点主页，封面永远转圈"）：Astro 组件脚本是 `<script type="module">`，插入后要**下一个宏任务**才求值，赶不上当趟 `runAll`；而 `ranFor` 初始化成当前 token 又让 `catchUp` 以为跑过 → **该 key 一次都不跑**。触发条件 = 该 key 首次进这个页型 + 注册发生在软导航途中 → **只有"文章页起步 → 首页"会坏**（**手机 Edge 那条"第一次进首页永远转圈"极可能一直是它，不是 Edge、不是懒加载**）。修法：`ranFor` 初始化 **-1** + 导航途中注册的新 key **让出一个宏任务后自查**。⚠️ "注册即跑"是错的（同步脚本那一路会变成一趟 +2）。
  - **验证**（必须 `build` + `preview` 或线上）：① `window.reinitRuns(key)` **每趟导航每个 key 恰好 +1**；② 包 `EventTarget.prototype.addEventListener` 只统计 `document`/`window`，跑几趟差值应为 0；③ **一定拿线上旧构建当控制组**（"10 张封面 2 张遮罩没褪"线上同探针给出**完全一样的数字** → 既存行为，别修）。
  - ⚠️ 改 `reinit.js` 前想清楚缓存：它在 `public/`、稳定名 → 吃 `max-age=43200`。已改为 `?v=<内容哈希前 10 位>`（**没碰服务器**）。⚠️ **哈希必须按 `process.cwd()` 拼路径**（用 `import.meta.url` 在预渲染阶段会指到 `dist/public/` → **ENOENT 打挂构建**）。通则：**往 `public/` 加会被 HTML 直接引用的稳定名文件，都要核它拿到什么 `Cache-Control`。**
  - 🔴 **仿真多趟导航时 `is-changing` 要留到重新插入脚本之后再摘**（提前摘会得出"每趟跑 2~3 遍"的假回归）。
- **15** ⚠️ **「内容随页面变、但位置在容器外」的 chrome 必须登记成 Swup container**（横幅标题 bug）。迷惑点：那层本来就带 `transition-swup-fade`、CSS 也照它写了 → 看起来"已在参与过渡"，**实际只是淡出淡入同一份内容**（表现为"有动画但字没换"、只有 F5 才对）。修法两处：post-meta **移进** overlay 容器 + `containers: ["#banner-overlay-container", "#swup-container"]`。
  - ⚠️ **登记成 container 前先查有没有代码把实例句柄挂在元素属性上**（打字机 `el.__typewriterInstance`）→ 节点被换掉后再也 destroy 不到，**留下孤儿定时器链**。判据：**每秒由打字机回调发起的 setTimeout 次数是否随导航递增**（实测 1→3→2→3→3 有界 = 正常）；**别用"动画还在跑"当判据**。
  - **刻意没照搬参考站的** `#banner-dim-container` / `#left|right-sidebar-dynamic` / `#floating-toc-wrapper`（**侧栏与悬浮目录是本站刻意留在容器外的**）→ 有依据的偏离，**别当漏改补上**。
  - 验证**两向都要测**；核 overlay 容器在**全部 44 页**都存在；post-meta 是 `hidden lg:flex` → **375 下 `display:none` 属正常**。控制台 `[swup] No CSS animation duration…` 先确认**是不是自己探针注入了 `transition:none!important`**。
  - ⚠️ **同族第二处已修（2026-10-13）**：右栏卡片不随软导航更换（`isPostPage ? TOC : 日历`，≥1280px 可见）
    → `containers` 加 `#right-sidebar`。**光加 container 不够**：脚本重跑选择器要覆盖**所有** container、
    `SiteInfo` 要改 `onReinit` + 每轮先解绑、`SiderBarToc` 的 window 监听加哨兵。全文与实测数字在 `swup.md` 十-15 末段。

## 附：本 harness（DeepSeek Harness）与上一任工具的差异

2026-10-12 从 Qoder 接管。**项目规则一条没变，变的是"我能用什么工具"。** 下表全部经过本机实测：

| 事项 | 现在（DSH） |
|---|---|
| 自动注入的指令 | `~/.dsh/AGENTS.md`（当前不存在）→ `AGENTS.md` → `AGENTS.local.md`，**合计封顶 65536 字节**。⚠️ `HANDOFF.md` 与 `docs/agents/*` **不会自动注入，要自己 Read**。 |
| 上一任的跨会话记忆 | **本 harness 没有记忆功能** → 已全部落盘进 `docs/agents/harness.md` + `AGENTS.local.md`。**仓库文件是唯一载体，别再往任何外部记忆系统写。** |
| 浏览器验证 | **2026-10-12 已装 DSH 的 playwright browser-use provider**（在 `~\.dsh\profiles\desktop\`，不在仓库内）。⚠️ **但本会话仍无工具** —— provider 不接管已活动 Session，**要新建/恢复 Session** 才出现 `mcp__playwright-mcp__*`。在那之前用 `npm run probe`（已实测跑通线上页截图与探针）。⚠️ **别改成 `headless: false`**：本机无完整版 `chromium-1243`，而 README 写「启动失败会**拒绝 Session 创建**」→ 会让新会话起不来。回滚备份 `~\.dsh\browser-plugin-profile-backup\`。细节见 `harness.md` C-1。 |
| 右侧「浏览器」面板 | 桌面 profile **默认已启用**（用户按 **Ctrl+T**）。⚠️ 它**不给模型任何工具**（README：用户侧呈现状态），且与我经 MCP 起的浏览器**互不共享状态** → **别承诺"我帮你打开右侧浏览器"**，做不到；要两边看同一页面需改 `mode: attach`（未做）。 |
| 停止后台任务 | `job_kill`：**同样只杀外壳、node 子进程照残留** → 九节的精确匹配流程原样适用。 |
| 长时间命令 | `pwsh` + `run_in_background` → `job_output`/`job_kill`；退出码看 `[exit code: N]`；长输出会被截尾并落盘。 |
| 设计类流程 | 上一任的 `superpowers:brainstorming` **在这里没有同名技能**。语义照旧：**先扒参考实现 → 出短设计 → 停下等批准 → 再写代码**。可用 skill：`ui-ux-pro-max` / `frontend-design` / `design-taste-frontend` / `tailwind-4-docs` / `gsap-*`。 |
| 部署类技能 | **仍用第六节那套手工流程**。上一任装过 `alibabacloud-ecs-code-deploy`（走 aliyun appmanager、要 AccessKey，与宝塔 + Nginx 手工配置可能冲突）；本环境没有它，也不需要。 |
| MCP | 上一任配了 Context7（在线）与 GitHub（已禁用），都在 Qoder 内部；**本 harness 未接入**。扒 GitHub 用 `git clone --depth 1 --filter=blob:none --sparse` 只取所需目录。 |

✅ **原"一条尚未验证"已实测掉，且归因被推翻**：无头探针**造不出隐藏态**（`visibilityState` 恒 visible、开第二标签页不互藏、两种 CDP 覆盖分别被拒/无效）→ "隐藏标签页里 transition 不推进"在这里**不可能自然发生**。上一任看到的 `setTimeout` 拖到 ≥1s 是**真症状、错归因**：CPU 节流 20x 下定时器实测 752~4638ms，而 **transition 与 rAF 完全不受影响**。
🔴 **通则：别拿"页面被隐藏"当默认解释**；判据与复现见 `harness.md` **B-19**。
