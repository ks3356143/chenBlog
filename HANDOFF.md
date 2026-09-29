# HANDOFF — 会话交接

> **分工**：`AGENTS.md` 存长期不变的规则与事实；本文件存**会变的状态**与**下一步该做什么**。
> 本文件不重复 AGENTS.md 的内容，只引用。每次会话结束前必须更新本文件。
>
> 最后更新：**2026-09-29 午后（新增「动态（说说）」功能 `/dynamic/`，已全量验证；未提交、未部署）**

---

## 一、下次会话第一件事

### 🟠 手上有一批未提交的「动态」功能改动，等你看过再决定提交与上线

上午那批代码体检已交付上线（见下面第二笔 🔴）。**下午新加了 `/dynamic/` 动态页**，
共 **11 个文件**（6 新 + 5 改，明细见第二节），构建 41 页通过、浏览器五路验证通过，
但**还没提交、没推送、没部署**（按规矩每次都要你当次点头）。

**要你先确认的一件事**：`src/content/dynamic/` 下现在是 **3 条示例动态**（文件名带"【示例动态】"字样）。
请决定怎么处理：

- 你直接改成真实内容（一条一个 `.md`，写法见文件本身），或
- 我删掉示例、只留一个你自己的首条，或
- 先留着当回归测试数据

### ✅ 2026-09-29 上午：代码体检全部交付（已提交 `c925043 b55ee68 6fd44a7` + 已部署 + 公网实测通过）

代码体检的**所有待办都解决并上线了**。三笔提交 `c925043`（依赖 dayjs）/
`b55ee68`（代码清理 + 三处暗色失效修复）/ `6fd44a7`（文档），已推 `origin/main`；
按第六节流程原子替换线上 `dist`（备份 `dist_backup_20260929_102733`）。

**下次要做的只有两件**：

1. **请用户肉眼验收三处暗色改动**（脚本量到的值都对，但观感只有人能定）：
   切到暗色后看 `/posts/css100天-第10天/` ——
   悬浮目录底色应由白转深 `rgba(22,31,27,.6)`、右下角浮动按钮应有浅描边、侧栏目录滚动条应为浅色。
   ⚠️ **链接 hover 现在多了一条绿色虚下划线**（`--link-hover` 补值的结果，本批唯一非缺陷类视觉新增）。
   觉得多余就删 `src/styles/markdown.css` 那一条 `border-bottom` 再走一次第六节即可回到旧观感。
2. 若线上稳定几天，**用户明确同意后**可清理服务器回滚资产（现状见第三节，**我不会自己删**）。

### 🟠 更早悬着的事（需用户点头）

1. **about 页对外邮箱**：已统一到 `314298729@qq.com`；若 `xiaye@msn.com` 才是收件地址，显示文本也要一起换。

### 🟡 AGENTS 第九节的存量待办

- 3 个文章方向等用户拍板（URL 用不用中文 / 要不要配封面 / 要不要文章脚手架）——后两条已同步进 `README.md` 的「后续计划」
- 宝塔面板密码曾在对话中明文出现过，用户选择暂不改；面板 IP 白名单未开
- Mermaid 专属的 2 个未定义变量（`--text-color-secondary` / `--primary-hover`）**故意留白**：
  零页面可达、无从验证。等首篇 Mermaid 文章时按第八节在 dev 逐项验，届时一并定值。

---

## 二、历次会话做了什么

### 2026-09-29 午后：新增「动态（说说）」功能 `/dynamic/`（**未提交、未部署**）

用户先说"参考站有个动态"，我误按樱花飘落去扒（选项里他选了"樱花"后立刻纠正为「动态」页）。
定位到参考站的 `/dynamic/` 是**说说流**，于是按 AGENTS 第一节先扒实现再动手：
sparse clone Firefly 源码 + 抓它的 `/api/dynamic.json`，摸清架构 = **构建期把内容集合渲染成静态 JSON，
页面只 SSR 骨架，客户端取数后克隆 `<template>` 填占位**（这样条目能用 astro-icon 与构建期图片优化）。

**决策由用户拍板**：数据源用本地 markdown（不上 Memos）；第一版只做核心（页+数据+列表），
**不做**搜索/年份筛选/侧栏组件/图片画廊；保留 `location` 字段手写地点。
设计在开工前于对话里呈现并获批准（brainstorming 的 Bounded 路径）。

