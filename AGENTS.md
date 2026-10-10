# AGENTS.md — 项目长期指令

> 陈俊亦的个人博客。每次对话开始时自动读取本文件作为上下文。
> 最后更新：**2026-10-10 下午（发了一条动态；已上线 V0.1.31）**。
> 本批要点：① **发动态的流程跑通了一遍**（`node` 取时间 → 建 `src/content/dynamic/YYYY-MM-DD-HHMMSS.md` 带 `+08:00`
> → build → 核 `dist/api/dynamic.json` + 定宽 iframe 验 `/dynamic/` 与侧栏两处挂载 → 提交推送部署），
> **加一条动态既不增页数也不增文件数**（条目走客户端填模板，五-24），也**不进搜索索引**（别为此改配置）；
> ② 新记一条工具坑见七节末：**Git Bash 里 `TZ=Asia/Shanghai date` 不生效**，取时间一律用 `node`。
> 上一批（10-09 晚间：手册同日第三次差量同步 v1.3.2 → v1.3.3（大纲树收展一段），配图继续不动，V0.1.30）的要点：
> ① 同步流程照旧（归一化逐行 diff + 逐条断言 + 图片 11 条逐字节不变才算过）；
> ② 八-9 两处故意偏离继续保留；③ 中途一次"他说更新了但 diff 为零"是编辑器没存盘，处置口径见八-9 末条。
> 更早（10-09 傍晚 v1.3.2 / V0.1.29）与 10-08（V0.1.26~0.1.28）的细节分别在三节末条、八-7、八-9、十-14 里，此处不复述。
> 🔴 **八-7 补了一条自己埋的哑 bug**：那次「正文直引号改中文引号」把
> `<div class="horizontal-scroll-container">` 的**属性引号**也一起改了方向 → 产物里 class 值带弯引号 →
> 选择器永不匹配 → **八-8 的宽表滚动容器从 10-07 起就是死的**（375px 实测 726px 表只显示 294px、
> 无滚动条 = 内容丢失；改回直引号后 matchedWrappers 0→2、可拖动、页面零横向溢出、桌面观感不变）。
> 新规矩：**`<` … `>` 之间的内容一律不参与引号方向改写**，验收要同时 grep 产物属性与在 375px iframe 里实测。
> 新落盘 **五-36（inline 元素的 `border-bottom` 会撑高行盒 → hover 态画下划线绝不能用 border；
> 以及"`::selection` 不背这个锅"：他说的框选实际触发条件是 hover/active）**
> 与 **五-37（`animation-fill-mode: forwards` 把 `to` 帧的 transform 永久留在元素上 = 常驻合成层；
> 换 `backwards` 就必须同时删基础 `opacity: 0`，否则动画一结束正文隐形）**。
> 🔴 **十-14 补了一条真洞**：`navigating()` 的假设只对「已存在的 key」成立——Astro 组件脚本是
> `<script type="module">`，插进容器要到**下一个宏任务**才求值，赶不上 `content:replace` 当趟的 `runAll`，
> 而 `ranFor` 被初始化成当前 token 又让 `catchUp` 以为跑过了 → **该 key 一次都不跑**。
> 触发条件 = 「本文档第一次进这个页型」+「注册发生在软导航途中」，所以只有**文章页起步 → 首页**这条坏；
> 手机 Edge 那条"第一次进首页永远转圈"（五-35）**极可能就是这个**，不是 Edge、也不是懒加载被中止。
> ⚠️ 修第一版"注册即跑"是错的：同步脚本那一路会变成一趟 +2（实测 `recommended-post`）。
> 顺带把 `reinit.js` 的引用改成带内容哈希（它原本吃 Nginx 的 `max-age=43200`，改动会留给回访用户 12h）——
> **哈希路径必须按 `process.cwd()` 拼**，用 `import.meta.url` 在预渲染阶段指到 `dist/public/` 会 ENOENT 打挂构建。
> 同一批：九节 item 4 的旧结论被推翻（那条 hover `border-bottom` 正是 09-29 补上 `--primary` 才活过来、
> 进而撑高行盒的元凶），五-9 基线口径改成可复现的 `find`/`du` 两条命令。
> 上午那批（V0.1.25：装饰图 alt + 本地封面 load 失败收遮罩）细节只在 **五-34 / 五-35** 讲，此处不复述。
> 2026-10-07 那批（发稿规矩 4 条 + 两条"照抄改名后静默失效"同族病）细节在 **八节 / 九节**，也不复述。
> 代码侧本批：`public/assets/js/reinit.js`、`src/layouts/BaseLayout.astro`、`src/styles/markdown.css`、
> `src/styles/transitions.css`。
> 基线：**43 页 / 351 文件 / `du -sh` 22M（字节 20.99MB）** / 构建约 4.0s（+ Pagefind 0.2s）；文章 **27 篇**；
> `npm run check` 与 `npx tsc --noEmit` 均 **0 error**（check 剩 2 条故意留的 hint）。
> ⚠️ 上一批（2026-10-01：上午批准的四件工程项 + 用户报的横幅标题 bug。落了 **十-14 重 init helper**、
> **十-15 容器登记通则**、六节脱敏成占位符、`npm run check` 成为组件类型入口、五-5 纠正「锁图标」假事实、
> 三节/四节/五-9 同步）已于当日 21:20 上线 **V0.1.21**，细节在九节与十-14/十-15，此处不复述。

## 📌 开始工作前先读 [`HANDOFF.md`](./HANDOFF.md)

**分工**：本文件（AGENTS.md）存**长期不变的规则与事实**；[`HANDOFF.md`](./HANDOFF.md) 存**会变的状态和下一步该做什么**。

用户会定期删除会话记录，所以对话上下文不可依赖。新会话接手时：
先看 `HANDOFF.md` 第一节知道**从哪继续**，再看本文件查**规则与坑位**。
用户说「**参考**」时，基准固定是这两个（详见第一节「参考源」）：
https://firefly.cuteleaf.cn/ 与 https://github.com/CuteLeaf/Firefly 。
每次会话结束前必须更新 `HANDOFF.md`（见第七节收尾铁律）。

## 一、这是什么项目

个人博客，**纯静态站点**（Astro SSG），部署在阿里云 + 宝塔面板 + Nginx 上。

- 线上地址：http://47.108.230.220/ （目前是 IP，**没有域名**）
- 文章 27 篇（26 篇中文 URL 的 CSS100Day/CodePen + 1 篇 ASCII slug 的 `/posts/ccnewtools-manual/`），
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
   （本机直连 GitHub API 与 jsDelivr 常不通，见记忆 `github-network-workarounds`）。
2. 参考里没有的功能要明说"参考站没做"，再决定是否按业界标准做法自行实现
   （例如窗口缩放 morph 就是 Firefly 本体没有的，见第十节 6）。
3. 参考站自身也是 Astro + Swup + Tailwind，对比时**只看它编译后的产物**，别被别的技术栈的教程带偏。
4. 页面过渡这一项已有更细的"1:1 照搬"结论与踩坑，统一见第十节 5。

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

> 2026-09-21 做过一次全量依赖升级，`npm audit` 从 21 个漏洞（2 critical）降到 **0**，
> 并通过干净 `npm ci` + 构建验证。升级中的坑与版本天花板全部记在第五、九节。

**注意**：Tailwind 4 + Astro 7 + Svelte 5 都是较新的大版本，网上很多教程是旧版写法，改配置前先确认版本。

## 三、常用命令

```bash
npm run dev       # 本地开发，http://localhost:4321
npm run build     # astro build + Pagefind 索引，产物在 dist/（含 dist/pagefind/）
npm run preview   # 预览构建产物——【搜索只能在这里或线上验】
npm run check     # astro check：类型检查，覆盖 .astro/.svelte（2026-10-01 装，见下面说明）
npm run icons     # 由 public/favicon.svg 重生成整套站点图标（PNG/ICO）
npm run covers    # 由 src/assets/postImages/covers/*.svg 重生成列表页自动封面（webp）
npm run new:post -- --day 29 --title "标题"   # 文章脚手架（ASCII slug + 只写 9 个真在用的 frontmatter）
```

`package.json` 里**没有** lint / test 脚本，也没有部署脚本。验证手段就是 `dev` 看效果 + `build` 确认能构建通过
+ **`npm run check` 查类型**（当前基线：**0 error**，剩 2 条 hint，见下）。
> **`npm run check`（= `astro check`，`@astrojs/check` 0.9.10，devDep）是 2026-10-01 装的**，
> 它补上了 `npx tsc --noEmit` 的盲区——**tsc 只查 `src/**/*.ts`，`.astro` 与 `.svelte` 完全不在射程内**。
> 装它的当场就查出 4 个真问题（见第九节「astro check 首跑」）。
> ⚠️ 它比 tsc 慢得多（首次约 20~30s，冷启动要起 language server），别每次改一行都跑。
> ⚠️ 两条既存 hint 别当 error 追：① `PostCard.astro:39` `password` 声明未读（= 五-5 那条「锁图标其实是空的」）；
>   ② `SiteStatus.astro:123` `siteStartDate` 找不到（那是 `define:vars` 注入的，**tsc 看不到但运行时真有**，
>   和五-22 那条 `--collapsedHeight` 是同一个道理）。
> `src/modules.d.ts` 里那条 `declare module "@rehype-callouts-theme"` 是给它准备的——
> 那个名字是 `astro.config.mjs:64` 的 **vite alias**，tsc/Volar 不解析 alias，删了这行 check 报 ts(2882)。
> 老的 `npx tsc --noEmit -p tsconfig.json` 仍应退出码 0（它快，适合随手核）。
查漏洞要**显式换官方源**：默认 registry 是 npmmirror，它不实现 audit 接口，
`npm audit` 会报 `404 NOT_IMPLEMENTED` 而不是给出结论 →
`npm audit --registry=https://registry.npmjs.org`（2026-09-28 实测，结果 **0 vulnerabilities**）。
⚠️ **`dev` 下搜索一定不可用**：Pagefind 索引是 `astro build` 之后才生成的，dev 服务不认 `dist/pagefind/`，
组件会显示"开发模式下没有搜索索引"的提示——这是设计，不是 bug（参考站在 dev 下是塞假结果，我们塞真提示）。

## 四、目录结构（关键位置）

```
astro.config.mjs        # 所有插件和 markdown 处理链的唯一配置入口
src/content.config.ts   # 文章 frontmatter schema（改文章字段前必看）
src/config/siteConfig.ts    # 站点总开关：分页数、图片格式、页面开关、site_url
src/config/navBarConfig.ts  # 顶部菜单项（含「文章」子菜单）——改菜单只改这里
src/config/                 # 另有 backgroundWallpaper / commentConfig / galleryConfig（相册清单，见五-28）
public/gallery/<id>/        # 相册图片本体，按 1.jpg 2.jpg 序号命名；与 galleryConfig 的 id 一一对应
src/content/posts/          # 27 篇文章（25 .md + 2 .mdx）；images/ 是空的历史遗留目录
src/content/spec/           # 单页内容（about 等）
src/content/dynamic/        # 动态（说说）：一条一个 md，文件名 YYYY-MM-DD-HHMMSS.md 即条目 id
src/pages/                  # 路由：about / archive / categories / tags / series / dynamic / guestbook / gallery / posts/[...slug] / [...page]
src/pages/api/dynamic.json.ts  # 动态数据端点：build 时预渲染成 dist/api/dynamic.json
src/pages/rss.xml.js        # RSS 已实现
src/components/pages/dynamic/  # DynamicFeed.svelte（取数+分页）+ DynamicItemTemplate.astro（<template> 骨架）
src/components/card/        # 侧栏卡片：SiteStatus / Calender / DynamicSidebar（最新动态）/ SiteInfo（站点信息，均构建期静态）
src/layouts/                # BaseLayout.astro + Layout.astro
src/plugins/                # 8 个自研 remark/rehype 插件（见下）
src/modules.d.ts            # 只有一条 declare module "@rehype-callouts-theme"（给 astro check 用，三节有说明）
public/assets/js/reinit.js  # ⚠️ 「导航后重 init」注册表：onReinit/reinitOnce 的唯一实现，BaseLayout head 同步加载（十-14）
scripts/generate-icons.mjs  # 由 public/favicon.svg 生成全套图标（npm run icons）
scripts/generate-covers.mjs # 由 src/assets/postImages/covers/*.svg 生成自动封面 webp（npm run covers）
scripts/new-post.mjs        # 文章脚手架（npm run new:post：ASCII slug + 全量 frontmatter）
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

## 五、必须知道的配置约定

1. **`site_url` 是环境相关的**（`src/config/siteConfig.ts:42`）：
   dev 时是 `http://localhost:4321`，构建时是 `http://47.108.230.220`。
   → 改了域名/地址要同时改这里，否则外链、sitemap、RSS 全部错乱。

2. **文章封面路径以 `src/` 为基准**，不是以文章文件为基准（见 siteConfig 顶部注释）。

3. **代码块默认折叠**：超过 15 行自动折叠，预览前 8 行。长代码看起来"消失"了是这个原因。

4. **主题切换用 `data-theme="light|dark"` 属性**（写在 `<html>` 上），不是媒体查询。
   `src/styles/global.css:3` 已把 Tailwind 的 dark 变体重映射：
   `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`
   → **`dark:` 前缀是有效的**，它跟的是 `data-theme` 而非 `prefers-color-scheme`，放心用。
   （2026-09-28 实测确认；此前本条写作"`dark:` 无效"是错的，害得每次都要重新查。）

5. **文章 frontmatter schema** 定义在 `src/content.config.ts`，字段包括：
   `title` `published` `updated` `draft` `description` `image` `tags` `category` `series` `seriesOrder` `pinned` `comment` `password`
   （另有 4 个 `prevTitle/prevSlug/nextTitle/nextSlug` 是模板留下的「For internal use」，全站零消费方）
   **2026-10-01 删掉了 6 个零消费字段**：`lang` `author` `sourceLink` `licenseName` `licenseUrl` `passwordHint`
   —— 26 篇一篇没写过、全仓（含 `siteConfig` 与 CopyShare 的许可区块）**零引用方**，`astro check` 也确认零读取。
   新增字段必须改 schema，否则构建报错。
   ⚠️ **`password` 不是"加密文章"，别当功能用**（2026-09-30 核）：全站只有两件事——
   ① 文章页隐藏评论区（`[...slug].astro` 的 `post.data.comment && !post.data.password`），
   ② 「猜你喜欢」里排除加密篇（`RecommendedPost.astro:97` 读 `/api/allPostMeta.json` 的 `password`）。
   ⚠️ **原先这里写的「列表卡显示锁图标」是错的**（2026-10-01 `astro check` 查出来）：
   `PostCard.astro` 一直**接收但从不读** `password`（`astro check` 报 ts(6133)），产物里没有任何锁图标，
   所以加密文章在列表页看起来和普通文章完全一样。要真的显示锁得在 PostCard 里补 UI——**这是待办，不是现状**。
   **没有任何密码门 UI、没有解密逻辑，正文照常渲染进 HTML 并可被 Pagefind 索引**；
   原先三个 `password:decrypted` 监听器（SiderBarToc / FloatingToc / FancyboxManager）因为事件无派发方已作为死代码删除，将来真做加密要连派发方一起补回来。
   `series`（空=不归入任何系列）+ `seriesOrder`（系列内序号，可为 0）驱动 `/series/` 页与文章页系列导航盒，
   见第十六项；**写完文章要顺手写这两个**，否则该篇不进系列。

6. **图片统一输出 webp，质量 80**（未开 avif）。

7. `dist/`、`.astro/`、`node_modules/` 都在 `.gitignore` 里，**构建产物不入库**。

8. **Astro 7 下不能留空的 `<script></script>`**。空脚本不产出 chunk，Astro 7 解析其构建路径时会直接
   `Error: Cannot find the built path for ...astro?astro&type=script&index=0&lang.ts`，
   导致整个页面（含首页）渲染失败。Astro 6 容忍、Astro 7 报错。
   → 已于 2026-09-20 从 `src/pages/[...page].astro` 移除一处。要么写内容，要么整行删掉，别留空标签。

9. 构建产物基线（**2026-10-08 下午实测**，V0.1.26）：
   **43 个页面 / dist 351 个文件 / `du -sh` 22M（字节合计 20.99 MB）**，
   ⚠️ **量数字要连着方法一起报**：`du -sh` 按 4K 分块算（351 个文件就白涨 ~0.7M），字节合计才可比；
   文件数用 `find dist -type f | wc -l`，页数用 `find dist -name index.html | wc -l`。
   上一条记的"350 个文件"与今天的 351 差 1，**不是本批引入的回归**：`_astro/` 同步从 211 涨到 212，
   时间上唯一夹在中间的是 10-08 上午那批改 `Cover.astro` / `ImageWrapper.astro` / `CoverImage.astro`
   的提交（多切出一个 chunk 属正常），**具体归因没逐笔核过，只当口径说明用**。
   其中 `_astro/` 212 个（自动封面 4 张 × 5 档响应式 = 20 个）、
   `pagefind/` 44 个（**29 个 fragment / 索引 29 页**）、`gallery/` 26 个（20 张照片共 3.46MB）、
   `images/` **12 个**（1 张历史 jpg + `images/ccnewtools/` 的 11 张 webp，共 0.33MB）。
   热缓存 `npm run build` 约 **4.0s** + 索引 0.2s（2026-10-01 起；此前 5~7s，差值来自五-30 那批重复渲染的消除）。
   （体积历史：28M → 09-30 相册 webp 化后 **20.3M**（−7.7M）→ 10-01 下午 **22M**。
   文件数历史：307（09-28 接 Pagefind）→ 334（09-29 新相册）→ 335（09-30 加 `public/og-image.jpg`）→
   **336**（10-01 下午加 `public/assets/js/reinit.js`，十-14）→
   **350**（10-07 加 1 篇文章页 + 11 张 webp + 2 个 pagefind 产物）→
   **351**（10-08 下午复核，多出那 1 个见上面的口径说明）。
   页历史：37 → 09-24 加 `/categories/` 38 → 09-28 加 `/series/` `/tags/` 40 → 09-29 加 `/dynamic/` 41 →
   09-29 加第 5 个相册 `/gallery/wlh-concert-2026/` 42 → **10-07 加首篇工具类文章 43**。
   **每加一个相册页数就 +1**（它走 `getStaticPaths`），**每加一篇文章也 +1**。
   ⚠️ 两批数字不可直接对比，核基线前先看清是哪一批之后的数。
   Pagefind 提示 `doesn't support stemming for the language zh-hans-cn` —— 中文没有词干还原，**属正常**，不影响命中。
   （五-31 已把 `<html lang>` 从非法的 `zh-cmn` 改成 `zh-Hans-CN`，所以这条提示的语言名跟着变，
   **不是回归**；改这个必须重新构建并做搜索 A/B，见五-31。）
   已验证 dist 内 **starlight 产物为 0**（见第九节，那是纯 devDep 膨胀）。
   已知无害警告：vite chunk 体积提示、以及 Svelte 里动态 `import(变量)` 的"无法静态分析"提示（**必须保留变量写法**，
   写字符串字面量会被 Vite 在构建期当模块解析而直接失败，因为 `/pagefind/pagefind.js` 那时还不存在）。

