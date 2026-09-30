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
    // 列表页自动封面素材池（相对 src/）。文章 frontmatter 手写了 image 时以手写为准，
    // 没写的按 seriesOrder 在这组里轮播；只作用于列表卡片，不影响详情页与 og:image。
    // 素材由 cover-N.svg 经 `npm run covers` 渲染而来，改图改 SVG 不要改 webp
    autoCoverPaths: [
        "assets/postImages/covers/cover-1.webp",
        "assets/postImages/covers/cover-2.webp",
        "assets/postImages/covers/cover-3.webp",
        "assets/postImages/covers/cover-4.webp",
    ],
    // 主题：'github' | 'obsidian' | 'vitepress'，每个主题风格和语法不同，可根据喜好选择
    rehypeCallouts: {
        theme: "github",
    },
    // siteUrl
    site_url: isDev ? "http://localhost:4321" : "http://47.108.230.220",
    // 站点时区：需要"作者写几点就显示几点"的地方用它格式化（如动态的时间），
    // 否则访客机区不同会看到偏移过的时间
    timezone: "Asia/Shanghai",
    // 站点元信息（SEO / 社交分享卡片）。2026-09-30 从 src/data/site.json 并进来——
    // 那份是模板遗留脏数据：og:site_name 是「我的技术博客」，og:image 指向第三方图床
    // s41.ax1x.com（对方一开防盗链，全站分享图集体裂）。以后改文案只改这里。
    siteMeta: {
        name: "亦林 YILIn", // 与 site.webmanifest 里的组合同一
        description: "我的前端技术博客，不止有技术，还有生活相册等内容",
        // og:image 必须是本站绝对可解析 URL，且文件真实存在于 dist/（1200×630）
        ogImage: "/og-image.jpg",
        ogImageAlt: "亦林 YILIn",
    },
    // 页面配置
    pages: {
        guestbook: true, // 留言板页面开关
        gallery:true, // 展示内容开关
        dynamic: true, // 动态（说说）页面开关
    },
}
