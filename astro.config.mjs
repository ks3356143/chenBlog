// @ts-check
import { defineConfig } from "astro/config"

import tailwindcss from "@tailwindcss/vite"

import icon from "astro-icon"

// remark
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js"

export default defineConfig({
    base: "/",
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [icon()],
    markdown: {
        remarkPlugins: [remarkExcerpt],
    },
})
