/* 共享「查看 C++ 代码」组件：弹窗 + 一键复制。
   用法：CppView.register({ 算法id: { title, code }, ... })，
   再 CppView.button(算法id) 生成一个按钮元素，或 CppView.open(算法id) 直接打开。 */
(function () {
  const REG = {};

  // 注入一次样式
  function injectStyle() {
    if (document.getElementById("cppview-style")) return;
    const css = `
      .cppview-btn {
        padding: 9px 16px; border: 1px solid #00f0ff; border-radius: 4px;
        background: rgba(0,240,255,0.08); color: #00f0ff; font-size: 13px;
        letter-spacing: 1px; cursor: pointer; text-transform: uppercase;
        font-family: "SF Mono", Menlo, monospace; transition: all .18s; white-space: nowrap;
      }
      .cppview-btn:hover { background: #00f0ff; color: #05060f; box-shadow: 0 0 16px rgba(0,240,255,.6); }
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

  function open(id) {
    const entry = REG[id];
    if (!entry) { console.warn("CppView: 未注册的代码 id:", id); return; }
    injectStyle();
    const mask = document.createElement("div");
    mask.className = "cppview-mask";
    mask.innerHTML = `
      <div class="cppview-modal" role="dialog" aria-modal="true">
        <div class="cppview-head">
          <h3>${entry.title || "C++ 参考实现"}</h3>
          <button class="cppview-copy">复制代码</button>
          <button class="cppview-close" title="关闭">×</button>
        </div>
        <div class="cppview-body"><pre><code>${highlight(entry.code)}</code></pre></div>
      </div>`;
    document.body.appendChild(mask);
    const close = () => mask.remove();
    mask.addEventListener("click", e => { if (e.target === mask) close(); });
    mask.querySelector(".cppview-close").onclick = close;
    const onEsc = e => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", onEsc); } };
    document.addEventListener("keydown", onEsc);
    const copyBtn = mask.querySelector(".cppview-copy");
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(entry.code);
      } catch (_) {
        // 回退：用临时 textarea
        const ta = document.createElement("textarea"); ta.value = entry.code;
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
})();
