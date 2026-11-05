// 显示设置面板的默认值与存储键。
// 结构对齐参考站 firefly.cuteleaf.cn 的 DisplaySettingsIntegrated（3 个 tab + 逐区重置），
// 但**只保留本站真能生效的开关**：参考站的「壁纸模式 / 全屏布局 / 卡片透明度 / 樱花特效」
// 本站没有对应实现（没有 fullscreen/overlay 壁纸分支、没有樱花层），装上去就是死开关，故不做。
//
// 存储键名与参考站一致（hue / postListLayout / wavesEnabled / gradientEnabled /
// bannerTitleEnabled / cardBorderEnabled），以后要跟参考站对齐语义时不用再迁移。

export type PostListLayout = "list" | "grid"

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
} as const

export const displaySettingsKeys = {
    hue: "hue",
    postListLayout: "postListLayout",
    wavesEnabled: "wavesEnabled",
    gradientEnabled: "gradientEnabled",
    bannerTitleEnabled: "bannerTitleEnabled",
    cardBorderEnabled: "cardBorderEnabled",
} as const
