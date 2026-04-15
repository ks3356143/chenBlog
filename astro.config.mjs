// @ts-check
/// <reference types="astro/client" />
import { defineConfig } from "astro/config"

import tailwindcss from "@tailwindcss/vite"

import icon from "astro-icon"
// siteConfig
import { siteConfig } from "./src/config/siteConfig"

// mermaid
import mermaid from "astro-mermaid"

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
        mermaid({
            theme: "forest",
            autoTheme: true,
        }),
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
                pluginLanguageBadge(),
                pluginCollapsibleSections(),
                pluginLineNumbers(),
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
        sitemap(),
        svelte(),
    ],
    markdown: {
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
    },
})
