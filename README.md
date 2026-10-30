# 论文项目主页 — Online iLQR-MPC with Whole-Body Control

<!--
静态单页站点,零依赖、零构建、零追踪脚本。直接双击 `index.html` 就能看,也可以原样丢到
GitHub Pages / 任意静态托管上。

---

## 1. 视频目录与命名

页面实际播放的是 `videos/` 里已压好的 mp4;`视频/` 是原始导出文件,只作存档,不参与网页。
两处文件一一对应,只是命名不同:
-->

| Scenario | Direction | Loaded by page (`videos/`) | Source file (`视频/`) | Page badge |
|---|---|---|---|---|
| Steady-state walking | Forward | `steady-walk.mp4` | `steady-walk.mp4` | 0.1 m/s |
| Gait, top-down | — | `steady-topdown.mp4` | `steady-topdown.mp4` | TOP-DOWN |
| Forward push | +x | `pushxp.mp4` | `push-x-pos.mp4` | +x 245 N |
| Backward push | −x | `pushxn.mp4` | `push-x-neg.mp4` | −x 205 N |
| Right-to-left push | +y | `pushyp.mp4` | `push-y-pos.mp4` | +y 80 N |
| Left-to-right push | −y | `pushyn.mp4` | `push-y-neg.mp4` | −y 175 N |
| Oblique push | +x+y | `pushxpyp.mp4` | `push-xy-pos.mp4` | +x+y 130+50 N |
| Oblique push | −x−y | `pushxnyn.mp4` | `push-xy-neg.mp4` | −x−y 130+50 N |
| Force + torque | +x, τz | `pushxpztorque.mp4` | `push-x-torque.mp4` | +x 100 N, τz 30 N·m |

<!--

`videos/` 的短名规则:去掉连字符,`pos` → `p`,`neg` → `n`。例如
`push-x-pos` → `pushxp`,`push-xy-neg` → `pushxnyn`。

换视频或改文件名时,只需同步 `data/videos.js` 里对应条目的 `src`;`poster` 是封面,
`badge` 是左上角角标。文件缺失时页面会退回显示 `img/` 里的封面。

### 转码

`videos/` 里的文件已按下面参数压过(每条约 2–3 MB)。重新导出原始视频后照此转码:

```bash
ffmpeg -i 视频/push-x-pos.mp4 \
  -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 23 -vf "scale=-2:720" \
  -movflags +faststart \
  videos/pushxp.mp4
```

- **`+faststart` 不能省**,否则要下完整个文件才能播。
- 单条控制在 **3–5 MB**。
- 页面已设 `muted` + `playsinline` + `loop`,滚入自动播放、滚出自动暂停。

---

## 2. 本地预览

直接双击 `index.html` 即可(所有资源都是相对路径,`file://` 下正常工作)。

需要局域网给合作者看,起个静态服务器:

```bash
python3 -m http.server 8000
# 然后打开 http://localhost:8000
```

---

## 3. 部署到 GitHub Pages

```bash
cd humanoid-project-page
git init && git add -A && git commit -m "Project page"
git branch -M main
git remote add origin git@github.com:<你>/<仓库名>.git
git push -u origin main
# 然后在仓库 Settings → Pages 里把 Source 选成 main / (root)
```

访问 `https://<你>.github.io/<仓库名>/`。

**体积注意**:GitHub Pages 的软限制是单文件 100 MB、站点 1 GB、月流量 100 GB。
`videos/` 里 9 条视频共约 23 MB,没问题。真超了就把 mp4 挂到
GitHub Releases 或 Cloudflare R2,只把 HTML 留在 Pages 上。

---

## 4. 投稿前必查(双盲)

- [ ] 页面上**没有**作者名、单位、致谢、GitHub 链接 —— 现在是 "Anonymous Authors",
      录用后再改 `index.html` 里 `TODO(投稿前)` 那一段
