// 动效总开关：配置驱动，对齐 Firefly 的风格
// 运行时仍受 prefers-reduced-motion 覆盖（见 SwupManager.astro）
export const effectsConfig = {
    // 页面切换的缩放过渡；关闭则不初始化 Swup，退回传统整页加载
    pageTransition: true,
    // 窗口缩放时的布局平滑动画
    windowResize: true,
    // 页面过渡时长（ms）
    duration: 250,
}
