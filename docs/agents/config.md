# AGENTS 分册 · 第五节「必须知道的配置约定」全文（五-1 ~ 五-61）

> 本文件是 `AGENTS.md` 某一节的**全文**，2026-10-12 从 AGENTS.md 无损切出。
> `AGENTS.md` 只留常驻结论与索引（受 harness 64KB 注入预算限制）；改到本节任何主题前先读本文件全文。
> **行内容逐字未改**，条目编号（五-16 / 八-9 / 十-14 …）在 AGENTS.md 与 HANDOFF.md 里照旧引用。

---

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

9. 构建产物基线（**2026-10-18 实测**，V0.1.53）：**44 个 index.html / dist 360 个文件 / 真实字节合计 21.69MB（22,742,496 B）**；
   HTML 总数 45（多出的那 1 个 = `404.html`，见五-46）。Pagefind 索引 **30 页 / 2899 词**（词数取构建输出 `Indexed N words`，`pagefind-entry.json` 只给 `page_count:30`）、`sitemap` 44 条 URL。
   历史（各批当时的实测值，**别再当现状引用**）：
   ↳ 2026-10-10 傍晚 V0.1.36 时是 **43 个页面 / dist 357 个文件 / `du -sh` 22M**，
   ⚠️ **量数字要连着方法一起报**：`du -sh` 按 4K 分块算（351 个文件就白涨 ~0.7M），字节合计才可比；
   文件数用 `find dist -type f | wc -l`，页数用 `find dist -name index.html | wc -l`。
   上一条记的"350 个文件"与今天的 351 差 1，**不是本批引入的回归**：`_astro/` 同步从 211 涨到 212，
   时间上唯一夹在中间的是 10-08 上午那批改 `Cover.astro` / `ImageWrapper.astro` / `CoverImage.astro`
   的提交（多切出一个 chunk 属正常），**具体归因没逐笔核过，只当口径说明用**。
   其中 `_astro/` 212 个（自动封面 4 张 × 5 档响应式 = 20 个）、
   `pagefind/` 44 个（**29 个 fragment / 索引 29 页**）、`gallery/` 26 个（20 张照片共 3.46MB）、
   `images/` **17 个**（1 张历史 jpg + `images/ccnewtools/` 的 **16** 张 webp，共 0.38MB）。
   热缓存 `npm run build` 约 **4.0s** + 索引 0.2s（2026-10-01 起；此前 5~7s，差值来自五-30 那批重复渲染的消除）。
   （体积历史：28M → 09-30 相册 webp 化后 **20.3M**（−7.7M）→ 10-01 下午 **22M**。
   文件数历史：307（09-28 接 Pagefind）→ 334（09-29 新相册）→ 335（09-30 加 `public/og-image.jpg`）→
   **336**（10-01 下午加 `public/assets/js/reinit.js`，十-14）→
   **350**（10-07 加 1 篇文章页 + 11 张 webp + 2 个 pagefind 产物）→
   **351**（10-08 下午复核，多出那 1 个见上面的口径说明）→ **352**（10-10 傍晚加 `public/assets/wechat-qr.webp`，见五-40）→ **357**（同日再增 5 张手册配图 webp，见八-9）。
   ⚠️ **加一条动态不会动这些数字**（条目在 `/api/dynamic.json` 里，不进 HTML 也不进索引，见五-24）。
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

38. ⚠️ **本站是裸 IP + 纯 HTTP，`navigator.clipboard` 在访客浏览器里压根不存在**（非安全上下文，`window.isSecureContext === false`）。2026-10-10 做 meCard 的「复制 QQ 号」时查出：
    - **`CopyShare.astro` 的「复制链接」从上线起就是静默失败的**——它写的是 `try { await navigator.clipboard.writeText(url) } catch { console.error(...) }`，在 HTTP 下第一句就抛 TypeError，被自己的 catch 吃掉，**只往控制台打一行、界面上毫无反应**。
      （本地 `npm run preview` 是 localhost = 安全上下文，**测不出这个病**，得上线或用 `Object.defineProperty(window,'isSecureContext',{value:false})` 模拟才能验。）
    - 现口径：**先判 `navigator.clipboard && window.isSecureContext`，否则退回 `textarea + document.execCommand("copy")`**（该 API 虽标废弃，Chromium/Edge/Firefox 至今仍可用，且**在非安全上下文里是唯一出路**）。`CopyShare` 与 `meCard` 两处都留了退路。
    - 失败要**可见**：meCard 的提示条在复制失败时直接把号码显示出来（`QQ：314298729`），而不是只报个错——用户至少能自己选中复制。
    - ⚠️ 将来上了 HTTPS 这条退路仍要留着（旧浏览器、以及仍走裸 IP 的访问路径），别当历史包袱删。
39. ⚠️ **`<script is:inline>` 里的代码 Astro 不转译，写 TS 断言会原样进 HTML 变成语法错误**（2026-10-10 差点犯）：给 `CopyShare.astro`（它的脚本是 `is:inline define:vars`）加 execCommand 退路时，我先写了 `(document as unknown as {...}).execCommand("copy")` 去挡 deprecated 提示。
    → `npm run check` 当场报 **ts(8016) "Type assertion expressions can only be used in TypeScript files"**——Volar 把 `is:inline` 块按 JS 处理，而**浏览器更会直接语法报错**，整段复制功能报废。
    → 通则：**`is:inline` 脚本只能写纯 JS**；要用 TS 就得去掉 `is:inline`（但那样 `define:vars` 的用法就变了，见十-3）。
    → 代价：两处 `document.execCommand` 的 ts(6387) deprecated hint **保留**，基线从 2 条变 4 条，见三节。
40. ⚠️ **藏在 `hidden` 浮层里的图不要标 `loading="lazy"`**（2026-10-10 实测）：meCard 的微信二维码浮层默认 `hidden`，标了 lazy 之后 iframe 探针读到 `complete=false / naturalWidth=0`——**懒加载按视口判定，隐藏浮层里的图不会被提前拉**，用户点开那一瞬才发请求，本地都会白一下，弱网更明显。
    → 现改成 eager（那张图现在是无损 webp，**63.3KB / 750×750 只含码体**，本来就该直接下）。
      ⚠️ 这条与下面 41 是同批：浮层已从 `hidden` 改成 `visibility` 驱动，**但结论仍然成立**——
      `visibility:hidden` 里的图同样不会被懒加载提前拉。
    → 判据：**`naturalWidth === 0` 在隐藏浮层里不等于"坏图"**，要先撤掉 `hidden` 再测；与五-35 那条"懒加载图在视口外本就该留着遮罩"是同一族假信号。
41. ⚠️ **点击开合的浮层不要靠 `hidden` / `display` 切换——`display:none` 上没有可插值属性，CSS 过渡根本不会跑**
    （2026-10-10 他报 meCard 二维码浮层「打开没有动效」的根因）。原先 JS 写 `pop.hidden = !on`，就是瞬间切换。
    - 现口径（与站内桌面下拉同一套思路）：**开合状态只由按钮的 `aria-expanded` 表达**，CSS 用相邻兄弟选择器
      `.me-wechat-btn[aria-expanded="true"] + .me-qr-pop` 驱动 **`opacity` / `visibility` / `transform`** 三条过渡（0.18s），
      闭合态配 `visibility:hidden + pointer-events:none` 把它移出无障碍树与命中区；`prefers-reduced-motion` 下撤掉过渡。
      JS 里**不再碰 `hidden`/`display`**，只 `setAttribute("aria-expanded", …)`。
    - ⚠️ Tailwind **v4** 的 `-translate-x-1/2` 编译到 **`translate` 属性**上，和这里动画用的 **`transform` 是两个属性**、
      互不覆盖，所以居中不会被动画吃掉。**v3 不成立**（v3 把 translate 合成进 `transform`），别把这套照搬回 v3 项目。
    - 取证：点击后读 **`el.getAnimations()`**，应列出 3 条 `CSSTransition`；**别用"等 200ms 再读 opacity"当判据**——
      隐藏标签页里过渡不推进（五-25 老坑），要 `anim.finish()` 强制落到终态再读计算值。
42. ⚠️ **`PostMeta` 那行「图标 + 文字」的间距是靠文字侧的 `p-1.5` 撑出来的，日期必须一起带**
    （2026-10-10 他报「文字和图标靠得太近」）：`.meta-icon` 是 32×32 的色块 + `margin-right: .5rem`（8px），
    而分类/标签的文字包在 `<a class="btn-plain … p-1.5">` 里 → 字形离色块实际 **14px**；
    两个日期原先是裸 `<span>`，只有 8px → **同一行里两种间距**，看着就是日期贴太紧。
    现给日期 span 与「**暂无标签**」那个 div 都补 `px-1.5` 拉平到 14px（**暂无标签 是第二遍才发现漏的**：
      它只在 `PostCard` 那种不传 `tags` 的调用里出现，见 `PostCard.astro:81`）；列表卡与文章页用的是同一个组件，一并修好。
    → 通则：**量间距要量"文字字形 → 色块右缘"的实际像素**（`Range` 取首字矩形），别只看 `margin` 声明值；
      这类改动要在文章页 1440 / 375 与首页列表卡三处都量一遍才算覆盖。

43. ⚠️ **主内容面板的起点必须是「横幅高 − 3.5rem」，不能写死 `top-[30vh]`**（2026-10-13 修）
    - 参考站的做法：`.content-panel { top: var(--content-top, 5.5rem); position: absolute }`，
      而首页 `--content-top` 实测解析成 **`calc(65vh - 3.5rem)`**；1600×900 下 = **585 − 56 = 529px**。
    - 我们原先在 `Layout.astro` 里写死 `top-[30vh]` = **430px**，**比参考站高 99px**。
      后果：`#page-shell` 从 430 就开始，而波浪带只覆盖 452–587 → **内容压进波浪带上方**，
      壁纸图与 `--page-bg` 的硬切交界整块露在内容底下，看着就是「**一块没有波浪的绿**」（用户报的原话）。
    - 现改成 `.content-panel` 类 + CSS 变量：首页 `calc(var(--banner-height-home) - 3.5rem)`、
      非首页 `body:not(.is-home)` 用 `calc(var(--banner-height-non-home) - 3.5rem)`。
    - ⚠️ **切页期间 `top` 必须跟着横幅高度一起过渡**（`html.is-wallpaper-transitioning .content-panel { transition: top .45s … }`），
      否则内容比横幅先到新高度、在波浪带边缘闪一下。
    - 复测数字（1600×900）：首页 `content-panel.top = 529`、`banner.bottom = 585`；
      非首页（归档 / 文章页）`349` / `405`。