⚠️ **入口位置改过一次**：我按批准的设计先放进「文章」子菜单，用户看过后否掉，
改为**顶级菜单项**（顺序：主页 / 文章▾ / 动态 / 留言 / 相册 / 关于）。
改完实测 1024/1100/1280/1440 四个断点导航**均 0 横向溢出**（6 个顶级项放得下），
并用真实 DOM 断言确认 `a[href="/dynamic/"]` 是导航容器的直接子元素、下拉里只剩 归档/分类/标签/系列。

**新增 6**：`src/content/dynamic/*.md`（3 条示例）、`src/utils/dynamic-utils.ts`、
`src/pages/api/dynamic.json.ts`、`src/pages/dynamic/index.astro`、
`src/components/pages/dynamic/DynamicItemTemplate.astro`、`DynamicFeed.svelte`。
**改 5**：`content.config.ts`（加集合，schema 只 `published`/`pinned`/`location`）、
`siteConfig.ts`（`pages.dynamic` 开关 + 新增 `timezone`）、`navBarConfig.ts`、
`mainSingles.css`（`.dynamic-*`）、`date-utils.ts`（格式化函数加可选第 3 参 `timeZone`，默认行为不变、文章不受影响）。

**过程中修掉的一个真 bug**：`published: 2026-09-29 10:15:00` 被 Astro 的 YAML 加载器**按 UTC 解析**，
浏览器按 +8 格式化 → 显示成 `18:15`。Node 的 `new Date()` 却按本地解析，所以本地手算看不出来。
→ 改成显式偏移 `2026-09-29T10:15:00+08:00` + 展示端钉住 `siteConfig.timezone`。
**文章的 `published` 只写日期，所以这个坑一直没暴露**；哪天写 `2026-06-22 20:00` 日期就会跳到次日。详见 AGENTS 五-23。

**主动规避的两个已知坑**：① 条目样式放 `mainSingles.css` 而非组件 scoped（Swup 不换 head + 克隆节点套不到 cid）；
② `.dynamic-pinned`/`.dynamic-location` 用了 `display:flex`，所以在 CSS 末尾补了 `[hidden]{display:none}`
—— 不补的话 `hidden` 属性会被压掉、置顶和定位标记永远显示（AGENTS 五-20 那类事故的又一实例）。

**验证（五路全过）**：构建 41 页 / 311 文件 / `_astro` 191，`dist/api/dynamic.json` 三条且置顶排第一；
h1 审计 **41 页 0 问题**；导航桌面+移动两处都有 `/dynamic/` 入口；浏览器实测
时间 = 作者写的时刻、`pinned` 只在第 1 条显示、`location` 只在第 2 条显示、亮 `#fff`/暗 `#161f1b` 双态正确、`radius 0px`；
临时把每页改成 2 条**真跑了分页**（2 → 点"加载更多" → 3、按钮自动消失）后改回 10；
375px iframe 下 **0 横向溢出**；**从首页软导航进来**样式与交互都正常。

**顺带得到一条新认知**（AGENTS 十-10）：`client:load` 岛放在 Swup 容器内是可用的，
包括容器 innerHTML 被整体替换后仍能重新水合——此前全站唯一的岛在容器外，这属未知领域，我用一次性探针页实测确认。
探针文件已删。实验中还踩到"连续两次 Swup 导航会卡死"，那是隐藏标签页的动画假象（AGENTS 十-1 的老症状），不是缺陷。

### 2026-09-29：代码体检 + MD 去重（已提交 `c925043 b55ee68 6fd44a7`，已部署上线）

**清点临时产物**：仓库内无游离脚本（`scripts/` 只有 `generate-icons.mjs` 这个正经脚本）、
无未跟踪文件、本地与服务器 `/tmp` 无本次产物。本地 `/tmp/LibScanGame/` 是**别的项目**的目录，没碰。

**清掉的代码卫生问题**（五类逐条核过，不是照抄工具报告）：
- **14 个文件**里的 `const DES` / `const COMPDES`：只声明从未读取的死变量，全量转成 frontmatter `//` 注释
  （保留作者自述、去掉死绑定）。改后 `git diff --numstat` = 14 文件 / 14 增 / 14 删，行尾零污染。
- `MobileMenu.astro` 的非法 `transform: translateY();`（空参数，浏览器整条丢弃）→ 删。
  真正的位移由下一行 `@apply translate-y-[-8px]` 提供，**属 no-op**。
