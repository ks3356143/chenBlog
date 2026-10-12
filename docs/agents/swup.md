# AGENTS 分册 · 第十节「Swup 页面过渡的坑」全文（第 1 ~ 15 条）

> 本文件是 `AGENTS.md` 某一节的**全文**，2026-10-12 从 AGENTS.md 无损切出。
> `AGENTS.md` 只留常驻结论与索引（受 harness 64KB 注入预算限制）；改到本节任何主题前先读本文件全文。
> **行内容逐字未改**，条目编号（五-16 / 八-9 / 十-14 …）在 AGENTS.md 与 HANDOFF.md 里照旧引用。

---

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
   靠 `SwupManager.astro` 里自己写的 `content:replace` 钩子重执行（**2026-09-30 起不再用
   `@swup/scripts-plugin`，原因见本节 11**）；但 **`slot="head"` 的脚本导航过去永不执行**——
   `gallery-filter` 自定义元素曾因此从首页导航进相册时彻底失效。这类脚本必须放在容器内（body）。
   同理 **Astro 组件的 scoped `<style>` 只存在于"渲染了该组件的页面"的 head 里**：在不渲染卡片的
   `/archive/` 整页加载后 Swup 回首页，PostCard 样式缺失 → 卡片退回 column 布局、内容与右箭头重叠
   （2026-09-24 实测 64px）。→ 组件的**布局类 CSS 放全局样式表**（`global.css`），每实例变量内联到元素上。
   → ⚠️ **这条对「状态机样式」同样成立，而且症状会伪装成"资源没加载"**（2026-09-30 实测第二个实例：
   `CoverImage.astro`）。它的 scoped `<style>` 里有
   `[data-loading="false"] .loading-spinner{opacity:0}` 和 `.spinner{width:40px…}`，从 `/archive/`
   软导航进首页时两条**同时缺失** → 图片其实已经下载完并解码（`naturalWidth 374`、JS 已把
   `data-loading` 翻成 `false`），但白色遮罩**永远盖在上面**，且转圈环塌成 `0px`。
   用户看到的就是"图片没加载、也没转圈"，而**刷新一下又好了**（整页加载时 head 里有那份样式）。
   → 排查这类症状的顺序：**先读 `img.naturalWidth` 与遮罩的 `getComputedStyle().opacity`**，
     两者一个 >0 一个 =1 就一定是样式缺失，别去查网络、别去怀疑文件没上传
     （本次我就是这样白查了一遍 20 个封面资源，全部 200）。
   → 修法同 PostCard：整套规则搬进 `src/styles/singles/mainSingles.css`，选择器统一带
     `.cover-image-container` 前缀（`.spinner` 这种裸名进全局会污染别人），
     `@keyframes` 改名 `cover-spin`，不复用 `markdown-extend.styl` 里 Mermaid 那个 `spin`。
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
   ⚠️ **回顶放 `visit:start` 现在是对的**（推翻 09-24 的旧结论）：前提是**会随滚动移动的 chrome**
   （横幅图 `#wallpaper-wrapper`、侧栏、分类栏）都在 Swup 容器外、不随页替换也不参与过渡，
   回顶与点击同任务、下一帧绘制前完成，浏览器永远画不出"旧页滚到一半"。
   若将来把任何会随滚动移动的 chrome 挂回过渡类，这条立刻失效。
   ⚠️ **2026-10-01 更正一处措辞**：横幅的**文案层** `#banner-overlay-container` **是** Swup container
   （它不随滚动移动，所以不影响上面这条前提）——详见本节 15，此前本条把它一并说成"在容器外"是错的，
   正是这个错认知让横幅文案一直不随切页更新。
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

10. **`client:load` 的 Astro 岛放在 Swup 容器内是可用的**（2026-09-29 实测，此前无先例、属未知）。
    此前全站唯一的 `client:*` 是 Header 里的 `Search.svelte`，而 Header 在 `#swup-container` **外面**、
    永不被替换，所以"岛能不能活过软导航"一直没被验证过。用一次性探针页测了三步：
    ① 整页加载后岛可交互；② 从首页点链接软导航进来**同样可交互**；
    ③ 关键一步——把 `#swup-container` 的 innerHTML 整体换成同一份 HTML（绕开动画时序），
    岛**仍然重新水合并可交互**。原因是 Astro 给每个岛实例输出的是**内联 module script**，
    重新插入即重新求值，不依赖"这个 bundle 之前有没有加载过"。
    → 所以 `/dynamic/` 的 `DynamicFeed.svelte` 直接 `client:load` 挂在容器里，不需要额外桥接事件。
    → ⚠️ 做这类实验时**别用连续两次 Swup 导航来判断**：隐藏标签页里 transition 不推进，
      Swup 会卡在 `is-changing is-animating is-rendering`、后续导航静默失效（就是本节第 1 条那个症状），
      看起来像"岛坏了"。用③那种手动换 innerHTML 的办法可以完全绕开动画时序。
    → 另：探针页一开始 404，是因为 **Astro 会排除以 `_` 开头的文件**（那是它放局部/私有文件的约定），
      `__island-probe.astro` 不生成路由。临时文件别用下划线开头。

