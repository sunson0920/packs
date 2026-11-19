/* =====================================================================
   $ANT - site config. Edit these values, nothing else needs to change.
   ===================================================================== */
const TOKEN_NAME = 'Anthropic';
const TICKER = '$ANT';
const CHAIN = 'Ethereum';
const CONTRACT_ADDRESS = '0xd8aa2557e62c508a8e167b711bab4172b74bc5d6'; // required: shown in every CA box
// Exact buy link used by every Buy button. Leave '' to auto-build from CONTRACT_ADDRESS.
const BUY_URL = 'https://app.uniswap.org/swap?chain=mainnet&inputCurrency=NATIVE&outputCurrency=0xd8aa2557e62c508a8e167b711bab4172b74bc5d6';
// Chart link. Leave '' to auto-build from CONTRACT_ADDRESS.
const CHART_URL = 'https://dexscreener.com/ethereum/0x4fc4c9e786c60886bf38b858465cc1b071e08ac57ae18d202b99c84f948c3e94';
const X_URL = 'https://x.com/anthropiceth_x';
const TG_URL = 'https://t.me/anthropiceth_tg';

// Gallery: files live in assets/gallery/. Post sources + view counts are recorded in README.md.
const GALLERY = [
  { src: 'assets/gallery/ant-01.webp', caption: 'Party went a little too hard', w: 1400, h: 1050 },
  { src: 'assets/gallery/ant-02.webp', caption: 'Antsolute cinema', w: 1400, h: 1085 },
  { src: 'assets/gallery/ant-03.webp', caption: 'Colony on deck', w: 1400, h: 788 },
  { src: 'assets/gallery/ant-04.webp', caption: 'Tell the ants', w: 1400, h: 788 },
  { src: 'assets/gallery/ant-05.webp', caption: 'Me and bro, waiting', w: 1400, h: 582 },
  { src: 'assets/gallery/ant-06.webp', caption: 'Next stop: the moon', w: 959, h: 959 },
  { src: 'assets/gallery/ant-07.webp', caption: 'The ants take the trading floor', w: 896, h: 1195 },
  { src: 'assets/gallery/ant-08.webp', caption: 'Summit season', w: 1050, h: 1400 },
];
/* ===================================================================== */

