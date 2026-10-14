# AGENTS 分册 · 第八节「文章写作规范」全文（发稿流程 / frontmatter / 图片 / 从未用过的功能）

> 本文件是 `AGENTS.md` 某一节的**全文**，2026-10-12 从 AGENTS.md 无损切出。
> `AGENTS.md` 只留常驻结论与索引（受 harness 64KB 注入预算限制）；改到本节任何主题前先读本文件全文。
> **行内容逐字未改**，条目编号（五-16 / 八-9 / 十-14 …）在 AGENTS.md 与 HANDOFF.md 里照旧引用。

---

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
9. ⚠️ **`ccnewtools-manual` 那两处「故意与源手册不同」已在 2026-10-10 随 v1.4.0 同步撤销**（原委与通用口径都留着）：
   - **撤销的原因是他重拍了全部截图**：v1.4.0 这批演示数据换小了，新图 `05-tree-search` 底部写
     **「匹配 2 / 10 个用例」**、`02-parsed` 统计条是 **5 测试项 / 10 测试用例 / 18 测试步骤 / 1 告警**，
     顶栏徽标全部是 **V1.4.0**。→ 正文回到他手册原文的 **10**，文末那句
     `> 注：站内截图取自 v1.1.0 界面…` **删除**（徽标已是 v1.4.0，留着就直接与图矛盾）。
   - **通用口径不变**：只要配图不动，正文里凡与图里可读数值冲突的地方**都以图为准**，并把偏离逐条记在这里，
     否则下次"对齐源手册"会把它们悄悄抹回去。**本次是"图动了"，所以偏离自动失效** ——
     下次同步前先看 `使用手册/截图/` 的 mtime 与尺寸，图一旦重拍就必须重新逐张核数值，不能沿用旧结论。
   - **配图现在是 16 张**（10-07 起是 11 张）：新增 `00-toolset-home` / `12-trace-home` /
     `13-trace-report-pair` / `14-trace-note-preview` / `15-trace-report-preview`。
     ⚠️ 其中 **13 与 15 缩进在有序列表项内**，用 `grep -c '^!\['` 数图片会漏成 14 —— 要数
     `截图/NN-` 的引用次数（`grep -o '截图/[0-9][0-9]-' | wc -l`）。源图从 `1600×900` 变成
     `1943×970`（追踪那 4 张是 `1280×800`），站内一律 `resize(width:1600, withoutEnlargement)` + `webp(quality:88,effort:6)`，
     16 张合计 **0.38MB**（原 PNG 1.94MB）。
   - **同步自检的硬标准**（2026-10-10 跑通的做法，别再凭眼睛看）：把两边都归一化
     （剥 frontmatter / 去一级标题 / 图片路径映射成 `IMG:NN` / 弯引号还原成直引号 / 折叠块引用空行），
     再 `diff -u` —— **剩余差异必须只剩"站内规矩"这几类**：宽表包 `.horizontal-scroll-container`、
     围栏补 `text` 语言、`**Qn：**` 与答案之间补空行（他的渲染器吃硬换行、站内 markdown 不吃）。
     本次归一化后差量是 69 增 / 36 删，同步完成后复跑 diff 只剩 14 行且全是上述几类，才算过。
   - ⚠️ **数 diff 时别用 `grep -c "^[+-][^+-]"`**（2026-10-10 同步 v1.4.1 时差点被它骗过去）：
     纯空行的差异行就是光秃秃一个 `+` 或 `-`，没有第二个字符 → **这类会被整个滤掉**，
     于是我一度看到「只剩 11 行、且不含任何 Q 空行」以为自检干净了。
     → 正确写法 **`grep -cE "^[+-]([^+-]|$)"`**，并且**单独再数一次纯空行差异**
       （`grep -cE "^[+-]$"`）——本类同步里空行差异恰恰是最多的一类（Q 与答案间 15 处 + 包容器带的 6 处）。
   - ⚠️ **站内自己加的一行，下次同步必须保留**（2026-10-10 用户要求「在文章前面给出麒麟 / Linux / Windows 的说明」）：
     顶部块引用第 2 行 `> 支持平台：**Windows x64 / Linux x64 / 银河麒麟 V10** —— 三个平台同一套界面与操作，下文与截图以 Windows 为例`。
     他手册**没有这一行**（只在「一、」末尾留了一句带三个 exe 文件名的详述，那句照原样保留），
     所以归一化 diff 会把它报成「多出来的一行」——**这是故意的，别当噪声删掉**。
     → 站内规矩清单现在是五类：宽表包容器 / 围栏补 `text` / Q 与答案间补空行 / **顶部这行平台说明** /
       **小节分隔线只留顶部那 1 条**（2026-10-14 用户拍板「滤掉」）。第五类的来历：他的手册每节之间
       都有一条 `---`（`ccnewtools-manual.md` 里共 10 条），而站内历史版本只保留顶部块引用之后那 1 条
       （prose 的 h2 间距已经够，10 条横线会长出一屏空感）。⚠️ **下次同步必须按这条过滤**，
       别把它当成"his 手册里有、站内漏了"补回去；反之，**frontmatter 那两条 `---` 与顶部那条要留着**。
   - 历史：2026-10-09 一天内同步过三次（v1.1.5 → v1.3.2 → v1.3.3，他仓库 HEAD `0caddd3`），那三批配图未动，
     所以当时两处偏离是**成立**的；`20MB/100MB/200MB/600/2000/10MB` 这类是"阈值"不是演示数据，任何时候都不与图冲突。
     ⚠️ 同日 17:3x 他还说过一次"手册又更新了"，但**文件 mtime 仍停在 16:27、全项目搜不到第二份手册**
     ——是编辑器没存盘。碰到"他说更新了但 diff 为零"就先把 mtime/字节数/搜索结果摆出来问他，**别自己编内容**。
   - 本次（v1.4.0，他仓库 tag `v1.4.0` / HEAD `118c768`，手册 mtime 10-10 17:42）**正文与他手册已完全一致**，
     **不再有任何故意偏离**；他手册这次自己删掉了我们站内那句「**获取工具**：…见 [CCNewTools 仓库]」，
     已跟着删（HANDOFF 里挂着的"要删一句话"待办就此了结）。

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
| `![说明](/images/xxx.jpg)`，文件放 `public/images/` | ✅ **唯一正确写法**，2026-10-07 前全站只有 1 篇用对（第6天:26）；现 2 篇（另一篇 = `/posts/ccnewtools-manual/`，**16 张**图走 `/images/ccnewtools/*.webp`，见八-9） |
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