44. ⚠️ **波浪四层 `<use>` 的 `x` 必须错开，且横幅底部要有 `#wallpaper-gradient`**（2026-10-13 修）
    - `Waves.astro` 里四层的 `x` 是**均匀铺开的起始相位**，参考站逐字为
      **`-42.000` / `2.641` / `48.944` / `92.468`**（y 分别是 0 / 3 / 5 / 7）。
      我们原先**四层全写 `x="48"`** → 四条波**完全重叠成一条平的**，
      opacity 25/50/65/75 叠出来只是一块略深的纯色，看不出任何波纹。
    - 参考站横幅里还有一层我们漏掉的：
      ```html
      <div class="wallpaper-gradient absolute bottom-0 left-0 w-full pointer-events-none md:block"
           id="wallpaper-gradient" style="height: 10%; background: linear-gradient(to bottom, transparent, var(--page-bg));">
      ```
      它负责把**壁纸图的下缘溶进页面底色**。没有它时壁纸图直接硬切到 `--page-bg`，交界线特别明显。
    - 复测数字（1600×900 首页）：渐变带 548–609（高 61px）、波浪四层 `x` 读出来是
      `-42.000,2.641,48.944,92.468`。
    - ⚠️ 别只比源码字符串：`h-[10vh] max-h-37.5 min-h-12.5` 这类**尺寸类**走样时不报错、不告警
      （同一族坑见 AGENTS 一节「参考源用法」第 5 条那次波纹高度差 2.7 倍）。
45. 🔴 **给 `@astrojs/sitemap` 写错选项键名不报错，而是整个 sitemap 不生成**（2026-10-17 实测）
    - 我给 404 页做排除时按直觉写了 `sitemap({ exclude: ["/404.html"] })`。构建输出：

      ```text
      [WARN] [@astrojs/sitemap]    Unrecognized key: "exclude".
      [build] 45 page(s) built in 4.04s
      [build] Complete!      ← 退出码 0
      ```

      **构建照过，但 `dist` 里静默少了 `sitemap-index.xml` 与 `sitemap-0.xml` 两个文件。**
      我当时没发现，是下一步脚本读 `dist/sitemap-0.xml` 抛 ENOENT 才撞出来。
    - 根因：`node_modules/@astrojs/sitemap/dist/schema.js` 里
      `SitemapOptionsSchema = z.object({...}).strict()`，而 `index.js` 校验失败走的是
      **打一行 warn 然后 `return`**（`return errorList.join("\n")` 那条路径），**不抛错**。
    - → 这个集成**根本没有 `exclude` 键**。排除 URL 只能用官方支持的那一个：

      ```js
      sitemap({ filter: page => !page.includes("/404") }),
      ```

    - ⚠️ **通判据**：这个集成成功时会打一行 `sitemap-index.xml` created at `dist`（INFO）。
      **看到这行才叫真生成了**，只看到 `Complete!` 不算。核构建顺手数：
      `find dist -maxdepth 1 -name 'sitemap*'` 应为 **2**。
    - 同族病（配置写错 → 不报错、功能静默没了）已有三条：**五-11**（`allowScripts` 忘改 → npm 静默跳 postinstall）、
      **五-21**（改插件而内容缓存不失效 → 退出码 0 但产物是旧的）、**五-33**（不写 `client:*` → HTML 有内容但零 JS）。
      **这条是第四条，破坏面比前三条大：它删掉的是本来已经生成好的产物文件。**

46. ⚠️ **站内 404 页：产物已就位，但 Nginx 还没接**（2026-10-17 建；**别当已完工**）
    - `src/pages/404.astro` → 产出 **`dist/404.html`**（不是 `dist/404/index.html`；Astro 对非
      `[...slug]` 的单个 .astro 页就是直接出 `<name>.html`）。直接访问 `/404.html` 实测 **200**。
    - 但服务器上 vhost 里那一行**是注释状态**：`#error_page 404/404.html;`
      （只读 SSH 查过 vhost 与 extension 两处，`404.html` 也只出现在注释里）。
      → **访客打错 URL 现在仍是 nginx 裸页**（`<html>…404 Not Found…nginx`），与这次改动之前完全一样。
    - → 要真生效必须在 vhost 放开那行 + `nginx -t` + reload，**属服务器改动，要他当次点头**（六节四类之一）。
      ⚠️ **放开之后不用再部署**：文件已经在 `dist` 里，改完 nginx 立刻生效。
      报告里要说清这一层，**别说成「404 已经做好了」**。
    - 页面本身守住三条站内规矩：① 语义 h1 由 Layout 注入的 sr-only 承担，可见大标题是 **div**
      （同 `guestbook` / `gallery`，**五-13**）；② **不进搜索索引**——真实原因见本分册 **五-24**：
      只有 `Markdown.astro` 带 `data-pagefind-body`，Pagefind 见到任何 body 标记就**只索引那批页**、
      其余整页忽略（实测 45 页里 30 有 body / 15 没有，首页与归档/分类/标签/系列/相册都在没那批，
      我的 404 也是）。`data-pagefind-ignore` 只是**第二道兜底**、不是原因。
      ⚠️ **我第一版把这条因果写成「挂了 ignore → 所以不进索引」，与 五-24 自相矛盾**（写 五-46 前没回去读
      同分册已有的 五-24）。10-17 复验时才发现。
      ⚠️ **编号引用要像选择器一样先在目标文件里 grep 出来再写**：
      本分册 **五-18 讲的是 Pagefind 总则、五-24 才讲 body 机制**，两条主题相邻、极易引错
      （我更正这一处时就差点引成隔壁那条）。同 九·补③ 那条通则。**结论不变、理由要拿对的那个**：
      实测搜「页面不存在」「走丢」都只回手册页，**没有** 404 页；③ 不进 sitemap（就是 45. 那条 `filter`，
      实测 sitemap **44** 条 URL、零 404）。
    - ⚠️ **口径分叉，别看花**：`astro build` 那行现在打 **`45 page(s)`**，而 **五-9** 那套方法量的
      `find dist -name index.html | wc -l` 仍是 **44**。差的那一个就是 **`404.html`**——它不是目录页、
      没有 `index.html`，所以五-9 的口径不计它，而 Astro 自己把非 index 的 .html 也算进页数。
      两个数都对，**报数字必须连着方法一起报**（就是五-9 那条原始教训）
    - 🔴 **第二轮复验抓出来、我自己引入的缺陷：非目录页的产物文件名 ≠ 构建期路径 → canonical 指向死链。**
      `404.astro` 产出 `dist/404.html`，但构建期 `Astro.url.pathname` 是 **`/404/`**，而 `SEO.astro` 的
      canonical / og:url 默认取 `Astro.url` → 产物里 canonical 写成 `http://…/404/`，
      **实测那个 URL 返回 404** —— 页面自证「我的规范地址是个死链」。
      ⚠️ **第一遍验收完全没抓到**：我只数了 h1 / title / 内链可达性，**从没把 canonical 与这页真实
      可访问的 URL 做对比**（元素计数型断言对这类错完全隐形）。
      → 修法：`Layout.astro` 接住 `url` 并转发给 `BaseLayout`（后者是 `<SEO {...Astro.props} />`），
      404 页显式传 `new URL("/404.html", Astro.site ?? siteConfig.site_url)`。
      ⚠️ **不传时 `url = Astro.url` 的默认值照常生效** → 其余 44 页零影响。复验口径：线上 45 个 URL
      （sitemap 44 + `404.html`）逐个抓 canonical/og:url 并与自身真实 URL 比，**0 处不符**；
      且线上 360 个文件与本地 dist **逐字节相同**（`find . -type f -exec md5sum` 全表比对）。
      → **通则：凡 `<name>.astro` 直出 `<name>.html` 的非目录页，canonical、og:url、sitemap、
      `error_page` 目标要逐个核，别信默认值。** 验收清单必须加一条：
      **「canonical 指向的那个 URL，自己去访问要能 200」**——光数标签数链接抓不到这类错。。
    - ⚠️ **别为了「让 `/404/` 也能访问」再在 pages 下建一个 404 目录页**：那会多一页、多一个 canonical，
      而 `error_page` 只指 `/404.html`；真要指 `/404/` 得配 rewrite，没必要。
      （措辞上**别把那个不存在的目录页写成反引号路径**——`npm run docs:check` 的死引用闸门会把它当真死链报 error，
      本轮就是这么被撞了一次：闸门只认「反引号里的仓库内路径必须存在」，不区分反事实用法。）
    - ⚠️ **写这页的注释时别出现一级标题标签的字面尖括号写法**——注释会原样进产物，
      将来用 grep 数那个标签来验「每页恰好一个」会被注释自己骗到（本轮我自己踩了一次：
      源码注释里写了字面标签 → 产物里数出 2 个 → 改掉措辞后回到 1）。同 `PostCard` 那条占位文案的教训。

47. ⚠️ **列表卡「置顶」徽标：视觉标识补齐（2026-10-17）；当前零篇用到 → 产物里计数为 0，属预期不是坏了**
    - `pinned` 的**排序一直生效**（`content-utils` 的比较函数把 pinned 前置），缺的只有视觉：
      原先 `PostCard` 挂了 `.pinned` 这个 class，而**全站 CSS 从未定义它**（探针 `pinnedEls: 0`）
      → 置顶与普通文章看着**完全一样**。这是"只做了一半"，不是"坏了"。
    - 改法照参考站：`PostMeta` 新增 `pinned` prop，为真时在 meta 行**第一个**位置插 `.pinned-btn`
      （`material-symbols:pinboard` + 「置顶」），class 串与参考站产物逐字对齐；`PostCard` 把已有的 `pinned` 传进去。
    - 实测（**临时**把 `ccnewtools-manual-v150` 设 `pinned: true` 后 preview）：徽标宽 68px、svg 可见宽 20、
      背景 `rgb(224,244,234)`、圆角 6px、`parentElement.firstElementChild === 徽标` 为真；
      375 档 meta 行 72px、页面横向溢出 0、带徽标的卡序号数组 = `[0]`（只有第一张）。
      **验完立刻撤掉 `pinned`**（该篇与 HEAD 逐字节一致）→ 所以现在全站产物 `pinned-btn` = **0**，符合预期。
    - ⚠️ 图标名 `material-symbols:pinboard` 是读了 `icons.json` 的 **`icons` 表**确认的（**五-29** 的教训：
      照抄参考站图标名会把构建打挂，而那时 `dist/` 已被清空）。
    - → 他要用置顶，**在文章 frontmatter 写 `pinned: true` 就行**（schema 本来就有、此前零篇写过）。

