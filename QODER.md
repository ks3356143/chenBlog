# QODER.md — 项目长期指令

> 陈俊亦的个人博客。每次对话开始时自动读取本文件作为上下文。
> 最后更新：2026-09-20

## 一、这是什么项目

个人博客，**纯静态站点**（Astro SSG），部署在阿里云 + 宝塔面板 + Nginx 上。

- 线上地址：http://47.108.230.220/ （目前是 IP，**没有域名**）
- 文章 27 篇，UI 和提交信息全部为中文

## 二、技术栈

| 层 | 选型 |
|---|---|
| 框架 | Astro 7.0.2（SSG，非 SSR） |
| 交互组件 | Svelte 5（runes 语法） |
| 样式 | Tailwind CSS 4（`@tailwindcss/vite`，**v4 无 tailwind.config.js**，配置写在 CSS 里） |
| 语言 | TypeScript 6 |
| 内容 | MDX + Content Collections |
| 代码高亮 | astro-expressive-code（one-light / one-dark-pro，内部重命名为 `light` / `dark`） |
| 其他 | Mermaid 图表、KaTeX 公式、Fancybox 图库、astro-icon + Iconify |

**注意**：Tailwind 4 + Astro 7 + Svelte 5 都是较新的大版本，网上很多教程是旧版写法，改配置前先确认版本。

## 三、常用命令

```bash
npm run dev       # 本地开发，http://localhost:4321
npm run build     # 构建，产物在 dist/
npm run preview   # 预览构建产物
```

`package.json` 里**没有** lint / test 脚本，也没有部署脚本。验证手段就是 `dev` 看效果 + `build` 确认能构建通过。

## 四、目录结构（关键位置）

```
astro.config.mjs        # 所有插件和 markdown 处理链的唯一配置入口
src/content.config.ts   # 文章 frontmatter schema（改文章字段前必看）
src/config/siteConfig.ts    # 站点总开关：分页数、图片格式、页面开关、site_url
src/config/                 # 另有 backgroundWallpaper / commentConfig / galleryConfig
src/content/posts/          # 27 篇文章
src/content/spec/           # 单页内容（about 等）
src/pages/                  # 路由：about / archive / guestbook / gallery / posts/[...slug] / [...page]
src/pages/rss.xml.js        # RSS 已实现
src/layouts/                # BaseLayout.astro + Layout.astro
src/plugins/                # 8 个自研 remark/rehype 插件（见下）
src/styles/                 # CSS + 一处 Stylus（markdown-extend.styl）
src/utils/                  # content/date/gallery/image/layout/toc/url 工具函数
```

### 自研插件（`src/plugins/`）

这些是项目特色，**改动前务必先读源码**，不要凭想象重写：

- `rehype-email-protection.mjs` — 邮箱 base64 混淆防爬
- `rehype-external-links.mjs` — 外链处理（依赖 `siteConfig.site_url`）
- `rehype-figure.js` — 图片包 figure
- `rehype-component-github-card.mjs` — Markdown 里用 `<github>` 标签渲染仓库卡片
- `remark-image-grid.js` — 图片网格语法
- `remark-excerpt.js` — 摘要提取
- `remark-reading-time.mjs` — 阅读时长
- `remark-directive-rehype.js` — 指令节点转换

## 五、必须知道的配置约定

1. **`site_url` 是环境相关的**（`src/config/siteConfig.ts:42`）：
   dev 时是 `http://localhost:4321`，构建时是 `http://47.108.230.220`。
   → 改了域名/地址要同时改这里，否则外链、sitemap、RSS 全部错乱。

2. **文章封面路径以 `src/` 为基准**，不是以文章文件为基准（见 siteConfig 顶部注释）。

3. **代码块默认折叠**：超过 15 行自动折叠，预览前 8 行。长代码看起来"消失"了是这个原因。

4. **主题切换用 `data-theme="light|dark"` 属性**，不是 Tailwind 默认的 `dark:` class 策略。写暗色样式时注意。

5. **文章 frontmatter schema** 定义在 `src/content.config.ts`，字段包括：
   `title` `published` `updated` `draft` `description` `image` `tags` `category` `lang` `pinned` `author` `sourceLink` `licenseName` `licenseUrl` `comment` `password` `passwordHint`
   新增字段必须改 schema，否则构建报错。支持 `password` 加密文章。

6. **图片统一输出 webp，质量 80**（未开 avif）。

7. `dist/`、`.astro/`、`node_modules/` 都在 `.gitignore` 里，**构建产物不入库**。