10. **`@astrojs/markdown-remark` 必须是显式依赖**。`astro.config.mjs:12` 直接
    `import { unified } from "@astrojs/markdown-remark"`，但 `astro@7.3.4` 与 `@astrojs/mdx@8.0.2`
    **都只把它声明为 peerDependency（`^7.3.0`），两者的 `dependencies` 里都没有它**。
    → 它现在存在，靠的是 npm 7+ 自动安装 peer 这个**易变机制**。而 `@astrojs/mdx@7.0.8` 时代的
      peer 里根本没有它（只有 `markdown-satteri` 和 `astro`），那时没人拉它，npm 就当 extraneous 剪掉，
      报 `Cannot find module '@astrojs/markdown-remark' imported from astro.config.mjs`、
      **整个 Astro 配置加载失败、连 dev 都起不来**（2026-09-21 实际发生，非推测）。
    → 已显式钉为 `^7.3.1`。**不要因为"反正 peer 会装上"就删掉这条声明。**
    → 通则：`astro.config.mjs` 里 import 的每个包都必须在 `package.json` 中显式声明，
      别依赖 hoisting 或 peer 自动安装的运气。

11. **`package.json` 的 `allowScripts` 钉的是精确版本**，现在只剩 **`esbuild@0.28.2`**。
    被钉的包升级后若忘了同步改，npm 会**静默跳过它的 postinstall**（原生二进制装不上），
    日志只给一条 `install-scripts ... not yet covered by allowScripts` 警告。
    本地因为旧二进制还在所以构建照过，**全新克隆或服务器上重装才会崩**。
    → 每次升 esbuild 都要同步改这里的版本号。
    → **2026-09-28 更正**：原先这里还钉着 `sharp@0.35.4`，但 sharp 从 0.35.5 起、以及 `pagefind@1.5.2`
      都**不再有 install 脚本**（改用 `@pagefind/windows-x64` 这类平台可选依赖），那条钉法是过期配置，已删。
      判断方法：`node -e "console.log(require('./node_modules/<包>/package.json').scripts)"` 看有没有 install 钩子，
      别凭旧记录一直挂着，也别看到平台包就以为被拦了。

12. **品牌标识 = 内联 SVG「双木成林」mark + "亦林" 文字**（`src/components/headers/Header.astro`，2026-09-24 重设计）。
    mark 是两棵高低错落的圆头描边小树加一条地平线，`stroke: var(--primary)`（亮 `#00ba99` / 暗 `#0dcaa9` 自动换）；
    文字走导航正文色、semibold、字距略开，**移动端也显示**（旧版 `<640px` 隐藏）。
    旧的 `src/assets/logo.png`（亮绿字标、**带白底**）已删——它叠在半透明导航上会露出一块白框，暗色下更突兀。
    → 改 mark 时保持 ≤8 笔、24px 仍可辨；**别换回位图**（位图带底色就会重蹈白框覆辙）。

13. **每页恰好一个 `<h1>`，且不能为空**（2026-09-28 立的规矩，Astro Audit 三条提示的根因）。
    `Layout.astro` 在 `#swup-container` 里注入 `<h1 class="sr-only">{title ?? siteConfig.siteMeta.name}</h1>`：
    - 页面**不传 `title` 也不会空**（兜底 `YILIn`，和 `<title>` 一致）——之前首页与 `/2/`、`/3/` 是空 h1。
    - 正文自带可见 h1 的页面（目前只有 `/about/`，其标题写在 `content/spec/about.md` 里）
      必须传 **`contentHasH1`**：`<Layout title="关于我" contentHasH1>`，否则两个 h1 重复。
    - 组件里的区块标题一律用 **`h2`**（悬浮目录 `FloatingToc`、评论区 `comment/index.astro`、
      相册卡 `AlbumCard`）；`h1` 正下方直接出现 `h3` 是层级跳变。
    → 新增页面：给 `Layout` 传 `title`；新增区块标题从 `h2` 起，别用 `h3`。
    → 验证方式：`node` 解析 dist 各页 `<h[1-6]>` 序列，核「h1 数=1 / 无空标题 / 无跳级」。

14. **禁用态的分页箭头不要写 `href="#"`**（`Pagination.astro`）：直接 `href={page.url.prev}`，
    值为 `undefined` 时 Astro 会省略属性，配合已有的 `aria-disabled` + `tabindex="-1"`。
    `href="#"` 会被 a11y 审计判定为"跳到页面顶部的假链接"。

15. **邮箱链接在 HTML 里长这样是设计使然，不是缺陷**（`rehype-email-protection`，第五节顶部插件列表里那个）：
    产物是 `<a href="#" data-encoded-email="Base64..." onclick="...atob...this.href='mailto:'+解码值">`，
    点击时才还原成 `mailto:`。所以 `/about/` 里搜到 `href="#"` + 一串 base64 **属正常**，
    别当 a11y 死链去"修"（第十节那条说的是分页，两者不同）。

16. **顶部菜单是配置驱动的，改菜单只改 `src/config/navBarConfig.ts`**（2026-09-28 起，照 Firefly）。
    `Header.astro` 与 `MobileMenu.astro` 都从 `navBarLinks` 渲染，带 `children` 的项（现在是「文章」→
    归档/分类/标签/系列）桌面渲染成 `.dropdown-container` 下拉、移动端渲染成 `.mobile-dropdown` 子菜单。
    **别再往两个组件里硬写 `<a>`**——那样桌面和移动会不同步。图标名可以是 `src/icons/` 下的本地图标
    （`home` `archive` `chat` `xiangce` `about` `arrow-right`）或 Iconify 全名（`material-symbols:layers` 等）。
    - 桌面下拉的展开由 CSS 三种情形触发：hover、`:focus-within`、`:has(.dropdown-trigger[aria-expanded="true"])`
      （第三种是**触屏没有 hover 才加的 click 切换，Firefly 自己没有**，别当成照搬）。
    - 手风琴类交互（下拉、`/series/` 系列卡片、文章页 SeriesNav）一律**事件委托**，注册动作走
      `window.reinitOnce(key, fn)`（**2026-10-01 起**；原先这里写的是"自己写 `window.__xxxInit` 幂等标志"，
      现已收编进第十节 14），因为容器内脚本会被重跑（第十节 2 与 11）。Header 在容器外，它的脚本只跑一次，无需幂等标志。
    - **只在部分页面渲染的组件，布局类 CSS 必须放全局样式表**（成因与实测案例见第十节 2，此处不复述）；
      落到本项目：`.series-acc-*` / `.series-nav-*` 放在 `src/styles/singles/mainSingles.css`。
      Header 系组件每页都渲染，所以 `DropdownMenu.astro` 的 scoped `<style>` 是安全的。
    - ⚠️ **别在 `.astro` 的三元分支里写 `class:list=[..., cond && "x"]`**：本项目实测这样渲染出来是
      `class=""`（顶级菜单项的 `dropdown-item btn-plain h-10` 全丢，移动端菜单直接错乱）。
      分支里的元素用普通 `class="…"` 字符串；要确认就看产物 HTML 的 class 值，别只看源码。
    - 验证手段：定宽 iframe（1440 / 375）读 `getComputedStyle` + `getBoundingClientRect`，
      并临时注入 `transition:none!important` 取稳定态——隐藏标签页里过渡不推进，直接读会读到 0（误判为坏了）。
    - **本站面板是直角**。Firefly 的圆角走 `--radius-large`，我们裁剪主题时**没把这个变量带过来**
      （`--panel-border-color` 同样未定义），所以它的 `rounded-(--radius-large)` 在参考站实际渲染成直角，
      我们的 `markdown.css:150` 和 about 页也是直角。**新组件别自己加 `border-radius`**，
      加了就和全站风格不一致（下拉面板就踩过这个坑，`35db5b1` 改回直角）。
    - **`aria-expanded` + `:focus-within` 控制的浮层，Swup 跳页后不会自己清**：Header 在容器外不被替换，
      点子项跳完页 `aria-expanded` 还是 `true`、焦点也还在 `<a>` 上，于是鼠标移出面板也不消失。
      必须 ① 点子项即收起 ② 收起时把焦点 `blur()` 掉 ③ 监听 `swup:contentReplaced` 兜底
      （键盘 Enter 走的那条路不触发 click；移动端 `.open` 菜单同理，见 `6bbb1f7`）。

17. **系列（`/series/`）与标签（`/tags/`）页**（2026-09-28 加，照 Firefly）：
    - 聚合逻辑在 `src/utils/content-utils.ts`：`getSeriesList()`（组内按 `seriesOrder` 升序，
      组间按篇数降序）、`getSeriesPosts(post)`（返回 `{seriesName, posts, currentIndex}`，
      该篇没写 `series` 时返回 `null`）。**序号判空必须用 `!== undefined`**，否则 `seriesOrder: 0` 会被排到最后。
    - `/series/` 是**单页手风琴**，Firefly 没有 `/series/<slug>/` 详情页，我们也没做；
      `/tags/` 是标签总览 + Top 10 排行，点具体标签仍跳 `/archive/?tag=xx`（沿用 `getTagUrl()`，归档页没改）。
    - 现有 27 篇：**25 篇** `series: "CSS100Day"`（`seriesOrder` = 天数，第 2~28 天，**缺 5 和 11**）、
      **1 篇** `series: "CodePen"`（`边框炫彩和模糊炫彩特效.md`）序号 1、
      **1 篇不归入任何系列**（`ccnewtools-manual.md`，非系列就不写 `series`/`seriesOrder`）。
      系列名跟标题前缀 `CSS100Day(N)-` 保持一致，
      **与 tag 的 `CSS100天` 是两套写法**，改的时候别混。
    - 新页面记得给 `Layout` 传 `title`（后缀用 `-亦林`，见五-32），区块标题从 `h2` 起（见第十三项）。

18. **搜索 = Pagefind 全文检索**（2026-09-28 接，照 Firefly）。
    - 依赖 `pagefind@^1.5.2` + `sharp@^0.35.5`（后者只为生成图标）；`build` 脚本是
      `astro build && pagefind --site dist`，索引输出到 **`dist/pagefind/`**（不是 `_pagefind`）。
    - 组件 `src/components/controls/Search.svelte`（Svelte 5 runes），在 `Header.astro` 里以
      `<Search client:load />` 挂载；旧的装饰性 `src/components/uiverse/Search.astro` **已删**，别再引它。
    - **形态照搬参考站**：桌面端（`lg+`）是导航栏里一条**内联输入框**，`w-40` 在 `:focus` 时扩到 `w-60`
      （参考站同款 `focus:w-60 active:w-60`），底条 `bg-black/4` → `hover/focus-within:bg-black/6`、
      暗色 `bg-white/5` → `white/10`；移动端才是 `lg:hidden` 的按钮，点开浮层面板、面板内自带一条输入框。
      **不要给这些加圆角**（本站浮层与底条一律直角）。
    - 面板开在 `{#if}` 里 → 用 `tick().then(() => input.focus())` 聚焦，**别用 `requestAnimationFrame`**
      （后台标签页 rAF 被节流，会出现"面板开了但光标没进输入框"）。
    - 索引懒加载：只在 `import.meta.env.PROD` 下 `import(indexUrl)`，**URL 必须是变量**（见第九项的警告）；
      300ms 防抖 + `reqId` 防竞态；dev 下没有索引，面板显示真提示而不是像参考站那样塞假结果。
    - 排除规则在根 `pagefind.yml`：KaTeX span、`[data-pagefind-ignore]`、`.search-panel`/`#search-panel`。
    - **样式是毛玻璃 + 直角**：`backdrop-filter: blur(20px) saturate(1.5)`，亮 `#ffffff8c` / 暗 `#17171799`，
      边框 `#0000000f` / `#ffffff1a`，顶部 1px 内高光 `inset 0 1px #ffffff2e` / `#ffffff0f`；
      暗色靠 `:global(html[data-theme="dark"])`（我们不是 `prefers-color-scheme`）。数值是从参考站编译产物抄的。
    - 验证只能在 `npm run preview`（服务 dist）或线上做；`<mark>` 命中词已改成品色加粗。
    - 加密文章目前零篇，若将来启用 `password`，Pagefind 会把正文索引进去（构建产物里能搜到），届时要处理。

19. **站点图标只有一个源文件：`public/favicon.svg`**（双木成林 = **两棵树**，绿底 `#00ba99` + 白色描边）。
    改完跑 `npm run icons` 重生成 `favicon-16/32/96.png`、`favicon.ico`（内嵌 16/32/48）、
    `apple-touch-icon.png`(180 满幅不透明)、`web-app-manifest-192/512.png`。
    - 别手改那些 PNG/ICO，都是脚本产物。
    - ⚠️ 浏览器对标签页图标**缓存极强**：改完在本地看到旧图标是常态，要硬刷新（Ctrl+Shift+R）或开无痕，
      别急着判定"没生效"。
    - 描边在 Header 里靠 `var(--primary)` 换色，favicon 没有这个环境，所以图标里是**写死的品牌绿**。

20. **`.btn-plain` 会盖掉 Tailwind 的显示类**（2026-09-28 踩过，搜索按钮因此在桌面端和搜索框同时出现）。
    `src/styles/singles/abutton.css` 里 `.btn-plain { display: flex }`，而它在 `BaseLayout.astro` 的导入顺序
    **排在 `global.css`（即 Tailwind 工具类）之后**，两者特异性相同（都是单类），于是
    `<button class="btn-plain … hidden">` / `lg:hidden` **不生效**——元素照样显示出来。
    → 要按断点显隐一个 `.btn-plain` 元素，**把显隐类放到外层不带 `btn-plain` 的容器上**
    （父级 `display:none` 一定能压住子级）。
    → 同类风险：`main.css` / `mainSingles.css` / `layout-style.css` 里自定义类的属性，
      都可能覆盖同名 Tailwind 工具类；调"为什么这个 utility 不生效"时先查导入顺序与自定义类。

21. ⚠️ **改了 `src/plugins/**` 或 `astro.config.mjs` 里的 markdown 处理链，必须删 `node_modules/.astro/data-store.json` 再构建**
    （2026-09-29 实测，非推测）。Astro 的**内容层缓存不在项目的 `.astro/`，而在 `node_modules/.astro/`**：
    它按**内容文件的哈希**失效，**插件源码变了它不管**。
    → 症状：删了插件里的一行、`npm run build` 退出码 0、`dist/` 里那行**还在**；
      连 `rm -rf .astro` 都没用（那个 `.astro/` 只放类型和 collections，不是内容缓存）。
    → 本次的实际后果：`data-store.json` 的时间戳停在 09-28 14:03，说明**09-28 17:29 那次上线和 09-29 的全部构建，
      文章内容部分都在复用这个旧缓存**。CSS/JS 不受影响（走 Vite），所以暗色滚动条那条是真的生效了。
    → 正确验证顺序：改插件 → `rm -f node_modules/.astro/data-store.json` → `npm run build` → **grep 产物确认改动在里面**。
      第七节"build 通过再报完成"对**内容类改动不充分**，必须核产物。
    → 好消息：清空缓存不会变慢多少（重建仍是 40 页 / 307 文件 / 约 5s），所以**拿不准就删了再构建**。
    → ⚠️ **别在 dev 运行时删它**（2026-09-29 实测）。dev 和 build **共用**这个文件，删掉之后
      **正在跑的 dev 会停在旧内容集合上**：新增两个 `src/content/dynamic/*.md` 后，dev 的 `/api/dynamic.json`
      仍只返回 1 条、侧栏也是 1 条，而 `dist` 里已经是 3 条——看起来像"新代码有 bug"，其实是 dev 的内容层没重扫。
      → 要么先停 dev 再清缓存，要么清完**重启 dev**（停法见第九节依赖坑 ③，孤儿子进程会锁 lightningcss）。
    → ⚠️ **同一族还有 `node_modules/.vite/`：dev 与 build 也共用它**（2026-09-30 实测，症状极具误导性）。
      dev 跑着的时候反复 `npm run build`（或中途 `npm ci` 把 node_modules 清掉），预打包依赖会被重建，
      而**正在跑的 dev 页面仍引用旧哈希** → `import` 失败 → **整个模块静默不执行**。
      本次症状是"**切页没动画了**"：`window.swup` 是 `undefined`、`--transition-duration` 没被设上，
      但 CSS 规则一条不少 —— 看起来完全像 JS 回归或样式被谁改坏，实际只是缓存错位。
      → 判别三步（很快）：① 控制台/页面里 `window.swup` 在不在；
        ② `curl` 那个模块 URL 里 import 的 `/node_modules/.vite/deps/xxx.js?v=<哈希>`，
          **返回 504 就是它**（Vite 的 outdated-dep 信号，且响应体是空的，别当成"文件没生成"）；
        ③ `ls node_modules/.vite/deps/` 看那个文件在不在。
      → 修法就是**重启 dev**（它会重新预打包，新哈希立刻 200）。**线上不受影响**，
        因为 build 产物里是打过 bundle 的 chunk，不依赖 `.vite/deps`。
      → 顺带一条通用结论：**dev 里看到"某功能整体消失"，先确认它是不是 dev 独有，
        再去 build 产物上复现**（本次同一天还有一次：Swup 脚本重执行的 bug 在 dev 下根本不复现）。

22. ⚠️ **`style=` 内联样式会压过一切样式表规则，包括 Tailwind 的 `dark:` 工具类**（2026-09-29 踩实）。
    `FloatingToc.astro` 在元素上写 `style="background-color: rgba(var(--card-bg-rgb, 255,255,255), .6)"`，
    同一个元素又挂了 `dark:bg-black/60` —— 内联胜出，于是**暗色下悬浮目录整块是白的**，
    而且因为 `--card-bg-rgb` 从来没定义过，那个 fallback 让它**永远等于白色**，看起来"有在跟随主题"其实没有。
    → 要在内联样式里传主题色，**必须同时把那个变量在 `global.css` 的亮、暗两个主题块里都定义好**
    （现在 `--card-bg-rgb` 亮 `255,255,255` / 暗 `22,31,27`，与 `--card-bg` 的 `#fff` / `#161f1b` 同色）。
    → 排查这类"暗色不生效"时，**先看元素有没有 `style=`**，再谈特异性和 `!important`；
      光比源码顺序（内联样式根本不在样式表里，`cssRules` 遍历搜不到）会得出错误结论。
    → 附带教训：`var(--x, fallback)` 的 fallback **不是"没定义也没事"** 的标志。
      本项目里 `--card-bg-rgb` 有 fallback 却是真 bug，而 `--collapsedHeight` 无 fallback 反而是正常的
      （它由 Astro `<style define:vars>` 注入）。判断可达性要逐个看来源，别按"有没有 fallback"一刀切。

23. ⚠️ **带"时分"的 frontmatter 日期必须写显式时区偏移**（2026-09-29 实测）。
    Astro 的 YAML 加载器把 `published: 2026-09-29 10:15:00` 按 **UTC** 解析，
    而 Node 的 `new Date("2026-09-29 10:15:00")` 按**本地**解析——两者差 8 小时。
    → 症状：动态条目存的是 `10:15`，浏览器显示 `18:15`（我们机器在 Asia/Shanghai）。
    → 文章一直没暴露这个坑，是因为 `published` 只写到日期（`2026-06-22`），
      UTC 零点在 +8 下仍是同一天。**只要哪天写 `published: 2026-06-22 20:00`，日期就会跳到次日。**
    → 正确写法：`published: 2026-09-29T10:15:00+08:00`（ISO 带偏移）。
      并且展示端要**显式传时区**，否则换个机区的访客看到的还是偏移过的时间：
      `formatDateTimeToYYYYMMDDHHmm(date, "time", siteConfig.timezone)`（`timezone` 就配在 siteConfig，值 `Asia/Shanghai`）。
    → 该函数的第 3 个参数**默认不传 = 按访客机区渲染**，现有文章都走这条，未受影响。

