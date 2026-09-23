# 页面过渡与窗口缩放动画 — 设计文档

日期：2026-09-23
状态：已获用户批准（聊天内确认方案 A），实现中
参考：https://github.com/CuteLeaf/Firefly （本体用 Swup + 配置驱动动效）

## 1. 目标

1. 页面级过渡：切换路由时旧内容缩小淡出、新内容放大淡入（zoom 过渡）。
2. 窗口缩放动画：拖拽窗口边缘 / 最大化还原时布局平滑过渡，而非瞬间跳变。
3. 配置驱动：动效开关集中在 `src/config/effectsConfig.ts`，对齐 Firefly 风格。
4. 尊重 `prefers-reduced-motion`，覆盖配置。

## 2. 技术决策：Swup（方案 A），并引入 `@swupjs/scripts-plugin`

### 为什么不是原生 View Transitions API

纯原始性能 VT API 更优（零 bundle、合成器动画）。但本仓库的事件契约是 **Swup 形状**：
12 个组件监听 `swup:*`、`Layout.astro:92` 有 `id="swup-container"`、`Cover.astro` 有
`data-swup-ignore-script`、`BackToHome.astro:20` 调 `window.swup.navigate()`。
启用 VT 会让这 12 处继续死并造成功能回归，需改 ~10 个文件或伪造 `window.swup`。
静态站上两者实测性能差可忽略；Swup 的持久 chrome 让导航体感更快。

### 为什么必须加 scripts-plugin（对原设计的修订）

调研确认 **Swup 默认不执行被替换容器内的新 script 标签**，且**不替换 head**。
因此"某组件的脚本是否已加载"取决于**首次进入的页面**（entry page）。
页面级组件（评论/分享/推荐位）的 `is:inline` 脚本只在文章页存在；
若 entry 是首页，Swup 导航到文章页时这些脚本不会执行 → 评论等功能静默失效。
`@swupjs/scripts-plugin` 正是为此而生，且会 honoring `data-swup-ignore-script`
（仓库里已预埋该属性，证明 Firefly 路线本就依赖它）。
这是第一方 swup 插件（peer 仅 swup），不引入 AGENTS.md 第九节那类集成包 peer 风险。

## 3. 影响域分析（核心）

脚本分三类，风险完全不同：

| 类别 | 行为（Swup 下） | 风险 |
|---|---|---|
| Astro hoisted `<script>`（打包进 head） | 首次加载执行一次，head 不被替换 → 常驻内存，监听器存活 | 低：靠事件重初始化即可 |
| `is:inline` 在**持久 chrome**（header/侧栏/控件） | 首次加载执行，DOM 不被替换 → 不受影响 | 无 |
| `is:inline` 在**容器内**（页面内容） | 导航后标签被替换且**不执行** | **高**：entry 页不含它则彻底失效 |

逐组件结论：

| 组件 | 脚本 | 位置 | 风险 | 处置 |
|---|---|---|---|---|
| Twikoo（评论） | is:inline ×2 | 容器内（文章页） | 高 | scripts-plugin 重执行 |
| CopyShare | is:inline | 容器内（文章页） | 高 | scripts-plugin 重执行 |
| RecommendedPost | is:inline | 容器内（文章页） | 高 | scripts-plugin 重执行 |
| gallery 页脚本 | is:inline `slot="head"` | head | 无 | 不动 |
| TypeMechine（打字机） | Astro hoisted | Cover（持久） | 低 | 已有 swup 事件重初始化 |
| FancyboxManager | Astro hoisted | body（持久） | 低 | 已监听 `swup:content:replace` |
| SiteStatus / Calender / SiderBarToc / Category | 混合 | 侧栏（持久） | 低 | 已有 swup 事件 |
| FloatingToc / CategoryBar / BackToHome / CoverImage | Astro hoisted | 持久控件 | 低 | 已有 swup / astro 事件 |
| BaseLayout 主题脚本 | is:inline | head | 无 | 补桥接事件监听 |
| mermaid | 集成注入 | 26 篇均未使用 | 零（今日） | 记入"未来风险"，不处理 |
| KaTeX | 服务端渲染 + head css | head | 无 | 不动 |

