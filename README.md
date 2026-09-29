# 亦林 YILIn

陈俊亦的个人博客 —— Astro（SSG）+ Svelte 5 + Tailwind CSS 4 构建的纯静态站点。

```bash
npm install
npm run dev       # 本地开发 http://localhost:4321
npm run build     # 构建 + 生成 Pagefind 搜索索引，产物在 dist/
npm run preview   # 预览构建产物（站内搜索只能在这里或线上验）
npm run icons     # 由 public/favicon.svg 重生成整套站点图标
```

## 已实现

文章 / 归档 / 分类 / 标签 / 系列聚合、Pagefind 全文搜索（带命中高亮）、
Swup 页面过渡、亮暗双主题、KaTeX 公式与 Mermaid 图表支持、RSS（`/rss.xml`）、sitemap、SEO 与 a11y 基线、
响应式与 `prefers-reduced-motion` 降级。

## 后续计划

1. 404 页面设计
2. 文章封面配置（可做成按分类自动配图）
3. 文章脚手架命令（生成带正确 frontmatter 的模板）
