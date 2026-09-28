export type NavBarLink = {
    name: string
    url: string
    // 图标名：src/icons 下的本地图标（home/archive/chat/xiangce/about）或 Iconify 全名
    icon?: string
    // 有子项时桌面渲染为下拉菜单、移动端渲染为可展开子菜单；此时 url 留空
    children?: NavBarLink[]
}

// 顶部菜单：改菜单只改这里，Header 与 MobileMenu 都从这里渲染
export const navBarLinks: NavBarLink[] = [
    { name: "主页", url: "/", icon: "home" },
    {
        name: "文章",
        url: "",
        icon: "material-symbols:article",
        children: [
            { name: "归档", url: "/archive/", icon: "archive" },
            { name: "分类", url: "/categories/", icon: "material-symbols:folder-open-rounded" },
            { name: "标签", url: "/tags/", icon: "material-symbols:tag-rounded" },
            { name: "系列", url: "/series/", icon: "material-symbols:layers" },
        ],
    },
    { name: "留言", url: "/guestbook/", icon: "chat" },
    { name: "相册", url: "/gallery/", icon: "xiangce" },
    { name: "关于", url: "/about/", icon: "about" },
]
