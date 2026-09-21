# HANDOFF — 会话交接

> **分工**：`AGENTS.md` 存长期不变的规则与事实；本文件存**会变的状态**和**下一步该做什么**。
> 本文件不重复 AGENTS.md 的内容，只引用。每次会话结束前必须更新本文件。
>
> 最后更新：**2026-09-22 凌晨，会话结束**

---

## 一、下次会话第一件事

### 🔴 用户指定：全局代码优化

用户 2026-09-21 明确指定下次做这个。**尚未开始，没有任何前置调研。**

已知的可优化点（按我判断的收益排序，动手前需自行核实）：

1. **零工程化基建**：`package.json` 里没有任何 lint / test / typecheck 脚本，没有 CI。
   项目有 `typescript` 和 `prettier` 却都没接进脚本。这是"全局优化"最该先补的底座。
2. **死链/坏图检查脚本**（我提过、用户未表态）：扫 `dist/` 里所有 `<img src>` 与 `href`，
   本地文件验存在、远程 URL 发 HEAD。能永久杜绝 `./heart.svg` 那类线上裂图。
3. **`deploy.sh`**（我提过、用户未表态）：把 AGENTS.md 第六节那套已验证的
   build → tar → scp → 解压 dist.new → `mv` 原子替换包成一条命令。
4. **`src/plugins/` 下 8 个自研插件**：从未审过代码质量，可能有重复逻辑或缺错误处理。
5. **`src/components/` 结构**：`Cover.astro`、`ImageWrapper.astro`、`CoverImage.astro` 三者
   与 `logo.png` 的引入方式冲突（构建时那条 `INEFFECTIVE_DYNAMIC_IMPORT` 警告的根因），值得理顺。
6. **`src/content/posts/images/`** 是空目录，历史遗留，可删。

⚠️ **别顺手做的事**：不要跑 `prettier --write`。全站格式与 `.prettierrc.json` 不符
（配置缺 `useTabs: true` 而源码用制表符），一跑就是海量无意义 diff。原因见 AGENTS.md 第五节。

### 🟠 两件悬着的事，需要用户点头

1. **本地领先远端 3 个提交未推送**：`6444502`、`bb46ee9`、`b34b9ed`。
   按 AGENTS.md 第七节铁律「推送前先问」，我没自作主张。**下次开工先问要不要推。**
2. **线上仍是依赖升级前的版本**。本地已升到 astro 7.3.3 并通过干净安装验证，
   但**没有部署**。线上跑的还是 2026-09-20 那次部署的产物（246 个文件）。
   → 要上线就走 AGENTS.md 第六节流程；上线前记得服务器已有回滚资产，别重复备份堆满磁盘。

### 🟡 AGENTS.md 第九节的存量待办

- 3 个文章方向等用户拍板（URL 用不用中文 / 要不要配封面 / 要不要文章脚手架）
- 2 处 `./heart.svg` 线上 404（真 bug）
- 代码块语言徽章与行号**从未渲染过**（既存缺陷，非升级引入，已留怀疑方向）
- 宝塔面板密码曾在对话中明文出现过，用户选择暂不改；面板 IP 白名单未开

---

## 二、本次会话（2026-09-20 → 09-21）做了什么

跨了两个自然日，主线是**从"接手陌生项目"到"完成一次全量依赖升级"**。

### 已上线的部分（2026-09-20）

把落后 **16 个提交**、线上停留近三个月的博客推上了线：

- 定位到线上真正的部署目标是 `/www/wwwroot/chenBlog/dist`
  （用户最初给的 `testplantAI` 路径是**另一个项目**，差点覆盖掉它）
- 修了 Astro 7 的构建失败：`src/pages/[...page].astro` 里一个空的 `<script></script>`
- 上线内容含 3 篇新文章、Astro 6→7 升级、以及躺了三个月的
  `bad5d80 修复评论问题`（Twikoo envId 误配 localhost）
- 部署方式**从"服务器 git pull + build"改为"本地构建 + 上传 dist + 原子替换"**，
  这是用户主动提出的，理由是绕开服务器上的依赖地狱。已固化进 AGENTS.md 第六节。

### 未上线的部分（2026-09-21）

全量依赖升级，**只在本地，已提交未推送、未部署**：

- 5 个 major：`@astrojs/mdx` 8.0.1、`markdown-it` 15.0.2、
  `expressive-code-language-badge` 2.0.0、`expressive-code-collapsible` 1.0.0、
  `prettier-plugin-astro` 1.0.1
- `npm audit` 从 **21 个漏洞（2 critical / 13 high）降到 0**
- 偿还了 expressive-code 与 Astro 7 的 peer 冲突技术债
- 撞出 2 个**版本天花板**：mermaid 停 11.17.2、typescript 停 6.0.3（上游集成包 peer 未跟上）
- 顺手修了 2 个真 bug，详见下节

### 文档体系（2026-09-21 建立）

本次会话末尾确立了两层文档分工，**下次会话务必遵守**：

- `QODER.md` **已用 `git mv` 改名为 `AGENTS.md`**（保留历史）。原因：用户可能用 Codex 延续工作，
  而 `AGENTS.md` 是跨工具通用约定，Codex 与 Qoder 都读，一份文件两边用。