**回归验证重点**（entry=首页出发）：导航到文章页后评论/分享/推荐位/打字机/TOC 必须工作；
导航到 gallery 后 Fancybox 必须工作；前进/后退必须工作。

## 4. 架构与文件

| 文件 | 动作 | 职责 |
|---|---|---|
| `package.json` | +`swup` +`@swupjs/scripts-plugin` | 依赖 |
| `src/config/effectsConfig.ts` | 新建 | `{ pageTransition, windowResize, duration }` |
| `src/components/features/SwupManager.astro` | 新建 | 读配置→reduced-motion 判断→`new Swup({containers:['#swup-container'], plugins:[ScriptsPlugin]})`→挂 `window.swup`→派发旧名事件桥→resize 动画 |
| `src/styles/transitions.css` | 新建 | zoom 过渡 + `#page-veil` 遮罩 + resize morph 的 root VT 样式 |
| `src/layouts/BaseLayout.astro` | 改 | 引入 SwupManager 与 transitions.css；`astro:after-swap` 补桥接事件；删 `:93` console.log |
| `src/layouts/Layout.astro` | 预计不动 | 容器 id/类已就位 |

### 事件桥接契约

Swup 4 钩子名：`content:replace` `page:view` `visit:start` `enable` …，DOM 事件为 `swup:<hook>`。
旧名 `swup:contentReplaced` **不再派发**。SwupManager 在钩子中补派发：
`content:replace` → 同时派发 `swup:contentReplaced`；`page:view` → `swup:pageView`。
12 个消费组件**一行不改**。

### 动画

- zoom：Swup 在 `<html>` 挂 `is-changing/is-leaving/is-rendering/is-animating`；
  CSS 只对 `#swup-container` 动 `transform/opacity`（合成器友好），约 250ms。
- resize（实现时修订两次）：初版"resize 期间开 transition"无效——断点跨越改的是 grid 轨道
  数量与 sidebar 的 display，不可插值；调研确认 Firefly 本体也没做这块。最终方案：拖拽期间给
  `#page-shell` 冻结像素宽度，松手 180ms 后 `document.startViewTransition` 一次性应用新布局
  （root 交叉淡化 240ms）；不支持 VT 退回瞬时重排。
- 跳顶（实现时修订）：不用 body 淡出（实测让 Swup 卡死在 is-rendering、页面停 opacity 0），
  改 `#page-veil` 遮罩层 out 阶段盖住、in 阶段揭幕；历史导航（animation:skip）盖 80ms 再揭。

## 5. 降级

- `prefers-reduced-motion: reduce` → 不初始化 Swup（整页加载、零动画），覆盖配置。
- JS 禁用 / 初始化失败 → Swup 不拦截 = 传统整页加载，功能不受影响。
- 外链 / 新标签 / hash → Swup 默认不拦截。

## 6. 不做（YAGNI）

- 不引 `@swupjs/astro`、head-plugin、theme 包
- 不用 Swup `native:true`（VT 混合），不做 resize 的 startViewTransition morph
- 不改 12 个消费组件的事件名
- 不处理 mermaid（今日零使用）

## 7. 验证计划（浏览器实测）

1. entry=首页 → 点文章：zoom 过渡可见；评论框/分享/推荐位/打字机/TOC 正常。
2. 文章 → 归档 → gallery：Fancybox 可开图；日历/站点状态刷新。
3. 前进/后退：内容与滚动位置正确。
4. 拖窗口边缘：布局平滑；停止后 transition 摘除。
5. reduced-motion（DevTools 模拟）：无动画、整页加载。
6. console 无报错；Audit 面板不新增问题；`npm run build` 通过。
