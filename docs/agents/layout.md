# AGENTS 分册 · 第四节「目录结构（关键位置）」全文

> 本文件是 `AGENTS.md` 某一节的**全文**，2026-11-10 为腾出注入预算（harness 64KB 封顶）无损切出。
> `AGENTS.md` 只留一张压缩表与索引；改到目录约定 / 自研插件前先读本文件全文。
> **内容逐字未改**，只加了这段说明与标题。

## 四、目录结构（关键位置）

```
AGENTS.md             # 常驻规则层（本文件；是否超注入预算由 npm run docs:check 判定，别在这里写死数字）
AGENTS.local.md       # 🔒 私密层：部署目标真实值 + 展开版部署命令。已 .gitignore，绝不入库
docs/agents/*.md      # 分册层：原 AGENTS 五~十节全文 + harness.md（不自动注入，按需 Read）
docs/superpowers/     # 历史设计文档（上一任留的，含影响域分析），保留不动
astro.config.mjs      # 所有插件和 markdown 处理链的唯一配置入口
src/content.config.ts # 文章 frontmatter schema（改文章字段前必看）
src/config/siteConfig.ts    # 站点总开关：分页数、图片格式、页面开关、site_url
src/config/navBarConfig.ts  # 顶部菜单项（含「文章」子菜单）——改菜单只改这里
src/config/           # 另有 backgroundWallpaper / commentConfig / effectsConfig / galleryConfig（相册清单，见五-28）
public/gallery/<id>/  # 相册图片本体，按 1.jpg 2.jpg 序号命名；与 galleryConfig 的 id 一一对应
src/content/posts/    # 30 篇文章（28 .md + 2 .mdx）；images/ 是空的历史遗留目录
src/content/spec/     # 单页内容（about 等）
src/content/dynamic/  # 动态（说说）：一条一个 md，文件名 YYYY-MM-DD-HHMMSS.md 即条目 id
src/pages/            # 路由：about / archive / categories / tags / series / dynamic / guestbook / gallery / posts/[...slug] / [...page]
src/pages/api/dynamic.json.ts  # 动态数据端点：build 时预渲染成 dist/api/dynamic.json
src/pages/rss.xml.js  # RSS 已实现
src/components/pages/dynamic/  # DynamicFeed.svelte + DynamicItemTemplate.astro
src/components/card/  # 侧栏卡片：SiteStatus / Calender / DynamicSidebar / SiteInfo（构建期静态）
src/layouts/          # BaseLayout.astro + Layout.astro
src/plugins/          # 8 个自研 remark/rehype 插件（见下）
src/modules.d.ts      # 一条 declare module（给 astro check 用，见三节）
public/assets/js/reinit.js  # ⚠️「导航后重 init」注册表：onReinit/reinitOnce 的唯一实现，BaseLayout head 同步加载（十-14）
scripts/generate-icons.mjs  # 由 public/favicon.svg 生成全套图标（npm run icons）
scripts/generate-covers.mjs # 由 src/assets/postImages/covers/*.svg 生成自动封面 webp（npm run covers）
scripts/new-post.mjs        # 文章脚手架（npm run new:post）
scripts/check-docs.mjs      # 文档自检：注入预算 + 分册存在性 + 编号引用完整性（npm run docs:check）
scripts/probe.mjs           # 定宽浏览器探针（Playwright）：给 URL/宽度，返回计算样式、溢出、元素计数
pagefind.yml                # 搜索索引排除规则
src/styles/                 # CSS + 一处 Stylus（markdown-extend.styl）
src/utils/                  # content/cover/date/gallery/image/layout/toc/url 工具函数
```

### 自研插件（`src/plugins/`）

这些是项目特色，**改动前务必先读源码**，不要凭想象重写：

- `rehype-email-protection.mjs` — 邮箱 base64 混淆防爬
- `rehype-external-links.mjs` — 外链处理（依赖 `siteConfig.site_url`）
- `rehype-figure.js` — 图片包 figure
- `rehype-component-github-card.mjs` — Markdown 里用 `<github>` 标签渲染仓库卡片
- `remark-image-grid.js` — 图片网格语法
- `remark-excerpt.js` — 摘要提取
- `remark-reading-time.mjs` — 阅读时长
- `remark-directive-rehype.js` — 指令节点转换

