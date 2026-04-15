import fs from "node:fs"
import path from "node:path"

// 相册元信息（用户在配置文件中填写）
export type GalleryAlbum = {
    id: string // URL slug + 目录名，如 "japan-2025"
    name: string // 相册名称
    description?: string // 相册描述
    date?: string // 日期
    location?: string // 拍摄地点
    tags?: string[] // 标签（用于首页筛选）
    cover?: string // 手动指定封面（可选，省略则自动取 cover.* 或第一张）
}

/**
 * 传入配置的相册id（文件夹名），扫描public/gallery中所有图片文件
 * @return 文件名数组 /gallery/xxxId/文件.png数组
 */
export function scanAlbumPhotos(albumId: string): string[] {
    const dir = path.join(process.cwd(), "public", "gallery", albumId)
    if (!fs.existsSync(dir)) return [] // 如果没有文件夹则返回空数组
    const files = fs
        .readdirSync(dir)
        .filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f)) // 支持jpg、jpeg、png、webp、avif、gif格式
        .sort()
    // 将cover.*放在第一个
    const coverIdx = files.findIndex((f) => /^cover\./i.test(f))
    if (coverIdx > 0) {
        const [coverFile] = files.splice(coverIdx, 1)
        files.unshift(coverFile)
    }
    return files.map((f) => `/gallery/${albumId}/${f}`)
}

/**
 * 获取相册封面图 - 传入相册元信息和photos数组
 * 优先级：手动指定 > cover.* 文件 > 第一张图片
 */
export function getAlbumCover(album: GalleryAlbum, photos: string[]): string {
    if (album.cover) return album.cover
    const coverFile = photos.find((p) => /\/cover\./i.test(p))
    return coverFile || photos[0] || ""
}
