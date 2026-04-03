import { siteConfig } from "@/config/siteConfig"

/**
 * 获取图片回退格式
 */
export function getFallbackFormat(): "avif" | "webp" {
    const formatConfig = siteConfig.imageOptimization?.formats ?? "both"
    return formatConfig === "avif" ? "avif" : "webp"
}