- `Twikoo.astro` 3 条 `console.log`（其中一条打印含 envId 的配置）→ 删；顺带把因此变空的 `.then()` 摘掉。
  `console.error` 保留。`rehype-component-github-card.mjs` 注入到浏览器端的成功日志 → 删（`catch` 里的 `warn` 保留）。
- `Pagination.astro` 一句失真的 `// for test` → 删。

**唯一的行为改动**：`src/styles/main.css` 4 条 `.dark .custom-scrollbar*` → `[data-theme="dark"]`。
取证方式：dev 站点上切换 `data-theme` 读 `getComputedStyle().scrollbarColor`，
修前暗色仍是 `rgba(0,0,0,.2)`，修后 亮 `rgba(0,0,0,.2)` / 暗 `rgba(255,255,255,.2)` 对比成立；
dist 产物已确认输出 `[data-theme=dark] .custom-scrollbar{scrollbar-color:#fff3 transparent}`。

**两条 agent 报告是误报，核实后没改**（记下来免得下次又被捞出来）：
① `CoverImage.astro` 并没有 `import { Image }`，第 3 行只有 `Picture`，第 2 行注释里的 "ImageWrapper" 被当成了引用；
② `Category.astro` 的 `--collapsedHeight` 不是未定义变量，是 Astro `<style define:vars>` 注入的。

#### 🔴 本次最有价值的发现：Astro 内容层缓存藏在 `node_modules/.astro/`

删掉插件里的 `console.log` 后，`npm run build` **退出码 0、产物里那行还在**，
而且 `dist/about/index.html` 的 mtime 明确晚于源码修改时间。逐层排除：
停掉 dev 再建 → 仍在；`rm -rf .astro` → 仍在（那个目录只放类型和 collections）；
**`rm -f node_modules/.astro/data-store.json` → 立刻归零**（保留的 `console.warn` 仍 3 处，卡片没被我改坏）。

根因：内容层缓存按**内容文件哈希**失效，**插件源码变更不在它的失效范围里**。
该文件时间戳停在 **09-28 14:03**，意味着 **09-28 17:29 那次上线、以及今天所有构建，文章内容部分都在复用旧缓存**。
CSS/JS 走 Vite 不受影响，所以暗色滚动条那条是真的生效了。规则已写进 **AGENTS 第五节 21**。

顺带因此更正了两条过期事实（AGENTS 第八节）：
- `<github>` 卡片**不是**"配置了从没用过"—— `/about/` 上实渲染 3 张，那个插件是活代码；
- 代码块折叠也早已在生产（28+ 个产物含 `ec-collapse`），原清单把它和 Mermaid 并列是错的。

清缓存后的**全新全量构建**已复核：40 页 / 307 文件 / 28M、h1 审计 40 页 0 问题、
`/about/` 死链文本 0 命中、邮箱仍为 `314298729@qq.com`、Twikoo 日志 0 命中。
**所以现在的 `dist/` 是可信的，和 09-28 上线那版不是一回事。**

#### 第二轮：把 4 项遗留全部收口，过程中挖出两条**真实暗色缺陷**

- **`dayjs` 补为显式依赖**（`^1.11.23`）。查明它此前只由 `mermaid`（devDep）和 `sanitize-html→launder` 带进来。
  `lockfile` 只 +2/−1、无版本漂移；esbuild 仍是 `0.28.2`，与 `allowScripts` 钉版一致。
  ⚠️ **踩了一场大坑**：为了按 AGENTS 走"干净 `npm ci`"，在**没确认 dev 进程已退**的情况下执行 ——
  `npm ci` 先删 `node_modules`，然后 `lightningcss-win32-x64-msvc.node` 被进程锁住报 `EPERM`，**项目当场被删空**。
  真凶是 `TaskStop` 只杀外层 shell，`npm run dev → astro dev` 的子进程变孤儿继续活（同时留着 2 个 astro dev + 2 个 npm 包装）。
  按命令行精确匹配 `*chenBlog*` 逐个 `Stop-Process`（**没批量杀 node.exe**，Qoder 自己和一堆 MCP server 都是 node）后才恢复。
  先用增量 `npm install` 把项目救回来，再重试 `npm ci` → 退出码 0。
  另外：第一次 `npm ci | tail -20` 的"退出码 0"是 **tail 的**退出码，把 npm 的失败吞了 —— 已连同上面这些一起写进 AGENTS 第九节第 ③ 条。
