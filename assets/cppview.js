/* 共享「查看 C++ 代码」组件：弹窗 + 一键复制。
   用法：CppView.register({ 算法id: { title, code }, ... })，
   再 CppView.button(算法id) 生成一个按钮元素，或 CppView.open(算法id) 直接打开。 */
(function () {
  const REG = {};

  // 注入一次样式
  function injectStyle() {
    if (document.getElementById("cppview-style")) return;
    const css = `
      /* 悬浮固定到右上角，与左上「返回门户」对称，不再挤在控制区 */
      .cppview-btn {
        position: fixed; top: 16px; right: 24px; z-index: 50;
        padding: 8px 18px; border: 1px solid #00f0ff; border-radius: 999px;
        background: rgba(7,6,15,0.85); color: #00f0ff; font-size: 13px;
        letter-spacing: 1px; cursor: pointer;
        font-family: "SF Mono", Menlo, monospace; transition: all .18s; white-space: nowrap;
        box-shadow: 0 0 0 1px rgba(0,240,255,.15), 0 4px 20px rgba(0,0,0,.5);
        backdrop-filter: blur(6px);
      }
      .cppview-btn::before { content: "‹ › "; opacity: .8; }
      .cppview-btn:hover { background: #00f0ff; color: #05060f; box-shadow: 0 0 18px rgba(0,240,255,.7); }
      /* 同页多个按钮时(如拓扑排序的自动/手动两处)只保留第一个悬浮显示 */
      #cppBtnM { display: none; }
      @media (max-width: 640px) { .cppview-btn { top: 10px; right: 12px; padding: 6px 12px; font-size: 12px; } }
      .cppview-mask {
        position: fixed; inset: 0; background: rgba(3,2,10,0.72); backdrop-filter: blur(3px);
        display: flex; align-items: center; justify-content: center; z-index: 999; padding: 30px;
      }
      .cppview-modal {
        background: #0d0b1a; border: 1px solid #2a2350; border-radius: 10px;
        width: min(860px, 96vw); max-height: 88vh; display: flex; flex-direction: column;
        box-shadow: 0 0 0 1px rgba(0,240,255,.12), 0 12px 60px rgba(0,0,0,.7);
      }
      .cppview-head {
        display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #2a2350;
      }
      .cppview-head h3 {
        margin: 0; font-size: 16px; color: #fff; letter-spacing: 1px; flex: 1;
        font-family: "SF Mono", Menlo, monospace;
        text-shadow: 0 0 6px rgba(0,240,255,.5);
      }
      .cppview-copy {
        padding: 7px 14px; border: 1px solid #ff2bd6; border-radius: 4px;
        background: rgba(255,43,214,0.12); color: #ff2bd6; font-size: 13px; cursor: pointer;
        font-family: "SF Mono", Menlo, monospace; letter-spacing: 1px; transition: all .18s;
      }
      .cppview-copy:hover { background: #ff2bd6; color: #05060f; box-shadow: 0 0 14px rgba(255,43,214,.6); }
      .cppview-copy.ok { border-color: #00ff9c; color: #00ff9c; background: rgba(0,255,156,.12); }
      .cppview-close {
        width: 30px; height: 30px; border: 1px solid #2a2350; border-radius: 4px; background: transparent;
        color: #7d76a8; font-size: 18px; cursor: pointer; line-height: 1;
      }
      .cppview-close:hover { border-color: #00f0ff; color: #00f0ff; }
      .cppview-tabs { display: flex; gap: 8px; padding: 12px 20px 0; border-bottom: 1px solid #2a2350; }
      .cppview-tab {
        padding: 8px 16px; border: 1px solid #2a2350; border-bottom: none;
        border-radius: 6px 6px 0 0; background: rgba(20,17,42,0.6); color: #7d76a8;
        font-size: 13px; cursor: pointer; font-family: "SF Mono", Menlo, monospace;
        letter-spacing: .5px; transition: all .16s; margin-bottom: -1px;
      }
      .cppview-tab:hover { color: #00f0ff; border-color: #00f0ff; }
      .cppview-tab.active { color: #00f0ff; background: #0d0b1a; border-color: #2a2350; border-bottom: 1px solid #0d0b1a; text-shadow: 0 0 6px rgba(0,240,255,.5); }
      .cppview-body { overflow: auto; padding: 0; }
      .cppview-body pre {
        margin: 0; padding: 18px 20px; font-family: "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
        font-size: 13px; line-height: 1.6; color: #cdd3df; white-space: pre; tab-size: 4;
      }
      .cppview-cmt { color: #6f8a9c; }   /* 注释绿灰 */
      .cppview-kw  { color: #ff9ae6; }   /* 关键字粉 */
      .cppview-str { color: #ffd479; }   /* 字符串黄 */
      .cppview-num { color: #a0e0ff; }   /* 数字青 */
    `;
    const el = document.createElement("style");
    el.id = "cppview-style"; el.textContent = css;
    document.head.appendChild(el);
  }

  // 极简 C++ 高亮：单次分词扫描，每个 token 先 HTML 转义再包 span，
  // 避免多轮 replace 相互污染（否则会把已生成的 <span class="..."> 属性再匹配一次，导致标签泄漏）。
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  const KW = new Set("int long double float char bool void const unsigned short struct class public private return if else for while do switch case break continue sizeof new delete true false nullptr using namespace std include define vector string pair auto static template typename".split(" "));
  function highlight(code) {
    let out = "";
    let i = 0;
    const n = code.length;
    while (i < n) {
      const c = code[i];
      // 行注释 // ... 到行尾
      if (c === "/" && code[i + 1] === "/") {
        let j = i; while (j < n && code[j] !== "\n") j++;
        out += `<span class="cppview-cmt">${esc(code.slice(i, j))}</span>`;
        i = j; continue;
      }
      // 块注释 /* ... */
      if (c === "/" && code[i + 1] === "*") {
        let j = i + 2; while (j < n && !(code[j] === "*" && code[j + 1] === "/")) j++;
        j = Math.min(n, j + 2);
        out += `<span class="cppview-cmt">${esc(code.slice(i, j))}</span>`;
        i = j; continue;
      }
      // 字符串 "..."（处理转义）
      if (c === '"') {
        let j = i + 1; while (j < n && !(code[j] === '"' && code[j - 1] !== "\\")) j++;
        j = Math.min(n, j + 1);
        out += `<span class="cppview-str">${esc(code.slice(i, j))}</span>`;
        i = j; continue;
      }
      // 字符 '...'
      if (c === "'") {
        let j = i + 1; while (j < n && !(code[j] === "'" && code[j - 1] !== "\\")) j++;
        j = Math.min(n, j + 1);
        out += `<span class="cppview-str">${esc(code.slice(i, j))}</span>`;
        i = j; continue;
      }
      // 标识符/关键字
      if (/[A-Za-z_]/.test(c)) {
        let j = i; while (j < n && /[A-Za-z0-9_]/.test(code[j])) j++;
        const word = code.slice(i, j);
        out += KW.has(word) ? `<span class="cppview-kw">${word}</span>` : esc(word);
        i = j; continue;
      }
      // 数字
      if (/[0-9]/.test(c)) {
        let j = i; while (j < n && /[0-9.xXa-fA-F]/.test(code[j])) j++;
        out += `<span class="cppview-num">${esc(code.slice(i, j))}</span>`;
        i = j; continue;
      }
      // 其他单字符（含 < > & 等，需转义）
      out += esc(c);
      i++;
    }
    return out;
  }

  // open(id) 或 open([id1, id2, ...], activeId?)：
  // 传数组时弹窗顶部显示算法切换 tab，可在多份实现间切换；activeId 指定初始高亮项。
  function open(id, activeId) {
    const ids = Array.isArray(id) ? id.filter(x => REG[x]) : [id];
    if (!ids.length || !REG[ids[0]]) { console.warn("CppView: 未注册的代码 id:", id); return; }
    injectStyle();
    let cur = activeId && ids.includes(activeId) ? activeId : ids[0];
    const multi = ids.length > 1;

    const mask = document.createElement("div");
    mask.className = "cppview-mask";
    const tabsHTML = multi
      ? `<div class="cppview-tabs">${ids.map(x =>
          `<button class="cppview-tab${x === cur ? " active" : ""}" data-id="${x}">${REG[x].tab || REG[x].title || x}</button>`).join("")}</div>`
      : "";
    mask.innerHTML = `
      <div class="cppview-modal" role="dialog" aria-modal="true">
        <div class="cppview-head">
          <h3></h3>
          <button class="cppview-copy">复制代码</button>
          <button class="cppview-close" title="关闭">×</button>
        </div>
        ${tabsHTML}
        <div class="cppview-body"><pre><code></code></pre></div>
      </div>`;
    document.body.appendChild(mask);

    const h3 = mask.querySelector(".cppview-head h3");
    const codeEl = mask.querySelector(".cppview-body code");
    const render = () => {
      const entry = REG[cur];
      h3.textContent = entry.title || "C++ 参考实现";
      codeEl.innerHTML = highlight(entry.code);
      mask.querySelectorAll(".cppview-tab").forEach(t => t.classList.toggle("active", t.dataset.id === cur));
      mask.querySelector(".cppview-body").scrollTop = 0;
    };
    render();
    mask.querySelectorAll(".cppview-tab").forEach(t => t.onclick = () => { cur = t.dataset.id; render(); });

    const close = () => mask.remove();
    mask.addEventListener("click", e => { if (e.target === mask) close(); });
    mask.querySelector(".cppview-close").onclick = close;
    const onEsc = e => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", onEsc); } };
    document.addEventListener("keydown", onEsc);
    const copyBtn = mask.querySelector(".cppview-copy");
    copyBtn.onclick = async () => {
      const codeText = REG[cur].code;
      try {
        await navigator.clipboard.writeText(codeText);
      } catch (_) {
        // 回退：用临时 textarea
        const ta = document.createElement("textarea"); ta.value = codeText;
        ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta);
        ta.select(); try { document.execCommand("copy"); } catch (e2) {} ta.remove();
      }
      copyBtn.textContent = "已复制 ✓"; copyBtn.classList.add("ok");
      setTimeout(() => { copyBtn.textContent = "复制代码"; copyBtn.classList.remove("ok"); }, 1600);
    };
  }

  window.CppView = {
    register(map) { Object.assign(REG, map); },
    open,
    // 生成一个按钮元素（不自动插入）
    button(id, label) {
      injectStyle();
      const b = document.createElement("button");
      b.className = "cppview-btn"; b.textContent = label || "查看 C++ 代码";
      b.onclick = () => open(id);
      return b;
    },
  };

  // 页面加载即注入样式，让右上角悬浮定位立刻生效（避免按钮先在原位、点击后才跳位）
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectStyle);
  else injectStyle();
})();
