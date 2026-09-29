# HANDOFF — 会话交接

> **分工**：`AGENTS.md` 存长期不变的规则与事实；本文件存**会变的状态**与**下一步该做什么**。
> 本文件不重复 AGENTS.md 的内容，只引用。每次会话结束前必须更新本文件。
>
> 最后更新：**2026-09-29 傍晚（内容基建三件套 + 侧栏「最新动态」+ 第 5 个相册「王力宏演唱会」已提交 4 笔并于 17:22 部署上线，公网实测通过；文档笔随后提交，【推送 origin 尚未做，等用户点头】）**

---

## 一、下次会话第一件事

> **dev server 在跑**（:4321，本次会话启动）。冷启动约 40s，别以为卡住了。
> 注意 dev 下站内搜索必然不可用（Pagefind 索引只在 build 后存在），验搜索用 `npm run preview`。

### ✅ 四件事已全部提交并部署上线（2026-09-29 17:22）

- **自动封面** `639bf9a` · **文章脚手架** `f85798c` · **侧栏最新动态** `d16c427` · **新相册** `8625538` · 文档笔在其后
- **17:22 按 AGENTS 第六节原子替换上线**，备份 `dist_backup_20260929_172215` + `dist.old` 都在，可回滚
- 公网实测：`/`、`/gallery/`、`/gallery/wlh-concert-2026/`、`/dynamic/`、`/api/dynamic.json`、
  `/pagefind/pagefind.js`、`/about/`、中文 URL 文章页 **全 200**；两张相册图字节与本地一致（296274 / 261428）；
  属主 `root:root` 正确（部署坑①）；**线上首页与本地 `dist/index.html` 逐字节相同**（161984B，Last-Modified 17:21:36），
  封面 10 个锚点 / 0 个箭头兜底 / 轮播序列 `cover-4,3,2,1,4,3,2,1,4,3` 与本地完全一致。

**新增第 5 个相册「王力宏演唱会」**：`name: 王力宏演唱会` / `description: 演唱会近距离` /
`location: 中国·成都`（站点写法带间隔号，不是用户原话的"中国成都"）/ `date: 2026-07-03` /
`tags: ["娱乐", "生活"]`（「娱乐」是全新标签，筛选面板自动收）。
图片 `public/gallery/wlh-concert-2026/1.jpg`（横 1706×1280，当封面）+ `2.jpg`（竖 1280×1706），
**原样拷未压缩**——`public/` 不走 Astro 图片优化，两张共 558KB 就是实际流量。**页数 41→42**（每个相册一条 `getStaticPaths` 路由）。
用户放桌面的微信原件已按他的要求删除（删前 MD5 逐一比对一致）。

**下次从这儿接**：

1. **推送 `origin/main` 还没做**——本地 ahead 5，用户只说了"提交代码，部署上线"，
   按 AGENTS 第七节"推送前先问"，下次开头问一句再推。
2. **请用户肉眼验收三样东西**（都已上线，但观感只有人能定；不满意就改完再走一次第六节）：
   - 新封面：http://47.108.230.220/ 看列表卡片右侧竖条（他上次否掉的是动漫图，**矢量图是第一次上线**），桌面 + 手机各看一眼。
     改图就动 `src/assets/postImages/covers/cover-N.svg` → `npm run covers` → `npm run build`。
   - 侧栏「最新动态」：⚠️ **只在 ≥1280px 宽显示**（`#right-sidebar` 是 `hidden xl:block`），
     窗口不够宽会以为没做。当前只有 1 条真实动态，所以卡片里就 1 行 + `(1)`。
   - 新相册：http://47.108.230.220/gallery/ 看「王力宏演唱会」的封面选图与排序
     （我把横图放 `1.jpg` 当封面、竖图第二，顺序按微信原始编号 65→66，**他没指定过顺序**）。
3. 然后才是 **动态页二期剩下的三项**（见下面 🟡）。

### ✅ 今天已结清、不用再跟的

