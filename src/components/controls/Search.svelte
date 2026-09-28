<script>
	// 顶部搜索：Pagefind 全文检索，面板毛玻璃（亮/暗两套）。
	// 索引由 `npm run build` 里的 pagefind 步骤产出到 dist/pagefind/，
	// 所以 dev 模式下没有索引可加载（见下方 devNotice），要用 `npm run preview` 或线上验。
	import { onMount } from "svelte";

	let open = $state(false);
	let query = $state("");
	let results = $state([]);
	let loading = $state(false);
	let devNotice = $state(false);
	let input = $state(null);
	let timer = null;
	let reqId = 0;
	/** @type {any} */
	let pf = null;

	const EXCERPT_LIMIT = 12;

	async function ensureIndex() {
		if (pf || devNotice) return pf;
		if (!import.meta.env.PROD) {
			// dev 下 /pagefind/ 不在 Astro 的静态目录里，直接给提示而不是塞假结果
			devNotice = true;
			return null;
		}
		try {
			// 必须走变量：直接写字符串字面量会被 Vite 在构建期当模块解析，
			// 而 /pagefind/ 是 astro build 之后才生成的产物（@vite-ignore 注释在 Svelte 编译后会丢）
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
			const data = await Promise.all(res.results.slice(0, EXCERPT_LIMIT).map(r => r.data()));
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

	function toggle() {
		open = !open;
		if (open) {
			ensureIndex();
			requestAnimationFrame(() => input?.focus());
		}
	}

	function close() {
		open = false;
		loading = false;
	}

	/** @param {KeyboardEvent} e */
	function onKeydown(e) {
		if (e.key === "Escape") {
			e.preventDefault();
			close();
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

	/** @param {MouseEvent} e */
	function onResultClick(e) {
		if (/** @type {any} */(e.target)?.closest?.("a")) close();
	}

	onMount(() => {
		const onDocClick = e => {
			if (!/** @type {any} */(e.target)?.closest?.("[data-search-root]")) close();
		};
		document.addEventListener("click", onDocClick);
		// Header 在 Swup 容器外，切页不会重建它；但整页跳转回来要重置状态，这里只挂一次
		document.addEventListener("swup:contentReplaced", close);
		return () => {
			document.removeEventListener("click", onDocClick);
			document.removeEventListener("swup:contentReplaced", close);
		};
	});

	function strip(html) {
		return html
			.replace(/<mark[^>]*>/g, "")
			.replace(/<\/mark>/g, "")
			.replace(/\s+/g, " ")
			.trim();
	}
</script>

<div class="relative" data-search-root>
	<button type="button" class="btn-plain h-10 px-3" aria-expanded={open} aria-controls="search-panel" onclick={toggle}>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M7.667 12.667A5.333 5.333 0 1 0 7.667 2a5.333 5.333 0 0 0 0 10.667ZM14.334 14l-2.9-2.9"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"></path>
		</svg>
		<span class="pl-1 hidden xl:inline">搜索</span>
	</button>

	{#if open}
		<div class="absolute top-full right-0 z-50 w-[min(92vw,30rem)] pt-2">
			<div
				id="search-panel"
				class="search-panel flex flex-col overflow-hidden"
				role="dialog"
				aria-label="站内搜索"
				onclick={onResultClick}
				onkeydown={onKeydown}
			>
				<div class="flex items-center gap-2 border-b border-(--line-divider) px-3 py-2">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="shrink-0 text-(--primary)">
						<path
							d="M7.667 12.667A5.333 5.333 0 1 0 7.667 2a5.333 5.333 0 0 0 0 10.667ZM14.334 14l-2.9-2.9"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"></path>
					</svg>
					<!-- svelte-ignore a11y_no_autofocus -->
					<input
						bind:this={input}
						type="search"
						placeholder="搜索文章标题与正文…"
						aria-label="搜索关键词"
						autocomplete="off"
						class="w-full bg-transparent text-sm outline-none placeholder:text-30"
						bind:value={query}
					/>
					{#if query}
						<button type="button" class="text-30 px-1 hover:text-(--primary)" aria-label="清空" onclick={() => (query = "")}>
							✕
						</button>
					{/if}
				</div>

				<div class="max-h-[60vh] overflow-y-auto px-1.5 py-1.5">
					{#if devNotice}
						<p class="px-3 py-6 text-center text-sm text-30">
							{import.meta.env.DEV ? "开发模式下没有搜索索引，跑 npm run build && npm run preview 或看线上" : "搜索索引未就绪"}
						</p>
					{:else if loading}
						<p class="px-3 py-6 text-center text-sm text-30">搜索中…</p>
					{:else if query && !results.length}
						<p class="px-3 py-6 text-center text-sm text-30">没有找到「{query.trim()}」相关内容</p>
					{:else if !query}
						<p class="px-3 py-6 text-center text-sm text-30">输入关键词开始搜索，↑↓ 选择、Esc 关闭</p>
					{:else}
						<ul class="flex flex-col">
							{#each results as r, i}
								<li>
									<a
										href={r.url}
										data-search-result
										class="group flex flex-col gap-0.5 rounded-none px-3 py-2.5 transition-colors hover:bg-(--btn-plain-bg-hover) focus:bg-(--btn-plain-bg-hover)"
									>
										<span class="truncate text-sm font-bold text-90 group-hover:text-(--primary)">
											{r.meta?.title || strip(r.sub_result?.[0]?.title || "") || r.url}
										</span>
										{#if r.sub_result?.length}
											<span class="line-clamp-2 text-xs leading-relaxed text-30">
												{#each r.sub_result as sub}
													{@html sub.excerpt || strip(sub.title)}{" "}
												{/each}
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
	   顶部 1px 内高光）。本站面板一律直角，所以这里不写 border-radius。 */
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