11. ⚠️ **`@swup/scripts-plugin` 的作用域是整个 `document`，不是 Swup 容器——已因此弃用**（2026-09-30 查掉）。
    它的默认项是 `{head:true, body:true}`，而 `getScope()` 在两者都为 true 时**直接返回 `document`**；
    它在 `content:replace` 时把命中的每个 `<script>` 用「新建同名元素 + `replaceWith`」重新插入。
    而 **Astro 7 把组件脚本内联成 `<script type="module">`**（首页 24 个 script 里只有 4 个是外部 chunk），
    内联 module **每次重新插入都会重新求值**（外部 module 有 module map 兜着，不会）→
    于是**每次导航都给容器外那些永不被替换的元素再叠一层 `addEventListener`**。
    实测后果（线上）：切 1 次页后汉堡按钮「一次点击 = 两次 toggle」净零 → 看起来点了没反应；
    主题切换按钮同理失效；每次导航还抛
    `SyntaxError: Identifier 'setTheme' / 'setToggleListener' has already been declared`
    （那两个是**顶层 const 的经典内联脚本**，重新执行就是重复声明）。
    → 数监听器的办法：给面板元素挂 `MutationObserver`，数**一次 `.click()` 引发几次 class 变更**
      （1 次监听 = 2 次变更：我自己那次 remove + handler 的 add）。**别用"能不能打开"当唯一判据**，
      监听器叠到奇数次时它会诡异地「又好了」——那正是用户说"有时候"的来源。
    → 现在的做法：`SwupManager.astro` 里 10 行 `swup.hooks.on("content:replace", …)`，
      只扫 `#swup-container script:not([data-swup-ignore-script])`。首页实测容器内脚本**只有 1 个**
      （CoverImage），其余 23 个都在容器外，所以这一改同时修掉了汉堡、主题、桌面下拉、
      侧栏分类展开、Header 滚动监听（原来每次导航多一个 scroll handler）等一串病。
    → **容器外的组件不得依赖"脚本被重跑"来刷新状态**，要靠 SwupManager 桥接的
      `astro:page-load` / `swup:contentReplaced` 事件；`ThemeIcon.astro` 原来那句
      `document.addEventListener("astro:after-swap", setToggleListener)` 就是独立的第二处双绑，已删。
    → 通用结论：**"切页后某个开关点了没反应"先怀疑重复绑定，而不是怀疑监听器丢了。**
      判据是「一次点击引发的状态变更次数」，不是「有没有反应」。

12. ⚠️ **换成自写的容器作用域重跑之后，「容器内脚本注册全局监听」依然是雷——必须带 `window.__xxxInit` 幂等标志**
    （2026-10-01 查出：`Twikoo.astro` 与 `RecommendedPost.astro` 各一处，同一机制）。
    第 11 条只保证「容器外的元素不再被重复绑」，但**容器内的脚本每次进该页仍会重新求值**，
    若它注册的是 `document.addEventListener(...)` 或 `window.swup.hooks.on(...)`，
    每次求值出来的函数是新对象、引用不同 → `addEventListener` 不去重 → 监听器按「访问过该页的次数」累加。
    → 同族对照：`SeriesNav.astro:123`、`series/index.astro:116` 写了幂等标志（正确），
      `Search.svelte:124` 在 `onMount` 返回里 `removeEventListener`（正确），漏网的只有那两处。
    → **留第一份闭包是安全的**，前提是被注册的函数每次调用都重新 `getElementById`（这两处都满足），
      旧闭包不会指向已被换掉的节点。反过来，捕获了元素引用的闭包不能这么留。
    → 实测办法：`document.dispatchEvent(new Event('swup:contentReplaced'))` 后数目标函数被调了几次
      （包一层 `document.getElementById` 当计数器，**别猜类名**）。线上单次事件触发 2 次重渲染，加标志后恒为 1。
    → ⚠️ 严重性别说过头：实测线上是 2 次，**没有验证过它随访问页数无限增长**，报结论只报测到的数。
    → **2026-10-01 更新：这条机制已被 `public/assets/js/reinit.js` 从结构上消掉**（第十节 14）——
      注册表与它自己的监听都在 head 里、head 不被 Swup 替换，所以累加不再可能。
      新代码请写 `window.onReinit(key, fn)` / `window.reinitOnce(key, fn)`，**不要再手写 `window.__xxxInit`**；
      原先的 5 处手写标志（`__seriesNavInit` / `__seriesAccordionInit` / `__recommendedPostInit`
      / `__twikooSwupInit` / `floatingTOCListenersInitialized`）前四处已收编，
      最后那个只保护 `popstate`/`layoutChange`/`resize` 三个非导航监听，保留。

