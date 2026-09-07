# AGENTS.md — Algorithm Visualizations 项目指南

面向后续会话的 AI agent。目的：快速理解本项目结构与约定，避免重复踩坑。
本文件基于对仓库的实际读取整理，若与代码冲突以代码为准。

## 项目是什么

算法与数据结构的**可视化演示门户**（纯前端、中文界面）。每个算法一个独立 HTML 页面，
分步动画演示（自动播放 / 单步），配主题切换与 C++ 参考代码弹窗。面向教学。

- **技术栈**：纯静态 HTML + 原生 JS + CSS。**无构建、无框架、无依赖、无 npm**。直接浏览器打开。
- **仓库**：git@github.com:Hanwei-fan/Algorithm-Visualizations.git，主分支 `main`。
- **本地预览**：`.claude/launch.json` 配了 `algoviz` 服务 = `python3 -m http.server 8971`。
  用 preview_start(name="algoviz") 启动，访问 `http://localhost:8971/demos/<x>.html`。

## 目录结构

```
index.html            门户首页：SECTIONS 数组注册所有演示，JS 动态渲染卡片
demos/*.html          46 个演示，每个是自包含单文件（内联 <style> + <script>）
assets/theme.js       共享：4 套主题 + 右上角主题切换器（所有页面末尾引入）
assets/cppview.js     共享：C++ 代码查看弹窗（需要的页面引入）
img/                  背景图等
README.md
```

## 共享约定（新建演示务必遵守）

### 1. 页面骨架
拷贝一个近期演示（推荐 `demos/bignum.html` 或 `two-pointer.html`）作模板。标准结构：
- `<head>` 内联 `<style>`，开头 `:root` 定义主题 CSS 变量（见下）。
- `<body>`：`<header>`(h1+p) → `<a class="back">← 返回门户` → 可选 `.tabs` → `.controls` → `<main>`(左右两 `.card`) → `.note`。
- 文件末尾按顺序引入：
  ```html
  <script src="../assets/cppview.js"></script>
  <script> ...页面逻辑... </script>
  <script src="../assets/theme.js"></script>
  ```

### 2. 主题系统（assets/theme.js）
- 4 套主题，`ORDER = ["cyber","ocean","sepia","light"]`，localStorage 键 `algoviz-theme`。
  - cyber(赛博朋克·深)、ocean(深空蓝·深)、sepia(护眼米·浅)、light(极简白·浅)。
- 主题通过 CSS 变量注入：`--bg --panel --border --text --muted --cyan --magenta --yellow --green --grid --node-fill`。
- 页面里**一律用这些变量**，不要写死颜色。`:root` 里给一份 cyber 默认值即可，theme.js 会覆盖。
- theme.js 对浅色主题有一段 lightfix：把写死的 `#fff` 文字、深色输入框底等重映射为主题色。

### 3. 配色硬规则（踩过坑，务必遵守）
- **节点/格子等填充必须不透明、且随主题自适应**。用：
  `fill: color-mix(in srgb, var(--强调色) N%, var(--node-fill));`（N 常取 26~36）。
  **不要用半透明 `rgba(...,0.2)`**——浅色主题下会透出背景、且与文字对比不足。
- 文字用 `var(--text)`（浅底自动深字、深底自动亮字）。仅在**饱和纯色**填充上才配白字 `#fff`。
- 强调色→变量映射：绿=`var(--green)` 黄=`var(--yellow)` 洋红=`var(--magenta)` 青=`var(--cyan)`；
  紫无变量用 `#a06bff`、橙用 `#ff7a45`。
- SVG 里边(edge)先画、节点后画，保证节点覆盖在边之上。

