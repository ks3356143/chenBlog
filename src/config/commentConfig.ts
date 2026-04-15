const isDev = import.meta.env.DEV

export const commentConfig = {
    type: "twikoo",
    twikoo: {
        envId: isDev ? "http://47.108.230.220:8099/" : "http://localhost:8099",
        // 设置 Twikoo 评论系统语言
        lang: "zh-CN",
        // 是否启用文章访问量统计功能
        visitorCount: false,
    },
}
