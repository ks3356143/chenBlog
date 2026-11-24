// 显示设置面板的默认值与存储键。
// 结构对齐参考站 firefly.cuteleaf.cn 的 DisplaySettingsIntegrated（3 个 tab + 逐区重置），
// 但**只保留本站真能生效的开关**：参考站的「壁纸模式 / 全屏布局 / 卡片透明度 / 樱花特效」
// 本站没有对应实现（没有 fullscreen/overlay 壁纸分支、没有樱花层），装上去就是死开关，故不做。
//
// 存储键名与参考站一致（hue / postListLayout / wavesEnabled / gradientEnabled /
// bannerTitleEnabled / cardBorderEnabled），以后要跟参考站对齐语义时不用再迁移。

export type PostListLayout = "list" | "grid"

// 阅读排版偏好（2026-11-13 第五十四批）。只作用于正文 .custom-markdown，不影响界面文字。
// 🔴 三个默认值都必须是「没动过」的那一档：字号 1rem（= prose-base）、
// 行宽 wide（= 现状：max-w-none 铺满正文栏）、无衬线（= 现状 font-family: inherit）。
// 默认档不往 <html> 上挂属性，所以升级后老访客看到的排版一个像素都不变；
// 也只有这样「重置」才等价于「恢复成没这个功能之前」。
export type ReaderSize = "s" | "m" | "l"
export type ReaderWidth = "narrow" | "mid" | "wide"
export type ReaderFont = "sans" | "serif"

// 明暗主题（2026-11-24 第五十八批 A1）。
// 🔴 语义与别的项不同：**存储里没有 "theme" 这个键 = 跟随系统**，
//    只有用户显式选了亮/暗才写值。所以这里的 `system` 不是一个存进 localStorage 的值，
//    而是「删掉这个键」的别名 —— 面板上那枚「跟随系统」按钮做的就是 removeItem。
//    BaseLayout head 里那段解析脚本按同一套语义读：有值就认、没值看 prefers-color-scheme。
export type ThemeMode = "system" | "light" | "dark"

export const displaySettings = {
    // 主题色相 0-360。175 = 本站原始品牌色 #00705c 的 oklch 色相，
    // 也就是「没动过」的状态；改它时 global.css 里那一族 oklch 变量整片跟着转。
    hue: 175,

    // 文章列表布局。移动端默认网格是照参考站的 data-mobile-default-layout="grid"；
    // 参考站的断点是 780（不是 Tailwind 的 768），且 <380px 一律强制网格。
    postListLayout: {
        default: "list" as PostListLayout,
        mobile: "grid" as PostListLayout,
        mobileBreakpoint: 780,
        forceGridBelow: 380,
        // 网格模式的卡片最小宽度，对应参考站的 data-column-width="320"
        columnWidth: 320,
    },

    // 以下三个默认值都是 true，与参考站一致
    wavesEnabled: true,
    gradientEnabled: true,
    bannerTitleEnabled: true,
    cardBorderEnabled: true,

    // 阅读排版偏好（参考站没有这三项，属本站自加）
    readerSize: "m" as ReaderSize,
    readerWidth: "wide" as ReaderWidth,
    readerFont: "sans" as ReaderFont,

    // 主题模式。默认 system（= 不写 "theme" 键，跟随系统），与修复前的实际行为一致：
    // 老访客即使存储里已经被钉成 light/dark，读出来也照旧，不需要迁移。
    themeMode: "system" as ThemeMode,
} as const

export const displaySettingsKeys = {
    hue: "hue",
    postListLayout: "postListLayout",
    wavesEnabled: "wavesEnabled",
    gradientEnabled: "gradientEnabled",
    bannerTitleEnabled: "bannerTitleEnabled",
    cardBorderEnabled: "cardBorderEnabled",
    readerSize: "readerSize",
    readerWidth: "readerWidth",
    readerFont: "readerFont",
    // ⚠️ 与 BaseLayout.astro head 里那段脚本的 KEY 必须逐字一致（那边是 is:inline 纯 JS，没法 import）
    themeMode: "theme",
} as const
