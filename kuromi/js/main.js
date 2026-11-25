/* Replace TBA with the mint address to enable every copy button. */
const CONTRACT = "TBA";

/* Paste a swap URL when a pool exists. Empty keeps every buy button on this page. */
const BUY_URL = "";

const LINES = [
  "Eyes up. I saw that.",
  "The skull on the hood is not a chart.",
  "Pink tips, black hood, contract still TBA.",
  "The diary is a trap. The feed is on X.",
  "She is still watching."
];

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
  let noteIndex = 0;
  document.querySelectorAll("[data-ca-copy]").forEach((btn) => {
    const note = btn.closest(".ca") && btn.closest(".ca").querySelector(".ca__note");
    if (note) {
      noteIndex += 1;
      if (!note.id) note.id = "ca-note-" + noteIndex;
      btn.setAttribute("aria-describedby", note.id);
    }
    btn.disabled = !live;
    btn.setAttribute("aria-disabled", live ? "false" : "true");
    if (!live) return;
    btn.addEventListener("click", () => {
      copyText(text, btn);
    });
  });
}

function copyText(value, btn) {
  const done = () => {
    const previous = btn.textContent;
    btn.textContent = "Copied";
    window.setTimeout(() => {
      btn.textContent = previous;
    }, 1400);
  };
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
      btn.textContent = "Copy";
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

function initMenu() {
  const btn = document.getElementById("menuBtn");
  const links = document.getElementById("navLinks");
  if (!btn || !links) return;
  const setOpen = (open) => {
    links.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
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
}

function initGaze() {
  const stage = document.getElementById("stage");
  const mascot = document.getElementById("mascot");
  if (!stage || !mascot) return;
  const summary = mascot.querySelector("summary");
  const bubble = document.getElementById("bubble");
  let line = -1;

  const resetPose = () => {
    stage.style.setProperty("--tilt", "0deg");
    stage.style.setProperty("--shift-x", "0px");
    stage.style.setProperty("--shift-y", "0px");
    stage.style.setProperty("--eye-x", "0px");
    stage.style.setProperty("--eye-y", "0px");
  };

  const onMove = (event) => {
    if (reduced || !summary) return;
    const rect = summary.getBoundingClientRect();
    if (!rect.width) return;
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.42;
    const nx = Math.max(-1, Math.min(1, (event.clientX - cx) / (window.innerWidth * 0.45)));
    const ny = Math.max(-1, Math.min(1, (event.clientY - cy) / (window.innerHeight * 0.45)));
    const eye = rect.width * 0.012;
    stage.style.setProperty("--tilt", (nx * 5).toFixed(2) + "deg");
    stage.style.setProperty("--shift-x", (nx * 8).toFixed(1) + "px");
    stage.style.setProperty("--shift-y", (ny * 5).toFixed(1) + "px");
    stage.style.setProperty("--eye-x", (nx * eye).toFixed(1) + "px");
    stage.style.setProperty("--eye-y", (ny * eye * 0.85).toFixed(1) + "px");
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("blur", resetPose);
  resetPose();

  if (summary && bubble) {
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      line = (line + 1) % LINES.length;
      bubble.textContent = LINES[line];
      mascot.open = true;
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mascot.open) mascot.open = false;
  });
}

function initTail() {
  const grow = document.getElementById("tailGrow");
  if (!grow) return;
  let ticking = false;
  const paint = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    grow.style.width = "calc(128px + (100% - 128px) * " + progress.toFixed(4) + ")";
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(paint);
  }, { passive: true });
  window.addEventListener("resize", paint);
  paint();

  const yank = document.getElementById("yank");
  if (yank) {
    yank.addEventListener("toggle", () => {
      if (!yank.open || reduced) return;
      grow.classList.remove("is-yanked");
      // Restart the pull even if she was yanked a moment ago.
      window.requestAnimationFrame(() => {
        grow.classList.add("is-yanked");
      });
    });
    grow.addEventListener("animationend", () => {
      grow.classList.remove("is-yanked");
    });
  }
}

function burst(x, y, count) {
  if (reduced) return;
  if (document.querySelectorAll(".burst").length > 36) return;
  const skull = document.getElementById("tpl-skull");
  const spark = document.getElementById("tpl-spark");
  if (!skull || !spark) return;
  for (let i = 0; i < count; i += 1) {
    const tpl = i % 3 === 0 ? skull : spark;
    const node = tpl.content.firstElementChild.cloneNode(true);
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 36 + Math.random() * 78;
    node.style.left = x + "px";
    node.style.top = y + "px";
    node.style.setProperty("--dx", (Math.cos(angle) * dist).toFixed(1) + "px");
    node.style.setProperty("--dy", (Math.sin(angle) * dist - 18).toFixed(1) + "px");
    node.style.setProperty("--rot", (Math.random() * 80 - 40).toFixed(1) + "deg");
    document.body.appendChild(node);
    const remove = () => node.remove();
    node.addEventListener("animationend", remove);
    window.setTimeout(remove, 900);
  }
}

function initBursts() {
  document.addEventListener("click", (event) => {
    if (reduced) return;
    if (event.clientX === 0 && event.clientY === 0) return;
    const rich = event.target.closest(".mascot, .diary, .yank, .btn-tail");
    burst(event.clientX, event.clientY, rich ? 12 : 7);
  });
}

function initMotion() {
  const apply = () => {
    reduced = motionQuery.matches;
    if (reduced) {
      document.querySelectorAll(".burst").forEach((node) => node.remove());
      const stage = document.getElementById("stage");
      if (stage) {
        stage.style.setProperty("--tilt", "0deg");
        stage.style.setProperty("--shift-x", "0px");
        stage.style.setProperty("--shift-y", "0px");
        stage.style.setProperty("--eye-x", "0px");
        stage.style.setProperty("--eye-y", "0px");
      }
    }
  };
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", apply);
  apply();
}

initMotion();
initContract();
initBuy();
initMenu();
initGaze();
initTail();
initBursts();
