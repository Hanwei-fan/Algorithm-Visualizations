/* 共享风格（主题）系统：覆盖各页面共用的 CSS 变量 + 主体背景，左上角悬浮切换器。
   用法：任意页面在 </body> 前引入 <script src="../assets/theme.js"></script>（门户用 assets/theme.js）。
   选择记忆在 localStorage。 */
(function () {
  const THEMES = {
    cyber: {
      name: "赛博朋克", swatch: "#00f0ff",
      vars: {
        "--bg": "#07060f", "--panel": "rgba(18, 15, 38, 0.72)", "--border": "#2a2350",
        "--text": "#e6e1ff", "--muted": "#7d76a8", "--cyan": "#00f0ff", "--magenta": "#ff2bd6",
        "--yellow": "#ffd400", "--green": "#00ff9c", "--grid": "rgba(0, 240, 255, 0.06)",
        "--node-fill": "#16213e",
      },
      bg: `radial-gradient(circle at 15% 0%, rgba(255,43,214,0.14), transparent 45%),
           radial-gradient(circle at 90% 10%, rgba(0,240,255,0.14), transparent 45%),
           linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 100% 34px,
           linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 34px 100%,
           var(--bg)`,
    },
    ocean: {
      name: "深空蓝", swatch: "#5eb8ff",
      vars: {
        "--bg": "#0e1524", "--panel": "rgba(22, 32, 52, 0.82)", "--border": "#2b3b57",
        "--text": "#e8eef7", "--muted": "#8fa2bd", "--cyan": "#4db8e8", "--magenta": "#e88ab5",
        "--yellow": "#f0c674", "--green": "#7fc99a", "--grid": "rgba(120, 170, 220, 0.05)",
        "--node-fill": "#1c2b45",
      },
      bg: `radial-gradient(circle at 15% 0%, rgba(120,170,220,0.10), transparent 50%),
           radial-gradient(circle at 90% 10%, rgba(90,140,190,0.10), transparent 50%),
           linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 100% 34px,
           linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 34px 100%,
           var(--bg)`,
    },
    sepia: {
      name: "护眼米", swatch: "#c8956d",
      vars: {
        "--bg": "#f3ecde", "--panel": "rgba(255, 251, 242, 0.86)", "--border": "#d8c9ad",
        "--text": "#3a332a", "--muted": "#8a7f6c", "--cyan": "#1f8a70", "--magenta": "#c0567e",
        "--yellow": "#b8860b", "--green": "#2e8b57", "--grid": "rgba(150, 130, 95, 0.06)",
        "--node-fill": "#fffdf6",
      },
      bg: `radial-gradient(circle at 15% 0%, rgba(200,175,130,0.14), transparent 50%),
           radial-gradient(circle at 90% 10%, rgba(180,150,110,0.12), transparent 50%),
           linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 100% 34px,
           linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 34px 100%,
           var(--bg)`,
    },
    light: {
      name: "极简白", swatch: "#4a90d9",
      vars: {
        "--bg": "#f7f9fc", "--panel": "rgba(255, 255, 255, 0.9)", "--border": "#d5dde8",
        "--text": "#1f2733", "--muted": "#6b7688", "--cyan": "#0a84c7", "--magenta": "#c026a0",
        "--yellow": "#b8860b", "--green": "#1a9e5f", "--grid": "rgba(80, 120, 170, 0.05)",
        "--node-fill": "#ffffff",
      },
      bg: `radial-gradient(circle at 15% 0%, rgba(74,144,217,0.08), transparent 50%),
           radial-gradient(circle at 90% 10%, rgba(120,90,200,0.06), transparent 50%),
           linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 100% 34px,
           linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 34px 100%,
           var(--bg)`,
    },
  };
  const ORDER = ["cyber", "ocean", "sepia", "light"];
  const KEY = "algoviz-theme";

  function apply(id) {
    const t = THEMES[id] || THEMES.cyber;
    const root = document.documentElement;
    for (const [k, v] of Object.entries(t.vars)) root.style.setProperty(k, v);
    // 主体背景（用 !important 覆盖页面内联的 body background）
    document.body.style.setProperty("background", t.bg.replace(/\s+/g, " ").trim(), "important");
    // 浅色主题下把标题的霓虹发光文字阴影减弱，避免糊
    const light = (id === "sepia" || id === "light");
    root.style.setProperty("color-scheme", light ? "light" : "dark");
    let ov = document.getElementById("theme-lightfix");
    if (light) {
      if (!ov) { ov = document.createElement("style"); ov.id = "theme-lightfix"; document.head.appendChild(ov); }
      // 关联那些写死的深色底/浅色字，让浅色主题下也协调、易读
      const inputBg = (id === "sepia") ? "#fffdf6" : "#ffffff";
      const codeBg  = (id === "sepia") ? "rgba(255,251,242,0.9)" : "rgba(248,250,252,0.95)";
      const codeFg  = (id === "sepia") ? "#5c5342" : "#33404f";
      ov.textContent = `
        /* 标题霓虹发光减弱；门户里写死的白色标题(区标题/卡片名)改为主题文字色 */
        header h1, .section-head h2, .card h3 { text-shadow: 0 1px 0 rgba(0,0,0,.08) !important; color: var(--text) !important; }
        .cppview-btn { box-shadow: 0 2px 10px rgba(0,0,0,.12) !important; }
        /* 输入框/下拉：深底浅字 → 浅底深字 */
        input, select, textarea {
          background: ${inputBg} !important; color: var(--text) !important;
          border-color: var(--border) !important;
        }
        input::placeholder { color: var(--muted) !important; }
        /* 代码/公式/伪代码块：深底 → 浅底，浅蓝灰字 → 深灰字 */
        .formula, .pseudocode, .code, pre, .cppview-body pre {
          background: ${codeBg} !important; color: ${codeFg} !important;
        }
        /* 写死的浅蓝灰正文色统一收敛到深灰 */
        .formula, .note, .status, .sublabel { }
        /* 反色按钮里的白字/深字在浅底仍成立(它们底色是强调色)，不改 */
        /* 卡片阴影减淡，避免浅色下发脏 */
        .card { box-shadow: 0 0 0 1px rgba(0,0,0,.04), 0 6px 24px rgba(0,0,0,.08) !important; }
        /* SVG/网格里常见的白色描边文字在浅底看不清时略加深(仅纯白 fill 的文字) */
        text[fill="#fff"], text[fill="#ffffff"] { fill: var(--text) !important; }
        /* 关联题目卡片：深底 → 浅底，浅蓝灰 why 文字 → 深灰 */
        .prob { background: ${codeBg} !important; }
        .prob .why { color: ${codeFg} !important; }
        /* 「查看 C++ 代码」弹窗：整体浅色化 + 浅底语法高亮(类 GitHub light) */
        .cppview-mask { background: rgba(40,45,60,0.45) !important; }
        .cppview-modal { background: #ffffff !important; border-color: var(--border) !important;
          box-shadow: 0 0 0 1px rgba(0,0,0,.06), 0 12px 50px rgba(0,0,0,.25) !important; }
        .cppview-head { border-bottom-color: var(--border) !important; }
        .cppview-head h3 { color: var(--text) !important; text-shadow: none !important; }
        .cppview-close { border-color: var(--border) !important; color: var(--muted) !important; }
        .cppview-tabs { border-bottom-color: var(--border) !important; }
        .cppview-tab { background: ${codeBg} !important; color: var(--muted) !important; border-color: var(--border) !important; }
        .cppview-tab.active { background: #ffffff !important; color: var(--cyan) !important; border-bottom-color: #ffffff !important; text-shadow: none !important; }
        .cppview-body pre, .cppview-body code { background: #ffffff !important; color: #24292e !important; }
        .cppview-cmt { color: #6a737d !important; }   /* 注释 灰 */
        .cppview-kw  { color: #cf222e !important; }   /* 关键字 红 */
        .cppview-str { color: #0a3069 !important; }   /* 字符串 深蓝 */
        .cppview-num { color: #0550ae !important; }   /* 数字 蓝 */
        /* 按钮：写死的深色/霓虹底 → 浅底描边式；hover 才用强调色实心 */
        .btn { background: #ffffff !important; }
        .btn:not(:disabled):hover { background: var(--magenta) !important; color: #fff !important; box-shadow: 0 2px 10px rgba(0,0,0,.15) !important; }
        .btn.cy:not(:disabled):hover { background: var(--cyan) !important; color: #fff !important; }
        .btn.gn:not(:disabled):hover { background: var(--green) !important; color: #fff !important; }
        .btn.secondary, .btn.ghost { background: #ffffff !important; color: var(--muted) !important; }
        .btn.secondary:not(:disabled):hover, .btn.ghost:not(:disabled):hover { background: var(--panel) !important; color: var(--cyan) !important; }
        /* 悬浮「查看 C++ 代码」按钮：深底 → 浅底 */
        .cppview-btn { background: #ffffff !important; color: var(--cyan) !important; }
        .cppview-btn:hover { background: var(--cyan) !important; color: #fff !important; }
        /* tab 类按钮(部分页面用 .tab)：激活态实心，非激活浅底 */
        .tab { background: #ffffff !important; }
        .tab.active { background: var(--cyan) !important; color: #fff !important; }
      `;
    } else if (ov) { ov.remove(); }
  }

  function injectStyle() {
    if (document.getElementById("theme-picker-style")) return;
    const css = `
      .theme-picker {
        position: fixed; top: 14px; left: 16px; z-index: 80;
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 12px; border-radius: 999px;
        background: var(--panel); border: 1px solid var(--border);
        box-shadow: 0 2px 12px rgba(0,0,0,.25); backdrop-filter: blur(6px);
      }
      .theme-picker .tlabel { font-size: 11px; color: var(--muted); font-family: "SF Mono", Menlo, monospace; letter-spacing: 1px; }
      /* 给页面顶部让出固定切换器的空间 */
      body { padding-top: 46px; }
      header { padding-top: 8px !important; }
      .theme-dot {
        width: 22px; height: 22px; border-radius: 50%; cursor: pointer; padding: 0;
        border: 2px solid transparent; transition: all .15s; position: relative;
      }
      .theme-dot:hover { transform: scale(1.15); }
      .theme-dot.sel { border-color: var(--text); box-shadow: 0 0 0 2px var(--bg), 0 0 8px rgba(0,0,0,.3); }
      .theme-dot::after {
        content: attr(data-name); position: absolute; top: 130%; left: 50%; transform: translateX(-50%);
        font-size: 11px; white-space: nowrap; color: var(--text); background: var(--panel);
        border: 1px solid var(--border); border-radius: 4px; padding: 2px 8px; opacity: 0; pointer-events: none;
        transition: opacity .15s; font-family: "SF Mono", Menlo, monospace; z-index: 60;
      }
      .theme-dot:hover::after { opacity: 1; }
    `;
    const el = document.createElement("style");
    el.id = "theme-picker-style"; el.textContent = css;
    document.head.appendChild(el);
  }

  function buildPicker(cur) {
    injectStyle();
    const wrap = document.createElement("span");
    wrap.className = "theme-picker";
    wrap.innerHTML = `<span class="tlabel">风格</span>` + ORDER.map(id =>
      `<button class="theme-dot${id === cur ? " sel" : ""}" data-id="${id}" data-name="${THEMES[id].name}" style="background:${THEMES[id].swatch}"></button>`).join("");
    // 放到左上角「返回门户」链接旁
    const back = document.querySelector("a.back");
    if (back && back.parentNode) back.parentNode.insertBefore(wrap, back.nextSibling);
    else document.body.insertBefore(wrap, document.body.firstChild);
    wrap.querySelectorAll(".theme-dot").forEach(b => b.onclick = () => {
      const id = b.dataset.id;
      localStorage.setItem(KEY, id);
      apply(id);
      wrap.querySelectorAll(".theme-dot").forEach(x => x.classList.toggle("sel", x.dataset.id === id));
    });
  }

  function init() {
    const saved = localStorage.getItem(KEY) || "cyber";
    apply(saved);
    buildPicker(THEMES[saved] ? saved : "cyber");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