- **三处暗色改动验收通过**：悬浮目录暗 `rgba(22,31,27,.6)`、浮动按钮暗 `rgba(255,255,255,.08)` 描边、
  滚动条暗 `rgba(255,255,255,.2)`，切回亮色完全复位。
  ⚠️ 更正一条：浮动按钮**亮色下也从 `rgba(0,0,0,.1)` 变成了 `.08`**（改用 `--line-divider` 的连带效果），
  此前 HANDOFF 写的"亮色零变化"只对悬浮目录成立。
- **链接 hover 绿虚线：用户拍板保留**，代码不动。实测是"换位置"不是"多一条"——
  非 hover 有 `decoration-dashed` 下划线（偏移 4px），hover 时 `decoration-transparent` 隐掉它、
  改由 `border-bottom: 1px dashed` 贴行盒底边画，加浅绿底色。作用面只有 `/about/`（全站唯一有 markdown 链接的页面）。
- **首条动态文案不改**、**about 邮箱就留 `314298729@qq.com`**——两条悬事用户已明确答复，别再问。
- **AGENTS 第九节三条「等用户拍板」全部结清**（ASCII slug / 自动封面 / 脚手架），已改写成结论。

### 🟡 还挂着的事

1. **动态页二期还剩三项**：搜索、年份筛选、图片画廊（第四项「侧栏最新动态」**本次已做完**）。
   要做仍按 AGENTS 第一节先扒参考实现，再走 brainstorming。
   ⚠️ 扒的时候注意：参考站的侧栏是**岛**（为了 Memos 远程源），我们那条已改成构建期静态、
   并且**条目没有锚点可指**（`DynamicItemTemplate.astro` 不设 id + `SwupManager.astro:77` 无条件回顶），
   所以深链类需求都会撞上这同一堵墙，要做得先补那三处。
2. **服务器回滚资产 13 个 `dist_backup_*` + `dist.old` ≈ 370M**（见第三节）。
   **必须用户明确说才删**，我不会自己动。
3. **宝塔面板密码**曾在对话中明文出现过，用户选择暂不改；面板 IP 白名单未开。
4. **Mermaid 专属的 2 个未定义变量**（`--text-color-secondary` / `--primary-hover`）**故意留白**：
   零页面可达、无从验证。等首篇 Mermaid 文章时按 AGENTS 第八节在 dev 逐项验，届时一并定值。
5. `README.md` 的「后续计划」里"配文章封面 / 文章脚手架"两条**已经做完了**，下次收尾时顺手删掉。

**发新动态**（不变）：在 `src/content/dynamic/` 建 `YYYY-MM-DD-HHMMSS.md`，
frontmatter 写 `published: 2026-09-29T13:30:00+08:00`（**必须带 `+08:00`**，见 AGENTS 五-23），
可选 `pinned: true` 与 `location: 某地`；然后 `npm run build` + 按第六节部署。

**写新文章**：`npm run new:post -- --day 29 --title "标题"`（系列）或 `--slug <ascii-kebab>`（非系列），
见 AGENTS 五-26。

---

## 二、历次会话做了什么

### 2026-09-29 傍晚（第四件）：相册新增第 5 个图集「王力宏演唱会」——【未提交未部署】

用户给两个微信临时目录路径要建图集。**那两条路径是死的**：`.../wxid_.../temp/` 是空目录、
C 盘和 D 盘全盘搜不到那两个文件名、整个迁移目录里 236 张 jpg 全是 `*_thumb.jpg` 聊天缩略图
（`RWTemp` 是微信接收中的临时目录，会被自动清理）。一开始踩的坑是用 `D:/...` 写法，Git Bash 不认，
要 `/d/...`——排除掉这个假信号后才确认是真的没文件，而不是路径编码问题。

先摸清相册结构再回话，确认用户要的五个字段**全部现成支持、零 schema 改动**
（标题→`name`、副标题→`description`、时间→`date`、地点→`location`、标签→`tags`）。
用户随后把两张图放到了桌面。