- ✅ **真缺陷 1：暗色下悬浮目录是白色半透明板。** 根因不在那两条 `.dark` 规则，而在
  `FloatingToc.astro:38,42` 的**内联 `style=`** `rgba(var(--card-bg-rgb, 255,255,255), .6)` ——
  `--card-bg-rgb` 从未定义 → fallback 让它恒为白，且内联样式把 `dark:bg-black/60` 整个压掉。
  → 在 `global.css` 亮/暗两个主题块补 `--card-bg-rgb`（`255,255,255` / `22,31,27`，与 `--card-bg` 同色）。
  实测：暗色 `rgba(255,255,255,.6)` → `rgba(22,31,27,.6)`，**亮色零变化**，`blur(20px)` 不受影响（它来自组件另一条规则）。
  ⚠️ **我前一轮的判断是错的，这里明确纠正**：当时把这两条 `:global(.dark)` 判成"`dark:` 工具类已生效，属冗余副本"——
  实际上 `dark:` **从来没在这个元素上生效过**，那两条 `!important` 是作者为打穿内联样式写的（只是选择器写错）。
  错因是**只看 CSS 源码顺序就下结论**，而内联样式根本不在样式表里、`cssRules` 遍历搜不到。
- ✅ **真缺陷 2：暗色浮动按钮无描边。** `FloatingButton.astro` 写死 `border: 1px solid rgba(0,0,0,0.1)`，
  叠在 `#161f1b` 上≈隐形。改用全站其它卡片都在用的主题感知 `--line-divider` → 暗色出现浅描边。
  顺带删掉该组件那条永不生效的 `:global(.dark) .floating-btn` 块、以及引用未定义变量
  `--shadow-button`/`--shadow-button-dark` 的两条 `box-shadow`（按钮阴影一直由 `.card-base` 的 `shadow-xs` 提供，删掉零变化）；
  还清了一处重复声明的 `cursor: pointer`。
- ✅ `--shodow-md` → **`--panel-shadow`**（三处同步）。**没改成 `--shadow-md`**：Tailwind v4 的 `--shadow-md`
  是 utility 命名空间 token，覆盖它会连带改掉全站 `shadow-md` 的值（当前无人用，属潜伏坑）。
- ✅ `markdown.css` 链接的 `--link-underline` → `--primary` 是**等价替换、零视觉变化**（原来只是回落到 `currentColor`）；
  `--link-hover` → `--primary` 会让**链接 hover 首次出现绿色虚线**，这是本批唯一非缺陷类的视觉新增，已在第一节标出可一键回退。
- **剩余**：`markdown-extend.styl` 里 Mermaid 专属的 2 个未定义变量（零页面可达、无从验证）与
  `markdown.css:188` 的 `body.wallpaper-transparent` 整块（**全站无人设这个类**）—— 见 AGENTS 第九节第 6 条。
- **收尾复验**：清内容缓存全量构建 40 页 / 307 文件 / `_astro` 189，退出码 0；
  产物 `--shodow` 0 命中、`--card-bg-rgb` 两主题都在、`.dark` 只剩 `rehype-callouts` 自带那两条（非本项目源码）。

**MD 三件事**：
- **删矛盾**：AGENTS 第九节「已偿还」里有条 ⚠️ 说"语言徽章与行号从未渲染"这个缺陷"已归入已知缺陷"，
  而同节 09-28 的复核已经**证伪**了它 —— 两处对同一件事给了相反结论，删掉那条过期的。
- **去重**：AGENTS 五-16 与 十-2 都在讲"部分页面渲染的组件要把布局 CSS 放全局"，五-16 改为只引用第十节 2 + 保留本项目落点；
  "回滚资产有几个/多大"从 AGENTS（写的是过期的"共 52M"）移到本文件第三节，AGENTS 只留规则。
- **刷新**：AGENTS 第九节审计页数 38→**40**（09-28 加 `/series/` `/tags/` 后没跟着改）、
  五-9 基线 `_astro/` 187→**189**（本批改动产生的新 chunk）、日期；
  **`README.md` 重写** —— 它的「后续计划」第 1 条"考虑 swup 方案"早在 09-23 就上线了。
- 新增两条 AGENTS 长期规则：第七节的**批量改文件必须逐行保留原行尾**（本次踩过，见下）、
  组件自述用 `//` 注释不要写成 `const DES`。

