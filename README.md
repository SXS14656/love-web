# LFY Birthday Surprise

Static GitHub Pages birthday page from CZG to LFY.

## Add Music

1. Put MP3 files in `assets/music/`.
2. Open `script.js`.
3. Update `pageConfig.birthdaySong`:

```js
birthdaySong: "assets/music/happy-birthday.mp3"
```

Browsers block autoplay, so music starts after the visitor clicks `打开惊喜`.

## Gift Card

Open `script.js` and update `pageConfig.giftCard`:

```js
giftCard: {
  unlockCode: "0728",
  cardNumber: "your-card-number",
  cardPassword: "your-card-password"
}
```

This is only a light surprise lock. GitHub Pages is public, so do not treat frontend code as secure storage.

## Deploy

Push this folder as the root of a GitHub repository and enable GitHub Pages from the repository settings.