48. ✅ **GitHub 仓库卡片的失败态修好**（2026-10-17）——原先 API 连不上就**永远停在使用中的假象里**
    - `src/plugins/rehype-component-github-card.mjs` 的 `catch` 原先**只加 `fetch-error` 类、不摘 `fetch-waiting`**，
      而 `markdown-extend.styl` 里 `a.card-github.fetch-waiting` 是 `opacity: 0.7` + 描述/信息条/头像
      **无限 pulsate**，占位文本 `Waiting for api.github.com...` / `00K` / `Waiting...` **一格都没换**
      → **访客端看着就是网页卡在加载中，而且永远不会自己好**。（点击其实是通的：
      `fetch-error` 有 `pointer-events: all`，这条我先怀疑过是死链，实测才排除。）
    - 修法（**只改 catch，不动成功路径**）：`remove("fetch-waiting")` + 四格占位换成中文失败态
      （描述＝未能连上 GitHub API、点击卡片仍可直接打开仓库页；星标与许可＝`—`；语言＝未知）。
    - ⚠️ **验证必须掐断才走得到这个分支**——本机 FastGithub 会代理 `api.github.com`，
      正常跑只会测到成功分支（我第一次跑就得到"卡片显示 陈俊亦个人博客 / 1 星 / Astro"，看着一切正常）。
      掐断办法：`ctx.route("**://api.github.com/**", r => r.abort())` → 三张卡全部
      `class="card-github no-styling fetch-error"`、占位 `animationName` 变 `none`（pulsate 停了）、
      `pointer-events: all`；**再点一次，新窗口真开出仓库页**（这条是我最担心的"失败态点不动"，实测没问题）。
    - 附带纠正一条我自己的计数错：用 `html.includes("card-github")` 数卡片得到 **9** 张是**虚数**
      （CSS 里也提这个类名）；数**元素**要匹配 `<a ... class="...card-github...">`，实测 **3** 张。
    - ⚠️ 这属"改了 `src/plugins/**`"→ 按 **五-21** 必须 `rm -f node_modules/.astro/data-store.json` 再构建，
      我这次是**新建 404 页 + 动 about 的 mdx 链**，所以顺手清了；不清的代价是"退出码 0、产物是旧的"。

49. ✅ **分页「上一页/下一页」的 href 补齐尾斜杠**（2026-10-17）；禁用态**没有 href** 是对的，别"修"
    - 原先 `page.url.prev` / `page.url.next` 直接当 href 用 → 产物是 `href="/2"`，
      而同排数字页码走 `getPageUrl` 出 `"/2/"`、该页 canonical 也是 `/2/`，**三者不一致**。
      nginx 有 301 兜着、Swup 也接得住（实测点 `href="/2"` 那个箭头：`location=/2/`、
      `swup:contentReplaced` **+1**、`beforeunload` **0** → 走的是软导航，**用户完全看不出坏**），
      但爬虫按 href 走要多付一跳 301。
    - 改法是加 `withTrailingSlash(u)`，`u === undefined` **原样返回**——
      ⚠️ **别为了让 href 非空而写 `href="#"`**（**五-14** 明令禁止，且 `#` 会被 Swup 的 capture 监听吃掉）。
    - 实测三页：首页的上一页 = **无 href + `aria-disabled=true` + `tabindex=-1`**（这正是五-14 要的状态）、
      下一页 `/2/`；`/2/` 是 `/` 与 `/3/`；`/3/` 的下一页无 href。
    - ⚠️ 这条改动差点被我自己误判成 bug：探针用 `/<a[^>]*aria-label="上一页"[^>]*href="([^"]*)"/` 匹配，
      在禁用态**没有 href** → 正则返回 null → 脚本崩。**先按"属性可能不存在"写探针**，
      或者按 **九·补③** 那条通则用 DOM 解析器（本项目没有 linkedom/parse5 时，退化成
      "先抠出 `<a ...>` 整标签、再逐属性取值"）。

50. ✅ **归档页筛选摘要行的坏文案**（2026-10-17 修）——附一条「三元两分支写成一样」的检测思路
    - `ArchivePannel.svelte` 那行渲染成「26 篇文章 · **1 1 年**」：`{groups.length}` **写了两遍**、
      漏了中间的量词；而上一行 `{filteredPostCount === 1 ? "篇文章" : "篇文章"}` 的**两个分支完全相同**
      （死代码，中文没有单复数变化，当初大概是英文 post/posts 的残留）。
      → **两个字节级缺陷连排，`build` 退出码 0、`astro check` 0 error 0 warning，只有肉眼看得见。**
      ⚠️ 这类"两个分支一样"值得单独扫一遍：
      `grep -E '\? *"[^"]*" *: *"[^"]*"' | 前后两个字符串字面量相同` 就是命中
      （ripgrep **不支持反向引用**，所以别想用 `"(\1)"` 一次写完，见 harness.md **B-25**）。
    - 改成 `{filteredPostCount} 篇文章 · {groups.length} 个年份`。实测三种查询串：
      `?tag=css` → 26 篇文章 · 1 个年份；`?tag=不存在xyz` → 0 篇文章 · 0 个年份；`?category=工具` 同理。
    - ⚠️ **这个摘要块只在有查询串时渲染**（`{#if primaryFilter}`），所以无查询串的 `/archive/` 产物里
      **搜不到「个年份」是正常的**，别据此判定"改动没进产物"（本轮我自己差点误判，靠带 `?tag=` 硬加载才验出来）。
      同族：纯静态下 `Astro.url.searchParams` 恒空，**筛选值的真相全在客户端**（**五-33**）。

51. ✅ **相册照片的 alt 已传值**（2026-10-17）；`PhotoCard` 的 `alt` 默认空串**不是 bug**
    - `[album].astro` 原先写 `<PhotoCard src={photo} albumId={albumMeta.id} />` **不传 alt**，
      而 `PhotoCard` 的 `alt = ""` 默认值 → 产物里 5/5 全空（实测 `空alt: 5`）。
      **五-34 那条"装饰图 alt 必须留空串"只约束装饰图**（横幅、自动封面、头像这类），
      相册照片是**内容图** → 该有 alt。别把两条规矩混起来用。
    - 现在传 ``${albumMeta.name} 第 ${i + 1} 张照片``，实测 `/gallery/zhuhai-2026/`
      5 张 alt 全非空（`珠海日记 第 1 张照片` …）。
    - ⚠️ **这是没有逐张文案时的兜底命名，不是最终形态**：`galleryConfig.albums` 里**没有 per-photo caption 字段**，
      而 `FancyboxManager` 的 `commonOptions` 是 `caption: false` → 灯箱里不显示说明
      （实测点开 `caption: ""`）。要"每张一句人话"得他先给文案，并且要**同时**动两处：
      给 `galleryConfig` 加字段 + 把灯箱 `caption` 打开。**只改一处等于白改。**
    - 对照参考站：`firefly.cuteleaf.cn/gallery/` 自己也只写 `alt="封面"`，所以这不是"照抄漏了"，是**它也没做**。

52. 🔴 **`remark-directive` 的文本指令语法是 `:name` —— 作者正文里任何 `:词` 都会变指令，自研插件再把它渲染成非法标签，读者看到的正文是错的**（2026-10-17 修）
    - **症状**：第 17 天源码 L17 写的是 **`rotate:45deg`**（字节 hex `3a 34 35 64 65 67`），
      但 dist 产物里是 **`rotate<45deg></45deg>`**（hex `3c 34 35 64 65 67 3e`），
      浏览器 `innerText` = `rotate<45deg>` —— **作者写的冒号在读者眼前变成了尖括号**。
      同型受害者共 **3 篇 7 处**：第 17 天（`:45deg` / `:16px`）、
      **第 27 天（`:checked样式取代JS点击事件`）**、`边框炫彩和模糊炫彩特效`（`:1` / `:3` / `:2` / `:3把炫彩和模糊炫彩都挡住`）。
      parse5 在修复前为此报全站 12 处 `invalid-first-character-of-tag-name`（只落这 2 页）。
      ⚠️ 第 27 天那条是我上一轮只盯第 17 天时**漏掉**的，靠"扫全站所有指令节点"才捞出来 →
      **同类缺陷要按"这一类"去扫，别按"我看见的那一条"去修。**
    - **根因链**（每一环都有实测，不是推测）：
      ① `remark-directive@4.0.0` 的**文本指令**语法正是 `:name`（底层扩展里
      `text: {[codes.colon]: directiveText}`），于是 CSS 写法 `rotate:45deg`、`:checked` 被解析成
      `textDirective`；② 自研 `src/plugins/remark-directive-rehype.js` 的 `else` 分支对**任何**非
      admonition 指令执行 `h(node.name, attrs)` → 产出 hast 元素 `<45deg>`；③ `45deg` 不是合法标签名，
      浏览器按 bogus comment 解析 → DOM 里多出 `#comment(45deg)`，而冒号已经没了。
      ⚠️ **围栏代码块与 code span 里的冒号是安全的**：实测 `&::before`、缩进代码里的 `z-index: 45deg`
      **不生成指令**（本轮把全站正文剥掉围栏后扫描，只有那 7 处文本指令 + about.md 的 3 处 `::github`）。
    - **修法**（改 `remark-directive-rehype.js`；白名单 = 真注册成组件的名字）：
      `const COMPONENT_NAMES = ["github"]`（唯一注册处在 `astro.config.mjs` 的
      `rehypeComponents` → `components: { github: GithubCardComponent }`）。
      **未注册**的 `textDirective` / `leafDirective` → 用 `node.position` 从 `file.value` 里
      **抠原始字节**换回 `text` 节点；拿不到原文就 `throw` 让构建**大声失败**。
      ⚠️ 别凭 `":" + name` 重构，那会丢 `{attrs}`、`(label)` 与大小写；也别静默丢字。
      ⚠️ **白名单要对 `:github{…}` 与 `::github{…}` 两种写法一起放行**——只放行 leaf 会让 text 写法的卡片静默退回成纯文本。
      containerDirective（admonition `:::note` 那套）**完全没动**。
    - **验证（两层，先插件级再产物级）**：
      ① **插件级 12 用例全过**（不跑 build 就能看到 HTML）：照 unified 调用形状
      `transformer(tree, file)` + `mdast-util-to-hast` + `hast-util-to-html`，断言
      `rotate:45deg` 回来且 `<45deg>` 消失、`:checked样式…` 回来、`z-index:1` 回来、
      `::github{repo="a/b"}` 与 `:github{…}` **都**渲染 `<github repo=…>`、`:::note` 仍是 blockquote、
      `1:2:3` 与 `http://a.com/b:8080` **不误伤**、未注册指令**带属性也整段退回原文**（`x:foo{a=1}y`）、
      大小写 `::GitHub` 放行。② **产物级**：3 篇原文各命中 1 次、非法标签 0 次、about 仍 3 张卡、
      parse5 错误 **12 → 0**；`check` 0 error / 3 hint、`docs:check` 0 error、
      基线 44 个 `index.html` / 360 文件 / 21.70MB **不变**（只是文字换回冒号）。
      ⚠️ 产物里另有 `<polygon></polygon>` / `<polyline></polyline>` 18 处，我一度当成同类残留 ——
      核实是**他代码示例里的合法 SVG 元素**（在 `<svg>` 内），不是指令产物。
      **判"某类问题是否清零"时，先把可疑命中的上下文看一眼。**
      🔴 **本批照做了。但「变慢 = 缓存清干净」这句因果是错的**（同文件 **L213** 早就写着「清空缓存不会变慢多少，
      重建仍约 5s」，我落笔时没读到自己那句矛盾）：V0.1.51 那次确实 20.2s，而 V0.1.54 同样删 `data-store.json`
      只花 **5.44s**，产物断言（`target=_blank` 缺 `noopener` 由 **183 → 0**）证明插件改动**真的生效**。
      同一晚另一次构建又跑到 **22.18s**（那次**没**清缓存）—— 5.44 / 5.94 / 22.18 三个数方向互相打架，
      🔴 所以**别给「构建耗时」编任何因果**（既不是「变慢=清干净」也不是「变慢=带缓存」）；判据只有一个：
      **解析产物里该出现的新内容 / 该消失的旧内容**（**五-21** 后半句本来就是它，我却另编了一条）。
    - ⚠️ **`remark-directive` 不接受任何选项**（其 `lib/index.js` 里 `remarkDirective()` 无参、
      推扩展时 `directive()` 也没传配置）→ **没法**从源头关掉文本指令语法，只能在自研插件里放行白名单。
      **别去调 `astro.config.mjs` 的插件顺序**：`remarkDirective` 必须在 `parseDirectiveNode` 之前，两个都得留。

