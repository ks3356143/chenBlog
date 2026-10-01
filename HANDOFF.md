# HANDOFF — 会话交接

> **分工**：`AGENTS.md` 存长期不变的规则与事实；本文件存**会变的状态**与**下一步该做什么**。
> 本文件不重复 AGENTS.md 的内容，只引用。每次会话结束前必须更新本文件。
>
> 最后更新：**2026-10-01 晚 21:20 已提交、已推送、已部署上线（V0.1.21）**。
> 本批做完 5 件事：① schema 删 6 个零消费字段 ② 抽 `onReinit/reinitOnce` 收编 34 处「导航后重 init」脚手架
> （顺带修掉两条监听器累加的真漏）③ 装 `@astrojs/check` 并修掉首跑查出的 4 个类型问题
> ④ AGENTS/HANDOFF 服务器信息脱敏 + 落本地私密记录
> ⑤ **修用户报的横幅标题 bug**：软导航进文章页横幅还写着 `Lovely Life`、切回主页又挂着文章标题，
> 只有 F5 才对 —— 根因是 `#banner-overlay-container` 没登记成 Swup container，且 post-meta 层在它外面（AGENTS 十-15）。
> **本地 = GitHub = 线上三方一致，6 笔提交已推送，dist 已原子替换（336 文件 / 22M）。**
> ⚠️ 顺手查出**同一根因的第二处**（侧栏卡片不随切页换，见「还挂着的事 9.」）与**一条缓存隐患**
> （`/assets/js/reinit.js` 被宝塔的 js 规则缓存 12h，见「还挂着的事 10.」）——**两条都已报告用户、等他拍**，别自动动手。
>
> 📌 **下次开场**：先问用户对上面两条的决定；大方向仍是**功能扩展**（候选见「还挂着的事 1.」），
> 另有他手上那篇待发文章（流程见 AGENTS 第八节）。

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
> 图片要拿到文件本身，本地路径我读不到。上线每次重新授权。
>
> ⚠️ **本批之后新增的一条硬规矩：以后写「导航后重 init」只能调
> `window.onReinit(key, fn, opts)` / `window.reinitOnce(key, fn)`**（实现在 `public/assets/js/reinit.js`，
> 由 `BaseLayout` head 同步加载）。**不要再手写 `window.__xxxInit` 标志、不要再直接
> `document.addEventListener("swup:contentReplaced"/"astro:page-load", …)` 做重初始化**——
> 规则、判据、坑与验证办法全在 **AGENTS 十-14**。
>
> **dev server 当前在跑**（:4321）；`npm run preview` 也在跑（同一端口，二者会互相抢，
> 换着用之前先按可执行文件+尾参数精确停掉另一个，见 AGENTS 九节依赖坑③）。
> dev 下站内搜索必然不可用（Pagefind 索引只在 build 后存在），验搜索用 `npm run preview`。
> ⚠️ **交互类缺陷在 dev 下大多测不出来**，复现与验证一律走 `npm run build` + `npm run preview`。
> ⚠️ 隐藏标签页里 **Swup 动画不推进**：真实点击导航只能走一趟就卡在 `is-changing`，
> 多趟导航要用「手动换容器 + 复刻重新插入脚本」的办法（**`is-changing` 要留到重新插入脚本之后再摘**，
> 提前摘会得出假的"每次导航跑 2~3 遍"），办法与结论见 AGENTS 十-14 末段。

### ✅ 这批的自测结论（全部本地 `dist` + preview 实测，线上未动）

- `npm run build` **42 页 / 335 文件 / 4.0s**，与五-9 基线一致（页数与文件数没变）。
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

### ⬜ 这批要他肉眼过的（**已上线**，直接看 http://47.108.230.220/ 即可）

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

- 6 笔提交已推送（`9a917e3..f97e8d0`）：schema 清理 / `@astrojs/check` + 类型修复 / onReinit 重构 /
  横幅 container 修复 / 发版 0.1.21 / 文档。现查：`git rev-list --count origin/main..HEAD`（应为 0）。
- 部署走 AGENTS 第六节流程（本地 build → tar → scp → 解压到 `dist.new` → 校验 → `chown root:root` → 原子 `mv`）。
  **线上 336 文件 / 22M**；`dist.old` 与时间戳备份保留（服务器上现有 **21 个 `dist_backup_*`**，删要用户明确同意）。
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
2. **服务器回滚资产 20 个 `dist_backup_*` + `dist.old` ≈ 558M**（09-30 五次 + 10-01 这次各 +1）。
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
      ⚠️ **但这四件的代码全部未 commit、未上线**，见第一节顶部。
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
10. 🆕 **`/assets/js/reinit.js` 被缓存 12h**（`Cache-Control: max-age=43200`，来自宝塔自带的 js/css 规则；
    我写的 extension 只覆盖了 `/_astro/*`、`/pagefind/*`、gallery 图片与兜底 HTML）。
    **文件名稳定 + 内容会变 + 12h 缓存**正是 AGENTS 六节当初给 `/pagefind/` 设 `no-cache` 要防的那类错位：
    下次改 helper 后，回访用户可能带着旧 helper 跑新 HTML。
    **今天无害**（文件是全新的，没人缓存过旧版），但**下次改 `reinit.js` 之前必须二选一**：
    ① 在 `<CACHE_CONF>` 里给它加一条 `no-cache`（属服务器配置改动，要用户授权）；
    ② 代码侧改成带内容哈希的引用（如 `reinit.js?v=<8位hash>`，BaseLayout 构建期算），无需动服务器。
    倾向 ②（不碰服务器、自动跟着内容变）。**已报告用户，等他选。**

### 🔧 常用操作（都已验证可用）

