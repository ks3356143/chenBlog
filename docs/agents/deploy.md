# AGENTS 分册 · 第六节「部署」全文（路径表 / 缓存策略 / 部署流程 / 已知坑 / 面板与凭据 / 铁律）

> 本文件是 `AGENTS.md` 某一节的**全文**，2026-10-12 从 AGENTS.md 无损切出。
> `AGENTS.md` 只留常驻结论与索引（受 harness 64KB 注入预算限制）；改到本节任何主题前先读本文件全文。
> **行内容逐字未改**，条目编号（五-16 / 八-9 / 十-14 …）在 AGENTS.md 与 HANDOFF.md 里照旧引用。

---

## 六、部署

> 🔒 **本节的主机登录目标、服务器绝对路径、宝塔配置文件名一律写成占位符**（2026-10-01 脱敏，
> 因为仓库公开 = 这些值等于已发布）。真实值在仓库根的本地私密记录 **`AGENTS.local.md`**
> （已被 `.gitignore` 与全局 `*.local.md` 两层挡住，**harness 每次会话自动注入**；
> 那份记录里同时有**把占位符展开后的完整部署命令**，可直接复制执行）。
> ⚠️ 2026-10-12 迁移记录：这里原先指向上一任工具的跨会话记忆目录（`~\.qoder-cn\…\reference-deploy-targets.md`），
> 该工具已卸载；**原件的校验备份在 `C:\Users\31429\.dsh\qoder-memories-backup\chenBlog\`**（22 文件，SHA256 逐一比对过）。
> 用到的占位符：`<ECS_SSH>`（user@host + 端口）、`<ECS_IP>`、`<REPO_DIR>`、`<NGINX_ROOT>`、
> `<VHOST_CONF>`、`<CACHE_CONF>`、`<CONF_BACKUP_DIR>`、`<WWW_ROOT>`、`<TWIKOO_ENV_ID>`。
> ⚠️ 取不到那份记录**不要猜路径**，问用户。面板密码 / SSH 私钥 / 任何 token **哪一份记录都不存**。
> 裸 IP 不算秘密（它就在 `src/config/siteConfig.ts` 的 `site_url` 和每个页面的产物里），所以
> 「验证线上」那几条 curl 仍写实际 IP；被移出的只有登录目标与服务器内部路径。

**部署方式：本地构建 + 上传 `dist`，服务器不跑 build。**（2026-09-20 起）
> 2026-09-28 接了 Pagefind：索引在 `dist/pagefind/` 里，**随 dist 一起打包上传就行，服务器和 Nginx 不用改**；
> 但 `npm run build` 现在包含索引步骤，别只跑 `astro build` 就打包，那样线上搜索会 404。

- 服务器：阿里云 ECS，宝塔面板 + Nginx
- SSH：`<ECS_SSH>`，仅 publickey 认证（密码登录已关闭），本机 SSH 公钥已授权到该服务器 ✅
- 服务器上虽有 node `v24.14.1` / npm `11.11.0` 和一份 `node_modules`，但**已不用于部署**：
  那份依赖停在 Astro 6.1.6，`npm ci` 会因 peer 冲突直接失败（详见"已知坑"）。**别在服务器上 build。**
- 服务器上的 git 仓库也不再是部署来源，会与远端脱节，属正常现象。

### 部署目标路径

| 项 | 值 |
|---|---|
| 仓库目录 | `<REPO_DIR>` |
| **Nginx 根目录** | **`<NGINX_ROOT>`**（= `<REPO_DIR>/dist`） |
| vhost 配置 | `<VHOST_CONF>` |
| 监听 | `listen 80` + `server_name 0.0.0.0` → 裸 IP 直接命中博客 |

Nginx 根目录直接指向 `dist/`，**build 完成即上线**，无需额外拷贝或 reload。

### 缓存策略（2026-09-30 加，改在 extension 里）

配置文件：`<CACHE_CONF>`
（**放 extension 目录是有意的**：宝塔不重写它，且它在 vhost 顶部被 include，
所以本文件里的正则 location 先于宝塔自带的「图片 30d / js+css 12h」生效）。

| 路径 | Cache-Control | 为什么 |
|---|---|---|
| `/_astro/*` | `public, max-age=31536000, immutable` | 文件名带内容哈希，新部署必然换名，永不会拿到旧的（顺带把封面 webp 从"完全没缓存"提到永久） |
| `/pagefind/*` | `no-cache` | 文件名稳定但内容每次构建都变，长缓存会让搜索索引错位 |
| `/gallery/**` 图片 | `public, max-age=604800` | 稳定名、偶尔换图，7 天折中 |
| 其余（所有 HTML 页 / `rss.xml` / `/api/*.json` / favicon） | `no-cache, must-revalidate` | **治的是真病**：原先 HTML 完全没有 `Cache-Control` → 浏览器启发式缓存，而每次部署旧哈希 chunk 就没了，客户端复用旧 HTML 就会 404 掉脚本，表现成"某些交互整体失效" |

三条要记住的：

1. **HTML 必须用兜底 `location /` 匹配，不能写 `location ~ \.html$`**——本站页面请求的 URI 是
   `/` 和 `/posts/xxx/`（走 `index` 指令找 index.html），按 `.html` 后缀匹配一条都命中不了。
2. **`/gallery/` 不能用 `location ^~ /gallery/`**——那会把 `/gallery/` 与 `/gallery/<id>/`
   这两个 HTML 页面一起吃进 7 天缓存，等于把本文件要修的病留下（我第一版就犯了这个，
   靠逐项打响应头的验收脚本才抓出来）。必须按图片扩展名匹配。
3. `no-cache` ≠ 每次都重下：实测带 `If-None-Match` 请求首页返回 **304**，只花几十字节。
   改完要 `nginx -t` 通过再 `nginx -s reload`，动 vhost 前先 `cp -a` 备份到 `<CONF_BACKUP_DIR>`。

> ⚠️ 服务器 `<WWW_ROOT>`（站点根那一层）下**还并存着其他项目的目录**。曾经发生过把博客路径认错的情况，
> 若推错目录会直接毁掉另一个项目。动手前务必确认当前路径是 `chenBlog/dist`，不要凭记忆。

### 标准部署流程（已验证可用）

> 下面写的是占位符；**展开后的可直接执行版本在 `reference-deploy-targets.md` 里**，抄那一份，别自己拼。

```bash
# ① 本地构建 + 打包
npm run build
tar -czf /tmp/chenblog_dist.tar.gz -C dist .

# ② 上传
scp /tmp/chenblog_dist.tar.gz <ECS_SSH>:/tmp/

# ③ 服务器：解压到临时目录 → 校验 → 原子替换
ssh <ECS_SSH> 'set -e
  cd <REPO_DIR>
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

> **这套流程是唯一已验证的部署方式，优先于任何部署类技能。**
> 已安装 `alibabacloud-ecs-code-deploy` 技能，但它走 aliyun appmanager、需要 AccessKey，
> 与现有宝塔 + Nginx 手工配置可能冲突。**没有明确理由不要用它替换上面的流程。**

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

⑤ **服务器仓库有未提交改动**：`package.json`、`package-lock.json` 常处于 modified 状态
   （历史 `npm install` 顺手改写出来的垃圾改动），`git pull` 会因此冲突。pull 前需先
   `git checkout --` 丢弃。宝塔生成的未跟踪文件 `.htaccess` `.user.ini` `404.html` `index.html` 无害，别删。

⑥ **线上版本极易滞后**：2026-09-20 发现线上 dist 构建于 2026-06-22，落后本地 16 个提交，
   其中 `bad5d80 修复评论问题`（Twikoo envId 误配 localhost）在服务器上躺了近三个月才上线。
   → **改完必须真的部署，并实际访问线上确认**，别只看到本地 build 通过就算完事。

⑦ **回滚备份的目录名被多套了一层引号 → shell glob 数不到它们，报「有多少个备份」会少算**（2026-10-14 某次部署脚本把变量又包了一层引号，`cp -a` 建出了**字面带引号 / 首尾带空格**的目录。10-18 只读实测：`./"dist_backup_20261014_124446"`、`./"dist_backup_20261014_124640"`、`./ dist_backup_20261014_124121 `，各 23M、合计 45M）。
   → **数回滚资产一律用 `find . -maxdepth 1 -type d -name "*dist_backup*"`，不要用 `ls -d dist_backup_*`**（同一台机器上实测：glob = 55、find = 58，差的正是那 3 个）；写备份命令时**只给最外层一次引号**：`cp -a dist "dist_backup_$(date +%Y%m%d_%H%M%S)"`，变量本身不要再套 `'` 或转义引号。
   ⚠️ 这 3 个目录**是真回滚副本，不擅自改名也不删**（删回滚资产属当次点头类）。要清理必须他明确说；动手前先 `find … | wc -l` 与 `du -csh` 留基线（10-18 基线：全部回滚资产合计 **1.4G**、磁盘 12G/40G 用 32%）。

> 依赖层面的坑（expressive-code peer 冲突、版本天花板、干净安装验证等）统一记在**第九节**，此处不重复。

### 面板与凭据

- 宝塔面板地址、端口、安全入口等**一律不写进本文件**（仓库公开）。需要时问用户，或查本地私密记录
  （仓库根的 `AGENTS.local.md` —— 里面同时有部署目标真实值与展开后的部署命令；
  凭据本身**哪份记录都不存**）。
- 面板为**自签名证书**，浏览器自动化会被 `ERR_CERT_AUTHORITY_INVALID` 拦住，
  且无头浏览器过不了自签证书；http 访问直接 `ERR_CONNECTION_RESET`
  → **面板不适合自动化，一律走 SSH。**
- **凭据纪律**：面板密码、SSH 私钥、任何 token **一律不得写入本文件或提交进 git**；
  也不要在对话里明文传递。改密码应由用户自己在面板 UI 操作，避免新密码再次落入会话记录。
- 勿运行 `bt 14` / `bt default`——会把面板密码明文打印出来。

### 铁律

> **改完就推送 + 部署，不用每次问。**（2026-10-07 用户明确改的规矩：
> 「你每次改完就同步部署和推送呀」——此前这里是"上线默认由用户本人执行、每次要新的授权"，
> 因为连续几轮都靠他一句「推送并部署上线吧」放行，他觉得每问一次是多余摩擦。）
>
> **前置条件一条不能省**：必须先跑完 `npm run build`（退出码 0）+ 该做的产物/浏览器核验，
> **拿到证据再上线**，并在交付时把验收结果报给他。验证不通过就不推不上线。
>
> ⚠️ **以下四类不在自动授权范围内，仍要当次点头**：
> ① 改服务器配置（Nginx / 宝塔 vhost / extension 缓存规则 / 重启服务）——这些会波及同机**其他项目**；
> ② 任何**强推**或重写已发布历史（`--force`、`filter-repo`、`reset --hard` 后推送）；
> ③ 删除回滚资产（`dist.old`、`dist_backup_*`、stash、备份目录）；
> ④ 动服务器上的 git 仓库或其他项目目录。
>
> 部署一律走本节上面的「标准部署流程」（本地 build → tar → scp → 解压 `dist.new` → 校验 → `chown` → 原子 `mv`），
> **动之前先只读确认目标路径是 `chenBlog/dist`**（同机并存其他项目，推错目录会毁掉另一个项目）。