53. 🟡 **两处既存的结构/无障碍缺陷修复（2026-10-18，V0.1.52）：`<a>` 里套 `<button>` 180 处 · 搜索按钮无名 + 悬空 `aria-controls`**
    - **A) 侧栏分类卡 `<a><button>`**（`src/components/card/Category.astro`，180 处 = 45 页 × 每页 2 份卡 × 2 分类 × …）
      HTML 规范里 `<button>` 是**交互内容**，不得出现在 `<a>` 内 → parse5 报 `nested-interactive`；
      副作用是**每张卡两个 Tab 停靠点**（外 `a` + 内 `button`）。
      ⚠️ **但"点了不跳"是假的**：本条修复前我用 `page.mouse.click` 测过线上，**1440 和 390 都正常导航**，
      内层 `<button>` 抢焦点后按 **Enter 也能跳**（我一度把它当"点不开"报，是我自己点到了视口外/隐藏副本）。
      → 修它是为了**规范与键盘停靠点数量**，不是为了修点击。别当"点击坏"复述。
    - **修法**：把内层 `<button class="btn-right">` 删掉，`btn-right` 直接挂到 `<a>` 上并补 `inline-block`：
      `class="btn-right inline-block"`。⚠️ **`inline-block` 不能省**——`.btn-right` 在
      `src/styles/singles/mainSingles.css:46` 只声明 `h-10 w-full …`，**没有 `display`**；
      原来那个 `<button>` 的 `inline-block` 来自**浏览器默认 UA 样式**，换成默认 `inline` 的 `<a>` 后
      高度与盒模型全靠这个类补上。实测改后盒仍是 `246×40`（1440）/ `340×40`（390），与旧版**逐像素相同**。
    - **✅ 视觉 A/B 是改前必做项（这次线上旧版 vs 本地 preview 新版，双主题 × 双断点 × 三态）**：
      静止 `pl=8px / bg=rgba(0,0,0,0) / color=rgb(0,0,0)`（暗 `oklch(0.87 0 none)`）、
      hover `pl=12px / bg=rgb(222,244,237) / color=rgb(0,186,153)`、卡高 218 / 列表高 120 **两边完全相同**。
      唯二差异：`cursor default→pointer`（链接本该是手型）、`appearance button→none`（**无边框无底色 → 不可见**）。
      ⚠️ hover 探针必须**先 `scrollIntoView`**：目标在 y=1113 / y=4161 时 `mouse.move` 打在视口外，
      两边都测出 `进hover:false` → 差点误报"hover 效果消失"。**`matches(':hover')` 为 false 先怀疑坐标，不是怀疑 CSS。**
    - **B) 搜索按钮**（`src/components/controls/Search.svelte:165`）：原 `aria-controls="search-panel"` **写死**，
      而面板是 `{#if panelShown}` **条件渲染** → 45/45 页都存在**悬空 ID 引用**（`getElementById` = null），
      且按钮**没有可访问名**（只有 `aria-hidden` 的 svg）。修法：加 `aria-label="打开站内搜索"`，
      `aria-controls` 改**条件属性**。定稿写法（V0.1.53）：`aria-controls={panelShown ? "search-panel" : undefined}`。
      ⚠️⚠️ **别用条件展开属性 `{...panelShown ? { "aria-controls": "search-panel" } : {}}`** —— 看着等价，
      实测它把 Svelte 运行时 helper 拉进**共享** chunk：`_astro/client.*.js` 40,995 → **47,742 B（+6.7KB）**，
      连带 `client.svelte` / `Search` / `ArchivePannel` / `DynamicFeed` / Layout CSS 全重算哈希，
      **每个含岛的页面都吃这 6.7KB**（V0.1.52 就这么把回归上线了一次，靠逐文件 md5 差异面才发现）。
      三元写法编译产物是 `w($,"aria-controls",p(G)?"search-panel":void 0)`（纯属性设置，
      `client` chunk **md5 与改动前逐字节相同**）。
      🔴 通则：**改完 Svelte 组件必须看 `dist/_astro/client.*.js` 的字节数** —— 共享 chunk 变大 = 全站付费，
      页面行为验收完全看不出来。
      ⚠️ Svelte 5 里**注释不能写在标签的属性之间**（`Failed to parse component`）→ 注释放标签外。
      实测 390：未点开 `controls=null` → 点开 `controls="search-panel"` 且指向真实元素、焦点进输入框 →
      Escape 后回到 `null`、面板移除；搜索 5 条结果、Tab 序列里该按钮读作 `BUTTON:打开站内搜索`。
    - **验证（产物 + 浏览器两层）**：parse5 `nested-interactive` **180 → 0**、`invalid-first-character` 0；
      新产物 `<button class="btn-right"` 全站 **0**、`<a …btn-right…>` 首页 4 个；
      45/45 页含「打开站内搜索」、首页静态 `aria-controls` **0**；
      线上终验：分类行标签全 `A`、内层 button **0**、点击与键盘 Enter **都**跳
      `/archive/?category=设计灵感`、聚焦元素名 `posts in 设计灵感`；三篇正文注释节点 **0**；about 卡 3 张；页面 JS 报错 **0**。
    - **尺寸基线三版连跳（逐版取自各自部署脚本的实测值，不凭记忆）**：
      V0.1.51 = **22,753,662**（404.html 133,504）→ V0.1.52 = **22,749,999**（133,270）→ V0.1.53 = **22,742,496**（133,254）；
      页数/文件数恒 **44 / 360**，AGENTS 五-9 的 **21.70MB** 级基线三版都没变（差 11KB 在 MB 精度下不可见）。
      🔴 部署断言里的**字节数与尺寸必须重新实测**，别沿用上一版数字（沿用会把健康构建判成失败）。
      另 ⚠️ 断言**单位要写死**：「含该串的 *.html 文件数」≠「全站出现次数」≠「某单文件内次数」——
      我这轮先写成全局次数、又写成文件数，两次都得出假的 FAIL。
      例：`card-github` 在 `about/index.html` 是 3 次，但全站 48 次（Layout CSS 里还有 45 条规则）；
      `个年份` 只在 `_astro/ArchivePannel.<hash>.js`（**哈希文件名，不能当路径断言**，只能断言"存在"）。

54. 🔴 **未定义 CSS 变量：上一版扫描器有假阴性；按"参考站有没有定义"分三类，别一锅端补上**（2026-10-18 复扫）
    - **先修探针**：Tailwind **v4** 里 CSS 变量的用法是**简写** `bg-(--x)` / `text-(--x)` / `border-(--x)`，不只 `var(--x)`。
      上一版只匹配 `var(--x)` / `(--x,)` / `(--x:)` → 把 `--enter-btn-bg` 报成**「无使用」**（实际 3 处使用）。
      正确正则：`/(?:var|[a-z-]*)\(\s*(--[\w-]+)\s*[,)]/g`（扫 `src/**` 100 个文件：定义 68 种、被使用 63 种）。
      ⚠️ 同族反向坑：**只看 dist CSS 做"定义 vs 使用"扫描**，会对 `style=` / `define:vars` 注入的变量报假阳性
      （`--collapsedHeight` 早前已判**证伪**；`--content-top` / `--content-delay` / `--rotation` / `--speed` / `--gradient`
      同属注入或他文示例变量，不是缺陷）。**报"未定义"前先确认它是不是框架/插件内置**：
      `--spacing`（v4 内置，`calc(var(--spacing)*10)` 全靠它）、`--color-black` / `--color-white`、
      `--tw-prose-*`（`@tailwindcss/typography` **已装** `^0.5.20`，变量由插件注入）—— 这四类在 `src` 扫不到属正常。
    - **分类方法（新增，别再猜）**：抓**参考站编译产物**比对 —— `curl https://firefly.cuteleaf.cn/` 取 3 个
      `/_astro/*.css`（合计 239,084 B），对每个变量数「定义」与「被引用」。结果三类：
      **① 参考站有定义、我们只在裁剪时把 `:root` 那几行删了**（照抄漏了，属遗留）：
      `--enter-btn-bg: var(--btn-regular-bg)`（我们 3 处用：`PostCard.astro:166`「阅读」按钮底色、
      `RecommendedPost.astro:38` 与 `:123` 相关文章/随机文章序号块底色）、
      `--enter-btn-bg-hover/-active`（`PostCard.astro:167`）、
      `--meta-divider: rgba(0,0,0,.2)` / 暗 `rgba(255,255,255,.2)`（`PostMeta.astro:94` 标签间那个 `/` 的颜色）、
      `--card-bg-transparent: var(--card-bg)`（`markdown.css:192` 与 `:200`，**只作用于壁纸透明态**：
      `body.wallpaper-transparent` 下的横向滚动容器底色与 `td` 的 `color-mix(… 92%)`）、
      `--link-underline`、`--admonitions-color-*`（5 个，被 `markdown-extend.styl` 引用；`:::` callout 全站零使用 → 暂时无害）。
      **② 参考站也没有 = 我们的纯死引用**：`--panel-border-color`（`MobileMenu.astro:68` 用在 **`border:` 简写**里 →
      未定义使**整条边框声明失效**，移动端菜单面板因此没边框，**是有视觉后果的**，别说"无害"）、
      `--primary-hover`（`markdown-extend.styl:323` = 九节已登记的「Mermaid 两个未定义变量」之一，零生产使用）。
      **③ 框架内置**（见上，不算问题）。
    - 🔴 **别把 ① 一次性全补上**：`--radius-large: 1rem` 参考站有定义，而**本站「面板一律直角」是明写的规则**
      （五-16③；九节也已把 `rounded-(--radius-large)` 按直角渲染登记为**成立**的既存事实）→ 补上它 = **推翻既定设计决策**，
      会同时改动 about / guestbook / gallery[album] 等 6 处横幅圆角。**这是视觉范围变更，要他点头**，不是"直接解决"的缺陷。
      同理 `--enter-btn-bg*` 一定义就会**真的多出可见底色**、`--meta-divider` 一改就换标签分隔符颜色、
      `--panel-border-color` 一补就给移动端菜单凭空加边框 → **五条都得先问**。
    - ⚠️ **实测边界（诚实记录）**：本轮只在浏览器里**量过** `--enter-btn-bg` 那组序号块
      （计算 `background-color` 亮暗两主题都是 `rgba(0, 0, 0, 0)`，同一探针下的对照组 `--btn-plain-bg-hover`
      芯片实测 `rgb(222, 244, 237)` → 差异是真的）。②③ 类的后果是**按 CSS 规则推出来的**（未定义 var 使声明
      在 computed-value time 失效），**没有逐个量过** —— 要动之前先量，别拿推断当取证。
    - ⚠️ **`var(--x, fallback)` 有 fallback ≠ 没问题**（五-22 已记），也别反过来用「有兜底」论证未定义变量无害。