**做完的事**：`public/gallery/wlh-concert-2026/1.jpg`（横 1706×1280）+ `2.jpg`（竖 1280×1706），
`galleryConfig.albums` 追加一项。两个细节：
① **地点写成 `中国·成都` 而不是用户原话的"中国成都"**——站点既有相册都是带间隔号的 `中国·珠海` / `中国·北京`，跟了站内约定；
② **横图放第 1 张当封面**（不写 `cover` 字段时代码取第一张），顺序沿用微信原始编号 65→66，用户没指定过顺序。
放之前用 sharp 合成小图**看过内容**确认是演唱会照片没拿错，并查了 `orientation` 为空（方向已烘进像素，不存在 EXIF 旋转坑）。

**验证**：构建退出码 0，**页数 41→42**（每个相册一条 `getStaticPaths` 路由，基线已在 AGENTS 五-9 更新）、
文件 331→334；`dist/gallery/index.html` 能 grep 到标题/副标题/地点/新标签「娱乐」（筛选面板自动聚合，无需登记）；
详情页 `<img>` 数 3 个，与现有同为 2 图的 `zigong-daan-2026` **完全一致**；dev 四条路径全 200。
**已告知用户一条体积事实**：`public/` 整份原样进 `dist`、**不走 Astro 图片优化**，
所以这两张 558KB 就是实际流量（现有相册也都是原始分辨率 JPEG，未压缩是站内既有做法）。

**桌面原件已按用户要求删除**——删前用 md5sum 逐一比对拷贝件与原件一致、且站点已正常引用，确认无损才删。

### 2026-09-29 傍晚（第三件）：侧栏「最新动态」卡片——【未提交未部署】

用户看了封面之后直接点名 `firefly.cuteleaf.cn/dynamic/` 右栏那个「最新动态」，要照做。
按 AGENTS 第一节先扒实现：抓参考站页面 + 它的 `DynamicSidebar.*.js` chunk，读完整逻辑——
`client="visible"` 懒水合 → fetch `/api/dynamic.json` → `slice(0, limit)` →
正文 `innerHTML→textContent` 去标签 + `line-clamp-3` → 只有「有图 / 置顶」才渲染徽章行 →
链到 `/dynamic/#dynamic-<id>` → 并把总数写进**岛外**的 `[data-dynamic-count]` 节点。

**摸清现状后定了四处偏离，全部经用户拍板**（一次四问收齐）：
① **构建期静态渲染**而非岛——侧栏在 `#swup-container` **外面**（`Layout.astro:112` 闭合、侧栏 115-122），
软导航根本不替换它，而参考站用岛只是为了 Memos 远程源；岛在这里等于多一个 chunk + 一次 fetch + 一个转圈骨架 + 布局抖动。
② 条目**只链 `/dynamic/`**，不做锚点深链——因为我们的 feed 条目是客户端从 `<template>` 克隆的、**根本没有 id**，
且 `SwupManager.astro:77` 在 `visit:start` 无条件回顶，有 id 也会被冲掉。做成真深链要改三处（含动 Swup 那个雷区文件）。
③ 2 条，与参考站 `limit: 2` 一致。④ 只放桌面右栏，移动端底部那份手写列表不动。
另外**去掉参考站的 `rounded-lg`**（本站直角，AGENTS 五-16），标题直接用我们自己的 `.card-title`
（`mainSingles.css:36` 的 `::before` 竖条和它的 `widget-title` 同源，不用新写样式）。

