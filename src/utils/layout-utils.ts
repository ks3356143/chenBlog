import { backgroundWallpaper } from "@/config/backgroundWallPaper"

// 将单个值或数组统一为数组
const toArray = (src: string | string[] | undefined): string[] => {
    if (!src) return []
    if (Array.isArray(src)) return src
    return [src]
}

// 首页图片处理工具函数
// 返回所有配置的图片（用于构建时渲染所有图片）
export const getBackgroundImages = () => {
    const bgSrc = backgroundWallpaper.src

    const images = toArray(bgSrc)
    return {
        images,
        isMultiple: images.length > 1,
    }
}
