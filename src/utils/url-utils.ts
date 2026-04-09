// 工具函数 - 传入多个部分组合url字符串
function joinUrl(...parts: string[]): string {
    const joined = parts.join("/")
    return joined.replace(/\/+/g, "/") // 将多个//变为单个/
}

/** 该工具添加BASE_URL */
export function url(path: string) {
    return joinUrl("", import.meta.env.BASE_URL, path)
}

// 工具函数 - 构建分类url
export function getCategoryUrl(category: string | null): string {
    if (!category || category.trim() === "" || category.trim().toLowerCase() === "暂未分类".toLowerCase())
        return url("/archive/?uncategorized=true")
    return url(`/archive/?category=${encodeURIComponent(category.trim())}`)
}

// 工具函数 - 获取分类url
export function getTagUrl(tag: string): string {
    if (!tag) return url("/archive/")
    return url(`/archive/?tag=${encodeURIComponent(tag.trim())}`)
}
