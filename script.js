/* ===================================================================
   UGC by Olla — interactions
   =================================================================== */
(function () {
  "use strict";

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav background ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  function closeMenu() {
    links.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- Brand logo marquee (build + duplicate for seamless loop) ---------- */
  var brands = [
    { name: "Hofmanns",       file: "assets/brands/hofmanns.png",     url: "https://hofmanns-shop.de/" },
    { name: "Mother’s Earth", file: "assets/brands/mothersearth.png", url: "https://mothersearth.de/" },
    { name: "manesa",         file: "assets/brands/manesa.png",       url: "https://manesa.de/" },
    { name: "Wecasa",         file: "assets/brands/wecasa.svg",       url: "https://www.wecasa.de/" }
  ];
  var track = document.getElementById("marqueeTrack");
  if (track) {
    function logo(b) {
      return (
        '<a class="marquee__item" href="' + b.url + '" target="_blank" rel="noopener" aria-label="' +
        b.name + '"><img src="' + b.file + '" alt="' + b.name + '" loading="lazy" /></a>'
      );
    }
    // Each brand listed once; the whole sequence is duplicated a single time
    // so the -50% translate loops seamlessly while showing every logo only once.
    var set = brands.map(logo).join("");
    track.innerHTML = set + set;
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    if (el.dataset.raw) return; // static numbers (e.g. years) stay as-is
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      var display = target % 1 === 0 ? Math.round(val) : val.toFixed(1);
      el.textContent = display + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Modals (Impressum / Datenschutz) ---------- */
  var lastFocus = null;
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    lastFocus = document.activeElement;
    m.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = m.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();
  }
  function closeModal(m) {
    m.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll("[data-modal]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      openModal(a.getAttribute("data-modal"));
    });
  });
  document.querySelectorAll(".modal").forEach(function (m) {
    m.querySelectorAll("[data-close]").forEach(function (c) {
      c.addEventListener("click", function () { closeModal(m); });
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal:not([hidden])").forEach(closeModal);
    }
  });

  /* ---------- Portfolio: hover preview + video lightbox ---------- */
  var cards = document.querySelectorAll(".card[data-video]");
  cards.forEach(function (card) {
    var vid = card.querySelector(".card__vid");
    // Muted preview on hover (one frame already shown via #t=0.1)
    card.addEventListener("mouseenter", function () {
      if (vid) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
    });
    card.addEventListener("mouseleave", function () {
      if (vid) { vid.pause(); }
    });
    card.addEventListener("click", function () { openLightbox(card.getAttribute("data-video")); });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(card.getAttribute("data-video")); }
    });
  });

  var lightbox = document.getElementById("lightbox");
  var lightboxVideo = document.getElementById("lightboxVideo");
  function openLightbox(src) {
    if (!lightbox || !src) return;
    lightboxVideo.src = src;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    var p = lightboxVideo.play();
    if (p && p.catch) p.catch(function () {});
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.load();
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }
  if (lightbox) {
    lightbox.querySelectorAll("[data-lb-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }
})();
