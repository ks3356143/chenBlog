# HANDOFF — 会话交接

> **分工**：`AGENTS.md` 存长期不变的规则与事实；本文件存**会变的状态**与**下一步该做什么**。
> 本文件不重复 AGENTS.md 的内容，只引用。每次会话结束前必须更新本文件。
>
> 最后更新：**2026-10-10 傍晚（第六趟：手册同步到 CCNewTools v1.4.0，已上线 V0.1.36）**。
>
> 本趟一句话：他发了 **v1.4.0**（工具 → **工具集**，新增「工具二：追踪文档生成」），
> 手册正文与**全部 16 张截图**都换了（演示数据从 110 用例改成 10 用例、徽标变 V1.4.0）。
> 按八-9 的口径逐张核新图 → **原先站内那两处「故意偏离」自动失效并已撤销**：正文回到「匹配 2 / **10** 个用例」、
> 删掉「截图取自 v1.1.0」尾注。**现在正文与他手册完全一致**，只剩站内规矩那几类改写。
> 归位按他的决定：**同步进现有那篇**（URL 不变），标题改成「CCNewTools V1.4.0 使用手册」（slug 未动）。
> 全部细节与同步自检标准在 **第二节本批条目** 与 **AGENTS 八-9**。
>
> —— 以下为同日第五趟（PostMeta 图标间距 / V0.1.35）的记录 ——
>
> 本趟一句话：同一行里分类/标签的文字包在 `<a class="btn-plain … p-1.5">` 中，字形离图标色块实际 **14px**；
> 两个日期是裸 `<span>`，只有 `.meta-icon` 的 `margin-right: 8px` → **同行两种间距**，他看到的就是"日期贴太紧"。
> 给两个日期 span 补 `px-1.5` 拉平；列表卡用的是同一个 `PostMeta`，一并修好。细则 **AGENTS 五-42**。
>
> —— 以下为同日第四趟（二维码浮层动效 / V0.1.34）的记录 ——
>
> 那趟两条来自他看完 V0.1.33 后的反馈：① 「打开没有动效」——根因是 JS 用 `pop.hidden` 切 `display`，
> **`display:none` 上没有可插值属性，CSS 过渡压根不会启动**；改成只由按钮 `aria-expanded` 驱动
> `opacity/visibility/transform` 三条 0.18s 过渡（细则 **AGENTS 五-41**）；② 「只显示二维码、去掉头像等」——
> 从原来那张整块白色卡片图（940×1392）里按深色模块边界重裁出**只含码体**的 750×750 无损 webp（**63.3KB**，比原来还小）。
>
> —— 以下为同日第三趟（波纹高度 / V0.1.33）的记录 ——
>
> 那趟一句话：`#header-waves` 写的是 `max-h-12.5`（Tailwind v4 = 50px 上限），参考站是
> `max-h-37.5 min-h-12.5`（150px 上限 / 50px 下限）→ **波纹带一直比参考站矮约 2.7 倍**。
> 改成一个类的替换，实测三档高度 135 / 80 / 150px 与参考站逐档一致，横幅文字（底边 331px）
> 离波纹顶（452px）很远、没被压到，零横向溢出。核法与"照抄数值抄漏"这条通病见 **AGENTS 一·参考源用法第 5 条**。
>
> —— 以下为同日第二趟（meCard 社交按钮 / V0.1.32）的记录 ——
>
> 那批一句话：`meCard` 的 QQ / 微信 / GitHub 三个按钮原先写的是**占位 `href="/"`**，在首页点 = 同 URL 点击 →
> 被 `SwupManager` 的回顶拦截接走，所以看着「点了没反应」（**不是交互坏了，是地址从来没填过**）。
> 三条坑落在 **AGENTS 五-38 / 五-39 / 五-40**，其中 **顺带查出 `CopyShare` 的「复制链接」在线上一直静默失败**
> （纯 HTTP 没有 `navigator.clipboard`），同批补了 `execCommand` 退路。
> ⚠️ `npm run check` 的 hint 基线 **2 → 4 条**（两条 execCommand deprecated，故意留的）。
>
> —— 以下为同日 16:2x 那趟（发了一条动态 / V0.1.31）的记录 ——
>
> 本批很薄，只有 `src/content/dynamic/2026-10-10-162300.md` 一条 + 发版 0.1.31。
> **加一条动态既不增页数也不增文件数**（仍 43 页 / 351 文件），因为条目走 `/api/dynamic.json` 由客户端填模板（AGENTS 五-24）。
> ⚠️ 踩一条工具坑（已写进 AGENTS 七节）：**Git Bash 里 `TZ=Asia/Shanghai date` 不生效**，给出的是 `08:22`（错 8 小时），
> 同一个时刻 `node -e "new Date()"` 才是 `16:22:45 GMT+0800`。动态 frontmatter 必须带 `+08:00`（五-23），
> **取时间一律用 node，别用 bash 的 `date`**。
>
> —— 以下为 10-09 那批（手册第三次差量同步 v1.3.3 / V0.1.30）的记录 ——
>
> **该批同步的正文差量**（归一化逐行 diff 得到，改完再 diff 一次确认只剩"故意偏离 + 站内规矩"）：
> 版本号 8 处、二·第 3 步改成「两份 Word 自动保存到数据目录（小文档也可直接下载）」、
> 四 新增「大文档自动分块解析」段（正文超 20MB 自动分块；上限正文 100MB / 压缩包 200MB）、
> 4.1 问题清单只剩告警（示例换成「标题下没有测试项表」「标识不一致」）、
> 5.2 新增「大文档的树行为」（用例数 >600 时树折叠、超量提示用搜索定位）、
> 六 第一条拆成两条（自动保存到 `数据\生成\<项目>\` + 10MB 以内保留下载按钮）、
> 六 新增「测试记录超 2000 个用例自动跳过记录文档（Word 硬限制）」、七 目录树加 `生成/` 一行、
> Q7 整条重写（文档在哪儿 + 怎么改名）、`updated: 2026-10-09`。
> 🔒 **八-9 那两处故意偏离继续保留**：正文仍是「匹配 2 / **110** 个用例」、文末「注：站内截图取自 v1.1.0 界面」仍在。
> 新增的 20MB/100MB/200MB/600/2000/10MB 都是阈值不是演示数据本身，与配图不冲突。
> ⚠️ 踩坑记两条（都写进 AGENTS 了）：**含反斜杠的 Windows 路径手抄进 `node -e` 会被吃掉**（七节末条给了正确做法），
> 以及**我自己的断言期望值算错**（文章本来有 9 个反斜杠，加 6 个应断言 15，按 6 断言把自己拦下白查一轮）。
> 最终验收以浏览器 DOM 的 `textContent` 为准：两处路径渲染正确、`<项目>` 存成 `&#x3C;项目>` 没被当标签吞、
> 375px 两张宽表仍可拖（528/726 → 294 容器）、页面零横向溢出、`h1` 恰好 1 / `h2` 10、11 张图零破图。
> （375px 探针一度报"1 张破图"，追下去是横幅壁纸 `/_astro/3.uhuNk7Er_1tDehv.webp` 在隐藏标签页里的解码时序假信号：
> 该资源线上 200 / 24306B 与本地逐字节同，1440px 复测 `bad: []`。）
>
> —— 以下为 10-08 那批（V0.1.26~0.1.28）的记录 ——
>
> **同步的正文差量**（逐行核过，与他手册现已完全一致；**图片一张没动**，11 张 webp 线上与本地 md5 全等）：
> v1.1.4→v1.1.5 共 8 处、开头新增「截图均使用演示数据（“XX星”示例项目，纯合成大纲）」、
> 解析耗时口径改「几百条步骤的大纲」、搜索示例改「匹配 2 / 10 个用例」、
> Q3 上限 20MB→100MB 并补「带截图的大纲几百 MB 以内都能正常解析」（对应他仓库 `cbe49ed` 那次上限修复）。
>
> 🔴 **同步过程中修回一个 10-07 自己埋的哑 bug**：那次引号方向改写把 `<div class="horizontal-scroll-container">`
> 的**属性引号**也改了 → 产物里 class 值带弯引号、选择器永不匹配 → **八-8 的宽表滚动容器一直是死的**。
> 线上 375px 实测（改前）：`matchedWrappers=0`、726px 的表只显示 294px、父级 `overflow-x: visible` = 内容丢失；
> 改后：`matchedWrappers=2`、`overflow-x:auto`、程序化 scrollLeft 0→300 可拖、页面零横向溢出、1440 下 `boxW==tableW` 桌面观感不变。
> 教训与三条核法见 **AGENTS 八-7**。
>
> ⚠️ **图文数值差异已按他口径修掉（V0.1.28）**：他说「先不动图片，把正文和图的数值差异修一下」→ **文字跟图走**：
> ① 5.2 改回「匹配 2 / **110** 个用例」（配图 `05-tree-search` 底部与 `02-parsed` 统计条都是 110；
>   同图还给出 37 测试项 / 528 步骤 / 4 告警 / 3 提示）；
> ② 文末补一行「注：站内截图取自 v1.1.0 界面…」——尾注让读者去看顶栏徽标，而每张图徽标都是 v1.1.0，不补就是直接矛盾。
> 🔴 **这两处是「故意与源手册不同」，下次差量同步会把它们改回去 → 必须保留，条目已写进 AGENTS 八-9。**
>
> ⚠️ 仍待他一句话的（都不阻塞）：
> 他 `使用手册/截图/` 里 11 张 PNG 是 **10-08 10:25~10:55 重拍的一轮**（仓库 `449c9a3 手册截图重拍轮：ParamsCard placeholder 脱敏 BCD星→XX星`），
> 站内这 11 张 webp 仍是 10-07 那批 —— **按他「图片别动」没换**；要换得他说一声。
> 另外文章里那句他手册没有的「**获取工具**：…见 [CCNewTools 仓库](https://github.com/ks3356143/CCNewTools)」
> （本机直连 GitHub 探测 HTTP 000，**判不出仓库是否可达**；首版就在，先留着），要删一句话。
>
> —— 以下为今天早些时候两条缺陷（V0.1.26）的记录 ——
> **① 「框选/点击正文时文字会往上移动一下」→ 不是 `::selection`，是 hover/active 的布局位移。**
> 全站只有两条 `::selection` 规则且都只设 `background-color`；真造一个选区实测 Range 矩形与 `scrollY` **零变化**。
> 真元凶 = `markdown.css` 给正文链接 `:hover/:active` 写的 `border-bottom: 1px dashed`——
> **inline 元素的 border 会撑高行盒**：线上实测同一行 `21.333 → 22.095px`，标题尾部那个**隐形** `a.anchor`
> 一样中招（`36 → 36.762`），而 `.anchor` 带 `transition: all` 所以是 **150ms 渐进撑开** → 鼠标一进一出下方整段文字跟着跳。
> ⚠️ **这条是我 2026-09-29 那次"补上失效变量"带出来的回归**（九节 item 4 的旧结论已就地推翻）。
> 现改成 hover 只加底色、虚线交回基态 underline，实测行盒增量归 0。
> 同批还摘掉了 `.onload-animation` 因 `forwards` 永久留在正文容器上的 identity transform（常驻合成层，
> 属"选中时看着跳"剩下的唯一候选，**绘制层的事我这边拿不到像素证据，只当候选报**）。细节 **五-36 / 五-37**。
>
> **② 「文章详情页 F5 → 点主页 → 列表图片永远转圈，刷新才好」→ 已定位并修好，不是 Edge 的锅。**
> `reinit.js` 有个洞：`navigating()` 那句"注册后 runAll 一定会跑到"只对**已存在的 key**成立——
> Astro 组件脚本是 `<script type="module">`，插进容器要到**下一个宏任务**才求值，赶不上 `content:replace`
> 当趟派发的 `runAll`；而 `ranFor` 被初始化成当前 token，又让紧随的 `catchUp()` 以为已经跑过 →
> **那个 key 一次都没执行**。线上取证：`register cover-image | is-changing=true | runsBefore=-1` 之后没有 RUN，
> `reinitRuns=0`、10 张封面 `data-initialized` **0**、`data-loading="true"` **10**（其中 8 张早已解码）。
> 触发条件 = 「本文档第一次进这个页型」+「注册发生在软导航途中」→ 只有**文章页起步 → 首页**这条会坏。
> 🔴 **所以他昨天那条"手机 Edge 首次进首页一直转圈"极可能一直是这个洞**，
> 不是 Edge、不是懒加载被中止、也不是上午修的 `onError`（那个只在 load 真失败时才犯）。
> 现 preview 与线上都实测到：`runs -1 → 1`、`data-initialized 10/10`、五-35 真 bug 判据 **0 命中**。
> 顺带：`reinit.js` 改成引用 `?v=<内容哈希>`（它原先吃 Nginx 的 `max-age=43200`，改动会留给回访用户 12h），
> **没碰服务器配置**。细节 **十-14 末两条**。
> ⚠️ 修的第一版"注册即跑"是错的：同步脚本那一路会变成一趟 +2（实测 `recommended-post`），已改成
> 让出一拍自查；回归判据「每趟导航每个 key 恰好 +1」在两趟导航上全部成立。
>
> 📌 **下次开场**：等他两句回话——① 手机 Edge / 桌面从文章页点主页，封面是否还转圈
> ② 框选/点击正文时文字是否还跳。其余待拍板见 9.～15.，大方向仍是**功能扩展**（候选见 1.）。
> 🔁 协作规矩（2026-10-07 起）：**改完就提交 + 推送 + 部署，不再每次问**；
> 但必须先跑完 build 与核验并报出结果；**改服务器配置 / 强推重写历史 / 删回滚资产仍要当次点头**。
> ⚠️ 一笔已发布提交的消息写错了：`90a38e5` 只改 HANDOFF 却写成"文章：同步…标题改为…"。
> 改它要 `--amend` + 强推（属上面第②类），他没点头所以**留着没动**。
>
> —— 以下为本月早前两批的存档（细节已沉淀进 AGENTS，只留索引）——
> 2026-10-08 上午批（V0.1.25）：装饰图 alt 会被画出来 + 本地封面 load 失败遮罩永不褪 → 见 **五-34 / 五-35**。
> 2026-10-07 批：CCNewTools 手册发稿 + 修灯箱从未绑上 + 修归档页筛选从未生效 → 见 **五-33 / 八节 / 九节**。
> 产出：`src/content/posts/ccnewtools-manual.md`（URL `/posts/ccnewtools-manual/`）+
> `public/images/ccnewtools/` 11 张 webp（1.67MB PNG → **0.33MB**，逐像素 MAE < 1.1）；
> 分类值 1 → **2**（设计灵感 / 工具）。
> ⚠️ 那批查出的两条"照抄改名后静默失效"里，`第8天宽表被裁` 与 `propse-base 拼错` 仍挂着等他拍：
> 见「还挂着的事 11./12.」。

---

## 一、下次会话第一件事

> 🎯 **大方向仍是「功能扩展」**（用户 09-30 交代；10-01 已批的四件工程项本日做完）。
> 候选清单在下面「还挂着的事 1.」（动态页二期三项）。
> 动手前照旧：先扒 firefly.cuteleaf.cn / CuteLeaf/Firefly 的实现
> （**扒结构必须看原始 markup，别剥标签——那次就是这么把图标看没了**），
> 再走 brainstorming（这类多属 Bounded → 短设计 → 等批准），不要直接写代码。
>
> 📝 **他手上有一篇新文章要发**（流程见 AGENTS 第八节「发稿协作流程」）：他**只给 MD 正文**，
> 特殊语法我自己扫、默认值我自己填，**别发前置问卷挡他**；唯一必须问的是归位（永久 URL）。
> 图片要拿到文件本身，本地路径我读不到。**改完就提交+推送+部署，不用每次问**（2026-10-07 起的规矩）。
>
> 💬 **发动态的流程本批（10-10）跑通了一遍**，下次照做不用再问：
> `node` 取当前时间（**别用 bash 的 `date`**，见 AGENTS 七节末）→ 建 `src/content/dynamic/YYYY-MM-DD-HHMMSS.md`
> （带 `+08:00`，五-23）→ `npm run build` → 核 `dist/api/dynamic.json` + 定宽 iframe 验 `/dynamic/` 与侧栏两处挂载
> → 提交推送 → 第六节部署。**动态不进搜索索引**（五-24），别为这个"补配置"。
>
> ⚠️ **本批之后新增的一条硬规矩：以后写「导航后重 init」只能调
> `window.onReinit(key, fn, opts)` / `window.reinitOnce(key, fn)`**（实现在 `public/assets/js/reinit.js`，
> 由 `BaseLayout` head 同步加载）。**不要再手写 `window.__xxxInit` 标志、不要再直接
> `document.addEventListener("swup:contentReplaced"/"astro:page-load", …)` 做重初始化**——
> 规则、判据、坑与验证办法全在 **AGENTS 十-14**。
>
> **`npm run preview` 与 dev 当前都已停，:4321 空闲**（本批用它做完验证后按 `node.exe` +
> `astro\bin\astro.mjs` + `preview` 精确杀掉并复查残留 = 0）。
> 下次要复现本批那两条判据，直接 `npm run build && npm run preview`，或者干脆在**线上**跑
> （本批的取证就是线上 + preview 各跑一遍、数字对得上才算数）。
> 二者抢同一端口，换着用之前先精确停掉另一个（宽匹配会把自己的 shell 一起吃掉，见 AGENTS 九节依赖坑③）。
> dev 下站内搜索必然不可用（Pagefind 索引只在 build 后存在），验搜索用 `npm run preview`。
> ⚠️ **交互类缺陷在 dev 下大多测不出来**，复现与验证一律走 `npm run build` + `npm run preview`。
> ⚠️ 隐藏标签页里 **Swup 动画不推进**：真实点击导航只能走一趟就卡在 `is-changing`，
> 多趟导航要用「手动换容器 + 复刻重新插入脚本」的办法（**`is-changing` 要留到重新插入脚本之后再摘**，
> 提前摘会得出假的"每次导航跑 2~3 遍"），办法与结论见 AGENTS 十-14 末段。
> ⚠️ 本会话这个浏览器 surface 的**顶层视口是 0×0**，直接量布局会全读到 0、并伪报"溢出"；
> 一律用**定宽 iframe**（1440/1280/375）量，读计算样式前先注入 `transition/animation: none !important`
> （10-07 就是这条又差点让我把已随主题切换的引用块竖条报成缺陷）。

### ✅ 本批（10-07 新文章）的自测结论（`npm run build` + `preview` 实测；**该批当日 17:20 已上线，现为 V0.1.26 的一部分**）

- **构建**：退出码 0，**43 页 / 350 文件 / 22M**，Pagefind 索引 **29 页**（新文章正文 gunzip 分片实测命中）。
  `npm run check` 0 error / 0 warning / 2 hint（与 10-01 基线一致，没新增）。
- **产物逐项核**：新文章页 35 个本地引用**零缺失**、11 张 webp 全在且全被引用、
  `<h1>` 恰好 1 个（sr-only，就是标题）标题序列 `h1 h2 h2 h2 h2 h3 h3 h2 h3 h3 h3 h3 h2 h2 h2 h2 h2` **零跳级**、
  2 张表格都正确嵌进 `.horizontal-scroll-container`、1 个 `<hr>`、无未渲染的 markdown 残留、
  代码块 `data-language="text"` 且都 <15 行所以**没触发折叠**、外链带 `target="_blank" rel="noopener noreferrer"`、
  代码块内的 `127.0.0.1` **没被误插成链接**。
- **列表与聚合**：首页 10 / `/2/` 10 / `/3/` 7 = **27 张卡片**，新文章排**首页第 1**（published 最新）；
  归档页 27 条链接、RSS 27 个 `<item>` 且无 `undefined`、sitemap 43 条含新文章、
  `/tags/` 三个新标签都在、分类「工具」出现在首页分类栏 + `/categories/` + 归档筛选（`/archive/?category=工具`）。
- **列表页封面**：非系列所以走 `getPostCover()` 的 **id 稳定哈希兜底分支**（这条分支此前零实战），
  拿到 `cover-1.webp` 且文件真实存在；其余 9 张仍按 `seriesOrder` 轮播，序列未乱。
- **布局实测**（定宽 iframe，顶层视口 0×0 不可用）：1440 下正文容器 728px、11 张图 728×409 零溢出、
  两表 728 铺满不出滚动条、页面零横向溢出；375 下容器 295px、图 295×166、页面零溢出、
  **两表变成可横向拖动**（`scrollWidth` 528/726，此前是被裁掉）。
- **深浅两套都跟主题**：`hr` 边框、代码块底、表头/单元格底、正文色全部随 `data-theme` 切换；
  11 张图在两套下都在且无 filter。（引用块竖条那次"没变"是 transition 假信号，注入 `transition:none` 后确认会变。）
- **控制台 0 error 0 warn**。分类栏 375 下横向可滚 74px、页面无溢出、无新增重复 id
  （`announcement`/`cardTags` 是九节已判定降级的既存项）。
- ⚠️ **唯一没验成的**：灯箱"真人点击能不能弹出大图"。本环境合成 click 被 Fancybox 挡了，
  我只证明了修复后**有正文图的页面会请求 Fancybox 本体 chunk、无图的页面不请求**。要他亲手点。

### ⬜ 本批要他肉眼过的（**已上线，直接看 http://47.108.230.220/posts/ccnewtools-manual/**；他还欠一次回话，见「还挂着的事 11.」）

1. **11 张截图的清晰度**（本批唯一有画质取舍的地方）：尤其 05/03/06 这几张表格密的，
   以及**手机上 295px 宽能不能看清**。不满意就说要哪几张回退成原分辨率 PNG（原图在他项目目录里，没删）。
2. **随手点一张图**：灯箱弹不弹得开（这条决定 AGENTS 九节那条 Fancybox 修复算不算真完成）。
3. **两张表在手机上横向拖动**是否顺手；桌面上观感是否和改之前一致（应该是完全一致）。
4. **正文里那些 `---` 小节分隔线我删掉了 8 条**（prose 的 h2 间距已经够，且这是全站第一次用到 `hr`）——
   要保留他原手册的分隔感，一句话就能加回去。
5. **顶部分类栏多出一个「工具」胶囊**：这是他指定的新分类值带来的必然变化，看一眼位置对不对。

### ✅ 上一批（10-01）的自测结论（本地 `dist` + preview 实测，**均为 21:20 上线前**；上线后的线上实测见下面「交付状态」）

- `npm run build` **42 页 / 336 文件 / 22M / 约 4.0s**：页数与 09-30 基线一致，**文件数 +1**
  = 新增的 `dist/assets/js/reinit.js`（`_astro/` 仍 211、`pagefind/` 仍 42）。AGENTS 五-9 已同步成 336。
  ⚠️ 收尾时**没有重跑 build**——重跑会把 SiteInfo 卡的「构建时间」换掉，让本地 `dist` 与线上不再逐字节相同，
  反而毁掉下次会话「线上是不是最新」的判据。当前 `dist` 就是 21:20 上线那一份，HEAD 也正是构建它的那棵树。
- `npm run check`（新装的 `astro check`）**退出码 0，0 error**，剩 2 条 hint（都是"故意留着"的，见三节）。
  `npx tsc --noEmit -p tsconfig.json` 同样退出码 0。
- **重 init 记账**：5 趟导航（首页→文章页→归档→另一篇文章页→再回第一篇）里
  `calendar / site-status / floating-toc / back-to-home / cover-image / typewriter / category-bar`
  的差值**全部恰好为 +1**；`recommended-post`、`twikoo` 每趟 +1（此前它们靠手写标志才压到 1）。
- **累加泄漏**：跑这几趟期间新挂到 `document`/`window` 的监听器数量，进文章页那几趟各 +4，
  其余 +0 —— 那 4 个（`test-passive`/`keydown`/`mousedown`/`mouseup`）**调用栈全在 `twikoo.nocss.js` 内部**，
  是 twikoo 自己 `init()` 带的，与改动前同量，**不是本项目的累加**。
  `history.pushState` 的包装次数在这几趟里 **0 增长**（`setupAutoClose` 那条真漏已堵）。
- **功能未回归**（preview 实测）：`/series/` 手风琴点开与互斥都对；文章页评论区 `#twikoo` 挂载、
  猜你喜欢 5 条、悬浮目录开合、侧栏目录 5 条、系列导航盒展开、代码块折叠 2 处，全部正常；
  真实点击导航后主题按钮连点两次仍是 `light→dark→light`、归档页 26 条链接在；
  **控制台 0 error 0 warn**。
- **首页双挂载卡片**：`running-days` 两个节点首次加载就是 `274|274`（本批中途暴露过一个
  「第二个节点停在占位值」的回归，已修，教训记在 AGENTS 十-14）。
- **对照控制组做过**：首页 10 张封面里 2 张遮罩未褪，**线上旧构建同一探针给完全一样的数字** → 既存行为，
  本批没引入回归，也没顺手改（要改是另一件事，属五-25/十-2 那块）。
- **横幅标题 bug（用户报的）修复后两向都实测通过**：真实点击导航 首页→文章页 = `home` 层 `hidden`、
  post-meta 出现且文案是「CSS100Day(28)-振铃动画 / 发布于 2026-06-22 / 1099 字 / 5 分钟」；
  文章页→首页 = post-meta 消失、`Lovely Life` 回来、`body.is-home` 翻回、横幅高度 500→539、打字机重新起播。
  1440 定宽 iframe 复核：文章页 post-meta `display:flex` 1425×380，home 层 `display:none`；
  375 下 post-meta `display:none` 属正常（`hidden lg:flex`，参考站同款）。
  `#banner-overlay-container` 在 **42 页全部存在**、post-meta 只在 **26 篇文章页**（Swup 要求两页都有该容器）。
  打字机孤儿定时器链：每秒由它发起的 setTimeout 次数 1→3→2→3→3，**有界不随导航次数递增**。
  控制台干净（那条 `[swup] No CSS animation duration…` 是我自己探针注入 `transition:none!important` 造成的，撤掉即无）。

### ⬜ 上一批（10-01）要他肉眼过的（**已上线**，直接看 http://47.108.230.220/ 即可）

0. **他报的横幅标题 bug**（本批最后修的，最该他先看）：首页 ↔ 文章页来回切，
   横幅文案应跟着变（文章页显示标题 +「发布于 / 字数 / 阅读时长」，主页显示 `Lovely Life` + 打字机）。
   ⚠️ **手机上文章页横幅没有标题文字是设计如此**（`hidden lg:flex`，参考站同款），不是没修好。
1. **评论区两条路**（本批改了注册方式）：① 直接刷新一篇 `/posts/…/`；② 从首页点进文章。
   两条我都在线上验过会挂载、表单也渲染出来了，但**没验"能真发一条评论"**。
2. **切页后的各处重渲染**：随机「猜你喜欢」换一批不闪、打字机不再重复起播、
   悬浮目录仍跟随、日历与站点统计数字对。（⚠️ **桌面右栏的「目录」卡在软导航后不会出现**，
   那是既存的另一处缺陷，见「还挂着的事 9.」，不是本批弄坏的。）
3. **分类栏鼠标横向滚轮**：以前换页多了会越滚越快（监听累加），现在应恒定一格滚一段。
4. **移动端底部堆里「站点动态」那格的数字**（本批修过的双挂载回归点，375px 首屏看是否还是 0）。
5. 上一批（V0.1.20）遗留的肉眼验收项仍未回话，见下面那一节，别当已验收。

### 📦 交付状态：本地 = GitHub = 线上三方一致（2026-10-01 **21:20 部署，V0.1.21**）

- **7 笔提交已推送（`9a917e3..f0c2e77`）**：`beddf86` schema 清理 / `754613f` `@astrojs/check` + 类型修复 /
  `632b6c7` onReinit 重构 / `56515e7` 横幅 container 修复 / `011cdb5` 发版 0.1.21 /
  `f97e8d0` 文档（新规矩 + 脱敏）/ `f0c2e77` 文档（交付记录 + 挂起两条）。
  现查：`git rev-list --count origin/main..HEAD`（收尾实测 = **0**）。
- 部署走 AGENTS 第六节流程（本地 build → tar → scp → 解压到 `dist.new` → 校验 → `chown root:root` → 原子 `mv`）。
  **线上 336 文件 / 22M**；`dist.old` 与时间戳备份保留（**当前数量只在第三节那张表维护，别在这里抄一份**）。
- **公网逐路径全 200**：`/` `/rss.xml` `/pagefind/pagefind.js` `/api/dynamic.json` `/og-image.jpg`
  `/assets/js/reinit.js` `/dynamic/` `/gallery/` `/archive/` `/series/` `/categories/` `/tags/` `/about/` 与中文文章 URL。
- **线上首页与本地 `dist/index.html` 逐字节相同（172716B）**；`<title>` = 亦林 YILIn；
  文章页 title 正常；站点信息卡显示 **V0.1.21**；线上文章页的 post-meta 确认嵌在 overlay 容器内。
- 缓存头未被破坏：HTML `no-cache, must-revalidate`、`/pagefind/` `no-cache`。
  ⚠️ 但 **`/assets/js/reinit.js` 拿到的是 `max-age=43200`（宝塔自带 js/css 规则）** → 见「还挂着的事 10.」。
- **线上浏览器实测**（本批改的是评论注册方式与横幅容器，风险最高，所以在线上验）：
  ① 横幅 首页→文章页 = post-meta 出现「CSS100Day(28)-振铃动画 / 发布于 2026-06-22」、home 层 `hidden`；
     文章页→首页 = post-meta 消失、`Lovely Life` 回来。**两向都过。**
  ② 评论区：硬加载文章页 `#twikoo` 挂载（3 个子节点，`#tcomment` 已被吃掉，符合十-13）；
     **从首页软导航进文章页同样挂载**，且表单已渲染出「昵称/邮箱/网址/0-500」——**没验"能真发一条评论"**。
  ③ 重 init 记账：线上各 key 每趟导航 `reinitRuns` 差值 = 1（typewriter/calendar/category-bar/cover-image/twikoo/rec 全部）。
  ④ 控制台 **0 error 0 warn**。
- 上一批（11:12，V0.1.20）的验收记录仍有效，细节已并进 AGENTS 与第二节，此处不再复述。

### ⬜ 上一批（10-01 上午及之前）待用户肉眼验收——**他都还没回话，别当已验收**

1. **相册压缩后的清晰度**（这批唯一有画质取舍的改动）：五个相册逐张看一眼，
   特别是 `yuanmingyuan`（多张压到 1280w/q64，−18%~−52%）与灯箱放大后的效果。
   不满意就说要哪几张回退——原图在 git 历史里（`git checkout <旧提交> -- public/gallery/...`）。
2. **手机上重走这两条路径**：① 归档页刷新 → 点回首页，看封面是否直接出图（以前是白框不褪）；
   ② 任意切页后点汉堡按钮，看能否弹出（以前点不动）。
3. **竖条新尺寸**：375px 下 103×272（原 144）。要再调只改 `PostCard.astro` 的 `coverWidth = "30%"` 一处。
4. **移动端底部「最新动态」卡** 与 **新「站点信息」卡**（展开区默认收起；Node 那格是通用图标
   `material-symbols:memory`，要官方 logo 得先装 `@iconify-json/fa7-brands`，见 AGENTS 五-29）。
   他报的「展开区下面 padding 很怪」已修并 18:13 上线（根因是 `max-height:16rem` 比内容 262px 小、
   把底部连 padding 一起裁掉，另有一层多余 `px-3` 让小块缩进 29px 与常驻行 17px 不齐）——
   **需要他再看一眼确认观感**。
5. 昨天遗留未验收的两项仍在：**新相册封面选图与顺序**、以及新封面观感。

**2026-10-01 这批新增的要你肉眼过一下**（**已上线**，直接看 http://47.108.230.220/ 即可）：

6. **评论区两条路径**（本批改了 init 的注册方式，这是唯一有回归风险的地方）：
   ① 直接刷新一篇 `/posts/…/` 文章页要出评论；② 从首页点进文章也要出评论。
   两条我都用浏览器验过（`#twikoo` 渲染出来了），但**没验"能发评论"**——那要真发一条，你自己决定。
7. **随机文章列表**：切页后仍能换一批、不闪、不重复渲染。
8. **搜索**：`lang` 改成 `zh-Hans-CN` 后索引重建过，我做过 A/B（动画 12→12、flex 7→7、振铃 1→1，
   首条结果逐条一致），你再随手搜两个词确认命中高亮正常。
9. **meCard 的 RSS 按钮**现在应打开 `/rss.xml`（原先跳首页）。

### 🟡 还挂着的事

1. **动态页二期还剩三项**：搜索、年份筛选、图片画廊（第四项「侧栏最新动态」已完成，
   且 09-30 又补了移动端底部那一份，见 AGENTS 五-24）。
   做前按 AGENTS 第一节先扒参考实现再走 brainstorming。
   ⚠️ 三项里凡是**要深链到某一条动态**的，都会撞同一堵墙：feed 条目是客户端从 `<template>` 克隆的、
   **没有锚点可指**（`DynamicItemTemplate.astro` 不设 id + `SwupManager.astro:77` 无条件回顶），要先补三处。
2. **服务器回滚资产**：个数与占用是**会变的状态**，只在第三节那行维护（AGENTS 运维条也是这个口径）。
   **必须用户明确说才删**，我不会自己动。
3. **2026-09-30 那批「报了但没做」的清单——2026-10-01 已清掉大半，剩下的都在下面**
   （别重新扫一遍，直接从这里挑）：
   - **✅ 已做完**（细节见 AGENTS 十-12 / 十-13 / 五-30 / 五-31 与四笔提交）：`<html lang>` 改合法
     `zh-Hans-CN`、`ThemeIcon` 补 `aria-label`、`meCard` 重复 `aria-label` 与 RSS 按钮指向 `/rss.xml`、
     `global.css` 两处重复声明、`env.d.ts` 5 条零引用声明、`src/assets` 5 个重复图标、`Tags` 的死类名
     `collapsed`、`[...slug]` 双 `render()`、`PostCard` 无谓 `render()`、posts 集合 13 遍→记忆化、
     容器内脚本重复注册监听（Twikoo / 随机文章）。
   - **✅ 两条「待核实」已核实，别再当悬案**：① TypeMechine 不是"5 遍"而是每次导航 3 个入口 × 2 = **6 次**
     init，且它 `window.swup.hooks.on` 那两行**从来没注册上**（内联 module 文档序在 SwupManager 的外链
     module 之前，跑到时 `window.swup` 还是 undefined）；它在容器外，所以监听器不累加，只是打字动画重放。
     ② `rounded-(--radius-large)` 是 **4 处类写法 + 2 处 CSS 引用 = 6 处**，`--radius-large` 确实从未定义，
     全部按直角渲染（与五-16 结论一致，只是数目记少了）。
   - **❌ 昨天那句"twikoo 按 path 存评论、尾斜杠不一致会分到两个线程"是错的**，已证伪并随之简化：
     `Twikoo.astro` 的 `getCurrentPath()` 一直无条件覆盖 SSR 传下来的 path，各写法归一后是同一个线程。
     那条 SSR 链路（`Comment` 的 `post`/`customPath` 与 `Twikoo` 的 `path` prop）已整条删除。
     → 文章 URL 仍有 **6 处手拼**（`PostPage.astro:27`、`comment/index.astro` 已删则不算、
       `RecommendedPost.astro:113`、`Calender.astro:370/433`），要统一成 `getPostUrlBySlug` 仍是待办。
   - **⏳ 仍要做但要用户先拍板的，见下面「🔴 等拍板」一节**（品牌名 ✅、schema 6 字段 ✅、`onReinit` 抽象 ✅、
     `@astrojs/check` ✅、服务器路径脱敏 ✅ —— 2026-10-01 下午全部拍完并做完；
     现在只剩「PostCard 锁图标要不要补」与「全站 title 带不带后缀」两条）。
   - **⏳ 刻意没做**：`Calender` 与 `RecommendedPost` 各一份 `__allPostMetaCache` fetch（抽公共要引入
     脚本加载顺序契约，收益不值当）；**原先挂在这条里的「30 处导航后重 init 脚手架」已于 10-01 下午
     全部收编进 `reinit.js`，别再当待办**（AGENTS 十-14）。
   - **性能两项被用户否掉/未选，别当新发现再提**：Twikoo 无 defer（589KB × 27 页）、横幅 srcset 缺
     750w 档。都是用户看过后选择不做的。
   - **代理报了但我判定降级**：每页两个 `<title>`（内容一致，只是无效 HTML）；
     重复 id `cardTags`/`announcement`/`banner`（无脚本查询，无死控件）。
   - **既存小怪象**：只有 1 个分类时分类卡收起态 120px 反而比展开后 40px 高
     （模板写死的 `collapsedHeight: 7.5rem`）；`/site.webmanifest` 的 Content-Type 是
     `application/octet-stream`（nginx mime.types 缺 webmanifest，要修得改服务器）。

4. **🔴 需要他决定或给信息的（2026-10-01 已拍掉一大半，剩下的见各条标注）**
   1. **✅ 品牌名已统一（2026-10-01，用户拍板「亦林 YILIn」）**：规则与"只改哪里"见 AGENTS 五-32。
      产物实测：首页 `<title>`/`<h1>` = 亦林 YILIn，5 个列表页后缀改 `-亦林`，全 dist 旧拼法 0 命中。
      ⚠️ 仍待他决定的一件事：**文章页/相册页/about 的 title 是裸标题不带后缀**（历史行为，没动）；
      要全站带后缀就会改到 26 页 title，属 SEO 决策。
   2. **meCard 三个社交按钮的真实地址**：QQ / 微信 / GitHub 现在仍 `href="/"`（点了跳首页）。
      RSS 那个已改好。给我地址我就填；微信一般是二维码，那要换成交互不是链接。
   3. **✅ 已批准的「四件工程项」全部做完（2026-10-01 下午）**——细节不再复述，指路即可：
      - **删 frontmatter 6 个零消费字段**（`lang` `author` `sourceLink` `licenseName` `licenseUrl`
        `passwordHint`）→ AGENTS 五-5 与九节表格。**原待办里"要同步脚手架模板"那条是多余的**：
        `scripts/new-post.mjs` 的 `buildFrontmatter()` 本来只写 9 个真在用的字段，一个字没改。
      - **抽 `onReinit(fn)`** → **AGENTS 十-14**（实现 `public/assets/js/reinit.js`；实收 34 处 / 12 个文件；
        顺带修掉 `CategoryBar.initScrollFeatures` 与 `FloatingToc.setupAutoClose` 两条真累加）。
      - **装 `@astrojs/check`** → AGENTS 三节 + 九节「`astro check` 首跑」：查出并修了 4 个类型问题，
        现在 `npm run check` = 0 error（2 条 hint 是故意留的）。
      - **文档服务器信息脱敏** → AGENTS 六节开头；真实值与展开版部署命令在本地私密记录
        `reference-deploy-targets.md`。**只改了当前版本，历史没重写**（他从未批准 `git filter-repo` + 强推）。
      ⚠️ **这四件已全部提交、推送并于 21:20 上线（V0.1.21）**，线上验收证据见第一节「交付状态」。
   4. **🆕 本批查出来、等他拍的（只有一条）**：**加密文章的锁图标其实从来没渲染过**——
      `PostCard.astro:39` 接了 `password` 但从不读（`astro check` 的 `ts(6133)` 抓到），
      AGENTS 五-5 原先"列表卡显示锁图标"那句是假事实，已改成实情。
      补法很小（一个 `material-symbols:lock` 图标 + 一个条件），**但当前零篇加密文章 → 无可见影响**，
      属"要不要补个缺失的 UI"的设计决定，**别自动顺手加**。
      （没有顺手删掉这个 prop，因为它是"UI 缺失"不是"死代码"，删了就把缺陷藏回去了。）
   7. **仍要他给信息才能做**：meCard 的 QQ / 微信 / GitHub 真实地址（见上面第 2 条）。
5. **公开仓库暴露面**：2026-10-01 安全代理全历史扫过 —— **零凭据泄露**（零私钥块、零密码/token 值、
   零 `.env`、零面板地址/端口/安全入口、零手机号/身份证、提交信息干净、6 个 dangling commit 也查了）。
   **✅ 当天已按用户批准做完文档脱敏**：SSH 登录目标、服务器绝对路径、宝塔 vhost/extension 配置文件名
   从 `AGENTS.md` / `HANDOFF.md` 移出，改成占位符；真实值与展开版部署命令在本地私密记录
   `reference-deploy-targets.md`（project memory，凭据本身哪份记录都不存）。
   ⚠️ **只改了当前版本，历史仍可读到旧值**（彻底清除要 `git filter-repo` 重写历史 + 强推，用户从未批准）。
   风险有限：密码登录已关、裸 IP 本就公开（它在 `siteConfig.ts` 与每页产物里）。
   仍未处理的一条：**Twikoo `envId` 是裸 `IP:8099`**，前端 JS 里公开，若该实例没设访问限制
   可被垃圾评论写入（建议改同域反代路径，属服务器改动，要用户拍）。
6. **宝塔面板密码**曾在对话中明文出现过，用户选择暂不改；面板 IP 白名单未开。
7. **Mermaid 专属的 2 个未定义变量**（`--text-color-secondary` / `--primary-hover`）**故意留白**：
   零页面可达、无从验证。等首篇 Mermaid 文章时按 AGENTS 第八节在 dev 逐项验，届时一并定值。
8. **首篇用到 Mermaid / KaTeX / callout / 图片网格 的文章仍未写**——那四条渲染路径至今零实战验证（AGENTS 第八节）。
9. 🆕 **同一根因的第二处：侧栏卡片不随软导航更换**（2026-10-01 晚查横幅 bug 时顺带查出，**已报告用户、等他拍**）。
   - 证据：`RightSideBar.astro:33` 是 `isPostPage ? <SiderBarToc/> : <Calender/>`，而侧栏在 `#swup-container` **外面**、
     又没登记成 Swup container → **线上实测**：从首页软导航进文章页后 `#sidebar-toc` 不存在、侧栏里还是
     35 格日历（`hasSidebarToc:false / hasCalendar:true`）；硬刷新同一篇则正常显示 5 条目录。
     反向（文章页→首页）同理会一直挂着旧目录。**只有 ≥1280px 才看得见**（`#right-sidebar` 是 `hidden xl:block`），
     所以窄视口下不容易发现。
   - **属既存缺陷，不是本批引入**（旧构建的 containers 同样只有 `#swup-container`）。
   - 参考站的解法就是把侧栏登记成 container（它有 `#left-sidebar-dynamic` / `#right-sidebar-dynamic`）。
     ⚠️ 但我们这边**不能照抄了事**：侧栏里那几张卡是**双挂载**（xl 右栏 + 移动底部堆，AGENTS 五-29/五-24），
     移动底部堆是另一个子树，只加 `#right-sidebar` 会漏；而且 AGENTS 五-24 明确写过"侧栏在容器外"是
     **当初选静态渲染而非岛的理由**，改成 container 会让那条论证过期，要一并重写。
   - 要做的话：加 container（两个子树都考虑）→ 重跑十-14 那套探针（双挂载卡的 `reinitRuns`、
     内联脚本重新求值后的监听计数）→ 1440/375 两档 iframe 核卡片内容与顺序。**别顺手就改，先问。**
10. ✅ **`/assets/js/reinit.js` 的 12h 缓存已解决**（2026-10-08 下午，选了当时倾向的 ②，**没碰服务器配置**）：
    `BaseLayout` 现在引用 `reinit.js?v=<sha256 前 10 位>`，构建期算内容哈希，改一次文件换一次 URL。
    ⚠️ 落地时踩到一条：路径**必须按 `process.cwd()` 拼**——预渲染阶段这段代码住在
    `dist/.prerender/chunks/*.mjs` 里，用 `import.meta.url` 相对去找 `../../public/` 会指到 `dist/public/`，
    `ENOENT` 直接把构建打挂。细节与响应头实测见 **AGENTS 十-14 末条**。
    → 同类未做：`assets/js/twikoo.nocss.js` 等其他 `public/` 下稳定名文件仍吃 `max-age=43200`，
      只有在**将来要改它们内容**时才需要同样处理，现在不必。
11. ⬜ **新文章（含 16:24 那次同步与改名）已上线 V0.1.23，程序化验收全过，但还欠他一次肉眼验收**
    （直接看 http://47.108.230.220/posts/ccnewtools-manual/ ）：
    ① 11 张截图的清晰度，**尤其手机上 295px 宽够不够看**（不满意可指定回退成原分辨率 PNG，
    原图在他项目目录里没删）；② 两张表在手机上横向拖动是否顺手；
    ③ 我删掉了他原手册里 **8 条 `---` 小节分隔线**（prose 的 h2 间距已够，且这是全站第一次真用到 `hr`），
    要保留分隔感一句话就能加回；④ 顶部分类栏多出「工具」胶囊的位置对不对；
    ⑤ 新标题「大纲生成说明、记录工具使用手册」这个叫法他自己再看一眼顺不顺。
12. ⚠️ **文章图片灯箱"真人点击能否弹出"仍未验证**（本批唯一没闭环的一项）。
    本会话的浏览器 surface 顶层视口 0×0，合成 `click` 又被 Fancybox 挡了，所以我只证明了**因果链成立**：
    修复后有正文图的页面会请求 Fancybox 本体 chunk（线上实测 `/posts/ccnewtools-manual/` **有加载** `dist.*.js`，
    无正文图的 `/archive/` **不加载**）。这不等于"点了真能开"。**要他亲手点一次确认。**
13. 🆕 **`css100天-第8天.md` 的宽表在 375px 下仍被裁**（2026-10-07 查出，**既存缺陷、非本批引入**，等他点头）。
    那张表 375px 下 653px 宽，被 `[...slug].astro:61` 那层 `overflow-x: hidden` 裁掉 = 内容看不见也拖不动。
    解法就是本批新立的八节 7 规矩（包 `.horizontal-scroll-container`），但它**缩进在列表项内**，
    包 div 要连带改列表结构 → 属改他旧文章，**不自动动手**。
14. 🆕 **`Markdown.astro` 里 `propse-base` 是 `prose-base` 的拼写错**（同批查出，**故意没改**）。
    该工具类从未生效，但它正好是 `prose` 的默认字号所以**现在完全看不出异常**；
    补上会改全站 27 篇文章的正文排版 → 视觉决策，要改先做前后对比再问他。
    （参考站那篇的容器是 `prose dark:prose-invert prose-base max-w-none! custom-md`，可对照。）
15. ✅ **源手册版本号自相矛盾 —— 已按他「按实际版本走撒」修掉**（2026-10-07 17:1x）。
    他的 `E:\Chentools项目\CCNewTools\使用手册\使用手册.md` 第 3 行三次漏改（正文升到 1.1.3/1.1.4，
    那行还是 v1.1.0）。现已改成与实际一致，**源手册与博客文章两边零差异**。
    → 下次同步前仍要先核：`grep -n "v1\.1\.[0-9]" 使用手册.md` 若出现两个不同值就先问再动。
16. ⬜ **等他复测两条（V0.1.26，线上已改）**：
    ① **文章详情页 F5 → 点主页**，首页列表封面是否还永远转圈（这条是新定位的根因，见顶部 ② 与 十-14；
      顺带说明**他昨天报的手机 Edge 那条很可能一直是它**，不是 Edge）。
      若**仍然**转圈，再回到五-35 那条"超时兜底"的讨论，并且要先拿到手机端可读的诊断证据，
      别用兜底把真实成因盖住。
    ② **框选 / 点击正文文字**（尤其中文里带链接、或鼠标经过标题尾部那个隐形 `#`）时是否还跳。
      我这边实测行盒增量已从 +0.762px 归 0；**剩下唯一没排掉的是"选中高亮画偏"这类绘制层问题
      （已摘掉正文上的常驻合成层 `transform`），而我这个 surface 没有像素证据可拿**，
      所以他一句"还在跳"我就会继续往合成层/`will-change` 那侧查。
17. 🆕 **本会话新增的一条工具性坑（值得记）**：隐藏标签页里 **`setTimeout` 被节流到 ≥1s**，
    所以"逐帧/多趟导航"的浏览器探针脚本会**直接 15s 超时**（本会话连撞两次）。
    做这类探针要先注入 `*{animation-duration:0s!important;transition-duration:0s!important}`
    让 Swup 的动画等待立刻落地（同时 visit 也就不会卡在 `is-changing`），
    或者干脆改成**直接驱动 `el.getAnimations()[0].currentTime`** 这种不依赖时间的读法
    （本次验 `backwards` 在 delay 期的表现就是这么测的）。

### 🔧 常用操作（都已验证可用）

- **发新动态**：在 `src/content/dynamic/` 建 `YYYY-MM-DD-HHMMSS.md`，
  frontmatter 写 `published: 2026-09-29T13:30:00+08:00`（**必须带 `+08:00`**，见 AGENTS 五-23），
  可选 `pinned: true` 与 `location: 某地`；然后 `npm run build` + 第六节部署。
- **写新文章**：`npm run new:post -- --day 29 --title "标题"`（系列）或 `--slug <ascii-kebab>`（非系列），见 AGENTS 五-26。
- **加相册图集**：`public/gallery/<id>/1.jpg…` + `galleryConfig.albums` 追加一项，见 AGENTS 五-28。

---

## 二、历次会话做了什么

### 2026-10-10 傍晚：手册同步到 CCNewTools v1.4.0（**已上线 V0.1.36**）

- **他的原话是「新发布一篇文章」**，但站内那篇 `/posts/ccnewtools-manual/` 就是这本手册，
  新建会留下两份互相矛盾的手册 → **问过一次，他选「同步进现有那篇」**（永久 URL 这项从来不替他假设）；
  标题按他说的改成「**CCNewTools V1.4.0 使用手册**」，**slug 不动**（改标题不改 URL 是老口径）。
- **正文差量**（归一化逐行 diff 得到：69 增 / 36 删）：版本 8 处、适用对象加「或生成各类需求追踪表」、
  一节改成「**工具集**是干什么的」并新增工具集首页图 + 「工具 / 干什么 / 产出」表、
  二节拆成工具一三步 + 工具二两步、三节控制台首行改「测试文档工具集 v1.4.0」并加 3 条顶栏要点、
  四~六节标题「第 N 屏」→「**工具一**」、**新增整节「七、工具二：追踪文档生成」**（四类追踪表 + 7.1 操作流程 + 7.2 要点）、
  原七八节顺延成八九、**新增 Q14 / Q15**、尾行 v1.4.0。
- **配图 11 → 16 张全部重转**：源图从 `1600×900` 变成 `1943×970`（追踪那 4 张 `1280×800`）→ 证明是**真重拍**不是重存；
  统一 `resize(width:1600, withoutEnlargement)` + `webp(quality:88, effort:6)`，合计 **0.38MB**（原 PNG 1.94MB）。
  新增文件名：`00-toolset-home` / `12-trace-home` / `13-trace-report-pair` / `14-trace-note-preview` / `15-trace-report-preview`。
  ⚠️ 数图片引用**别用 `grep -c '^!\['`**——13 和 15 缩进在有序列表项里，会漏数成 14 张（我第一遍就数错了）。
- **八-9 那两处偏离已撤销**（他选「按新截图重新核」）：新图 `05-tree-search` 底部是「匹配 2 / **10** 个用例」、
  `02-parsed` 统计条是 5 测试项 / 10 用例 / 18 步骤 / 1 告警、顶栏徽标 **V1.4.0** → 正文回到 10、尾注删除。
  **通用口径留着**：图不动时以图为准；**图一旦重拍，旧偏离自动作废，必须重新逐张核**。
- 他手册这次**自己删掉了**站内那句「获取工具 → CCNewTools 仓库」→ 跟着删，
  HANDOFF 上挂了几轮的「要删一句话」待办就此了结。
- **同步自检硬标准**（这次跑通的）：两边归一化（剥 frontmatter / 去一级标题 / 图片路径映射成 `IMG:NN` /
  弯引号还原 / 折叠块引用空行）→ `diff -u` → 同步完**复跑一次 diff，剩余差异必须只剩站内规矩三类**：
  3 处宽表包 `.horizontal-scroll-container`、2 处围栏补 `text` 语言、15 处 `**Qn：**` 与答案之间补空行。
  ⚠️ 包宽表的判据**要按显示宽度算（CJK 记 2 列）**：第一版按 `line.length > 78` 判，把 5.1 那张中文表漏包了。
- **验收**（build 0 / `astro check` 0 error 4 hint / preview + 线上 + 定宽定高 iframe）：
  16 张图全被引用、**零破图**、`dist` 里无孤儿文件；`h1`=1、`h2`=11（9 节 + 评论区 + 目录）、`h3`=8、**零层级跳变**；
  3 个滚动容器在 375 下 `scrollWidth` 1021/726/738 vs `clientWidth` 294 **全部可横滚**，1440 下窄表不滚（正常）；
  两档 `scrollWidth-clientWidth = 0`；正文 v1.4.0 ×10、**v1.3.3 / v1.1.0 / 110 个用例 全部 0 残留**；
  搜索：gunzip 分片剥掉零宽分隔符后「追踪文档生成 / 需求追踪表 / 报告追踪 / Q15」全命中该篇（详见 AGENTS 九节新增的 U+200B 假阴性条目）。
- 线上已验收：文章页 200 / 168414B、5 张新图 200、首页 200、`pagefind-entry.json` 200、展示版本 **V0.1.36**。
- ⚠️ **分节线从 1 条变成 10 条**（他手册本来就有 10 个 `---`，旧版站内只保留了 1 个）→ 照实同步了。
  站内没有 `hr` 规则、走浏览器默认细线，但**观感变了，要他看一眼是否接受**（不接受就在转换器里滤掉）。

### 2026-10-10 傍晚：PostMeta 日期与图标间距拉平（**已上线 V0.1.35**）

- 他截图指文章页那行元数据（发布日 / 更新日）说「文字和图标靠得太近」。**先在 1440×900 iframe 里量了实际像素**：
  四个条目的 `.meta-icon` 都是 32×32 色块 + `margin-right: 8px`，**但分类/标签的文字包在
  `<a class="btn-plain … p-1.5">` 里**，字形离色块右缘是 14px；两个日期是裸 `<span>`，只有 8px
  → **同一行里两种间距**，他看到的"紧"就是日期那两条。
- 修法：给 `PostMeta.astro` 的两个日期 `<span>` 补 `px-1.5`（与锚点同款水平内边距），拉平到 14px。
  列表卡（`PostCard` → `PostMeta`）用的是同一个组件，**一并跟着修好**，没另改别处。
  参考站那边 `.meta-icon` 是 `width:1.125rem; margin-right:.375rem; background:none`（**没有色块**），
  所以它的裸图标 + 6px 间距是自洽的——**这条不能照抄**，我们的色块版必须靠文字侧内边距撑开。
- **验收**（build 退出码 0，preview + 线上各一遍，定宽定高 iframe，用 `Range` 量首字矩形）：
  文章页 1440 → 发布日 / 更新日 / 分类 **三条都是 14px**；文章页 375 → 同样 14px；首页列表卡 3 张 → 14px；
  两档 `scrollWidth-clientWidth = 0`；线上 `Layout.CB9SEZHQ.css` 已含 `.px-1\.5{padding-inline:calc(var(--spacing)*1.5)}`、
  首页与文章页 markup 里日期 span 带 `px-1.5`（部署前用 `grep -qF` 卡过）、版本 `0.1.35`。
- ⚠️ **本批被自己的探针骗了两次，都是同一类错：iframe 的 `src` 用相对路径时，它相对的是「顶层文档」的 origin**，
  而顶层当时停在**线上**站 → 我量到的是还没部署的旧页（`padding-left: 0px`、`found:false`）。
  → 铁律：**跨环境验证时 iframe 一律写绝对 URL，并把 `document.location.origin` 一起回读当证据**；
    顶层换过页面之后，之前所有 iframe 结论都要重跑一遍。
- ⚠️ 另外 `grep`/正则匹配 Astro 产物时注意 **`data-astro-cid-*` 会插在 class 与 `>` 之间**，
  按 `class="...">文本` 写的正则会假报「没生效」（本批两次踩到：日期 span、暂无标签）。

### 2026-10-10 傍晚：二维码浮层加开合动效 + 二维码只留码体（**已上线 V0.1.34**）

- **① 「打开没有动效」的根因**：JS 里写的是 `pop.hidden = !on` → `display:none ↔ block` 之间**没有可插值的属性**，
  所以浏览器根本不会生成过渡，点开就是瞬间出现。
  → 改成**状态只由按钮的 `aria-expanded` 表达**：CSS 用 `.me-wechat-btn[aria-expanded="true"] + .me-qr-pop`
  驱动 `opacity` / `visibility` / `transform` 三条 0.18s 过渡，闭合态 `visibility:hidden + pointer-events:none`
  （移出无障碍树与命中区，等价于原来 `hidden` 的可访问性表现），`prefers-reduced-motion` 下撤掉过渡。
  JS 侧只剩 `setAttribute("aria-expanded", …)`，`isOpen()` 改读该属性。**规则见 AGENTS 五-41。**
  ⚠️ 顺手确认的一件事：Tailwind **v4** 的 `-translate-x-1/2` 编译到 `translate` 属性、与动画用的 `transform` 互不覆盖，
  所以居中不会被缩放吃掉（**v3 不成立**，别照搬）。
- **② 二维码重裁**：他发的原图是手机截图，站内第一版是从白色卡片整块裁的（940×1392，含头像 + 昵称 + 地区 + 提示语）。
  这次只留码体：**按深色模块的像素边界程序化定位**（先扫行找 QR 带 → 再在该带内扫列 → 得 610×610 正方形），
  四周补 70px 静区（≈3.8 个模块）→ **750×750 无损 webp 63.3KB**（比原来 98.1KB 还小）。
  ⚠️ 裁切踩坑：第一版列扫描把**卡片外圈的深色边框**也算进去了（得出 `x0=0` 的整宽假框），
  必须先把扫描范围限制在卡片内部（x 20..919）；另外行剖面上 y=0..5 / y=1385..1391 那几条 900+ 的"实心行"就是那圈边框，别当 QR。
  ⚠️ 二维码**仍走无损 webp**（有损会把模块边缘糊掉、扫不出来）。
- **验收**（build 0 / `npm run check` 0 error 4 hint / preview + 线上各一遍，定宽定高 iframe）：
  点击后 `getAnimations()` 列出 **3 条 CSSTransition（opacity / transform / visibility）**，
  闭合态计算值 `opacity:0 / visibility:hidden / matrix(0.96,0,0,0.96,0,-6)`、打开态 `opacity:1 / transform:none`；
  浮层 192×192、图 `naturalWidth 750` 已解码、1440 与 375 两档都横向不出界、`scrollWidth-clientWidth=0`；
  线上 `/assets/wechat-qr.webp` 200 / **64848B** / `image/webp` / `no-cache`，首页 markup 已是 `width="750" height="750"` 且浮层不再带 `hidden`，版本 `0.1.34`。
- ⚠️ 判据教训（写进五-41）：**别用"等 200ms 再读 opacity"验过渡**——隐藏标签页里过渡不推进，
  要么读 `getAnimations()` 证明它启动了，要么 `anim.finish()` 强制落终态再读计算值。

### 2026-10-10 傍晚：波纹带高度对齐参考站（**已上线 V0.1.33**）

- 他拿参考站的截图说「我的波纹没有它那么大」。扒 `firefly.cuteleaf.cn` 首页产物那行 markup：
  `<div class="waves absolute -bottom-px h-[10vh] max-h-37.5 min-h-12.5 w-full md:h-[15vh] md:block" id="header-waves">`
  —— 我们 `Waves.astro` 是同一行**但写的是 `max-h-12.5`、且没有 `min-h`**。
  Tailwind v4 里 `12.5` = `calc(var(--spacing)*12.5)` = **50px**，`37.5` = **150px** → 桌面 `md:h-[15vh]`（900 高时 135px）
  被我们那个 50px 上限**整个夹掉**，所以波纹一直矮 2.7 倍。
- 改动就是 `src/components/headers/Waves.astro:7` 一处：`max-h-12.5` → `max-h-37.5 min-h-12.5`。
  **没跟着加 `md:block`**——那是他们家波浪可关闭（`localStorage.wavesEnabled` + `data-waves-enabled`）才需要的，
  我们没有那套开关，加了是空类。
- 也确认过我们这边**没有别处再钉高度**：`src/styles/waves.css` 的 `#header-waves` / `.waves` 只有
  `isolation/contain/z-index/transform` 与动画，唯一的尺寸类是 <1024px 的 `.waves svg{min-height:60px}`（保留）。
- **验收**（build 退出码 0 + preview + 定宽定高 iframe；`vh` 必须给 iframe 真实高度才准）：
  1440×900 → **135px**（改前 50）、375×800 → **80px**（改前 50）、1920×1080 → **150px**（撞 `max-h-37.5` 上限），
  与参考站的类换算逐档吻合；横幅标题底边 303 / 打字机底边 331，**都在波纹顶 452 之上、没被压住**；
  三档 `scrollWidth-clientWidth` 均为 0；线上产物已能 `grep -qF "max-h-37.5"`，版本 `0.1.33`、无 `0.1.32` 残留。
- ⚠️ 这类病的通名与核法已写进 **AGENTS 一·参考源用法第 5 条**（照抄时尺寸类最容易漏，光比源码字符串会漏掉 `--spacing` 换算）。

### 2026-10-10 傍晚：meCard 那排社交按钮改成能用的（**已上线 V0.1.32**）

- **他报的是「点击这一排按钮没效果」**。查下来根因是 `src/components/card/meCard.astro:18-20`
  三个 `<a href="/">` 占位从没填过地址；在首页点 = 同 URL 点击 → 被 `SwupManager.astro:63-79` 那条
  「点当前页自身链接 → 平滑回顶」的 capture 监听接走，所以既不去别处也不报错，看着就是死的。
  （RSS 那个 `href="/rss.xml"` 本来就是真链接，能跳。）
- **先扒了参考站**（`firefly.cuteleaf.cn/about/` 原始 markup，未剥标签）：它这排是
  `<a rel="me" aria-label="GitHub" href="https://github.com/CuteLeaf" target="_blank" class="btn-regular rounded-lg h-10 w-10 active:scale-90">`，
  四项为 **GitHub / Email / RSS / Atom** —— **参考站没有 QQ 和微信**，所以那两个按业界常规另做（已在他面前明说）。
  按压反馈 `active:scale-90` 我们的 `.btn-regular` 已自带（`mainSingles.css:9`），**差的只是真实 href 和 target**。
- **四项落地**：① GitHub → `https://github.com/ks3356143`（他选的，与 `/about/` 里那条链接一致）；
  ② QQ → **点击复制** `314298729`（他给的号，与 `/about/` 那个 `314298729@qq.com` 对得上），
  复制失败时提示条直接把号码显示出来；③ 微信 → **点一下弹二维码浮层**（Esc / 点外部都能关，`aria-expanded` 同步）；
  ④ RSS → 加 `target="_blank"`（他勾的），顺带让 Swup 不去解析 XML。
  ⚠️ 带 `target` 的链接会被 `SwupManager:70` 主动跳过，所以外链不会走软导航 —— 这是选 `target="_blank"` 的第二个理由。
- **二维码图**：他发的是手机截图（1220×2656 JPEG 492KB），**按「白色卡片像素边界」程序化裁出** 940×1392
  （先扫亮像素行找连续段 → 再按该 y 区间扫列 → 各留 6px 白边），存 `public/assets/wechat-qr.webp`
  = **sharp 无损 webp（`{lossless:true, effort:6}`）98.1KB**。⚠️ **二维码不能走有损压缩**（模块边缘糊了就扫不出来），
  所以没沿用八节那条 `quality:88` 的常规做法。
- **顺带修的同族真缺陷**：`CopyShare.astro` 的「复制链接」在线上**一直是静默失败的**——
  站点是裸 IP + 纯 HTTP，`navigator.clipboard` 在非安全上下文里压根不存在，那句 `await navigator.clipboard.writeText()`
  第一帧就抛 TypeError、被自己的 catch 吃掉，只往控制台打一行。**preview 是 localhost = 安全上下文，本地永远测不出来。**
  两处都改成「先判 `navigator.clipboard && window.isSecureContext`，否则 `textarea + document.execCommand("copy")`」。
- **`astro check` 抓出来的两个真问题**（这趟值得装它）：① `setOpen(pop.hidden)` 报 ts(2345)——
  TS 新 DOM 库里 `hidden` 是 `boolean | "until-found"`，改成 `Boolean(pop.hidden)`；
  ② 我给 `CopyShare` 的 `is:inline` 脚本写了 TS 断言 → **ts(8016)，而且 `is:inline` Astro 不转译，
  断言会原样进 HTML 变成浏览器语法错误**（详见 AGENTS 五-39）。
- **验收**（`npm run build` 退出码 0、`npm run check` 0 error / 4 hint、preview + 定宽 iframe 1440/375）：
  四个按钮 40×40、`aria-label` 齐；GitHub 产物里 `target="_blank" rel="me noopener"`、RSS `target="_blank"`；
  占位 `href="/"` **残留 0 处**；点微信按钮 → `hidden=false` / `aria-expanded=true` / `display:block`，
  浮层 192×276（图 174×258，`naturalWidth 940` 已解码），点外部与 Esc 都能关；
  强制 `isSecureContext=false` 后点 QQ → 走退路、提示条显示 `QQ：314298729`（合成点击无用户激活，属预期降级）；
  两档 `scrollWidth-clientWidth` 均为 **0**；控制台 0 报错。
- ⚠️ 两处探针踩坑（都记在 AGENTS 五-40 / 一节的 iframe 口径里）：顶层 surface 视口 **0×0**（第一次量出「104px 横向溢出」是假的）；
  以及**用 `offsetParent` 判浮层可见性必然为 null**（它默认 `hidden`），要拿按钮那份实例再取兄弟节点。
- **他还没验的**：真人手机上点二维码浮层能不能扫出来（我这边只能证明图解码正常），以及 QQ 复制在他自己浏览器里的实际反馈。

### 2026-10-10 下午：发了一条动态（**已 commit `1e277f8`、已推送、已上线 V0.1.31**）

- 他给的原话是「最近正在做CCNewTools，以及Chenmeridian，加油」，**落盘时在中文与拉丁名之间补了空格**
  （站内其余文案都是这个写法）；未置顶、无地点，frontmatter 只有 `published: 2026-10-10T16:23:00+08:00`。
- 文件名 = 条目 id：`2026-10-10-162300.md`（`YYYY-MM-DD-HHMMSS`，五-24）。
- 自测（build + preview + 定宽 iframe）：`dist/api/dynamic.json` **2 条且新条目居首**；
  feed 实测 1440 与 375 两档都 2 条、时间显示 `2026-10-10 16:23`（**时区偏移正确**，五-23 那条差 8 小时的病没犯）、
  `.dynamic-pinned` 两处均 `hidden` + `display:none`（五-24 末尾那两条 `[hidden]` 规则在起作用）、
  两档 `scrollWidth - clientWidth` 均为 **0**。首页侧栏「最新动态」两处挂载都带上新条目（`dist/index.html` 里 4 处命中）。
- 上线：部署前**只读**确认 `nginx -T` 的 root = `/www/wwwroot/chenBlog/dist`（同机并存 `lobe-chat` / `testplantAI`，不碰），
  再走第六节原子替换。线上 `dynamic.json` 2 条、首页含新文案、展示版本 `0.1.31` 且无 `0.1.30` 残留、
  `/` `/dynamic/` `/api/dynamic.json` 三个 200 且 `Cache-Control: no-cache, must-revalidate`。
- ⚠️ 本会话浏览器 surface 顶层视口仍是 **0×0**，第一次直接量布局报的"104px 横向溢出"是假信号 ——
  量布局照旧必须用定宽 iframe（第一节末尾那条）。

### 2026-10-08 全天：上午两条首屏图片问题（V0.1.25）+ 下午他复报后挖到真根因（V0.1.26）

**上午**（V0.1.25，已上线已推送）：他报"手机 Edge 首次进首页图片一直转圈"与"桌面首次进首页逐渐变大的图片上有一行字在飘"，
当场查掉两条成因（装饰图 alt 会被画出来 + `ImageWrapper` 的 `alt || "图片"` 兜底；`CoverImage.onError`
对本地图直接 return 导致遮罩永不褪）→ 落 **五-34 / 五-35**。报给他时明确说了"手机那条只算修掉一个成因"。

**下午**（V0.1.26，本批 4 笔 + 文档，已推送已上线）：他带着**新的精确复现路径**回来
（"文章详情页 F5 → 点主页 → 列表图片一直转圈，刷新正常"，以及"框选/点击正文时文字往上移动一下"），
两条都重新走了一遍"先定位根因再动手"：

1. 🔴 **封面转圈的真根因在 `reinit.js`，不在 `CoverImage`**：`navigating()` 那句"紧接着 runAll 一定会跑"
   只对**已存在的 key**成立。Astro 组件脚本编译成 `<script type="module">`，插进容器要到下一个宏任务才求值，
   而 `swup:contentReplaced`（→ `runAll`）在 `content:replace` 当趟就同步派发完；
   `ranFor` 又被初始化成当前 token，紧随的 `astro:page-load` → `catchUp()` 判定"跑过了" → **一次都没跑**。
   线上用「包一层 `window.onReinit` 记录注册时机」取证：`register cover-image | is-changing=true | runsBefore=-1`
   之后没有 RUN，`reinitRuns=0`、`data-initialized` 0/10、`data-loading="true"` 10/10（8 张已解码）；
   手动补一次 `runAll` → 立刻 10/10 绑上 = 因果闭环。
   ⚠️ **第一版修法（"新 key 注册即跑"）是错的**：同步脚本那一路变成注册跑一次 + runAll 再跑一次 =
   一趟 **+2**（实测 `recommended-post`）。最终改成 `ranFor: -1` + 导航途中注册时让出一个宏任务后自查。
   回归判据「每趟导航每个 key 恰好 +1」在两趟导航上全部成立（`site-status` 那个 4 含解析期双挂载 2 次）。
   → 这也解释了**他昨天手机那条**（第一次进首页就转圈 = 从文章页软导航进首页），不是 Edge。
2. **文字跳：`::selection` 是清白的，元凶是 hover 态的 `border-bottom`**。全站只有两条 selection 规则且只设
   `background-color`；真造选区实测 Range 矩形与 `scrollY` 零变化 → **排除布局/滚动/JS 三类**。
   逐条隔离三条 hover 声明后定位到 `border-bottom: 1px dashed` 有 **+0.762px 行盒增量**
   （标题尾部那个 `opacity:0` 却仍可命中的隐形 `a.anchor` 同样中招，且它 `transition: all` 是渐进撑开）。
   ⚠️ **这条是我 09-29 那次"把失效的 `var(--link-hover)` 补成 `--primary`"让它真正生效而带出的回归** →
   九节 item 4 的旧结论已就地推翻。现 hover 只加底色，实测增量归 0。
   同批把 `.onload-animation` 的 `forwards`（把 `translateY(0)` 永久留在正文容器上 = 常驻合成层）改成 `backwards`
   并删掉配套的基础 `opacity: 0`；实测 delay 期仍 `opacity:0 / translateY(32px)`、终态 `transform:none / opacity:1`。
   ⚠️ 这条属"剩下的唯一候选"，**绘制层的问题我这边拿不到像素证据**，报给他时按候选口径说。
3. **配套做的**：`reinit.js` 引用改成构建期内容哈希（它吃 Nginx `max-age=43200`，否则这次改动会留给回访用户 12h）；
   **没碰服务器配置**。踩到一条：哈希路径必须 `process.cwd()` 拼，用 `import.meta.url` 在预渲染阶段指向
   `dist/.prerender/chunks/` → 找 `../../public/` 变 ENOENT、**构建直接挂**（这也是"先构建再吹"救回来的一次）。
4. **工具性坑（新）**：隐藏标签页里 `setTimeout` 被节流到 ≥1s → 我的两条多趟导航探针连续 15s 超时；
   改用**直接驱动 `getAnimations()[0].currentTime`** 做不依赖时间的读法。`:hover` 无法用 JS 触发 →
   只能"手动施加同一组声明"做等价验证。AGENTS 里另有 375px/0×0 视口那套 iframe 量法本批继续全程在用。

**验证与交付**：`npm run build` 退出码 0、`npm run check` 0 error / 2 hint（基线未变）；preview 与本批两条
判据全部达标后才推；**线上实测数字与 preview 一致**（详见第三节快照行）。回滚资产 27 个全留。

**傍晚追加（V0.1.27，手册同步 v1.1.5）**：他 16:30 更新了源手册，并说"图片别动，里面有敏感东西"。
做法是**归一化逐行 diff**（把图片引用、表格包裹、`text` 围栏标签、引号方向、FAQ 空行、正文 H1、`---` 分隔线
这些站内规矩造成的差异全部抵消后再做 LCS），一次拿到 5 类真实差量并确认无漏项；写回时用逐条
`rep(from, to, 期望次数)` 断言，任何一条匹配数不符就整体抛错，最后再断言 **11 条图片引用与改前逐字节相同**、
行尾仍是纯 CRLF。
🔴 过程中**顺手抓出一个 10-07 自己埋的哑 bug**：引号方向改写把 `<div class="…">` 的属性引号也一起改了，
产物里 class 值带弯引号 → 选择器永不匹配 → **八-8 的宽表滚动容器从来没生效过**。
取证 = 线上 375px 实测 `matchedWrappers=0`、726px 表只显示 294px、父级 `overflow-x: visible`；
改回后同一探针 `matchedWrappers=2`、`scrollLeft 0→300` 可拖、页面零溢出、1440 下 `boxW==tableW` 无变化。
⚠️ 失误在于 **10-07 验过表格能拖，但引号改写之后没回头复验产物** —— 与五-20/五-21/五-34 是同一族病，
三条核法已写进八-7（含"`<`…`>` 之间不参与引号改写"这条新规矩）。
另外从他**仓库提交信息**里读到了改动动机（`cbe49ed` 上限修复、`449c9a3` 截图重拍脱敏 BCD星→XX星、
`d029be0` v1.1.5 发版），比盯着 diff 猜原因可靠得多（他项目是 git 仓库但手册未跟踪，提交信息是唯一线索）。
**这次部署脚本内联了内容校验**：产物里 `grep -q "1.1.5"` 与 `grep -q 'class="horizontal-scroll-container"'`
不过就不原子切换 dist。

### 2026-10-07 下午：把 CCNewTools 使用手册发成首篇「工具」类文章（**已 commit、已上线 V0.1.23→0.1.24**）

开场是上一批的收尾（他一句「关闭开发服务器 下班，提交推送部署」）——收尾时核出**线上就是本地那份 dist**
（首页 md5 相同、`011cdb5..HEAD` 只动过两份 md 文档、零构建输入），所以**没有可部署的增量，我没动线上**，
也没重跑 build（重跑会换掉站点信息卡的「构建时间」，反而毁掉"线上是不是最新"的逐字节判据）。
之后他开新需求：`E:\Chentools项目\CCNewTools\使用手册` 发进博客，分类「工具」。

- **发稿流程第一次真跑，分工是对的**：他自己供内容时**不做前置问卷**——我先读手册、扫特殊语法
  （结论：零 Mermaid / 零 KaTeX / 零 callout / 零图片网格 / 零外链图片，八节那份"零实战验证"清单没被消耗）、
  查分类是否硬编码（不是，`content-utils.ts` 从文章聚合）、代拟 description、定 tag，
  **唯一回问的就是归位 slug**（永久 URL，他选 `ccnewtools-manual`）+ 图片口径 + 要不要放下载入口，一次三问。
- **两条"照抄参考站后改名 → 静默失效"的同族病**（这是本批最有价值的部分，规则已进 AGENTS 九节新小节）：
  ① **文章图片 Fancybox 从来没绑上**：`Markdown.astro` 写的是 `custom-markdown`，参考站是 `custom-md`，
  而 `FancyboxManager.astro` 的选择器是照参考站**逐字抄**的 → `hasElements` 恒 false、`setup()` 直接 return，
  **连 Fancybox 本体 chunk 都不请求**。已修（两处选择器补 `.custom-markdown img`，两个类名都留）。
  ② **宽表格在 375px 下丢内容**：`markdown.css` 给文章表写死 `width: max-content` + `th,td{min-width:120px}`
  所以永不回流，外层又 `overflow-x: hidden` → 既不出滚动条也看不见。模板其实**自带解法**
  （`.horizontal-scroll-container`，`markdown.css:113`，与 `.katex-display-container` 同一套约定），
  **只是全站从没人包过**。本批两张表都包了，桌面观感零变化。
- **取证办法值得复用**：验"绑定有没有装上"，别看"点一下有没有反应"（这个 surface 里合成 click 被 Fancybox 挡了），
  改成**数 Fancybox 本体 chunk 有没有被请求**，并拿一个无图页面当控制组 → 有图页加载、无图页不加载，因果就锁死了。
- **两次差点误判，都靠控制组兜住**：① 截图里那几处高斯模糊我以为是压缩毛刺，**拿原图一比是他自己打的码**；
  ② 引用块竖条在深色下"没变色"，实为**隐藏标签页里 transition 不推进**的老坑（AGENTS 五-25 末条），
  注入 `transition:none!important` 重读就正常了。
- **自己犯的一条**：把 CRLF 转换写成 `readFileSync(f,"utf8")` + `writeFileSync(f,str,"binary")`，
  **整篇中文被逐字符截成单字节**（991 个 U+FFFD，文件从 10.9KB 变 5.1KB）。
  这正是 AGENTS 七节明写的"读什么编码就用什么编码写回"——我犯了它的**反向**版本。
  重写后改用**字节级** `0x0A→0x0D 0x0A` 替换，全程不碰编码。**行尾转换永远别过字符串。**
- 依赖/环境动作：本批**没动依赖、没动配置、没动 markdown 插件链**，所以不需要清 `data-store.json`
  （新增内容文件按哈希自然失效）。构建 43 页 / 350 文件 / 22M，`npm run check` 0 error（2 条故意留的 hint）。

- **他当场报的「分类和标签都显示全部文章」**，走 systematic-debugging 没先猜，根因是**两条叠加**（AGENTS 五-33）：
  ① 纯静态站里 `Astro.url.searchParams` **构建期恒空**（构建时请求的 URL 就是 `/archive/`，访客的查询串不会回服务端）；
  ② `archive.astro` 里 `<ArchivePannel>` **没有 `client:*` 时间指令** → Astro 只出静态 HTML、**压根不水合**。
  两条都在 09-24 那笔 `da68cd4`「去掉 client:only 水合空窗」里同时成立：它把组件里
  `new URLSearchParams(window.location.search)` 删了、把 `client:only="svelte"` 改成无指令。
  **筛选逻辑代码一条没错，构建 0 报错、控制台 0 报错，功能却整个是死的。**
  → 修法：`client:load` + 组件内 `resolveFilters()`（SSR 那遍仍出完整时间线，所以 09-24 要消的水合空窗没丢）。
  ⚠️ **本批自己造的两个假信号，都靠"先证明探针有效"兜住**：
  ① 拿整页 `a[href^="/posts/"]` 数行数 → 侧栏那 1 个卡片外链接让结果自相矛盾
  （"设计灵感 27 条 / 未分类 1 条"），改成**只数岛内部**才对上；
  ② 软导航仿真**只换容器内容没换 URL** → 组件读到"无筛选"，差点把已修好的东西报成没修好。
  最终五项全对：`/archive/` 27、`?category=设计灵感` 26、`?category=工具` 1、`?uncategorized=true` 0、
  `?tag=CSS100天` 25，且筛选头文案正确出现；硬加载与软导航**两条路径都验**。
  代价：归档页 146925B → 177779B（props 序列化 27 篇），多一个 5KB chunk。

### 2026-10-01 下午→晚：把上午批准的「四件工程项」全部做完 + 修用户报的横幅标题 bug（**7 笔已推送，21:20 上线 V0.1.21**）

开场他只说「ok 打开开发服务器准备工作」，随后「开干吧，直接全干」——所以本会话就是按
`HANDOFF` 第一节那四件事的顺序做的，没另开新战线。四件的落点都在 AGENTS（九节开头有张一览表），
这里只记**过程里值得下次复用的判断**：

- **先取证再动手**：代理报的 30 处/18 文件我先让它出一份逐条清单（含容器内外判据、事件名、延迟值、
  是否已幂等），回来自己抽查 `Layout.astro` 容器边界与 `SwupManager` 的派发原文——
  **数字是错的（实为 34 处 / 20 个文件，幂等标志 5 个不是 3），但判据全对**，
  照它的判据才发现 `FloatingToc.setupAutoClose` 和 `CategoryBar.initScrollFeatures` 这两条**真累加**。
  → 老规矩 again：**代理的数只当线索，逐条读代码才算数**（见记忆 parallel-audit-verify-before-reporting）。
- **helper 的三个设计决定**（为什么长这样，下次别"顺手简化"）：
  ① 放在 `public/assets/js/reinit.js` 由 **head 同步 classic script** 加载 —— 容器内 `is:inline` 脚本在
  **解析期**就要拿到 `window.onReinit`，而 Astro 的模块脚本是 deferred，放组件里必然晚一步；
  head 又不被 Swup 替换 → 监听器天然只有一份。② `delay` 只用于导航那一次，首屏立即跑（保时序不变）。
  ③ 用 `<html class=is-changing>` 区分「导航途中的重求值」与「同一页把组件挂两处」——
  后者必须在解析期各跑一次，否则移动端底部那格首屏停在占位值上（我第一版就栽在这，实测 `274|0`）。
- **验证走的是 `build` + `preview`，没在 dev 下下任何结论**（按上午那条交代）。
  探针三层：`reinitRuns(key)` 差值必须 =1；包 `EventTarget.prototype.addEventListener` 只数
  `document`/`window` 上的新增；`history.pushState` 用 getter/setter 陷阱数包装层数。
  **两个假信号差点误导我**：① 隐藏标签页里真实点击导航只能走一趟就卡 `is-changing`
  —— 拿线上旧构建做同一动作**一样卡**，才确认是环境不是回归；② 首页 10 张封面 2 张遮罩未褪，
  线上旧构建同一探针**数字完全一致** → 既存行为。**控制组每次都做，别只测自己。**
- **`astro check` 首跑 4 个错全修**（`PostMeta.className` 必填但唯一调用方没传、`SwupManager` 的
  `a.target` 类型、`[...page]` 死变量、`@rehype-callouts-theme` 是 vite alias 所以补 `src/modules.d.ts`）。
  **顺带证伪了 AGENTS 五-5 一句长期挂着的话**：列表卡根本没有锁图标。
  我**没有**顺手删那个没读的 prop —— 它是"UI 缺失"不是"死代码"，删了就把缺陷藏回去（已列进等拍板）。
- 依赖动作按第九节流程走：先用 `Get-CimInstance Win32_Process` 按 `node.exe` + `astro\bin\astro.mjs`
  精确查到 dev 的 PID（本会话只有 1 个：9256），停掉后复查计数为 0，再 `npm install` →
  **干净 `npm ci`（695 包，32s）+ build** 验证 lockfile。
  **这次全程没撞到 `lightningcss` 的 EPERM**——说明"按可执行文件+尾参数精确杀进程"这套够用，
  但也**不代表那条坑不在了**（本会话没有并发的 language-server，别拿来反证）。
  `allowScripts` 仍只钉 `esbuild@0.28.2`，与实装版本一致（五-11：升 esbuild 要同步改这里）。
- **横幅标题 bug（用户在我报完四件事之后当场报的）**：走 systematic-debugging，没有先猜。
  取证顺序值得复用：① 读 `Cover.astro` 与 `Layout.astro` 确认横幅在 `#swup-container` **外面**；
  ② **拿线上旧构建当控制组**跑同一段探针 → 同样症状，**证明不是我这批改出来的回归**（这条最省事，
  否则会白怀疑自己刚动的十几处）；③ 扒参考站 `window.swup.options.containers` + `curl` 它的原始 HTML
  用「配平 div 深度」的办法确认 post-meta 层**嵌在** overlay 容器里 → 拿到标准答案再改。
  根因是两条同时成立（容器没登记 + markup 层级不对），细节与修法在 **AGENTS 十-15**。
  ⚠️ 顺带发现一个**改了才会出现的连带漏**：横幅层一旦被替换，打字机实例挂在旧节点属性上就再也
  destroy 不到 → 孤儿 `setTimeout` 链永久打在脱离文档的节点上；已改模块级 `liveInstances` 统一销毁。
  → **通则：把任何元素登记成 Swup container 之前，先查有没有代码把实例句柄挂在该元素的属性上。**

### 2026-09-30 下午：两条移动端缺陷（都查到根因才动手）+ 竖条收窄 + 移动端动态卡

用户开场只说"开启开发服务器准备解决点问题"，随后报了**移动端首页封面不加载也不转圈**与
**安卓 Edge 切页/刷新后汉堡点不开**。两条都走 systematic-debugging，**没有一条是靠猜修的**：

- **菜单**：先在小视口 iframe 里复现「切页后一次点击不弹出」，再用 **MutationObserver 数一次点击
  引发几次 class 变更**（1 次监听 = 2 次变更）把"重复绑定"和"监听器丢了"分开——实测 2 次，
  且**导航前后 DOM 节点是同一个**，顺 `@swup/scripts-plugin` 源码查到它 `getScope()` 默认返回整个
  `document`，而 Astro 7 把组件脚本内联成 module、重新插入即重新求值 → 每次导航叠加一层监听器。
  首页 24 个 script 里**只有 1 个真在容器内**，所以这一改连带修掉主题按钮、桌面下拉、侧栏分类展开、
  Header 滚动监听等一串同源病；`ThemeIcon` 那句 `astro:after-swap` 重绑是独立的第二处，另删。
- **封面**：先量线上 20 个封面资源**全部 200**（排除"文件没上传"），再拿用户截图裁切采样定位到
  「白框中心纯 `255,255,255`、环完全没画」，最后在 `/archive/ 整页加载 → 软导航回首页` 这条路径上
  实测 `naturalWidth 374 / data-loading=false` 而**遮罩 opacity 仍是 1、`.spinner` 塌成 0px**
  → 根因是组件 scoped 样式随 head 缺失（AGENTS 十-2 的老规则，第二个实例，且症状伪装成"没加载"）。
- 两条 durable 认知与四处坑位已落盘 AGENTS（第十节 11、第十节 2 补充、五-24 改两处挂载、
  五-25 尺寸与假信号、第九节 preview 孤儿进程）；记忆补了第五类假阴性（隐藏标签页里 lazy 图不发请求）。
- **过程中自己踩的两处**：`global.css` 被 Edit 整片翻成 CRLF（diff 5/4 炸成 64/63，从原 blob 重放修回）、
  node 又一次把 `/tmp` 当 `E:\tmp`，以及一次 iframe 探针因顶层页面还停在参考站而跨域读出空集合
  ——差点把"卡片不存在"当结论。
- 卸载依赖前按第九节精确停进程：`TaskStop` 之后 **`astro preview` 的子进程确实仍存活**，
  靠命令行匹配才找出来（这条已补进 AGENTS）。干净 `npm ci` 618 包 + build 退出码 0。
- 部署三次（14:19 修 bug + 竖条、14:38 移动端动态卡、15:29 站点信息卡），都走第六节原子替换流程，
  每次都从公网核「线上首页 == 本地 dist 逐字节」+ 逐项核 CSS/JS 内容才报完成。

**追加：侧栏「站点信息」卡**（`f58fffa` + 文档 `6b525c8`，15:29 上线）。走 brainstorming 的
**Bounded** 路径：先扒参考站产物（常驻 3 行 + 展开区 7 格 + `site-info-toggle-btn`，默认收起），
再一次四问收齐范围（字段分组 / 挂载位置 / 系统信息取值 / 版本号来源），拿到"照参考站分组、
右栏 + 移动底部、构建机实测值、升 package.json 到 0.1.19"四个答案才动手。用户随后指出
**我漏了展开区每格的图标**——因为我第一次提取时把标签剥光了，图标 `<svg>` 整个被剥掉，
于是把"没有图标"当成了事实。重取原始 markup 才看清 `flex-col` 竖排「图标→标签→值」+ 浅底小块。
**教训：扒产物结构时别用剥标签的文本当依据，图标/SVG 只在原始 markup 里存在。**
两处自查抓到的自己的错：① 抄参考站的 `mdi:clover` 把构建打挂（`mdi` 集合根本没装，
且 **失败时 `dist/` 已被清空**）；② `toggleAttribute("inert", !open)` 的 `open` 是点击前状态，
逻辑写反，实测展开后仍 inert → 改成 `open`。图标集合的真实边界已落盘 **AGENTS 五-29**。
验证：两次连续构建产物**只差那 2 处构建时间戳**（证明卡片除时间外是确定性的、
且我把新文件从 LF 转成 CRLF 对齐同目录对产物零影响）；375/1440 两档实测四格图标
18×18 且颜色随主题（亮 `#00ba99` / 暗 `#0dcaa9`）、浅底两档分别 `neutral-100/60` 与
`neutral-800/50`、值全部单行不折行、零溢出、两份实例展开互不干扰。

**追加：三路并行体检（模块化 / 性能 / 卫生）→ 修 5 条缺陷 + 压相册 + 加 Nginx 缓存策略**

用户说"全面检查代码的模块化、精简性，优化性能等"。做法：派 3 个只读代理并行扫，
**每个都强制先读 AGENTS.md 并禁止复报已判定为故意的项**（否则交回来的是一堆已拍板的事），
回来以后**每条我自己抽查**再报给用户。结果：

- 三条 P0 全部为真，其中两条我另用浏览器实测复现：RSS 26/26 链接 `/post/undefined` → 404
  （`slug` 字段不存在 + 路径写成单数）；移动端分类卡「更多」点了没反应（双挂载 + `querySelector`）。
  第三条是 5 篇文章正文裸 `<script>` 的顶层 `const` 撞上容器脚本重执行 →
  **线上实测整页加载能开、容器重插一次就点不动 + SyntaxError**。
- 两条我核后**降级**：每页两个 `<title>` 内容其实一致（只是无效 HTML）；
  重复 id `cardTags`/`announcement`/`banner` 没有任何脚本查询，无死控件。
- 一条**代理说反了**：它把"缓存策略可用"列进没问题，实测 HTML 根本没有 `Cache-Control`
  （只有 `/_astro/*` 有 12h）→ 启发式缓存 + 每次部署旧 chunk 消失 = 客户端 404 脚本。
  用户先说"给方案我自己改"，随后改口"直接改"，我就改了 Nginx（配置在宝塔 extension 目录，
  动前备份 vhost，`nginx -t` 过了才 reload）——**第一版我自己写错**：`location ^~ /gallery/`
  把 `/gallery/` 与 `/gallery/<id>/` 两个 HTML 页面一起吃进 7 天缓存，等于留下自己要修的病，
  是靠"逐项打响应头"的验收脚本抓出来的，已改成按图片扩展名匹配。
- 性能数字都我自己复测过：相册 11.39MB（`zigong/1.jpg` 单张 3,943,960B）、
  Twikoo 589KB 无 defer × 27 页、横幅最小档 1280w=165KB。**用户只选了压相册**，
  另两项看过后明确不做（记在第一节，别当新发现再提）。
- 相册压缩**第一版失败**：一刀切 1600w/q78 让 7 张图反而变大。回滚（`git checkout` +
  手删未跟踪的 .webp）重做成"逐张试 4 档、只省到 ≥5% 才换" → 19 张转 webp、
  `yuanmingyuan/7.jpg` 保留原图，合计 11.39→3.46MB（−70%）。
  动手前确认了三件事：无相册写 `cover:`、无相册 ≥10 张（改扩展名不打乱排序）、20 张全在 git 里。
- `dayjs` 在 RSS 改用原生 Date 后源码零引用 → 已卸载（干净 `npm ci` + build 验过）。
- 提交时**踩到自己的粗心**：`git add` 里写了已被先前 `git rm` 暂存的 `src/data/site.json`，
  报 pathspec 不存在，结果那一笔只提交了"删文件"而没有配套的 SEO/rss 改动——
  单笔不成立且消息与内容不符。6 笔都未推送，用 `git reset`（mixed，不碰工作区）退回重做 7 笔。
  **教训：`git add` 一组路径前先确认没有已暂存的删除混在里面。**

### 2026-09-29 傍晚：四件事（自动封面 / 文章脚手架 / 侧栏最新动态 / 新相册）

已提交 `639bf9a f85798c d16c427 8625538` + 文档笔 `6f81c90`，**17:22 已部署上线**。
durable 规则全在 AGENTS（五-21/24/25/26/27/28 + 第七、九节），这里只留"发生了什么、谁拍的板"。

**开场**：用户只说"开启开发服务器进行今天的工作"。dev 冷启动 39.8s，工作区干净、`3c384c5` 三方一致。
HANDOFF 说没待办卡在我手上 → 一次多选题收齐四块方向。**先做的验收全是零代码改动**：
三处暗色程序化复验通过；链接 hover 绿虚线用户拍板保留（实测是**换位置不是多一条**，
且作用面只有 `/about/`——26 篇正文里一条 markdown 链接都没有）；动态文案不改；邮箱留 qq 那个。
顺手更正 HANDOFF 一处过期说法：浮动按钮亮色描边也从 `.1` 变 `.08` 了。

**① 自动封面**（`639bf9a`）：走 brainstorming 的 **Bounded** 路径，过程中**推翻了任务前提**——
"按分类自动配图"做不出区分度，因为 26 篇 `category` 全是 `"设计灵感"` 一个值。用户改选按 `seriesOrder` 轮播，
并把范围**收紧到只列表页**（详情页 banner / og:image 不动，实测 `post-cover` 0 命中）。
**素材换过一次**：先用了仓库里零引用的 `chen1~4.webp`（动漫图），用户看过说不要动漫、要景色或技术感、且要小
→ 手写 4 张 800×800 **无焦点**矢量图，`npm run covers` 经 sharp 出 webp，单张 6~12KB（动漫版共 238KB）。
"无焦点"是被版式逼的：`global.css:132` 用 `!important` 覆盖了 PostCard 的 Tailwind 类，
**所有断点都是右侧竖条**（桌面 240×176 / 移动 144×272）——我一度判它是缺陷，读完 CSS 才确认有意为之，
因为 has-cover 这条路径线上从没走过，谁都没见过。

**② 文章脚手架**（`f85798c`）：`npm run new:post`，五条错误路径逐条实测拦截（缺 title / 缺 slug /
中文 slug / 大写 slug / 覆盖同名）。中文标题**不做音译**是用户认同的取舍：猜错就是永久错 URL。

**③ 侧栏「最新动态」**（`d16c427`）：用户点名参考站那个卡片。先扒参考站页面 + 它的 `DynamicSidebar.*.js` 读完整逻辑，
再定**四处偏离**（一次四问全部由用户拍板）：静态渲染而非岛、条目只链 `/dynamic/`、2 条、只桌面右栏；
另去掉参考站的 `rounded-lg` 换本站直角。**过程中修掉一个自己造的 bug**（实体解码，见 AGENTS 五-27）
**和一个环境坑**（dev 运行期删缓存导致内容集合停在旧状态，见五-21）。

**④ 新相册「王力宏演唱会」**（`8625538`）：用户给的两条微信路径**是死的**——
先误用 `D:/` 写法（Git Bash 不认）差点误判，换 `/d/` 逐层走完后确认 `temp/` 是空目录、全盘搜不到文件名、
迁移目录里 236 张 jpg 全是聊天缩略图。回话前先摸清结构，确认五个字段全部现成支持、零 schema 改动；
用户随后把图放桌面。两个自主对齐站内约定的细节：地点写 `中国·成都`（带间隔号，非用户原话）、
横图放 `1.jpg` 当封面（用户没指定过顺序）。**桌面原件按用户要求删除**，删前 md5sum 逐一比对一致。
→ 页数基线 **41→42**（每个相册一条 `getStaticPaths` 路由）。

**部署验收时又抓到两处自己的假阴性**（都已进 AGENTS 第九节）：
`[A-Za-z0-9]` 不含下划线 → 匹配不到 Astro 哈希文件名，一度误判"封面没上去"；
`grep -oc` 数的是匹配**行数**不是出现次数 → 压缩 HTML 里 10 张卡片只会得 1。
最终用"线上首页与本地 `dist/index.html` 逐字节比对 + 封面序列逐项对照"才算给出上线证据。

**本批共落盘 8 条坑位**（AGENTS 五-21 补充 / 五-25~28 / 第七节 bash-node-pwsh 四条 / 第九节 grep 两条），
并更正两条记错的事实（空 image 并不显示 `loadingfalse.png`；CSS100Day 实缺 **5 和 11**）。
**MD 整合**：第一节重写为纯状态+下一步；第二节 09-29 上午那条 90 行历史压到 13 行（durable 内容早进了 AGENTS）、
傍晚三条 114 行合并为本条；修掉第一节与第三节"回滚资产 13 个/370M vs 14 个/398M"的**自相矛盾**；
`CoverImage` 那条误报从 HANDOFF 挪进 AGENTS 第九节误报清单（否则压缩会丢）；README 的「后续计划」删掉两条已完成的。

### 2026-09-29 午后：新增「动态（说说）」功能 `/dynamic/`（已提交 `ec53040 5b3bf81`，已上线 13:39）

先扒 Firefly 源码 + 它的 `/api/dynamic.json` 摸清架构 = **构建期把内容集合渲染成静态 JSON、
页面只 SSR 骨架、客户端克隆 `<template>` 填占位**（这样条目能用 astro-icon 与构建期图片优化）。
用户拍板：数据源用本地 markdown 不上 Memos；第一版只做核心（页 + 数据 + 列表），
搜索 / 年份筛选 / 侧栏组件 / 图片画廊**都不做**（侧栏那条已在本次傍晚补上）；保留手写 `location`。

⚠️ **入口位置返工过一次**：我按批准的设计先放进「文章」子菜单，用户看过否掉，改为**顶级菜单项**
（主页 / 文章▾ / 动态 / 留言 / 相册 / 关于），改完实测 1024~1440 四断点 0 横向溢出。

新增 6 文件 / 改 5 文件（清单见 git `ec53040`）。**修掉一个真 bug**：带时分的 frontmatter
被 Astro 的 YAML 按 UTC 解析、Node 按本地解析，差 8 小时 → 规则见 **AGENTS 五-23**。
主动规避两条已知坑（条目样式放全局、`[hidden]{display:none}` 必须补）见 **五-24**。
**新认知**：`client:load` 岛在 Swup 容器内可用、容器整体替换后仍能重新水合（**十-10**，探针页实测）。

### 2026-09-29 上午：代码体检 + MD 去重（已提交 `c925043 b55ee68 6fd44a7 d1f445b`，已上线 10:27）

五类卫生问题逐条核过后清掉（14 处死变量转注释、非法空参数、3 条调试日志、失真注释），
外加**两条真实暗色缺陷**（悬浮目录恒白 = 内联 `style=` 压过 `dark:`；浮动按钮描边写死黑色）——
细节与修法全部固化进 **AGENTS 五-20 / 五-21 / 五-22 / 五-4 / 第七节**，这里不复述。

本批最有价值的发现是 **Astro 内容层缓存藏在 `node_modules/.astro/data-store.json`**：
build 退出码 0 但产物没变，`rm -rf .astro` 也没用 → 规则见 AGENTS 五-21（含"别在 dev 运行时删"的补充）。
另一个代价很大的坑是**开着 dev 就 `npm ci`** 把 `node_modules` 删空（AGENTS 第九节依赖坑 ③）。

⚠️ 本批**订正了本文档一处过期说法**：浮动按钮改主题感知后，**亮色描边也从 `rgba(0,0,0,.1)` 变成 `.08`**，
当时写的"亮色零变化"只对悬浮目录成立。

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

## 三、当前状态快照（2026-10-10 傍晚实测；**线上 = V0.1.37，与本批 HEAD 一致**）

| 项 | 状态 |
|---|---|
| 本地 HEAD | 分笔现查 `git rev-parse --short HEAD`（别信文档里的 SHA）。今日七连发：**动态 0.1.31 / meCard 社交按钮 0.1.32 / 波纹高度 0.1.33 / 二维码浮层动效 0.1.34 / PostMeta 间距 0.1.35 / 手册同步 v1.4.0 0.1.36 / 暂无标签间距补漏 0.1.37**（每笔各带一条文档提交） |
| 工作区 | 提交后应 `git status` 干净并与 `origin/main` 齐平 |
| 线上站点 | ✅ **2026-10-10 傍晚部署 V0.1.34**（第六节原子替换；替换前 `grep -qF` 断言 `width="750" height="750"` 与 `0.1.34` 必须在）。线上实测：`/assets/wechat-qr.webp` 200 / **64848B** / `image/webp` / `no-cache`，首页浮层 markup 已无 `hidden`、图 `750×750`，1440 与 375 两档点击都列出 **3 条 `CSSTransition`**、`scrollWidth-clientWidth = 0`。⬅️ 上一趟（V0.1.33 波纹）线上首页 class 已见 `max-h-37.5 min-h-12.5`；再上一趟（V0.1.32 meCard）`/assets/` 走兜底 `no-cache`（以后换二维码访客立刻拿到新的）、占位 `href="/"` 残留 0、GitHub 外链带 `target="_blank" rel="me noopener"`。更早的核验结论在第二节与顶部归档块里 |
| 服务器配置 | **未动**（只换 dist；没碰 Nginx / 宝塔）。缓存策略文件与 vhost 备份位置见 AGENTS 六节（值已脱敏，展开版在私密记录里）。原先那条 `reinit.js` 12h 缓存隐患已用**构建期哈希**解掉，无需改服务器 |
| 本地构建 | `npm run build` 退出码 0：**43 页 / 357 文件 / `du -sh` 22M**，约 4s + Pagefind 0.2s。**Pagefind 索引 29 页**（352 → 357 = 手册同步新增 5 张 webp；页数不变）。⚠️ **动态加一条不动这些数字**（条目在 `/api/dynamic.json` 里，不进 HTML 也不进索引，见五-24）。**`npm run check` 本批跑了：0 error / 4 hint**（新增两条 `document.execCommand` deprecated，故意留的，见三节）；上次基线 0 error。⚠️ 口径见 AGENTS 五-9：`find dist -type f` 数文件、字节合计才算体积 |
| 依赖 | 本批**零改动**。基线仍是 `@astrojs/check@0.9.10` devDep、`allowScripts` 钉 `esbuild@0.28.2`、干净 `npm ci` 695 包 |
| dev / preview server | 本批起了 `npm run preview`（:4321）做验证，**收尾时按「`node.exe` + `astro\bin\astro.mjs` + `preview`」精确杀掉并复查残留 = 0**（宽匹配会把自己的 shell 吃掉，见 AGENTS 九节依赖坑③）。当前 dev 与 preview **都已停，:4321 空闲** |
| 服务器回滚资产 | `dist.old` + **35 个 `dist_backup_*`** = **36 个**（最老 `20260920_234618`，今日七笔新增 `20261010_162726` 起到 `_182*`；其中一个是一次校验主动中止留下的空跑，无影响）。全部保留，**删需用户明确同意** |
| 临时文件 | 本地与服务器的 `chenblog_dist.tar.gz`（服务器侧部署脚本尾部自动 `rm -f`）、`%TEMP%` 下本会话的 `live_index.html` / `live_reinit.js`、`/tmp/chenblog_*.txt` 都要清；⚠️ `/tmp` 是**Windows 共享临时目录**，只删自己产生的、别 broad clean。⚠️ 老坑本批又踩一次：**node 读不了 bash 的 `/tmp`**（解析成 `E:\tmp` → ENOENT），跨工具传文件用 `process.env.TEMP` |
| 排查方法类坑位 | 本批新增三条，细节都在 **AGENTS 五-36 / 五-37 / 十-14**，此处只留索引：**`:hover` 态画下划线不能用 `border-bottom`（inline border 撑高行盒）**、**`forwards` 把 transform 永久留在元素上 = 常驻合成层**、**`navigating()` 的假设对全新 key 不成立（module 脚本晚一个宏任务）**。另有两条工具性坑：隐藏标签页 `setTimeout` 节流到 ≥1s（探针会 15s 超时，改用 `getAnimations().currentTime` 驱动）、`:hover` 不能用 JS 触发所以只能"手动施加同组声明"做等价验证 |
| 待用户拍板 | ① **手册现在每节之间有一条分节线（10 条，照他手册原样同步；旧版站内只有 1 条）**——观感变了，要不要滤掉说一声 ② **V0.1.26 两条复测**（文章页→主页的封面；框选/点击文字是否还跳，见 16.）③ 新文章肉眼验收（11.）④ **灯箱真人点击**（12.）⑤ 第8天宽表要不要一起包（13.）⑥ `propse-base` 拼错要不要补（14.）⑦ 侧栏卡片不随软导航更换（9.）⑧ PostCard 加密文章锁图标（AGENTS 五-5）⑨ 全站 title 带不带后缀（SEO）⑩ **meCard 那排的真人反馈**（手机扫二维码能不能扫上、QQ 复制在他自己浏览器里的提示条观感）——我这边只能证明图解码正常、退路走得到 |
| 既存小坑 | `--radius-large` / `--panel-border-color` 未定义（AGENTS 五-16）——表格那行 `border-radius` 因此整条无效、实际直角，**正好符合站内"面板一律直角"口径，别当缺陷补变量**；`tsconfig.json` react jsx 残留无影响；`src/content/posts/images/` 空目录；`/site.webmanifest` 的 Content-Type 缺 webmanifest 映射（要动 nginx mime.types）；重复 id `announcement`/`cardTags`（九节已判定降级：无脚本查询、无死控件）；单分类时分类卡收起态反而更高（**现在已有第二个分类，这条要复验是否还成立**） |

---

## 四、维护本文件的规矩

1. **每次会话结束前更新**：改「最后更新」日期、刷新第三节状态快照、
   把本次做的事并进第二节（旧内容可压缩，别无限堆积）、更新第一节的下一步。
2. **不复述 AGENTS.md**：规则、部署流程、版本天花板、依赖坑位都在那边，这里只写"现在什么状态、接下来干什么"。
3. **同样受凭据纪律约束**：面板端口、密码、token、私钥一律不写。仓库是公开的。
4. 第一节永远放**下次该做什么**，让新会话打开文件第一眼就知道从哪接手。
