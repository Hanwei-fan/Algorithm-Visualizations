# 算法可视化演示 · Algorithm Visualizations

一组交互式、赛博朋克风格的算法教学演示，纯前端实现，零依赖，可直接在浏览器中打开。面向 CSP-J/S 等信息学初赛的算法教学。

> A set of interactive, cyberpunk-styled algorithm teaching demos. Pure front-end, zero dependencies, runs directly in the browser.

## 在线预览

访问：`https://hanwei-fan.github.io/Algorithm-Visualizations/`

或克隆到本地后，用浏览器打开 `index.html` 即可（无需任何构建或服务器）。

## 包含的演示

| 演示 | 文件 | 内容 |
| --- | --- | --- |
| 🔍 查找算法 | `demos/search.html` | 顺序查找 / 二分查找，可切换，逐格高亮比较，对比效率 |
| 🗼 汉诺塔 | `demos/hanoi.html` | 递归自动演示 + 手动挑战模式（点击柱子移盘、悔棋、胜利检测） |
| 🌲 二叉树遍历 | `demos/binary-tree.html` | 前/中/后序遍历（含回溯），以及由前序+中序、后序+中序分步还原二叉树 |
| 🕸️ 图遍历 | `demos/graph-traversal.html` | DFS（栈实现 / 递归实现，含回溯与调用栈）与 BFS，支持随机生成连通图 |
| 🧭 拓扑排序 | `demos/topo-sort.html` | Kahn 算法自动演示 + 手动点击确定拓扑序，节点随边消失，支持随机生成 DAG |
| 🔗 单链表 | `demos/linked-list.html` | 带头结点：头插/尾插建表、查找、按位序插入与删除，指针遍历动画 |

`index.html` 是门户页，按**知识板块**（查找 / 排序 / 线性结构 / 树结构 / 图论 / 递归与动态规划）分区导航到各演示。

## 目录结构

```
.
├── index.html          门户页（按板块分组的卡片导航）
├── demos/              各演示页（每个是零依赖的单文件 HTML）
│   ├── search.html
│   ├── hanoi.html
│   ├── binary-tree.html
│   ├── graph-traversal.html
│   ├── topo-sort.html
│   └── linked-list.html
├── README.md
└── LICENSE
```

## 特性

- **纯静态**：单个 HTML 文件即一个完整演示，内联 CSS + JavaScript，无外部依赖、无构建步骤。
- **交互式**：大多支持「自动播放 / 单步 / 重置」和速度调节，部分支持手动操作与随机生成数据。
- **教学导向**：同步高亮伪代码、数据结构（栈/队列/调用栈）状态、以及每一步的文字说明。

## 本地运行

```bash
git clone https://github.com/<用户名>/<仓库名>.git
cd <仓库名>
# 直接用浏览器打开 index.html，或起一个本地静态服务器：
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

## 添加新演示

1. 在 `demos/` 下新建 `your-demo.html`（可复用现有演示的赛博朋克配色变量），页内「返回门户」链接写 `../index.html`。
2. 在 `index.html` 的 `SECTIONS` 数组里，找到对应板块的 `items` 加一项：`file` 只写文件名（如 `your-demo.html`，门户会自动加 `demos/` 前缀），`ready` 设为 `true`。
3. 若属于新的知识板块，则在 `SECTIONS` 里新增一个 `{ id, icon, title, desc, items: [...] }` 对象，导航栏会自动生成对应入口。

未完成的演示可先加占位项并设 `ready: false`，门户会显示为「敬请期待」灰色卡片。

## 技术栈

原生 HTML / CSS / JavaScript，图形部分使用内联 SVG。无框架、无打包工具。

## License

[MIT](LICENSE)