13. **`twikoo.init()` 会吃掉它的挂载点**（2026-10-01 实测）：`#tcomment` 渲染完成后在 DOM 里变成 twikoo
    自己的根节点 `#twikoo`，**第二次 `document.getElementById("tcomment")` 必然拿到 null**。
    → 后果一：评论区的「重新初始化」逻辑里 `if (el) init()` 这种守卫从第二遍起静默空转，
      看起来「评论没重新加载」其实正常。查「评论没了」要先看 `#twikoo` 在不在，别只看 `#tcomment`。
    → 后果二：`BaseLayout` 那条派发 `firefly:page:loaded` 的通知链整条空转（它只在整页加载时派发，
      而那条路上 `DOMContentLoaded` 已经完成初始化了），已连监听方与派发方一起删除。

14. ⚠️ **「导航后重 init」一律走 `window.onReinit(key, fn, opts)` / `window.reinitOnce(key, fn)`**
    （2026-10-01 立的规矩，实现在 `public/assets/js/reinit.js`，由 `BaseLayout` 的 **head** 同步加载）。
    第十节 11/12 那套「手写 `window.__xxxInit` 标志 + 自己挑事件名 + 自己 setTimeout」的散装脚手架已全量收编，
    **别再往组件里写回那三样**。
    - **为什么必须是它**（这三条是三个不同的病，helper 一次治完）：
      ① **一趟导航被派发两个事件名**：`SwupManager.astro:111` 在 `content:replace` 派发 `swup:contentReplaced`，
        `:112-115` 在 `page:view` 又派发 `astro:page-load` + `astro:after-swap`。
        **同时听这两个名字的组件每换一页就跑两遍**（原先 `SiderBarToc`/`FloatingToc`/`CategoryBar`/`CoverImage`
        /`BackToHome` 全中，`TypeMechine` 最狠：3 个事件名 × (立即 + 220ms) = **一趟 6 遍**）。
        helper 只听第一个名字、用 token 把两个派发压成一趟一次。
      ② **监听器累加**（十-12 那条）：注册表与它那两个 `document.addEventListener` 都在 head 里，
        head 不被 Swup 替换 → **结构上就不可能累加**，不需要每个组件自己写幂等标志。
      ③ **`document`/`window` 级的一次性动作被反复做**：`reinitOnce` 专治这类（见下面两条实例）。
    - **语义**：`onReinit` = 注册时立即跑一次（**不等 delay**，等价于原先的「直接调用」）+ 每次导航后再跑一次
      （`delay` **只用在导航那一次**，保留各处 100/200/220ms 的既有时序）。
      `opts.immediate:false` 用于「首屏由别的路径负责」的场合（`Twikoo` 就是：首屏仍走 `DOMContentLoaded`
      以保持 10-01 验收过的时序，只有换页才由 helper 跑）。
    - ⚠️ **`fn` 每次调用都必须重新查 DOM**，不许抓住旧节点闭包——容器整片被换掉，抓住引用会指到已移除的节点
      （十-12 末尾那条同族结论）。注册同一个 key **只换闭包**，不叠加、不补跑。
    - ⚠️ **两个例外要辨出来，用 `reinitOnce` 而不是 `onReinit`**（这是本次查出的两条真漏）：
      · `FloatingToc.astro` 的 `setupAutoClose()` 里面是往 `window`/`document` 挂 **7 个监听**
        并**包装 `history.pushState/replaceState`**；它被每次导航都跑的 `initFloatingTOC()` 调用 →
        换页越多层数越深（一次点击触发 N 次）。已改成 `reinitOnce`，实测连发 3 次切换页
        `pushState` 包装层数恒 0 增长。
      · `CategoryBar.astro` 的 `initScrollFeatures()` 给**容器外那个永不被替换的** `.category-scroll`
        绑 `wheel`/`scroll` + `window` `resize`，原先跟高亮刷新一起挂在 `astro:page-load` 上 →
        **鼠标横滚的位移按访问页数叠加**。已改 `reinitOnce`。
      → 判据：**被绑的目标元素会不会随容器一起被换掉？** 会 → `onReinit`（新节点需要重新绑）；
        不会（`document`/`window`/容器外元素）→ `reinitOnce`。
      ⚠️ `reinitOnce` 的 `fn` **显式 `return false` 表示「这次没做成，下次再试」**（元素还没解析出来时用），
      否则会被锁死。`initScrollFeatures` / 悬浮目录内部点击标记两处都靠它。
    - ⚠️ **同一组件挂两处时（`SiteStatus` 的 xl 右栏 + 移动底部堆），解析期的重复注册必须允许再跑一次**：
      第一份脚本求值时第二份的 DOM 还没解析出来，只跑一次会让移动端子首屏停在占位值上
      （实测 `running-days` 两个节点 `274|0`，修成 `274|274`）。
      helper 用 `<html>` 上的 `is-changing`（= Swup 一次 visit 期间）区分「软导航途中的重求值」和「解析期的双挂载」：
      **`is-changing` 中不补跑**（交给紧随其后的 `runAll`），**不在其中就补跑**。
      → 自己写测试复刻导航时，**`is-changing` 要一直留到重新插入脚本之后**再摘；
        我第一版探针提前摘了，于是「首次进文章页跑 2~3 遍」被误报成回归。
    - **验证办法**（`npm run build` + `npm run preview`，dev 下容器脚本不重执行所以测不出来）：
      ① `window.reinitRuns(key)` 是 helper 自带的计数器，逐次导航读差值，**要求恒为 1**；
      ② 泄漏看 `addEventListener` 计数——先包一层 `EventTarget.prototype.addEventListener`
        只统计 `this===document||this===window` 的调用，跑几趟导航后差值应为 0（元素上的随便涨，那些节点会被丢弃）。
      ③ **一定要拿线上旧构建当控制组**：本次「首页 10 张封面里 2 张遮罩没褪」看着像回归，
        但线上旧构建同一探针同一页给出**完全一样的数字** → 既存行为，别去"修"。
      实测现状：5 趟导航（含两次进文章页）所有 key 差值全为 1；每次进文章页新增的 4 个 document/window 监听
      **全部来自 `twikoo.nocss.js` 自己的 `init()`**（栈顶是 `twikoo.nocss.js:2:` 的模块 id），
      与改动前同量，不是本项目代码。
    - 未被收编的（**核实过，不属这类，别再去"统一"**）：`Search.svelte` 在 `onMount` 返回里
      `removeEventListener`（正确写法）；`gallery/index.astro` 的 `customElements.get` 守卫；
      Header 系（`MobileMenu`/`DropdownMenu`）只监听容器外元素且脚本每文档只跑一次；
      `FancyboxManager` 听 Swup 4 原生名并在 `visit:start` 里 `close+unbind` 配对；
      `BaseLayout` 的 `astro:after-swap` → `setTheme`（head 内，一文档一次）；
      `Calender` 与 `RecommendedPost` 各一份 `__allPostMetaCache` fetch（五-30 已明确不抽）。
    - ✅ **改 `reinit.js` 之前先处理缓存 —— 2026-10-08 已按"倾向那个"落地**：它在 `public/assets/js/` 下、
      文件名稳定，而 Nginx 给它的是宝塔自带 js/css 规则的 **`max-age=43200`（12h）**（实测响应头），
      不是第六节那套（extension 只覆盖 `/_astro/*`、`/pagefind/*`、gallery 图片与兜底 HTML）。
      「稳定名 + 内容会变 + 长缓存」= 改了 helper 之后回访用户带着旧 helper 跑新 HTML。
      → 现做法：`BaseLayout` 里引用 `reinit.js?v=<内容哈希>`（构建期 `sha256(...).base64url` 取 10 位），
        **没碰服务器配置**，所以不需要额外授权；改一次文件换一次 URL，12h 长缓存从此无害。
      ⚠️ **哈希要按 `process.cwd()` 拼路径读，别用 `import.meta.url`**：预渲染阶段这段代码住在
        `dist/.prerender/chunks/*.mjs` 里，相对它找 `../../public/` 会指到 `dist/public/` →
        `ENOENT` 直接把构建打挂（本次实测第一条就死在这）。
      → 通则：**往 `public/` 下新增会被 HTML 直接引用的稳定名文件，都要顺手核一遍它拿到什么 `Cache-Control`；
        没做哈希引用的那些（`assets/js/twikoo.nocss.js` 等）仍带着 12h 陈旧风险。**

    - ⚠️ **`navigating()` 的假设只对「已存在的 key」成立，对「全新的 key」不成立**
      （2026-10-08 用户报的「文章详情页 F5 → 点主页 → 列表封面永远转圈」就是这个洞）：
      · 原注释写的是"容器内脚本重新求值时紧接着 runAll 一定会跑"，但 **Astro 组件脚本编译成
        `<script type="module">`，插进容器后要到下一个宏任务才求值**，而 `swup:contentReplaced`
        （→ `runAll`）是在 `content:replace` 当趟同步派发完的 → 新 key 赶不上那一趟；
        偏偏 `ranFor` 又被初始化成当前 token，于是紧随的 `astro:page-load` → `catchUp()`
        判定"这一趟已经跑过了"，**两次机会全部错过，`fn` 一次都没执行**。
      · 线上取证（47.108.230.220，包一层 `window.onReinit` 记录注册时机）：
        `register cover-image | is-changing=true | runsBefore=-1` → 之后没有 RUN，
        `reinitRuns('cover-image') === 0`、10 张封面 `data-initialized` 数为 **0**、
        `data-loading="true"` 数为 **10**（其中 8 张 `complete && naturalWidth>0` 早就解码了）
        → 按五-35 的判据这是真 bug，不是懒加载正常态。补一次 `runAll` 后立刻 10/10 绑上。
      · **触发条件 = 「该 key 在本文档里第一次出现」+「注册发生在软导航途中」**，
        所以只有"从别的页型第一次进某页"才犯：全站首页↔文章页两种入口顺序，只有
        **文章页起步 → 首页** 这条会永远坏；`recommended-post` / `twikoo` 同理（它们的脚本是
        同步执行的经典 `<script>`，赶得上 runAll，所以历史上没暴露）。
      · 修法（`public/assets/js/reinit.js`）：`ranFor` 初始化成 **-1**，且导航途中注册的新 key
        **让出一个宏任务后自查**（`setTimeout(0)` 里发现 `ranFor` 仍是 -1 才自己跑一次）。
        ⚠️ 第一版直接改成"注册即跑"是**错的**：同步脚本那一路会变成
        注册跑一次 + runAll 再跑一次 = **一趟 +2**（实测 `recommended-post` 就 +2 了）。
      · 回归判据（preview / 线上各跑一遍，都要求 **每趟导航每个 key 恰好 +1**）：
        首页起步 → 文章页 → 首页 两趟之后 `cover-image 3 / twikoo 2 / recommended-post 3 /
        site-status 4（其中解析期双挂载占 2）/ 其余 3`；文章页起步 → 首页那一趟
        `cover-image` 从 -1 变 **1**、`data-initialized` 10/10、五-35 判据 0 命中。
      · ⚠️ **隐藏标签页里 `setTimeout` 被节流到 ≥1s**（本次两条验证脚本因此 15s 超时），
        要做逐帧/多次导航的探针，先注入
        `*{animation-duration:0s!important;transition-duration:0s!important}`
        让 Swup 的动画等待立刻落地，否则 visit 卡在 `is-changing` 里出不来（十-1/十-10 的老面孔）。

