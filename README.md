# 小颖生日惊喜网页

这是一个可以直接部署到 GitHub Pages 的静态生日网页，无需后端、API 或构建工具。

## 文件结构

- `index.html`：页面结构
- `styles.css`：页面样式、响应式布局和背景效果
- `script.js`：倒计时、生日解锁、音乐播放、烟花和礼物卡逻辑
- `assets/images/`：桌面端和手机端背景图
- `assets/music/`：本地备用音乐文件

## 生日解锁

生日时间在 `script.js` 的 `pageConfig.birthday.date` 中配置。到达生日零点前，网页只显示首页；到达后点击“打开惊喜”会播放音乐并进入后续内容。

本地调试可以在地址后加：

```text
?preview=1
```

## 音乐

当前音乐地址在 `script.js` 的 `pageConfig.birthdaySong` 中配置，使用 jsDelivr 加载 GitHub 仓库里的生日歌：

```js
birthdaySong: "https://cdn.jsdelivr.net/gh/SXS14656/love-web@main/assets/music/happy-birthday.mp3"
```

浏览器不允许自动播放声音，所以音乐会在用户点击“打开惊喜”后开始播放。

## 天猫超市卡

礼物卡信息在 `script.js` 的 `pageConfig.giftCard` 中配置：

```js
giftCard: {
  unlockCode: "0226",
  cardNumber: "3101300269912365699",
  cardPassword: "..."
}
```

注意：GitHub Pages 是公开网页，前端代码里的内容不是真正加密，只适合作为轻量惊喜。

## 部署

把第一版网页同步到仓库根目录后提交并推送：

```powershell
git add index.html styles.css script.js README.md .nojekyll assets
git commit -m "Update birthday page"
git pull --rebase origin main
git push origin main
```
