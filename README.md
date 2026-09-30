# 亦林 YILIn

陈俊亦的个人博客 —— **Astro（SSG）+ Svelte 5 + Tailwind CSS 4** 构建的纯静态站点，界面与提交信息均为中文。

在线访问：<http://47.108.230.220/> · RSS：<http://47.108.230.220/rss.xml>

## 关于这个项目

一个用来长期记录前端学习与生活的个人站，内容规模：**26 篇文章**（其中 25 篇属于 `CSS100Day` 系列）、
**5 个相册图集**、**1 条动态**。整站没有后端、没有数据库、没有运行时 API——
所有页面、搜索索引、动态数据端点都在 `npm run build` 时生成为静态文件，产物 `dist/` 可直接用任意静态服务器托管。

模板基于 [Firefly](https://github.com/CuteLeaf/Firefly) 裁剪而来，但按自己的需求重做了大部分内容层：
自研了 8 个 remark / rehype 插件（`src/plugins/`），并额外接入了 Pagefind 全文搜索、Swup 页面过渡、
列表页自动封面、动态（说说）与相册等功能模块。

## 技术栈

| 层 | 选型 | 版本 | 说明 |
| --- | --- | --- | --- |
| 站点框架 | [Astro](https://astro.build) | **7.3.4** | `output` 为静态 SSG（非 SSR），零服务端运行时 |
| 交互组件 | [Svelte](https://svelte.dev) | **5.57.1** | runes 语法；仅搜索框、动态流等少数岛 |
| ├ Astro 集成 | `@astrojs/svelte` | 9.0.1 | |
| 样式 | [Tailwind CSS](https://tailwindcss.com) | **4.3.3** | v4，经 `@tailwindcss/vite` 接入；**没有 `tailwind.config.js`**，主题与断点写在 CSS 里 |
| 语言 | TypeScript | **6.0.3** | ⚠️ 有版本天花板，见下文「已知约束」 |
| 内容 | MDX + Content Collections | `@astrojs/mdx` **8.0.2** | schema 在 `src/content.config.ts`，字段与集合校验在构建期完成 |
| Markdown 处理 | `@astrojs/markdown-remark` | **7.3.1** | ⚠️ 必须显式声明为直接依赖（`astro.config.mjs` 直接 import 它，而 astro 与 mdx 都只把它列为 peer） |
| 代码高亮 | [astro-expressive-code](https://expressive-code.com) | 0.44.2 | one-light / one-dark-pro；超 15 行的代码块自动折叠、预览前 8 行；带语言徽章与行号插件 |
| 图表 / 公式 | Mermaid **11.17.2** / KaTeX **0.18.7** | — | `astro-mermaid` + `remark-math` + `rehype-katex` |
| 页面过渡 | [Swup](https://swup.js.org) | **4.10.0** | 只替换 `#swup-container`；容器内脚本由自写的 `content:replace` 钩子重执行 |
| 站内搜索 | [Pagefind](https://pagefind.app) | **1.5.2** | 构建后生成静态索引到 `dist/pagefind/`，随产物一起部署，零后端 |
| 图库 | `@fancyapps/ui`（Fancybox） | 6.1.15 | 相册灯箱，点击时才动态 `import` |
| 图标 | `astro-icon` 1.2.0 + Iconify | — | 已装的集合：`material-symbols` / `fa-solid` / `fa6-solid` / `fa7-solid` / `mingcute` + `src/icons/` 本地图标 |
| RSS / sitemap | `@astrojs/rss` 4.0.19 / `@astrojs/sitemap` 3.7.4 | — | |
| 图片处理 | `sharp` 0.35.5 | — | 全站统一输出 webp（质量 80）；图标与封面由脚本从 SVG 生成 |
| Markdown 工具链 | `markdown-it` / `sanitize-html` / `remark-directive` / `rehype-callouts` / `remark-sectionize` / `reading-time` 等 | — | RSS 正文净化、`:::` 提示框、阅读时长等 |

## 功能

**内容组织** — 文章 / 归档 / 分类 / 标签 / 系列聚合；动态（说说）`/dynamic/`；相册 `/gallery/`（按图集分路由）；
单页 `/about/`、留言板 `/guestbook/`。

**检索** — Pagefind 全文搜索（桌面端是导航栏内联输入框，移动端是浮层面板），命中词高亮；
索引排除规则在根 `pagefind.yml`。

**交互与动效** — Swup 页面过渡（含切页进度条、首页↔非首页横幅高度过渡）、
窗口缩放时的布局 morph、悬浮目录、代码块折叠与复制、`prefers-reduced-motion` 全量降级。

**主题与可访问性** — 亮暗双主题（走 `<html data-theme>` 属性而非媒体查询）、
每页恰好一个非空 `<h1>`、区块标题从 `h2` 起、键盘可达与 `aria-*` 基线。

**工程化** — 文章脚手架 `npm run new:post`（强制 ASCII slug + 全量 frontmatter）、
图标与自动封面的脚本化生成、列表页自动封面（按 `seriesOrder` 轮播，frontmatter 手写 `image` 优先）、
邮箱 base64 混淆防爬、Markdown 里用 `<github>` 标签渲染仓库卡片。

## 常用命令

```bash
npm install
npm run dev       # 本地开发 http://localhost:4321
npm run build     # 构建 + 生成 Pagefind 搜索索引，产物在 dist/
npm run preview   # 预览构建产物（站内搜索只能在这里或线上验）
npm run icons     # 由 public/favicon.svg 重生成整套站点图标
npm run covers    # 由 src/assets/postImages/covers/*.svg 重生成列表页自动封面
npm run new:post -- --day 29 --title "标题"   # 文章脚手架（ASCII slug + 全量 frontmatter）
```

> ⚠️ **`npm run dev` 下站内搜索必然不可用**：Pagefind 索引是 `astro build` 之后才生成的，
> dev 服务不认 `dist/pagefind/`。这是设计，不是 bug。
> 仓库里**没有 lint / test 脚本**，验证手段就是 `dev` 看效果 + `build` 确认能构建通过。

## 目录结构（关键位置）

```
astro.config.mjs           # 所有插件与 markdown 处理链的唯一配置入口
src/content.config.ts      # 文章 frontmatter schema（改文章字段前必看）
src/config/                # siteConfig（站点总开关）/ navBarConfig（菜单）/
                           # galleryConfig（相册清单）/ effectsConfig（动效开关）/ backgroundWallpaper / commentConfig
src/content/posts/         # 文章（.md 为主，需要嵌组件的用 .mdx）
src/content/spec/          # 单页内容（about 等）
src/content/dynamic/       # 动态：一条一个 md，文件名 YYYY-MM-DD-HHMMSS.md 即条目 id
src/pages/                 # 路由：about / archive / categories / tags / series / dynamic / guestbook / gallery / posts/[...slug] / [...page]
src/pages/api/dynamic.json.ts  # 动态数据端点：build 时预渲染成 dist/api/dynamic.json
src/components/            # card（侧栏卡）/ comment / commons / controls / features /
                           # headers / layout / misc / oneSize / pages
src/components/card/       # 侧栏卡片：SiteStatus / Calender / DynamicSidebar / SiteInfo …（均构建期静态）
src/plugins/               # 8 个自研 remark / rehype 插件（改动前务必先读源码）
src/layouts/               # BaseLayout.astro + Layout.astro
src/styles/                # 样式；Tailwind v4 的主题与 dark 变体定义在 global.css
scripts/                   # generate-icons.mjs / generate-covers.mjs / new-post.mjs
pagefind.yml               # 搜索索引排除规则
```

## 写作约定

新文章用 `npm run new:post` 生成，**文件名一律 ASCII slug**（系列文 `css100day-<天数>.md`，
非系列文 `<英文短标题-kebab>.md`）；已有的中文 URL 不再改动，避免丢外链与收录。
frontmatter 常用字段：`title` `published` `updated` `description` `tags` `category`
`series` `seriesOrder` `image` `draft`——新增字段必须先改 `src/content.config.ts` 的 schema，否则构建报错。
写完文章要顺手写 `series` 与 `seriesOrder`，否则该篇不进系列。
正文配图唯一正确写法是 `![说明](/images/xxx.jpg)` 并把文件放进 `public/images/`。

## 已知约束

- **`mermaid` 停在 11.x、`typescript` 停在 6.x 是硬天花板**：分别被 `astro-mermaid` 与
  `@astrojs/svelte` 的 peer 声明卡住，硬升会让 `npm ci` 直接 ERESOLVE 失败。
- **`@astrojs/markdown-remark` 必须保持显式依赖**（见上表说明），删掉它整个 Astro 配置加载会失败、连 dev 都起不来。
- 改了 `src/plugins/**` 或 `astro.config.mjs` 里的 markdown 处理链后，需要删 `node_modules/.astro/data-store.json`
  再构建——Astro 的内容层缓存在那里，插件源码变了它不失效。
- 依赖走 npmmirror 时 `npm audit` 会报 `404 NOT_IMPLEMENTED`，要审计得显式换官方源：
  `npm audit --registry=https://registry.npmjs.org`。

## 部署

`npm run build` 产出自带搜索索引的 `dist/`，用任意静态服务器指向该目录即可（Nginx 只需把 `root` 指到 `dist`）。
注意 `build` 脚本包含 `pagefind --site dist`，**只跑 `astro build` 打包上线会让搜索 404**。

## 后续计划

1. 404 页面设计
2. 动态页二期剩余三项：搜索 / 年份筛选 / 图片画廊

## 致谢

模板与部分交互范式来自 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)（参考站
<https://firefly.cuteleaf.cn/>），页面过渡的时长与缓动数值取自其编译产物。
