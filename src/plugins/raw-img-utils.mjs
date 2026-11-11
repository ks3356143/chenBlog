// 在 raw HTML 块上做属性注入：只改 <img ...> 开标签，其余字节原样保留
// 这是 rehype-figure（只处理 element 节点）覆盖不到的那部分。

const IMG_TAG = /<img\b[^>]*>/gi

/**
 * 给 raw 节点里的 <img> 补 loading / decoding / alt。
 * @param {string} raw  raw 节点原文
 * @param {(tag: string) => string} transform  接收开标签，返回新标签
 * @returns {{ value: string, count: number }}
 */
export function transformRawImages(raw, transform) {
    let count = 0
    const value = raw.replace(IMG_TAG, tag => {
        count++
        return transform(tag)
    })
    return { value, count }
}

/** 从 raw 的 img 开标签里读 src（简单但够用：属性值允许单/双引号） */
export function readRawSrc(tag) {
    const m = tag.match(/\ssrc\s*=\s*("([^"]*)"|'([^']*)')/i)
    return m ? (m[2] ?? m[3] ?? "") : ""
}

/** 判断 raw 的 img 开标签里有没有某个属性 */
export function rawHasAttr(tag, name) {
    return new RegExp(`\\s${name}(\\s*=|\\s|>|$)`, "i").test(tag)
}

/** 往 raw 的 img 开标签里追加属性（放在 `>` 或 `/>` 之前，保持自闭合风格） */
export function appendRawAttr(tag, name, value) {
    const attr = value === "" ? ` ${name}` : ` ${name}="${value}"`
    // 自闭合 `<img … />`：先摘掉结尾的 `>`，再去掉 `… /` 里那个斜杠与空白，拼好属性后统一补 ` />`
    if (/\/\s*>$/.test(tag)) {
        const body = tag.replace(/\s*\/\s*>$/, "")
        return `${body}${attr} />`
    }
    return tag.replace(/\s*>$/, `${attr}>`)
}