**过程中修掉一个自己造出来的真 bug**：第一版按常见写法串了一排
`.replace(/&amp;/g,"&").replace(/&lt;/g,"<")…` 做实体解码，结果侧栏把测试文本渲染成
`AT&amp;#x26;T 的 &amp;#x26; 符号和 &amp;#x3C;尖括号&gt;`——因为 `@astrojs/markdown-remark`
转义裸 `&` 用的是 **`&#x26;`** 而不是 `&amp;`，一条都命中不了。
→ 改成**先去标签、再用单个正则一趟解完数字/十六进制/具名三类实体**（未知具名原样保留），
分趟解会有 `&amp;lt;` 被二次解成 `<` 的问题。已固化为 AGENTS 五-27。
**教训：文本处理函数光读源码读不出来，要拿带 `&`、`<`、`>` 的真实内容跑一遍核产物。**

**另一个坑不是我的代码问题**：为了按 AGENTS 五-21 清内容层缓存，在 **dev 还在跑**的时候删了
`node_modules/.astro/data-store.json`，结果 dev 的内容集合停在旧状态——新增 2 条动态后
dev 的 `/api/dynamic.json` 仍只返回 1 条、侧栏也是 1 条，而 dist 已经是 3 条，看起来像新代码有 bug。
→ 重启 dev 即恢复。已补进 AGENTS 五-21：**别在 dev 运行时删它**（dev/build 共用同一个文件）。

**验证**（临时造了 2 条动态覆盖全部分支：置顶 + 长文本 + `AT&T` + `<尖括号>` + 地点，验完即删）：
构建退出码 0、41 页 / 331 文件回到基线、索引 28 页；侧栏 2 条且**置顶排第一**（`sortDynamics` 是置顶优先）、
`<time>` 显示 `2026-09-28 09:00`（`datetime` 为 `01:00Z`，**时区钉住了**，AGENTS 五-23 生效）、
置顶徽章 ✓ 地点徽章「上海」+ 图标 ✓、`(3)` 总数 ✓、`line-clamp-3` 生效、markdown 残留（`**`/反引号/链接）全清干净；
1440px iframe 下侧栏 `display:block`、卡片 `280x189`、**`border-radius: 0px`**、0 横向溢出、每页仍 1 个 `h1`；
暗色正文色 `oklab(0.371…/.75)` → `oklab(0.87…/.75)` 正确翻转；
**搜索索引零污染**：gunzip 28 个 `pf_fragment` 后全文搜侧栏文本 0 命中，控制组用文章正文词验证过方法有效
（⚠️ 第一版我用 `brotliDecompressSync` 解，静默失败拿二进制去搜，差点把"0 命中"当结论——分片是 gzip）。

**文档**：AGENTS 五-24 末尾补侧栏整段（含四处偏离的理由）、新增五-27 实体解码坑、五-21 补 dev 删缓存警告、
第四节补 `src/components/card/`；HANDOFF 第一/二/三节同步。

### 2026-09-29 傍晚：内容基建三件套（自动封面 / 文章脚手架 / ASCII slug）——【未提交未部署】

用户开场只说"开启开发服务器进行今天的工作"。dev 冷启动 39.8s（Vite 重新预优化依赖），
起来后 `/`、`/dynamic/`、`/about/` 全 200。工作区干净、HEAD `3c384c5` 与远端和线上一致。
`HANDOFF` 说没有卡在我手上的待办，于是用一次多选题把四块方向全部收齐：验收暗色 / 收尾杂项 / 动态二期 / 内容基建。

**验收与悬事（零代码改动）**：三处暗色改动程序化复验全过；链接 hover 绿虚线用户拍板保留；
首条动态文案不改；about 邮箱就留 qq 那个。**顺带更正 HANDOFF 一条过期说法**：
浮动按钮亮色描边从 `rgba(0,0,0,.1)` 变成 `.08` 了（改用 `--line-divider` 的连带效果），"亮色零变化"只对悬浮目录成立。
另实测清楚 hover 那条线是**换位置不是多一条**：非 hover 用 `decoration-dashed`（偏移 4px），
hover 时 `decoration-transparent` 隐掉它、由 `border-bottom: 1px dashed` 贴行盒底边画 + 浅绿底色。
作用面只有 `/about/`——全站 26 篇正文里一条 markdown 链接都没有。

