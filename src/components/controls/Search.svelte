<script>
	// 顶部搜索：Pagefind 全文检索。结构照 firefly.cuteleaf.cn 编译产物——
	// 桌面端是导航栏里一条「点一下变宽」的内联输入框（w-40 → focus:w-60），
	// 移动端是按钮点开浮层面板（面板里自带输入框）。结果浮层毛玻璃、直角，亮暗两套。
	// 索引由 npm run build 里的 pagefind 步骤产出到 dist/pagefind/，
	// 所以 dev 下没有索引可加载，要用 npm run preview 或线上验。
	import { onMount, tick } from "svelte";

	let query = $state("");
	let results = $state([]);
	let loading = $state(false);
	let devNotice = $state(false);
	let mobileOpen = $state(false);
	/** 防抖等待中（300ms 窗口）。放大镜的旋转要覆盖这一段，
	 *  否则用户打完字到出结果之间那 300ms 是"什么都没转"的静止期，
	 *  真正转起来的只有请求往返那几十毫秒，肉眼基本看不见。 */
	let pending = $state(false);
	/** @type {HTMLInputElement | null} */
	let desktopInput = $state(null);
	/** @type {HTMLInputElement | null} */
	let mobileInput = $state(null);

	let timer = null;
	let reqId = 0;
	/** @type {any} */
	let pf = null;

	const RESULT_LIMIT = 12;
	/** 平台快捷键前缀：macOS 显示 ⌘K，其余显示 Ctrl K */
	let modKey = $state("Ctrl");

	// 只要有关键词就显示结果层（桌面端），移动端由按钮控制。
	// 不依赖 focus 事件翻状态：焦点事件在某些环境（未聚焦的 iframe、iOS Safari）不触发，
	// 会出现"输入了但结果层永远不出"。
	const panelShown = $derived(mobileOpen || query.trim().length > 0);

	async function ensureIndex() {
		if (pf || devNotice) return pf;
		if (!import.meta.env.PROD) {
			// dev 下 /pagefind/ 不在 Astro 的静态目录里；给真提示，不像参考站那样塞假结果
			devNotice = true;
			return null;
		}
		try {
			// URL 必须是变量：写成字面量会被 Vite 在构建期当模块解析而直接失败
			// （/pagefind/pagefind.js 是 astro build 之后才生成的产物）
			const indexUrl = "/pagefind/pagefind.js";
			const mod = await import(indexUrl);
			await mod.options({ excerptLength: 26 });
			pf = mod;
			return mod;
		} catch {
			devNotice = true;
			return null;
		}
	}

	/** @param {string} q */
	async function runSearch(q) {
		if (!q) {
			results = [];
			loading = false;
			pending = false;
			return;
		}
		const mod = await ensureIndex();
		if (!mod) { pending = false; return; }
		const id = ++reqId;
		loading = true;
		try {
			const res = await mod.search(q);
			const data = await Promise.all(res.results.slice(0, RESULT_LIMIT).map(r => r.data()));
			if (id !== reqId) return;
			results = data;
		} catch {
			if (id === reqId) results = [];
		} finally {
			if (id === reqId) {
				loading = false;
				pending = false;
			}
		}
	}

	$effect(() => {
		const q = query.trim();
		clearTimeout(timer);
		// 打字当下就进"搜索中"：让放大镜从第一个字符开始转，覆盖防抖那 300ms
		pending = q.length > 0;
		timer = setTimeout(() => runSearch(q), 300);
		return () => clearTimeout(timer);
	});

	function openMobile() {
		mobileOpen = !mobileOpen;
		if (mobileOpen) {
			ensureIndex();
			// 等 Svelte 把面板渲染出来再聚焦；用 tick 而不是 rAF——后台标签页里 rAF 会被节流，
			// 结果就是面板开了但光标没进输入框
			tick().then(() => mobileInput?.focus());
		}
	}

	function closeAll() {
		mobileOpen = false;
		// 结果层由 query 驱动，所以关闭要清词（参考站 closeSearchPanel 同样清 keywordDesktop）
		query = "";
		results = [];
		loading = false;
		pending = false;
	}

	/**
	 * 快捷键唤起搜索：Ctrl+K / ⌘K。
	 * 输入框内按下时不抢（浏览器原生的"跳到地址栏"只在我们不 preventDefault 时生效），
	 * 但本站是全站顶栏入口，用户在正文里按也要能唤起，所以除了焦点确实在搜索框时都接管。
	 */
	/**
	 * 标题高亮：Pagefind 只给 excerpt 打 <mark>，标题（meta.title）是原样字符串。
	 * 这里按查询词切开后自己包 <mark>，样式与 excerpt 的命中词同一套（见 style 里的 .search-panel mark）。
	 * 转义只做一次、切分按字面量——别先拼 HTML 再 replace，否则标题里的 `&` `<` 会被当标签解析。
	 */
	function highlightTitle(title, q) {
		const text = String(title || "");
		const needle = String(q || "").trim();
		if (!needle) return escapeHtml(text);
		const lower = text.toLowerCase();
		const lowNeedle = needle.toLowerCase();
		let out = "";
		let i = 0;
		while (i < text.length) {
			const at = lower.indexOf(lowNeedle, i);
			if (at === -1) {
				out += escapeHtml(text.slice(i));
				break;
			}
			out += escapeHtml(text.slice(i, at));
			out += "<mark>" + escapeHtml(text.slice(at, at + needle.length)) + "</mark>";
			i = at + needle.length;
		}
		return out;
	}

	function escapeHtml(s) {
		return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
	}

	function focusSearch() {
		ensureIndex();
		mobileOpen = true;
		// tick 而不是 rAF：后台标签页 rAF 会被节流，面板开了光标却没进去
		tick().then(() => {
			const el = window.innerWidth >= 1024 ? desktopInput : mobileInput;
			(el || desktopInput || mobileInput)?.focus();
			// 已有内容时全选，方便直接覆盖重搜
			(el || desktopInput || mobileInput)?.select?.();
		});
	}

	/** @param {KeyboardEvent} e */
	function onKeydown(e) {
		if (e.key === "Escape") {
			e.preventDefault();
			closeAll();
			desktopInput?.blur();
			return;
		}
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			const links = Array.from(document.querySelectorAll("[data-search-result]"));
			if (!links.length) return;
			e.preventDefault();
			const i = links.indexOf(/** @type {any} */(document.activeElement));
			const next = e.key === "ArrowDown" ? (i + 1) % links.length : (i - 1 + links.length) % links.length;
			links[next].focus();
		}
	}

	onMount(() => {
		if (/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)) modKey = "⌘";

		const onDocClick = e => {
			if (!/** @type {any} */(e.target)?.closest?.("[data-search-root]")) closeAll();
		};
		// Ctrl+K / ⌘K：全站唤起。用 reinitOnce 语义——Header 在 Swup 容器外，
		// 搜索岛只在首屏挂一次，这个监听也就只该挂一次（onMount 已在岛内，天然只跑一次）。
		const onShortcut = e => {
			const k = (e.key || "").toLowerCase();
			if (k !== "k" || !(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
			e.preventDefault();
			focusSearch();
		};
		// 「/」快捷键的收口：KeyboardShortcuts.astro 不自己实现搜索，只派发这个事件。
		// 全站「打开并聚焦搜索」只有 focusSearch 一处实现，Ctrl+K 与 / 完全同行为
		// （含移动端开面板、已有内容全选）。Header 在 Swup 容器外，本监听天然只挂一次。
		const onFocusSearchEvent = () => focusSearch();
		document.addEventListener("keydown", onShortcut);
		document.addEventListener("blog:focus-search", onFocusSearchEvent);
		document.addEventListener("click", onDocClick);
		// Header 在 Swup 容器外不会被替换，切页后手动收一次
		document.addEventListener("swup:contentReplaced", closeAll);
		return () => {
			document.removeEventListener("keydown", onShortcut);
			document.removeEventListener("blog:focus-search", onFocusSearchEvent);
			document.removeEventListener("click", onDocClick);
			document.removeEventListener("swup:contentReplaced", closeAll);
		};
	});
</script>

<div class="relative flex items-center" data-search-root>
	<!-- 桌面：内联扩展输入框。图标 16px 与导航项图标（astro-icon 的 1em / 16px）同尺寸，
	     文字 16px 粗体与导航标签一致；放大镜靠 top-1/2 -translate-y-1/2 纵向居中。

	     🔴 2026-11-11「够不够炫酷」这批改的（改前它只有淡灰底 + 聚焦时底色加深，没有任何描边/光晕/动效）：
	     ① 聚焦：品牌色 1px 内描边 + 3px 外扩光晕 + 一层向下投影（三件套与 .post-card 的 hover 同一套 color-mix 配方）；
	     ② 底部扫描线：2px 渐变条从左侧 scaleX(0)→1 扫开，直角语言、不用圆角；
	     ③ 放大镜：静止 text-50，聚焦变品牌色并放大 8%；**搜索中整圈旋转**（替代干等）；
	     ④ Ctrl K 胶囊：聚焦后淡出并右移让位，不跟输入内容打架。
	     ⚠️ transition 全部写在本组件 <style> 里，**模板上不再挂 transition-colors** ——
	        Svelte 的 scoped 样式与 Tailwind 工具类同特异性，靠注入顺序决定胜负，太脆。 -->
	<div
		class="search-shell relative hidden lg:flex items-center h-10 mr-2 bg-black/4 hover:bg-black/6 focus-within:bg-black/6
		       dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10"
		class:is-searching={loading || pending}
	>
		<svg width="16" height="16" viewBox="1.4 1.1 13.8 13.8" fill="none" aria-hidden="true" class="search-icon pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-50">
			<path
				d="M7.667 12.667A5.333 5.333 0 1 0 7.667 2a5.333 5.333 0 0 0 0 10.667ZM14.334 14l-2.9-2.9"
				stroke="currentColor"
				stroke-width="1.2"
				stroke-linecap="round"
				stroke-linejoin="round"></path>
		</svg>
		<input
			bind:this={desktopInput}
			type="text"
			inputmode="search"
			placeholder="搜索"
			aria-label="站内搜索"
			aria-keyshortcuts="Control+K Meta+K"
			autocomplete="off"
			class="h-full w-40 border-0 bg-transparent pl-8 pr-14 text-base font-bold outline-none placeholder:text-30 focus:w-60 active:w-60"
			bind:value={query}
			onfocus={ensureIndex}
			onkeydown={onKeydown}
		/>
		<!-- 快捷键提示：输入框为空时显示，聚焦后淡出（不再和光标/输入内容抢同一块空间） -->
		{#if !query.trim()}
			<kbd
				class="search-kbd pointer-events-none absolute right-2.5 hidden items-center gap-0.5 text-[11px] font-medium leading-none text-30 lg:flex"
				aria-hidden="true"
			>
				<span class="rounded-sm border border-(--line-divider) bg-(--card-bg)/60 px-1 py-0.5">{modKey}</span>
				<span class="rounded-sm border border-(--line-divider) bg-(--card-bg)/60 px-1 py-0.5">K</span>
			</kbd>
		{/if}
	</div>

	<!-- 移动：按钮。外层容器才带 lg:hidden——按钮自己有 .btn-plain{display:flex}，
	     它在 abutton.css 里、加载顺序在 Tailwind 工具类之后，同特异性会盖掉按钮上的 lg:hidden -->
	<div class="flex items-center lg:hidden">
		<!-- aria-controls 只能在面板真的在 DOM 里时指过去（面板是条件渲染，
		     写死 "search-panel" 会留下悬空引用，45/45 页都被扫出来过） -->
		<button
			type="button"
			class="btn-plain h-10 w-10 items-center justify-center"
			aria-label="打开站内搜索"
			aria-expanded={mobileOpen}
			aria-controls={panelShown ? "search-panel" : undefined}
			onclick={openMobile}
		>
			<svg width="22" height="22" viewBox="1.4 1.1 13.8 13.8" fill="none" aria-hidden="true" class="shrink-0">
				<path
					d="M7.667 12.667A5.333 5.333 0 1 0 7.667 2a5.333 5.333 0 0 0 0 10.667ZM14.334 14l-2.9-2.9"
					stroke="currentColor"
					stroke-width="1.0"
					stroke-linecap="round"
					stroke-linejoin="round"></path>
			</svg>
		</button>
	</div>

	{#if panelShown}
		<div class="absolute top-full right-0 z-50 w-[min(92vw,30rem)] pt-2 lg:pt-3">
			<div
				id="search-panel"
				class="search-panel flex flex-col overflow-hidden"
				role="dialog"
				aria-label="站内搜索结果"
				onkeydown={onKeydown}
			>
				<!-- 移动端在面板里自带一条输入框（桌面端输入框已在导航栏里） -->
				<div class="relative flex items-center lg:hidden">
					<svg width="16" height="16" viewBox="1.4 1.1 13.8 13.8" fill="none" aria-hidden="true" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-50">
						<path
							d="M7.667 12.667A5.333 5.333 0 1 0 7.667 2a5.333 5.333 0 0 0 0 10.667ZM14.334 14l-2.9-2.9"
							stroke="currentColor"
							stroke-width="1.2"
							stroke-linecap="round"
							stroke-linejoin="round"></path>
					</svg>
					<input
						bind:this={mobileInput}
						type="text"
						inputmode="search"
						placeholder="搜索"
						aria-label="站内搜索"
						autocomplete="off"
						class="h-11 w-full border-0 bg-transparent px-3 pl-8 text-sm outline-none placeholder:text-30"
						bind:value={query}
					/>
				</div>

				<div class="max-h-[60vh] overflow-y-auto px-1.5 py-1.5">
					{#if devNotice}
						<p class="px-3 py-6 text-center text-sm text-30">
							{import.meta.env.DEV ? "开发模式下没有搜索索引，跑 npm run build && npm run preview 或看线上" : "搜索索引未就绪"}
						</p>
					{:else if loading}
						<p class="px-3 py-6 text-center text-sm text-30">搜索中…</p>
					{:else if !query.trim()}
						<p class="px-3 py-6 text-center text-sm text-30">
							输入关键词开始搜索，↑↓ 选择、Esc 关闭
							<span class="mt-1 block text-xs text-30/80">快捷键 {modKey}+K 随时唤起</span>
						</p>
					{:else if !results.length}
						<p class="px-3 py-6 text-center text-sm text-30">没有找到「{query.trim()}」相关内容</p>
					{:else}
						<ul class="flex flex-col">
							{#each results as r}
								<li>
									<a
										href={r.url}
										data-search-result
										class="group flex flex-col gap-0.5 px-3 py-2.5 transition-colors hover:bg-(--btn-plain-bg-hover) focus:bg-(--btn-plain-bg-hover)"
										onclick={closeAll}
									>
										<span class="truncate text-sm font-bold text-90 group-hover:text-(--primary)">
											{@html highlightTitle(r.meta?.title || r.url, query)}
										</span>
										{#if r.sub_result?.length}
											<span class="line-clamp-2 text-xs leading-relaxed text-30">
												{#each r.sub_result as sub}{@html sub.excerpt || ""}{" "}{/each}
											</span>
										{:else if r.excerpt}
											<span class="line-clamp-2 text-xs leading-relaxed text-30">{@html r.excerpt}</span>
										{/if}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* ══ 桌面搜索框（2026-11-11 重做交互观感）══════════════════════════════════
	   改前：只有淡灰底，聚焦时底色加深一档 —— 全站唯一「点了没反馈」的输入控件。
	   改后四件套：品牌色描边 + 外扩光晕 + 底部扫描线 + 放大镜转圈。
	   设计语言对齐全站：**直角**（本站面板一律无圆角）、缓动 cubic-bezier(0.4,0,0.2,1)、
	   颜色一律 color-mix(in oklch, var(--primary) …) 跟随主题色相。 */

	.search-shell {
		/* 只过渡这三条：背景色 + 描边 + 阴影。
		   ⚠️ 这里**不能**写 transition-all —— 壳子的宽度是被输入框撑出来的，
		      自己再过渡一遍 width 就会和输入框的过渡叠成"二次动画"。 */
		transition:
			background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
			border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.24s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid transparent;
		/* 壳子宽度由内容撑开，但**要让它在输入框改宽度时跟着平滑伸缩**：
		   给壳子也加一条 width 过渡是无效的（它的 width 不是显式值，是 auto），
		   所以真正的做法见下面的 input —— 壳子会逐帧跟随。 */
	}

	/* 🔴 聚焦展宽动画（2026-11-11 修复回归）。
	   改造前模板上有 `transition-all duration-200`；我为了"把过渡集中到 <style>"
	   把它删了，结果连该有的 width 过渡也一起删掉 → 实测聚焦瞬间从 160 跳到 240，
	   400ms 内**只出现过 1 个宽度值**、`getAnimations()` 为空。
	   现在只过渡 width 一个属性：既恢复动画，又不会像 transition-all 那样把
	   背景/描边也拉进来（那两条在外层壳子上已有各自的时长）。
	   ⚠️ 时长/缓动对齐全站：0.28s + cubic-bezier(0.4, 0, 0.2, 1)。
	   ⚠️ 只对桌面内联框生效（移动端面板里的输入框是 w-full，不需要这条）。 */
	.search-shell input {
		transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* 减少动态效果：宽度直切（不做展宽动画，但功能不受影响） */
	@media (prefers-reduced-motion: reduce) {
		.search-shell input {
			transition: none;
		}
	}

	/* 底部扫描线：伪元素放渐变条，聚焦时 scaleX 0→1。
	   用 transform 而不是 width —— 前者走合成器、不触发重排（同卡片流光那条口径）。 */
	.search-shell::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		transform: scaleX(0);
		transform-origin: left center;
		background: linear-gradient(
			90deg,
			color-mix(in oklch, var(--primary) 0%, transparent) 0%,
			var(--primary) 45%,
			color-mix(in oklch, var(--primary) 60%, transparent) 100%
		);
		transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
	}
	.search-shell:focus-within::after {
		transform: scaleX(1);
	}

	.search-shell:focus-within {
		border-color: color-mix(in oklch, var(--primary) 55%, transparent);
		box-shadow:
			0 0 0 3px color-mix(in oklch, var(--primary) 14%, transparent),
			0 6px 18px -8px color-mix(in oklch, var(--primary) 38%, transparent);
	}

	/* 放大镜：聚焦变品牌色并微放大；搜索中整圈旋转（loading 时 class:is-searching 挂到外层） */
	.search-icon {
		transition:
			color 0.2s ease,
			scale 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.search-shell:focus-within .search-icon {
		color: var(--primary);
		scale: 1.08;
	}
	@keyframes search-icon-spin {
		to {
			rotate: 360deg;
		}
	}
	.search-shell.is-searching .search-icon {
		color: var(--primary);
		animation: search-icon-spin 0.9s linear infinite;
	}

	/* Ctrl K 胶囊：聚焦后淡出右移让位（仍在 DOM 里，只是不可见，不影响读屏） */
	.search-kbd {
		transition:
			opacity 0.18s ease,
			translate 0.18s ease;
	}
	.search-shell:focus-within .search-kbd {
		opacity: 0;
		translate: 6px 0;
	}

	/* 减少动态效果：停掉旋转与位移，只保留颜色/描边这些**静态**反馈
	   （与全站口径一致：装饰性运动可关，颜色反馈保留） */
	@media (prefers-reduced-motion: reduce) {
		.search-shell,
		.search-shell::after,
		.search-icon,
		.search-kbd {
			transition: none;
		}
		.search-shell:focus-within::after {
			transform: scaleX(1);
		}
		.search-shell.is-searching .search-icon {
			animation: none;
		}
		.search-shell:focus-within .search-kbd {
			translate: none;
		}
	}

	/* 毛玻璃浮层：数值取自参考站编译产物（blur 20 + saturate 1.5、亮 #ffffff8c / 暗 #17171799、
	   1px 边框、顶部 1px 内高光）。它的圆角走 --radius-large，我们没这个变量，本站一律直角。 */
	.search-panel {
		background-color: #ffffff8c;
		border: 1px solid #0000000f;
		-webkit-backdrop-filter: blur(20px) saturate(1.5);
		backdrop-filter: blur(20px) saturate(1.5);
		box-shadow:
			0 20px 25px -5px rgb(0 0 0 / 0.1),
			0 8px 10px -6px rgb(0 0 0 / 0.1),
			inset 0 1px 0 #ffffff2e;
	}

	:global(html[data-theme="dark"]) .search-panel {
		background-color: #17171799;
		border-color: #ffffff1a;
		box-shadow:
			0 20px 25px -5px rgb(0 0 0 / 0.35),
			inset 0 1px 0 #ffffff0f;
	}

	/* Pagefind 的命中词用 <mark> 返回，默认黄底太脏，改成品牌色加粗 */
	:global(.search-panel mark) {
		background: none;
		color: var(--primary);
		font-weight: 700;
	}

	/* 标题里的命中词：加一层浅品牌底，与正文摘录的纯色高亮区分开（标题更重、摘要更轻） */
	:global(.search-panel mark) {
		background-color: color-mix(in oklch, var(--primary) 12%, transparent);
		border-radius: 2px;
		padding: 0 1px;
	}
</style>