55. ✅ **`data-code` 里的 `0x7F`（DEL）不是缺陷 —— 是 expressive-code 故意的换行占位符**（2026-10-18 定案，**证伪**）
    - **我上一版的两条误判**：① 怀疑「复制出去的代码带控制字节」；② 断言「dist 里 0 个 JS 引用 `data-code`」，
      据此把它降级成"死属性"。**两条都错**，而且第 ② 条错得很典型：
      我用的正则是 `/data-code|dataset\.code/`，而压缩后的真实写法是
      `let a=e.dataset, r=a.code.replace(/\u007f/g,"\n")` —— **属性名被解构掉了，`dataset.code` 与 `data-code` 一个字都不出现**
      → 正则 0 命中 → 我据此得出"没人消费它"的**假阴性结论**。
      🔴 通则：**判"某属性/字段没有消费者"时，正则必须覆盖「解构 + 简写」形态**（`x.dataset` 之后接 `.任意名`），
      单搜字面属性名**必然漏**；要么搜 `dataset` 本身再看上下文，要么在浏览器里真的点一次复制看结果。
      这是 B-1「0 命中先怀疑探针」在本会话**第四次**应验。
    - **真机制**：`dist/_astro/ec.xb3ii.js` 偏移 1533 处（**已在产物里原文抠出**）：
      `async function u(o){let e=o.currentTarget,a=e.dataset,n=!1,r=a.code.replace(/\u007f/g,`\n`);try{await navigator.clipboard.writeText(r)`
      —— HTML 属性里不便放裸换行，expressive-code 用 `0x7F` 占位，**运行时一行 `replace` 还原成 `\n`**。
      ⚠️ 该 `replace` 里的 `\u007f` 是**源码转义写法**，所以 `ec.xb3ii.js` 文件本身**不含裸 0x7F 字节**（实测 `含裸0x7F字节=false`）
      —— 别拿"在 JS 里搜 0x7F 字节"去找它，要搜 `\\u007f` 这 6 个字符。
      另注意它同时保留了 `execCommand` 退路（`document.execCommand("copy")` 那段）→ 与五-38（裸 HTTP 无 `navigator.clipboard`）对上。
    - **数量级（V0.1.53 实测）**：**208 个产物文件、36,626 个 DEL 字节**
      （比上一版报的"28 文件 / 4719 字节"大一个量级 —— 那次我只扫了 `*.html`；
      这回含 `pagefind/` 分片与 `_astro/`。**报"全站有多少"必须交代扫描范围**，否则两版数字互相打架）。
    - **结论：不动、不修、别当悬案重查**。真要"清理产物字节"只能改第三方插件的输出格式，**零收益**。
      唯一值得留的收获是上面那条**探针教训**。
56. 🟡 **`target="_blank"` 必须配 `rel`：页脚 4 条与 GitHub 卡片曾缺（全站 183 处 → 0，2026-10-18 V0.1.54 修）**
    - **发现方式**：第五轮把无障碍普查扩到 `rel` 维度（**parse5 逐页遍历**，不是 grep 字符串），命中 **183 处**：
      页脚 `Footer.astro` 4 条 × 45 页 = **180**，加 `about` 的 3 张 GitHub 卡片。
    - ⚠️ **归属判定：`src` 里 `grep target="_blank"` 只命中 2 个文件，卡片那 3 处搜不到** ——
      它们的 `target` 是 **JS 对象属性写法**（`rehype-component-github-card.mjs:82` 的 `target: "_blank",`）。
      → 查这类**两种写法都要搜**：`target="_blank"` 与 `target:\s*"_blank"`；只搜 HTML 属性会漏插件生成的那批。
    - **同仓库早有正确口径，不必自创**：`meCard.astro:38-39` 写的是 `rel="me noopener"` / `rel="noopener"`，
      自研 `rehype-external-links.mjs:40` 给对方站点写 `noopener noreferrer`。
      → 修法照这两档：**站内两条**（RSS / Sitemap）用 `noopener`，**真外链**（astro.build / Firefly / 仓库卡）用 `noopener noreferrer`。
      ✅ `_blank` 指**站内**也要 `noopener`：浏览器照样建 `window.opener`，别因"反正是自己站点"就省。
    - **验证（本地先证因果 → 远端断言 → 线上复测，三层）**：
      ① 本地**逐行**模拟远端 `grep -aoP '<a [^>]*target="_blank"[^>]*>'`（跨行标签会数漏，必须逐行跑一遍）
      → `total=365 缺=0 可疑跨行=0`；
      ② 部署断言**成对写**：「缺 rel = **0**」**加**「总数 = **365**」——只写前者，在"正则一个都没匹配上"时会假通过（B-29 第 8 条那族）；
      ③ 线上 `curl` 抓 8 个 URL：`target=_blank` 69 处、缺 rel 0；浏览器读 `a.rel`（DOMTokenList）：
      页脚 RSS/Sitemap = `["noopener"]`、Astro/Firefly = `["noopener","noreferrer"]`、3 张卡片 = `["noopener","noreferrer"]`；
      ④ parse5 遍历本地 dist（与线上 **360/360 逐字节相同**）：45 页 365 处，缺 rel **0**。`npm run check` 0 error / 3 hint。
    - ✅ **加 `noopener` 无副作用（实测，别再用"grep opener 零命中"当依据）**：正则 `/opener/g` 会把
      **`noopener` 自己**全数进来（本站源码里 11 行命中全是它），排除 `no` 前缀后全站只剩 **1 处**：
      `public/assets/js/twikoo.nocss.js` 里的 `open("_blank").opener=null` —— **它做的正是 `noopener` 这件事**，
      不是依赖回写父窗口 → 没有任何代码读 `window.opener`。
      ⚠️ 若将来要"新窗口回写父页"，必须改 `window.open` + `postMessage`，不能靠 `opener`。
      ✅ **真实弹窗行为证据（不是只看属性字符串）**：Playwright 真点这 4 条并读**新标签页里的** `window.opener` →
      **4/4 全部 `window.opener === null` 且落地 URL 正确**（astro.build、站内 `/rss.xml`、CuteLeaf/Firefly、
      `ks3356143/chenBlog` 卡片 —— 卡片这条走的正是 GitHub API 失败的兜底分支，**点了照样开仓库页**）；pageerror 0。
      → 「加了 `noopener` 会不会把新窗口点坏」这个担心可以排除；下次改这类属性**务必点一次读 opener**，
      光 `grep rel` 只能证明属性在、不能证明隔离生效。

57. ⚠️ **文字压在 `<img>` 上时，"读 CSS 颜色算对比度"必然给出假结论**；顺带实测：主色低对比是**参考站同款**（2026-10-18 第六轮）
    - **假阳性现场**：无障碍普查顺手量 WCAG。探针从祖先链合成 `backgroundColor` →
      横幅标题 `.banner-title` 报 **1.15（白字 vs `rgb(233,241,237)`）**，看着像严重缺陷。
      真相：标题下方是 **Ken Burns 轮播壁纸 `<img>`**，`background-color` 链条里**根本没有它** ——
      文字真正的底色是图片像素，任何 CSS 颜色都读不到。**比值 < 2 的"缺陷"最容易照单全修，务必先问"背景是颜色还是图"。**
      同族：`background-image: linear-gradient(…)` 也一样（CSS 侧只看得见 `background-color` 那层）。
    - ✅ **正确的量法（零依赖，不用装图像库）**：`page.screenshot({ clip: 文字框 })` →
      把 PNG 转 `data:` URL 在**页内** `new Image()` + `canvas.drawImage` + `getImageData`（同源，不 taint）→
      ① **必须先把字形像素分出去**（与 `getComputedStyle(el).color` 各通道差 ≤ 24 判为"字"），
      否则"底色"里混着白字自己 → 比值虚高（我第一版就是这么把两站都算成 1.0 的假数，
      "文字像素占比 0%" 就是露馅处）；② 剩余像素取 **p05 / p50 / p95 亮度分位**，与文字亮度算**区间**而非单值。
      实测（1440×900，白字 44.8px/700 → 大字阈值 3）：
      **本站** 对底 p50 **3.22** / 对最亮 5% **2.10** / 对最暗 5% **12.07**；
      **参考站**（72px/700） 对应 **2.66 / 1.88 / 7.66** → **本站横幅不比参考站差，那条 1.15 纯属探针伪影，别修**。
    - 🔴 **主色低对比是参考站同款，不是我们写坏的**（用 canvas 像素法解析 oklch，见 **B-30**）：
      | | `--primary` 声明 | 实际渲染 sRGB | 对白底 | 对浅绿 chip `#def4ed` |
      |---|---|---|---|---|
      | 本站 | `#00ba99`（`global.css:46`，暗色 `:74` = `#0dcaa9`） | `rgb(0,186,153)` | **2.48** | 2.15 |
      | 参考站 | `oklch(.7 .14 var(--hue))`（亮色 hue=165） | `rgb(34,185,136)` | **2.51** | 2.18 |
      两边差 **0.03**，等于同一个绿。参考站自己也把主色用在 12px 小字上（实测样本「外观」= 2.51）。
      → 页面上 `time`(12px)、`a.link`、若干「更多 / 展开」文字对白底 2.48 < AA 的 4.5，
      **但这是照抄参考站的结果**：换主色 = **主动偏离参考站观感**，与「效果对标一律看参考站」冲突
      → 属他的决策，**我不擅自调**（HANDOFF 待拍板 ⑪）。
    - 📌 同批另两处量到、**不修**的：`.counter-tag` 用 `--btn-content #008760` 落在浅绿 chip 上 = **3.94**（对白底 4.53 是过的）；
      暗色 `--primary #0dcaa9` 对白底 **2.09**（深底 `--deep-text` 上没问题）。都是"主色当小字色"这一族的实例，
      改不改跟 ⑪ 一起决定，别单独动某一处造成不一致。
    - ⚠️ **本轮还顺带确认两件"不用查"的**：① 传输层没问题 —— `curl` 存**原始字节**验 gzip 魔数（⚠️ `fetch` 会自动解压，
      字节数骗人），HTML 实传 19–26%、CSS 18%，客户端不声明 `Accept-Encoding` 时正确回未压缩；
      ② 文章页 JS 219.8KB 里 **180.2KB 是 twikoo**（无 `defer` 属九·补②已判定项）。

