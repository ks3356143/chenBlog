const isDev = import.meta.env.DEV

// 注意文章封面的相对路径：是以/src为基准的

export const siteConfig = {
    // 站点开始事件
    siteStartDate: "2026-01-01",
    // 图片优化和响应式配置，仅保留avif、webp，最新为avif体积小兼容性低
    imageOptimization: {
        // 图片输出和回退格式
        // -"avif" 最新格式，最小体积，兼容性较低
        // -"webp" 体积适中，兼容性好
        // -"both" 同时输出AVIF和WEBP，浏览器自动选项
        formats: "webp",
        // 图片压缩质量 (1-100)，值越低体积越小但质量越差，推荐 70-85
        quality: 80,
        // 为特定域名的图片添加 referrerpolicy="no-referrer" 属性
        // 支持通配符 *，例如：["i0.baidu.com", "*.astro.com"]
        // 可解决指定域名图片加载时的 403 问题（如防盗链图片）
        noReferrerDomains: [],
    },
    // 公告配置
    announcement: {
        text: "欢迎来到我的博客，在这里可以一起进步，一起学习！2026年起航！",
    },
    // 中间部分分类导航
    categoryBar: true,
    // 配置分页每页文章数量
    perPagePosts: 10,
    // 文章列表布局配置
    postListLayout: {
        // 文章简介显示行数，设置0为不截断
        descriptionLines: 2,
    },
    // 文章封面图回退路径设置
    fallbackPath: "assets/postImages/loadingfalse.png",
    // 主题：'github' | 'obsidian' | 'vitepress'，每个主题风格和语法不同，可根据喜好选择
    rehypeCallouts: {
        theme: "github",
    },
    // siteUrl
    site_url: isDev ? "http://localhost:4321" : "https://chenblog.netlify.app",
}
