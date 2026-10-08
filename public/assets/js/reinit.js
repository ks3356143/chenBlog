// 「导航后重新初始化」的唯一实现，由 BaseLayout 的 head 引入。
// head 不会被 Swup 换掉，所以本文件每个文档只执行一次：注册方无论是 Astro 的模块脚本，
// 还是容器内每次导航被重新求值的 is:inline 脚本，都不会因此往 document/window 上叠监听器
// （这就是 2026-09-30 那次「切页后汉堡点不开」的机制，见 AGENTS 十-11 / 十-12）。
(function () {
	if (window.__reinitInstalled) return
	window.__reinitInstalled = true

	var entries = {}
	var onceDone = {}
	// 一趟导航里 SwupManager 会派发两个名字（content:replace → swup:contentReplaced，
	// page:view → astro:page-load），组件只按 key 听一次，所以同一次导航只跑一次
	var token = 0

	function schedule(entry, delayed) {
		clearTimeout(entry.timer)
		entry.runs++
		entry.ranFor = token
		if (delayed && entry.delay) entry.timer = setTimeout(entry.fn, entry.delay)
		else entry.fn()
	}

	function runAll() {
		token++
		for (var key in entries) schedule(entries[key], true)
	}

	// 只补没被 runAll 跑到的（正常情况下一个都不补）
	function catchUp() {
		for (var key in entries) {
			if (entries[key].ranFor !== token) schedule(entries[key], true)
		}
	}

	// 是否正处在一次软导航中途：Swup 在 visit 期间给 <html> 挂 is-changing，
	// 容器内脚本的重新求值就发生在这段窗口里。
	// ⚠️ 只对「已存在的 key」成立：那一趟的 runAll 已经跑过它了，注册时不该再跑一次。
	// 对「全新的 key」不成立（它没被 runAll 跑到，见下面 onReinit 里的注释）——这条区分是
	// 2026-10-08 修「文章页 F5 → 点主页，封面永远转圈」时补上的。
	// 关掉页面过渡（prefers-reduced-motion）时不会有 is-changing，注册即跑，行为与整页加载一致。
	function navigating() {
		return document.documentElement.classList.contains("is-changing")
	}

	/**
	 * 现在跑一次（不等 delay），之后每次导航后再跑一次（delay 只用在导航那一次，
	 * 与各组件原先「直接调一次 + 导航后延迟重跑」的写法一致）。
	 * 同一个 key 重复注册只换闭包，不会多一个监听器、也不会多跑一次。
	 * 例外：软导航途中重新求值的容器内脚本不再补跑，交给紧随其后的 runAll（见 navigating()）。
	 * fn 必须每次调用都重新查 DOM（容器会被整片换掉，抓住旧节点的闭包会指到已移除的节点）。
	 */
	window.onReinit = function (key, fn, opts) {
		opts = opts || {}
		var entry = entries[key]
		if (entry) {
			entry.fn = fn
			entry.delay = opts.delay || 0
			// 同一组件在一页里挂两处（如 SiteStatus 的 xl 右栏 + 移动底部堆）时，第一份脚本求值时
			// 还看不到尚未解析出来的节点，所以解析期的重复注册要允许再跑一次，否则首屏少更新一处
			if (navigating()) {
				if (entry.ranFor !== token) schedule(entry, true)
			} else {
				schedule(entry, false)
			}
			return
		}
		// 全新的 key 一定没被「这一趟」的 runAll 算进过：Astro 的组件脚本是 type="module"，插进容器后
		// 要到下一个宏任务才求值，而 runAll 在 content:replace 当趟就派发完了。这条区分是
		// 2026-10-08 修「文章页 F5 → 点主页，封面永远转圈」时补的（线上实测 runs 恒 0、10 张封面卡死）。
		// 但同步执行的经典脚本会在 runAll 之前就把 key 注册好，所以这里不能立即跑，否则一趟导航跑两遍
		// （实测 recommended-post 会 +2）。做法：让出这一拍，下一拍发现自己仍然没被跑过才自己补一次，
		// 同步/异步两种注册都恰好跑一次；ranFor 从 -1 起，page:view 的 catchUp 也照样能兜住它。
		entry = entries[key] = { fn: fn, delay: opts.delay || 0, timer: 0, runs: 0, ranFor: -1 }
		if (opts.immediate !== false) {
			if (navigating()) {
				var fresh = entry
				setTimeout(function () {
					if (fresh.ranFor === -1) schedule(fresh, false)
				}, 0)
			} else {
				schedule(entry, false)
			}
		}
	}

	/**
	 * 整个文档生命周期内只跑一次：给「注册全局监听 / 包装 history API」这类一次性动作。
	 * fn 显式 return false 表示「这次没做成」（比如目标元素还不在），下次再试，不会被锁死。
	 */
	window.reinitOnce = function (key, fn) {
		if (onceDone[key]) return
		if (fn() === false) return
		onceDone[key] = true
	}

	// 验证用：这个 key 到现在实际跑过几次（回归时要求每次导航 +1，不能 +2）
	window.reinitRuns = function (key) {
		return entries[key] ? entries[key].runs : -1
	}

	document.addEventListener("swup:contentReplaced", runAll)
	document.addEventListener("astro:page-load", catchUp)
})()
