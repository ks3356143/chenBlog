# AGENTS.md — 项目长期指令

> 陈俊亦的个人博客。每次对话开始时自动读取本文件作为上下文。
> 最后更新：2026-09-28 深夜（Pagefind 站内搜索 + 双木成林站点图标全套 + 下拉可靠收起；
> 第五节补 18、19，更正 9、11，第三节加 `npm run icons` 与 audit 换官方源的说明。
> 同日早前：新增 /series/ + /tags/ + 顶部「文章」下拉（五-16、17）、第一节"参考源"、两条假缺陷证伪）

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
- 文章 26 篇，UI 和提交信息全部为中文

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
| 页面过渡 | Swup **4.10.0** + `@swup/scripts-plugin` **2.1.0**（⚠️ 四个坑见第十节） |
| 其他 | Fancybox 图库、astro-icon 1.2.0 + Iconify |

> 2026-09-21 做过一次全量依赖升级，`npm audit` 从 21 个漏洞（2 critical）降到 **0**，
> 并通过干净 `npm ci` + 构建验证。升级中的坑与版本天花板全部记在第五、九节。

**注意**：Tailwind 4 + Astro 7 + Svelte 5 都是较新的大版本，网上很多教程是旧版写法，改配置前先确认版本。

## 三、常用命令

```bash
npm run dev       # 本地开发，http://localhost:4321
npm run build     # astro build + Pagefind 索引，产物在 dist/（含 dist/pagefind/）
npm run preview   # 预览构建产物——【搜索只能在这里或线上验】
npm run icons     # 由 public/favicon.svg 重生成整套站点图标（PNG/ICO）
```

`package.json` 里**没有** lint / test 脚本，也没有部署脚本。验证手段就是 `dev` 看效果 + `build` 确认能构建通过。
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
src/config/                 # 另有 backgroundWallpaper / commentConfig / galleryConfig
src/content/posts/          # 26 篇文章（24 .md + 2 .mdx）；images/ 是空的历史遗留目录
src/content/spec/           # 单页内容（about 等）
src/pages/                  # 路由：about / archive / categories / tags / series / guestbook / gallery / posts/[...slug] / [...page]
src/pages/rss.xml.js        # RSS 已实现
src/layouts/                # BaseLayout.astro + Layout.astro
src/plugins/                # 8 个自研 remark/rehype 插件（见下）
scripts/generate-icons.mjs  # 由 public/favicon.svg 生成全套图标（npm run icons）
pagefind.yml                # 搜索索引排除规则（KaTeX、data-pagefind-ignore、搜索面板自身）
src/styles/                 # CSS + 一处 Stylus（markdown-extend.styl）
src/utils/                  # content/date/gallery/image/layout/toc/url 工具函数
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
   `title` `published` `updated` `draft` `description` `image` `tags` `category` `series` `seriesOrder` `lang` `pinned` `author` `sourceLink` `licenseName` `licenseUrl` `comment` `password` `passwordHint`
   新增字段必须改 schema，否则构建报错。支持 `password` 加密文章。
   `series`（空=不归入任何系列）+ `seriesOrder`（系列内序号，可为 0）驱动 `/series/` 页与文章页系列导航盒，
   见第十六项；**写完文章要顺手写这两个**，否则该篇不进系列。

6. **图片统一输出 webp，质量 80**（未开 avif）。

7. `dist/`、`.astro/`、`node_modules/` 都在 `.gitignore` 里，**构建产物不入库**。

8. **Astro 7 下不能留空的 `<script></script>`**。空脚本不产出 chunk，Astro 7 解析其构建路径时会直接
   `Error: Cannot find the built path for ...astro?astro&type=script&index=0&lang.ts`，
   导致整个页面（含首页）渲染失败。Astro 6 容忍、Astro 7 报错。
   → 已于 2026-09-20 从 `src/pages/[...page].astro` 移除一处。要么写内容，要么整行删掉，别留空标签。

