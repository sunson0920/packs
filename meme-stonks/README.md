# Meme Stonks

Static one-page meme-token site. No build step: Vercel serves `index.html` directly (`vercel.json`).

- Hand-built for this folder. `site.json` holds the inputs.
- Contract address: **TBA**. The copy button answers “Still TBA” and does not write anything to the clipboard until you change one line.
- Chain: **Solana**. Buy steps name Phantom or Solflare, SOL, and a swap on Jupiter, Raydium, or pump.fun once the contract is live.
- Ticker, supply, tax, X, and Telegram were not provided. Every one of them says TBA. This page does not invent a symbol, a number, or a social link.
- The scrolling tape and the chart are the joke on the artwork. They are not prices or market data.
- No domain was provided, so none is configured here.

From this folder:

```
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`. Opening `index.html` directly also works.

## Turn the contract on

In `js/main.js`, replace the TBA value:

```js
const CONTRACT = "TBA";
```

Put the address in that string. Every contract label updates, and every copy button copies it. Leave it as `TBA` and a click only reports that the address is still TBA.

When a pool exists, set `BUY_URL` in the same file. Empty keeps the buy buttons on the how-to-buy section of this page.

When an X or Telegram link exists, put it on the community cards in `index.html`. Do not guess a handle.

## Assets

`assets/logo.png` and `assets/banner.png` are the files as supplied. Derived from them:

- `assets/favicon-32.png` and `assets/apple-touch.png` — the logo
- `assets/og.png` — the banner fitted on a 1200×630 card
- `assets/gallery/` — crops of the logo and the banner (face, arrow, suit, board, wordmark)

Fraunces, Outfit, and IBM Plex Mono are self-hosted under the SIL Open Font License. Notices are in `assets/fonts/`.

## Deploy

This repo holds several sites. Each one is its own Vercel project with Root Directory set to that folder. There is no root `vercel.json`, so adding `meme-stonks/` does not deploy by itself.

Create a new Vercel project from this repo, set Root Directory to `meme-stonks`, and add a domain when you have one. No domain was specified for this token.
