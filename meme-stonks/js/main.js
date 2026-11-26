/* Replace TBA with the contract address. Copy stays a no-op until this is a real address. */
const CONTRACT = "TBA";

/* Paste a swap URL when a pool exists. Empty keeps every buy button on this page. */
const BUY_URL = "";

const LINES = [
  "Stonks.",
  "Not stonks.",
  "Buy high. Sell low.",
  "The suit stays on.",
  "Solana. The address is still TBA.",
  "Arrow says up. Contract says TBA.",
  "I do not uncross for dips.",
  "The board is loud. The address is quiet."
];

/* Digits painted on the artwork. They are not a quote. */
const BOARD = ["2.286", "1.28", "10.11%", "0.15%", "1.4563", "0267", ".334", "080", "0:61"];

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let reduced = motionQuery.matches;

function contractIsLive(value) {
  return typeof value === "string" && value.trim() !== "" && value.trim().toUpperCase() !== "TBA";
}

function initContract() {
  const live = contractIsLive(CONTRACT);
  const text = live ? CONTRACT.trim() : "TBA";
  document.querySelectorAll("[data-ca-value]").forEach((el) => {
    el.textContent = text;
  });
  document.querySelectorAll("[data-ca-note]").forEach((note) => {
    note.textContent = live
      ? "Copy the contract address."
      : "Nothing copies while the address is TBA.";
  });
  document.querySelectorAll("[data-ca-copy]").forEach((btn) => {
    btn.dataset.label = (btn.textContent || "Copy").trim();
    let timer = 0;
    const flash = (label) => {
      window.clearTimeout(timer);
      btn.textContent = label;
      timer = window.setTimeout(() => {
        btn.textContent = btn.dataset.label;
      }, 1400);
    };
    btn.addEventListener("click", () => {
      if (!live) {
        flash("Still TBA");
        return;
      }
      copyText(text, btn, flash);
    });
  });
}

function copyText(value, btn, flash) {
  const done = () => flash("Copied");
  const fallback = () => {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    area.remove();
    btn.focus();
    if (!ok) throw new Error("copy failed");
  };
  const write = navigator.clipboard && navigator.clipboard.writeText
    ? navigator.clipboard.writeText(value)
    : Promise.reject(new Error("no clipboard"));
  write.then(done).catch(() => {
    try {
      fallback();
      done();
    } catch (err) {
      flash("Copy");
    }
  });
}

function initBuy() {
  const url = BUY_URL.trim();
  if (!url) return;
  document.querySelectorAll("[data-buy]").forEach((link) => {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

function initTape() {
  if (reduced) return;
  document.querySelectorAll("[data-tape]").forEach((set) => {
    const clone = set.cloneNode(true);
    clone.removeAttribute("data-tape");
    set.parentElement.appendChild(clone);
    set.parentElement.classList.add("is-ready");
  });
}

function initMenu() {
  const btn = document.getElementById("menuBtn");
  const links = document.getElementById("navLinks");
  if (!btn || !links) return;
  const setOpen = (open) => {
    links.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  };
  btn.addEventListener("click", () => {
    setOpen(!links.classList.contains("is-open"));
  });
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) setOpen(false);
  });
}

function initGaze() {
  const stage = document.getElementById("stage");
  const ring = document.getElementById("stageRing");
  const mascot = document.getElementById("mascot");
  const bubble = document.getElementById("bubble");
  if (!stage || !mascot || !bubble) return;
  let line = 0;

  const reset = () => {
    stage.style.setProperty("--mx", "0");
    stage.style.setProperty("--my", "0");
  };

  window.addEventListener("pointermove", (event) => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = (ring || stage).getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.4;
    const nx = Math.max(-1, Math.min(1, (event.clientX - cx) / (rect.width * 0.72)));
    const ny = Math.max(-1, Math.min(1, (event.clientY - cy) / (rect.height * 0.72)));
    stage.style.setProperty("--mx", nx.toFixed(3));
    stage.style.setProperty("--my", ny.toFixed(3));
  }, { passive: true });

  stage.addEventListener("pointerleave", reset);
  window.addEventListener("blur", reset);
  reset();

  mascot.addEventListener("click", () => {
    line = (line + 1) % LINES.length;
    bubble.textContent = LINES[line];
  });
}

function lengthOf(path) {
  const parent = path.parentElement;
  const previous = parent ? parent.getAttribute("opacity") : null;
  if (parent) parent.setAttribute("opacity", "1");
  const len = path.getTotalLength();
  if (parent) {
    if (previous === null) parent.removeAttribute("opacity");
    else parent.setAttribute("opacity", previous);
  }
  return len;
}