**内容基建走 brainstorming 的 Bounded 路径**，过程中**推翻了任务本身的前提**：
"按分类自动配图"做不了区分度，因为 26 篇 `category` **全是 `"设计灵感"`** 这一个值。
改按 `seriesOrder` 轮播（用户选的），并**把生效范围收紧到只列表页**（详情页 banner 与 og:image 不动）。
核过全站列表只有 `[...page].astro → PostPage → PostCard` 一条渲染路径，所以消费点真的只有一行。

**素材换过一次**：先用了仓库里零引用的 `chen1~4.webp`（动漫图），用户看过说不要动漫、要景色或技术感、且要小。
定「技术感矢量图」→ 手写 4 张 800×800 无焦点 SVG（网格光斑 / 同心圆 / 圆角递进 / 贝塞尔控制柄），
新增 `npm run covers` 用 sharp 渲染成 webp：**单张 6~12KB、共 36KB**（动漫那版 238KB）。
⚠️ 关键约束：`CoverImage.astro` 的 `import.meta.glob` 只收 `{png,jpg,jpeg,webp,avif}`，**不收 svg**，
所以必须留"SVG 源 + 脚本产物"这一层，不能直接引用 svg。旧动漫图按用户指示保留不删。

**为什么素材必须"无焦点"**：`global.css:132` 的 `.has-cover .post-card-image` 用 `!important`
把 PostCard 上那串 Tailwind 类整个覆盖了，导致**所有断点都是右侧竖条**（桌面 240×176、移动 144×272），
不是类名暗示的"移动端全宽 2:1 横幅"。我一度据此判定为缺陷，读完 CSS 才确认是有意为之——
has-cover 这条布局路径线上从未走过，所以谁都没见过它。

**脚手架 `npm run new:post`**：系列文 `--day N` → `css100day-N.md` 并自动补 `CSS100Day(N)-` 标题前缀；
非系列**必须**显式 `--slug`（中文标题不做音译，猜错就是永久错 URL）；检测重复天数、拒绝覆盖。
错误路径逐条实测过（缺 title / 缺 slug / 中文 slug / 大写 slug / 重复文件全部正确拦截并退出码 1）。

**验证**：`npm run build` 退出码 0、**41 页回到基线**、dist 331 文件（`_astro/` 191→211 = 封面 4 张 × 5 档响应式）、
Pagefind 仍 28 页 / 2326 词；首页 10 张卡片封面序列实测 = `cover-4,3,2,1,4,3,2,1,4,3`，
与 `(seriesOrder-1)%4` 在 day 28→19 上**逐张对得上**；详情页 grep `post-cover` **0 命中**（证明范围没溢出）、
`og:image` 仍是站点默认图；375/768/1440 三档 iframe 探针 **0 横向溢出、0 破图、10/10 真实加载**。
脚手架实跑 day29 与非系列各一次，验完即删。

**又一次踩到过渡假信号**：`.loading-spinner` 带 `transition: opacity .3s`，图片 load 完立刻读
`getComputedStyle().opacity` 读到的是过渡起点，差点误判成"遮罩没消失、封面被挡住"。
改读 `data-loading` 属性才是真状态（10/10 `false`、`pointer-events:none`）。已写进 AGENTS 五-25。

**文档**：AGENTS 新增五-25（自动封面）与五-26（ASCII slug + 脚手架），第三节补两条命令，第四节补两个脚本，
五-9 基线刷新，**更正两条记错的事实**（八节"空 image 显示兜底图 loadingfalse.png"→实际一张图都没有；
五-17"CSS100Day 缺 1 和 11"→实际缺 **5 和 11**，那个 1 是 CodePen 系列占的），
第九节三条「等拍板」改写成结论；HANDOFF 第一节重写并**去掉三处重复段落**。

### 2026-09-29 午后：新增「动态（说说）」功能 `/dynamic/`（已提交 `ec53040 5b3bf81`，已部署上线）

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

## 三、当前状态快照（2026-09-29 傍晚实测）

