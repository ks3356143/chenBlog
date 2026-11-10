/// <reference types="mdast" />
import { h } from "hastscript"
import { readFileSync } from "node:fs"
import { join } from "node:path"

/*
 * GitHub 仓库卡片（Markdown 里的 `::github{repo="owner/repo"}`）
 *
 * ── 为什么**不再**在浏览器里 fetch api.github.com（2026-11-10 改）
 * 旧实现是把数据交给一段内联脚本，在访客浏览器里 `fetch('https://api.github.com/repos/…')`。
 * 三个问题叠在一起，卡片在线上**必然**退化成"未能连上 GitHub API"：
 *   ① 访客网络到 api.github.com 常常不通（国内直连不稳，实测本机 curl 直接 ERR/exit 35）；
 *   ② 即使通，未认证 API 限额只有 60 次/小时/IP，一个 IP 后面挂很多人时薄得像纸；
 *   ③ 数据要靠 JS 才出现 → 首屏是骨架脉冲，SEO 与"没开 JS"时永远看不到描述/stars。
 * 现在改成**构建期**读 `src/data/githubCards.json`（快照，2026-11-10 经服务器中转拉的真实值），
 * 直接把文字/头像写进 HTML。代价是数字不会自己更新 —— 改数据就改那个 JSON，一行的事。
 * 🔴 追加任何 `repo` 前先把数据加进 JSON，否则卡片会渲染成"数据未登记"的空态（有兜底，不会挂）。
 */

const SNAPSHOT = (() => {
    try {
        const raw = readFileSync(join(process.cwd(), "src/data/githubCards.json"), "utf8")
        return JSON.parse(raw)
    } catch {
        // 构建不应该因为缺快照文件就失败：退化成"未登记"的空卡片，至少还能点开仓库页
        return { owner: "", avatar: "", repos: {} }
    }
})()

/** Intl 紧凑数字（1.2K / 33.4M），与旧脚本完全同一套口径，只是搬到构建期算 */
const compact = n => {
    if (typeof n !== "number" || !Number.isFinite(n)) return "—"
    try {
        return Intl.NumberFormat("en-us", { notation: "compact", maximumFractionDigits: 1 })
            .format(n)
            .replaceAll("\u202f", "")
    } catch {
        return String(n)
    }
}

/**
 * Creates a GitHub Card component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} properties.repo - The GitHub repository in the format "owner/repo".
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created GitHub Card component.
 */
export function GithubCardComponent(properties, children) {
    if (Array.isArray(children) && children.length !== 0)
        return h("div", { class: "hidden" }, [
            'Invalid directive. ("github" directive must be leaf type "::github{repo="owner/repo"}")',
        ])

    if (!properties.repo || !properties.repo.includes("/"))
        return h(
            "div",
            { class: "hidden" },
            'Invalid repository. ("repo" attributte must be in the format "owner/repo")',
        )

    const repo = properties.repo
    const [owner, name] = repo.split("/")
    const meta = SNAPSHOT.repos?.[repo]
    const pending = !meta

    // 头像用构建期的本地 webp（public/images/github-avatar.webp）：访客不必再去
    // avatars.githubusercontent.com 取一次图 —— 那条域名同样在国内常年不通，
    // 而且远端头像会让首屏多一次跨域往返。没登记头像时退回主色块（样式里本来就是底色）。
    const avatarStyle = SNAPSHOT.avatar ? `background-image:url(${SNAPSHOT.avatar})` : ""

    const nAvatar = h("div", { class: "gc-avatar", style: avatarStyle })
    const nLanguage = h("span", { class: "gc-language" }, meta?.language || "未知")

    const nTitle = h("div", { class: "gc-titlebar" }, [
        h("div", { class: "gc-titlebar-left" }, [
            h("div", { class: "gc-owner" }, [nAvatar, h("div", { class: "gc-user" }, owner)]),
            h("div", { class: "gc-divider" }, "/"),
            h("div", { class: "gc-repo" }, name),
        ]),
        h("div", { class: "github-logo" }),
    ])

    const description = meta?.description || "未填写描述"
    const nDescription = h("div", { class: "gc-description" }, description)

    const license = meta?.license || "no-license"
    const nStars = h("div", { class: "gc-stars" }, compact(meta?.stars))
    const nForks = h("div", { class: "gc-forks" }, compact(meta?.forks))
    const nLicense = h("div", { class: "gc-license" }, license)

    return h(
        `a.card-github${pending ? " fetch-error" : ""}.no-styling`,
        {
            href: `https://github.com/${repo}`,
            target: "_blank",
            rel: "noopener noreferrer",
            repo,
        },
        // gc-infobar 里的顺序照旧：stars / forks / license / language（language 在样式里 display:none）
        [nTitle, nDescription, h("div", { class: "gc-infobar" }, [nStars, nForks, nLicense, nLanguage])],
    )
}