⚠️ **本次踩的新坑（已固化为 AGENTS 第七节一条）**：本仓库 `core.autocrlf=true` 且无 `.gitattributes`，
但 **git 索引里的行尾本身是混杂的**（一部分 blob 存 CRLF、一部分存 LF，工作区全 CRLF）。
用 node 脚本批量改写时把 `\r\n` 写成 `\n` → 14 个文件各引入 1 处混合行尾；
接着想用脚本"归一化回 CRLF"反而把 **LF blob 的那些文件整文件翻转**（`[...slug].astro` 一度变成 50/50 行 diff）。
两次都是 `git checkout --` 回退、第三次改成**逐行捕获 `(\\r?\\n)` 原样写回**才干净。

### 2026-09-28 深夜（第二轮）：Pagefind 搜索 + 站点图标 + 下拉收起二次修（已上线）

先扒参考站实现（`pagefind ^1.5.2` + build 后跑索引 + `pagefind.yml`，UI 是 `controls/Search.svelte`，
PROD 下懒加载 `/pagefind/pagefind.js`、300ms 防抖、请求号防竞态），按同一套接进来：
`build` 改 `astro build && pagefind --site dist`，索引落 `dist/pagefind/`（随 dist 部署，服务器零改动）。
图标：`public/favicon.svg` 换成双木成林 mark（**两棵树**，绿底白描边），新增 `scripts/generate-icons.mjs` 出全套 PNG/ICO。
下拉第二轮修的是"`:focus-within` 把鼠标点击的聚焦也算进去"→ 换 `:has(.dropdown-item:focus-visible)` + `mouseleave` 收起。
**踩坑**：`import("/pagefind/pagefind.js")` 写字面量会被 Vite 在构建期当模块解析而失败 → 必须走变量 URL。
细节见 AGENTS 五-18、五-19。下班前又做了一笔**行为等价**的清理（删空的 `uiverse/`、防抖 `$effect` 改显式传参），
已提交推送 `52ac9a0`，**线上产物仍是 17:29 那版**，未为它单独部署。

### 2026-09-28 夜：顶部「文章」下拉 + `/series/` + `/tags/` + SeriesNav（已上线）

照 `firefly.cuteleaf.cn/series/` 做：先扒编译产物、再 sparse clone Firefly 读实现，确认它没有 `/series/<slug>/`
详情页，所以系列页做成单页手风琴。四个决策由用户拍板（下拉四项 / 新建 `/tags/` / 一起加 SeriesNav / 系列名用 `CSS100Day`）。
唯一一处**主动偏离参考站**：桌面下拉额外支持点击展开（触屏没 hover），已标在 AGENTS 五-16。
细节见 AGENTS 五-16、五-17。

### 2026-09-28：全站体检，4 条待办里 2 条是假的、5 处真问题已修（已上线）

两条"已知缺陷"被证伪（`heart.svg` 404、"代码块徽章与行号从未渲染"），真修掉 5 处：
about 死链、邮箱 mailto 与文本不一致、空 h1 兜底、`/about/` 重复 h1、区块标题 `h3`→`h2` + 分页去掉 `href="#"`。
当天用户授权后按第六节流程部署并从公网验收。**排查方法论**（按源码围栏逐行判定 + 逐路径核 dist）
已固化进 AGENTS 第九节，新规矩进五-13、五-14，具体修了什么不在这里复述。

### 2026-09-24 夜及更早（均已上线，细节在 AGENTS 第十节）

- 09-24 夜：过渡 1:1 照搬参考站 + 分类栏/归档/横幅/品牌标识 6 笔，验收通过（`4a97845`…`b713fbf`）。
- 09-23：依赖 patch 升级（audit 21→0）+ Swup 页面过渡首版 + 窗口缩放 morph。
- 09-24 白天：手机滑动重影修复（resize 只在宽度变化时 morph）+ 归档时间线移动端列宽。

---

## 三、当前状态快照（2026-09-29 实测）

