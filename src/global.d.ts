declare global {
    interface Window {
        swup: any
        floatingTOCListenersInitialized?: boolean;
        // public/assets/js/reinit.js：「导航后重 init」注册表，head 里同步加载
        onReinit: (key: string, fn: () => void, opts?: { delay?: number; immediate?: boolean }) => void
        reinitOnce: (key: string, fn: () => void) => void
        reinitRuns: (key: string) => number
    }
}

export type {}
