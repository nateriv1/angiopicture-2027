/* ANGIOPICTURE — рендер из data.js, анимации, галерея-стопка, лайтбокс */
(function () {
  "use strict";

  var D = window.SITE_DATA;
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var gsap = null;
  var lenis = null;

  root.classList.add("js");
  if (reduce) root.classList.add("reduce");

  var ICON = {
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v13m0 0l-5-5m5 5l5-5M5 20h14"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>',
    soon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14m0 0l-5-5m5 5l5-5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m0 0l6-6m-6 6l6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 5l7 7-7 7"/></svg>'
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function telHref(p) { return "tel:+" + p.replace(/\D/g, ""); }

  /* ================= render ================= */
  function renderStatic() {
    document.title = D.meta.title;
    $("#skip-link").textContent = D.ui.skip;
    var L0 = D.brand.logo;
    root.style.setProperty("--logo-ratio", (L0.width / L0.height).toFixed(4));
    var logo = $("#logo");
    if (logo.getAttribute("src") !== L0.src) { logo.srcset = L0.srcset; logo.src = L0.src; }
    logo.width = L0.width; logo.height = L0.height; logo.alt = D.brand.logoAlt;
    var logoLink = $("#logo-link");
    logoLink.href = D.brand.logoHref; logoLink.setAttribute("aria-label", D.brand.logoLabel);
    $("#nav").innerHTML = D.nav.map(function (n) { return '<a href="' + esc(n.href) + '">' + esc(n.label) + "</a>"; }).join("");

    var h = D.hero, pv = h.view;
    /* ссылки на план открывают встроенный просмотр (data-pdf-view, см. js/pdf-viewer.js) */
    function viewAttrs(a) { a.href = pv.href; a.setAttribute("data-title", pv.title); a.setAttribute("data-download", pv.file); }
    var cta = $("#header-cta");
    viewAttrs(cta);
    cta.innerHTML = "<span>" + esc(pv.headerLabel) + "</span>" + ICON.eye;
    $("#mnav").innerHTML = D.nav.map(function (n) { return '<a href="' + esc(n.href) + '">' + esc(n.label) + "</a>"; }).join("") +
      '<a class="mnav__pdf" href="' + esc(pv.href) + '" target="_blank" rel="noopener" data-pdf-view data-title="' + esc(pv.title) + '" data-download="' + esc(pv.file) + '">' + esc(pv.headerLabel) + ICON.eye + "</a>";
    $("#burger").setAttribute("aria-label", D.ui.menu);

    var A = D.about;
    $("#about-label").textContent = A.label;
    $("#about-lead").textContent = A.lead;
    $("#about-partners").innerHTML = '<span class="p-full">' + esc(A.partners) + '</span><span class="p-short">' + esc(A.partnersShort) + "</span>";
    $("#about-stats").innerHTML = A.stats.map(function (s) { return '<li><b class="stat__n">' + esc(s.value) + '</b><span class="stat__l">' + esc(s.label) + "</span></li>"; }).join("");
    $(".hero__word").textContent = h.title;
    $(".hero__year").textContent = h.year;
    $("#hero-lead").textContent = h.lead;
    var vb = $("#hero-view");
    viewAttrs(vb);
    vb.innerHTML = "<span>" + esc(pv.label) + '</span><span class="btn__ico">' + ICON.eye + "</span>";

    /* план: строки мероприятий */
    var P = D.plan;
    $("#rows").innerHTML = P.items.map(function (it, i) {
      return '<li class="row" data-reveal data-delay="' + (0.15 + i * 0.05) + '">' +
        '<p class="row__date"><span class="row__day">' + esc(it.dayLabel) + '</span><span class="row__month">' + esc(it.monthLabel) + "</span></p>" +
        '<div class="row__body">' + (it.lead ? '<p class="row__lead">' + esc(it.lead) + "</p>" : "") + '<p class="row__name">' + (it.eventId ? '<a class="row__link" href="#event-' + esc(it.eventId) + '">' + esc(it.name) + '<span class="row__go">' + esc(P.labels.more) + ICON.down + "</span></a>" : esc(it.name)) + "</p></div>" +
        '<p class="row__meta"><span class="row__place"><span class="sr-only">' + esc(P.labels.place) + ": </span>" + esc(it.place) + "</span>" +
        '<span class="tag"><span class="sr-only">' + esc(P.labels.format) + ": </span>" + esc(it.format) + "</span></p></li>";
    }).join("");

    /* мероприятия */
    var S = D.eventsSection, L = S.labels;
    $("#events-eyebrow").textContent = S.eyebrow;
    $("#events-heading").textContent = S.heading;
    var evs = D.events.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    D._sorted = evs;
    $("#events-list").innerHTML = evs.map(function (e, i) {
      var tid = "ev-" + e.id, names = e.downloadNames || {};
      var facts = [{ label: L.place, value: e.place, sub: e.address }].concat(e.facts || []);
      return '<article class="ev' + (i % 2 ? " ev--flip" : "") + '" id="event-' + esc(e.id) + '" aria-labelledby="' + tid + '">' +
        '<p class="ev__top" data-reveal><time datetime="' + esc(e.date) + '">' + esc(e.dateLabel) + "</time></p>" +
        '<div class="ev__grid">' +
        '<div class="ev__body">' +
        (e.kicker ? '<p class="ev__kicker" data-reveal>' + esc(e.kicker) + "</p>" : "") +
        '<h3 class="ev__title" id="' + tid + '"><span class="mask"><span>' + esc(e.title) + "</span></span></h3>" +
        (e.description ? '<p class="ev__desc" data-reveal>' + esc(e.description) + "</p>" : "") +
        '<dl class="dl" data-reveal>' + facts.map(function (f) {
          return "<div><dt>" + esc(f.label) + "</dt><dd>" + esc(f.value) + (f.sub ? "<span>" + esc(f.sub) + "</span>" : "") + "</dd></div>";
        }).join("") + "</dl>" +
        '<div class="docs" data-reveal><p class="docs__title">' + esc(L.docs) + "</p><ul>" +
        doc(e.files.kp, S.buttons.kp, names.kp, false, null, e.title) +
        doc(e.files.program, S.buttons.program, names.program, false, null, e.title) +
        doc(e.files.photoReport, S.buttons.photoReport, null, true, L.external) +
        "</ul></div></div>" +
        '<div class="ev__media" data-reveal><div class="gal" data-gal="' + i + '">' +
        '<div class="gal__stage" role="group" aria-label="' + esc(e.galleryTitle) + '"><div class="gal__inner">' +
        e.photos.map(function (p, k) {
          return '<button class="gal__card" type="button" data-i="' + k + '" aria-label="Открыть фото ' + (k + 1) + ": " + esc(p.alt) + '">' +
            '<img src="' + esc(p.thumb) + '" srcset="' + esc(p.thumb) + " 400w, " + esc(p.src) + ' 1200w" sizes="' + (k === 0 ? "(min-width:1100px) 480px, 80vw" : "(min-width:1100px) 250px, 34vw") + '" width="' + p.w + '" height="' + p.h + '" alt="' + esc(p.alt) + '" loading="lazy" decoding="async" draggable="false"></button>';
        }).join("") + "</div></div>" +
        '<div class="gal__bar"><span class="gal__hint">' + esc(finePointer ? L.galleryHint : L.galleryHintTouch) + "</span>" +
        '<button class="gal__toggle" type="button" aria-expanded="false">' + esc(L.galleryOpen) + "</button></div></div></div>" +
        "</div></article>";
    }).join("");

    /* футер */
    var F = D.footer;
    $("#footer").innerHTML =
      '<div class="footer__head"><h2 class="footer__title"><span class="mask"><span>' + esc(F.heading) + "</span></span></h2>" +
      '<p class="footer__org" data-reveal>' + esc(F.organizer) + "<span>" + esc(F.address) + "</span></p></div>" +
      '<div class="people">' + F.people.map(function (p, i) {
        return '<div class="person" data-reveal data-delay="' + (i * 0.08) + '"><p class="person__role">' + esc(p.role) + '</p><p class="person__name">' + esc(p.name) + "</p>" +
          '<p class="person__links"><a href="' + telHref(p.phone) + '">' + esc(p.phone) + '</a><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a></p></div>";
      }).join("") + "</div>" +
      '<div class="footer__bottom"><a class="footer__logo" href="' + esc(D.brand.logoHref) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(D.brand.logoLabel) + '"><img src="' + esc(L0.src) + '" srcset="' + esc(L0.srcset) + '" sizes="(min-width: 768px) 240px, 200px" alt="' + esc(D.brand.logoAlt) + '" width="' + L0.width + '" height="' + L0.height + '" loading="lazy"></a>' +
      '<a href="' + esc(F.website.href) + '" target="_blank" rel="noopener noreferrer">' + esc(F.website.label) + "</a><span>" + esc(F.copyright) + "</span></div>";

    var LB = D.ui.lightbox;
    $("#lb").setAttribute("aria-label", LB.label);
    $("#lb-close").innerHTML = ICON.back + "<span>" + esc(LB.back) + "</span>"; $("#lb-close").setAttribute("aria-label", LB.back);
    $("#lb-prev").innerHTML = ICON.prev; $("#lb-prev").setAttribute("aria-label", LB.prev);
    $("#lb-next").innerHTML = ICON.next; $("#lb-next").setAttribute("aria-label", LB.next);
  }

  /* строка документа: PDF открывается во встроенном просмотре (data-pdf-view), внешняя ссылка или «скоро» */
  function doc(href, label, dlName, external, note, evTitle) {
    if (!href) {
      return '<li><span class="doc is-soon" role="link" aria-disabled="true"><span class="doc__label">' + esc(label) + '</span><span class="doc__meta soon">' + esc(D.eventsSection.labels.soon) + '</span><span class="doc__ico">' + ICON.soon + "</span></span></li>";
    }
    var title = label + (evTitle ? " · " + evTitle.replace(/[«»]/g, "") : "");
    var attrs = external ? ' target="_blank" rel="noopener noreferrer" aria-label="' + esc(label + (note ? " (" + note + ")" : "")) + '"'
      : ' target="_blank" rel="noopener" data-pdf-view data-title="' + esc(title) + '" data-download="' + esc(dlName || "") + '"';
    return '<li><a class="doc" href="' + esc(href) + '"' + attrs + '><span class="doc__label">' + esc(label) + "</span>" +
      '<span class="doc__ico">' + (external ? ICON.external : ICON.eye) + "</span></a></li>";
  }

  /* ================= мобильное меню ================= */
  function initMenu() {
    var btn = $("#burger"), panel = $("#mnav"), header = $("#header");
    function set(open) {
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? D.ui.menuClose : D.ui.menu);
      header.classList.toggle("is-menu", open);
      panel.hidden = !open;
    }
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { set(false); btn.focus(); } });
    window.addEventListener("resize", function () { if (innerWidth >= 768 && !panel.hidden) set(false); });
  }

  /* ================= scroll, header, reveal ================= */
  function initScroll() {
    /* пока открыт просмотр PDF, плавный скролл страницы на паузе */
    document.addEventListener("pdfviewer:open", function () { if (lenis) lenis.stop(); });
    document.addEventListener("pdfviewer:close", function () { if (lenis) lenis.start(); });
    var header = $("#header");
    /* вверху страницы логотип крупный, после прокрутки шапка компактная */
    function stuck() { header.classList.toggle("is-stuck", window.scrollY > 24); }
    window.addEventListener("scroll", stuck, { passive: true }); stuck();

    /* плавный скролл включаем после загрузки, чтобы не мешать первой отрисовке */
    function startLenis() {
      if (reduce || !window.Lenis || lenis) return;
      lenis = new window.Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
    if (document.readyState === "complete") startLenis(); else window.addEventListener("load", function () { setTimeout(startLenis, 50); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id === "#top") { e.preventDefault(); if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); return; }
      var t = id.length > 1 ? $(id) : null;
      if (t && lenis) { e.preventDefault(); lenis.scrollTo(t, { offset: -84 }); }
    });
  }

  function initReveal() {
    var blocks = $$("[data-reveal]"), masks = $$(".mask > span");
    if (!("IntersectionObserver" in window)) { root.classList.add("no-anim"); return; }
    var hero = $(".hero");
    /* .is-in снимает CSS-стартовое состояние, чтобы clearProps не вернул элемент назад */
    function mark() { this.targets().forEach(function (t) { t.classList.add("is-in"); }); }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var d = parseFloat(el.getAttribute("data-delay")) || 0;
        if (reduce) { gsap.to(el, { opacity: 1, duration: .4 }); return; }
        if (el.classList.contains("mask")) {
          gsap.to(el.firstElementChild, { y: 0, duration: 1.1, delay: d, ease: "expo.out", clearProps: "transform", onStart: mark });
        } else {
          gsap.to(el, { opacity: 1, y: 0, duration: el.classList.contains("row") ? .6 : .8, delay: d, ease: "power3.out", clearProps: "transform", onStart: mark });
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });

    /* стартовое состояние уже задано в CSS — не пишем стили заранее, чтобы не провоцировать пересчёт раскладки */
    masks.forEach(function (m, i) {
      if (reduce) return;
      if (hero.contains(m)) gsap.to(m, { y: 0, duration: .85, delay: .05 + i * .08, ease: "expo.out", clearProps: "transform", onStart: mark });
      else io.observe(m.parentNode);   /* наблюдаем саму маску: сдвинутый внутрь span обрезан и не «пересекается» */
    });
    blocks.forEach(function (b) {
      if (hero.contains(b) && !b.classList.contains("row")) { gsap.to(b, { opacity: 1, y: 0, duration: .7, delay: .05 + (parseFloat(b.getAttribute("data-delay")) || 0), ease: "power3.out", clearProps: "transform", onStart: mark }); return; }
      io.observe(b);
    });

  }

  /* ================= gallery ================= */
  var galleries = [];
  var lb = { open: false };

  function Gallery(el, ev) {
    this.el = el; this.ev = ev;
    this.stage = $(".gal__stage", el);
    this.cards = $$(".gal__card", el);
    this.toggle = $(".gal__toggle", el);
    this.expanded = false;
    this.lastPointer = "mouse";
    this.calc();
    this.apply(false);
    this.bind();
  }

  /* раскладки: «скомканная» стопка и ровная сетка без пересечений и без «сирот» */
  Gallery.prototype.calc = function () {
    var n = this.cards.length, s = this.stage;
    if (!this.expanded) s.style.height = "";
    var W = s.clientWidth;
    var restH = this.expanded && this.restH ? this.restH : s.clientHeight;
    var mobile = W < 560;
    var cols = mobile ? 2 : (n % 3 === 0 || n > 4 ? 3 : 2);
    var gap = mobile ? 8 : 12;
    var cw = (W - gap * (cols - 1)) / cols;
    var ch = cw * 2 / 3;
    var rows = Math.ceil(n / cols);
    var tilt = [-.8, .6, -.5, .7, -.6, .5, -.7, .6, -.5];
    var exp = [], y = 0;
    for (var r = 0; r < rows; r++) {
      var first = r * cols, inRow = Math.min(cols, n - first);
      /* неполный последний ряд растягиваем на всю ширину: одиночный кадр — широкой плиткой */
      var w = inRow === cols ? cw : (W - gap * (inRow - 1)) / inRow;
      var h = inRow === 1 && cols > 1 ? Math.min(W / 2, ch * 1.6) : ch;
      for (var c = 0; c < inRow; c++) {
        var i = first + c;
        exp.push({ x: c * (w + gap), y: y, width: w, height: h, rotation: tilt[i % 9], scale: 1 });
      }
      y += h + gap;
    }
    var gridH = y - gap;
    this.restH = restH;
    this.expH = Math.max(restH, gridH);
    var top = (this.expH - gridH) / 2;
    exp.forEach(function (p) { p.y += top; });
    this.expPos = exp;

    var sc = Math.max(1, Math.min(2.2, (restH * .74) / ch, (W * (mobile ? .78 : .64)) / cw));
    var ox = [0, -52, 58, -86, 90, -26, 44, -64, 70];
    var oy = [0, 14, -16, 22, -20, 9, -7, 18, -12];
    var rt = [-3, 6, -8, 9, -5, 7, -10, 4, -6];
    var k = mobile ? .3 : 1;
    this.restPos = [];
    for (var j = 0; j < n; j++) {
      this.restPos.push({ x: (W - cw) / 2 + ox[j % 9] * k, y: (restH - ch) / 2 + oy[j % 9] * k, width: cw, height: ch, rotation: rt[j % 9], scale: sc });
    }
    for (var m = 0; m < n; m++) this.cards[m].style.zIndex = n - m;
  };

  Gallery.prototype.apply = function (expanded) {
    var pos = expanded ? this.expPos : this.restPos;
    for (var i = 0; i < this.cards.length; i++) gsap.set(this.cards[i], pos[i]);
    this.stage.style.height = expanded && this.expH > this.restH ? this.expH + "px" : "";
  };

  Gallery.prototype.setState = function (expanded) {
    if (this.expanded === expanded) return;
    var self = this;
    this.expanded = expanded;
    this.el.classList.toggle("is-open", expanded);
    this.toggle.setAttribute("aria-expanded", String(expanded));
    this.toggle.textContent = expanded ? D.eventsSection.labels.galleryClose : D.eventsSection.labels.galleryOpen;
    var pos = expanded ? this.expPos : this.restPos;
    /* гасим только позиционные твины карточек; появление блока анимируется на обёртке и не страдает */
    gsap.killTweensOf(this.cards, "x,y,width,height,rotation,scale");
    gsap.killTweensOf(this.stage);
    if (reduce) { this.apply(expanded); return; }
    var n = this.cards.length;
    this.cards.forEach(function (c, i) {
      gsap.to(c, Object.assign({}, pos[i], {
        duration: expanded ? 1.1 : .75,
        ease: expanded ? "elastic.out(1, 0.8)" : "expo.inOut",
        delay: (expanded ? i : n - 1 - i) * (expanded ? .055 : .035)
      }));
    });
    if (this.expH > this.restH) {
      gsap.to(this.stage, { height: expanded ? this.expH : this.restH, duration: .7, ease: "power3.inOut", onComplete: function () { if (!self.expanded) self.stage.style.height = ""; } });
    }
  };

  Gallery.prototype.bind = function () {
    var self = this, st = this.stage;
    st.addEventListener("pointerdown", function (e) { self.lastPointer = e.pointerType; });
    st.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") self.setState(true); });
    st.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && !lb.open) self.setState(false); });
    st.addEventListener("click", function (e) {
      var card = e.target.closest(".gal__card");
      if (!self.expanded) { self.setState(true); return; }
      if (card) { openLB(self, +card.getAttribute("data-i"), card); return; }
      if (self.lastPointer !== "mouse") self.setState(false);
    });
    st.addEventListener("focusin", function (e) { if (e.target.matches(":focus-visible")) self.setState(true); });
    st.addEventListener("focusout", function (e) {
      if (!st.contains(e.relatedTarget) && !lb.open && !st.matches(":hover")) self.setState(false);
    });
    this.toggle.addEventListener("click", function () { self.setState(!self.expanded); });
  };

  function initGalleries() {
    /* стопку раскладываем, когда галерея подходит к экрану: меньше работы при первой загрузке */
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        gio.unobserve(en.target);
        galleries.push(new Gallery(en.target, D._sorted[+en.target.getAttribute("data-gal")]));
      });
    }, { rootMargin: "100% 0px 100% 0px" });
    $$(".gal").forEach(function (el) { gio.observe(el); });
    var t, lastW = innerWidth;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        if (innerWidth === lastW) return;   /* на мобильных resize прилетает при скрытии адресной строки */
        lastW = innerWidth;
        galleries.forEach(function (g) {
          gsap.killTweensOf(g.cards, "x,y,width,height,rotation,scale"); gsap.killTweensOf(g.stage);
          var was = g.expanded;
          g.expanded = false; g.calc(); g.expanded = was;
          g.apply(was);
        });
      }, 150);
    });
  }

  /* ================= lightbox ================= */
  var fig, img, bg, bClose, bPrev, bNext, count, chrome, lastFocus = null;

  function fit(p) {
    var vw = innerWidth, vh = innerHeight;
    var maxW = vw < 640 ? vw - 16 : vw - 160, maxH = vh * (vw < 640 ? .72 : .86);
    var r = p.w / p.h, w = maxW, h = w / r;
    if (h > maxH) { h = maxH; w = h * r; }
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  }
  function setRect(el, r) { el.style.left = r.left + "px"; el.style.top = r.top + "px"; el.style.width = r.width + "px"; el.style.height = r.height + "px"; }
  /* прямоугольник карточки без учёта поворота: центр + собственный размер × scale */
  function cardRect(c) {
    var r = c.getBoundingClientRect(), s = gsap.getProperty(c, "scale") || 1;
    var w = c.offsetWidth * s, h = c.offsetHeight * s;
    return { left: r.left + r.width / 2 - w / 2, top: r.top + r.height / 2 - h / 2, width: w, height: h };
  }
  function updateMeta() {
    var p = lb.g.ev.photos[lb.i];
    img.alt = p.alt;
    count.textContent = pad(lb.i + 1) + " / " + pad(lb.g.ev.photos.length);
  }

  function openLB(g, i, card) {
    if (lb.open) return;
    lb.open = true; lb.g = g; lb.i = i;
    if (window.OverlayHistory) OverlayHistory.push("lb", function () { closeLB(true); });
    lastFocus = document.activeElement;
    var p = g.ev.photos[i];
    lb.el.hidden = false;
    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";
    img.src = p.src;
    updateMeta();
    var to = fit(p);
    gsap.killTweensOf([fig, bg].concat(chrome));
    if (reduce) {
      setRect(fig, to);
      gsap.fromTo([bg, fig].concat(chrome), { opacity: 0 }, { opacity: 1, duration: .25 });
    } else {
      setRect(fig, cardRect(card));
      gsap.set(fig, { opacity: 1, rotation: gsap.getProperty(card, "rotation") });
      var done = false, go = function () {
        if (done) return; done = true;
        gsap.to(bg, { opacity: 1, duration: .45 });
        gsap.to(fig, { left: to.left, top: to.top, width: to.width, height: to.height, rotation: 0, duration: .8, ease: "expo.out" });
        gsap.to(chrome, { opacity: 1, duration: .4, delay: .3 });
      };
      if (img.decode) img.decode().then(go, go); else go();
      setTimeout(go, 300);
    }
    bClose.focus({ preventScroll: true });
  }

  function closeLB(fromHistory) {
    if (!lb.open || lb.closing) return;
    lb.closing = true;
    if (fromHistory !== true && window.OverlayHistory) OverlayHistory.release("lb");
    var g = lb.g, card = g.cards[lb.i];
    gsap.killTweensOf([fig, bg].concat(chrome));
    function finish() {
      lb.el.hidden = true; lb.open = false; lb.closing = false;
      document.body.style.overflow = "";
      if (lenis) lenis.start();
      img.removeAttribute("src");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      galleries.forEach(function (x) {
        if (x.expanded && x.lastPointer === "mouse" && !x.stage.matches(":hover") && !x.stage.contains(document.activeElement)) x.setState(false);
      });
    }
    gsap.to(chrome, { opacity: 0, duration: .2 });
    gsap.to(bg, { opacity: 0, duration: reduce ? .2 : .5 });
    if (reduce || !g.expanded) { gsap.to(fig, { opacity: 0, duration: .25, onComplete: finish }); return; }
    var r = cardRect(card);
    gsap.to(fig, { left: r.left, top: r.top, width: r.width, height: r.height, rotation: gsap.getProperty(card, "rotation"), duration: .6, ease: "expo.inOut", onComplete: finish });
  }

  function navLB(dir) {
    if (!lb.open) return;
    var n = lb.g.ev.photos.length;
    lb.i = (lb.i + dir + n) % n;
    var p = lb.g.ev.photos[lb.i];
    gsap.killTweensOf(img); gsap.killTweensOf(fig);
    function swap() {
      img.src = p.src; updateMeta();
      var to = fit(p);
      if (reduce) { setRect(fig, to); gsap.to(img, { opacity: 1, duration: .2 }); return; }
      gsap.to(fig, { left: to.left, top: to.top, width: to.width, height: to.height, duration: .5, ease: "power3.out" });
      gsap.fromTo(img, { opacity: 0, x: 40 * dir }, { opacity: 1, x: 0, duration: .45, ease: "power3.out" });
    }
    gsap.to(img, { opacity: 0, x: -40 * dir, duration: reduce ? .1 : .18, ease: "power2.in", onComplete: swap });
  }

  function initLightbox() {
    lb.el = $("#lb"); fig = $("#lb-fig"); img = $("#lb-img"); bg = $(".lb__bg");
    bClose = $("#lb-close"); bPrev = $("#lb-prev"); bNext = $("#lb-next"); count = $("#lb-count");
    chrome = [bClose, bPrev, bNext, count];
    lb.el.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeLB(); });
    bPrev.addEventListener("click", function () { navLB(-1); });
    bNext.addEventListener("click", function () { navLB(1); });
    document.addEventListener("keydown", function (e) {
      if (!lb.open) return;
      if (e.key === "Escape") { e.preventDefault(); closeLB(); }
      else if (e.key === "ArrowLeft") navLB(-1);
      else if (e.key === "ArrowRight") navLB(1);
      else if (e.key === "Tab") {
        var f = [bClose, bPrev, bNext], k = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    var sx = null, sy = 0;
    lb.el.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; });
    lb.el.addEventListener("pointerup", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) navLB(dx < 0 ? 1 : -1);
    });
    window.addEventListener("resize", function () { if (lb.open) setRect(fig, fit(lb.g.ev.photos[lb.i])); });
  }

  /* ================= boot ================= */
  renderStatic();
  root.classList.remove("pending");
  initMenu();
  function enhance() {
    gsap = window.gsap || null;
    initScroll();
    if (!gsap) { root.classList.add("no-anim"); return; }
    /* короткими задачами, чтобы не блокировать главный поток одной длинной */
    initReveal();
    setTimeout(function () { initGalleries(); initLightbox(); }, 0);
  }
  /* анимации подключаем после первой отрисовки: страница появляется сразу, тяжёлая инициализация не блокирует её */
  function later() { requestAnimationFrame(function () { setTimeout(enhance, 0); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", later); else later();
})();