24. **动态（`/dynamic/`）是"构建期出 JSON + 客户端填模板"，因此内容进不了搜索索引**。
    - `src/pages/api/dynamic.json.ts` 在 build 时预渲染成 `dist/api/dynamic.json`；
      `DynamicFeed.svelte` 取数后克隆 `DynamicItemTemplate.astro` 输出的 `<template data-dynamic-item-template>`
      并填 `data-dynamic-*` 占位。**条目不在页面 HTML 里**（`grep` 正文搜不到属正常，不是坏了）。
    - 为什么要绕这一圈：条目里要用 `astro-icon` 与构建期图片优化，而这些在 Svelte 组件里拿不到；
      用 `<template>` 就能让 Astro 拥有 markup、Svelte 只填值。
    - Pagefind：全站只有 `Markdown.astro` 带 `data-pagefind-body`，**没有它的页面整页不进索引** →
      `/dynamic/` 不会被搜索命中，这是预期。若将来要能搜动态正文，得另出一条索引路径，
      而不是给这页加 `data-pagefind-body`（那只会把"只有页头的空壳"收进索引）。
    - 条目的布局类在 `mainSingles.css` 的 `.dynamic-*`（原因见第十节 2 / 五-16：克隆出来的节点套不到 scoped 样式，
      Swup 也不换 head）。**别再往组件里写 scoped `<style>`。**
    - `.dynamic-pinned` / `.dynamic-location` 带 `display:flex`，所以文件末尾那两条
      `[hidden]{display:none}` 是**必需的**（否则 `hidden` 属性被压掉、置顶和定位标记永远显示）——同五-20 的 `.btn-plain` 事故。
    - **侧栏「最新动态」**（2026-09-29 加，照参考站的 `latest-dynamics` 卡片）：
      `src/components/card/DynamicSidebar.astro`，挂在 `RightSideBar.astro` 的 `<SiteStatus />` 之后。
      构建期读 `getCollection("dynamic")` → `sortDynamics()`（**置顶优先**，所以侧栏第一条未必是时间最新的）→ 取 2 条。
      - ⚠️ **它是构建期静态渲染，不是岛**——这是**主动偏离参考站**：Firefly 用 Svelte 岛 + `client="visible"` + `fetch`
        是为了支持 Memos 远程源，而我们数据在本地 markdown，且**侧栏在 `#swup-container` 外面**
        （`Layout.astro:112` 容器闭合，侧栏在 115-122），软导航根本不替换它，所以岛纯属多一个 chunk + 一次 fetch + 一个转圈骨架。
      - **条目一律链到 `/dynamic/`，不是 `/dynamic/#dynamic-<id>`**：feed 里的条目是客户端从 `<template>` 克隆的、
        **没有锚点可指**（`DynamicItemTemplate.astro` 不设 id），而且 `SwupManager.astro:77` 在 `visit:start` 无条件回顶，
        就算有锚点也会被冲掉。要成真深链得补三处（模板加 id + 克隆保留 + Swup 换内容后按 hash 滚动），当前明确不做。
      - **两处挂载**（2026-09-30 改）：桌面 **xl 右栏**（`#right-sidebar` 是 `hidden … xl:block`）
        + **移动底部卡片堆**（`Layout.astro` 的 `#mobile-bottom-sidebar`，`md:hidden`），
        后者是用户反馈"移动端主页没有动态"才补的，**位置照参考站**：标签之后、站点统计之前。
        ⚠️ **md～xl 这段（768–1279px）两处都不显示，这是参考站同款行为**（实测 firefly.cuteleaf.cn
        在 1000px 宽时也不出这张卡），不是漏挂、别"顺手补上"。
        实测 375px 底部堆里恰好 1 张、1440px 只有右栏那 1 张，无重复、零横向溢出。
      - `total === 0` 或 `siteConfig.pages.dynamic === false` 时整块不渲染。
      - 不污染搜索索引：实测把 28 个 `dist/pagefind/fragment/*.pf_fragment` **gunzip** 后全文搜，侧栏文本 0 命中
        （控制组用文章正文词验证方法有效）。因为 `data-pagefind-body` 只在 `Markdown.astro` 上，侧栏在那棵子树外。
        ⚠️ 分片是 **gzip 不是 brotli**（`\x1f\x8b` 魔数），用 `brotliDecompressSync` 解会静默失败、
        拿二进制去搜必然"0 命中"，得出假结论。

25. **列表页自动封面**（2026-09-29 加）：`src/utils/cover-utils.ts` 的 `getPostCover(post)`，
    规则是「frontmatter 手写 `image` 永远优先 → 否则按 `seriesOrder` 在 `siteConfig.autoCoverPaths` 里轮播
    （`(n-1) % 4`，第 2 天落在第 1 张）→ 无 seriesOrder 的按 id 稳定哈希兜底」。
    - **只作用于列表卡片**：唯一消费点是 `src/components/layout/PostPage.astro`（全站列表只有
      `[...page].astro → PostPage → PostCard` 这一条路径，`/archive/` `/categories/` `/tags/` `/series/` 各自用自己的 markup）。
      详情页 banner 与 `og:image` 仍读原始 `post.data.image`，所以自动封面**不会**出现在文章页顶部——这是刻意的范围收紧，别"顺手补上"。
    - **素材是 SVG 渲染出来的 webp，不是手绘位图**：源文件 `src/assets/postImages/covers/cover-N.svg`，
      改完跑 `npm run covers`（`scripts/generate-covers.mjs`，与 `npm run icons` 同路子）重生成。
      ⚠️ 别直接把 `.svg` 填进 `autoCoverPaths`——`CoverImage.astro` 的 `import.meta.glob` 只收
      `{png,jpg,jpeg,webp,avif}`，svg 找不到文件、只在构建期 `console.error` 然后静默不出图。
    - **卡片版式在所有断点都是「右侧竖条」**：`global.css:132` 的 `.has-cover .post-card-image` 用 `!important`
      把 PostCard 上那串 Tailwind 类（`w-full aspect-2/1 md:absolute…`）整个覆盖掉了（同五-20 的导入顺序事故，但这次是有意为之）。
      实测尺寸：桌面 240×176；移动端**与桌面共用同一个 `--coverWidth`（30%）**，375px 视口下 = 103×272
      （2026-09-30 之前是硬编码 `9rem`=144px，占卡片 38%，用户反馈"太大遮挡文字"，已改成与桌面同比例，
      文字区从 188px 让到 227px）。**所以封面素材要按「无焦点、四角均匀」来画**，
      有主体的图会在窄竖条里被裁坏；`chen1~4.webp`（动漫图）因此不再被引用，但文件保留未删。
    - 加载态验证有个陷阱：`.loading-spinner` 带 `transition: opacity .3s`，图片 load 完立刻读
      `getComputedStyle().opacity` 会读到过渡起点而误判成"遮罩没消失"。**要读 `data-loading` 属性**，
      或先注入 `transition:none!important`（同第十节那条通用教训）。
      ⚠️ 2026-09-30 又踩一次：在隐藏标签页里 transition **根本不推进**，所以修好之后读 opacity
      仍是 `1`——差点把已修好的遮罩报成"没生效"。**必须先注 `transition:none!important` 强制落到终值再读**。

26. **新文章一律 ASCII slug，用脚手架生成**（2026-09-29 定）：
    - 命名规则：系列文 `css100day-<天数>.md`（→ `/posts/css100day-29/`）；非系列文 `<英文短标题-kebab>.md`。
      **已有 26 篇的中文 URL 一律不动**（会丢外链和收录），只做增量。
    - `npm run new:post -- --day 29 --title "3D 翻转卡片" [--desc 摘要] [--tags a,b]`
      或 `--slug flex-center --title "…"`（非系列必须显式给 `--slug`，脚本**不做中文标题音译/翻译**，猜错就是永久错 URL）。
      脚本会补全 frontmatter、给系列标题自动加 `CSS100Day(N)-` 前缀、检测重复天数、拒绝覆盖同名文件。
      只写文件，不 build 不 git。
    - 为什么值得做：slug 就是文件名（`post.id`，见 `[...slug].astro` 的 `getStaticPaths`），
      所以这条纯粹是「约定 + 脚手架强制」，**没有任何运行时代码**。

27. ⚠️ **把 markdown 渲染结果转纯文本预览时，实体解码必须单趟做完**（2026-09-29 踩实，`DynamicSidebar.astro`）。
    `@astrojs/markdown-remark` 把正文里裸的 `&` 转成 **`&#x26;`**、`<` 转成 **`&#x3C;`**，
    **不是** `&amp;` / `&lt;`。所以那串常见的
    `.replace(/&amp;/g,"&").replace(/&lt;/g,"<")…` 一条都命中不了，侧栏预览会显示成 `AT&#x26;T` 这种乱码
    （Astro 输出 `{text}` 时又会把那个 `&` 再转义一次，变成 `&amp;#x26;`，看起来更像坏了）。
    → 正确做法：**先去标签，再用一个正则一趟解完所有实体**（数字 + 十六进制 + 具名），
      未知具名实体原样保留。分多趟 replace 会有二次解码问题（`&amp;lt;` 被解成 `<`）。
    → 顺序也别反：先解实体再剥标签的话，正文里字面写的 `&lt;p&gt;` 会被解成 `<p>` 再被当成标签吃掉。
    → 通用提醒：这类"文本处理函数对不对"光看源码看不出来，**要拿带 `&`、`<`、`>` 的真实内容跑一遍核产物**。

28. **相册加一个图集 = 改两处**（2026-09-29 加第 5 个相册 `wlh-concert-2026` 时摸清）：
    - ① 图片放 `public/gallery/<id>/`，**按 `1.jpg`、`2.jpg` 序号命名**（`scanAlbumPhotos()` 用
      `fs.readdirSync` 扫目录，文件名不参与语义，但顺序就是展示顺序）。
      **不写 `cover` 字段时第一张就是卡片封面** → 挑最好看的那张放 `1.jpg`。
    - ② 在 `src/config/galleryConfig.ts` 的 `albums` 数组追加一项：
      `id`（= 文件夹名 = URL `/gallery/<id>/`）/ `name`（卡片标题）/ `description`（副标题）/
      `location` / `date`（必须 `YYYY-MM-DD`，用于排序与显示）/ `tags`（数组）。
      **地点沿用站点带间隔号的写法**：`中国·成都`、`自贡·大安`，别写"中国成都"。
    - ⚠️ **`public/` 整份原样拷进 `dist/`，不走 Astro 图片优化**（和文章封面那条 `src/assets/` 路线不同，
      那边会出 webp 变体）。所以相册图**要多大就占多少流量**——现有相册都是原始分辨率 JPEG
      （3072×2199、1706×1279 这种），要控体积得自己在放进去之前压。
    - 每加一个相册**页数 +1**（核基线时别忘了，数字见五-9）。
      标签筛选面板的标签是从所有 albums 聚合出来的，**新标签自动出现**，不用另外登记。
    - 验证：`dist/gallery/index.html` 能 grep 到 `name`/`location`，
      `dist/gallery/<id>/index.html` 的 `<img>` 数应与同图数的现有相册一致（2 图相册都是 3 个 `<img>`）。

29. **侧栏「站点信息」卡 = `src/components/card/SiteInfo.astro`，所有值都是构建期算出的**
    （2026-09-30 加，照 firefly.cuteleaf.cn 的 site-info 卡：常驻两行 + 默认收起的「构建信息」展开区）。
    - 数据源：`构建平台` 是组件顶部常量 `BUILD_PLATFORM`；`博客版本` 读 `package.json` 的 `version`
      —— **该字段现在是对外展示口径**，发版就改它（现 `0.1.19` → 显示 `V0.1.19`）；
      `Astro` 读 `node_modules/astro/package.json` 的**实际安装值**（`package.json` 里写的是范围 `^7.0.2`，
      直接拿它显示就成一串范围表达式）；`Node` = `process.version`、`系统信息` = `os.platform()` 映射 +
      `process.arch`。**这三个都是构建机的值**：本站本地构建 + 阿里云 Linux 部署，所以显示
      `Windows / x64` 是正确的（用户明确要的就是构建机实测值），别当 bug 写成"阿里云 Linux"。
    - `构建时间` 用 `Intl.DateTimeFormat`，**必须显式传 `timeZone: siteConfig.timezone`**，
      否则跟着访客机区跑（同五-23 那个差 8 小时的根因）。
    - ⚠️ **这张卡挂两处（xl 右栏 + 移动底部堆）= 页面上两个 DOM 节点**，脚本必须
      `querySelectorAll(".site-info-card")` 逐个绑定、状态各记各的；**用 `getElementById` 只会拿到第一份、
      第二份点不开**。折叠规则也因此放全局（`mainSingles.css` 的 `.site-info-*`），且折叠层
      `.site-info-detail` 自身**不带任何 padding**（padding 全在内层），否则 `border-box` 下 `max-height:0`
      连内边距一起算、收起后仍漏一条缝。收起时给折叠层 `inert`，不然 Tab 会走进看不见的值。
    - ⚠️ **图标只能用本项目真装了的集合**：`material-symbols` / `fa-solid` / `fa6-solid` / `fa7-solid` /
      `mingcute` + `src/icons/` 本地图标。注意 **`astro.config.mjs` 的 `icon({include})` 里还写着
      `mdi` / `simple-icons` / `fa7-brands` / `fa7-regular`，但这四个包根本没装**
      （`node_modules/@iconify-json/` 下只有那五个）——配置看着支持其实不支持。
      **照抄参考站的图标名会把构建直接打挂**：本次抄它的 `mdi:clover` 就报
      `Unable to locate the "mdi" icon set!`，退出码 1，**而且 `dist/` 已被清空**（别以为产物还在）。
      → 那四行假配置 2026-09-30 用户拍板**先不删也不装包**，见到别当新发现。要 Node/pnpm 之类的品牌 logo
      得先装 `@iconify-json/fa7-brands` 或 `simple-icons`，属于新增依赖要先问。
      → 要核一个名字存不存在就读 `node_modules/@iconify-json/<集合>/icons.json`，
      **`icons` 与 `aliases` 两张表都要看**：`material-symbols:push-pin` 只在 `aliases` 里，
      光查 `icons` 会误判成"这图标没装"。

30. **构建期记忆化只认 PROD：`src/utils/content-utils.ts` 的 `getAllPosts()`**（2026-10-01 加）。
    - 动因：一次首页渲染原先要跑 **13 遍** `getCollection("posts")`（CategoryBar 2 + Category/Tags 各双挂载
      + SiteStatus 双挂载×内部 3 个函数 + 路由本身 1），每遍都重新解析全部 frontmatter。
    - ⚠️ **只在 `import.meta.env.PROD` 下缓存，dev 每次都真读**。理由就是五-21 那族坑：dev 命中缓存会让
      内容集合停在旧数据上，看起来「新代码有 bug」。
    - ⚠️ **缓存的是同一批对象引用，消费方一律不许就地改**：`getRawSortedPosts` 已改成
      `[...allBlogPosts].sort(...)`，否则一次排序就把缓存本体打乱、后面每页读到的顺序都是错的。
      加了这个记忆化之后必须核列表顺序（本次核法：本地 6 个列表页与线上逐项比 `href` 序列）。
    - 同批收掉的重复：`[...slug].astro` 对同一篇调两次 `render()`（合并成一次）、
      `PostCard` 只在**没写 description** 时才 `render(entry)` 取 excerpt（26 篇全有 description，
      原先是每张卡白跑一遍完整 remark/rehype 链再丢弃结果）。构建耗时 5~7s → **4.14s**。
    - 刻意没做：`Calender` 与 `RecommendedPost` 各抄一份 `window.__allPostMetaCache` 的 fetch 逻辑，
      两处都工作正常，抽公共 helper 要引入脚本加载顺序契约，收益不值当。

31. **`<html lang>` 现在是合法的 `zh-Hans-CN`**（2026-10-01 改，`BaseLayout.astro:34`）。
    原先的 `zh-cmn` 不是合法 BCP47，也正是 Pagefind 那条 `doesn't support stemming for zh-cmn` 提示的根因。
    → 改后 Pagefind 重新索引报 `Discovered 1 language: zh-hans-cn`，**仍提示不支持词干还原（中文本来就没有，属正常）**。
    → ⚠️ 改这个要**重新构建**（语言标记是 Pagefind 建索引时读的），并做搜索 A/B：
      本次核 动画 12→12、flex 7→7、振铃 1→1 且首条结果逐条一致，才敢说无回归。
    → 顺带：`commentConfig.ts` 里的 `lang: "zh-CN"` 是 Twikoo 自己的界面语言，与 `<html lang>` 无关，别混改。

32. **品牌名口径唯一来源 = `siteConfig.siteMeta.name`（现值「亦林 YILIn」）**（2026-10-01 统一）。
    以前四种拼法并存：`亦林` / `YILIn` / 列表页后缀 `-Yilin` / `BaseLayout` 里那条 `YiLin博客`
    （后者在产物里 0 次，是被 Layout 的 `??` 挡死的死分支）。现在 `<title>` 兜底（BaseLayout）、
    sr-only `<h1>` 兜底与 `title` 兜底（Layout）全部取 `siteConfig.siteMeta.name`，
    5 个列表页后缀统一为 `-亦林`，manifest 是 `name: 亦林 YILIn` / `short_name: 亦林`。
    - Header 的可见文字与 `aria-label`、about 正文仍用「亦林」——**中文主、英文辅的刻意短形式，不是漏改**。
    - ⚠️ **以后改品牌文案只改 `siteConfig.siteMeta.name`**，别在组件里再写第五种拼法。
    - 文章页 / 相册页 / about 的 title 是裸标题、不带后缀（历史行为，本次未动）。
      要给全站统一后缀 = 改 26 页 title 的 SEO 决策，需另问。

33. ⚠️ **本站是纯静态（SSG 无 SSR），任何"靠 URL 查询串驱动"的功能都必须走客户端，且组件必须带时间指令**
    （2026-10-07 查出并修复归档页筛选，两条病同时存在所以症状是"完全没反应、也不报错"）：
    - **① `Astro.url.searchParams` 在构建期恒空。** 构建时 Astro 请求的 URL 就是 `/archive/`，**不带查询串**；
      访客浏览器里的 `?category=工具` 永远不会回到服务端。所以
      `const tagFilters = Astro.url.searchParams.getAll("tag")` 这种写法**只能当 SSR 那一遍的初值**，
      真实值必须在组件里读 `window.location.search`（见 `ArchivePannel.svelte` 的 `resolveFilters()`）。
      → 全站只有两处读 `Astro.url`，另一处 `CategoryBar.astro` 是**对的**，因为它读的是
        `new URL(window.location.href)`（客户端活 URL），别跟着它一起怀疑。
    - **② 框架组件不写 `client:*` 就只出静态 HTML、客户端零 JS。**
      `<ArchivePannel sortedPosts={…} />` 没有时间指令 → Astro 不输出水合岛，
      组件里写什么都不会跑。**判据别看"HTML 里有没有内容"**（静态渲染照样有），
      要数产物里的岛：`node -e` 抓 `<astro-island>` 的 `component-url`，
      修复前后归档页从「只有 `Search` 一个岛」变成「`Search` + `ArchivePannel`」。
    - **两条一起成立的后果**：筛选逻辑代码完全正确、构建退出码 0、页面渲染正常、控制台 0 报错，
      但 `?category=` / `?tag=` / `?uncategorized=` **三种入口全部恒显示全部 27 篇**。
      引入点是 `da68cd4`（09-24「归档时间线改服务端渲染：去掉 client:only 的水合空窗」）——
      那笔为了消掉水合空白，把组件里 `new URLSearchParams(window.location.search)` 那行删了、
      又把 `client:only="svelte"` 改成无指令。**修症状时把功能一起关掉了。**
    - **现在的口径**：`client:load` + 组件内 `resolveFilters()`。
      SSR 那一遍仍输出完整时间线（所以普通 `/archive/` 没有水合空窗，09-24 的目标没丢），
      带查询串时水合后立即收窄。代价是 props 把 27 篇 `{id,data}` 序列化进岛属性，
      归档页 146925B → **177779B（+30.8KB）**、多一个 5KB 的 `ArchivePannel` chunk；
      `getSortedPostsList()` 已经剔过 `post.body`，再瘦得改共享 util，**当前判定不值当**。
    - **验证必须两条路径都测**（只测一条会漏，同十-15 的教训）：
      ① **硬加载** `iframe` 直接开 `/archive/?category=工具` → 期望 1 条；
      ② **软导航**（真实用户点分类胶囊的路径）——在 iframe 里先开 `/archive/`，
        然后 **`history.pushState` 改 URL → 换 `#swup-container` 的 innerHTML → 重插容器内 script**，
        期望从 27 收窄到 1。⚠️ 仿真**必须连 URL 一起改**：我第一次只换了内容没换 URL，
        于是组件读到"无筛选"、**差点把已修好的东西报成没修好**。
      实测五项全对：`/archive/` 27、`?category=设计灵感` 26、`?category=工具` 1、
      `?uncategorized=true` 0、`?tag=CSS100天` 25，且筛选头文案（"分类 / 工具 1 篇文章"）正确出现。
    - **数行数要数在岛内部**：页面里本来就有 1 个卡片外的 `/posts/` 链接（侧栏那块），
      拿整页 `a[href^="/posts/"]` 计数会得出"设计灵感 27 条 / 未分类 1 条"这种**自相矛盾的假异常**。

