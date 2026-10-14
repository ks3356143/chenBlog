# AGENTS 分册 · 第九节「待办与未决」全文（历批记录 / 版本天花板 / 依赖坑 / 运维）

> 本文件是 `AGENTS.md` 某一节的**全文**，2026-10-12 从 AGENTS.md 无损切出。
> `AGENTS.md` 只留常驻结论与索引（受 harness 64KB 注入预算限制）；改到本节任何主题前先读本文件全文。
> **行内容逐字未改**，条目编号（五-16 / 八-9 / 十-14 …）在 AGENTS.md 与 HANDOFF.md 里照旧引用。

---

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
    ④ **Pagefind 分片里每个词之间插了零宽分隔符 U+200B**（gunzip 后是 `设计​简介​. ​对于​彭​罗斯​三角​…`），
      所以拿多字中文短语直接 `includes()` **必然 0 命中**——2026-10-10 我就据此差点报「新章节没进索引」。
      → 正确做法：**先 `t.replace(/\u200b/g,"")` 再匹配**，并且**同一方法要先跑一个必定存在的词当控制组**
        （本次控制组用「测试大纲」，命中才说明方法本身有效，再谈「某个词查不到」的结论）。
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
     → 更阴的是：**停后台任务只杀外层 shell**（上一任叫 `TaskStop`，本 harness 叫 `job_kill`，**行为相同**），`npm run dev → astro dev` 的**子进程会变成孤儿继续存活**
       （本次同时留着 2 个 astro dev + 2 个 npm 包装进程）。
       ⚠️ **`npm run preview` 同理**（2026-09-30 实测：工具报"已停止"之后
       `astro preview` 的 node 子进程仍在，靠命令行匹配才找出来）——所以任何要动 `node_modules` 之前，
       一律先按命令行精确查一遍 `astro` 相关进程，**别信"已停止"的回执**。
     → 顺序：`Get-CimInstance Win32_Process` 按 `CommandLine -like '*chenBlog*'` 精确定位 PID 后逐个 `Stop-Process`
       （**别批量杀 node.exe**：harness 自身、它的子代理与一堆工具进程都是 node）；确认残留为 0 再 `npm ci`。
       ⚠️ **但 `-like '*chenBlog*'` 这一条本身也不够精确**（2026-10-01 实测自伤）：包装 shell 的命令行里
       带着我发出去的那条命令**全文**，于是 `chenBlog` + `preview`/`astro` 这种宽条件会把
       自己的 bash 包装进程和 PowerShell 本体一起吃掉（命令自己把自己杀了，退出码变 4294967295）。
       → 匹配条件要钉在**可执行文件路径 + 尾参数**上，例如
         `$_.Name -eq 'node.exe'` 且 `$_.CommandLine -like '*astro\bin\astro.mjs*preview*'`，
         杀完再用同一条件复查计数为 0；不要拿"项目名 + 关键词"当过滤器。
       万一已经失败了，先 `npm install`（增量、不删目录）把项目救回来，再重试干净安装。
  → 另：`npm ci` / `npm install` 后面接 `| tail -20` 会把**退出码换成 tail 的**，
     失败也会显示成"成功"。依赖类命令要拿真实退出码就 `> 文件 2>&1; echo $?`，别信管道后的 `$?`。