- 新增 `HANDOFF.md`（本文件）存**易变状态与下一步**；`AGENTS.md` 存**长期规则与事实**。
  两者只交叉引用、不互相复述。`AGENTS.md` 顶部已加指引「开始工作前先读 HANDOFF.md」。
- 用户级记忆同步更新：`persist-conventions-in-qoder-md.md` → `persist-conventions-in-agents-md.md`，
  `session-wrapup-ritual.md` 的收尾清单已加入「更新 HANDOFF.md」这一核心步骤。
- 引用点全部改完并验证无断链（项目内 15 处、记忆 7 处）。

### 本次挖出的 2 个真 bug（都已修）

1. **`@astrojs/markdown-remark` 从未被显式声明**，而 `astro.config.mjs:12` 直接 import 它。
   它只靠 peer 自动安装这种易变机制存在，依赖树一变就被 npm 当 extraneous 剪掉，
   导致整个 Astro 配置加载失败、连 dev 都起不来。已钉为 `^7.3.1`。
2. **`package.json` 的 `allowScripts` 钉的是精确版本**，升级后失配
   （写 `esbuild@0.28.1`/`sharp@0.34.5`，实际是 `0.28.2`/`0.35.4`），
   npm 因此**静默跳过它们的 postinstall**。本地因旧二进制还在而构建照过，全新克隆必崩。已同步修正。

### 我犯的一个错（记下来避免重犯）

第4批安装时出现 `npm warn ERESOLVE overriding peer dependency`，我判断成"瞬时警告"放过了。
**判断错了**——那是 npm 在强行覆盖 typescript 7 的 peer 冲突。增量安装能过、构建也能过，
直到干净 `npm ci` 才炸，而当时 `node_modules` 已被我删掉，项目一度无法构建。

→ 教训已写进 AGENTS.md 第九节：**改完依赖必须 `rm -rf node_modules && npm ci` 走一遍。**

---

## 三、当前状态快照（2026-09-22 凌晨会话结束时实测）

| 项 | 状态 |
|---|---|
| 本地 HEAD | 本次收尾提交（其前一个是 `b34b9ed`），工作区干净 |
| 与远端 | **ahead 4**：`6444502`、`bb46ee9`、`b34b9ed` + 本次收尾提交，**全部未推送** |
| 回滚标签 | `pre-dep-upgrade-20260921`（依赖升级前检查点） |
| 文档入口 | `QODER.md` 已 `git mv` 改名为 **`AGENTS.md`**；新增 **`HANDOFF.md`**（本文件） |
| 本地构建 | 退出码 0，37 页，dist **260** 个文件 / 26M |
| `npm audit` | **0 vulnerabilities** |
| 干净安装 | `rm -rf node_modules && npm ci` 通过，esbuild/sharp 的 postinstall 实证执行 |
| 线上站点 | HTTP 200 正常，但仍是**升级前**的产物（246 个文件） |
| 服务器回滚资产 | `dist.old` + `dist_backup_20260920_234618`（各 26M，**按铁律保留**） |
| dev server | 已停止（顺带清掉一个 `TaskStop` 没杀干净的孤儿进程 PID 21964） |
| 临时文件 | 本地与服务器 `/tmp` 本会话产物已清空 |

---

## 四、本次会话新装的能力

| 能力 | 类型 | 状态 |
|---|---|---|
| `website-seo` | Skill（官方市场） | 可用，无需认证 |
| `dependency-vulnerability-triage` | Skill（官方市场） | 可用，本次升级实际用过 |
| `alibabacloud-ecs-code-deploy` | Skill（官方市场） | 可用但**需 AccessKey**；AGENTS.md 第六节已注明**不要用替换现有部署流程** |
| `superpowers:*` 全套 | Skill | 会话末尾出现，`verification-before-completion` 已用过并拦下 2 处文档错误 |
| `context7` | MCP | 查库文档用，尚未使用 |
| `Presentations:pptx` | Skill + MCP | 与本项目无关 |

装失败的 2 个（别重试）：
- `winsorllc/upgraded-carnival@ssh-tool`（skills.sh）— 源仓库 502，拉不下来
- `dependency-checker`（官方市场）— `EXTENSION_SKILL_NAME_MISSING`，服务端元数据缺陷

**两个源都不存在 Astro 框架专用能力**（市场搜 "astro" 全是天文学 Astropy 与占星术，
skills.sh 全是 Airflow 的 astronomer）。这块只能靠 AGENTS.md 或用 `skill-creator` 自造。

---

## 五、维护本文件的规矩

1. **每次会话结束前更新**：改「最后更新」日期、刷新第三节状态快照、
   把本次做的事并进第二节（旧内容可压缩，别无限堆积）、更新第一节的下一步。
2. **不复述 AGENTS.md**：规则、部署流程、版本天花板、依赖坑位都在那边，这里只写"现在什么状态、接下来干什么"。
3. **同样受凭据纪律约束**：面板端口、密码、token、私钥一律不写。仓库是公开的。
4. 第一节永远放**下次该做什么**，让新会话打开文件第一眼就知道从哪接手。