function initChart() {
  const section = document.getElementById("chart");
  const svg = document.getElementById("chartSvg");
  const up = document.getElementById("lineUp");
  const down = document.getElementById("lineDown");
  const btnUp = document.getElementById("modeUp");
  const btnDown = document.getElementById("modeDown");
  const foot = document.getElementById("chartFoot");
  const mark = document.getElementById("chartMark");
  if (!section || !svg || !up || !down || !btnUp || !btnDown || !foot) return;

  const lenUp = lengthOf(up);
  const lenDown = lengthOf(down);
  up.style.strokeDasharray = String(lenUp);
  down.style.strokeDasharray = String(lenDown);

  let mode = "up";
  let progress = reduced ? 1 : 0;
  let animating = false;
  let anim = 0;

  const scrollProgress = () => {
    const rect = section.getBoundingClientRect();
    const traveled = window.innerHeight * 0.82 - rect.top;
    const span = Math.max(rect.height * 0.55, 240);
    return Math.max(0, Math.min(1, traveled / span));
  };

  const paint = () => {
    const p = reduced ? 1 : progress;
    const apply = (path, length, active, head) => {
      path.style.transition = "none";
      path.style.strokeDashoffset = String(active ? length * (1 - p) : length);
      path.setAttribute("marker-end", active && p > 0.985 ? "url(#" + head + ")" : "none");
    };
    apply(up, lenUp, mode === "up", "headUp");
    apply(down, lenDown, mode === "down", "headDown");
  };

  const measure = () => {
    if (animating) return;
    progress = reduced ? 1 : scrollProgress();
    paint();
  };

  const setMode = (next) => {
    mode = next;
    svg.classList.toggle("is-down", next === "down");
    btnUp.setAttribute("aria-pressed", next === "up" ? "true" : "false");
    btnDown.setAttribute("aria-pressed", next === "down" ? "true" : "false");
    foot.textContent = next === "up"
      ? "Stonks. It climbs because that is the joke."
      : "Not stonks. Same drawing, worse mood. Still not a price.";
    if (mark) mark.textContent = next === "up" ? "Stonks" : "Not stonks";
    window.cancelAnimationFrame(anim);
    if (reduced) {
      animating = false;
      progress = 1;
      paint();
      return;
    }
    const target = Math.max(scrollProgress(), 0.15);
    const start = performance.now();
    animating = true;
    const step = (now) => {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - Math.pow(1 - t, 3);
      progress = target * eased;
      paint();
      if (t < 1) anim = window.requestAnimationFrame(step);
      else animating = false;
    };
    progress = 0;
    paint();
    anim = window.requestAnimationFrame(step);
  };

  btnUp.addEventListener("click", () => setMode("up"));
  btnDown.addEventListener("click", () => setMode("down"));

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (reduced) return;
    animating = false;
    window.cancelAnimationFrame(anim);
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      measure();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", measure);
  measure();
}

function initSteps() {
  const list = document.getElementById("steps");
  if (!list) return;
  const paint = () => {
    if (reduced) {
      list.style.setProperty("--step-p", "1");
      return;
    }
    const rect = list.getBoundingClientRect();
    const p = (window.innerHeight * 0.72 - rect.top) / Math.max(rect.height, 1);
    list.style.setProperty("--step-p", Math.max(0, Math.min(1, p)).toFixed(4));
  };
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      paint();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", paint);
  paint();
}

function initBoard() {
  const btn = document.getElementById("refreshBoard");
  const card = document.getElementById("tokenCard");
  const status = document.getElementById("boardStatus");
  if (!btn || !card || !status) return;
  btn.addEventListener("click", () => {
    status.textContent = "Still TBA. The board has nothing new.";
    if (reduced) return;
    card.classList.remove("is-flicker");
    window.requestAnimationFrame(() => {
      card.classList.add("is-flicker");
    });
  });
}

function initPrintout() {
  const el = document.getElementById("printout");
  if (!el) return;
  if (reduced) return;
  let index = 0;
  window.setInterval(() => {
    index = (index + 1) % BOARD.length;
    el.textContent = BOARD[index];
    el.classList.remove("is-flip");
    void el.offsetWidth;
    el.classList.add("is-flip");
  }, 1100);
}

function initGallery() {
  const dialog = document.getElementById("shot");
  const img = document.getElementById("shotImg");
  const cap = document.getElementById("shotCap");
  const prev = document.getElementById("shotPrev");
  const next = document.getElementById("shotNext");
  const tiles = Array.prototype.slice.call(document.querySelectorAll(".tile"));
  if (!dialog || !img || !cap || !tiles.length || typeof dialog.showModal !== "function") return;
  let index = 0;

  const show = (i) => {
    index = (i + tiles.length) % tiles.length;
    const tile = tiles[index];
    img.src = tile.getAttribute("data-src") || "";
    img.alt = tile.getAttribute("data-alt") || "";
    cap.textContent = tile.getAttribute("data-cap") || "";
    if (!dialog.open) dialog.showModal();
  };

  tiles.forEach((tile, i) => {
    tile.addEventListener("click", () => show(i));
  });
  if (prev) prev.addEventListener("click", () => show(index - 1));
  if (next) next.addEventListener("click", () => show(index + 1));
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right
      && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1);
    }
  });
}

function initSpy() {
  const links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a[href^='#']"));
  if (!links.length || typeof IntersectionObserver !== "function") return;
  const pairs = [];
  links.forEach((link) => {
    const id = (link.getAttribute("href") || "").slice(1);
    const el = document.getElementById(id);
    if (el) pairs.push([el, link]);
  });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.removeAttribute("aria-current"));
      pairs.forEach((pair) => {
        if (pair[0] === entry.target) pair[1].setAttribute("aria-current", "true");
      });
    });
  }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
  pairs.forEach((pair) => obs.observe(pair[0]));
}

function initMotion() {
  const apply = () => {
    reduced = motionQuery.matches;
    document.documentElement.classList.toggle("reduce", reduced);
    if (reduced) {
      const stage = document.getElementById("stage");
      if (stage) {
        stage.style.setProperty("--mx", "0");
        stage.style.setProperty("--my", "0");
      }
    }
  };
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", apply);
  apply();
}

initMotion();
initContract();
initBuy();
initTape();
initMenu();
initGaze();
initChart();
initSteps();
initBoard();
initPrintout();
initGallery();
initSpy();
