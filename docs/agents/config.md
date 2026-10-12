# AGENTS 分册 · 第五节「必须知道的配置约定」全文（五-1 ~ 五-42）

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

9. 构建产物基线（**2026-10-10 傍晚实测**，V0.1.36）：
   **43 个页面 / dist 357 个文件 / `du -sh` 22M**，
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