58. ✅ **⑩/⑪ 已按参考站取值落地（V0.1.55）：14 个未定义变量全部补齐 + 主色压深到过 AA**（2026-10-18）
     - **前置：先把"参考站到底定义了什么"抠出来**，别凭猜。`curl https://firefly.cuteleaf.cn/` → 取 3 个
       `/_astro/*.css`（**239,078 B**，比上一版记的 239,084 少 6 B：站点自己也在改）→ 对每个变量数「定义/引用」：
       | 变量 | 参考站取值（编译产物原文） | 本站原状 |
       |---|---|---|
       | `--enter-btn-bg` / `-hover` / `-active` | `var(--btn-regular-bg)` / `…-hover` / `…-active` | 未定义 → **3 处底色全透明** |
       | `--meta-divider` | 亮 `rgba(0,0,0,.2)` / 暗 `rgba(255,255,255,.2)` | 未定义 → 分隔符无颜色 |
       | `--card-bg-transparent` | `var(--card-bg)`（另两条 `rgb(255 255 255 / var(--card-transparent-opacity,.6))` 是壁纸模式覆盖） | 未定义 |
       | `--panel-border-color` | **参考站也没有**（0 定义 0 引用）→ 本站 `MobileMenu.astro:68` 的 `border:` 整条失效 | 未定义 → 移动菜单无边框 |
       | `--admonitions-color-*`（5 个） | `oklch(.7 .14 180/250/310/60)`、`oklch(.6 .2 25)`（暗色各 +0.05 L） | 未定义 → `:::` callout 无配色 |
     - **`--panel-border-color` 是唯一"参考站也没有"的**：不能照抄 → 按**本站自己的同族变量**给
       `var(--line-divider)`（桌面下拉 `DropdownMenu.astro:78` 用的就是它 + `--panel-bg`/`--panel-shadow` 那一套面板配方）。
       这样移动菜单与桌面下拉面板**看起来是同一个东西**，而不是凭空造一个新浅色。
     - **`--radius-large` 仍然刻意不补**（参考站 `:root{--radius-large: 1rem}`）：本站「面板一律直角」是明写规则（五-16③），
       补上会同时给 about / guestbook / gallery[album] 等 6 处加圆角 = 推翻既定设计。
       ⚠️ 所以 `docs:check` 的那条"未定义变量"扫描里 `--radius-large` **属于预期项**，别当新缺口。
     - **⑪ 主色：改了，但方法不同于"照参考站抄"**。参考站 `--primary: oklch(.7 .14 var(--hue))`（hue=165）→
       `rgb(34,185,136)` = 对白底 **2.51**，和我们的 `#00ba99`（2.48）**是同一个绿**。既然两者都不过 AA（4.5），
       继续跟随就等于继续不合格 → 决定**保色相、压亮度**：`#00ba99` 的 HSL 是 `hsl(169,100%,36%)`，
       取同色相同饱和的 **L22%** = `#00705c`。
       | 指标 | 旧 `#00ba99` | 新 `#00705c` |
       |---|---|---|
       | 对白底 `--card-bg` | 2.48 | **6.05** |
       | 对页面底 `--page-bg #e9f1ed` | 2.15 | **5.26** |
       | 对 `--btn-regular-bg #e0f4ea` | 2.16 | **5.27** |
       | 对 `--btn-regular-bg-hover #c0e9d6` | 1.87 | **4.57** |
       | 白字压在**主色当背景**上 | 2.48 | **6.05** |
       ⚠️ 最后一列很重要：`--primary` 同时被当**背景**用（28 处 `bg-(--primary)`，配 `text-white`）→
       调深它同时修好了"白字压在品牌绿上"这一类的所有位置，**不是只修文字色**。
       同时把 `--btn-content` 从 `#008760`（对 chip 3.95）压到 `#007a5c`（4.65）、
       `--title-active` 从 `#3a9371` 改成 `#005e4d`（**它只用在 `:active`**，不改会比 hover 还亮、按下"跳一下发亮"）。
       **暗色不动**：`#0dcaa9` 在深底上是 8.06 / 5.75，本来就过。
       → 回退路径：`global.css` 把 `--primary` 换回 `#00ba99`、`--btn-content` 换回 `#008760`、
         `--title-active` 换回 `#3a9371`，并删掉两处 `--primary-hover`。**四处要一起改**，单改一处会花。
     - 🔴 **验证方法（两层，缺一不可）**：
       ① **构建产物层**：断言的是**压缩后的真实形态** —— `--meta-divider` 会变成 **`#0003`/`#fff3`**、
          `oklch(0.7 …)` 变成 **`oklch(70% …)`**。照源码写法写断言的**一定 FAIL**（我第一次就写成 `rgba(0,0,0,.2)` → 假失败）。
          成对写：新形态必须在（12 条 `need`）**且**旧值必须不在（`--primary:#00ba99` 等 3 条 `ban`）。
       ② **浏览器层**：`getComputedStyle` 读到的 `--primary` 仍是声明字面量，**要再经 canvas 转一次**才是真渲染色
          （见 B-30）。实测 `#00705c → rgb(0,112,92)`，且逐项量到：enter-btn 三态
          `rgb(224,244,234) / rgb(192,233,214) / rgb(156,223,193)`、标签分隔符亮 `rgba(0,0,0,0.2)` 暗 `rgba(255,255,255,0.2)`、
          移动菜单边框 `1px solid rgba(0,0,0,0.08)`、表格圆角仍 **0px**（直角口径没被破）。
          **序号块 10 个 / 24×24 / 底色有值** —— 这条是"确实多出了可见元素"的直接证据。
       ⚠️ 别用"造一个假元素 + 加 class"去测 `:hover`/`:active`（JS 触发不了伪类）：
       正确做法是**读 `--enter-btn-bg-hover` 的解析值再用 canvas 转 sRGB**，等价且可复现。
     - **尺寸基线**：V0.1.54 = 22,746,382 → **V0.1.55 = 22,745,787**（-595 B），360 文件 / 44 `index.html` /
       `404.html` 133,336 B 全不变；`Layout.*.css` 186,195 B（文件名哈希随之变）。
       部署断言 12 条 `need` + 3 条 `ban` + 文件数/字节数/rel 成对守卫**全过**，线上 360/360 md5 逐字节相同。
     - 📌 **顺带修掉一条真拼写错**：`Markdown.astro` 的 `propse-base` → **`prose-base`**（`propse` 在 Tailwind 里不存在，
       一直空转）。⚠️ 两者视觉等价（`prose-base` 就是 prose 的默认字号/行高），**属"把意图写对"不是换样式**。
       修正后产物 `prose-base` **30 处 / `propse-base` 0 处**（45 个 html 里 30 个有正文）。
       ⚠️ 我第一版把说明写成 **HTML 注释** → Astro 原样发给访客（产物里多 30 条注释）→ 改放 frontmatter 的 `//` 注释。
       **通则：给源码留解释不要用 HTML 注释**，`<!-- -->` 在 `.astro` 里是产出物的一部分。

59. ✅ **sitemap 补 `<lastmod>` + 站内静态图补 `width/height`（V0.1.56）**（2026-10-18）
    这两条此前都被记成"低优先观测，未修"，本批判定**该修**：前者是搜索引擎能不能判断更新的硬指标，
    后者有真实 CLS 收益（实测最大 36 倍改善）。
     - **A) sitemap 零 `<lastmod>`**
       - 根因：`@astrojs/sitemap` 只有在传统一 `lastmod` 选项、或在 `serialize` 里自己给值时才写 `<lastmod>`。
         我们两样都没给 → 44 条 URL **零 lastmod**。
       - 🔴 **不能用统一时间**：给所有页面盖同一个"今天"等于宣称"全站今天都改过"，比没有更糟（假信号）。
       - 🔴 **不能用 `serialize` 选项**：那个回调跑在 sitemap 集成内部，**拿不到 content collections**
         （`astro:content` 只在页面/端点渲染上下文可用）。→ 改用自建 integration 的 `astro:build:done` 后处理。
       - 实现：`src/plugins/integration-sitemap-lastmod.mjs`，按页面类型取真实来源
         —— 文章页取 frontmatter `updated ?? published`（直接用正则读 md 首部，本项目 28 篇全是单行 `key: value`）；
         列表/聚合页（`/`、`/2/`…、`/archive/`、`/categories/`、`/tags/`、`/series/`）取全站最新一篇的更新时间；
         相册页取该目录内最新文件 mtime；`/about/`、`/guestbook/`、`/dynamic/` **不写**（宁可没有也不造）。
       - 实测 **41/44** 条补上；没补的正是那三个静态页（about / dynamic / guestbook）= 符合设计。
       断言要成对：URL 数 **44** 且 lastmod 数 **41**，只断言后者在 sitemap 生成失败时会假通过。
       - ⚠️ **注册顺序有讲究**：`sitemapLastmod()` 必须排在 `sitemap()` **之后**，否则 `build:done` 里
         `sitemap-0.xml` 还没写出来。
     - **B) 88 个 `<img>` 缺 `width`/`height`**
       - 分四类（改前实测 90 处）：`public/images` 32、`/gallery/` 30、`/dynamic/` 客户端占位 16、**远程 http 12**。
       - 前两类走 `public/` 原样拷贝、不经 Astro 图片优化 → 构建期没有 `ImageMetadata`。
         新增 `src/utils/image-size.ts`：**零依赖**读文件头解析 webp（VP8/VP8L/VP8X 三种子格式）与 jpeg（扫 SOF 段）。
         🔴 **不 import `sharp`**：它是 astro 的**传递依赖**、`package.json` 没声明，直接 import 属隐式依赖
         （换台机器/升级 astro 就可能 ENOENT）。
         ✅ **已用 sharp 交叉验证 37/37 张零差异**（脚本跑完即删），解析器可信。
       - 接入四处：`rehype-figure.js`（Markdown 正文图，统一在这里补最省事）、`PhotoCard.astro`、
         `AlbumCard.astro`、`gallery/[album].astro`。⚠️ **解析不到就不写**，绝不猜数字 ——
         猜错会让浏览器按错误比例预留高度，**比不写更糟**。
       - **远程 12 处不改**：它们在文章的 CSS 演示框里（`.frame` 400×400、`img{width:100%;height:100%}`），
         尺寸由 CSS 约束死，补属性对 CLS 零收益；且要改用户正文，风险不值得。
       - **实测收益（layout-shift 真实测量，390×844，滚到底）**：
         | 页面 | 改前 CLS | 改后 CLS |
         |---|---|---|
         | `/gallery/zhuhai-2026/` | **0.076** | **0.0029**（线上复测 0.0021） |
         | `/gallery/` | 0.0055 | 0.0029 |
         | `/posts/ccnewtools-manual/` | 0.0014 | 0.0014（那 12 处远程图本就不产生位移） |
       - 🔴 **判据是宽高比，不是像素相等**：Astro `<Image>` 产出的图 `width/height` 记的是**原图比例**，
         而 `naturalWidth` 是浏览器选中的那个 srcset 候选（如 attr `400x300` / natural `320x240`）。
         用"像素全等"当判据会得出一堆假不符 —— 实测 7 个采样点**比例偏差全部 ≤0.06%**，无一产生 CLS。
     - **C) 顺带清掉两条死物**
       - `focus-ring-inset`：`DropdownMenu.astro` 挂了它，但**全站 CSS 从未定义** → 一直空转。
         删除的同时补 `.dropdown-item:focus-visible` 与 hover 同观感（否则键盘 Tab 只有浏览器默认轮廓）。
         实测聚焦后 `bg=rgb(222,244,237) / color=rgb(0,112,92)`，与 hover 一致。
       - `tsconfig.json` 的 `"jsx": "react-jsx"` + `"jsxImportSource": "react"`：项目零 React，删掉后
         `tsc --noEmit` 仍退出码 0、`astro check` 仍 0 error/3 hint。
     - **D) 依赖保守升级（这批唯一"缩水"的决定）**
       - 行为：`npm update --package-lock-only` → `npm ci` → `npm run build`（照第九节纪律，只装一次）。
       - 升上去的：`@astrojs/mdx 8.0.2→8.1.0`、`@astrojs/svelte 9.0.1→9.1.0`、`svelte 5.57.1→5.57.2`、
         `katex 0.18.7→0.18.11`、`sanitize-html 2.17.7→2.18.1`、`markdown-it 15.0.2→15.0.3`、
         `prettier 3.9.9→3.9.10` 等。`mermaid 11.17.2` / `typescript 6.0.3` 按天花板**没动**。
       - 🔴 **`astro` 钉在 `7.3.5`，故意不升**。二分实测（每次 `npm ci` 干净装 + 全量 build）：
         | astro | 产物文件数 | `_astro` 下 css | 结论 |
         |---|---|---|---|
         | 7.3.4（原） | 360 | 3 | 基线 |
         | **7.3.5** | **360** | **3** | ✅ 取这个 |
         | 7.3.6 | **361** | **4** | ❌ 多写一个死文件 |
         | 7.3.7 / 7.3.8 / 7.4.0 | 361 | 4 | ❌ 同样多 |
         多的那个是 **`_astro/Search.*.css`（442 B，零引用死文件）**：全 dist 搜引用数 **0**，
         页面里也没有它的 `<link>`，而**同样的三条规则已经在 `Layout.*.css` 里**（逐条核过，缺 0 条）。
         ⚠️ **别被"文件数多一个"骗过去**：它不是功能丢失，是重复产物；但会污染构建基线
         （所有"360 文件"类断言全要改），所以钉住 7.3.5 更划算。
         ✅ **对照实验排除过两个错误归因**：`@astrojs/svelte` 9.0.1 与 9.1.0 **都**会产出它
         （不是 svelte 集成的锅）；`astro@7.3.4` 单独装**不**产出（不是 mdx 8.1.0 的锅）。
       - ⚠️ **`npm update --package-lock-only` 会打印 `up to date`**，看着像"什么都没升"。
         **别信那行**，直接查 lock 里的 `"version"` 字段核对（实测 astro/mdx/svelte 全都升了）。
       - 漏洞：官方源 `npm audit` **21 条（5 low / 15 moderate / 1 high）**，比 10-18 上午的 23 条**少 2**。
         唯一 high 是 `stylus → glob@10.4.5` 的 **CLI 命令注入**（`glob -c/--cmd` 走 `shell:true`）——
         本项目只经 stylus 在构建期调用 glob、**不走命令行、不进 dist**，不可利用；修它要升 stylus 大版本，
         已判**不动**。`audit fix --force` 依然禁用。
     - **E) 一个必须记住的探针陷阱**：**不要用"自己 createElement 造的 div"去量 Svelte 组件样式**。
       Svelte scoped CSS 的规则是 `.search-panel.svelte-1n2o1uz{…}`，手造的元素没有那个作用域类
       → 规则一条都匹配不上 → 量出"底色透明、无边框、无毛玻璃"，**看起来像样式全丢了**。
       我据此一度误判"删掉的 Search.css 是唯一样式来源"。**正确做法：先真的把面板打开，
       量页面上那个真实岛元素**（实测亮 `rgba(255,255,255,0.55)`、`border 1px`、`blur(20px) saturate(1.5)`，
       与线上旧版逐项相同）。这是 B-1「0 命中先怀疑探针」在本项目的又一实例。