15. ⚠️ **凡是"内容随页面变、但位置在 Swup 容器外"的 chrome，必须自己登记成 Swup 的 container**
    （2026-10-01 用户报的横幅标题 bug，根因与修法）。
    - **症状**：首页横幅写着 `Lovely Life` + 打字机副标题，点进文章页**横幅文案不变**（该显示
      文章标题 +「发布于 …/字数/阅读时长」的地方还是主页那套）；反向从文章页切回主页，
      横幅又一直挂着文章标题。**只有 F5 才正常**（SSR 按当页渲染）。
    - **根因（两条同时成立才会犯）**：① `SwupManager.astro` 的 `containers` 只有 `["#swup-container"]`；
      ② `Cover.astro` 里 `.banner-post-meta-overlay` 是 `#banner-overlay-container` 的**兄弟节点**（在它外面）。
      于是横幅文案层既不被替换、文章页那块也压根不在任何容器里 → 整页只渲染一次。
      ⚠️ 迷惑点：`#banner-overlay-container` 本来就带 `transition-swup-fade`（animationSelector 的等待目标，
      `transitions.css:44-52` 的规则也是照它写的），**看起来像"已经在参与过渡了"**，
      实际它只是淡出淡入**同一份内容**——所以用户看到的是"有动画但字没换"。
    - **修法 = 照参考站结构改两处**（`firefly.cuteleaf.cn` 实测 `window.swup.options.containers` =
      `["#banner-overlay-container","#banner-dim-container","#swup-container","#left-sidebar-dynamic",
      "#right-sidebar-dynamic","#floating-toc-wrapper"]`，且它的 post-meta 层**嵌在** overlay 容器里）：
      ① `Cover.astro`：把 `{isPostPage && bannerPostMeta && (…)}` 整块**移进** `#banner-overlay-container`；
      ② `SwupManager.astro`：`containers: ["#banner-overlay-container", "#swup-container"]`。
    - **连带必须处理的一件事**（否则修好标题、漏一个定时器）：横幅层被换掉后，
      `TypeMechine` 的 `.typewriter` 元素是**新节点**，旧实例挂在旧节点的 `__typewriterInstance` 上、
      再也 destroy 不到 → 多条文案时那个 `setTimeout` 递归链会**永久打在已脱离文档的节点上**，每导航一次多一条。
      已改成**模块级 `liveInstances` 数组**，每次 `initTypewriterElements()` 先全部 `destroy()` 再重建。
      → 通则：**只要把一个元素登记成 Swup container，就要检查所有"把实例句柄挂在元素属性上"的代码**，
        它们会静默失去清理机会。
    - **刻意没跟着参考站做的**：它的 `#banner-dim-container` / `#left-sidebar-dynamic` /
      `#right-sidebar-dynamic` / `#floating-toc-wrapper` 我们**不加**——dim 层各页内容完全相同（换了是白费），
      侧栏与悬浮目录是本站**刻意**留在容器外的（五-24：侧栏靠构建期静态渲染 + 十-14 的重 init，不靠替换）。
      这是有依据的偏离，别当漏改补上。
    - **验证办法**（两向都要测，只测一向会漏）：真实点击导航后读
      `.banner-home-text-overlay.classList.contains("hidden")` 与 `!!document.querySelector(".banner-post-meta-overlay")`，
      要求「进文章页 = `hidden` 为 true 且 post-meta 存在」「回主页 = post-meta 不存在且 `hidden` 为 false」。
      另用 1440 / 375 定宽 iframe 复核显示态：post-meta 是 `hidden lg:flex`，**375 下 display:none 属正常**
      （参考站同款），别当"移动端坏了"去改。
      还要核 `#banner-overlay-container` 在**全部 42 页**都存在（Swup 要求两个页面都有这个容器，
      缺了会报错），以及 26 篇文章页都带 post-meta。
      ⚠️ 打字机孤儿链的判据：**统计"每秒由打字机回调发起的 setTimeout 次数"是否随导航次数递增**
      （本次实测 1→3→2→3→3，有界不增；递增才是漏）。别用"动画还在跑"当判据，孤儿链打在脱离文档的节点上，肉眼看不见。
      ⚠️ 控制台若出现 `[swup] No CSS animation duration defined on elements matching [class*="transition-swup-"]`，
      先确认**是不是自己探针注入了 `transition:none!important`**（本次就是，撤掉即消失），别去改 CSS。
    - ⚠️ **同族第二处已知未修：侧栏卡片不随软导航更换**（2026-10-01 晚查出，**属既存缺陷不是本批引入**）。
      `RightSideBar.astro:33` 是 `isPostPage ? <SiderBarToc/> : <Calender/>`，而侧栏在容器外又没登记成 container
      → 线上实测：从首页软导航进文章页后 `#sidebar-toc` 不存在、侧栏里还是 35 格日历；硬刷新同一篇则正常。
      **只有 ≥1280px 看得见**（`#right-sidebar` 是 `hidden xl:block`）。参考站靠 `#left/right-sidebar-dynamic`
      两个 container 解决；我们**不能照抄了事**——侧栏卡片是双挂载（xl 右栏 + 移动底部堆，五-24/五-29），
      且五-24 当初"侧栏在容器外"正是选静态渲染而非岛的理由，改了就得起重写那条论证。
      **要不要改属设计决定，先问用户**；改则必须重跑十-14 那套探针 + 1440/375 两档核卡片内容与顺序。
