# Kuromi ($KUROMI)

Static one-page meme-coin site. No build step: Vercel serves `index.html` directly (`vercel.json`).

- Hand-built for this folder. `site.json` holds the inputs.
- Contract address: **TBA**. Every copy button stays disabled until you change one line.
- Community: X only, [https://x.com/kuromionsol_x](https://x.com/kuromionsol_x). There is no Telegram link.
- Chain: Solana. No supply, liquidity, tax, pair, or chart figures are claimed. Those rows say TBA.
- No domain was provided, so none is configured here.

From this folder:

```
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Turn the contract on

In `js/main.js`, replace the TBA value:

```js
const CONTRACT = "TBA";
```

Put the mint address in that string. Every `CA:` label updates and every copy button enables. Leave it as `TBA` and the buttons stay disabled.

When a pool exists, set `BUY_URL` in the same file. Empty keeps the buy buttons on the how-to-buy section of this page.

## Assets

`assets/logo.png` and `assets/banner.png` are the files as supplied. Derived from them:

- `assets/character.png` — the logo with the white backdrop removed (the body stays white)
- `assets/favicon-32.png` and `assets/apple-touch.png`
- `assets/og.png` — the banner fitted to a 1200×630 card

Fredoka and Nunito are self-hosted under the SIL Open Font License. Notices are in `assets/fonts/`.

## Deploy

This repo holds several sites. Each one is its own Vercel project with Root Directory set to that folder (`anthropic`, `aaa`, `ant`). There is no root `vercel.json`, so adding `kuromi/` does not deploy by itself.

Create a new Vercel project from this repo, set Root Directory to `kuromi`, and add a domain when you have one. No domain was specified for this token.