60. ⚡ **性能优化（V0.1.57）：把「每页都付的固定成本」从首屏摘掉**（2026-10-18）
    方法是先量再改：用 `PerformanceResourceTiming` 按页统计**真实传输字节**，而不是看 `du`。
    实测出的三条「固定成本」里，两条是真浪费，一条是设计如此。
    - **① twikoo 评论资源：每篇白付 228KB 且阻塞渲染**（本批最大的一笔）
      - 现场：`Twikoo.astro` 原来写死 `<script is:inline src="twikoo.nocss.js">`（**181KB**）+
        两条 `<link rel=stylesheet>`（`twikoo.css` **38KB** + `twikoo-custom.css` **9KB**）。
        这些都在**首屏之外**（评论区在长文最底部），却是同步阻塞资源。
        实测文章页 JS **261KB** 里有 181KB 是它，`load` 事件被拖住。
      - 修法：改成 **IntersectionObserver 懒加载** —— `#tcomment` 进入视口前 400px 时才插三条资源。
        资源只插一次（`window.__twikooAssets` / `__twikooLoading` 两个标志去重，因为脚本在容器内、软导航会重新求值）。
        保留 `reinitOnce("twikoo-lazy", arm)` + `onReinit("twikoo", arm)` 两条既有纪律（第十节 14），
        `arm()` 里判断"资源已在内存就直接 init"，否则重新挂观察。
      - ⚠️ **不许改成给 `<script>` 加 `loading="lazy"`**：那不是标准写法。必须真的等到需要时才 append。
      - ✅ **验证判据必须逐项对齐改前**（否则懒加载"成功"了但评论区没渲染也算通过）：
        改前基线 `.tk-comments` / `.tk-submit` / 输入框全在、**`#twikoo` innerHTML 长度 = 13828**；
        改后滚到评论区：同样三项 + **innerHTML 长度仍是 13828** + `.el-button` 背景色一致（`oklch(0.94865 …)`）。
        软导航进另一篇后再滚下去，`innerLen` 仍 13828。pageerror 全程 0。
      - 🔴 **探针陷阱（这次又踩了一遍）**：`scrollTo` 一次跳到底会让 IntersectionObserver 只看到
        "已经滚过头"的最终态 → 测出假的"没加载"。必须**像真人一样逐步滚**（每步 `requestAnimationFrame` + 小延迟），
        或者直接 `el.scrollIntoView({block:"center"})` 再等。我第一次就是一口气滚到底，差点误判成"懒加载坏了"。
    - **② 微信二维码：45 页 × 2 处 = 90 次白下 63KB**
      - 现场：`meCard.astro` 在 `Layout.astro` 挂了**两处**（左栏 + 移动端底部），
        图是 `src` 直接写死；而它所在的 `.me-qr-pop` 是 `visibility:hidden` 的浮层（`mainSingles.css:240`）。
        给 `visibility:hidden` 里的图加 `loading="lazy"` **没用** —— 浏览器仍判定它接近视口。
      - 修法：SSR 只输出 `data-src`，`setOpen(true)` 时第一次赋值给 `src`。**保留 `width/height`（750×750 真值）**占位。
      - 实测：点开前 **0 个二维码请求**、`naturalWidth=0`；点开后 **1 个请求**、`naturalWidth=750`、
        浮层盒子 **192×192**、`aria-expanded` 开→关→开→关 两轮全正常、Escape 也能关、pageerror 0。
      - ⚠️ **本批唯一"量了但决定不做"的**：二维码原图 750×750 / 63KB，显示尺寸只有 192px，
        按 2x 屏只需 384px（实测 384px q88 = 25KB）。**但本机没有任何二维码解码器**
        （无 `jsqr`/`zbarimg`/`pyzbar`），无法证明缩小后还能扫出来 —— 二维码是**扫码入口**，
        不能拿可用性赌体积，故**保持原图**。要压这张图，先装个解码器验证通过再说。
    - **③ 横幅壁纸 328KB + 轮播第二张 250KB：设计如此，不改**
      - 首张壁纸 `loading="eager" fetchpriority="high"` 是对的（LCP 元素就是它）。
      - 但横幅是**随机 3 选 1**（`backgroundWallpaper.carousel`），所以实际会加载 1~2 张。
        这是"随机图"的必然代价，不是 bug。想省只能砍轮播张数或降 quality，属视觉决策，不在本批范围。
    - **④ `preconnect` / `dns-prefetch`：本站加了等于没加，故不加**
      - 全站图片、JS、CSS **全部同源**（单一 IP、无 CDN、无第三方域名依赖），
        `preconnect` 没有对象可连。Ponytail 的原则是这个：**不写起不到作用的代码**。
    - **⑤ 顺带修 code review 抓到的一条真缺陷**：`src/utils/image-size.ts` 里
      `openSync` / `readSync` / `closeSync` 三件套**没有 try/finally 保护** —— `readSync` 抛错时
      `closeSync` 被跳过，泄漏一个 fd。按 Ponytail 的"能不写就不写"直接换成 `readFileSync`：
      **少两个 API 调用、内生关闭语义、无生命周期问题**（37 张图合计约 4MB，构建期一次且有缓存，代价可忽略）。
    - **📊 前后对照（同一台机、同一断点、真实传输字节）**
      | 页面 | 改前总计 | 改后总计 | 改前 JS | 改后 JS |
      |---|---|---|---|---|
      | 移动 390 首页 | 573 KB | **317 KB（-45%）** | 39 KB | 39 KB |
      | 移动 390 文章页 | 1124 KB | **767 KB（-32%）** | **261 KB** | **80 KB（-69%）** |
      | 桌面 1440 首页 | 573 KB | **509 KB（-11%）** | 39 KB | 39 KB |
      线上复测与本地**逐项相同**（360/360 文件 md5 逐字节一致）。
    - ⚠️ **`npm run build` 的耗时不能当性能判据**（同晚实测 5.4s / 20.4s / 22.2s 三档，与改动无关）。
    - 🔴 **又一次 HTML 注释泄漏**：我把懒加载说明写在 `.astro` 的 `<!-- -->` 里 → Astro 原样发给访客，
      导致 `twikoo.nocss.js` 每篇出现 **2 次**而不是 1 次（部署断言当场拦下）。
      这已经是**同一个错误第二次**（五-58 末段记过）。**通则：给 `.astro` 留解释只写 frontmatter 的 `//`，
      永远不要用 HTML 注释**。
    - 📌 **断言口径要连着业务事实写**：`twikoo.nocss.js` 全站是 **29** 次不是 28 ——
      **28 篇文章 + `/guestbook/` 留言板**（它本来就该有评论区）。我第一版按 28 写，被断言拦下，
      改的是**断言**而不是代码（先查清为什么是 29 才改，没有直接把数字调大蒙过去）。

