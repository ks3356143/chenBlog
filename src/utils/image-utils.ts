import { siteConfig } from "@/config/siteConfig"
import type { ImageFormat } from "@/types/config"

/**
 * 获取图片回退格式-[根据站点配置]
 */
export function getFallbackFormat(): "avif" | "webp" {
    const formatConfig = siteConfig.imageOptimization?.formats ?? "both"
    return formatConfig === "avif" ? "avif" : "webp"
}

/**
 * 获取图片优化格式配置-[根据站点配置]
 */
export function getImageFormat(): ImageFormat[] {
    const formatConfig = siteConfig.imageOptimization?.formats ?? "both"
    switch (formatConfig) {
        case "avif":
            return ["avif"]
        case "webp":
            return ["webp"]
        case "both":
            return ["avif", "webp"]
        default:
            return ["avif", "webp"]
    }
}

/**
 * 获取图片质量配置-[根据站点配置]
 */
export function getImageQuality(): number {
    return siteConfig.imageOptimization?.quality ?? 80
}

/**
 * 检查是否添加referrerpolicy='no-referrer'-[根据站点配置]
 */
export function shouldAddNoReferrer(urlStr: string): boolean {
    if (!urlStr.startsWith("http")) return false // http无需添加
    const domains = siteConfig.imageOptimization?.noReferrerDomains || []
    if (domains.length === 0) return false
    try {
        const hostname = new URL(urlStr).hostname
        return domains.some((pattern: string) => {
            const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")
            return new RegExp(`^${regexPattern}$`).test(hostname)
        })
    } catch (e) {
        return false
    }
}
