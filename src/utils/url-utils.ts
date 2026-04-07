// 工具函数 - 传入多个部分组合url字符串
function joinUrl(...parts: string[]): string {
    const joined = parts.join("/")
    return joined.replace(/\/+/g, "/") // 将多个//变为单个/
}

export function url(path: string) {
    return joinUrl("", import.meta.env.BASE_URL, path)
}
