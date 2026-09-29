<script>
	// 动态（说说）列表。条目骨架由 DynamicItemTemplate.astro 以 <template> 输出，
	// 这里只负责取数据、分页、克隆模板填占位——这样条目能用 astro-icon 与构建期图片优化，
	// 不必把 HTML 拼进 JS（做法照 firefly.cuteleaf.cn 的 /dynamic/）。
	import { onMount } from "svelte";
	import { formatDateTimeToYYYYMMDDHHmm } from "@/utils/date-utils";

	let { source = "/api/dynamic.json", itemsPerPage = 10, timezone = undefined } = $props();

	/** @type {any[]} */
	let items = $state([]);
	let page = $state(1);
	/** @type {"loading" | "ready" | "error"} */
	let status = $state("loading");
	/** @type {HTMLElement | null} */
	let list = $state(null);

	const visible = $derived(items.slice(0, page * itemsPerPage));
	const remaining = $derived(items.length - visible.length);

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

	// 容器与状态块分开：命令式塞进去的节点不能和 Svelte 的 if 块共用父元素，
	// 否则 Svelte 更新时会去删它不认识的孩子。
	$effect(() => {
		if (!list || status !== "ready") return;
		const tpl = document.querySelector("[data-dynamic-item-template]");
		if (!tpl) return;
		list.textContent = "";
		for (const item of visible) list.append(renderItem(tpl, item));
	});

	/**
	 * @param {{ content: DocumentFragment }} tpl
	 * @param {{ published: number, html: string, pinned: boolean, location: string }} item
	 */
	function renderItem(tpl, item) {
		const frag = tpl.content.cloneNode(true);
		const q = (/** @type {string} */ sel) => frag.querySelector(sel);
		const date = new Date(item.published);

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
		if (content) content.innerHTML = item.html;

		return frag;
	}
</script>

{#if status === "loading"}
	<div class="dynamic-state card-base">加载中…</div>
{:else if status === "error"}
	<div class="dynamic-state card-base">动态加载失败，请稍后重试。</div>
{:else if items.length === 0}
	<div class="dynamic-state card-base">还没有动态。</div>
{:else}
	<div id="dynamic-list" bind:this={list}></div>
	{#if remaining > 0}
		<button type="button" class="btn-regular h-10 w-full" onclick={() => (page += 1)}>
			加载更多（还有 {remaining} 条）
		</button>
	{/if}
{/if}
