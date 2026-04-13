/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare global {
    interface ImportMetaEnv {
        readonly MEILI_MASTER_KEY: string
    }

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
        // swup is defined in global.d.ts
        spine: any
        closeAnnouncement: () => void
        // music type is defined in global.d.ts
        semifullScrollHandler?: (() => void) | undefined
        initSemifullScrollDetection?: () => void
    }
}

export {}