| 项 | 状态 |
|---|---|
| 本地 HEAD | 本批 4 笔代码提交：`639bf9a`（自动封面）/ `f85798c`（文章脚手架）/ `d16c427`（侧栏最新动态）/ `8625538`（新相册），**外加一笔文档**（AGENTS + HANDOFF + README）。工作区提交后应干净。今天累计 12 笔 |
| 与远端 | **ahead 5**（`639bf9a f85798c d16c427 8625538` + 文档笔），**尚未推送**——用户本次只授权了"提交 + 部署"，按 AGENTS 第七节推送前要问 |
| 线上站点 | ✅ **17:22 已部署到最新**（备份 `dist_backup_20260929_172215` + `dist.old`）。公网实测 8 条路径全 200（含 `/gallery/wlh-concert-2026/`、`/api/dynamic.json`、`/pagefind/pagefind.js`、中文 URL 文章页）；两张相册图字节与本地一致；属主 `root:root`；**线上首页与本地 `dist/index.html` 逐字节相同**（161984B / Last-Modified 17:21:36），封面 10 锚点 · 0 箭头兜底 · 序列 `cover-4,3,2,1,4,3,2,1,4,3` 与本地完全一致 |
| 本地构建 | `npm run build` 退出码 0：**42 页 / dist 334 文件 / 28M**，`_astro/` **211**（191 + 封面 4 张 × 5 档响应式）、`pagefind/` 42（索引 28 页 / 2326 词）。⚠️ 页数基线 **41→42**（新相册多一条 `getStaticPaths` 路由），AGENTS 五-9 已同步 |
| 新相册验证 | 全过：`dist/gallery/index.html` 含「王力宏演唱会 / 演唱会近距离 / 中国·成都 / 娱乐」；详情页 title 正确、日期显示 `2026-07-03`、`<img>` 数 3 个与现有 2 图相册 `zigong-daan-2026` **完全一致**；`dist/gallery/wlh-concert-2026/` 含 `1.jpg` `2.jpg` `index.html`；dev 四条路径（相册列表 / 详情 / 两张图）全 200。桌面微信原件**已按用户要求删除**，删前 MD5 比对一致 |
| 自动封面验证 | 全过：首页 10 张卡片封面序列 `cover-4,3,2,1,4,3,2,1,4,3` 与 `(seriesOrder-1)%4`（day 28→19）**逐张吻合**；详情页 grep `post-cover` **0 命中**、`og:image` 仍站点默认图（范围没溢出）；375/768/1440 三档 **0 横向溢出、0 破图、10/10 真实加载**、`data-loading` 全 `false`。素材单张 6~12KB / 共 36KB（旧动漫图 238KB）。⚠️ **用户尚未肉眼看过矢量图版**（他否掉的是动漫那版） |
| 脚手架验证 | 实跑 day29 与非系列各一次：frontmatter 完整、系列标题自动加 `CSS100Day(29)-` 前缀、重复天数告警生效；缺 title / 缺 slug / 中文 slug / 大写 slug / 覆盖同名 **五条错误路径全部正确拦截且退出码 1**。测试文件已删 |
| 侧栏「最新动态」验证 | 全过（临时造 2 条动态覆盖置顶/地点/长文本/实体后已删）：2 条且**置顶排第一**、`<time>` 显示 `2026-09-28 09:00`（`datetime=01:00Z`，时区已钉住）、`(3)` 总数、`line-clamp-3`、markdown 残留全清、实体解码干净；1440px iframe 下侧栏 `block`、卡片 `280x189`、**`radius 0px`**、0 溢出、每页 1 个 `h1`；暗色正文色正确翻转；**Pagefind 索引 0 污染**（gunzip 28 个分片核过，控制组验证方法有效）。⚠️ 只在 **≥1280px** 显示，窗口窄会以为没做；⚠️ 当前真实数据只有 1 条，卡片就 1 行 |
| 依赖 | 本批**零新增依赖**（sharp 已在，`package.json` 只加 `covers` 与 `new:post` 两条 script）。`dayjs` 显式依赖与 `allowScripts` 钉版状态沿用上午：干净 `npm ci` 退出码 0、`npm audit`（官方源）**0 vulnerabilities** |
| 内容层缓存 | 本会话删过 `node_modules/.astro/data-store.json` **两次**，其中一次是**在 dev 运行期间删的**，导致 dev 内容集合停在旧状态（见测试环境限制⑤）。现已重启 dev 恢复正常。下次动 `src/plugins/**` 或 markdown 处理链仍必须删，但**要先停 dev**（AGENTS 五-21） |
| dev server | **在跑**（本次会话中途为验证内容同步重启过一次，新任务 ID `b5xv5xv97`，:4321）。冷启动实测 39.8s、重启后约 6s。⚠️ 停它要连子进程一起清：`TaskStop` 只杀外层 shell，孤儿 `astro dev` 会锁住 lightningcss（AGENTS 九 依赖坑 ③） |
| 服务器回滚资产 | `dist.old` + **14 个 `dist_backup_*`**，合计 **398M**（最新 `dist_backup_20260929_172215`，即本次部署的前一版）。全部保留中，**删需用户明确同意** |
| 临时文件 | **已全部清理**：本地 `%TEMP%` 的 `covershot.*` `home*.html` `p10.html` `live.html` `live_*.html` `about_snapshot.txt` `build*.log` `b4~b7.log` `bdeploy.log` `ff_dynamic.html` `ff_dynsidebar.js` `pkg.*.json` `chenblog_dist.tar.gz` 均删，复查 0 残留；服务器 `/tmp/chenblog_dist.tar.gz` 已删，复查 0 残留。项目内：`covershot.tmp.mjs`、测试文章 `css100day-29.md` / `flex-center.md`、两条测试动态均已删 |
| 测试环境限制（本次累计六条） | ① 定宽 iframe 里 `:focus` 永不匹配 → 焦点/hover 只能靠真实 `hover` 工具驱动后读 computed style（本次量链接 hover 就是这么做的）；② **带 `transition` 的元素立刻读 `getComputedStyle` 读到的是过渡起点** —— 本次又踩一次（`.loading-spinner` 的 opacity），改读 `data-loading` 属性才对；③ **in-app browser 的元素级截图要可见 surface**，`visibilityState=hidden` 时直接 `NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`，整页截图却可以；④ in-app browser 导航后 DOM 可能停在 Swup 半切换态（`#content-wrapper` 挂着 `transition-leaving`、侧栏/目录元素整个不在），**要先 reload 再量**；⑤ **dev 运行时删 `data-store.json` 会让 dev 内容集合停在旧状态**（本次误判成"侧栏只渲染 1 条"，实际 dist 是 3 条），重启 dev 才恢复；⑥ **Pagefind 分片是 gzip 不是 brotli**，`brotliDecompressSync` 静默失败后拿二进制搜出的"0 命中"是假结论——任何"搜不到所以不存在"的结论都必须配一个已知存在的控制组 |
| 既存小坑 | `--radius-large` / `--panel-border-color` 已查清（AGENTS 五-16，别重复查）；`tsconfig.json` 的 react jsx 残留无影响；`src/content/posts/images/` 是空的历史遗留目录 |

---

## 四、维护本文件的规矩

1. **每次会话结束前更新**：改「最后更新」日期、刷新第三节状态快照、
   把本次做的事并进第二节（旧内容可压缩，别无限堆积）、更新第一节的下一步。
2. **不复述 AGENTS.md**：规则、部署流程、版本天花板、依赖坑位都在那边，这里只写"现在什么状态、接下来干什么"。
3. **同样受凭据纪律约束**：面板端口、密码、token、私钥一律不写。仓库是公开的。
4. 第一节永远放**下次该做什么**，让新会话打开文件第一眼就知道从哪接手。
