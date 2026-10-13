declare global {
    interface Window {
        swup: any
        floatingTOCListenersInitialized?: boolean;
        // public/assets/js/reinit.js：「导航后重 init」注册表，head 里同步加载
        onReinit: (key: string, fn: () => void, opts?: { delay?: number; immediate?: boolean }) => void
        reinitOnce: (key: string, fn: () => void) => void
        reinitRuns: (key: string) => number
        // SiteInfo.astro：右栏登记成 Swup container 后，卡片节点每趟导航被换掉，
        // 这里缓存上一轮绑定的引用，好在新一轮解绑（否则监听按访问页数累加）
        __siteInfoBound?: { card: HTMLElement; btn: HTMLButtonElement | null; detail: HTMLElement | null; handler: () => void }[] | null
        // SiderBarToc.astro：popstate / hashchange 两个 window 监听只注册一次的哨兵
        __sidebarTocNavListeners?: boolean
        tocInternalNavigation?: boolean
    }
}

export type {}