### 4. 分步引擎模式（几乎所有演示通用）
`genXxxSteps(...)` 生成一个扁平的 step 快照数组 → `draw(k)` 渲染第 k 步 → 引擎控制播放：
```js
let steps=[], idx=0, timer=null, running=false;
function stepOnce(){ if(idx<steps.length-1){idx++;draw(idx);} if(idx>=steps.length-1) endRun(); }
function playAll(){ stopTimer(); const spd=1400-parseInt($("speedInput").value,10);
  timer=setInterval(()=>{ if(idx<steps.length-1){idx++;draw(idx);} else endRun(); }, spd); }
function stopTimer(){ if(timer){clearInterval(timer);timer=null;} }
```
每个 step 是一个对象（含当前高亮位置、辅助状态、`desc` 文字说明、`done` 标记）。参考 `demos/factorize.html`。

### 5. 多场景 tab（一个文件多算法）
`<div class="tabs"><div class="tab" data-scene="xxx">...</div></div>` +
`switchScene(sc)` 切换 + body class `scene-xxx` 控制输入显隐（`.scene-xxx-only` CSS）。
参考 `demos/bignum.html`（加减乘除 tab + 数学/编程视角切换）。

### 6. C++ 代码弹窗（assets/cppview.js）
```js
CppView.register({ 算法id: { title: "...— C++", code: `...` }, ... });
$("cppBtn").onclick = () => CppView.open("算法id");   // 多场景可传当前场景对应 id
```
按钮 HTML：`<button class="cppview-btn" id="cppBtn">查看 C++ 代码</button>`。

### 7. 门户注册（index.html）
在 `index.html` 的 `SECTIONS` 数组里对应板块的 `items` 加一项（板块不存在则新增板块对象）：
```js
{ icon:"🔢", tag:"分类标签", title:"卡片标题", file:"xxx.html", ready:true,
  desc:"一句话介绍……含 C++。" }
```

**排序规则（务必遵守，新增项也按此排）**：门户按**知识点难度 / 拓扑依赖**从易到难排列，分两层：
1. **板块之间**：SECTIONS 数组顺序 = 学习路径。当前基准顺序（新增板块按难度梯度插入合适位置，别直接追加到末尾）：
   `search(查找与排序) → linear → hash → twopointer → string → math → greedy → tree → range → graph → advanced → geo → interactive`
   （基础查找排序/线性结构 → 基础技巧 → 需要更多前置的树/区间/图 → 高级范式 DP → 综合几何/真题）
   注：查找与排序已合并为一个板块 id="search"（含顺序/二分查找 + 排序算法），原独立的 sort 板块已并入。
2. **板块内部**：`items` 从易到难、有前置关系的排前面。例如：
   - range：前缀和差分 → 树状数组 → 线段树
   - math：高精度 → 质数筛法 → 质因数分解
   - tree：二叉树遍历 → BST → 堆 → 并查集 → Huffman（Huffman 依赖堆）
   - graph：图的存储 → 遍历 → 迷宫/洪水填充 → 拓扑 → 欧拉 → 最短路 → Floyd → MST → TSP → 哈密顿路径/回路
     （注：TSP / 哈密顿虽用回溯+状压 DP 求解，但归类到「图论」而非 DP 板块——按问题域归类）
   - advanced(板块标题为「动态规划（DP）」)：序列 → 背包 → 二维 → 区间 → 状压

新增演示时，先判断它的难度与前置知识，插到板块内正确位置；新增板块同理插到 SECTIONS 正确位置——**不要**图省事直接加到末尾。

## 现有演示清单（demos/，46 个；按门户板块归类）

- search(查找与排序)：binary-search, sequential-search, sorting
- linear(线性结构)：linked-list, stack, queue
- hash(哈希)：hash-table
- twopointer(双指针/滑动窗口)：two-pointer(对撞:两两分组/回文), fast-slow(快慢指针·判环), sliding-window(4 场景)
- string(字符串)：kmp, trie, manacher
- math(数论/数学)：sieve, factorize, bignum(高精度加减乘除·数学/编程双视角)
- greedy(贪心)：greedy(分数背包), interval-greedy(最大不相交区间/最少区间覆盖)
- tree(树)：binary-tree, bst, heap, union-find, huffman, trie(也算字符串)
- range(区间数据结构)：prefix-diff(前缀和/差分), fenwick(树状数组), segment-tree, sparse-table(ST 表)
- graph(图论)：graph-storage, graph-traversal, maze, flood-fill, topo-sort, euler, shortest-path, floyd, mst, tsp, hamilton
- advanced(动态规划 DP)：dp(序列/背包/二维·带 ?kind= 参数), interval-dp, state-dp
- geo(几何/扫描线)：scanline, points2d
- interactive(交互式)：hanoi, water-jug, river-crossing

