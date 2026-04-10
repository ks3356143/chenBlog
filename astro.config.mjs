// @ts-check
import { defineConfig } from "astro/config"

import tailwindcss from "@tailwindcss/vite"

import icon from "astro-icon"

// remark
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js"

// expreesiveCode
import expressiveCode, { pluginFramesTexts } from "astro-expressive-code"
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections"
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers"
import { pluginLanguageBadge } from "expressive-code-language-badge" /* Language Badge */
import { pluginCollapsible } from "expressive-code-collapsible" /* Collapsible */

pluginFramesTexts.overrideTexts(undefined, {
    copyButtonCopied: "复制成功",
})

export default defineConfig({
    base: "/",
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [
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
            },
        }),
    ],
    markdown: {
        remarkPlugins: [remarkExcerpt],
    },
})
