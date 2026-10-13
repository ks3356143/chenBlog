<script>
	// 动态（说说）列表。条目骨架由 DynamicItemTemplate.astro 以 <template> 输出，
	// 这里只负责取数据、搜索 / 年份筛选 / 分页、克隆模板填占位——这样条目能用 astro-icon
	// 与构建期图片优化，不必把 HTML 拼进 JS（做法照 firefly.cuteleaf.cn 的 /dynamic/）。
	//
	// 交互三项全部照参考站的编译产物实现：搜索 input 即滤（大小写不敏感）、年份 change 即滤、
	// 过滤后重置回第 1 页并重算总页数。条目 id 用 `dynamic-<id>` 并写进 URL hash，可直接深链。
	import { onMount } from "svelte";
	import { formatDateTimeToYYYYMMDDHHmm } from "@/utils/date-utils";

	let {
		source = "/api/dynamic.json",
		itemsPerPage = 10,
		timezone = undefined,
		searchPlaceholder = "搜索动态...",
		allYearsText = "全部年份",
		emptyText = "还没有动态",
		noResultsText = "没有找到匹配的动态",
	} = $props();

	/** @type {any[]} */
	let items = $state([]);
	let page = $state(1);
	/** @type {"loading" | "ready" | "error"} */
	let status = $state("loading");
	/** @type {HTMLElement | null} */
	let list = $state(null);
	let keyword = $state("");
	let year = $state("all");
	let yearOpen = $state(false);
	/** @type {HTMLElement | null} */
	let yearBox = $state(null);
	/** @type {HTMLButtonElement | null} */
	let yearTrigger = $state(null);

	/** @type {string[]} */
	const years = $derived.by(() => {
		const set = new Set(
			items.map((it) => String(new Date(it.published).getUTCFullYear())),
		);
		return [...set].sort((a, b) => Number(b) - Number(a));
	});
	/** @type {string[]} */
	const yearOptions = $derived(["all", ...years]);

	const filtered = $derived.by(() => {
		const kw = keyword.toLocaleLowerCase().trim();
		return items.filter(
			(it) =>
				(year === "all" || String(new Date(it.published).getUTCFullYear()) === year) &&
				(!kw || String(it.searchText ?? "").toLocaleLowerCase().includes(kw)),
		);
	});

	const visible = $derived(filtered.slice(0, page * itemsPerPage));
	const remaining = $derived(filtered.length - visible.length);
	const isFiltering = $derived(keyword.trim() !== "" || year !== "all");

	onMount(() => {
		fetch(source)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.json();
			})
			.then((data) => {
				items = Array.isArray(data) ? data : [];
				status = "ready";
			})
			.catch(() => {
				status = "error";
			});
	});

	// 搜索 / 年份一变就回第 1 页（参考站同款：否则筛完还停在已越界的页码上，列表会空一块）
	$effect(() => {
		void keyword;
		void year;
		page = 1;
	});

	// ---- 年份下拉（自定义，替代原生 <select>：OS 画的展开列表改不了样式与动画）----
	// 交互与全站下拉同族（headers/DropdownMenu.astro）：aria-expanded 驱动开合，
	// CSS 走 opacity + translate + visibility 过渡；箭头展开转 180°。
	/** @param {string} v */
	function setYear(v) {
		year = v;
		yearOpen = false;
		yearTrigger?.focus();
	}

	/** @param {MouseEvent} e */
	function onWindowClick(e) {
		if (yearOpen && yearBox && !yearBox.contains(/** @type {Node} */ (e.target))) yearOpen = false;
	}

	/** @param {KeyboardEvent} e */
	function onTriggerKeydown(e) {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			yearOpen = true;
		} else if (e.key === "Escape") {
			yearOpen = false;
		}
	}

	/** @param {KeyboardEvent} e */
	function onItemKeydown(e) {
		const opts = yearBox ? [...yearBox.querySelectorAll(".dynamic-year-item")] : [];
		const idx = opts.indexOf(/** @type {Element} */ (e.currentTarget));
		if (e.key === "ArrowDown") {
			e.preventDefault();
			opts[(idx + 1) % opts.length]?.focus();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			opts[(idx - 1 + opts.length) % opts.length]?.focus();
		} else if (e.key === "Escape") {
			e.preventDefault();
			yearOpen = false;
			yearTrigger?.focus();
		}
	}

	// 容器与状态块分开：命令式塞进去的节点不能和 Svelte 的 if 块共用父元素，
	// 否则 Svelte 更新时会去删它不认识的孩子。
	$effect(() => {
		if (!list || status !== "ready") return;
		const tpl = document.querySelector("[data-dynamic-item-template]");
		if (!tpl) return;
		list.textContent = "";
		for (const item of visible) list.append(renderItem(tpl, item));
		syncHash();
	});

	/**
	 * @param {{ content: DocumentFragment }} tpl
	 * @param {{ published: number, html: string, pinned: boolean, location: string }} item
	 */
	function renderItem(tpl, item) {
		const frag = tpl.content.cloneNode(true);
		const q = (/** @type {string} */ sel) => frag.querySelector(sel);
		const date = new Date(item.published);

		// 条目 id + data-year：深链要指得到，年份筛选要读得到
		const entry = q("[data-dynamic-entry]");
		if (entry) {
			entry.id = `dynamic-${String(item.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
			entry.dataset.year = String(date.getUTCFullYear());
		}

		const time = q("[data-dynamic-time]");
		if (time) {
			time.dateTime = date.toISOString();
			time.textContent = formatDateTimeToYYYYMMDDHHmm(date, "time", timezone);
		}

		const loc = q("[data-dynamic-location]");
		if (loc) {
			loc.hidden = !item.location;
			const text = q("[data-dynamic-location-text]");
			if (text) text.textContent = item.location || "";
		}

		const pinned = q("[data-dynamic-pinned]");
		if (pinned) pinned.hidden = !item.pinned;

		const content = q("[data-dynamic-content]");
		// html 来自构建期对本地 md 的渲染结果，不是用户输入
		if (content) {
			content.innerHTML = item.html;
			collectGallery(frag, content);
		}

		return frag;
	}

	/**
	 * 把条目正文里的 <img> 搬进画廊容器（照 firefly.cuteleaf.cn 的 /dynamic/）：
	 * 正文里只留一个可点的缩略图，点它弹 Fancybox 大图。零图时整块画廊保持 hidden。
	 * @param {DocumentFragment} frag
	 * @param {HTMLElement} content
	 */
	function collectGallery(frag, content) {
		const gallery = /** @type {HTMLElement | null} */ (frag.querySelector("[data-dynamic-gallery]"));
		const grid = gallery?.querySelector("[data-gallery-grid]");
		if (!gallery || !grid) return;

		const imgs = [...content.querySelectorAll("img")];
		if (imgs.length === 0) return;

		gallery.hidden = false;
		// 动态正文的图是站点自己的静态图，不是用户上传；同组命名让 Fancybox 能整组翻页
		const group = `dynamic-${Math.random().toString(36).slice(2, 9)}`;
		imgs.forEach((img, i) => {
			const src = img.getAttribute("src") || "";
			const alt = img.getAttribute("alt") || "";
			// 只搬前 6 张进网格（参考站同款上限），其余直接从正文移除，
			// 否则长图集会把条目撑爆、且它们仍会被 FancyboxManager 的 .custom-markdown img 绑定接走
			if (i >= 6) {
				img.remove();
				return;
			}
			const wrap = document.createElement("figure");
			wrap.className = "dynamic-gallery-item";
			const a = document.createElement("a");
			a.href = src;
			a.setAttribute("data-fancybox", group);
			a.setAttribute("data-type", "image");
			a.setAttribute("data-caption", alt);
			a.title = alt ? `查看图片：${alt}` : "查看图片";
			const thumb = img.cloneNode(true);
			thumb.loading = "lazy";
			thumb.decoding = "async";
			a.appendChild(thumb);
			wrap.appendChild(a);
			grid.appendChild(wrap);
			img.remove();
		});
	}

	// 首屏若带 #dynamic-xxx，滚动到对应条目（参考站同款：刷新深链直接定位）
	function syncHash() {
		const raw = decodeURIComponent(window.location.hash.slice(1));
		if (!raw) return;
		const idx = filtered.findIndex(
			(it) => `dynamic-${String(it.id).replace(/[^a-zA-Z0-9_-]/g, "-")}` === raw,
		);
		if (idx < 0) return;
		// 目标条目可能还在未加载的分页里，先把页数翻到能覆盖它
		const needPage = Math.ceil((idx + 1) / itemsPerPage);
		if (needPage > page) {
			page = needPage;
			return;
		}
		const el = document.getElementById(raw);
		el?.scrollIntoView({ behavior: "smooth", block: "start" });
	}
</script>

{#if status === "loading"}
	<div class="dynamic-state card-base">加载中…</div>
{:else if status === "error"}
	<div class="dynamic-state card-base">动态加载失败，请稍后重试。</div>
{:else if items.length === 0}
	<div class="dynamic-state card-base">{emptyText}</div>
{:else}
	<!-- 搜索 + 年份筛选：两项都是即输即滤，无提交按钮（参考站同款） -->
	<div class="card-base mb-4 flex flex-wrap items-center gap-3 px-5 py-4">
		<label class="dynamic-filter-search">
			<svg width="1em" height="1em" viewBox="0 0 24 24" data-icon="material-symbols:search-rounded" aria-hidden="true">
				<path fill="currentColor" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"/>
			</svg>
			<input
				type="search"
				bind:value={keyword}
				placeholder={searchPlaceholder}
				aria-label="搜索动态"
			/>
		</label>
		<div class="dynamic-filter-year" bind:this={yearBox}>
			<button
				type="button"
				class="dynamic-year-trigger"
				bind:this={yearTrigger}
				aria-haspopup="listbox"
				aria-expanded={yearOpen}
				aria-label="按年份筛选"
				onclick={() => (yearOpen = !yearOpen)}
				onkeydown={onTriggerKeydown}
			>
				<svg width="1em" height="1em" viewBox="0 0 24 24" data-icon="material-symbols:calendar-month-rounded" aria-hidden="true">
					<path fill="currentColor" d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V3q0-.425.288-.712T7 2t.713.288T8 3v1h8V3q0-.425.288-.712T17 2t.713.288T18 3v1h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zm7-6q-.425 0-.712-.288T11 13t.288-.712T12 12t.713.288T13 13t-.288.713T12 14m-4.712-.288Q7 13.426 7 13t.288-.712T8 12t.713.288T9 13t-.288.713T8 14t-.712-.288M16 14q-.425 0-.712-.288T15 13t.288-.712T16 12t.713.288T17 13t-.288.713T16 14m-4 4q-.425 0-.712-.288T11 17t.288-.712T12 16t.713.288T13 17t-.288.713T12 18m-4.712-.288Q7 17.426 7 17t.288-.712T8 16t.713.288T9 17t-.288.713T8 18t-.712-.288M16 18q-.425 0-.712-.288T15 17t.288-.712T16 16t.713.288T17 17t-.288.713T16 18"/>
				</svg>
				<span>{year === "all" ? allYearsText : year}</span>
				<svg class="dynamic-year-arrow" width="1em" height="1em" viewBox="0 0 24 24" data-icon="material-symbols:arrow-drop-down-rounded" aria-hidden="true">
					<path fill="currentColor" d="M11.475 14.475L7.85 10.85q-.075-.075-.112-.162T7.7 10.5q0-.2.138-.35T8.2 10h7.6q.225 0 .363.15t.137.35q0 .05-.15.35l-3.625 3.625q-.125.125-.25.175T12 14.7t-.275-.05t-.25-.175"/>
				</svg>
			</button>
			<div class="dynamic-year-panel" role="listbox" aria-label="按年份筛选">
				{#each yearOptions as y (y)}
					<button
						type="button"
						class="dynamic-year-item"
						class:is-current={year === y}
						role="option"
						aria-selected={year === y}
						onclick={() => setYear(y)}
						onkeydown={onItemKeydown}
					>
						{y === "all" ? allYearsText : y}
					</button>
				{/each}
			</div>
		</div>
		{#if isFiltering}
			<span class="ml-auto text-sm text-black/30 dark:text-white/30">
				筛选出 {filtered.length} / {items.length} 条
			</span>
		{/if}
	</div>

	<div id="dynamic-list" bind:this={list}></div>

	{#if filtered.length === 0}
		<div class="dynamic-state card-base">{noResultsText}</div>
	{:else if remaining > 0}
		<button type="button" class="btn-regular h-10 w-full" onclick={() => (page += 1)}>
			加载更多（还有 {remaining} 条）
		</button>
	{/if}
{/if}

<!-- 点击面板外收起下拉。Svelte 卸载时自动清掉这个 window 监听（岛随软导航整体重建，不会累加） -->
<svelte:window onclick={onWindowClick} />

<!-- 样式说明：筛选栏与下拉面板的样式都在 src/styles/global.css（.dynamic-filter-* / .dynamic-year-*）。
     不能写在本组件 <style> 里——Svelte 岛的 scoped CSS 会被 Astro 内联进 /dynamic/
     单页的 head，Swup 软导航不换 head，从别的页点进来样式整块丢失。 -->

