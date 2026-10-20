// 项目展示页（/projects/）的数据源。
//
// 每加一个项目 = 在 projects 数组里加一项；改项目信息只改这里，不用动页面与组件。
//
// 🔴 图标名只能用**项目真装了的**集合：
//   · src/icons/ 下自带的（github / arrow-right / about ...，写裸名即可）
//   · material-symbols / fa-solid / fa6-solid / fa7-solid / mingcute（写全集名）
//   ⚠️ fa7-brands / simple-icons / fa7-regular / mdi **都没装** —— 照抄参考站的
//   fa7-brands:github 会把构建打挂（AGENTS 五-29）。GitHub 图标用自带的 "github"。

export type ProjectStatus = "published" | "developing" | "planning" | "archived"

export interface Project {
	/** 唯一标识，仅用于内部 key */
	id: string
	name: string
	/** 一句话简介，卡片上显示 */
	description: string
	/** 状态：决定徽标文案与筛选分组 */
	status: ProjectStatus
	/** 技术栈标签，卡片底部小药丸 */
	tech: string[]
	/** 仓库地址（可选） */
	repo?: string
	/** 在线演示地址（可选） */
	demo?: string
	/** 本地图标名（src/icons）或 Iconify 全集名 */
	icon?: string
	/** 开始/上线年份，用于卡片角标（可选） */
	year?: string
	/** 是否在列表里置顶 */
	featured?: boolean
}

/** 状态的中文文案与配色（配色用项目已有 CSS 变量，别写死 hex） */
export const statusMeta: Record<ProjectStatus, { label: string; icon: string }> = {
	published: { label: "已发布", icon: "material-symbols:check-circle-rounded" },
	developing: { label: "开发中", icon: "material-symbols:progress-activity" },
	planning: { label: "计划中", icon: "material-symbols:lightbulb-outline-rounded" },
	archived: { label: "已归档", icon: "material-symbols:archive-outline-rounded" },
}

export const projectsConfig = {
	title: "项目",
	description: "这里展示我开发过的项目与工具",
	projects: [
		{
			id: "ccnewtools",
			name: "CCNewTools 测试文档工具集",
			description:
				"离线测试文档工具集：把第三方测试大纲（.docx）解析成用例树，核对可疑步骤后生成测试说明与测试记录；另可从大纲/记录/回归说明生成四类需求追踪表。全程不联网。",
			status: "published",
			tech: ["Windows", "Linux", "银河麒麟", "Word 自动化", "离线"],
			repo: "https://github.com/ks3356143/cdTestPlant3",
			year: "2026",
			featured: true,
			icon: "material-symbols:description-rounded",
		},
		{
			id: "chenblog",
			name: "亦林 · 个人博客",
			description:
				"你现在看的这个站点。基于 Astro + Svelte 5 + Tailwind v4 的纯静态博客，自建 8 个 remark/rehype 插件，含相册、动态、评论与站内搜索。",
			status: "developing",
			tech: ["Astro", "Svelte 5", "Tailwind v4", "TypeScript"],
			repo: "https://github.com/ks3356143/chenBlog",
			year: "2026",
			featured: true,
			icon: "material-symbols:public-rounded",
		},
		{
			id: "cdtestplant-v1",
			name: "cdTestPlant v1",
			description: "CCNewTools 的前一个版本，历史归档保留。",
			status: "archived",
			tech: ["测试工具", "历史版本"],
			repo: "https://github.com/ks3356143/cdtestplant_v1",
			year: "2025",
			icon: "material-symbols:history-rounded",
		},
	] as Project[],
}
