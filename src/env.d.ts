/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare global {
    interface ITOCManager {
        init: () => void
        cleanup: () => void
    }

    interface Window {
        SidebarTOC: {
            manager: ITOCManager | null
        }
        FloatingTOC: {
            btn: HTMLElement | null
            panel: HTMLElement | null
            manager: ITOCManager | null
            isPostPage: () => boolean
        }
        toggleFloatingTOC: () => void
        tocInternalNavigation: boolean
        // swup 与 music 类型定义在 global.d.ts
    }
}

export {}
