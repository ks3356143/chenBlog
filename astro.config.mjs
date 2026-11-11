// @ts-check
/// <reference types="astro/client" />
import { defineConfig } from "astro/config"

import tailwindcss from "@tailwindcss/vite"

import icon from "astro-icon"
// siteConfig
import { siteConfig } from "./src/config/siteConfig"

// markdown配置
import { unified } from "@astrojs/markdown-remark"

// mermaid
// 2026-11-11 **整包卸载**（mermaid 84.1MB + astro-mermaid）：全站 33 篇里
// ```mermaid 围栏 **0 个**、pre.mermaid **0 个**，产物里一个 mermaid chunk 都没有
// （上一版已注释掉挂载，只是把包留在 node_modules 里占位）。
// 剩下一批 `.mermaid-*` CSS 规则（产物 32 条 / 3066 B）是**给将来画图预留的样式**，
// 留在 markdown-extend.styl 里不影响任何现有页面；将来要画 mermaid 图，
// 重新 `npm i mermaid astro-mermaid` 并在此处挂回 `mermaid({...})` 即可。
// import mermaid from "astro-mermaid"
// mdx
import mdx from "@astrojs/mdx"

// remark
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js"
import remarkDirective from "remark-directive" /* Handle directives */
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js"
import remarkMath from "remark-math"
import remarkSectionize from "remark-sectionize"
import { remarkImageGrid } from "./src/plugins/remark-image-grid.js"
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs"

// rehype
import rehypeCallouts from "rehype-callouts"
import rehypeKatex from "rehype-katex"
import katex from "katex"
import "katex/dist/contrib/mhchem.mjs"
import rehypeSlug from "rehype-slug"
import rehypeFigure from "./src/plugins/rehype-figure.js"
import rehypeProseThumbs from "./src/plugins/rehype-prose-thumbs.js"
import rehypeExternalLinks from "./src/plugins/rehype-external-links.mjs"
import rehypeEmailProtection from "./src/plugins/rehype-email-protection.mjs"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

// expreesiveCode
import expressiveCode, { pluginFramesTexts } from "astro-expressive-code"
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections"
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers"
import { pluginLanguageBadge } from "expressive-code-language-badge" /* Language Badge */
import { pluginCollapsible } from "expressive-code-collapsible"
import sitemap from "@astrojs/sitemap"
import sitemapLastmod from "./src/plugins/integration-sitemap-lastmod.mjs"

// github卡片
import rehypeComponents from "rehype-components"
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs"

import svelte from "@astrojs/svelte"

pluginFramesTexts.overrideTexts(undefined, {
    copyButtonCopied: "复制成功",
})