近期新增（可作复杂交互模板）：
- `tsp.html` / `hamilton.html`：画布点空白建点、SVG 有向路径高亮(线在下、箭头+步序号在上、边权 chip 偏一侧)、
  **锁定状态机**(「开始/重演」在 编辑态↔演示态 间切换：编辑态可加点/连边/改边权，锁定态只播放)、
  完全图边权可点击就地编辑、**多解法/多问题双层 tab**、状压 DP 表 + 集合⇔二进制⇔整数位可视化。
  验证时用「回溯 vs 状压DP 对拍」跑上百组随机图确认结论一致。
- 随机图布局防标签重叠：生成 K 个候选布局取「边权中点两两最小间距最大」者（见 tsp/hamilton 的 ringLayout+minLabelSep）。

## 工作方式约定（用户偏好，重要）

- **改动完成后自动 commit + push**，无需逐次征求同意。commit message 用中文、`type(范围): 说明` 格式（见 git log 风格）。
- **大改动先进 plan mode**：新建演示 / 拆分重构等，先用 EnterPlanMode 梳理、AskUserQuestion 对齐范围，ExitPlanMode 批准后再动手。
- 回复用中文。

## 验证纪律（务必遵守，这是过去反复出问题的地方）

1. **只根据工具的真实返回说话**。没运行的工具不写它的结果；返回什么贴什么，不润色、不脑补、不预测。
2. **"看排版" = 必须截图**（preview_screenshot）亲眼确认，**不能用 eval 读 DOM 代替"看"**。
3. **"查数值/逻辑" = 用纯函数 eval** 核对（在已 navigate 到目标页后调用 gen 函数），并只报真实返回。
4. 视觉结论必须有截图支撑；否则明说"尚未确认"。把"我看到的"和"我推断的"分开讲。
5. 声称"能用/正确"前，验证手段要匹配声明（排版看图、数值跑 eval）。
6. preview_screenshot 若连续超时/空白 → 是截图侧卡住，**重启预览服务**（preview_stop + preview_start）恢复，**不空转重试**；页面本身可用 eval 确认是否响应。
7. 浏览器可能缓存旧 HTML：navigate 时加 `?v=`+Date.now() 强制取新版。

## 当前进度（最新状态以 `git log` 为准）

- 已全部完成并推送：fast-slow、sliding-window、graph-storage、prefix-diff、sparse-table、
  tsp、hamilton，均已注册门户卡片并跑过 eval/对拍/截图验证。工作树干净。
- **下一步任务（用户已提出，尚未开始）**：新建**矩阵运算**演示 `demos/matrix-ops.html`（暂定名），
  含 **矩阵转置 / 矩阵加法 / 矩阵减法 / 矩阵乘法** 四种运算，用多场景 tab 切换（见「多场景 tab」约定）。
  实现要点建议：
  - 矩阵元素**可编辑**（点格子改数值，参考 tsp 边权就地编辑的 foreignObject 输入框做法）；
  - **分步高亮**：乘法逐个算 c[i][j]，高亮 A 的第 i 行 × B 的第 j 列并展示累加过程；
    加/减法逐格对应高亮；转置演示行列互换。用通用分步引擎（steps 数组 + draw(k)）。
  - 维度校验：加减需同型、乘法需 A 列 = B 行，给出友好提示。
  - 归类到 **math(数论/数学)** 板块（矩阵是数学工具）；补一份或多份 C++ 弹窗；注册门户卡片。
  - 完成后照例：数值 eval 核对 + 截图看排版 + commit&push。
