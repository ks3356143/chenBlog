// 项目展示页（/projects/）的数据源。
//
// 每加一个项目 = 在 projects 数组里加一项；改项目信息只改这里，不用动页面与组件。
// 内容依据 2026-10-20 从 GitHub API 拉取的真实仓库信息（描述 / 语言 / 创建时间 / README）填写，
// **不是凭印象编的**。改完跑 `npm run build` 即可。
//
// 🔴 图标名只能用**项目真装了的**集合：
//   · src/icons/ 下自带的（github / arrow-right / about ...，写裸名即可）
//   · material-symbols / fa-solid / fa6-solid / fa7-solid / mingcute（写全集名）
//   ⚠️ fa7-brands / simple-icons / fa7-regular / mdi **都没装** —— 照抄参考站的
//   fa7-brands:github 会把构建打挂（AGENTS 五-29）。GitHub 图标用自带的 "github"。
//
// ⚠️ 状态取值：published 已发布 / developing 开发中 / planning 计划中 / archived 已归档。
//   页面只为**实际用到的**状态渲染筛选按钮（避免死筛选）。

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
			id: "meridian",
			name: "ChenMeridian 测试管理工具",
			description:
				"本地测试管理工具，覆盖项目、测试项、用例、执行记录、问题单、测试报告，并能生成 Word 交付文档。后端 Go + Huma + GORM + 纯 Go SQLite，前端 React 19 + shadcn/ui，单机运行、数据不出本机。",
			status: "developing",
			tech: ["Go", "React", "SQLite", "Tailwind v4", "Word 生成"],
			repo: "https://github.com/ks3356143/meridian",
			year: "2026",
			featured: true,
			icon: "material-symbols:dashboard-customize-rounded",
		},
		{
			id: "ccnewtools",
			name: "CCNewTools 测试文档工具集",
			description:
				"把第三方测评大纲（.docx）自动转换成《测试说明》与《测试记录》两份 Word，另可从大纲/记录/回归说明生成四类需求追踪表。上百个用例的誊写交给机器，人只核对修正。免安装运行环境，Windows / Linux / 银河麒麟单文件即用，全程离线。",
			status: "published",
			tech: ["TypeScript", "Word 自动化", "离线", "Windows", "银河麒麟"],
			repo: "https://github.com/ks3356143/CCNewTools",
			year: "2026",
			featured: true,
			icon: "material-symbols:description-rounded",
		},
		{
			id: "chenblog",
			name: "亦林 · 个人博客",
			description:
				"你现在看的这个站点。基于 Astro + Svelte 5 + Tailwind v4 的纯静态博客，自建 8 个 remark/rehype 插件，含相册、动态、评论、站内搜索与每篇独立分享图。",
			status: "developing",
			tech: ["Astro", "Svelte 5", "Tailwind v4", "TypeScript"],
			repo: "https://github.com/ks3356143/chenBlog",
			year: "2026",
			featured: true,
			icon: "material-symbols:public-rounded",
		},
		{
			id: "newtoolfortest",
			name: "newToolforTest（PyQt 老工具）",
			description:
				"用 PyQt 写的测评辅助工具，是我做测试文档自动化的起点。包含单元测试转换、IEEE754 浮点数转换、FPGA 文档处理，以及「CPU 记录反向生成说明」等能力，迭代到 V0.19。",
			status: "archived",
			tech: ["Python", "PyQt", "Word 处理", "FPGA 文档"],
			repo: "https://github.com/ks3356143/newToolforTest",
			year: "2022",
			icon: "material-symbols:history-rounded",
		},
		{
			id: "codestation",
			name: "codeStation",
			description:
				"一个代码/内容管理平台的全栈实现：Django-ninja-extra 写后端，React + Vite 做前台，Ant Design Pro 做后台。三个仓库（backend / fontend / BackPlant）配套使用。",
			status: "archived",
			tech: ["Django", "React", "Ant Design Pro", "TypeScript"],
			repo: "https://github.com/ks3356143/codeStation-backend",
			year: "2025",
			icon: "material-symbols:storage-rounded",
		},
		{
			id: "testplant-v1",
			name: "testplantV1 测试管理平台",
			description:
				"测试管理平台 V1，使用 AI 做原型设计并起步开发。后端基于 Django-ninja-extra。",
			status: "archived",
			tech: ["Python", "Django", "CSS", "AI 辅助原型"],
			repo: "https://github.com/ks3356143/testplantV1",
			year: "2026",
			icon: "material-symbols:web-stories-rounded",
		},
		{
			id: "cdtestplant-v1",
			name: "cdtestplant_v1",
			description: "早期测试平台版本，后端用 django-ninja-extra 改造。CCNewTools 之前的一代方案。",
			status: "archived",
			tech: ["Python", "Django Ninja", "历史版本"],
			repo: "https://github.com/ks3356143/cdtestplant_v1",
			year: "2023",
			icon: "material-symbols:history-rounded",
		},
		{
			id: "cdtestplant3",
			name: "cdTestPlant3（多项目合集）",
			description: "一个仓库里放了 3 个项目，基于 Vue 的测试相关前端实现。",
			status: "archived",
			tech: ["Vue", "测试工具"],
			repo: "https://github.com/ks3356143/cdTestPlant3",
			year: "2023",
			icon: "material-symbols:folder-copy-rounded",
		},
	] as Project[],
}