| 项 | 状态 |
|---|---|
| 本地 HEAD | `d1f445b`（上午那批 4 笔已提交推送）。**工作区另有 11 个文件未提交** = 下午的「动态」功能（6 新 + 5 改）+ 本文件 |
| 与远端 | ahead 0 —— 动态这批**还没提交**，远端与线上都只到上午那批 |
| 线上站点 | 停在 **2026-09-29 10:27** 那次原子替换（= 上午的代码体检批）。**`/dynamic/` 尚未上线** |
| 依赖 | `dayjs@^1.11.23` 已进 `dependencies`；`package.json` +1、`package-lock.json` +2/−1，**无版本漂移**。已用**干净 `npm ci`（退出码 0）** + 全量构建验证。`allowScripts` 仍只钉 `esbuild@0.28.2`，与实际安装版本一致 ✅ |
| 本地构建 | 动态功能落地后清内容缓存全量重建：`npm run build` 退出码 0，**41 页 / dist 311 文件 / 28M**，`_astro/` 191、`pagefind/` 42（索引 28 页 / 2326 词）。⚠️ 页数基线已从 40 变 **41**（AGENTS 五-9 已同步） |
| 动态功能验证 | 五路全过：`dist/api/dynamic.json` 3 条且置顶第一 / h1 审计 41 页 0 问题 / 导航桌面+移动两处入口 / 浏览器实测时间·置顶·定位·亮暗·直角全对 / 分页真跑（临时改每页 2 条）后改回 10 / 375px 0 溢出 / 首页软导航正常。**内容仍是 3 条示例，待用户处置** |
| 产物审计 | h1 审计 **40 页 0 问题**；`/about/` 死链 0、邮箱仍 `314298729@qq.com`、github 卡片仍 3 张；Twikoo 日志 0 命中；`--shodow` 0 命中；产物里 `.dark` 只剩 `rehype-callouts` 自带 2 条（非本项目源码）；**全部改动文件 0 乱码** |
| 内容层缓存 | `node_modules/.astro/data-store.json` **本会话删过 3 次**（每次改插件/CSS 后重建都清）。下次动 `src/plugins/**` 或 markdown 处理链务必再删（AGENTS 五-21） |
| dev server | **运行中**（任务 `baqtwxfbq`，端口 4321 HTTP 200，已确认服务的是本批最新源码）。⚠️ **停它必须连子进程一起清**：本次两个 PID 是 npm 包装 `4988` + `astro dev` `35276`，`TaskStop` 只杀外层 shell，孤儿的 `astro dev` 会锁住 lightningcss 导致后续 `npm ci` 删空 `node_modules`（AGENTS 九 依赖坑 ③） |
| 服务器回滚资产 | `dist.old` + **12 个 `dist_backup_*`**，合计 **343M**（最新 `dist_backup_20260929_102733`）。全部保留中，**删需用户明确同意** |
| 临时文件 | 本地 `%TEMP%` 的体检脚本与 `chenblog_dist.tar.gz`、构建日志**均已删**；服务器 `/tmp` 已确认无残留 tar |
| 测试环境限制（本次又验证有效） | ① 定宽 iframe 里 `:focus` 永不匹配 → 焦点/hover 驱动的效果只能比产物或用户肉眼验；② **带 `transition` 的元素，同步改 `data-theme` 后立刻读 `getComputedStyle` 读到的是过渡起点** → 必须先注入 `transition:none!important`（本次差点把暗色滚动条误判成"没修好"）；③ 内联 `style=` 不在样式表里，`cssRules` 遍历搜不到 |
| 既存小坑 | `--radius-large` / `--panel-border-color` 已查清（AGENTS 五-16，别重复查）；`tsconfig.json` 的 react jsx 残留无影响；~~`MobileMenu.astro` 空参数 transform~~、~~`--shodow-md` 拼写~~ 本会话已修 |
| `npm audit` | 补 `dayjs` 后重测（官方源）= **0 vulnerabilities**，与 09-28 基线一致。⚠️ 默认 registry 是 npmmirror 不实现 audit 接口，必须加 `--registry=https://registry.npmjs.org`（AGENTS 第三节） |

---

## 四、维护本文件的规矩

1. **每次会话结束前更新**：改「最后更新」日期、刷新第三节状态快照、
   把本次做的事并进第二节（旧内容可压缩，别无限堆积）、更新第一节的下一步。
2. **不复述 AGENTS.md**：规则、部署流程、版本天花板、依赖坑位都在那边，这里只写"现在什么状态、接下来干什么"。
3. **同样受凭据纪律约束**：面板端口、密码、token、私钥一律不写。仓库是公开的。
4. 第一节永远放**下次该做什么**，让新会话打开文件第一眼就知道从哪接手。