(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const CA = (CONTRACT_ADDRESS || '').trim();
  const buyUrl = BUY_URL || (CA ? `https://app.uniswap.org/swap?outputCurrency=${CA}&chain=mainnet` : 'https://app.uniswap.org/');
  const chartUrl = CHART_URL || (CA ? `https://dexscreener.com/ethereum/${CA}` : '');

  /* ---------- links + CA ---------- */
  $$('[data-buy-link]').forEach(a => a.href = buyUrl);
  $$('[data-x-link]').forEach(a => a.href = X_URL);
  $$('[data-tg-link]').forEach(a => a.href = TG_URL);
  $$('[data-x-handle]').forEach(el => el.textContent = '@' + X_URL.replace(/\/+$/, '').split('/').pop());
  $$('[data-chain]').forEach(el => el.textContent = CHAIN);
  $$('[data-chart-link]').forEach(a => {
    if (chartUrl) a.href = chartUrl;
    else { a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); a.style.opacity = .45; a.title = 'Chart coming soon'; }
  });
  const caText = CA || 'TBA';
  $('#caValue').textContent = caText;
  $$('[data-ca-text]').forEach(el => el.textContent = caText);
  const copyBtns = [$('#caCopy'), ...$$('[data-copy-ca]')];
  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('is-on'), 1800); };
  copyBtns.forEach(b => {
    if (!CA) { b.disabled = true; return; }
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(CA); }
      catch { const ta = document.createElement('textarea'); ta.value = CA; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      b.classList.add('is-copied'); const s = b.querySelector('.ca__copy-text'); if (s) s.textContent = 'Copied';
      toast('Contract address copied');
      setTimeout(() => { b.classList.remove('is-copied'); if (s) s.textContent = 'Copy'; }, 1800);
    });
  });
  $('#year').textContent = new Date().getFullYear();
  document.title = `${TICKER} | ${TOKEN_NAME} - The Colony on ${CHAIN}`;

  /* ---------- nav ---------- */
  const nav = $('#nav'), toggle = $('#navToggle'), links = $('#navLinks');
  toggle.addEventListener('click', () => { const o = links.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', o); });
  links.addEventListener('click', e => { if (e.target.tagName === 'A') { links.classList.remove('is-open'); toggle.setAttribute('aria-expanded', false); } });
  const navMap = new Map($$('.nav__links a').map(a => [a.getAttribute('href').slice(1), a]));
  const secIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { navMap.forEach(a => a.classList.remove('is-active')); navMap.get(e.target.id)?.classList.add('is-active'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach(s => secIO.observe(s));

  /* ---------- gallery + lightbox ---------- */
  const grid = $('#galleryGrid');
  const antIcon = '<svg aria-hidden="true"><use href="#i-ant"/></svg>';
  if (GALLERY.length) {
    GALLERY.forEach((g, i) => {
      const b = document.createElement('button');
      b.className = 'gitem reveal'; b.type = 'button'; b.style.setProperty('--d', (i % 3) * 0.08 + 's');
      b.setAttribute('aria-label', `Open image: ${g.caption}`);
      b.innerHTML = `<img src="${g.src}" alt="${g.caption}" width="${g.w}" height="${g.h}" loading="lazy" decoding="async"><span class="gitem__cap"><span>${g.caption}</span><svg aria-hidden="true"><use href="#i-expand"/></svg></span>`;
      b.addEventListener('click', () => openLB(i));
      grid.appendChild(b);
    });
  } else {
    for (let i = 0; i < 6; i++) grid.insertAdjacentHTML('beforeend', `<div class="gitem placeholder reveal">${antIcon}</div>`);
  }
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let cur = 0, lastFocus = null;
  function show(i) { cur = (i + GALLERY.length) % GALLERY.length; const g = GALLERY[cur]; lbImg.src = g.src; lbImg.alt = g.caption; lbCap.textContent = `${g.caption}  ·  ${cur + 1} / ${GALLERY.length}`; }
  function openLB(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; requestAnimationFrame(() => lb.classList.add('is-open')); document.body.style.overflow = 'hidden'; $('#lbClose').focus(); }
  function closeLB() { lb.classList.remove('is-open'); setTimeout(() => lb.hidden = true, 250); document.body.style.overflow = ''; lastFocus?.focus(); }
  $('#lbClose').onclick = closeLB; $('#lbPrev').onclick = () => show(cur - 1); $('#lbNext').onclick = () => show(cur + 1);
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLB(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
    else if (e.key === 'Tab') { const f = $$('.lb__btn', lb); const idx = f.indexOf(document.activeElement); e.preventDefault(); f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
  });
  let sx = 0; lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });

  /* ---------- reveal + counters ---------- */
  const revIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); revIO.unobserve(e.target); } }), { threshold: 0.12 });
  $$('.reveal').forEach((el, i) => { if (!el.style.getPropertyValue('--d') && el.closest('.hero')) el.style.setProperty('--d', (i * 0.08) + 's'); revIO.observe(el); });
  const countIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; countIO.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const step = t => { const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 4))); el.textContent = v + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => reduce ? (el.textContent = el.dataset.count + (el.dataset.suffix || '')) : countIO.observe(el));

  /* ---------- magnetic buttons + coin tilt ---------- */
  if (finePointer && !reduce) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left - r.width / 2) * 0.3 + 'px'); b.style.setProperty('--my', (e.clientY - r.top - r.height / 2) * 0.4 + 'px'); });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
    const coin = $('#coin'), hero = $('.hero');
    hero.addEventListener('pointermove', e => { const r = coin.getBoundingClientRect(); const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight; coin.style.transform = `perspective(900px) rotateY(${dx * 24}deg) rotateX(${-dy * 24}deg)`; });
    hero.addEventListener('pointerleave', () => coin.style.transform = '');
  }

  /* ---------- tunnel dug by scrolling + depth meter + parallax ---------- */
  const tunnel = $('#tunnel'), maskP = $('.tunnel__mask'), wall = $('.tunnel__wall'), bore = $('.tunnel__bore'), pher = $('.tunnel__pher');
  const NS = 'http://www.w3.org/2000/svg';
  let samples = [], total = 0, walkers = [];
  function buildTunnel() {
    const W = document.documentElement.clientWidth, H = document.documentElement.scrollHeight;
    tunnel.setAttribute('width', W); tunnel.setAttribute('height', H); tunnel.style.height = H + 'px';
    tunnel.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const gutter = Math.max(18, (W - 1180) / 2);
    const xL = Math.max(14, gutter * 0.45), xR = W - xL;
    const dig = $('.hero__dig').getBoundingClientRect();
    const pts = [[W / 2, dig.bottom + scrollY + 6]];
    $$('[data-chamber]').forEach(s => {
      const r = s.getBoundingClientRect(), top = r.top + scrollY, side = s.dataset.chamber;
      const x = side === 'left' ? xL : side === 'right' ? xR : W / 2;
      pts.push([x, top + 40]); if (side !== 'center') pts.push([x, top + r.height * 0.75]);
    });
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], my = (y1 - y0) * 0.55;
      const wob = Math.sin(i * 1.7) * 30;
      d += ` C${x0 + wob},${y0 + my} ${x1 - wob},${y1 - my} ${x1},${y1}`;
    }
    [wall, bore, pher, maskP].forEach(p => p.setAttribute('d', d));
    total = bore.getTotalLength();
    samples = []; const N = 600;
    for (let i = 0; i <= N; i++) { const p = bore.getPointAtLength(total * i / N); samples.push(p.y); }
    [wall, bore, maskP].forEach(p => { p.style.strokeDasharray = `${total} ${total}`; });
    // walkers (little ants marching along the dug tunnel)
    walkers.forEach(w => w.el.remove()); walkers = [];
    if (!reduce) for (let i = 0; i < 14; i++) {
      const u = document.createElementNS(NS, 'use'); u.setAttribute('href', '#i-ant'); u.setAttribute('width', 14); u.setAttribute('height', 14);
      u.setAttribute('fill', '#e9a24a'); u.style.color = '#e9a24a'; tunnel.appendChild(u);
      walkers.push({ el: u, s: Math.random(), v: 0.00004 + Math.random() * 0.00004, dir: Math.random() < .5 ? 1 : -1 });
    }
    onScroll();
  }
  let dugLen = 0;
  function onScroll() {
    const y = scrollY, H = document.documentElement.scrollHeight - innerHeight;
    const p = H > 0 ? y / H : 0;
    nav.classList.toggle('is-scrolled', y > 40);
    document.documentElement.style.setProperty('--p', (p * 100) + '%');
    $('.depth__fill').style.setProperty('--p', (p * 100) + '%');
    $('#depthVal').textContent = Math.round(p * 100);
    // dig to the point currently 65% down the viewport
    const target = y + innerHeight * 0.65;
    let i = 0; while (i < samples.length - 1 && samples[i] < target) i++;
    dugLen = reduce ? total : total * (i / (samples.length - 1));
    if (p > 0.995) dugLen = total;
    wall.style.strokeDashoffset = bore.style.strokeDashoffset = maskP.style.strokeDashoffset = total - dugLen;
    // parallax strata
    if (!reduce) $$('.stratum').forEach(s => s.style.transform = `translate3d(0,${y * s.dataset.speed}px,0)`);
    // roadmap fill
    const rm = $('.roadmap'); if (rm) { const r = rm.getBoundingClientRect(); const rp = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height)); rm.style.setProperty('--rp', (rp * 100) + '%'); }
  }
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true });
  let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { buildTunnel(); swarm.resize(); }, 150); });
  function walk(dt) {
    if (!total) return;
    walkers.forEach(w => {
      w.s += w.v * dt * w.dir; if (w.s > 1) w.s -= 1; if (w.s < 0) w.s += 1;
      const L = w.s * dugLen; if (dugLen < 40) { w.el.style.display = 'none'; return; } w.el.style.display = '';
      const a = bore.getPointAtLength(L), b = bore.getPointAtLength(Math.min(total, L + 2 * w.dir));
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90;
      w.el.setAttribute('transform', `translate(${a.x - 7},${a.y - 7}) rotate(${ang} 7 7)`);
    });
  }

  /* ---------- cursor escort: a short chain of ants following the pointer ---------- */
  const trail = $('#trail'), tctx = trail.getContext('2d');
  const escort = Array.from({ length: 5 }, () => ({ x: -100, y: -100, a: 0 }));
  let mouse = { x: -999, y: -999, active: false };
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = e.pointerType === 'mouse'; }, { passive: true });
  function sizeTrail() { const r = devicePixelRatio || 1; trail.width = innerWidth * r; trail.height = innerHeight * r; tctx.setTransform(r, 0, 0, r, 0, 0); }
  sizeTrail(); addEventListener('resize', sizeTrail);

  function drawAnt(c, x, y, ang, s, col, phase) {
    c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = Math.max(0.6, s * 0.28);
    c.beginPath();
    c.ellipse(-s * 1.5, 0, s * 1.1, s * 0.8, 0, 0, 6.283);
    c.ellipse(0, 0, s * 0.6, s * 0.45, 0, 0, 6.283);
    c.ellipse(s * 1.1, 0, s * 0.6, s * 0.55, 0, 0, 6.283);
    c.fill();
    c.beginPath();
    const k = Math.sin(phase) * s * 0.5;
    for (const sg of [-1, 1]) {
      c.moveTo(0, 0); c.lineTo(-s * 0.9 + k * sg, sg * s * 1.3);
      c.moveTo(0, 0); c.lineTo(s * 0.1 - k * sg, sg * s * 1.4);
      c.moveTo(0, 0); c.lineTo(s * 0.9 + k * sg, sg * s * 1.2);
      c.moveTo(s * 1.5, sg * s * 0.2); c.lineTo(s * 2.3, sg * s * 0.8);
    }
    c.stroke(); c.restore();
  }

  /* ---------- hero swarm: ants form the ticker and flee the cursor ---------- */
  const swarm = (() => {
    const cv = $('#swarm'), c = cv.getContext('2d'), hero = $('.hero');
    let W = 0, H = 0, ants = [], targets = [], scatterUntil = 0;
    function sampleText() {
      const off = document.createElement('canvas'), o = off.getContext('2d');
      const mobile = W < 900;
      const inner = $('.hero__inner').getBoundingClientRect(), hr = hero.getBoundingClientRect();
      const bandTop = inner.bottom - hr.top + 10, bandBot = H - (mobile ? 70 : 84);
      const bandH = Math.max(80, bandBot - bandTop);
      const fs = Math.min(bandH * 1.15, W * (mobile ? 0.3 : 0.26));
      off.width = W; off.height = H;
      o.font = `800 ${fs}px "Bricolage Grotesque", Impact, sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle';
      const cy = bandTop + bandH / 2 + fs * 0.04;
      o.fillText(TICKER, W / 2, cy);
      const img = o.getImageData(0, 0, W, H).data, pts = [], gap = mobile ? 5 : 7;
      for (let y = 0; y < H; y += gap) for (let x = 0; x < W; x += gap) if (img[(y * W + x) * 4 + 3] > 128) pts.push([x + (Math.random() - .5) * 2, y + (Math.random() - .5) * 2]);
      return pts;
    }
    function resize() {
      const r = devicePixelRatio > 1 ? 1.5 : 1; W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * r; cv.height = H * r; c.setTransform(r, 0, 0, r, 0, 0);
      targets = sampleText();
      const max = W < 600 ? 420 : 900;
      if (targets.length > max) { for (let i = targets.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [targets[i], targets[j]] = [targets[j], targets[i]]; } targets.length = max; }
      const old = ants; ants = targets.map((t, i) => {
        const o = old[i]; const edge = Math.random();
        const sx = o ? o.x : edge < .5 ? (Math.random() < .5 ? -20 : W + 20) : Math.random() * W;
        const sy = o ? o.y : edge < .5 ? Math.random() * H : H + 20;
        return { x: reduce ? t[0] : sx, y: reduce ? t[1] : sy, vx: 0, vy: 0, tx: t[0], ty: t[1], ph: Math.random() * 6, a: Math.random() * 6, s: 1.3 + Math.random() * .7, delay: Math.random() * 1400, scout: Math.random() < .05 };
      });
      if (reduce) draw(0);
    }
    hero.addEventListener('click', e => { if (e.target.closest('a,button,code')) return; scatterUntil = performance.now() + 1300; const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; ants.forEach(a => { const dx = a.x - mx, dy = a.y - my, d = Math.hypot(dx, dy) + 1; const f = 14 * Math.min(1, 260 / d); a.vx += dx / d * f; a.vy += dy / d * f; }); });
    let t0 = performance.now();
    function draw(now) {
      c.clearRect(0, 0, W, H);
      const r = cv.getBoundingClientRect(), mx = mouse.x - r.left, my = mouse.y - r.top;
      const scatter = now < scatterUntil;
      for (const a of ants) {
        if (!reduce && now - t0 > a.delay) {
          let ax = 0, ay = 0;
          if (!scatter) { const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy); const sp = Math.min(2.6, d * 0.05); ax += (dx / (d || 1)) * sp - a.vx; ay += (dy / (d || 1)) * sp - a.vy; ax *= 0.12; ay *= 0.12; if (d < 3) { ax += (Math.random() - .5) * .25; ay += (Math.random() - .5) * .25; } }
          else { a.a += (Math.random() - .5) * .6; ax += Math.cos(a.a) * .15; ay += Math.sin(a.a) * .15; }
          const ddx = a.x - mx, ddy = a.y - my, dd = Math.hypot(ddx, ddy);
          if (dd < 110) { const f = (110 - dd) / 110 * 1.6; ax += ddx / (dd || 1) * f; ay += ddy / (dd || 1) * f; }
          a.vx = (a.vx + ax) * 0.93; a.vy = (a.vy + ay) * 0.93; a.x += a.vx; a.y += a.vy;
          const spd = Math.hypot(a.vx, a.vy); if (spd > .15) a.a = Math.atan2(a.vy, a.vx); a.ph += spd * 0.9 + 0.02;
        }
        drawAnt(c, a.x, a.y, a.a, a.s, a.scout ? 'rgba(255,190,90,.95)' : 'rgba(176,98,44,.78)', a.ph);
      }
    }
    return { resize, draw, get visible() { const r = hero.getBoundingClientRect(); return r.bottom > 0; } };
  })();

  /* ---------- main loop ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(50, now - last); last = now;
    if (swarm.visible) swarm.draw(now);
    walk(dt);
    tctx.clearRect(0, 0, innerWidth, innerHeight);
    if (finePointer && mouse.active) {
      let px = mouse.x, py = mouse.y;
      escort.forEach((e, i) => {
        const dx = px - e.x, dy = py - e.y, d = Math.hypot(dx, dy);
        if (d > 16) { e.x += dx * 0.18; e.y += dy * 0.18; e.a = Math.atan2(dy, dx); }
        e.ph = (e.ph || 0) + Math.min(d, 20) * 0.08;
        drawAnt(tctx, e.x, e.y, e.a, 2.1, `rgba(255,${180 - i * 12},${80 - i * 8},${0.95 - i * 0.12})`, e.ph);
        px = e.x - Math.cos(e.a) * 14; py = e.y - Math.sin(e.a) * 14;
      });
    }
    requestAnimationFrame(loop);
  }

  const start = () => { buildTunnel(); swarm.resize(); if (!reduce) requestAnimationFrame(loop); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(start, 50));
  addEventListener('load', () => buildTunnel());
})();