9. 构建产物基线（**2026-09-28 深夜实测**：接 Pagefind 之后）：
   **40 个页面 / dist 307 个文件 / 28M**，其中 `_astro/` 187 个、`pagefind/` 42 个（索引 28 页 / 2326 词），
   热缓存 `npm run build` 约 5~7s + 索引 0.2s。
   （历史：09-21/09-23 是 37 页 / 260 文件；09-24 加 `/categories/` → 38 页 / 259；09-28 加 /series/ /tags/ → 40 页 / 261。）
   Pagefind 会提示 `doesn't support stemming for zh-cmn` —— 中文没有词干还原，**属正常**，不影响命中。
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
    `Layout.astro` 在 `#swup-container` 里注入 `<h1 class="sr-only">{title ?? "YILIn"}</h1>`：
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
    - 手风琴类交互（下拉、`/series/` 系列卡片、文章页 SeriesNav）一律**事件委托 + `window.__xxxInit` 幂等标志**，
      因为 `@swup/scripts-plugin` 会重跑容器内脚本（第十节 2）。Header 在容器外，它的脚本只跑一次，无需幂等标志。
    - **只在部分页面渲染的组件，布局类 CSS 必须放全局样式表**（现已放在
      `src/styles/singles/mainSingles.css` 的 `.series-acc-*` / `.series-nav-*`）；
      Header 系组件每页都渲染，所以 `DropdownMenu.astro` 的 scoped `<style>` 是安全的。
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
    - 现有 26 篇：25 篇 `series: "CSS100Day"`（`seriesOrder` = 天数，第 2~28 天，缺 1 和 11），
      1 篇 `series: "CodePen"` 序号 1。系列名跟标题前缀 `CSS100Day(N)-` 保持一致，**与 tag 的 `CSS100天` 是两套写法**，
      改的时候别混。
    - 新页面记得给 `Layout` 传 `title`（`系列-Yilin` / `标签-Yilin`），区块标题从 `h2` 起（见第十三项）。

18. **搜索 = Pagefind 全文检索**（2026-09-28 接，照 Firefly）。
    - 依赖 `pagefind@^1.5.2` + `sharp@^0.35.5`（后者只为生成图标）；`build` 脚本是
      `astro build && pagefind --site dist`，索引输出到 **`dist/pagefind/`**（不是 `_pagefind`）。
    - 组件 `src/components/controls/Search.svelte`（Svelte 5 runes），在 `Header.astro` 里以
      `<Search client:load />` 挂载；旧的装饰性 `src/components/uiverse/Search.astro` **已删**，别再引它。
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

## 六、部署

**部署方式：本地构建 + 上传 `dist`，服务器不跑 build。**（2026-09-20 起）
> 2026-09-28 接了 Pagefind：索引在 `dist/pagefind/` 里，**随 dist 一起打包上传就行，服务器和 Nginx 不用改**；
> 但 `npm run build` 现在包含索引步骤，别只跑 `astro build` 就打包，那样线上搜索会 404。

- 服务器：阿里云 ECS，宝塔面板 + Nginx
- SSH：`root@47.108.230.220`，**端口 22**，仅 publickey 认证（密码登录已关闭），本机 SSH 公钥已授权到该服务器 ✅
- 服务器上虽有 node `v24.14.1` / npm `11.11.0` 和一份 `node_modules`，但**已不用于部署**：
  那份依赖停在 Astro 6.1.6，`npm ci` 会因 peer 冲突直接失败（详见"已知坑"）。**别在服务器上 build。**
- 服务器上的 git 仓库也不再是部署来源，会与远端脱节，属正常现象。

### 部署目标路径

| 项 | 值 |
|---|---|
| 仓库目录 | `/www/wwwroot/chenBlog` |
| **Nginx 根目录** | **`/www/wwwroot/chenBlog/dist`** |
| vhost 配置 | `/www/server/panel/vhost/nginx/html_chenblog.com.conf` |
| 监听 | `listen 80` + `server_name 0.0.0.0` → 裸 IP 直接命中博客，站点标题 `YILIn` |

Nginx 根目录直接指向 `dist/`，**build 完成即上线**，无需额外拷贝或 reload。

> ⚠️ 服务器 `/www/wwwroot/` 下**还并存着其他项目的目录**。曾经发生过把博客路径认错的情况，
> 若推错目录会直接毁掉另一个项目。动手前务必确认当前路径是 `chenBlog/dist`，不要凭记忆。

### 标准部署流程（已验证可用）

