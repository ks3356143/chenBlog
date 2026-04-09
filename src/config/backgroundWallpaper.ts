export const backgroundWallpaper = {
    // 配置本地背景图片
    src: ["assets/covers/1.jpg", "assets/covers/2.jpg", "assets/covers/3.jpg"],
    // 图片位置，推荐直接使用居中，css的object-position属性
    position: "center",
    // 主页横幅文字
    homeText: {
        // 是否启用主页横幅文字
        enable: true,
        // 主页横幅主标题
        title: "Lovely Life!",
        // 主页横幅主标题大小
        titleSize: "3.8rem",
        // 主页横幅副标题
        subtitle: [
            "山中何事？松花酿酒，春水煎茶",
            "雪沫乳花浮午盏，蓼茸蒿笋试春盘，人间有味是清欢",
            "醉后不知天在水，满船清梦压星河",
        ],
        // 主页横幅副标题字体大小
        subtitleSize: "1.5rem",
        typewriter: {
            // 是否启用打字机效果
            // 打字机开启 → 循环显示所有副标题
            // 打字机关闭 → 每次刷新随机显示一条副标题
            enable: true,
            // 打字速度（毫秒）
            speed: 100,
            // 删除速度（毫秒）
            deleteSpeed: 50,
            // 完全显示后的暂停时间（毫秒）
            pauseTime: 2000,
        },
    },
    // 横幅轮播图配置
    carousel: {
        enable: true,
        interval: 5000,
    },
}
