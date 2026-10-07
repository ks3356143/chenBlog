<script lang="ts">
    import { getPostUrlBySlug } from "@/utils/url-utils"

    interface Post {
        id: string
        data: {
            title: string
            tags: string[]
            category?: string | null
            published: Date
        }
    }

    interface Group {
        year: number
        posts: Post[]
    }

    interface ActiveFilter {
        label: string
        values: string[]
    }

    // props 只是服务端那一遍的初值。归档页是**纯静态产物**，构建期 Astro.url 永远不带查询串，
    // 所以真实筛选值必须在客户端从 window.location.search 读——
    // 2026-09-24 那笔「去掉 client:only 水合空窗」把这行删了，导致 ?category / ?tag / ?uncategorized 全部恒空
    export let tags: string[] = []
    export let categories: string[] = []
    export let uncategorized: boolean = false
    export let sortedPosts: Post[] = []

    function resolveFilters(): { tags: string[]; categories: string[]; uncategorized: boolean } {
        if (typeof window === "undefined") return { tags, categories, uncategorized }
        const params = new URLSearchParams(window.location.search)
        if (!params.has("tag") && !params.has("category") && !params.has("uncategorized")) {
            return { tags, categories, uncategorized }
        }
        return {
            tags: params.getAll("tag"),
            categories: params.getAll("category"),
            uncategorized: params.has("uncategorized"),
        }
    }

    const { tags: activeTags, categories: activeCategories, uncategorized: activeUncategorized } = resolveFilters()

    function formatDate(date: Date) {
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const day = date.getDate().toString()
        return `${month}-${day}`
    }

    function formatTag(tagList: string[]) {
        return tagList.map((t) => `#${t}`).join(" ")
    }

    function formatFilterValues(filter: ActiveFilter) {
        const prefix = filter.label === "标签" ? "#" : ""
        return filter.values.map((value) => `${prefix}${value}`).join(" / ")
    }

    function resolvePrimaryFilter(filters: ActiveFilter[]) {
        return filters.find((filter) => filter.label === "标签") ?? filters[0] ?? null
    }

    function formatFilterSummary(filters: ActiveFilter[]) {
        return filters.map((filter) => `${filter.label}: ${formatFilterValues(filter)}`).join("  ·  ")
    }

    const currentFilters: ActiveFilter[] = []

    if (activeCategories.length > 0) {
        currentFilters.push({ label: "分类", values: activeCategories })
    }

    if (activeUncategorized) {
        currentFilters.push({
            label: "分类",
            values: ["未分类"],
        })
    }

    if (activeTags.length > 0) {
        currentFilters.push({ label: "标签", values: activeTags })
    }

    const activeFilters: ActiveFilter[] = currentFilters
    const primaryFilter: ActiveFilter | null = resolvePrimaryFilter(activeFilters)
    const secondaryFilters: ActiveFilter[] = primaryFilter
        ? activeFilters.filter((filter) => filter !== primaryFilter)
        : []

    let filteredPosts: Post[] = sortedPosts

    if (activeTags.length > 0) {
        filteredPosts = filteredPosts.filter(
            (post) => Array.isArray(post.data.tags) && post.data.tags.some((tag) => activeTags.includes(tag)),
        )
    }

    if (activeCategories.length > 0) {
        filteredPosts = filteredPosts.filter(
            (post) => post.data.category && activeCategories.includes(post.data.category),
        )
    }

    if (activeUncategorized) {
        filteredPosts = filteredPosts.filter((post) => !post.data.category)
    }

    // 按发布时间倒序排序，确保不受置顶影响
    filteredPosts = filteredPosts.slice().sort((a, b) => b.data.published.getTime() - a.data.published.getTime())

    const filteredPostCount: number = filteredPosts.length

    const grouped = filteredPosts.reduce(
        (acc, post) => {
            const year = post.data.published.getFullYear()
            if (!acc[year]) {
                acc[year] = []
            }
            acc[year].push(post)
            return acc
        },
        {} as Record<number, Post[]>,
    )

    const groups: Group[] = Object.keys(grouped)
        .map((yearStr) => ({
            year: Number.parseInt(yearStr, 10),
            posts: grouped[Number.parseInt(yearStr, 10)],
        }))
        .sort((a, b) => b.year - a.year)
</script>

<div class="card-base px-8 py-6">
    {#if primaryFilter}
        <div class="mb-5">
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <div class="min-w-0 text-sm text-75">
                    <span class="text-50">{primaryFilter.label}</span>
                    <span class="mx-2 text-30">/</span>
                    <span class="font-semibold text-(--primary)">{formatFilterValues(primaryFilter)}</span>
                    {#if secondaryFilters.length > 0}
                        <span class="ml-2 text-50">· {formatFilterSummary(secondaryFilters)}</span>
                    {/if}
                </div>
                <div class="shrink-0 text-xs text-50">
                    {filteredPostCount}
                    {filteredPostCount === 1 ? "篇文章" : "篇文章"}
                    <span class="mx-1.5 text-30">·</span>
                    {groups.length}
                    {groups.length} 年
                </div>
            </div>
        </div>
    {/if}

    {#each groups as group}
        <div>
            <div class="flex flex-row w-full items-center h-15">
                <div class="w-[18%] md:w-[10%] transition text-xl md:text-2xl font-bold text-right text-75 whitespace-nowrap">
                    {group.year}
                </div>
                <div class="w-[7%] md:w-[10%]">
                    <div
                        class="h-3 w-3 bg-none rounded-full outline-3 outline-(--primary) mx-auto
                  -outline-offset-2 z-50"
                    ></div>
                </div>
                <div class="w-[75%] md:w-[80%] transition text-left text-50">
                    {group.posts.length} 篇文章
                </div>
            </div>

            {#each group.posts as post}
                <a
                    href={getPostUrlBySlug(post.id)}
                    aria-label={post.data.title}
                    class="group btn-plain block! h-10 w-full rounded-lg hover:text-[initial]"
                >
                    <div class="flex flex-row justify-start items-center h-full">
                        <!-- 日期 -->
                        <div class="w-[18%] md:w-[10%] transition text-sm text-right text-50 whitespace-nowrap">
                            {formatDate(post.data.published)}
                        </div>
                        <!-- 点和线 -->
                        <div class="w-[7%] md:w-[10%] relative dash-line h-full flex items-center">
                            <div
                                class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                       bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-(--primary)! outline z-50
                       outline-(--card-bg)
                       group-hover:outline-(--btn-plain-bg-hover)
                       group-active:outline-(--btn-plain-bg-active)"
                            ></div>
                        </div>
                        <!-- 标题 -->
                        <div
                            class="w-[75%] md:max-w-[65%] md:w-[65%] text-left font-bold
                     group-hover:translate-x-1 transition-all group-hover:text-(--primary)!
                     text-75 pr-0 md:pr-8 whitespace-nowrap text-ellipsis overflow-hidden"
                        >
                            {post.data.title}
                        </div>

                        <!-- 标签ellipse -->
                        <div
                            class="hidden md:block md:w-[15%] text-left text-sm transition
                     whitespace-nowrap text-ellipsis overflow-hidden text-30"
                        >
                            {formatTag(post.data.tags)}
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {/each}
</div>
