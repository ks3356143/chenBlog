// astro.config.mjs 的 vite alias：值由 siteConfig.rehypeCallouts.theme 拼出，
// tsc / Volar 不解析 vite alias，所以给一条环境声明。改这里不会让构建失败，
// 但删了它 astro check 会报 ts(2882)。
declare module "@rehype-callouts-theme";
