import type { GalleryAlbum } from "@/utils/gallery-utils"

interface GallaryConfig {
    albums: GalleryAlbum[]
    columnWidth: number
}

export const galleryConfig: GallaryConfig = {
    // 相册
    albums: [
        // 根据public/gallery下面文件配置显示
        /**
         * id:相册名称和唯一标识，例如相册文件夹名zhuhai-2025，对应public/gallery/zhuhai-2026目录
         * cover:手动指定封面图（如果没有则指定第一张为封面图）
         * name:相册名称，显示在卡片
         * description:相册描述，显示在卡片
         * location: 相册拍摄地点，显示在卡片
         * date: 相册日期，格式为 YYYY-MM-DD，用于排序和显示
         * tags: 相册标签，用于分类和过滤
         */
        // 每添加一项，记得添加图片，一一对应
        // 支持jpg、jpeg、png、webp、avif、gif格式
        {
            id: "zhuhai-2026",
            name: "珠海日记",
            description: "珠海的岛屿和沙滩记忆",
            location: "中国·珠海",
            date: "2026-04-02",
            tags: ["生活", "旅游"],
        },
        {
            id: "yuanmingyuan-2022",
            name: "圆明园",
            description: "走过路过的圆明园",
            location: "中国·北京",
            date: "2022-08-03",
            tags: ["生活", "路过"],
        },
    ],
    // 瀑布流最小列宽(px)，浏览器根据容器宽度自动计算列数，默认 240
    // 值越小列数越多，值越大列数越少
    columnWidth: 240,
}