- **发新动态**：在 `src/content/dynamic/` 建 `YYYY-MM-DD-HHMMSS.md`，
  frontmatter 写 `published: 2026-09-29T13:30:00+08:00`（**必须带 `+08:00`**，见 AGENTS 五-23），
  可选 `pinned: true` 与 `location: 某地`；然后 `npm run build` + 第六节部署。
- **写新文章**：`npm run new:post -- --day 29 --title "标题"`（系列）或 `--slug <ascii-kebab>`（非系列），见 AGENTS 五-26。
- **加相册图集**：`public/gallery/<id>/1.jpg…` + `galleryConfig.albums` 追加一项，见 AGENTS 五-28。

---

## 二、历次会话做了什么

### 2026-10-01 下午→晚：把上午批准的「四件工程项」全部做完 + 修用户报的横幅标题 bug（**未提交、未上线**）

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

## 三、当前状态快照（2026-10-01 21:20 部署后实测）

| 项 | 状态 |
|---|---|
| 本地 HEAD | 分笔现查 `git rev-parse --short HEAD`（别信文档里的 SHA）。本批 6 笔：① schema 清理 ② `@astrojs/check` + 类型修复 ③ onReinit 重构 ④ 横幅 container 修复 ⑤ 发版 0.1.21 ⑥ 文档 |
| 工作区 | ✅ 干净（`git status --short` 空），与 `origin/main` 齐平、0 领先 |
| 线上站点 | ✅ **21:20 部署到最新，V0.1.21**。验收证据见第一节「交付状态」（首页与本地 dist 逐字节相同 172716B、13 条路径全 200、横幅两向切页正确、软导航进文章页评论区挂载、各 key 每趟导航 +1、控制台 0 报错） |
| 服务器配置 | 未动（本批只换 dist）。缓存策略文件与 vhost 备份位置见 AGENTS 六节（值已脱敏，展开版在私密记录里）。⚠️ 新发现一条缓存隐患见「还挂着的事 10.」 |
| 本地构建 | `npm run build` 退出码 0：**42 页 / dist 336 文件 / 22M**，热缓存约 **4~6s**（+ Pagefind 0.2s）；比 09-30 基线 **+1 文件** = `dist/assets/js/reinit.js`（`_astro/` 仍 211、`pagefind/` 仍 42）。**`npm run check` 与 `npx tsc --noEmit` 均退出码 0**（check 剩 2 条 hint 是故意留的，见 AGENTS 三节） |
| 依赖 | ➕ `@astrojs/check@0.9.10`（devDep，用户已批准；带进 77 个包，不进站点产物）。已按第九节走**干净 `npm ci`（695 包）+ build** 验证 lockfile。`allowScripts` 仍是 `esbuild@0.28.2`（与实装一致）。`npm audit` 本批**未复测**（要显式换官方源） |
| dev / preview server | ⚠️ **`npm run preview` 还开着，占着 :4321**（PID 现查 `netstat -ano \| grep :4321`）；dev 已停。下次要动 `node_modules` 前先按「可执行文件路径 + 尾参数」精确杀掉它（AGENTS 九节坑③：宽匹配会自伤） |
| 服务器回滚资产 | `dist.old`（22M）+ **21 个 `dist_backup_*`**。全部保留，**删需用户明确同意** |
| 临时文件 | ✅ 已清：本地 `/tmp/chenblog_*.log`、`/tmp/live_index.html`、`%TEMP%/ref_*.html`、本地与服务器 `/tmp` 的 tar 包（部署脚本尾部 `rm -f` + 手动核过两边都空）。仓库内无残留 |
| 排查方法类坑位 | 10-01 下午/晚新增：**十-14（重 init 唯一实现 + 三层探针 + 「`is-changing` 要留到重插脚本之后再摘」）、十-15（内容随页变但在容器外的 chrome 必须登记成 Swup container；含"登记前先查有没有把实例句柄挂在元素属性上"这条通则）、三节（`npm run check` 成为组件类型入口 + 两条故意留的 hint）、五-5（「列表卡有锁图标」是假事实）、五-9（基线 336）、九节（代理计数不可直接采信：30/18 → 实为 34/20）**。控制组两次都省事：真实导航卡 `is-changing`、首页 2 张封面遮罩未褪，线上旧构建给同样数字 ⇒ 都不是回归 |
| 待用户拍板 | ① 侧栏卡片不随软导航更换（既存缺陷，同一根因第二处，见「还挂着的事 9.」）② `reinit.js` 的 12h 缓存怎么解（同 10.）③ PostCard 加密文章锁图标要不要补（同 4.4）④ 全站 title 带不带后缀（SEO）⑤ meCard 三个社交按钮真实地址 |
| 既存小坑 | `--radius-large` / `--panel-border-color` 未定义（AGENTS 五-16）；`tsconfig.json` react jsx 残留无影响；`src/content/posts/images/` 空目录；单分类时分类卡收起态反而更高；`/site.webmanifest` 的 Content-Type 缺 webmanifest 映射（要动 nginx mime.types）；**首页 10 张封面里 2 张的加载遮罩在图片已解码后仍未褪**（线上旧构建同样，属 `CoverImage` 状态机那块，五-25 / 十-2） |

---

## 四、维护本文件的规矩

1. **每次会话结束前更新**：改「最后更新」日期、刷新第三节状态快照、
   把本次做的事并进第二节（旧内容可压缩，别无限堆积）、更新第一节的下一步。
2. **不复述 AGENTS.md**：规则、部署流程、版本天花板、依赖坑位都在那边，这里只写"现在什么状态、接下来干什么"。
3. **同样受凭据纪律约束**：面板端口、密码、token、私钥一律不写。仓库是公开的。
4. 第一节永远放**下次该做什么**，让新会话打开文件第一眼就知道从哪接手。