34. ⚠️ **装饰性图片的 `alt` 必须留空串，且注意 `ImageWrapper` 的兜底会把空串填回文字**
    （2026-10-08 修的首屏"有一行字在飘"，根因两条）：
    - 横幅壁纸与列表封面都是装饰图，原先带的是**没本地化的英文占位 alt**
      （`background paper of the blog` / `Cover Image of the Post` / `Fallback cover`）。
      图片未解码时 Chromium 会把 alt 文本画在图框里；横幅首屏又有 Ken Burns
      `scale(1 → 1.1)`（`Cover.astro` 的 `kenBurnsStyle` + `applyInitialKB`），
      于是那行字**跟着缩放飘**。刷新后走缓存快路径，所以症状是"只有第一次进首页才有"。
    - ⚠️ **只改调用方等于白改**：`ImageWrapper.astro` 的 `isLocal && usePicture` 那条分支写的是
      `alt={alt || "图片"}`，调用方传 `alt=""` 会被它重新填成"图片"。另外两条分支是 `alt || ""`，
      三条不一致。**同一个组件的多条渲染分支要逐条核，别只看一条**（同五-20/五-22 那族"看着对其实没生效"）。
    - 编译产物里空 alt 会**最小化成裸属性 `alt`**（等价于 `alt=""`，浏览器按装饰图处理）。
      核的时候别用 `alt="([^"]*)"` 去匹配——它匹配不到裸 `alt`，会误报"alt 全丢了"。
      要区分的是"**有 alt 且值为空**"（正确）与"**根本没有 alt 属性**"（无障碍缺陷、读屏会念文件名）。
    - 改 alt 时**别误伤有描述的图**：文章正文里的截图 alt 是有意义的（手册那 11 张是中文描述），
      核法：`dist/posts/<篇>/index.html` 里 `alt="([^"]+)"` 的数量应等于该篇正文图数。
35. ⚠️ **`CoverImage` 的加载态：任何终态都必须摘掉 `data-loading`，否则遮罩无限盖着**
    （2026-10-08 修的手机 Edge"一直转圈"）。原先 `onError` 开头是
    `if (img.dataset.remote !== "true") return` → **本地封面一旦 load 失败，`data-loading` 永远停在
    `"true"`，遮罩 + 转圈既不消失也不报错**；刷新后走 `img.complete === true` 那条快路径才正常。
    → 现改成：一律先 `hideLoading()`，`data-error` 仍只给远程图设（它驱动"换回退图 + 藏掉坏图"那套远程专属表现）。
    → ⚠️ 判"遮罩褪了没"要**先注入 `transition:none!important` 再读 opacity**：
      `.loading-spinner` 带 `transition: opacity .3s`，隐藏标签页里 transition 不推进会读到假值（五-25 末条老坑，本次又用到一次）。
    → ⚠️ **`data-loading="true"` 不等于 bug**：懒加载图在视口外时 `img.complete === false`、遮罩本就该留着。
      真 bug 的判据是 **`complete === true && naturalWidth > 0 && data-loading !== "false"`**（图已解码却不褪）。
    → 仍未做：超时兜底（比如 8s 强制收遮罩）。因为**弱网下懒加载被中止会表现出一模一样的症状**，
      在没有他设备上的新证据前先不加，免得用兜底把真实成因盖住。
      ⚠️ **但这条次日就被更深的根因取代了**：他后来给的复现路径「文章详情页 F5 → 点主页 → 列表图永远转圈」
      指向的是**软导航途中新注册的 reinit key 从来没跑过**（见十-14 末条），
      那个才是这条症状的主因；本条修的只是"本地封面 load 失败"这一种成因。

36. ⚠️ **inline 元素的 `border` 会撑高行盒 → hover 态画"下划线"绝不能用 `border-bottom`**
    （2026-10-08 修用户报的「框选/点击文章文字时文字会跳一下」）：
    - `markdown.css` 给正文链接的 `:hover/:active` 写着 `border-bottom: 1px dashed`。inline 盒子的 border
      **不改自己的位置，但参与行盒计算**：线上 1440 实测同一行 Range 高度 `21.333 → 22.095`（+0.762px），
      标题尾部那个隐形 `a.anchor` 同样中招（`36 → 36.762`），而 `.anchor` 带 `transition: all` →
      是 **150ms 渐进撑开**，鼠标一进一出，下方整段文字跟着跳。
    - **逐条隔离才能定位**：三条 hover 声明里只有 `border-bottom` 有布局增量（`background`、
      `text-decoration: none` 都是 0），改用 `text-decoration` 画虚线也是 0。
      → 现口径：**hover 只加底色**，虚线由基态的 `decoration-dashed decoration-1 underline-offset-4` 画，
        顺带消掉了原来"hover 瞬间线从 4px 偏移跳到贴字底"的变化。
    - ⚠️ **`::selection` 不背这个锅**：全站只有两条 selection 规则、都只设 `background-color`
      （`main.css:3` + `MobileMenu.astro:86`），真造一个选区实测 `Range` 矩形与 `scrollY` **零变化**。
      用户说的"框选"实际触发条件是 hover/active —— **别照着字面去查 selection 样式**。
    - 排查手法：在定宽 `iframe` 里用 `document.createRange()` 量目标行，再用
      `el.style.cssText` **手动施加 hover 那组声明**复测差值（`:hover` 无法用 JS 触发，只能这样等价验证）。

37. ⚠️ **`animation-fill-mode: forwards` 会把 `to` 帧的 `transform` 永久留在元素上 = 常驻合成层**
    （2026-10-08，同批）：`.onload-animation`（`transitions.css` 的入场淡入上移）原先是
    `opacity: 0` + `animation: .12s ease-out forwards fade-in-up`，而 `to` 帧写着 `transform: translateY(0)`，
    于是 `#content-wrapper` 与文章正文容器 `.markdown-content` **永久**带着一个 identity transform
    （实测 computed `transform: matrix(1,0,0,1,0,0)`、`getAnimations()` 仍有对象）。
    → 危害：非 `none` 的 transform 提升图层，文字与其**选区高亮的绘制**都可能被带偏
      （这是"选中文字时看着跳一下"查完布局/滚动/JS 之后剩下的唯一站点侧可疑点；属绘制层，
        本环境拿不到像素证据，所以只当**候选**报，不当结论），而且白占一个常驻合成层。
    → 现改成 `animation: .12s ease-out backwards fade-in-up` 并**同时删掉 `opacity: 0`**：
      `backwards` 保证各 `nth-child` 的 delay 期照旧显示 0% 帧（实测新插入元素在 delay 中
      `opacity: 0 / translateY(32px)`），终态回落到元素自身样式（实测 `transform: none`、`opacity: 1`、
      `getAnimations().length === 0`），观感不变。
      ⚠️ **`forwards` 与基础 `opacity: 0` 是一对**：只去掉 forwards 不删 `opacity: 0`，动画一结束全站正文就隐形。
    → 通则：**入场动画的 `forwards` 要逐个核 `to` 帧的属性**——只要写的是 transform / opacity / filter
      这类会提升图层的值，就优先考虑 `backwards` + 把终态做成元素默认样式。

## 六、部署