export default defineConfig({
    site: siteConfig.site_url,
    base: "/",
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                "@rehype-callouts-theme": `rehype-callouts/theme/${siteConfig.rehypeCallouts.theme}`,
            },
        },
    },
    integrations: [
        // ── mermaid（2026-11-11 整包卸载，别急着加回）────────────────────
        // astro-mermaid 用 injectScript('page', ...) 把客户端脚本注入**每一个页面**，
        // 并在 config 里 optimizeDeps.include = ['mermaid'] → 整个 mermaid 进了主产物。
        // 实测（卸载前）：产物里一个 646.6KB 的 mermaid chunk、52 个 HTML 对它引用数为 0，
        // 同时是 vite「chunks larger than 500 kB」告警的唯一来源；
        // 而全站 33 篇里 ```mermaid 围栏 0 个、pre.mermaid 0 个，这段脚本永远不会执行。
        // 2026-11-04 已先摘掉挂载；2026-11-11 把 mermaid 84.1MB + astro-mermaid 一起卸了。
        // 要画图时：`npm i mermaid astro-mermaid` → 取消下面这行的注释 → 记得同步 .mermaid-* 那批样式。
        // mermaid({ theme: "forest", autoTheme: true }),
        icon({
            include: {
                "material-symbols": ["*"],
                "fa7-brands": ["*"],
                "fa7-regular": ["*"],
                "fa7-solid": ["*"],
                "simple-icons": ["*"],
                mdi: ["*"],
            },
        }),
        expressiveCode({
            themes: ["one-light", "one-dark-pro"],
            useDarkModeMediaQuery: false,
            customizeTheme: (theme) => {
                if (theme.name === "one-light") theme.name = "light"
                if (theme.name === "one-dark-pro") theme.name = "dark"
                return theme
            },
            themeCssSelector: (theme) => {
                if (theme.name === "one-light") return '[data-theme="light"]'
                if (theme.name === "one-dark-pro") return '[data-theme="dark"]'
                return `[data-theme="${theme.name}"]`
            },
            plugins: [
                // @ts-ignore
                pluginLanguageBadge(),
                pluginCollapsibleSections(),
                pluginLineNumbers(),
                // @ts-ignore
                pluginCollapsible({
                    lineThreshold: 15, // 当代码行数超过15行时显示折叠按钮
                    previewLines: 8, // 折叠时显示前8行
                    defaultCollapsed: true, // 默认折叠长代码块
                    expandButtonText: "展开",
                    collapseButtonText: "折叠",
                    expandedAnnouncement: "代码块已展开",
                    collapsedAnnouncement: "代码块已折叠",
                }),
            ],
            defaultProps: {
                wrap: false, // 代码不自动换行
                overridesByLang: {
                    shellsession: {
                        showLineNumbers: false, // 遇到shell代码不现实代码行
                    },
                },
            },
            frames: {
                showCopyToClipboardButton: true, // 始终显示复制按钮
            },
            // 覆盖样式
            styleOverrides: {
                borderRadius: "0", // 边框圆角设置
                codeFontSize: "var(--code-font-size)", // 代码块字体大小
                codeFontFamily:
                    "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                codeLineHeight: "1.5rem",
                textMarkers: {
                    delHue: "0deg",
                    insHue: "180deg",
                    markHue: "250deg",
                },
                // @ts-ignore
                languageBadge: {
                    fontSize: "0.5rem",
                    fontWeight: "bold",
                    borderRadius: "0",
                    opacity: "0.85",
                    borderWidth: "0px",
                    borderColor: "transparent",
                },
            },
        }),
        // ⚠️ 这个集成没有 `exclude` 键（schema 是 .strict()，给错键名只打一行
        // `Unrecognized key: "exclude"` 然后**整个 sitemap 不写了**，dist 里静默少两个文件）。
        // 排除页面只能用 `filter`。404 页不该进 sitemap（搜索引擎抓它等于抓死信）。
        sitemap({ filter: page => !page.includes("/404") }),
        // 紧跟在 sitemap 之后：给它产出的每条 <loc> 补 <lastmod>（真实时间，非统一时间）。
        // 必须排在 sitemap 之后注册，否则 build:done 里 sitemap-0.xml 还没写出来。见五-59。
        sitemapLastmod(),
        svelte(),
        mdx(),
    ],
    markdown: {
        processor: unified({
            remarkPlugins: [
                remarkMath,
                remarkReadingTime,
                remarkImageGrid,
                remarkExcerpt,
                remarkDirective,
                remarkSectionize,
                parseDirectiveNode,
            ],
            rehypePlugins: [
                [rehypeKatex, { katex }],
                [rehypeCallouts, { theme: siteConfig.rehypeCallouts.theme }],
                rehypeSlug,
                // 正文图缩略图 srcset：必须排在 rehypeFigure **之前** ——
                // 后者会把 img 包进 figure/center 并复制 properties，
                // 排在它后面等于在一份已经复制出去的快照上加属性，改不到最终节点。
                // @ts-ignore
                rehypeProseThumbs,
                // @ts-ignore
                rehypeFigure,
                // @ts-ignore
                [rehypeExternalLinks, { siteUrl: siteConfig.site_url }],
                // @ts-ignore
                [rehypeEmailProtection, { method: "base64" }], // 邮箱保护插件，支持 'base64' 或 'rot13'
                [
                    rehypeComponents, // github卡片插件
                    {
                        components: {
                            github: GithubCardComponent,
                        },
                    },
                ],
                [
                    rehypeAutolinkHeadings,
                    {
                        behavior: "append",
                        properties: {
                            className: ["anchor"],
                        },
                        content: {
                            type: "element",
                            tagName: "span",
                            properties: {
                                className: ["anchor-icon"],
                                "data-pagefind-ignore": true,
                            },
                            children: [
                                {
                                    type: "text",
                                    value: "#",
                                },
                            ],
                        },
                    },
                ],
            ],
        }),
    },
})