- [ ] `videos/*.mp4` 画面里没有机器人机身 logo、实验室标识、屏幕上的用户名
- [ ] `img/*.png` 封面里没有可识别信息
- [ ] `#pdfLink` / `#arxivLink` / `#codeLink` 三个按钮的 `href` 现在都是 `#`,
      投稿时要换成匿名链接(如 anonymous.4open.science)
- [ ] `index.html` 底部的 BibTeX 换成正式条目
- [ ] 页面无任何第三方请求(现在确实没有:字体走系统栈,无 CDN、无统计脚本)

---

## 5. 改视觉

- 配色、间距、圆角全部集中在 `assets/style.css` 顶部的 CSS 变量里,改一处全站生效。
  配色遵循 dataviz 参考调色板,浅色/深色是**各自独立挑选**的色阶,不是简单反色。
- 右上角有主题切换按钮,跟随系统偏好,选择存在 localStorage。
- 图表数据在 `data/videos.js` 的 `charts` 字段;柱状图是手写 HTML/CSS,没有引入图表库。

## 6. 改占位封面

`img/*.svg` 是可编辑的源文件,`img/*.png` 是页面实际加载的位图
(**Chromium 不接受 SVG 作为 `<video poster>`**,所以必须转成 PNG)。

改完 SVG 后重新光栅化:

```bash
python3 make_posters.py   # 重新生成 SVG
./make_posters.sh         # SVG → PNG(headless Chrome/Edge 光栅化)
```

需要真实画面时,可以用视频首帧替换占位 PNG:

```bash
ffmpeg -i 视频/push-x-pos.mp4 -vf "select=eq(n\,0)" -frames:v 1 img/push-x-pos.png
```

---

## 7. 论文插图

`img/fig-architecture.svg`、`img/fig-tracking.svg` 是预留的图位,当前 `index.html` 没有嵌入。
需要放论文图时,用 `make_figure.py` 把 PDF 页转成 PNG:

```bash
python3 make_figure.py <论文图.pdf> img/<名字>.png
```

页面里的图片统一用 PNG(`<video poster>` 不支持 SVG)。

---

## 文件结构

```
humanoid-project-page/
├── index.html              页面结构 + 全部正文文案
├── data/videos.js          ★ 视频清单、角标、图表数值(最常改)
├── videos/                 ★ 页面实际加载的压缩视频(短名:pushxp.mp4 等)
├── 视频/                   原始导出视频(可读名:push-x-pos.mp4 等,不参与部署)
├── assets/
│   ├── style.css           全部样式,配色变量在顶部
│   └── app.js              播放器、图表渲染、导航、主题切换
├── img/                    视频封面(png 实际加载,svg 为源文件);teaser.* 暂未使用
├── _backup_20261010/       改动前的 index.html / videos.js 备份
├── make_posters.py         生成占位封面 SVG
├── make_posters.sh         封面 SVG → PNG 光栅化
├── make_figure.py          论文 PDF 图 → 网页 PNG
├── .nojekyll               关闭 GitHub Pages 的 Jekyll 处理
├── .gitignore              忽略 .DS_Store、__pycache__、*.pyc
└── README.md               本文件
```

## 已实现的交互

| 功能 | 说明 |
|---|---|
| 滚入自动播放 / 滚出暂停 | IntersectionObserver,带迟滞避免临界抖动 |
| 慢放 0.25× / 0.5× / 1× | 接触瞬态和恢复动作在 1× 下看不清,这个最常用 |
| 点击播放/暂停,空格 / K 也可 | 卡片内键盘可达 |
| 全屏 | 原生 Fullscreen API,全屏时 `object-fit: contain` 不裁切 |
| 缺失视频回退 | mp4 不存在时自动显示封面,不出现破图 |
| 减少动效 | `prefers-reduced-motion` 下不自动播放,直接给原生控件 |
| 响应式 | 桌面双栏 / 平板单栏 / 手机可用 |

-->
