# 算法可视化演示 · Algorithm Visualizations

一组交互式、赛博朋克风格的算法教学演示，纯前端实现，零依赖，可直接在浏览器中打开。面向 CSP-J/S 等信息学初赛的算法教学。

> A set of interactive, cyberpunk-styled algorithm teaching demos. Pure front-end, zero dependencies, runs directly in the browser.

## 在线预览

启用 GitHub Pages 后访问：`https://<用户名>.github.io/<仓库名>/`

或克隆到本地后，用浏览器打开 `index.html` 即可（无需任何构建或服务器）。

## 包含的演示

| 演示 | 文件 | 内容 |
| --- | --- | --- |
| 🔍 查找算法 | `search.html` | 顺序查找 / 二分查找，可切换，逐格高亮比较，对比效率 |
| 🗼 汉诺塔 | `hanoi.html` | 递归自动演示 + 手动挑战模式（点击柱子移盘、悔棋、胜利检测） |
| 🌲 二叉树遍历 | `binary-tree.html` | 前/中/后序遍历（含回溯），以及由前序+中序、后序+中序分步还原二叉树 |
| 🕸️ 图遍历 | `graph-traversal.html` | DFS（栈实现 / 递归实现，含回溯与调用栈）与 BFS，支持随机生成连通图 |
| 🧭 拓扑排序 | `topo-sort.html` | Kahn 算法自动演示 + 手动点击确定拓扑序，节点随边消失，支持随机生成 DAG |
| 🔗 单链表 | `linked-list.html` | 带头结点：头插/尾插建表、查找、按位序插入与删除，指针遍历动画 |

`index.html` 是门户页，以卡片形式导航到各演示。

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

1. 在仓库根目录新建 `your-demo.html`（可复用现有演示的赛博朋克配色变量）。
2. 在 `index.html` 顶部的 `DEMOS` 数组里加一项，把 `file` 指向新文件、`ready` 设为 `true`。

## 技术栈

原生 HTML / CSS / JavaScript，图形部分使用内联 SVG。无框架、无打包工具。

## License

[MIT](LICENSE)