61. 🖼️ **封面加载失败：补上可见文案，并修正"本地图没有回退图"（V0.1.58）**（2026-10-18）
    这条**不是加新功能，是把两个"规则写好了但没接上"的空转变活的**。
    - **① `.error-message` 的显示规则一直都在，但元素从来没渲染过**
      `mainSingles.css` 早就写着 `.cover-image-container[data-error="true"] .error-message { display: flex }`，
      而 `CoverImage.astro` **从来没有输出过 `.error-message` 这个 div** → 那条规则一直是空转，
      访客看到的就是"图没了，什么都不显示"。
      修法：组件里补一个 `.error-message`（默认 `hidden`，靠 `[data-error=true]` 翻成 flex），
      文案「封面加载失败」，中性灰底 `bg-black/55` + 白字 + `role="status"`，绝对定位在底部，不挡图。
    - **② `data-error` 以前只给远程图设**（`if (img.dataset.remote !== "true") return`）
      本站封面**全是本地图** → 本地封面加载失败时既不显示回退图、也没有任何提示。
      现在所有图出错都设 `data-error`，由它驱动三件事：藏 spinner / 显示文案 / 有回退图就显示回退图。
    - **③ 真正让"回退图"生效的那一行：`if (fallbackPath && !isLocal && !isFallbackPublic)`**
      这个条件要求 `!isLocal` —— **本地图永远进不去** → `fallbackImg` 恒为 null，
      `siteConfig.fallbackPath`（`assets/postImages/loadingfalse.png`）**配了但从未对本地图生效**。
      去掉 `!isLocal` 后：产物里 `fallback-image` 元素从 **0 → 28**、
      `_astro/loadingfalse*` 产物从 **0 → 5 个尺寸变体**（文件总数 360 → 364）。
      ⚠️ **看到文件数变多别慌**：多的 4 个就是回退图的不同尺寸，属预期。基线已更新为 **364 文件**。
    - **④ 坏图要藏掉，否则破图图标与文案叠在一起**
      原先只有 `img[data-remote="true"] { display:none }`，本地图没有这个属性 →
      加载失败后浏览器会在原地画一个破图图标（**截图实测能看到**，在文案右下角）。
      ⚠️ **主图是 `<Picture>` 产出的 `<picture><img data-cover-img></picture>`，
      不是容器的直接子节点** → 用 `> img` 选不中，必须按 `img[data-cover-img]` 属性匹配。
      回退图那张 img **没有** `data-cover-img`，不会被误伤（实测断图后它照常显示）。
    - **验证方法（关键：不能靠 CSS 权重推算，必须真断图）**
      用 `context.route()` 把 `/_astro/*.{webp,jpg,png,avif}` **真的打 404**，而不是改 DOM 骗自己。
      ⚠️ 但**第一版探针把回退图也一起打死了** → `fallbackImgNatural` 全是 `0x0`，
      看着像"回退图没显示"，其实是我自己拦的。**正确做法：按文件名放过 `loadingfalse*`**，
      只打死原始封面。改对之后实测：
      | 状态 | data-error | 回退图 | 文案 | 原图 | 回退图像素 |
      |---|---|---|---|---|---|
      | 正常（10 张） | 0 个 true | 0 显示 | **0 显示** | 正常 | — |
      | 断图后 | true | `display:block` | `flex` | `none` | **320×240（有真实像素）** |
      软导航回首页后断图同样 10/10 正确；pageerror 全程 **0**。
    - 🔴 **同一个错我犯了第三次：HTML 注释泄漏进产物**
      LQIP 那段说明我写在 `.astro` 的 `<!-- -->` 里 → Astro 原样发给访客，
      产物里出现 `五-61` 字样。部署断言里现在加了硬守卫：
      **`grep -rFo '五-61' dist --include='*.html'` 必须为 0**。
      📌 三次都栽在同一处，说明"少写注释"不够，得**默认不写 HTML 注释**：
      要解释就写 frontmatter 的 `//`，模板里一个字都别留。

---

### 五-62 相册缩略图（2026-10-19，V0.1.59）

**问题**：相册图走 `public/` 原样拷贝、不经 Astro 图片优化 → 浏览器只能整张下载原图。
实测超供倍数（`naturalWidth` vs 显示宽度）：

| 位置 | 显示宽度 | 实际下发 | 超供 |
|---|---|---|---|
| 相册页瀑布流（桌面 1440） | 247px | 1600px | **6.5 倍** |
| 相册页瀑布流（手机 390） | 156px | 1080px | **6.9 倍** |
| 相册列表卡封面（桌面 1440） | 237px | 1600px | **6.8 倍** |

`/gallery/` 一次加载 **1036KB** 图片、`yuanmingyuan` 相册页 **1800KB**。

**做法**：`scripts/generate-thumbs.mjs`（`npm run thumbs`）→ 每张图生成 `640` / `960` 两档 webp（q78），
输出到 `public/gallery/<相册>/thumbs/<原名>-<宽>.webp`。**原图一张不动**，灯箱（`data-src`）仍指原图。

🔴 **放子目录是硬要求**：`scanAlbumPhotos()` 只 `readdirSync` 一层、按扩展名过滤，
`thumbs` 这个目录名不匹配图片正则 → 天然不会被当成照片。
同时它在 `/gallery/` 路径下 → 直接吃现成的「相册图片 7 天缓存」（实测 `max-age=604800`）。

**三个自己引入、当场修掉的回归**：

1. 🔴 **横幅被挂上 srcset 会变糊**：第一版给相册页**横幅**也配了 `sizes="960px"`，
   而横幅 1440 屏实测宽 **1507px** → 浏览器只会挑 960w。横幅必须固定用原图。
2. 🔴 **只给 2 张图的相册反而变差**：改造前「横幅 + 网格首图」是**同一个 URL**（共享缓存，共 762KB）；
   改造后横幅原图 447KB + 首图缩略图 197KB = **766KB（多 4KB）**。
   → `PhotoCard` 加 `preferOriginal`，相册页对「就是封面那张」传 true → 复用横幅已下载的原图，**额外 0 字节**。
3. 🔴 **`width`/`sizes`/`srcset` 三个数字必须自洽**：`width="1440"` + `sizes="320px"` + srcset `640w/960w`
   互相矛盾时，Chromium 把 `naturalWidth` 报成**第三个数字 320**（既不是文件的 640，也不是属性的 1440）。
   观感不坏（CSS `w-full` 定宽）但属性与事实不符、后续按 `naturalWidth` 做的判断全错。
   → `width/height` 写**实际下发那一档**（等比缩放，比例不变）。

**`sizes` 要分段写**：`(min-width: 640px) 320px, 50vw`。写死 `320px` 会让手机两列（156px）也按 320 挑档，
DPR2 下需要 312px、刚好卡在 640/960 之间选 640，白付一倍体积（实测 `zhuhai` DPR3 从 257KB 降到 216KB）。

**效果（线上真实 `transferSize`）**：

| 页面 | 改前 | 改后 |
|---|---|---|
| `/gallery/` | 1036KB | **444KB（-57%）** |
| `pujiangyintaoshan-2026` | 762KB | **569KB** |
| `zhuhai-2026` | 440KB | **198KB** |
| `yuanmingyuan-2022` | 1800KB | **1012KB** |

**验证判据**：36 组（3 页 × DPR1/2/3 × 390/1440/1920）全部通过 ——
判据是「选中文件的**真实像素宽** ≥ 显示宽 × DPR」，**不是**看 `naturalWidth`
（`naturalWidth` 返回 CSS 像素 = 文件宽 / DPR，拿它直接比设备像素会全判失败，我第一版就错在这里）。

**代价（明确记账）**：`dist/gallery` 从 4.4MB 涨到 **8.1MB**（多存 37 张缩略图，仓库与服务器都涨）。
完全回退 = 删 `thumbs/` 目录 + 不跑脚本（代码会自动退回原图，`getGalleryDisplaySrc` 负责兜底）。

⚠️ **原图比目标档还窄时不要删那一档**：`yuanmingyuan` 有 3 张原图本身就是 960px 宽，
`withoutEnlargement` 会产出同宽文件、q78 重编码后**比原图还胖**（152KB → 163KB）→ 删掉是对的。
但**不能因为「原图宽 == 该档宽」就删** —— srcset 少了那一档会让 DPR3 退到 640w，白白降清晰度。
---

### 五-63 首页横幅「玻璃药丸」社交按钮（2026-10-19，V0.1.60）

照参考站 `firefly.cuteleaf.cn` 的 `.banner-links` / `.banner-link` 1:1 抄，数值取自它编译产物
`/_astro/_..B1ALX-2b.css`：

| 属性 | 值 |
|---|---|
| 尺寸 | `2.75rem × 2.75rem`（带文字的 GitHub 那枚 `width:auto; padding:0 1rem`） |
| 圆角 | `9999px`（全圆，本站唯一破「面板一律直角」的地方 —— 它是**圆形控件**不是面板） |
| 底色 | `rgba(255,255,255,0.14)` · hover `0.26` |
| 边框 | `1px solid rgba(255,255,255,0.18)` |
| 模糊 | `backdrop-filter: blur(8px)` |
| 文字/图标 | `rgba(255,255,255,0.92)` · hover `#fff` |
| 入场 | `banner-fadeInUp 0.3s ease-out 0.5s both`（比副标题晚 0.5s） |
| hover 位移 | `translateY(-2px) scale(1.05)` |

**四个按钮**：GitHub（带文字）· Email（`mailto:`）· 关于 · RSS。
第 3 个用「关于」替代参考站的「打赏」，因为本站没有 `/sponsor/` 页。

🔴 **只出现在首页**（含 `/2/` `/3/` 分页）。参考站的 `/archive/` `/about/` 里这排的 overlay 是
`display:none`（实测 0×0、`elementFromPoint` 命中不到）—— `Cover` 在所有页面都渲染，
光靠 `isPostPage` 只能排除文章页。所以 `Layout.astro` 加了 `isHomePage`（按 `Astro.url.pathname` 判），
非首页给 `hidden` 属性。

**踩到的两个坑（都实测过）**：

1. 🔴 **写 `-webkit-backdrop-filter` 会把标准属性挤掉**：两行都写时，Lightning CSS 按构建目标
   **只留 `-webkit-` 那条、删掉标准的**；而 Chromium 的 `CSS.supports("-webkit-backdrop-filter")` 返回 **false**、
   `getComputedStyle().backdropFilter` 读到 `"none"` → **玻璃模糊完全没生效**（截图看着"淡但不糊"，极易误判成已实现）。
   → **只写标准 `backdrop-filter`**，产物实测保留 `backdrop-filter:blur(8px)`。
   判据：`getComputedStyle(el).backdropFilter` 必须是 `blur(8px)`，**不能只看 bg/border 对不对**。
2. 🔴 **`grep -c "pointer-events-auto hidden"` 恒为 0**：`hidden={!isHomePage}` 渲染成 class **外面**的
   HTML 属性（`class="… pointer-events-auto" hidden>`），不是 class 里的一个词。断言要写成
   `grep -o '<div class="banner-links[^>]*>'` 再看标签尾部有没有 `hidden`。

⚠️ 图标只能用**项目自带**的 `src/icons/*.svg`（`github`/`about`/`rss` 都在）+ `material-symbols:mail`。
参考站用的 `fa7-brands:github` / `simple-icons` 本项目**根本没装**，照抄会把构建打挂（五-29）。

✅ 主动增强两条（参考站没有）：`:focus-visible` 白色 outline、`prefers-reduced-motion` 下只保留颜色反馈不位移。