```bash
# ① 本地构建 + 打包
npm run build
tar -czf /tmp/chenblog_dist.tar.gz -C dist .

# ② 上传
scp /tmp/chenblog_dist.tar.gz root@47.108.230.220:/tmp/

# ③ 服务器：解压到临时目录 → 校验 → 原子替换
ssh root@47.108.230.220 'set -e
  cd /www/wwwroot/chenBlog
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

- 宝塔面板地址、端口、安全入口等**一律不写进本文件**（仓库公开）。需要时问用户，或查本地私密记录。
- 面板为**自签名证书**，浏览器自动化会被 `ERR_CERT_AUTHORITY_INVALID` 拦住，
  且 in-app 浏览器 surface 隐藏无法截图；http 访问直接 `ERR_CONNECTION_RESET`
  → **面板不适合自动化，一律走 SSH。**
- **凭据纪律**：面板密码、SSH 私钥、任何 token **一律不得写入本文件或提交进 git**；
  也不要在对话里明文传递。改密码应由用户自己在面板 UI 操作，避免新密码再次落入会话记录。
- 勿运行 `bt 14` / `bt default`——会把面板密码明文打印出来。

### 铁律

> **生产环境的上线动作，默认由用户本人执行。**
> 我负责改代码 + `npm run build` 验证产物。除非用户当次明确授权，否则我不擅自 ssh/scp 覆盖线上文件、不重启 Nginx、不改宝塔配置。
> 授权一次只对那一次有效，不视为长期许可。

## 七、协作约定

### 铁律：会话收尾

> 用户说「**下班**」「**结束会话**」「**收工**」「**今天到这儿**」时，不要只回一句再见，
> 必须主动跑完收尾流程再交付总结：
>
> 1. **清临时文件** — 本地与服务器 `/tmp` 下本次会话产生的 tar 包、curl 抓的 html、探测脚本、临时清单
> 2. **整理代码** — 移除 `console.log`、临时注释、注释掉的死代码、写死的测试值；确认无半截实现；`npm run build` 必须通过
> 3. **整理 MD** — AGENTS.md / README 与实际状态对齐，过期内容删掉、变更路径改掉、更新「最后更新」日期
> 4. **去重** — 同一件事只在最合适的一处讲，其他地方引用而非复述
> 5. **Git 收尾** — `git status` 干净，或明确说明保留了哪些未提交改动及原因；推送前先问；提交前扫一遍敏感信息
> 6. **任务清单** — 关闭已完成的，未完成的写清卡在哪、下次从哪继续
> 7. **一句话总结** — 改了什么、线上状态、遗留事项。不复述过程。
>
> ⚠️ **回滚资产不算临时文件**：`dist.old`、`dist_backup_*`、git stash、备份目录一律保留，
> 删掉就失去回滚能力。只有用户明确说"确认稳定，清掉备份"时才删。拿不准就保留并告知。

### 日常约定

- **改之前先跑起来看现状**，不凭想象动手；改完必须 `npm run build` 通过再报完成
- **UI 改动要在浏览器里实际验证**（可用 browser-use 只读访问线上站点对比）
- 提交粒度小，一次改动一件事，方便回退
- 提交信息用中文，跟现有风格一致（如"添加前端css邪修-2ge"）
- 不引入新依赖前先问；不擅自升级大版本
- 不确定就问，别猜

## 八、文章写作规范（2026-09-21 实测调研，非推测）

### 现状

26 篇文章 = 24 `.md` + 2 `.mdx`（只有第2、3天用 mdx），**无草稿**，与 `dist/posts` 的 26 个路由一一对应。
`src/content/posts/images/` 是个**空目录**，历史遗留、git 也不跟踪空目录。
新文章用 `.md`（主流选择），只有需要嵌组件时才用 `.mdx`。

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

26 篇实测**只出现了 10 个字段名**：上例那 9 个（`title` `published` `updated` `description` `tags` `category`
`series` `seriesOrder` `draft`）人人都有，`image` 只有 10 篇写了、且值全是 `""`（所以封面全走兜底图）。
schema 里其余 8 个（`pinned` `author` `sourceLink` `licenseName` `licenseUrl` `comment` `password` `lang`）零使用。
`category` 会进分类导航栏，要新增分类值前先确认；`series` 决定文章是否出现在 `/series/`（见第五节 17）。

### 图片：最容易出事的地方

| 写法 | 结论 |
|---|---|
| `![说明](/images/xxx.jpg)`，文件放 `public/images/` | ✅ **唯一正确写法**，全站只有 1 篇用对（第6天:26） |
| `<img src="./xxx.svg">` **写在正文里** | ❌ 真坏：解析成 `/posts/<slug>/xxx.svg`，文件不存在就 404 |
| `<img src="./xxx.svg">` **写在 ` ``` ` 围栏里** | ✅ **无害**：只是示例代码文本，浏览器不发请求（见第九节"heart.svg 误判"） |
| `src="https://100dayscss.com/..."` | ⚠️ 依赖他人服务器，对方开防盗链或关站会集体裂图。2026-09-28 实测 12 个真实请求的资源全部 200 |

**封面**：`image` 字段 26 篇**全为空**（10 处写了但值是 `""`），所以列表页封面统一是兜底图
`assets/postImages/loadingfalse.png`。
注意 `src/assets/covers/1,2,3.jpg` 是**站头轮播壁纸**（被 `backgroundWallpaper.ts` 引用），
不是文章封面，别混。

### ⚠️ 这些功能配置齐全但从未在生产环境用过

Mermaid、KaTeX 公式、`:::` callout 提示框、`<github>` 卡片、图片网格、代码块折叠——
26 篇文章**一个都没用到**，全部是纯 HTML + 内联 `<style>`（CSS100Day 系列的做法）。

→ 这些渲染路径等于**零实战验证**。首次写用到它们的文章，必须在 `npm run dev` 里逐项确认再上线，
别以为配置装了就能用。

## 九、待办与未决（最近一次更新：2026-09-28）

### 文章方向，等用户拍板

