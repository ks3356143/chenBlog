import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

/* 解析全局 playwright（顶层只有 @playwright/test，playwright 是其嵌套依赖，见 harness.md B-9） */
function resolvePlaywright() {
  const roots = [];
  try {
    const g = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    if (g) roots.push(g, g + "/@playwright/test");
  } catch {
    /* 忽略，继续试常见路径 */
  }
  roots.push(
    process.env.APPDATA + "/npm/node_modules",
    process.env.APPDATA + "/npm/node_modules/@playwright/test"
  );
  for (const r of roots) {
    if (!r) continue;
    try {
      const m = createRequire(r.replace(/\\/g, "/") + "/")("playwright");
      if (m?.chromium) return { chromium: m.chromium, from: r };
    } catch {
      /* 下一个候选 */
    }
  }
  throw new Error("找不到 playwright。候选根：" + roots.join(" | "));
}

const { chromium, from } = resolvePlaywright();

/* ---------- CLI ---------- */
const args = process.argv.slice(2);
const url = args.find((a) => /^(https?:|file:)/.test(a)) || args[0];
if (!url) {
  console.error(
    [
      "用法：node scripts/probe.mjs <url> [width] [height] [--also <w> <h>] [--sel <css>] [--quiet]",
      "",
      "  <url>          必须写**完整 URL**（iframe 的相对 src 按顶层 origin 解析，见 harness.md A-2）",
      "                 本地构建产物写 file:///E:/fontendProjects/chenBlog/dist/index.html",
      "  [width] [h]    顶层视口，默认 1440 900（量 vh 类必须同时给高度）",
      "  --also w h     额外在定宽 iframe 里复测一档断点（可重复）",
      "  --sel css      额外枚举该选择器：数量 + 每项 rect/overflow/计算样式",
      "  --quiet        只出一行紧凑 JSON（便于脚本消费）",
    ].join("\n")
  );
  process.exit(2);
}

const pos = args.indexOf(url);
const width = Number(args[pos + 1]) || 1440;
const height = Number(args[pos + 2]) || 900;
const quiet = args.includes("--quiet");
const also = [];
args.forEach((a, i) => {
  if (a === "--also") also.push({ w: Number(args[i + 1]), h: Number(args[i + 2]) || 800 });
});
const selIdx = args.indexOf("--sel");
const sel = selIdx >= 0 ? args[selIdx + 1] : null;

