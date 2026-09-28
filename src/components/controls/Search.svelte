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
	let desktopFocused = $state(false);
	/** @type {HTMLInputElement | null} */
	let desktopInput = $state(null);
	/** @type {HTMLInputElement | null} */
	let mobileInput = $state(null);

	let timer = null;
	let reqId = 0;
	/** @type {any} */
	let pf = null;

	const RESULT_LIMIT = 12;

	// 桌面：有焦点或有词就出结果层；移动：点按钮才出
	const panelShown = $derived(mobileOpen || (desktopFocused && query.trim().length > 0));

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

	async function runSearch() {
		const q = query.trim();
		if (!q) {
			results = [];
			loading = false;
			return;
		}
		const mod = await ensureIndex();
		if (!mod) return;
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
			if (id === reqId) loading = false;
		}
	}

	$effect(() => {
		query;
		clearTimeout(timer);
		timer = setTimeout(runSearch, 300);
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
		desktopFocused = false;
		loading = false;
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
		const onDocClick = e => {
			if (!/** @type {any} */(e.target)?.closest?.("[data-search-root]")) closeAll();
		};
		document.addEventListener("click", onDocClick);
		// Header 在 Swup 容器外不会被替换，切页后手动收一次
		document.addEventListener("swup:contentReplaced", closeAll);
		return () => {
			document.removeEventListener("click", onDocClick);
			document.removeEventListener("swup:contentReplaced", closeAll);
		};
	});
</script>

<div class="relative flex items-center" data-search-root>
	<!-- 桌面：内联扩展输入框。图标 16px 与导航项图标（astro-icon 的 1em / 16px）同尺寸，
	     文字 16px 粗体与导航标签一致；放大镜靠 top-1/2 -translate-y-1/2 纵向居中 -->
	<div
		class="relative hidden lg:flex items-center h-10 mr-2 bg-black/4 transition-colors hover:bg-black/6 focus-within:bg-black/6
		       dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10"
	>
		<svg width="16" height="16" viewBox="1.4 1.1 13.8 13.8" fill="none" aria-hidden="true" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-50">
			<path
				d="M7.667 12.667A5.333 5.333 0 1 0 7.667 2a5.333 5.333 0 0 0 0 10.667ZM14.334 14l-2.9-2.9"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"></path>
		</svg>
		<input
			bind:this={desktopInput}
			type="search"
			placeholder="搜索"
			aria-label="站内搜索"
			autocomplete="off"
			class="h-full w-40 border-0 bg-transparent pl-8 text-base font-bold outline-none transition-all duration-200
			       placeholder:text-30 focus:w-60 active:w-60"
			bind:value={query}
			onfocus={() => {
				desktopFocused = true;
				ensureIndex();
			}}
			onblur={() => setTimeout(() => (desktopFocused = false), 120)}
			onkeydown={onKeydown}
		/>
	</div>

	<!-- 移动：按钮。外层容器才带 lg:hidden——按钮自己有 .btn-plain{display:flex}，
	     它在 abutton.css 里、加载顺序在 Tailwind 工具类之后，同特异性会盖掉按钮上的 lg:hidden -->
	<div class="flex items-center lg:hidden">
		<button
			type="button"
			class="btn-plain h-10 w-10 items-center justify-center"
			aria-expanded={mobileOpen}
			aria-controls="search-panel"
			onclick={openMobile}
		>
			<svg width="24" height="24" viewBox="1.4 1.1 13.8 13.8" fill="none" aria-hidden="true" class="shrink-0">
				<path
					d="M7.667 12.667A5.333 5.333 0 1 0 7.667 2a5.333 5.333 0 0 0 0 10.667ZM14.334 14l-2.9-2.9"
					stroke="currentColor"
					stroke-width="1.6"
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
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"></path>
					</svg>
					<input
						bind:this={mobileInput}
						type="search"
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
						<p class="px-3 py-6 text-center text-sm text-30">输入关键词开始搜索，↑↓ 选择、Esc 关闭</p>
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
											{r.meta?.title || r.url}
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

	:global(.search-panel input::-webkit-search-cancel-button) {
		display: none;
	}
</style>