- 🔴 **禁用 `npm audit fix`，尤其 `npm audit fix --force`**（2026-10-12 实测）：
  本项目的 `fixAvailable` 指向 **`mermaid` 10.8.0 且 `isSemVerMajor: true`** ——
  跑 `--force` 就是把 mermaid 从 **11.17.2 降级**到 10.8.0，一头撞进第九节的版本天花板（`astro-mermaid` peer 只收 `^10||^11`）；
  `postcss-selector-parser` 那条 npm 自己标 **No fix available**；`dompurify` 由 mermaid 带入，跟着一起动。
  → 漏洞只许**逐条看归属（prod / devDep / 有没有进 dist）与可达性**，不许把 `npm audit fix` 当默认动作。
  与上面那条 `legacy-peer-deps` 禁令同族：**自动修复类工具在这个项目里会反向破坏**。
  ⚠️ 附带：`npm audit --json > 文件` 会把 npm 自己的 `npm warn …` 行一起灌进文件头部 →
  `JSON.parse` 直接 SyntaxError；要解析先剥掉 `^npm warn` 行。
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
- ✅ **21 个 undici 漏洞（2 critical / 13 high）→ 0**（⚠️ 这是 **2026-09-21 那次升级当时的快照，不是现状**：
  漏洞库随时间增长，2026-10-12 现跑 `npm audit --registry=https://registry.npmjs.org` 是 **23 条、退出码 1**。
  → **报告漏洞数一律现跑，别引用本文或 AGENTS 里的旧数字**。）
- ✅ **代码块功能无回归**：拿线上旧构建（0.43.1）与新构建（0.44.2）做同一篇文章 A/B 对照，
  `ec-collapse*` 折叠类、`ec-line` 数量、复制按钮文案全部一致；108 行差异只有资源哈希、
  Astro 7.3 更紧的压缩空白、一个 HTML 注释
- `npm ci` 有一条 `npm warn deprecated glob@10.5.0`（传递依赖），不阻塞构建。

### 运维

- 宝塔面板密码曾在对话中明文出现，用户当前选择暂不修改；面板 IP 白名单未开。
- **回滚资产的命名**：每次部署留 `dist.old` + `dist_backup_<时间戳>`（第六节流程产出的）。
  保留与删除的规则见**第七节收尾铁律**；当前有几个、共占多少是**会变的状态**，只记在
  [`HANDOFF.md`](./HANDOFF.md) 第三节，别在这里复制一份过期数。
