import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const postsCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
    schema: z.object({
        title: z.string(),
        published: z.date(),
        updated: z.date().optional(),
        draft: z.boolean().optional().default(false),
        description: z.string().optional().default(""),
        image: z.string().optional().default(""),
        tags: z.array(z.string()).optional().default([]),
        category: z.string().optional().nullable().default(""),
        // 系列名（空=不属于任何系列），配合 seriesOrder 决定系列内顺序
        series: z.string().optional().default(""),
        seriesOrder: z.number().optional(),
        pinned: z.boolean().optional().default(false),
        comment: z.boolean().optional().default(true),
        // 只有列表卡锁图标与「隐藏评论区」两处消费，没有密码门 UI，正文照常渲染进 HTML
        password: z.string().optional().default(""),

        /* For internal use */
        prevTitle: z.string().default(""),
        prevSlug: z.string().default(""),
        nextTitle: z.string().default(""),
        nextSlug: z.string().default(""),
    }),
})

const specCollection = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/spec" }),
    schema: z.object({}),
})

// 动态（说说）：一条一个 md 文件，文件名 YYYY-MM-DD-HHMMSS.md 即条目 id
const dynamicCollection = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/dynamic" }),
    schema: z.object({
        published: z.date(),
        pinned: z.boolean().optional().default(false),
        location: z.string().optional().default(""),
    }),
})

export const collections = {
    posts: postsCollection,
    spec: specCollection,
    dynamic: dynamicCollection,
}
