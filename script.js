// ============ DECK NAVIGATION ============
const deck = document.getElementById("deck");
const panels = Array.from(deck.querySelectorAll(".panel"));
const dotsNav = document.getElementById("dots");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressFill = document.getElementById("progressFill");
const navLinks = document.querySelectorAll("#nav a");
const nav = document.getElementById("nav");
const menuToggle = document.getElementById("menuToggle");

let current = -1;
let locked = false;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Build dot navigation
panels.forEach((panel, i) => {
  const dot = document.createElement("button");
  dot.setAttribute("aria-label", panel.id || `Section ${i + 1}`);
  dot.addEventListener("click", () => goTo(i));
  dotsNav.appendChild(dot);
});
const dots = Array.from(dotsNav.children);

const countersStarted = new Set();
function startCounters(panel) {
  panel.querySelectorAll("[data-count]").forEach((el) => {
    if (countersStarted.has(el)) return;
    countersStarted.add(el);
    const target = +el.dataset.count;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 55));
    const tick = () => {
      cur += step;
      if (cur >= target) el.textContent = target + "+";
      else { el.textContent = cur; requestAnimationFrame(tick); }
    };
    tick();
  });
}

function goTo(index) {
  index = Math.max(0, Math.min(panels.length - 1, index));
  if (index === current) return;
  panels.forEach((p, i) => {
    p.classList.remove("active", "prev");
    if (i === index) p.classList.add("active");
    else if (i < index) p.classList.add("prev");
  });
  dots.forEach((d, i) => d.classList.toggle("active", i === index));
  navLinks.forEach((l) =>
    l.classList.toggle("active", l.getAttribute("href") === `#${panels[index].id}`)
  );
  progressFill.style.height = ((index / (panels.length - 1)) * 100) + "%";
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === panels.length - 1;
  current = index;
  panels[index].scrollTop = 0;
  startCounters(panels[index]);
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

// Lock helper to debounce rapid navigation
function withLock(fn) {
  if (locked) return;
  locked = true;
  fn();
  setTimeout(() => { locked = false; }, reduceMotion ? 250 : 850);
}

// Wheel — respect internal scroll when a panel overflows
deck.addEventListener("wheel", (e) => {
  const panel = panels[current];
  const canScroll = panel.scrollHeight > panel.clientHeight + 2;
  if (canScroll) {
    const atTop = panel.scrollTop <= 0;
    const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
    if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return; // let it scroll
  }
  e.preventDefault();
  withLock(() => (e.deltaY > 0 ? next() : prev()));
}, { passive: false });

// Keyboard
window.addEventListener("keydown", (e) => {
  if (document.getElementById("lightbox").classList.contains("open")) return;
  if (["ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); withLock(next); }
  else if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); withLock(prev); }
  else if (e.key === "Home") { e.preventDefault(); goTo(0); }
  else if (e.key === "End") { e.preventDefault(); goTo(panels.length - 1); }
});

// Touch swipe
let touchStartY = null;
deck.addEventListener("touchstart", (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
deck.addEventListener("touchend", (e) => {
  if (touchStartY === null) return;
  const dy = touchStartY - e.changedTouches[0].clientY;
  const panel = panels[current];
  const canScroll = panel.scrollHeight > panel.clientHeight + 2;
  if (Math.abs(dy) > 60 && !canScroll) withLock(() => (dy > 0 ? next() : prev()));
  touchStartY = null;
});

prevBtn.addEventListener("click", () => withLock(prev));
nextBtn.addEventListener("click", () => withLock(next));

// In-page anchor links -> jump to matching panel
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const idx = panels.findIndex((p) => p.id === id);
    if (idx >= 0) { e.preventDefault(); nav.classList.remove("open"); goTo(idx); }
  });
});

// Mobile menu
menuToggle.addEventListener("click", () => nav.classList.toggle("open"));

// Initialize
goTo(0);

// ============ Tabs ============
const tabs = document.querySelectorAll(".tab");
const tabPanels = document.querySelectorAll("[data-panel]");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    tabPanels.forEach((p) =>
      p.classList.toggle("is-visible", p.dataset.panel === tab.dataset.tab)
    );
  });
});

// ============ 3D tilt + parallax ============
const isTouch = window.matchMedia("(hover: none)").matches;
if (!reduceMotion && !isTouch) {
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const max = 10;
    el.addEventListener("mousemove", (ev) => {
      const r = el.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateY(${px * max}deg) rotateX(${-py * max}deg) translateY(-4px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "rotateY(0) rotateX(0) translateY(0)";
    });
  });

  const depthEls = document.querySelectorAll(".scene [data-depth]");
  window.addEventListener("mousemove", (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    depthEls.forEach((el) => {
      const d = parseFloat(el.dataset.depth) || 0.04;
      el.style.translate = `${x * d * 120}px ${y * d * 120}px`;
    });
  });
}

// ============ Lightbox ============
const lightbox = document.getElementById("lightbox");
const lightboxVideo = document.getElementById("lightboxVideo");
const lightboxClose = document.getElementById("lightboxClose");

const openLightbox = (id) => {
  lightboxVideo.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
};
const closeLightbox = () => {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxVideo.innerHTML = "";
};

document.querySelectorAll(".work-card[data-video]").forEach((el) => {
  el.addEventListener("click", (e) => { e.preventDefault(); openLightbox(el.dataset.video); });
});
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