8. **Astro 7 下不能留空的 `<script></script>`**。空脚本不产出 chunk，Astro 7 解析其构建路径时会直接
   `Error: Cannot find the built path for ...astro?astro&type=script&index=0&lang.ts`，
   导致整个页面（含首页）渲染失败。Astro 6 容忍、Astro 7 报错。
   → 已于 2026-09-20 从 `src/pages/[...page].astro` 移除一处。要么写内容，要么整行删掉，别留空标签。

9. 构建产物基线（2026-09-20，Astro 7.0.2）：**37 个页面 / dist 246 个文件**，构建约 6s。
   已知无害警告两条：`logo.png` 的 `INEFFECTIVE_DYNAMIC_IMPORT`（被 Header.astro 静态引入，
   同时被 CoverImage/ImageWrapper 动态引入）、以及 vite chunk 体积提示。看到它们不用管。

## 六、部署

**部署方式：本地构建 + 上传 `dist`，服务器不跑 build。**（2026-09-20 起）

- 服务器：阿里云 ECS，宝塔面板 + Nginx
- SSH：`root@47.108.230.220`，**端口 22**，仅 publickey 认证（密码登录已关闭），本地 `~/.ssh/id_rsa` 已授权 ✅
- 服务器上虽有 node `v24.14.1` / npm `11.11.0` 和一份 `node_modules`，但**已不用于部署**：
  那份依赖停在 Astro 6.1.6，`npm ci` 会因 peer 冲突直接失败（详见"已知坑"）。**别在服务器上 build。**
- 服务器上的 git 仓库也不再是部署来源，会与远端脱节，属正常现象。

### 部署目标路径

| 项 | 值 |
|---|---|
| 仓库目录 | `/www/wwwroot/chenBlog` |
| **Nginx 根目录** | **`/www/wwwroot/chenBlog/dist`** |
| vhost 配置 | `/www/server/panel/vhost/nginx/html_chenblog.com.conf` |
| 监听 | `listen 80` + `server_name 0.0.0.0` → 裸 IP 直接命中博客，站点标题 `YILIn` |

Nginx 根目录直接指向 `dist/`，**build 完成即上线**，无需额外拷贝或 reload。

> ⚠️ 服务器 `/www/wwwroot/` 下**还并存着其他项目的目录**。曾经发生过把博客路径认错的情况，
> 若推错目录会直接毁掉另一个项目。动手前务必确认当前路径是 `chenBlog/dist`，不要凭记忆。

### 标准部署流程（已验证可用）

```bash
# ① 本地构建 + 打包
npm run build
tar -czf /tmp/chenblog_dist.tar.gz -C dist .

# ② 上传
scp /tmp/chenblog_dist.tar.gz root@47.108.230.220:/tmp/

# ③ 服务器：解压到临时目录 → 校验 → 原子替换
ssh root@47.108.230.220 'set -e
  cd /www/wwwroot/chenBlog
  cp -a dist "dist_backup_$(date +%Y%m%d_%H%M%S)"   # 先备份，出问题可回滚
  rm -rf dist.new && mkdir dist.new
  tar -xzf /tmp/chenblog_dist.tar.gz -C dist.new
  test -f dist.new/index.html                        # 关键文件校验，缺了就中止
  chmod -R a+rX dist.new
  chown -R root:root dist.new                        # 必须！见"已知坑"①
  rm -rf dist.old && mv dist dist.old && mv dist.new dist
  rm -f /tmp/chenblog_dist.tar.gz'
```

先解压到 `dist.new` 再用 `mv` 原子替换，避免"解压到一半、访客看到残缺站点"的窗口期。
`dist.old` + 时间戳备份都保留，回滚只需 `rm -rf dist && mv dist.old dist`。

remote：`git@github.com:ks3356143/chenBlog.git`（本地与服务器同一个 origin，分支 `main`）

**注意：该仓库是公开的**（可匿名 `git ls-remote` 读取），任何写进仓库的文件都等于发布到公网。

### 验证线上的正确姿势

```bash
# 从本机访问公网 IP（最可靠）
curl -s -o /dev/null -w "HTTP %{http_code} %{size_download}B\n" http://47.108.230.220/

# 中文文章 URL 必须 percent-encode
curl -s -o /dev/null -w "%{http_code}\n" \
  "http://47.108.230.220/posts/$(node -e "console.log(encodeURIComponent('css100天-第28天'))")/"
```