> 🔒 **本节的主机登录目标、服务器绝对路径、宝塔配置文件名一律写成占位符**（2026-10-01 脱敏，
> 因为仓库公开 = 这些值等于已发布）。真实值在本地私密记录 **project memory 的
> `reference-deploy-targets.md`**（`C:\Users\31429\.qoder-cn\projects\E--fontendProjects-chenBlog\memory\`，
> 每次会话自动载入，那份记录里同时有**把占位符展开后的完整部署命令**，可直接复制执行）。
> 用到的占位符：`<ECS_SSH>`（user@host + 端口）、`<ECS_IP>`、`<REPO_DIR>`、`<NGINX_ROOT>`、
> `<VHOST_CONF>`、`<CACHE_CONF>`、`<CONF_BACKUP_DIR>`、`<WWW_ROOT>`、`<TWIKOO_ENV_ID>`。
> ⚠️ 取不到那份记录**不要猜路径**，问用户。面板密码 / SSH 私钥 / 任何 token **哪一份记录都不存**。
> 裸 IP 不算秘密（它就在 `src/config/siteConfig.ts` 的 `site_url` 和每个页面的产物里），所以
> 「验证线上」那几条 curl 仍写实际 IP；被移出的只有登录目标与服务器内部路径。

**部署方式：本地构建 + 上传 `dist`，服务器不跑 build。**（2026-09-20 起）
> 2026-09-28 接了 Pagefind：索引在 `dist/pagefind/` 里，**随 dist 一起打包上传就行，服务器和 Nginx 不用改**；
> 但 `npm run build` 现在包含索引步骤，别只跑 `astro build` 就打包，那样线上搜索会 404。

- 服务器：阿里云 ECS，宝塔面板 + Nginx
- SSH：`<ECS_SSH>`，仅 publickey 认证（密码登录已关闭），本机 SSH 公钥已授权到该服务器 ✅
- 服务器上虽有 node `v24.14.1` / npm `11.11.0` 和一份 `node_modules`，但**已不用于部署**：
  那份依赖停在 Astro 6.1.6，`npm ci` 会因 peer 冲突直接失败（详见"已知坑"）。**别在服务器上 build。**
- 服务器上的 git 仓库也不再是部署来源，会与远端脱节，属正常现象。

### 部署目标路径

| 项 | 值 |
|---|---|
| 仓库目录 | `<REPO_DIR>` |
| **Nginx 根目录** | **`<NGINX_ROOT>`**（= `<REPO_DIR>/dist`） |
| vhost 配置 | `<VHOST_CONF>` |
| 监听 | `listen 80` + `server_name 0.0.0.0` → 裸 IP 直接命中博客 |

Nginx 根目录直接指向 `dist/`，**build 完成即上线**，无需额外拷贝或 reload。

### 缓存策略（2026-09-30 加，改在 extension 里）

配置文件：`<CACHE_CONF>`
（**放 extension 目录是有意的**：宝塔不重写它，且它在 vhost 顶部被 include，
所以本文件里的正则 location 先于宝塔自带的「图片 30d / js+css 12h」生效）。

| 路径 | Cache-Control | 为什么 |
|---|---|---|
| `/_astro/*` | `public, max-age=31536000, immutable` | 文件名带内容哈希，新部署必然换名，永不会拿到旧的（顺带把封面 webp 从"完全没缓存"提到永久） |
| `/pagefind/*` | `no-cache` | 文件名稳定但内容每次构建都变，长缓存会让搜索索引错位 |
| `/gallery/**` 图片 | `public, max-age=604800` | 稳定名、偶尔换图，7 天折中 |
| 其余（所有 HTML 页 / `rss.xml` / `/api/*.json` / favicon） | `no-cache, must-revalidate` | **治的是真病**：原先 HTML 完全没有 `Cache-Control` → 浏览器启发式缓存，而每次部署旧哈希 chunk 就没了，客户端复用旧 HTML 就会 404 掉脚本，表现成"某些交互整体失效" |

三条要记住的：

1. **HTML 必须用兜底 `location /` 匹配，不能写 `location ~ \.html$`**——本站页面请求的 URI 是
   `/` 和 `/posts/xxx/`（走 `index` 指令找 index.html），按 `.html` 后缀匹配一条都命中不了。
2. **`/gallery/` 不能用 `location ^~ /gallery/`**——那会把 `/gallery/` 与 `/gallery/<id>/`
   这两个 HTML 页面一起吃进 7 天缓存，等于把本文件要修的病留下（我第一版就犯了这个，
   靠逐项打响应头的验收脚本才抓出来）。必须按图片扩展名匹配。
3. `no-cache` ≠ 每次都重下：实测带 `If-None-Match` 请求首页返回 **304**，只花几十字节。
   改完要 `nginx -t` 通过再 `nginx -s reload`，动 vhost 前先 `cp -a` 备份到 `<CONF_BACKUP_DIR>`。

> ⚠️ 服务器 `<WWW_ROOT>`（站点根那一层）下**还并存着其他项目的目录**。曾经发生过把博客路径认错的情况，
> 若推错目录会直接毁掉另一个项目。动手前务必确认当前路径是 `chenBlog/dist`，不要凭记忆。

### 标准部署流程（已验证可用）

> 下面写的是占位符；**展开后的可直接执行版本在 `reference-deploy-targets.md` 里**，抄那一份，别自己拼。

```bash
# ① 本地构建 + 打包
npm run build
tar -czf /tmp/chenblog_dist.tar.gz -C dist .

# ② 上传
scp /tmp/chenblog_dist.tar.gz <ECS_SSH>:/tmp/

# ③ 服务器：解压到临时目录 → 校验 → 原子替换
ssh <ECS_SSH> 'set -e
  cd <REPO_DIR>
  cp -a dist "dist_backup_$(date +%Y%m%d_%H%M%S)"   # 先备份，出问题可回滚
  rm -rf dist.new && mkdir dist.new
  tar -xzf /tmp/chenblog_dist.tar.gz -C dist.new
  test -f dist.new/index.html                        # 关键文件校验，缺了就中止
  chmod -R a+rX dist.new
  chown -R root:root dist.new                        # 必须！见"已知坑"①
  rm -rf dist.old && mv dist dist.old && mv dist.new dist
  rm -f /tmp/chenblog_dist.tar.gz'
```

先解压到 `dist.new` 再用 `mv` 原子替换，避免"解压到一半、访客看到残缺站点"的窗口期。
`dist.old` + 时间戳备份都保留，回滚只需 `rm -rf dist && mv dist.old dist`。

> **这套流程是唯一已验证的部署方式，优先于任何部署类技能。**
> 已安装 `alibabacloud-ecs-code-deploy` 技能，但它走 aliyun appmanager、需要 AccessKey，
> 与现有宝塔 + Nginx 手工配置可能冲突。**没有明确理由不要用它替换上面的流程。**

remote：`git@github.com:ks3356143/chenBlog.git`（本地与服务器同一个 origin，分支 `main`）

**注意：该仓库是公开的**（可匿名 `git ls-remote` 读取），任何写进仓库的文件都等于发布到公网。

### 验证线上的正确姿势

```bash
# 从本机访问公网 IP（最可靠）
curl -s -o /dev/null -w "HTTP %{http_code} %{size_download}B\n" http://47.108.230.220/

# 中文文章 URL 必须 percent-encode
curl -s -o /dev/null -w "%{http_code}\n" \
  "http://47.108.230.220/posts/$(node -e "console.log(encodeURIComponent('css100天-第28天'))")/"
```

### 已知坑（均为 2026-09-20 部署实测踩到）

① **Windows 打包的 tar 会带数字 UID（本机是 `197609`）**，解压到 Linux 后属主变成不存在的
   `UNKNOWN:UNKNOWN`。虽然 `chmod a+rX` 后 nginx 仍读得到，但**必须 `chown -R root:root`** 归正，
   否则后续任何按属主判断的运维操作都会出怪事。

② **在服务器上 `curl http://127.0.0.1/` 测不到博客！** 该请求 Host 头是 `127.0.0.1`，会精确命中
   `phpfpm_status.conf`（`listen 80; server_name 127.0.0.1;`），返回 404，看起来像站点挂了。
   博客 vhost 是 `server_name 0.0.0.0` 靠默认服务器兜底。
   → 自测要么加 `-H "Host: 47.108.230.220"`，要么直接从外部打公网 IP。

③ **node 的 `execSync` 在 Windows 上走 `cmd.exe` 而非 bash**，`/dev/null` 和 curl 的 `%{http_code}`
   都会被 cmd 吃掉，导致所有请求"失败"的假象。HTTP 测试一律用 Bash 工具直接跑 curl。

④ **中文文章 URL 必须 percent-encode**，否则 nginx 返回 404。用 `encodeURIComponent` 生成。

⑤ **服务器仓库有未提交改动**：`package.json`、`package-lock.json` 常处于 modified 状态
   （历史 `npm install` 顺手改写出来的垃圾改动），`git pull` 会因此冲突。pull 前需先
   `git checkout --` 丢弃。宝塔生成的未跟踪文件 `.htaccess` `.user.ini` `404.html` `index.html` 无害，别删。

⑥ **线上版本极易滞后**：2026-09-20 发现线上 dist 构建于 2026-06-22，落后本地 16 个提交，
   其中 `bad5d80 修复评论问题`（Twikoo envId 误配 localhost）在服务器上躺了近三个月才上线。
   → **改完必须真的部署，并实际访问线上确认**，别只看到本地 build 通过就算完事。

> 依赖层面的坑（expressive-code peer 冲突、版本天花板、干净安装验证等）统一记在**第九节**，此处不重复。

### 面板与凭据

- 宝塔面板地址、端口、安全入口等**一律不写进本文件**（仓库公开）。需要时问用户，或查本地私密记录
  （project memory 的 `reference-deploy-targets.md` —— 里面同时有部署目标真实值与展开后的部署命令；
  凭据本身**哪份记录都不存**）。
- 面板为**自签名证书**，浏览器自动化会被 `ERR_CERT_AUTHORITY_INVALID` 拦住，
  且 in-app 浏览器 surface 隐藏无法截图；http 访问直接 `ERR_CONNECTION_RESET`
  → **面板不适合自动化，一律走 SSH。**
- **凭据纪律**：面板密码、SSH 私钥、任何 token **一律不得写入本文件或提交进 git**；
  也不要在对话里明文传递。改密码应由用户自己在面板 UI 操作，避免新密码再次落入会话记录。
- 勿运行 `bt 14` / `bt default`——会把面板密码明文打印出来。

### 铁律

> **改完就推送 + 部署，不用每次问。**（2026-10-07 用户明确改的规矩：
> 「你每次改完就同步部署和推送呀」——此前这里是"上线默认由用户本人执行、每次要新的授权"，
> 因为连续几轮都靠他一句「推送并部署上线吧」放行，他觉得每问一次是多余摩擦。）
>
> **前置条件一条不能省**：必须先跑完 `npm run build`（退出码 0）+ 该做的产物/浏览器核验，
> **拿到证据再上线**，并在交付时把验收结果报给他。验证不通过就不推不上线。
>
> ⚠️ **以下四类不在自动授权范围内，仍要当次点头**：
> ① 改服务器配置（Nginx / 宝塔 vhost / extension 缓存规则 / 重启服务）——这些会波及同机**其他项目**；
> ② 任何**强推**或重写已发布历史（`--force`、`filter-repo`、`reset --hard` 后推送）；
> ③ 删除回滚资产（`dist.old`、`dist_backup_*`、stash、备份目录）；
> ④ 动服务器上的 git 仓库或其他项目目录。
>
> 部署一律走本节上面的「标准部署流程」（本地 build → tar → scp → 解压 `dist.new` → 校验 → `chown` → 原子 `mv`），
> **动之前先只读确认目标路径是 `chenBlog/dist`**（同机并存其他项目，推错目录会毁掉另一个项目）。

## 七、协作约定

### 铁律：会话收尾

> 用户说「**下班**」「**结束会话**」「**收工**」「**今天到这儿**」时，不要只回一句再见，
> 必须主动跑完收尾流程再交付总结：
>
> 1. **清临时文件** — 本地与服务器 `/tmp` 下本次会话产生的 tar 包、curl 抓的 html、探测脚本、临时清单
> 2. **整理代码** — 移除 `console.log`、临时注释、注释掉的死代码、写死的测试值；确认无半截实现；`npm run build` 必须通过
> 3. **整理 MD** — AGENTS.md / README 与实际状态对齐，过期内容删掉、变更路径改掉、更新「最后更新」日期
> 4. **去重** — 同一件事只在最合适的一处讲，其他地方引用而非复述
> 5. **Git 收尾** — `git status` 干净，或明确说明保留了哪些未提交改动及原因；**改完就推送 + 部署**（六节铁律，2026-10-07 起不再每次问），但**强推/重写历史、改服务器配置、删回滚资产仍要当次点头**；提交前扫一遍敏感信息
> 6. **任务清单** — 关闭已完成的，未完成的写清卡在哪、下次从哪继续
> 7. **一句话总结** — 改了什么、线上状态、遗留事项。不复述过程。
>
> ⚠️ **回滚资产不算临时文件**：`dist.old`、`dist_backup_*`、git stash、备份目录一律保留，
> 删掉就失去回滚能力。只有用户明确说"确认稳定，清掉备份"时才删。拿不准就保留并告知。

### 日常约定

- **改之前先跑起来看现状**，不凭想象动手；改完必须 `npm run build` 通过再报完成。
  ⚠️ 但 **build 退出码 0 ≠ 产物是新的**：动到 markdown 插件链时先按第五节 21 清内容层缓存，再 grep 产物确认。
- **UI 改动要在浏览器里实际验证**（可用 browser-use 只读访问线上站点对比）
- 提交粒度小，一次改动一件事，方便回退
- 提交信息用中文，跟现有风格一致（如"添加前端css邪修-2ge"）
- 不引入新依赖前先问；不擅自升级大版本
- 不确定就问，别猜
- **批量改文件必须逐行保留原行尾**（2026-09-29 踩过）：本仓库 `core.autocrlf=true` 且**没有 `.gitattributes`**，
  而 git 索引里的行尾**本身就是混杂的**——实测一部分文件的 blob 存 CRLF、另一部分存 LF，工作区全是 CRLF。
  → 用脚本（node/sed）批量改写时要按 `(\\r?\\n)` 捕获再原样写回；改完先看 `git diff --numstat`，
  **每个文件应当只有你真正动过的那几行**。若出现"1 行改动变成 40/40"，就是行尾被整体翻转，立刻 `git checkout --` 回退换写法。
  反过来"把全项目统一成 CRLF/LF"这种好心想也别做，那会产生整文件重写式 diff。
  ⚠️ **2026-10-01 补：不只是脚本会翻，`Edit` 工具改一个混合行尾文件也会整片归一化成 CRLF**。
  本次改 `global.css`（blob 实测 112 CRLF + 64 LF）只想删 4 行，Edit 之后 `git diff --numstat` 变 61/65。
  → 修法：用 `git show HEAD:<file>` 取原始**字节**，按 `0x0A` 切块（块内保留 `\r`）、过滤掉目标块、
    `Buffer.concat` 原样写回，全程不做任何编码转换 → 净 diff 回到 0 增 4 删。
  → 判规模要用 `git diff HEAD --numstat`：`git reset --soft` 之后索引里还留着上一次那份翻好的文件，
    裸 `git diff` 比的是工作区 vs 索引，会给出一个误导性的数字。
  → 每次改完**先跑这一条再提交**，别等提交完才看到 diff 变大。
  ⚠️ 同一天还犯了一个**更狠的：读写编码不一致会直接写坏文件**。
  `readFileSync(f,"latin1")` 读、却 `writeFileSync(f,str)`（默认 utf8）写 → 非 ASCII 字节被重新编码，
  **中文注释全变乱码**，`global.css` 的 diff 从预期的 3 行炸成 16/14。
  → 铁律：**读什么编码就用什么编码写回**。本项目源码是 UTF-8 且中文注释极多，正常应当 utf8 读写；
    `latin1` 只适合只读地数列数/行尾，**绝不能顺手写回**。
  → 自查：改完跑 `grep -E "Ã©|å´|ä¸»|æå"` 扫一遍所有改动文件，命中即为乱码。
  提交前可用 `cp .git/index /tmp/tidx && GIT_INDEX_FILE=/tmp/tidx git add <文件>` 在**临时索引**里模拟暂存，
  确认 diff 规模没炸——这招不碰真索引，安全。
- **组件自述写 frontmatter 里的 `//` 注释**，不要声明成 `const DES = "…"`（2026-09-29 统一）。
  后者在 14 个文件里是**只声明从未读取**的死变量，已全量转注释；Astro frontmatter 是 JS，注释合法且不进产物。
- ⚠️ **这台机器上 bash / node / PowerShell 三套路径与引号语义互不通用**，2026-09-29 一次会话踩 4 次，
  每次都白白产生一个"文件不存在 / 命令失败"的**假结论**：
  - **Git Bash 不认 `D:/xxx` 盘符写法**（`ls: cannot access`），必须 `/d/xxx`。
    当时据此判定微信的两张图"不存在"，换成 `/d/` 才发现目录一直在（不过那两个文件确实已被清理，
    但**排除掉路径写法这个假信号之前，不能下"文件不存在"的结论**）。
  - **node 的 `fs` 不认 Git Bash 的 `/tmp`**，会解析成当前盘符下的 `E:\tmp` → `ENOENT`。
    跨工具传临时文件一律用 `path.join(process.env.TEMP, 'xxx')`，别在 node 里写 `/tmp/...`。
  - **PowerShell 命令串放进 bash 双引号会被 `$` 提前展开**：`$_.CommandLine` 变成 `extglob.CommandLine`，
    报一串 `CommandNotFoundException`，看起来像 PowerShell 坏了。整段要用**单引号**包，
    内层需要单引号时用 `'"'"'` 拼。
  - **写正则改文件前先确认实际缩进与行尾**：本仓库 `package.json` 是 2 空格 + LF，
    `src/utils/*.ts` 与 `src/config/*.ts` 是 4 空格，`.astro` 是 tab。
    凭印象写 `\t*` 去匹配 `package.json` 会**静默不匹配**（不报错，只是没改到）。
  - **含反斜杠的内容（Windows 路径）不要手抄进 `node -e` 脚本**：2026-10-09 同步手册时，
    `数据\生成\<项目>\` 的反斜杠被吃了两轮，而且我的**断言也跟着误判**（正则 `/数据\\生成/` 在
    bash 单引号 → JS 源码这条链上到底剩几个反斜杠，肉眼看不出来）。
    正确做法：① **直接从源文件那一行回填**（`fromSrc(行号)`，源文件里存着正确的字节）；
    ② 断言用 `const BS=String.fromCharCode(92)` 拼字符串 + `includes()`，**不要用正则字面量**；
    ③ 断言的期望值要算准"原有 + 新增"（那次文章里本来就有 9 个反斜杠，加 6 个应是 15，
    我按 6 断言结果自己把自己拦下来白查一轮）。最终仍以**浏览器 DOM 的 textContent** 为准。
  - **bash 的 `date` 在这台机器上取不到本地时间，别拿它写带时区的 frontmatter**（2026-10-10 发动态时踩到）。
    `TZ=Asia/Shanghai date "+%Y-%m-%d-%H%M%S"` 给的是 **`082224`**，同一时刻 `node -e "new Date()"` 是
    `16:22:45 GMT+0800`——Git Bash 没有 tzdata，`TZ` 指向的库文件名解析不到就**静默按别的时区出结果**，不报错。
    → 症状如果发生了会很难看：动态条目的 `published` 必须带 `+08:00`（五-23），
      照 bash 的时间写就成了「早上 8 点发的动态」，而**展示端也会跟着显示 08:22**（它只是把那个时刻按机区格式化）。
    → 铁律：**要时间戳一律 `node -e` 现取**（`new Date()` 本地读 + 自己拼 `+08:00`），文件名与 `published` 用同一个值。
      判别同类问题的通用办法：**凡是"跨工具拿环境量"（时间 / 路径 / 编码 / 用户名），两个工具各取一次再比对**，
      不一致时以 node/PowerShell 为准（它们走 Windows API），别信 bash 的模拟层。

## 八、文章写作规范（2026-09-21 实测调研，非推测）

### 现状

27 篇文章 = 25 `.md` + 2 `.mdx`（只有第2、3天用 mdx），**无草稿**，与 `dist/posts` 的 27 个路由一一对应。
`src/content/posts/images/` 是个**空目录**，历史遗留、git 也不跟踪空目录。
新文章用 `.md`（主流选择），只有需要嵌组件时才用 `.mdx`。
**文件名一律 ASCII slug，且用 `npm run new:post` 生成**（规则与理由见第五节 26）。

### 发稿协作流程（2026-10-01 与用户约定，下次别重新问一遍）

用户只给 **MD 正文**，分工固定成这样：

1. **特殊语法我自己扫，不反问他**：Mermaid / `$$` KaTeX / `:::` callout / 图片网格 / `<github>` 卡片 /
   外链图片。扫到了就按本节末尾那条"零实战验证"的规矩，在 dev + `dist` 产物里逐项验，
   **不许"配置装了就当它能用"**。
2. **唯一必须他定的是归位 = 永久 URL**：系列第几天（`--day N`）还是非系列（`--slug ascii-kebab`）。
   猜错就是永久错地址、脚本也不做中文音译（五-26），这一项不能替他假设。
3. **图片要文件本身**：他给 `C:\Users\…\xxx.png` 这种本地路径我读不到（跨工具路径还不通用，见七节）。
   要么拿文件放进 `public/images/` 并写成 `/images/xxx.png`（上面表格里唯一正确写法），要么用 URL。
   - **相对路径不行**：`![](截图/a.png)` 会解析成 `/posts/<slug>/截图/a.png` → 404。**中文文件名也不行**，
     要改成 ASCII；一组图放一个子目录里（`public/images/ccnewtools/01-home.webp`），目录名做命名空间，
     文件名保留 `NN-语义` 两段以便与正文顺序对上。
   - **`public/` 不走 Astro 图片优化**（同五-28 相册那条），所以 PNG 要自己转 webp 再放。
     2026-10-07 首次实测：11 张 1600×900 UI 截图 PNG 1.67MB → `sharp .webp({quality:88,effort:6})` **0.33MB（−80%）**，
     逐像素 MAE < 1.1/255。**判清晰度要拿原图对比**：那批图里的高斯模糊是他自己打的码，
     我差点把"原图就有"的东西当成压缩毛刺报上去。
4. **`description` 不给我就从开头提一版草稿让他改**；tag 写「CSS100天」、series 写「CSS100Day」（五-17）。
   `category` **现有两个值**：系列文与站内文章用「设计灵感」，非站类内容用「工具」（2026-10-07 新增，
   首篇 = `/posts/ccnewtools-manual/`）。**再新增分类值要先确认**——分类是从文章聚合出来的
   （`content-utils.ts` 无硬编码清单），新值会**立刻**出现在顶部分类栏、`/categories/`、归档页筛选里。
5. **上线不用再每次问**（2026-10-07 用户改的规矩，见第六节铁律）。
   固定流程：`new:post` → 填 frontmatter → `npm run build` → 逐项核产物（列表页封面、标题层级、
   列表顺序、搜索命中）→ **把自测结论报给他** → 提交 + 推送 + 走第六节部署 + 公网逐项验收。
   ⚠️ 但**改服务器配置 / 强推 / 删回滚资产**这三类仍要当次点头；他若明确说"先别上线"就停在这一步。
6. ⚠️ **正文里不要写 `# 一级标题`**（五-13：`Layout.astro` 已在 `#swup-container` 内注入 sr-only `<h1>`，
   文章可见标题另有横幅那层）。从别处迁移来的 markdown **第一件要删的就是它**，否则一页两个 h1。
   小节从 `##` 起正好接在 sr-only h1 下面，`astro check` 与标题层级审计都过。
7. ⚠️ **正文里成对的英文直引号 `"xxx"` 必须改写成中文 `“xxx”`**（2026-10-07 实测）：
   markdown 管线会把 `"` 转成智能引号，而**紧跟中文、前面没有空白时它被判定成后引号**，
   于是 `"可疑"` 渲染成 `”可疑”`——**两个都是后引号**。站内其余 26 篇用「」或已正确的 `“”`，
   所以全站只有迁移来的手册踩到（首版 19 处）。
   → 改法：正文里成对替换为 `“”`。**改之前先把 `` `code span` ``、``` 围栏、以及 HTML 标签里的属性引号保护掉**，
   并且**绝对不要动 frontmatter**——`description: "…"` 外层那对引号是 YAML 定界符，
   换成 `“”` 会让 schema 解析直接失败。
   ⚠️ **属性引号被一起改掉 = 静默毁功能**（2026-10-07 就是这么弄坏八-8 的）：
   `<div class="horizontal-scroll-container">` 被改成 `class=“horizontal-scroll-container”`，
   HTML 解析器把弯引号当成值的一部分 → 产物里 class 字面量带弯引号 → **CSS 选择器永不匹配**，
   宽表格的滚动容器从那天起是死的（不报错、不告警，页面照常渲染）。
   → 通则：**正文里"给人读的文字"才改引号方向；任何 `<` … `>` 之间的内容一律不碰。**
   → 核法（两条都要跑）：① 扫 `dist/posts/*` 里 `/^”[^“”\n]{1,15}”$/` 形状的串，**期望 0 处**；
     ② 扫产物属性 `grep -c 'class=“' dist/posts/*/index.html`，**必须全为 0**；
     ③ 包了容器就必须在产物里能 `grep 'class="horizontal-scroll-container"'`，并在 375px iframe 里
     实测 `document.querySelectorAll('.horizontal-scroll-container').length > 0` 且 `scrollWidth > clientWidth`
     ——**只 grep 源码字符串会漏**（弯引号那份源码里看着"包了"，产物里其实没生效）。
8. ⚠️ **宽表格必须自己包一层 `.horizontal-scroll-container`**（2026-10-07 查出并首次使用）：
   `markdown.css` 给文章表格写的是 `table { width: max-content; min-width: 100% }` + `th,td { min-width: 120px }`
   → **表格永远按最大内容宽排、不随窄视口回流**，而文章页那层包裹
   （`src/pages/posts/[...slug].astro:61` 的 `relative mb-4 flex w-full flex-col overflow-hidden`）
   是 `overflow-x: hidden`，所以 375px 下超出的部分**既不出滚动条也看不见 = 内容直接丢失**
   （实测第二张表 726px 塞进 295px 容器）。
   模板其实自带解法：`.custom-markdown .horizontal-scroll-container { max-width:100%; overflow-x:auto;
   -webkit-overflow-scrolling:touch; overscroll-behavior-x:contain }`（`markdown.css:113`，
   与 `.katex-display-container` 同一套约定），**但要作者手动包**，全站此前零使用。
   写法（已验证能产出正确嵌套，remark 的 HTML 块在空行处结束）：
   ```markdown
   <div class="horizontal-scroll-container">

   | 参数 | 说明 |
   |---|---|
   | … | … |

   </div>
   ```
   实测：375px 下容器 295px、`scrollWidth` 528/726、可横向拖动、页面零横向溢出；
   **1440px 下表格仍是 728px 铺满、不出现滚动条 = 桌面观感零变化**。
   ⚠️ **既存未修**：`css100天-第8天.md` 那张表（375px 下 653px）同样被裁，**属改名之前就有的缺陷**，
   已报告用户；它那张表缩进在列表项内，包 div 要连带改列表结构 → 等他点头再动。
9. ⚠️ **`ccnewtools-manual` 这篇有两处「故意与源手册不同」，下次差量同步绝不能改回去**（2026-10-08 用户口径：
   先不动图片，把正文和图的数值差异修一下 → 所以**文字跟配图走**）：
   - 5.2 那句写 `匹配 2 / 110 个用例`。他手册里现在是 **10**，但配图 `05-tree-search` 底部与
     `02-parsed` 的统计条都明明白白显示 **110 个测试用例**（同图还有 37 测试项 / 528 步骤 / 4 告警 / 3 提示）。
     → 同步脚本会把这行改回 10，**必须手动保留 110**（或他哪天换图再一起改）。
   - 文末多一行 `> 注：站内截图取自 v1.1.0 界面…`。他手册没有，是我加的：尾注让读者"看顶栏徽标确认版本"，
     而每张截图左上角徽标都是 **v1.1.0**，不补这句就等于正文与配图直接矛盾。
   → 通用口径：**只要配图不动，正文里凡与图里可读数值冲突的地方都以图为准**，并把这类偏离逐条记在这里，
     否则下一次"对齐源手册"会把它们悄悄抹回去。
   → 2026-10-09 一天内同步了三次：v1.1.5 → **v1.3.2**（他仓库 HEAD `244d765`）→ 同日 **v1.3.3**（HEAD `0caddd3`
     大纲树收展与缩进修复）。配图始终是 10-08 那批、未换，所以上面两处偏离**继续保留**；
     新增的 20MB/100MB/200MB/600/2000/10MB 都是"阈值"而不是演示数据本身，与配图不冲突，只有 110 那处是图里可读的实际数值。
     ⚠️ 同日 17:3x 他还说过一次"手册又更新了"，但**文件 mtime 仍停在 16:27、全项目搜不到第二份手册**
     ——是编辑器没存盘。碰到"他说更新了但 diff 为零"就先把 mtime/字节数/搜索结果摆出来问他，**别自己编内容**。

### frontmatter

文章的 frontmatter 写法（新增字段必须先改 `src/content.config.ts` 的 schema，见第五节 5）：

```yaml
---
title: CSS100Day(29)-标题
published: 2026-09-21
updated: 2026-09-21
description: "列表页显示，按 2 行截断（siteConfig.descriptionLines）"
tags: [CSS100天, css]
category: "设计灵感"
series: "CSS100Day"
seriesOrder: 29
draft: false
---
```

26 篇实测**只出现了 9 个字段名**：上例那 9 个（`title` `published` `updated` `description` `tags` `category`
`series` `seriesOrder` `draft`），`image` 只有 10 篇写了、且值全是 `""`（所以封面全走兜底图）。
schema 里剩下 3 个（`pinned` `comment` `password`）零使用。
（**2026-10-01 删掉了 6 个零使用字段**：`lang` `author` `sourceLink` `licenseName` `licenseUrl` `passwordHint`，见五-5。）
`category` 会进分类导航栏，要新增分类值前先确认；`series` 决定文章是否出现在 `/series/`（见第五节 17）。

### 图片：最容易出事的地方

| 写法 | 结论 |
|---|---|
| `![说明](/images/xxx.jpg)`，文件放 `public/images/` | ✅ **唯一正确写法**，2026-10-07 前全站只有 1 篇用对（第6天:26）；现 2 篇（另一篇 = `/posts/ccnewtools-manual/`，11 张图走 `/images/ccnewtools/*.webp`） |
| `<img src="./xxx.svg">` **写在正文里** | ❌ 真坏：解析成 `/posts/<slug>/xxx.svg`，文件不存在就 404 |
| `<img src="./xxx.svg">` **写在 ` ``` ` 围栏里** | ✅ **无害**：只是示例代码文本，浏览器不发请求（见第九节"heart.svg 误判"） |
| `src="https://100dayscss.com/..."` | ⚠️ 依赖他人服务器，对方开防盗链或关站会集体裂图。2026-09-28 实测 12 个真实请求的资源全部 200 |

**封面**：`image` 字段至今**没有一篇有真值**（历史 10 篇写了但值是 `""`；2026-10-07 那篇干脆不写这个键——
schema 里它是可选的，不写等同于空，列表页同样走 `getPostCover()` 兜底）。
> ⚠️ **2026-09-29 更正**：此前这里写的是"所以列表页封面统一是兜底图 `loadingfalse.png`"——**错的**。
> 核 `dist/index.html`：10 张卡片是 10 个 `post-card-enter-btn`，**一张封面图都没有**；
> `loadingfalse.png` 在 `CoverImage.astro` 里只在**封面 src 是远程 URL 且加载失败**时才被加载
> （条件 `!isLocal && !isFallbackPublic`），空 `image` 根本走不到那条分支。
> 现在列表页空 `image` 的文章由 `getPostCover()` 按 `seriesOrder` 自动配一张（见第五节 25）。

注意 `src/assets/covers/1,2,3.jpg` 是**站头轮播壁纸**（被 `backgroundWallpaper.ts` 引用），
不是文章封面，别混；`src/assets/postImages/covers/` 才是自动封面素材（svg 源 + 脚本产物 webp），
`src/assets/postImages/chen1~4.webp` 是已停用但保留的旧动漫素材。

### ⚠️ 这些功能配置齐全但从未在生产环境用过

Mermaid、KaTeX 公式、`:::` callout 提示框、图片网格 ——
26 篇文章**一个都没用到**，全部是纯 HTML + 内联 `<style>`（CSS100Day 系列的做法）。

→ 这些渲染路径等于**零实战验证**。首次写用到它们的文章，必须在 `npm run dev` 里逐项确认再上线，
别以为配置装了就能用。

**已确认在生产用的，别混进上面那份清单**（2026-09-29 逐条核 `dist/`）：
- **代码块折叠**：28+ 个产物含 `ec-collapse`，文章里超 15 行的代码块一直在折叠（见第五节 3）。
- **`<github>` 卡片**：`/about/` 上实打实渲染着 3 张（`chenBlog` / `cdTestPlant3` / `cdtestplant_v1`）。
  也就是说 `src/plugins/rehype-component-github-card.mjs` **是活代码不是摆设** ——
  它注入的是**浏览器端脚本**，改完必须按第五节 21 清内容层缓存才看得到变化。

## 九、待办与未决（最近一次更新：2026-10-07 下午）

### 2026-10-07：首篇「工具」类文章 `/posts/ccnewtools-manual/`，顺带查出**两条同类病**

用户把自己另一个项目（CCNewTools，离线测试文档生成工具）的使用手册交进来发博客。
发稿流程（八节）第一次真跑，**分工证明是对的**：他只给 MD + 一句"分类是工具"，
我扫语法、提 description、定标签，**唯一回问的是归位 slug**（他选 `ccnewtools-manual`）。
手册零 Mermaid / 零 KaTeX / 零 callout / 零图片网格，所以八节那份"零实战验证"清单**没有被消耗掉，仍然全空**。
但查出两条**同族病：从参考站照抄的东西，改名或裁剪之后不报错、只是静默不生效**：

1. ✅ **文章图片的 Fancybox 灯箱一直是死的**（已修，`FancyboxManager.astro` 两处选择器）。
   根因链条完整可复述：`Markdown.astro` 把正文容器类名写成 **`custom-markdown`**，
   而参考站 firefly.cuteleaf.cn 是 **`custom-md`**（2026-10-07 实测它的文章 HTML 与
   `FancyboxManager…js` 原文：绑的正是 `".custom-md img, #post-cover img, .moment-images img"`，
   与我们这份**逐字相同**）→ 我们照抄了选择器却改了类名，于是
   `hasElements` 守卫永远为 false、`setup()` 直接 `return`，**连 Fancybox 本体 chunk 都不请求**。
   影响面：27 篇文章 60+ 张正文图，含 `/about/` 与 `/guestbook/`（它们也走 `<Markdown>`）。
   → 修法只加类名不改现有 CSS：`".custom-md img, .custom-markdown img, …"`（两个都留，
   `.custom-md` 仍是动态页模板在用）。**别改成把 `Markdown.astro` 的类名换回 `custom-md`**——
   `markdown.css` 全部规则都挂在 `.custom-markdown` 下，那会整片丢样式。
   → 取证办法（比"点一下看有没有弹窗"可靠，因为这个浏览器 surface 里合成 click 被 Fancybox 挡了）：
   **数 Fancybox 本体 chunk 有没有被请求**。修后 `/posts/css100天-第13天/`（6 张正文图）**加载** `dist.*.js`，
   `/series/`（0 张）**不加载** —— 一前一后就是因果证据，且顺带证明没给无图页面白拉这个包。
   ⚠️ 仍未做的：真人点击是否真弹出大图，**我在本环境没法验**，要他自己在 preview 里点一张确认。
2. ⚠️ **宽表格在 375px 下丢内容**（新规矩见八节 7）。本批**只修了自己这篇**（两张表都包了
   `.horizontal-scroll-container`，桌面观感零变化），**`css100天-第8天.md` 那张表仍被裁**——
   它缩进在列表项内，包 div 要连带动列表结构，属既存缺陷且要改他的旧文章 → **已报告，等他点头**。

**同一批查出的第三条，故意没动**：`Markdown.astro` 里写的是 **`propse-base`**（参考站是 `prose-base`），
Tailwind 的 `prose-base` 拼错 → 该工具类从未生效。它正好是 `prose` 的默认字号，**所以现在看不出任何异常**，
补上会改全站 27 篇文章的正文排版 → 属视觉决策，**别顺手"修 typo"**，要改先做前后对比再问他。

**本批基线变化**：文章 26 → **27 篇**（25 .md + 2 .mdx）、页面 42 → **43**、dist 文件 336 → **350**
（+1 文章页 +11 webp +2 pagefind 产物）、Pagefind 索引 28 → **29 页**、`public/images/` 1 → **12** 个文件。
分类值 1 → **2**（设计灵感 / 工具）。

### 2026-10-01 上午批准的四件工程项：全部完成（细节见对应条目）

| 项 | 结果 |
|---|---|
| 删 schema 6 个零消费字段 | ✅ 见五-5；`npm run new:post` 本来就只写 9 个字段，**无需同步**（原待办里那句担心是多余的） |
| 抽 `onReinit(fn)` 统一 34 处重 init 脚手架 | ✅ 见**十-14**（含回归取证办法）；按原指示**没在 dev 下验**，全程 `build` + `preview` |
| 装 `@astrojs/check` | ✅ 见三节；首跑 4 个类型问题已修（九节「`astro check` 首跑」小节），已走干净 `npm ci` + build |
| 文档里服务器信息脱敏 | ✅ 六节改成占位符，真实值 + 展开版命令在本地私密记录 `reference-deploy-targets.md`；**只改当前版本，未动历史** |

**这批新添的未决项只有一条**：`PostCard` 的加密文章锁图标**其实从来没渲染过**（五-5 已纠正说法）。
补法很小（一个 `<Icon name="material-symbols:lock">` + 一个条件），但**当前零篇加密文章 → 无任何可见影响**，
属"要不要补个缺失的 UI"的设计决定 → **等用户点头再做**，别自动顺手加。
（同时注意：`/api/allPostMeta.json` 会把每篇的 `password` 布尔值公开出去，正文本来就公开，所以不算泄露，
但真做加密时别把这个接口当访问控制。）

### 文章方向：三条已全部拍板并落地（2026-09-29 午后）

1. **新文章走 ASCII slug**，已有 26 篇中文 URL 不动 → 见第五节 26。
2. **列表页自动配封面**（按 `seriesOrder` 轮播 4 张技术感矢量图，不是原计划的"按分类"——
   当时 26 篇 `category` 全是同一个值 `"设计灵感"`，按分类分配等于全站一张图，没有区分度。
   2026-10-07 加了第二个分类值「工具」，但只有 1 篇，**按分类分配仍然没有区分度，这条结论不变**）→ 见第五节 25。
3. **文章脚手架 `npm run new:post`** → 见第五节 26。

余下的内容类待办：**首篇用到 Mermaid / KaTeX / callout / 图片网格 的文章仍未写**，
那四条渲染路径至今零实战验证（见第八节末尾），首次写时必须按第八节在 `dev` 逐项确认再上线。

### 缺陷现状（2026-09-29 复核）

**已知缺陷：无未修项。** 2026-09-28~29 用「解析真实元素 + 逐路径核 dist」扫全站 **40 页**：
本地引用 **0 缺失**、远程 57 个 URL 全部 200（100dayscss 12 个 / 本站绝对链接 39 个 / astro.build 1 个 / GitHub 5 个）；
标题层级审计 **40 页 0 问题**。修了什么见 [`HANDOFF.md`](./HANDOFF.md) 第二节，此处不重复；
本节只留**长期有用的排查方法**。

- **两条 agent 报告核实后是误报，别再去"修"**（2026-09-29 代码体检时查出）：
  ① `CoverImage.astro` **并没有** `import { Image }`——第 3 行只有 `Picture`，
  是第 2 行注释里的 "ImageWrapper" 字样被工具当成了引用；
  ② `Category.astro` 的 `--collapsedHeight` **不是未定义变量**，是 Astro `<style define:vars>` 注入的
  （通则见五-22 末条：判变量可达性要逐个看来源）。
- **两条曾挂着的多轮"已知缺陷"是误判，别再当真**（2026-09-28 证伪）：
  ① `<img src="./heart.svg">` 线上 404、② "代码块语言徽章与行号从未渲染"。
  两者都是**用错了探测手段**：① 那两处引用在 ` ``` ` 围栏内是示例文本（grep 命中的是 expressive-code
  塞进复制按钮 `data-code` 属性的整段代码），页面上没有 `<img>` 元素、不发请求；
  ② 徽章是 `[data-language]::before` **伪元素**（不在 HTML 文本里）、行号是 `div.gutter > div.ln`
  （第10天页实测 124 个），拿 `ec-line-numbers` 这种不存在的类名去查自然"零产出"。
  → **通则：查渲染缺陷要按产物实际结构验证，别用"搜 HTML 字符串"和臆想的类名当证据。**
  → 两条 2026-09-29 部署验收时**当场踩到**的 grep 假阴性，别再来：
    ① **`[A-Za-z0-9]` 不含下划线**，而 Astro 资源哈希就是带 `_` 的（`cover-4.BL_zRYPd_1Xlmfl.webp`），
      用不含 `_` 的字符类去匹配必然得"零引用"的**假结论**——当时线上首页明明有 10 张封面，我却 grep 出"封面没上去"。
      匹配产物文件名要用 `[A-Za-z0-9_-]`。
    ② **`grep -oc` 数的是"匹配行数"不是出现次数**（`-c` 会覆盖 `-o`），
      而 dist 的 HTML 是压缩到少数几行的，所以 10 张卡片只会得 1。
      要出现次数就用 `grep -o ... | wc -l`，或者直接用 node 的 `matchAll`（本项目验证脚本一律走 node，
      还能顺手把线上产物和本地 `dist/` 逐项比对——这才是"上线成功"的证据）。
    ③ **反向的假阳性**（2026-10-08 傍晚把自己的部署脚本搞挂一次）：`grep -q "1.1.4"` 里的 `.` 是通配符，
      会命中 SVG 图标路径坐标 `1 1.41 1.41`、`V191.488q0-26` 这类字符串 →
      "产物里残留旧版本号"的断言**误报成立、部署被自己中止**（本地 node 转义后是 0 命中）。
      → **内容断言一律 `grep -qF "1.1.4"`（固定串）**，或先 `replace(/<[^>]+>/g,'')` 剥标签再查正文。
      好消息：脚本是"校验不过就不切 dist"，所以线上一直停在好的版本上、零影响——**校验必须在替换之前**这条救了一次。
  → `<img>` 是 void element，解析器不会把它挂成 `<pre>` 的后代，所以"跳过 pre 子树"的 HTML 解析法也会漏判；
     正确做法是**按源码 ` ``` ` 围栏逐行判定**（围栏内=示例文本，围栏外=真实元素），再核 `dist` 里文件在不在。
- **远程图片依赖 `100dayscss.com`**：实测 12 个 distinct 资源 / 13 处真实请求（另有大量写在围栏内的示例引用，不发请求）。
  对方关站或开防盗链会集体裂图，属**外部风险**，不是当前缺陷。

### 2026-09-29 代码体检：全部已解决（含两条真缺陷）

体检方式：`console.log` / 死变量 / 未用导入 / 非法 CSS / 写死测试值 五类逐项扫 + 逐条核产物。
纯清理项（14 处死变量、4 条调试日志、1 条非法声明）见 [`HANDOFF.md`](./HANDOFF.md) 第二节。
**这里只留查出来的缺陷和它们的答案**：

1. ✅ **`dayjs` 已补为显式依赖**（`^1.11.23`）。它此前只靠 `mermaid`（devDep）和 `sanitize-html→launder` 带进来，
   是第五节 10 那条 `@astrojs/markdown-remark` 事故的同一类风险。已按第九节走**干净 `npm ci` + 构建**验证通过。
2. ✅ **暗色悬浮目录是白的**（真缺陷，非冗余）。`FloatingToc.astro:38,42` 用**内联 `style=`** 写死
   `rgba(var(--card-bg-rgb, 255,255,255), .6)`，而 `--card-bg-rgb` **从未定义** → 恒等于白色半透明，
   且内联样式把 `dark:bg-black/60` 工具类**整个压掉**。
   → 修法：在 `global.css` 两个主题块里补 `--card-bg-rgb`（亮 `255,255,255` / 暗 `22,31,27`，与 `--card-bg` 同色）。
   实测暗色由 `rgba(255,255,255,.6)` → `rgba(22,31,27,.6)`，亮色零变化。
   ⚠️ 顺带纠正一个我这次先判断错的点：**那两条 `:global(.dark) … !important` 不是冗余副本**，
   是作者为打穿这条内联样式写的（但选择器写错所以从没生效）。已随内联修好而删除，无需再用 `!important`。
   → **通则见第五节 22：`style=` 内联样式会压过一切样式表规则，含 `dark:` 工具类。**
3. ✅ **浮动按钮暗色描边看不见**：`FloatingButton.astro` 的 `border: 1px solid rgba(0,0,0,0.1)` 写死黑色，
   叠在 `#161f1b` 卡面上≈无描边；改为 `var(--line-divider)`（主题感知，与全站其它卡片一致）后暗色出现浅描边。
   同时删掉该组件里那条永远不生效的 `:global(.dark) .floating-btn` 块，和两处引用**未定义变量**
   `--shadow-button` / `--shadow-button-dark` 的 `box-shadow`（按钮的阴影一直由 `.card-base` 的 `shadow-xs` 提供，删掉无视觉变化）。
4. ✅ **文章链接 hover 的虚下划线从未出现**：`markdown.css` 的 `border-bottom: 1px dashed var(--link-hover)`
   和 `decoration-(--link-underline)` **两个变量都不存在**。后者换成 `--primary` 是**等价替换、零视觉变化**
   （原本 `text-decoration-color` 无效 → 回落到 `currentColor`，而链接色就是 `--primary`）；
   ⚠️ **前半句的结论已被推翻**（2026-10-08）：当时把 `border-bottom` 补成 `var(--primary)` 让这条线**真的生效了**，
   但 `border-bottom` 写在 inline 链接上会**撑高行盒**（实测 +0.762px、带 transition 是 150ms 渐进撑开），
   用户报的「框选/点击文字时文字跳一下」正是它。现在 hover 只加底色、虚线交回基态的 `underline`，
   细节与取证见**五-36**。
5. ✅ **`--shodow-md` 拼写错已改名为 `--panel-shadow`**（`global.css` + `MobileMenu.astro` + `DropdownMenu.astro` 三处同步）。
   ⚠️ **别图省事改名成 `--shadow-md`**：Tailwind v4 的 `theme.css` 里 `--shadow-md` 是**utility 命名空间的 token**，
   在 `:root` 覆盖它会连带改掉全站 `shadow-md` 工具类的值（本项目当前没人用 `shadow-md`，所以是**潜伏**的坑，不是当下报错）。
   → 通则：给自定义变量起名要先排除 Tailwind v4 的 `--color-*` / `--shadow-*` / `--radius-*` / `--spacing-*` 等命名空间。
6. **仅剩的未定义变量都在「不可达」路径上，故不动**（改也无从验证）：
   `markdown-extend.styl` 的 `.mermaid-loading` / `.mermaid-error` 里引用 `--text-color-secondary`、`--primary-hover`
   —— 只有 Mermaid 渲染时才会出现，而 26 篇文章零使用（第八节）。
   首次写 Mermaid 文章时按第八节在 dev 逐项验，届时一并定值。
   另：`markdown.css:188` 的 `body.wallpaper-transparent { … var(--card-bg-transparent) }`
   —— **全站没有任何代码设置过 `wallpaper-transparent` 这个类**，整块不可达，不只是变量缺失。

> 产物里现在只剩 `.dark .callout` / `.dark .callout-title` 两条裸 `.dark`，
> 那来自 `node_modules/rehype-callouts/…/github/index.css`（依赖自带），不是本项目源码，且 callout 零使用，别去动。

另：`tsconfig.json` 里 `"jsx": "react-jsx"` / `"jsxImportSource": "react"` 是模板残留（项目无 React），
不影响构建，也未动。

### 2026-10-01 下午这批：`astro check` 首跑 + 重 init 脚手架收编

**`astro check` 首跑查出 4 个类型问题**（全部已修，现在 `npm run check` 退出码 0）：

1. ✅ `PostMeta.astro:11` 的 `className: string` 是**必填**，但唯一调用方 `PostCard.astro:81` 从来没传 →
   `ts(2322)`。改 `className?: string`（`class:list` 收到 `undefined` 本来就该跳过）。
2. ✅ `SwupManager.astro:64` 那个 `closest("a[href]")` 被当成 `Element`，于是 `a.target` 报 `ts(2339)`
   → 断言成 `HTMLAnchorElement | null`。**只是类型层修正，拦截逻辑运行时一直是对的**（`target` 属性本来就在）。
3. ✅ `[...page].astro:19` 的 `const len = page.data.length` 是零引用死变量（注释还写着"用于渲染计时"）→ 删。
4. ✅ `BaseLayout.astro:12` 的 `import "@rehype-callouts-theme"` 报 `ts(2882)`——它是 `astro.config.mjs:64`
   的 **vite alias**，tsc/Volar 不解析 alias。**已加 `src/modules.d.ts` 一条环境声明**（不动源码写法，
   因为那个别名是按 `siteConfig.rehypeCallouts.theme` 拼的，硬编码成真实路径会把主题选择写死进组件）。
   ⚠️ 别因为「零使用」（callouts 26 篇没用到）就删这条声明或删这个 alias——那会让 callouts 首次使用时才炸。

**查出来但按现状保留的一条**：`PostCard.astro:39` 的 `password` 声明未读（`ts(6133)` hint）——
**它证明 AGENTS 五-5 原先那句「列表卡显示锁图标」是假的**（产物里没有任何锁图标，全站也没有 `lock` 图标引用）。
没有顺手删掉这个 prop，因为**作者原意是 UI 缺失（待补），不是死代码**；删掉就等于把这条缺陷藏回去。
已把五-5 改成实情，并把它列进下面的待办。**要补的话**：在 `PostCard` 里按 `password` 渲染一枚
`material-symbols:lock`（图标集合已装，见五-29），零篇加密文章所以现在无可见影响。

**「导航后重 init」34 处收编成 helper**（实现与全部结论见第十节 14，这里是它顺带查出的两条真漏）：
- ⚠️ **`CategoryBar.initScrollFeatures()` 每次导航给容器外那个常驻 `.category-scroll` 再叠一组
  `wheel`/`scroll`/`resize` 监听** → 横滚位移按访问页数叠加。改 `reinitOnce`。
- ⚠️ **`FloatingToc.setupAutoClose()` 每次导航多挂 7 个 `window`/`document` 监听 + 多包一层
  `history.pushState/replaceState`**（它被每趟导航都跑的 `initFloatingTOC()` 调用，且自己没有任何保护）。
  改 `reinitOnce` 后实测包装层数零增长。
- 代理给的计数是 **30 处 / 18 个文件**，我核到 **34 处 / 20 个文件**（幂等标志实为 5 个不是 3；
  漏计了 `SiderBarToc:88-93`、`FloatingToc` 的 4 处、`TypeMechine:146`、`CategoryBar:383`、`Twikoo:69-75` 回退分支）。
  **按惯例：代理报的数只当线索，逐条读过代码才算数。**

### 版本天花板（撞过墙了，别反复尝试）

2026-09-21 全量升级时实测，**2026-09-23 复查仍未松动**：以下两个**升不上去**，原因是上游集成包的 peer 声明还没跟上：

| 包 | 停在 | 最新 | 卡在哪 |
|---|---|---|---|
| `mermaid` | **11.17.2** | 12.0.0 | `astro-mermaid@2.1.0`（已是最新）peer 只允许 `^10.0.0 \|\| ^11.0.0` |
| `typescript` | **6.0.3** | 7.0.2 | `@astrojs/svelte@9.0.1`（已是最新）peer 只允许 `^5.3.3 \|\| ^6.0.0` |

→ 要升 mermaid 12 / TS 7，得先等 `astro-mermaid` 和 `@astrojs/svelte` 更新 peer 声明。
  硬升的后果：`npm ci` 直接 ERESOLVE 失败（TS 7 那次已实测，删掉 node_modules 后装不回来）。

### 依赖相关的坑

- **增量安装不可信，只有干净 `npm ci` 才算验证过。**
  `npm install` 遇到 peer 冲突会打一条 `npm warn ERESOLVE overriding peer dependency` 然后**静默放行**，
  构建照样通过；但换台机器或删掉 `node_modules` 重装就 ERESOLVE 失败。
  → **改完依赖必须走一遍干净安装 + 构建**，别只看增量安装成功。正确序列（**只装一次**）：

  ```bash
  npm update --package-lock-only   # 只改 lockfile，不碰 node_modules
  npm ci                           # 一次完成「清空 + 安装」，这本身就是干净验证
  npm run build
  ```

  ⚠️ **三个已实际犯过的低效 / 危险写法，别再来**：
  ① 先 `npm update` 再 `rm -rf node_modules && npm ci` —— 把 614 个包写进磁盘又立刻删掉重装，
     白等约 3 分钟（2026-09-23 实测）。
  ② 在 `npm ci` 前手动 `rm -rf node_modules` —— `npm ci` 自己会清掉已有 `node_modules`，多此一举。
  ③ **开着 dev server 就 `npm ci`**（2026-09-29 实际把项目搞坏过一次）—— `npm ci` 会先删 `node_modules`，
     而 Windows 下 `lightningcss-win32-x64-msvc\*.node` 这类**原生二进制被 dev/vite 进程锁住**，
     删到一半报 `EPERM: operation not permitted, unlink`，**结果是 `node_modules` 被删空、项目当场不可用**。
     → 更阴的是：`TaskStop` 停掉后台任务只杀外层 shell，`npm run dev → astro dev` 的**子进程会变成孤儿继续存活**
       （本次同时留着 2 个 astro dev + 2 个 npm 包装进程）。
       ⚠️ **`npm run preview` 同理**（2026-09-30 实测：TaskStop 报"stopped"之后
       `astro preview` 的 node 子进程仍在，靠命令行匹配才找出来）——所以任何要动 `node_modules` 之前，
       一律先按命令行精确查一边 `astro` 相关进程，别信 TaskStop 的 summary。
     → 顺序：`Get-CimInstance Win32_Process` 按 `CommandLine -like '*chenBlog*'` 精确定位 PID 后逐个 `Stop-Process`
       （**别批量杀 node.exe**，Qoder 自身和一堆 MCP server 都是 node 进程）；确认残留为 0 再 `npm ci`。
       ⚠️ **但 `-like '*chenBlog*'` 这一条本身也不够精确**（2026-10-01 实测自伤）：包装 shell 的命令行里
       带着我发出去的那条命令**全文**，于是 `chenBlog` + `preview`/`astro` 这种宽条件会把
       自己的 bash 包装进程和 PowerShell 本体一起吃掉（命令自己把自己杀了，退出码变 4294967295）。
       → 匹配条件要钉在**可执行文件路径 + 尾参数**上，例如
         `$_.Name -eq 'node.exe'` 且 `$_.CommandLine -like '*astro\bin\astro.mjs*preview*'`，
         杀完再用同一条件复查计数为 0；不要拿"项目名 + 关键词"当过滤器。
       万一已经失败了，先 `npm install`（增量、不删目录）把项目救回来，再重试干净安装。
  → 另：`npm ci` / `npm install` 后面接 `| tail -20` 会把**退出码换成 tail 的**，
     失败也会显示成"成功"。依赖类命令要拿真实退出码就 `> 文件 2>&1; echo $?`，别信管道后的 `$?`。
- **`expressive-code-language-badge` 有个假的 starlight peer**：1.1.0 与 2.0.0 都把
  `@astrojs/starlight` 声明为**非 optional** peer，但该包 dist 只 `import "@expressive-code/core"`、
  产物内零 starlight 引用（16K，README 也没提过）——纯属上游 `package.json` 写坏。
  后果：npm 会自动装约 19 个 Starlight 包（`@astrojs/starlight` 0.42.2 等），纯 devDep 膨胀，不进网站产物。
  → **不要用 `legacy-peer-deps` 来"解决"它**。那会全项目关闭 peer 校验，把真冲突一起掩盖掉
    （TS 7 的不兼容正是这样被掩盖、直到干净安装才暴露）。宁可多 19 个包。
  → 彻底解法是写个 20 行本地插件替掉它，但会有视觉回归风险，未做。
- **prettier 全站格式不符**：`.prettierrc.json` 只有 `tabWidth: 4`、**没有 `useTabs: true`**，
  而源码全用制表符，所以 `prettier --check` 几乎每个文件都报 warn。
  这是既存状态（`tsconfig.json`、`src/utils/*.ts`、`src/styles/*.css` 都在列，与 astro 插件无关），
  **不要顺手跑 `prettier --write`**——会把全站制表符改成空格，产生海量无意义 diff。
  另：`src/styles/markdown-extend.styl` 是 Stylus，prettier 不支持、会报 parse error，属正常。

### 已偿还 / 已确认无回归

- ✅ **expressive-code 家族 peer 冲突已解决**：升到 0.44.2 后 `astro ^7` 被正式支持，硬冲突消失
  （`expressive-code-language-badge`→2.0.0、`expressive-code-collapsible`→1.0.0 两个 major 也一并升完）
- ✅ **21 个 undici 漏洞（2 critical / 13 high）→ 0**
- ✅ **代码块功能无回归**：拿线上旧构建（0.43.1）与新构建（0.44.2）做同一篇文章 A/B 对照，
  `ec-collapse*` 折叠类、`ec-line` 数量、复制按钮文案全部一致；108 行差异只有资源哈希、
  Astro 7.3 更紧的压缩空白、一个 HTML 注释
- `npm ci` 有一条 `npm warn deprecated glob@10.5.0`（传递依赖），不阻塞构建。

### 运维

- 宝塔面板密码曾在对话中明文出现，用户当前选择暂不修改；面板 IP 白名单未开。
- **回滚资产的命名**：每次部署留 `dist.old` + `dist_backup_<时间戳>`（第六节流程产出的）。
  保留与删除的规则见**第七节收尾铁律**；当前有几个、共占多少是**会变的状态**，只记在
  [`HANDOFF.md`](./HANDOFF.md) 第三节，别在这里复制一份过期数。
- 前端计划：**页面间动画已于 2026-09-23 用 Swup 实现**（见第十节）；剩余计划见 `README.md` 的「后续计划」。

## 十、Swup 页面过渡的坑（2026-09-23 引入，全部实测踩到）

入口：`src/components/features/SwupManager.astro`（初始化 + 事件桥 + resize 动画）；
开关：`src/config/effectsConfig.ts`；动画 CSS：`src/styles/transitions.css`；
容器：`Layout.astro` 的 `#swup-container`（带 `transition-main`）；过渡载体类 `transition-main`
**只挂在 `#swup-container` 上**（2026-09-24 照搬参考站 blog.cuteleaf.cn 的容器结构，见条目 5），
内层 `#content-wrapper.transition-leaving` 做反向视差。
设计文档：`docs/superpowers/specs/2026-09-23-page-transitions-design.md`（含影响域分析）。

1. **`animationSelector` 必须收紧，不能用默认值。** 默认 `[class*="transition-"]` 会命中全站
   Tailwind 的 `transition-*` 类；`display:none` 子树里**冻住永不结束**的过渡（折叠代码块
   `ec-collapse__toggle`）会被算进等待集合 → visit 死锁在 `is-changing is-animating is-rendering`，
   之后**所有导航静默失效**（不报错、路径不变）。已设为 `[class*="transition-swup-"]`
   （= 参考站同款：只命中 `#banner-overlay-container` 这类带 `transition-swup-fade` 的专用载体，
   不会误中 Tailwind 的 `transition-*`）。
2. **Swup 不替换 head，也默认不执行容器内的新 script。** 页面级 `is:inline` 脚本（评论/分享/推荐位）
   靠 `SwupManager.astro` 里自己写的 `content:replace` 钩子重执行（**2026-09-30 起不再用
   `@swup/scripts-plugin`，原因见本节 11**）；但 **`slot="head"` 的脚本导航过去永不执行**——
   `gallery-filter` 自定义元素曾因此从首页导航进相册时彻底失效。这类脚本必须放在容器内（body）。
   同理 **Astro 组件的 scoped `<style>` 只存在于"渲染了该组件的页面"的 head 里**：在不渲染卡片的
   `/archive/` 整页加载后 Swup 回首页，PostCard 样式缺失 → 卡片退回 column 布局、内容与右箭头重叠
   （2026-09-24 实测 64px）。→ 组件的**布局类 CSS 放全局样式表**（`global.css`），每实例变量内联到元素上。
   → ⚠️ **这条对「状态机样式」同样成立，而且症状会伪装成"资源没加载"**（2026-09-30 实测第二个实例：
   `CoverImage.astro`）。它的 scoped `<style>` 里有
   `[data-loading="false"] .loading-spinner{opacity:0}` 和 `.spinner{width:40px…}`，从 `/archive/`
   软导航进首页时两条**同时缺失** → 图片其实已经下载完并解码（`naturalWidth 374`、JS 已把
   `data-loading` 翻成 `false`），但白色遮罩**永远盖在上面**，且转圈环塌成 `0px`。
   用户看到的就是"图片没加载、也没转圈"，而**刷新一下又好了**（整页加载时 head 里有那份样式）。
   → 排查这类症状的顺序：**先读 `img.naturalWidth` 与遮罩的 `getComputedStyle().opacity`**，
     两者一个 >0 一个 =1 就一定是样式缺失，别去查网络、别去怀疑文件没上传
     （本次我就是这样白查了一遍 20 个封面资源，全部 200）。
   → 修法同 PostCard：整套规则搬进 `src/styles/singles/mainSingles.css`，选择器统一带
     `.cover-image-container` 前缀（`.spinner` 这种裸名进全局会污染别人），
     `@keyframes` 改名 `cover-spin`，不复用 `markdown-extend.styl` 里 Mermaid 那个 `spin`。
3. **别给 `<script>` 用 `define:vars` 传配置。** 那会把脚本**内联进每一页 HTML**，
   swup bundle 曾因此重复嵌入 37 个页面（index.html 涨到 136K 的假象来源之一）。配置在脚本里 `import`。
4. **事件名三套并存，改前先 grep。** Swup 4 原生 `swup:content:replace` 等；Swup 3 旧名
   `swup:contentReplaced`（12 个组件在听，Swup 4 **不再派发**）；Astro VT 的
   `astro:page-load` / `astro:after-swap`（若干组件在听，Swup 路线下本不触发）。
   SwupManager 统一桥接派发这三套，消费组件一行未改。
5. **过渡观感 = 1:1 照搬 blog.cuteleaf.cn（Firefly 系）的编译产物**（2026-09-24 扒其 `/_astro/*.css` 与
   `page.*.js` / `Layout.astro_*.js` 实测）。数值（120ms、±2rem、同款 cubic-bezier）三家本来就逐字节相同，
   **真正决定"跳不跳"的是挂载位置**：参考站把 `.transition-main` 挂在 `#swup-container` 上、横幅图
   `#wallpaper-wrapper` 不带任何过渡类；我们 09-23/09-24 两版把它挂在封面块和 `#page-shell` 上，
   于是每次切页整块 65~90vh 横幅被 `translateY(±2rem)` 推着滑——就是用户三次否掉的"跳一下"。
   现编排照搬：`link:click` 打 `is-page-transitioning`；`visit:start` 起 WAAPI 进度条
   （`#progress-bar`，scaleX 0→0.95 / 8s）并**即时回顶（仅 ≥768px）**；`visit:end` 收进度条、
   200ms 后摘 `is-page-transitioning`。
   ⚠️ **回顶放 `visit:start` 现在是对的**（推翻 09-24 的旧结论）：前提是**会随滚动移动的 chrome**
   （横幅图 `#wallpaper-wrapper`、侧栏、分类栏）都在 Swup 容器外、不随页替换也不参与过渡，
   回顶与点击同任务、下一帧绘制前完成，浏览器永远画不出"旧页滚到一半"。
   若将来把任何会随滚动移动的 chrome 挂回过渡类，这条立刻失效。
   ⚠️ **2026-10-01 更正一处措辞**：横幅的**文案层** `#banner-overlay-container` **是** Swup container
   （它不随滚动移动，所以不影响上面这条前提）——详见本节 15，此前本条把它一并说成"在容器外"是错的，
   正是这个错认知让横幅文案一直不随切页更新。
   ⚠️ 无论改什么，**不要用 body/祖先元素的淡入淡出**——实测会让 Swup 卡死在 `is-rendering`、页面停在 opacity 0。
6. **窗口缩放动画 = 冻结 + View Transitions morph**（`effectsConfig.windowResize`）。
   断点跨越改的是 grid 轨道数量与 sidebar 的 display，CSS transition 插值不了；
   做法是拖拽期间给 `#page-shell` 冻结像素宽度，松手 180ms 后 `document.startViewTransition` 一次性
   应用新布局（root 交叉淡化，缓动抄 Firefly 主题切换）。Firefly 本体**没做**这块，别去它那儿找。
   不支持 VT 的浏览器退回瞬时重排。零尺寸视口下取宽为 0，已加防护不冻结。
   ⚠️ **必须只在 `innerWidth` 真的变了时才触发**（2026-09-24 线上事故）：手机地址栏收起/展开
   **只改高度**也会触发 `resize`，若照旧 freeze+startViewTransition，滚动中会反复整页快照交叉淡化
   → 滑动重影、且旧快照（`::view-transition-old(root)` 在上层）与已滚动的新页面叠印，
   看起来像"卡片数据和右箭头重叠"。首进页顶无滚动故正常、Swup 返回恢复滚动后才出现。
   已修：宽度不变直接 `return`。别把这个 morph 当成"任何 resize 都跑"。
7. 同 URL 点击（如已选中的分类 pill）被 SwupManager 的 capture 监听拦截，改**平滑滚顶**、不走 visit。
8. `prefers-reduced-motion: reduce` → 不初始化 Swup，退回整页加载、零动画（覆盖 effectsConfig）。
9. **首页↔非首页的横幅高矮过渡**（2026-09-24，照搬参考站 `is-wallpaper-transitioning` 机制）：
   `--banner-height-home` / `--banner-height-non-home: max(45vh, 380px)` 两套变量，
   各断点媒体查询**只给 home 那套赋值**（`layout-style.css`），`#wallpaper-wrapper` 的 height 消费变量；
   `body.is-home` 由 SSR 判定（`/` 与 `/2/` 这类分页算首页），切页时 `visit:start` 按目标 URL 翻转它并挂
   `html.is-wallpaper-transitioning`（给 `#wallpaper-wrapper` 开 `height .45s` 过渡），`visit:end` 后 **500ms** 才摘
   （过渡 450ms，早摘会把 transition 属性撤掉、高度瞬间跳变）。
   ⚠️ 非首页横幅比首页矮是**设计如此**（参考站同款），别当 bug 把两套变量改回同值。

10. **`client:load` 的 Astro 岛放在 Swup 容器内是可用的**（2026-09-29 实测，此前无先例、属未知）。
    此前全站唯一的 `client:*` 是 Header 里的 `Search.svelte`，而 Header 在 `#swup-container` **外面**、
    永不被替换，所以"岛能不能活过软导航"一直没被验证过。用一次性探针页测了三步：
    ① 整页加载后岛可交互；② 从首页点链接软导航进来**同样可交互**；
    ③ 关键一步——把 `#swup-container` 的 innerHTML 整体换成同一份 HTML（绕开动画时序），
    岛**仍然重新水合并可交互**。原因是 Astro 给每个岛实例输出的是**内联 module script**，
    重新插入即重新求值，不依赖"这个 bundle 之前有没有加载过"。
    → 所以 `/dynamic/` 的 `DynamicFeed.svelte` 直接 `client:load` 挂在容器里，不需要额外桥接事件。
    → ⚠️ 做这类实验时**别用连续两次 Swup 导航来判断**：隐藏标签页里 transition 不推进，
      Swup 会卡在 `is-changing is-animating is-rendering`、后续导航静默失效（就是本节第 1 条那个症状），
      看起来像"岛坏了"。用③那种手动换 innerHTML 的办法可以完全绕开动画时序。
    → 另：探针页一开始 404，是因为 **Astro 会排除以 `_` 开头的文件**（那是它放局部/私有文件的约定），
      `__island-probe.astro` 不生成路由。临时文件别用下划线开头。

11. ⚠️ **`@swup/scripts-plugin` 的作用域是整个 `document`，不是 Swup 容器——已因此弃用**（2026-09-30 查掉）。
    它的默认项是 `{head:true, body:true}`，而 `getScope()` 在两者都为 true 时**直接返回 `document`**；
    它在 `content:replace` 时把命中的每个 `<script>` 用「新建同名元素 + `replaceWith`」重新插入。
    而 **Astro 7 把组件脚本内联成 `<script type="module">`**（首页 24 个 script 里只有 4 个是外部 chunk），
    内联 module **每次重新插入都会重新求值**（外部 module 有 module map 兜着，不会）→
    于是**每次导航都给容器外那些永不被替换的元素再叠一层 `addEventListener`**。
    实测后果（线上）：切 1 次页后汉堡按钮「一次点击 = 两次 toggle」净零 → 看起来点了没反应；
    主题切换按钮同理失效；每次导航还抛
    `SyntaxError: Identifier 'setTheme' / 'setToggleListener' has already been declared`
    （那两个是**顶层 const 的经典内联脚本**，重新执行就是重复声明）。
    → 数监听器的办法：给面板元素挂 `MutationObserver`，数**一次 `.click()` 引发几次 class 变更**
      （1 次监听 = 2 次变更：我自己那次 remove + handler 的 add）。**别用"能不能打开"当唯一判据**，
      监听器叠到奇数次时它会诡异地「又好了」——那正是用户说"有时候"的来源。
    → 现在的做法：`SwupManager.astro` 里 10 行 `swup.hooks.on("content:replace", …)`，
      只扫 `#swup-container script:not([data-swup-ignore-script])`。首页实测容器内脚本**只有 1 个**
      （CoverImage），其余 23 个都在容器外，所以这一改同时修掉了汉堡、主题、桌面下拉、
      侧栏分类展开、Header 滚动监听（原来每次导航多一个 scroll handler）等一串病。
    → **容器外的组件不得依赖"脚本被重跑"来刷新状态**，要靠 SwupManager 桥接的
      `astro:page-load` / `swup:contentReplaced` 事件；`ThemeIcon.astro` 原来那句
      `document.addEventListener("astro:after-swap", setToggleListener)` 就是独立的第二处双绑，已删。
    → 通用结论：**"切页后某个开关点了没反应"先怀疑重复绑定，而不是怀疑监听器丢了。**
      判据是「一次点击引发的状态变更次数」，不是「有没有反应」。

12. ⚠️ **换成自写的容器作用域重跑之后，「容器内脚本注册全局监听」依然是雷——必须带 `window.__xxxInit` 幂等标志**
    （2026-10-01 查出：`Twikoo.astro` 与 `RecommendedPost.astro` 各一处，同一机制）。
    第 11 条只保证「容器外的元素不再被重复绑」，但**容器内的脚本每次进该页仍会重新求值**，
    若它注册的是 `document.addEventListener(...)` 或 `window.swup.hooks.on(...)`，
    每次求值出来的函数是新对象、引用不同 → `addEventListener` 不去重 → 监听器按「访问过该页的次数」累加。
    → 同族对照：`SeriesNav.astro:123`、`series/index.astro:116` 写了幂等标志（正确），
      `Search.svelte:124` 在 `onMount` 返回里 `removeEventListener`（正确），漏网的只有那两处。
    → **留第一份闭包是安全的**，前提是被注册的函数每次调用都重新 `getElementById`（这两处都满足），
      旧闭包不会指向已被换掉的节点。反过来，捕获了元素引用的闭包不能这么留。
    → 实测办法：`document.dispatchEvent(new Event('swup:contentReplaced'))` 后数目标函数被调了几次
      （包一层 `document.getElementById` 当计数器，**别猜类名**）。线上单次事件触发 2 次重渲染，加标志后恒为 1。
    → ⚠️ 严重性别说过头：实测线上是 2 次，**没有验证过它随访问页数无限增长**，报结论只报测到的数。
    → **2026-10-01 更新：这条机制已被 `public/assets/js/reinit.js` 从结构上消掉**（第十节 14）——
      注册表与它自己的监听都在 head 里、head 不被 Swup 替换，所以累加不再可能。
      新代码请写 `window.onReinit(key, fn)` / `window.reinitOnce(key, fn)`，**不要再手写 `window.__xxxInit`**；
      原先的 5 处手写标志（`__seriesNavInit` / `__seriesAccordionInit` / `__recommendedPostInit`
      / `__twikooSwupInit` / `floatingTOCListenersInitialized`）前四处已收编，
      最后那个只保护 `popstate`/`layoutChange`/`resize` 三个非导航监听，保留。

13. **`twikoo.init()` 会吃掉它的挂载点**（2026-10-01 实测）：`#tcomment` 渲染完成后在 DOM 里变成 twikoo
    自己的根节点 `#twikoo`，**第二次 `document.getElementById("tcomment")` 必然拿到 null**。
    → 后果一：评论区的「重新初始化」逻辑里 `if (el) init()` 这种守卫从第二遍起静默空转，
      看起来「评论没重新加载」其实正常。查「评论没了」要先看 `#twikoo` 在不在，别只看 `#tcomment`。
    → 后果二：`BaseLayout` 那条派发 `firefly:page:loaded` 的通知链整条空转（它只在整页加载时派发，
      而那条路上 `DOMContentLoaded` 已经完成初始化了），已连监听方与派发方一起删除。

14. ⚠️ **「导航后重 init」一律走 `window.onReinit(key, fn, opts)` / `window.reinitOnce(key, fn)`**
    （2026-10-01 立的规矩，实现在 `public/assets/js/reinit.js`，由 `BaseLayout` 的 **head** 同步加载）。
    第十节 11/12 那套「手写 `window.__xxxInit` 标志 + 自己挑事件名 + 自己 setTimeout」的散装脚手架已全量收编，
    **别再往组件里写回那三样**。
    - **为什么必须是它**（这三条是三个不同的病，helper 一次治完）：
      ① **一趟导航被派发两个事件名**：`SwupManager.astro:111` 在 `content:replace` 派发 `swup:contentReplaced`，
        `:112-115` 在 `page:view` 又派发 `astro:page-load` + `astro:after-swap`。
        **同时听这两个名字的组件每换一页就跑两遍**（原先 `SiderBarToc`/`FloatingToc`/`CategoryBar`/`CoverImage`
        /`BackToHome` 全中，`TypeMechine` 最狠：3 个事件名 × (立即 + 220ms) = **一趟 6 遍**）。
        helper 只听第一个名字、用 token 把两个派发压成一趟一次。
      ② **监听器累加**（十-12 那条）：注册表与它那两个 `document.addEventListener` 都在 head 里，
        head 不被 Swup 替换 → **结构上就不可能累加**，不需要每个组件自己写幂等标志。
      ③ **`document`/`window` 级的一次性动作被反复做**：`reinitOnce` 专治这类（见下面两条实例）。
    - **语义**：`onReinit` = 注册时立即跑一次（**不等 delay**，等价于原先的「直接调用」）+ 每次导航后再跑一次
      （`delay` **只用在导航那一次**，保留各处 100/200/220ms 的既有时序）。
      `opts.immediate:false` 用于「首屏由别的路径负责」的场合（`Twikoo` 就是：首屏仍走 `DOMContentLoaded`
      以保持 10-01 验收过的时序，只有换页才由 helper 跑）。
    - ⚠️ **`fn` 每次调用都必须重新查 DOM**，不许抓住旧节点闭包——容器整片被换掉，抓住引用会指到已移除的节点
      （十-12 末尾那条同族结论）。注册同一个 key **只换闭包**，不叠加、不补跑。
    - ⚠️ **两个例外要辨出来，用 `reinitOnce` 而不是 `onReinit`**（这是本次查出的两条真漏）：
      · `FloatingToc.astro` 的 `setupAutoClose()` 里面是往 `window`/`document` 挂 **7 个监听**
        并**包装 `history.pushState/replaceState`**；它被每次导航都跑的 `initFloatingTOC()` 调用 →
        换页越多层数越深（一次点击触发 N 次）。已改成 `reinitOnce`，实测连发 3 次切换页
        `pushState` 包装层数恒 0 增长。
      · `CategoryBar.astro` 的 `initScrollFeatures()` 给**容器外那个永不被替换的** `.category-scroll`
        绑 `wheel`/`scroll` + `window` `resize`，原先跟高亮刷新一起挂在 `astro:page-load` 上 →
        **鼠标横滚的位移按访问页数叠加**。已改 `reinitOnce`。
      → 判据：**被绑的目标元素会不会随容器一起被换掉？** 会 → `onReinit`（新节点需要重新绑）；
        不会（`document`/`window`/容器外元素）→ `reinitOnce`。
      ⚠️ `reinitOnce` 的 `fn` **显式 `return false` 表示「这次没做成，下次再试」**（元素还没解析出来时用），
      否则会被锁死。`initScrollFeatures` / 悬浮目录内部点击标记两处都靠它。
    - ⚠️ **同一组件挂两处时（`SiteStatus` 的 xl 右栏 + 移动底部堆），解析期的重复注册必须允许再跑一次**：
      第一份脚本求值时第二份的 DOM 还没解析出来，只跑一次会让移动端子首屏停在占位值上
      （实测 `running-days` 两个节点 `274|0`，修成 `274|274`）。
      helper 用 `<html>` 上的 `is-changing`（= Swup 一次 visit 期间）区分「软导航途中的重求值」和「解析期的双挂载」：
      **`is-changing` 中不补跑**（交给紧随其后的 `runAll`），**不在其中就补跑**。
      → 自己写测试复刻导航时，**`is-changing` 要一直留到重新插入脚本之后**再摘；
        我第一版探针提前摘了，于是「首次进文章页跑 2~3 遍」被误报成回归。
    - **验证办法**（`npm run build` + `npm run preview`，dev 下容器脚本不重执行所以测不出来）：
      ① `window.reinitRuns(key)` 是 helper 自带的计数器，逐次导航读差值，**要求恒为 1**；
      ② 泄漏看 `addEventListener` 计数——先包一层 `EventTarget.prototype.addEventListener`
        只统计 `this===document||this===window` 的调用，跑几趟导航后差值应为 0（元素上的随便涨，那些节点会被丢弃）。
      ③ **一定要拿线上旧构建当控制组**：本次「首页 10 张封面里 2 张遮罩没褪」看着像回归，
        但线上旧构建同一探针同一页给出**完全一样的数字** → 既存行为，别去"修"。
      实测现状：5 趟导航（含两次进文章页）所有 key 差值全为 1；每次进文章页新增的 4 个 document/window 监听
      **全部来自 `twikoo.nocss.js` 自己的 `init()`**（栈顶是 `twikoo.nocss.js:2:` 的模块 id），
      与改动前同量，不是本项目代码。
    - 未被收编的（**核实过，不属这类，别再去"统一"**）：`Search.svelte` 在 `onMount` 返回里
      `removeEventListener`（正确写法）；`gallery/index.astro` 的 `customElements.get` 守卫；
      Header 系（`MobileMenu`/`DropdownMenu`）只监听容器外元素且脚本每文档只跑一次；
      `FancyboxManager` 听 Swup 4 原生名并在 `visit:start` 里 `close+unbind` 配对；
      `BaseLayout` 的 `astro:after-swap` → `setTheme`（head 内，一文档一次）；
      `Calender` 与 `RecommendedPost` 各一份 `__allPostMetaCache` fetch（五-30 已明确不抽）。
    - ✅ **改 `reinit.js` 之前先处理缓存 —— 2026-10-08 已按"倾向那个"落地**：它在 `public/assets/js/` 下、
      文件名稳定，而 Nginx 给它的是宝塔自带 js/css 规则的 **`max-age=43200`（12h）**（实测响应头），
      不是第六节那套（extension 只覆盖 `/_astro/*`、`/pagefind/*`、gallery 图片与兜底 HTML）。
      「稳定名 + 内容会变 + 长缓存」= 改了 helper 之后回访用户带着旧 helper 跑新 HTML。
      → 现做法：`BaseLayout` 里引用 `reinit.js?v=<内容哈希>`（构建期 `sha256(...).base64url` 取 10 位），
        **没碰服务器配置**，所以不需要额外授权；改一次文件换一次 URL，12h 长缓存从此无害。
      ⚠️ **哈希要按 `process.cwd()` 拼路径读，别用 `import.meta.url`**：预渲染阶段这段代码住在
        `dist/.prerender/chunks/*.mjs` 里，相对它找 `../../public/` 会指到 `dist/public/` →
        `ENOENT` 直接把构建打挂（本次实测第一条就死在这）。
      → 通则：**往 `public/` 下新增会被 HTML 直接引用的稳定名文件，都要顺手核一遍它拿到什么 `Cache-Control`；
        没做哈希引用的那些（`assets/js/twikoo.nocss.js` 等）仍带着 12h 陈旧风险。**

    - ⚠️ **`navigating()` 的假设只对「已存在的 key」成立，对「全新的 key」不成立**
      （2026-10-08 用户报的「文章详情页 F5 → 点主页 → 列表封面永远转圈」就是这个洞）：
      · 原注释写的是"容器内脚本重新求值时紧接着 runAll 一定会跑"，但 **Astro 组件脚本编译成
        `<script type="module">`，插进容器后要到下一个宏任务才求值**，而 `swup:contentReplaced`
        （→ `runAll`）是在 `content:replace` 当趟同步派发完的 → 新 key 赶不上那一趟；
        偏偏 `ranFor` 又被初始化成当前 token，于是紧随的 `astro:page-load` → `catchUp()`
        判定"这一趟已经跑过了"，**两次机会全部错过，`fn` 一次都没执行**。
      · 线上取证（47.108.230.220，包一层 `window.onReinit` 记录注册时机）：
        `register cover-image | is-changing=true | runsBefore=-1` → 之后没有 RUN，
        `reinitRuns('cover-image') === 0`、10 张封面 `data-initialized` 数为 **0**、
        `data-loading="true"` 数为 **10**（其中 8 张 `complete && naturalWidth>0` 早就解码了）
        → 按五-35 的判据这是真 bug，不是懒加载正常态。补一次 `runAll` 后立刻 10/10 绑上。
      · **触发条件 = 「该 key 在本文档里第一次出现」+「注册发生在软导航途中」**，
        所以只有"从别的页型第一次进某页"才犯：全站首页↔文章页两种入口顺序，只有
        **文章页起步 → 首页** 这条会永远坏；`recommended-post` / `twikoo` 同理（它们的脚本是
        同步执行的经典 `<script>`，赶得上 runAll，所以历史上没暴露）。
      · 修法（`public/assets/js/reinit.js`）：`ranFor` 初始化成 **-1**，且导航途中注册的新 key
        **让出一个宏任务后自查**（`setTimeout(0)` 里发现 `ranFor` 仍是 -1 才自己跑一次）。
        ⚠️ 第一版直接改成"注册即跑"是**错的**：同步脚本那一路会变成
        注册跑一次 + runAll 再跑一次 = **一趟 +2**（实测 `recommended-post` 就 +2 了）。
      · 回归判据（preview / 线上各跑一遍，都要求 **每趟导航每个 key 恰好 +1**）：
        首页起步 → 文章页 → 首页 两趟之后 `cover-image 3 / twikoo 2 / recommended-post 3 /
        site-status 4（其中解析期双挂载占 2）/ 其余 3`；文章页起步 → 首页那一趟
        `cover-image` 从 -1 变 **1**、`data-initialized` 10/10、五-35 判据 0 命中。
      · ⚠️ **隐藏标签页里 `setTimeout` 被节流到 ≥1s**（本次两条验证脚本因此 15s 超时），
        要做逐帧/多次导航的探针，先注入
        `*{animation-duration:0s!important;transition-duration:0s!important}`
        让 Swup 的动画等待立刻落地，否则 visit 卡在 `is-changing` 里出不来（十-1/十-10 的老面孔）。

15. ⚠️ **凡是"内容随页面变、但位置在 Swup 容器外"的 chrome，必须自己登记成 Swup 的 container**
    （2026-10-01 用户报的横幅标题 bug，根因与修法）。
    - **症状**：首页横幅写着 `Lovely Life` + 打字机副标题，点进文章页**横幅文案不变**（该显示
      文章标题 +「发布于 …/字数/阅读时长」的地方还是主页那套）；反向从文章页切回主页，
      横幅又一直挂着文章标题。**只有 F5 才正常**（SSR 按当页渲染）。
    - **根因（两条同时成立才会犯）**：① `SwupManager.astro` 的 `containers` 只有 `["#swup-container"]`；
      ② `Cover.astro` 里 `.banner-post-meta-overlay` 是 `#banner-overlay-container` 的**兄弟节点**（在它外面）。
      于是横幅文案层既不被替换、文章页那块也压根不在任何容器里 → 整页只渲染一次。
      ⚠️ 迷惑点：`#banner-overlay-container` 本来就带 `transition-swup-fade`（animationSelector 的等待目标，
      `transitions.css:44-52` 的规则也是照它写的），**看起来像"已经在参与过渡了"**，
      实际它只是淡出淡入**同一份内容**——所以用户看到的是"有动画但字没换"。
    - **修法 = 照参考站结构改两处**（`firefly.cuteleaf.cn` 实测 `window.swup.options.containers` =
      `["#banner-overlay-container","#banner-dim-container","#swup-container","#left-sidebar-dynamic",
      "#right-sidebar-dynamic","#floating-toc-wrapper"]`，且它的 post-meta 层**嵌在** overlay 容器里）：
      ① `Cover.astro`：把 `{isPostPage && bannerPostMeta && (…)}` 整块**移进** `#banner-overlay-container`；
      ② `SwupManager.astro`：`containers: ["#banner-overlay-container", "#swup-container"]`。
    - **连带必须处理的一件事**（否则修好标题、漏一个定时器）：横幅层被换掉后，
      `TypeMechine` 的 `.typewriter` 元素是**新节点**，旧实例挂在旧节点的 `__typewriterInstance` 上、
      再也 destroy 不到 → 多条文案时那个 `setTimeout` 递归链会**永久打在已脱离文档的节点上**，每导航一次多一条。
      已改成**模块级 `liveInstances` 数组**，每次 `initTypewriterElements()` 先全部 `destroy()` 再重建。
      → 通则：**只要把一个元素登记成 Swup container，就要检查所有"把实例句柄挂在元素属性上"的代码**，
        它们会静默失去清理机会。
    - **刻意没跟着参考站做的**：它的 `#banner-dim-container` / `#left-sidebar-dynamic` /
      `#right-sidebar-dynamic` / `#floating-toc-wrapper` 我们**不加**——dim 层各页内容完全相同（换了是白费），
      侧栏与悬浮目录是本站**刻意**留在容器外的（五-24：侧栏靠构建期静态渲染 + 十-14 的重 init，不靠替换）。
      这是有依据的偏离，别当漏改补上。
    - **验证办法**（两向都要测，只测一向会漏）：真实点击导航后读
      `.banner-home-text-overlay.classList.contains("hidden")` 与 `!!document.querySelector(".banner-post-meta-overlay")`，
      要求「进文章页 = `hidden` 为 true 且 post-meta 存在」「回主页 = post-meta 不存在且 `hidden` 为 false」。
      另用 1440 / 375 定宽 iframe 复核显示态：post-meta 是 `hidden lg:flex`，**375 下 display:none 属正常**
      （参考站同款），别当"移动端坏了"去改。
      还要核 `#banner-overlay-container` 在**全部 42 页**都存在（Swup 要求两个页面都有这个容器，
      缺了会报错），以及 26 篇文章页都带 post-meta。
      ⚠️ 打字机孤儿链的判据：**统计"每秒由打字机回调发起的 setTimeout 次数"是否随导航次数递增**
      （本次实测 1→3→2→3→3，有界不增；递增才是漏）。别用"动画还在跑"当判据，孤儿链打在脱离文档的节点上，肉眼看不见。
      ⚠️ 控制台若出现 `[swup] No CSS animation duration defined on elements matching [class*="transition-swup-"]`，
      先确认**是不是自己探针注入了 `transition:none!important`**（本次就是，撤掉即消失），别去改 CSS。
    - ⚠️ **同族第二处已知未修：侧栏卡片不随软导航更换**（2026-10-01 晚查出，**属既存缺陷不是本批引入**）。
      `RightSideBar.astro:33` 是 `isPostPage ? <SiderBarToc/> : <Calender/>`，而侧栏在容器外又没登记成 container
      → 线上实测：从首页软导航进文章页后 `#sidebar-toc` 不存在、侧栏里还是 35 格日历；硬刷新同一篇则正常。
      **只有 ≥1280px 看得见**（`#right-sidebar` 是 `hidden xl:block`）。参考站靠 `#left/right-sidebar-dynamic`
      两个 container 解决；我们**不能照抄了事**——侧栏卡片是双挂载（xl 右栏 + 移动底部堆，五-24/五-29），
      且五-24 当初"侧栏在容器外"正是选静态渲染而非岛的理由，改了就得起重写那条论证。
      **要不要改属设计决定，先问用户**；改则必须重跑十-14 那套探针 + 1440/375 两档核卡片内容与顺序。