const PROBE = ({ width, height, sel }) => {
  const st = document.createElement("style");
  st.id = "probe-kill-transitions";
  st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(st);

  const de = document.documentElement;
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const doc = (d) => ({
    href: d.location.href,
    overflowX: d.documentElement.scrollWidth - d.documentElement.clientWidth,
    scrollWidth: d.documentElement.scrollWidth,
    clientWidth: d.documentElement.clientWidth,
    h1: d.querySelectorAll("h1").length,
    emptyHeadings: [...d.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => !(h.textContent || "").trim()).length,
    headingSequence: [...d.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => h.tagName.toLowerCase()).join(","),
    images: d.querySelectorAll("img").length,
    brokenImages: [...d.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
    altState: {
      // ⚠️ 三种状态要分开数：有 alt 且为空（装饰图正确）vs 完全没有 alt（无障碍缺陷）
      // 注意 `[alt]` 会匹配**任何**带 alt 属性的图（含非空值），别拿它当"空 alt"计数
      hasAltAttr: d.querySelectorAll("img[alt]").length,
      emptyAlt: d.querySelectorAll("img[alt='']").length,
      nonEmptyAlt: [...d.querySelectorAll("img[alt]")].filter((i) => (i.getAttribute("alt") || "").trim() !== "").length,
      noAlt: [...d.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
    },
    islands: d.querySelectorAll("astro-island").length,
    islandNames: [...d.querySelectorAll("astro-island")].map((i) => {
      try {
        return decodeURIComponent(i.getAttribute("component-url") || "").split("/").pop();
      } catch {
        return i.getAttribute("component-url");
      }
    }),
    theme: d.documentElement.getAttribute("data-theme"),
    swup: typeof window.swup === "object" ? { hooks: !!window.swup.hooks } : null,
    reinitRuns: typeof window.reinitRuns === "function" ? window.reinitRuns() : null,
    bannerOverlay: !!d.querySelector("#banner-overlay-container"),
    scrollContainers: [...d.querySelectorAll(".horizontal-scroll-container")].map((el) => ({
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
      scrollable: el.scrollWidth > el.clientWidth,
      overflowX: getComputedStyle(el).overflowX,
    })),
    coverLoading: [...d.querySelectorAll("[data-loading]")].map((el) => {
      const img = el.querySelector("img");
      return {
        loading: el.getAttribute("data-loading"),
        complete: img ? img.complete : null,
        naturalWidth: img ? img.naturalWidth : null,
        realBug: !!(img && img.complete && img.naturalWidth > 0 && el.getAttribute("data-loading") !== "false"),
      };
    }),
  });

  const out = { top: { viewport: { width, height, innerWidth, innerHeight } , ...doc(document) } };

  if (sel) {
    out.selector = {
      css: sel,
      count: document.querySelectorAll(sel).length,
      items: [...document.querySelectorAll(sel)].slice(0, 24).map((el) => {
        const cs = getComputedStyle(el);
        return { rect: rect(el), display: cs.display, visibility: cs.visibility, overflowX: cs.overflowX, color: cs.color, marginLeft: cs.marginLeft, paddingLeft: cs.paddingLeft };
      }),
    };
  }
  return out;
};

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  // domcontentloaded：页面可能有永不结束的 load（懒加载/长连接），见 harness.md B-8
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(400);

  const result = await page.evaluate(PROBE, { width, height, sel });

  for (const { w, h } of also) {
    const iframeRead = await page.evaluate(
      ({ w, h, originPath }) =>
        new Promise((resolve) => {
          const f = document.createElement("iframe");
          f.style.cssText = `width:${w}px;height:${h}px;border:0;position:fixed;left:0;top:0`;
          f.src = originPath;
          f.onload = () => {
            setTimeout(() => {
              const d = f.contentDocument;
              if (!d) return resolve({ error: "跨文档，取不到 contentDocument" });
              const st = d.createElement("style");
              st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
              d.head?.appendChild(st);
              const items = [...d.querySelectorAll(".horizontal-scroll-container")].map((el) => ({
                clientWidth: el.clientWidth,
                scrollWidth: el.scrollWidth,
                scrollable: el.scrollWidth > el.clientWidth,
              }));
              const pops = [...d.querySelectorAll("[hidden],[class*='pop'],.me-qr-pop")].length;
              resolve({
                selfProve_innerWidth: d.documentElement.clientWidth,
                overflowX: d.documentElement.scrollWidth - d.documentElement.clientWidth,
                h1: d.querySelectorAll("h1").length,
                cards: d.querySelectorAll('[class*="post-card"]').length,
                postsLinks: d.querySelectorAll('a[href^="/posts/"]').length,
                scrollContainers: items,
                hiddenPops: pops,
                displayOfFirstWave: d.querySelector("#header-waves") ? getComputedStyle(d.querySelector("#header-waves")).display : null,
                rectOfFirstWave: (() => {
                  const el = d.querySelector("#header-waves");
                  if (!el) return null;
                  const r = el.getBoundingClientRect();
                  return { h: Math.round(r.height), w: Math.round(r.width) };
                })(),
              });
            }, 300);
          };
          document.body.appendChild(f);
        }),
      { w, h, originPath: url.split("#")[0] }
    );
    (result.iframes ||= []).push({ width: w, height: h, read: iframeRead });
  }

  console.log(JSON.stringify(result, null, quiet ? 0 : 2));
  if (!quiet) {
    console.log("\nplaywright 解析自：" + from);
    console.log(
      "判据提醒：overflowX>0 = 横向溢出 · brokenImages 非空 = 破图 · 窄档 scrollable 必须 true · " +
        "h1 应为 1 · islands=0 说明组件没水合（AGENTS 五-33）· realBug=true 才是遮罩没褪"
    );
  }
} finally {
  await browser.close();
}