### 已知坑（均为 2026-09-20 部署实测踩到）

① **Windows 打包的 tar 会带数字 UID（本机是 `197609`）**，解压到 Linux 后属主变成不存在的
   `UNKNOWN:UNKNOWN`。虽然 `chmod a+rX` 后 nginx 仍读得到，但**必须 `chown -R root:root`** 归正，
   否则后续任何按属主判断的运维操作都会出怪事。

② **在服务器上 `curl http://127.0.0.1/` 测不到博客！** 该请求 Host 头是 `127.0.0.1`，会精确命中
   `phpfpm_status.conf`（`listen 80; server_name 127.0.0.1;`），返回 404，看起来像站点挂了。
   博客 vhost 是 `server_name 0.0.0.0` 靠默认服务器兜底。
   → 自测要么加 `-H "Host: 47.108.230.220"`，要么直接从外部打公网 IP。

③ **node 的 `execSync` 在 Windows 上走 `cmd.exe` 而非 bash**，`/dev/null` 和 curl 的 `%{http_code}`
   都会被 cmd 吃掉，导致所有请求"失败"的假象。HTTP 测试一律用 Bash 工具直接跑 curl。

④ **中文文章 URL 必须 percent-encode**，否则 nginx 返回 404。用 `encodeURIComponent` 生成。

⑤ **Astro 7 与 `astro-expressive-code@0.43.1` 存在 peer 冲突**（后者只声明到 `^6`），
   服务器上 `npm ci` 会因此失败。彻底修复需连带升级两个 **major**：
   `expressive-code-language-badge` 1.1.0→2.0.0、`expressive-code-collapsible` 0.1.0→1.0.0
   （二者都要求 `@expressive-code/core ^0.44.1`）。
   → 这是**独立任务**，需逐个回归验证代码高亮/折叠/语言徽章。目前靠"本地构建"绕开，不影响上线。

⑥ **服务器仓库有未提交改动**：`package.json`、`package-lock.json` 常处于 modified 状态
   （历史 `npm install` 顺手改写出来的垃圾改动），`git pull` 会因此冲突。pull 前需先
   `git checkout --` 丢弃。宝塔生成的未跟踪文件 `.htaccess` `.user.ini` `404.html` `index.html` 无害，别删。

⑦ **线上版本极易滞后**：2026-09-20 发现线上 dist 构建于 2026-06-22，落后本地 16 个提交，
   其中 `bad5d80 修复评论问题`（Twikoo envId 误配 localhost）在服务器上躺了近三个月才上线。
   → **改完必须真的部署，并实际访问线上确认**，别只看到本地 build 通过就算完事。

### 面板与凭据

- 宝塔面板地址、端口、安全入口等**一律不写进本文件**（仓库公开）。需要时问用户，或查本地私密记录。
- 面板为**自签名证书**，浏览器自动化会被 `ERR_CERT_AUTHORITY_INVALID` 拦住，
  且 in-app 浏览器 surface 隐藏无法截图；http 访问直接 `ERR_CONNECTION_RESET`
  → **面板不适合自动化，一律走 SSH。**
- **凭据纪律**：面板密码、SSH 私钥、任何 token **一律不得写入本文件或提交进 git**；
  也不要在对话里明文传递。改密码应由用户自己在面板 UI 操作，避免新密码再次落入会话记录。
- 勿运行 `bt 14` / `bt default`——会把面板密码明文打印出来。

### 铁律

> **生产环境的上线动作，默认由用户本人执行。**
> 我负责改代码 + `npm run build` 验证产物。除非用户当次明确授权，否则我不擅自 ssh/scp 覆盖线上文件、不重启 Nginx、不改宝塔配置。
> 授权一次只对那一次有效，不视为长期许可。

## 七、协作约定

- **改之前先跑起来看现状**，不凭想象动手；改完必须 `npm run build` 通过再报完成
- **UI 改动要在浏览器里实际验证**（可用 browser-use 只读访问线上站点对比）
- 提交粒度小，一次改动一件事，方便回退
- 提交信息用中文，跟现有风格一致（如"添加前端css邪修-2ge"）
- 不引入新依赖前先问；不擅自升级大版本
- 不确定就问，别猜

## 八、README 里的待办（可能已过期）

`README.md` 写着后续计划：① 页面间动画（ClientRouter / swup）② 404 页面 ③ RSS 添加。

其中 **③ RSS 已经实现了**（`src/pages/rss.xml.js` + `@astrojs/rss`），README 未更新。
① ② 状态待确认。