- **每天开工先做依赖体检（2026-10-14 用户立的规矩，只读、不改依赖）**：
  ① `npm outdated` 看哪些包落后（Current / Wanted / Latest 三列）；
  ② `npm audit --registry=https://registry.npmjs.org` 查漏洞（默认 npmmirror 不实现 audit，会假报 404）。
  ⚠️ **`Latest` 列不是升级目标**：`mermaid` 的 Latest 是 12.x、`typescript` 的 Latest 是 7.x，**都撞上面的版本天花板**
  （`astro-mermaid` peer 只收 `^10||^11`、`@astrojs/svelte` peer 只收 `^5.3.3||^6.0.0`）→ 看到"落后"别手痒升。
  2026-10-14 实测 `npm outdated` 有 12 个包落后，其中只有 patch/minor（astro 7.3.4→7.3.8、svelte、katex 0.18.x、
  @astrojs/* 等）是"可考虑"的，mermaid/ts 两个大版本是"绝不能碰"的。
  ⚠️ **体检 ≠ 升级**：真要升（哪怕 patch），也属于**改依赖**——他对新增/升级依赖保守，
  **要他当次点头**，且走九节那条干净序列（`npm update --package-lock-only` → `npm ci` → `npm run build`），
  绝不用 `npm audit fix --force`（会把 mermaid 降级撞天花板）。**日常只把体检结果报给他，不擅自升。**
- 前端计划：**页面间动画已于 2026-09-23 用 Swup 实现**（见第十节）；剩余计划见 `README.md` 的「后续计划」。

### 九·补（2026-10-12 常驻层瘦身时搬进来的原文）

> 背景：分层那一笔（`6ac7938`）把若干结论**只写进了常驻层**（`AGENTS.md` 受 64KB 注入预算挤压），分册里没有等价全文。
> 2026-10-12 做"轻量腾挪"时把这些**原文搬到这里**，常驻层只留钩子 + 指针。
> ⚠️ **搬迁前逐条核过**：用 `Select-String` 确认这些关键词在分册里 0 命中（`filter-repo` / `8099` / `envId` / `强推` / `srcset` / `webmanifest`），
> 属"常驻层独有"，所以是**搬**不是删。以后再往常驻层加东西，若细节放不下，照这个格式搬。

**① 安全与授权边界（原文全文）**

全历史扫过 → **零凭据泄露**；文档已脱敏但**只改当前版本、历史未重写**（彻底清除要 `git filter-repo` + 强推，**他从未批准**）。
风险有限：SSH 仅 publickey、裸 IP 本就公开。⚠️ 仍未处理：**Twikoo `envId` 是裸 `IP:8099`**，前端公开，
若该实例没设访问限制可被垃圾评论写入（改同域反代属服务器改动，**要他拍**）。
面板密码曾在对话明文出现，**他选择暂不改**；面板 IP 白名单未开。
一笔已发布提交消息写错（`90a38e5`），改它要 `--amend` + 强推（属当次点头类），**他没点头所以留着没动**。
**凭据纪律：面板密码 / SSH 私钥 / 任何 token 一律不得写入仓库或任何入库文件，也不要在对话里明文传递。**

**② 「用户看过选择不做」清单里两条常驻层独有的细节（原文）**

- 横幅 `srcset` **缺 750w 档**（他看过，选择不做）。
- `/site.webmanifest` 的 **Content-Type 是 `application/octet-stream`**（要修得改服务器 mime 映射，故未做）。

**③ 已证伪清单的完整措辞（含"当初是怎么查错的"，常驻层已压缩为一行）**

`heart.svg` 404（在 ``` 围栏内是示例文本，页面无 `<img>`）· "语言徽章与行号从未渲染"
（徽章是 `[data-language]::before` **伪元素**、行号实际是 `div.gutter > div.ln`，当初拿臆想的 `ec-line-numbers` 去查）·
"**`dark:` 无效**"（**差点据此把 20 个文件的 `dark:` 当死代码清掉，那是造事故**）·
`CoverImage` 并没有 `import { Image }`（注释里的字样被当引用）· `--collapsedHeight` 是 `define:vars` 注入不是未定义 ·
"twikoo 尾斜杠分两个线程"（`getCurrentPath()` 无条件覆盖）· TypeMechine 是每次导航 6 次 init 且它 `hooks.on`
**从来没注册上**（容器外，不累加，只是打字重放）。
🔴 **通则：「文档说坏了」不等于坏了，也不等于「该怎么修」是对的。** 拿到待办先**按产物实际结构**逐条验证；
取证用 DOM 解析器不用 grep（`<img>` 是 void element，"跳过 pre 子树"对 img 失效，要回到 markdown 源码按 ``` 围栏逐行判定；
伪元素永远不在 HTML 文本里；**选择器必须先在产物里实测出来，不许臆想类名**）。

**④ 六条部署已知坑的完整措辞（常驻层已压缩为一行，原文在此备查）**

① Windows 的 tar 带数字 UID → 解压后属主 `UNKNOWN`，**必须 `chown -R root:root`**；
② 服务器上 `curl http://127.0.0.1/` **测不到博客**（Host 头命中 `phpfpm_status.conf`）→ 加 `-H "Host: 47.108.230.220"` 或从外部打公网 IP；
③ node 的 `execSync` 在 Windows 走 `cmd.exe` 而非 bash → `/dev/null` 与 `%{http_code}` 被吃掉，出现"所有请求都失败"的假象 → **HTTP 测试直接用 shell 跑 curl**；
④ **中文文章 URL 必须 `encodeURIComponent`**，否则 nginx 404；
⑤ 服务器仓库的 `package.json` / `package-lock.json` 常是 modified（历史 `npm install` 的垃圾改动），pull 前先 `git checkout --`；
宝塔生成的 `.htaccess` `.user.ini` `404.html` `index.html` **无害，别删**；
⑥ **线上版本极易滞后**（曾躺三个月）→ 改完必须真部署并**实际访问线上确认**，别只看本地 build 通过。