1. **文件名 → URL 是否继续用中文**：现状 26 篇全中文 URL，分享出来是 `%E5%A4%A9` 这种。
   建议**不动已有 26 个 URL**（会丢外链和收录），但**新的非系列文章改用 ASCII slug**。
2. **是否开始配文章封面**：可做成"按分类自动配图"，成本低。
3. **是否要文章脚手架**：一条命令生成带正确 frontmatter 的模板文件。

### 缺陷现状（2026-09-28 全站实测后）

**已知缺陷：无未修项。** 2026-09-28 用「解析真实元素 + 逐路径核 dist」扫全站 38 页：
本地引用 106 个 **0 缺失**、远程 57 个 URL 全部 200（100dayscss 12 个 / 本站绝对链接 39 个 / astro.build 1 个 / GitHub 5 个）；
标题层级审计 **38 页 0 问题**。修的内容见 [`HANDOFF.md`](./HANDOFF.md) 第二节，此处不重复；
本节只留**长期有用的排查方法**。

- **两条"已知缺陷"当初是误判，别再当真**（2026-09-28 证伪）：
  ① ~~"2 处 `<img src="./heart.svg">` 线上 404"~~ —— 那两处引用都在 ` ``` ` 围栏内，是示例代码文本，
     页面上没有 `<img>` 元素、不发请求。grep HTML 能搜到是因为 expressive-code 把整段代码塞进了
     复制按钮的 `data-code="..."` 属性。
  ② ~~"代码块的语言徽章和行号从未渲染过"~~ —— **两者一直正常渲染**。徽章是
     `[data-language]::before`（`content: attr(data-language)`）——伪元素**不在 HTML 文本里**，
     按标签去 grep 必然搜不到；行号是 `div.gutter > div.ln`（第10天那页实测 124 个），
     之前用 `ec-line-numbers` 这种不存在的类名去查，自然"零产出"。
  → **通则：查渲染缺陷要按产物实际结构验证，别用"搜 HTML 字符串"和臆想的类名当证据。**
  → `<img>` 是 void element，解析器不会把它挂成 `<pre>` 的后代，所以"跳过 pre 子树"的 HTML 解析法也会漏判；
     正确做法是**按源码 ` ``` ` 围栏逐行判定**（围栏内=示例文本，围栏外=真实元素），再核 `dist` 里文件在不在。
- **远程图片依赖 `100dayscss.com`**：实测 12 个 distinct 资源 / 13 处真实请求（另有大量写在围栏内的示例引用，不发请求）。
  对方关站或开防盗链会集体裂图，属**外部风险**，不是当前缺陷。


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

  ⚠️ **两个已实际犯过的低效写法，别再来**：
  ① 先 `npm update` 再 `rm -rf node_modules && npm ci` —— 把 614 个包写进磁盘又立刻删掉重装，
     白等约 3 分钟（2026-09-23 实测）。
  ② 在 `npm ci` 前手动 `rm -rf node_modules` —— `npm ci` 自己会清掉已有 `node_modules`，多此一举。
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
- ⚠️ A/B 对照同时暴露一个**既存缺陷**（语言徽章与行号从未渲染），已归入本节「已知缺陷」，此处不重复。
- `npm ci` 有一条 `npm warn deprecated glob@10.5.0`（传递依赖），不阻塞构建。

### 运维

- 宝塔面板密码曾在对话中明文出现，用户当前选择暂不修改；面板 IP 白名单未开。
- 服务器回滚资产 `dist.old` + `dist_backup_20260920_234618`（共 52M）**保留中**，
  确认线上稳定数日后才可删。
- 前端计划：**页面间动画已于 2026-09-23 用 Swup 实现**（见第十节）；404 页面仍以 `README.md` 为准。

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
   靠 `@swup/scripts-plugin` 重执行；但 **`slot="head"` 的脚本导航过去永不执行**——
   `gallery-filter` 自定义元素曾因此从首页导航进相册时彻底失效。这类脚本必须放在容器内（body）。
   同理 **Astro 组件的 scoped `<style>` 只存在于"渲染了该组件的页面"的 head 里**：在不渲染卡片的
   `/archive/` 整页加载后 Swup 回首页，PostCard 样式缺失 → 卡片退回 column 布局、内容与右箭头重叠
   （2026-09-24 实测 64px）。→ 组件的**布局类 CSS 放全局样式表**（`global.css`），每实例变量内联到元素上。
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
   ⚠️ **回顶放 `visit:start` 现在是对的**（推翻 09-24 的旧结论）：前提是 chrome（封面/侧栏/分类栏）
   都在 Swup 容器外、不随页替换也不参与过渡，回顶与点击同任务、下一帧绘制前完成，浏览器永远画不出
   "旧页滚到一半"。若将来把任何会随滚动移动的 chrome 挂回过渡类，这条立刻失效。
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
