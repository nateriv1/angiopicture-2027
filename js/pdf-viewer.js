/*
 * PdfViewer — полноэкранный просмотр PDF прямо на сайте (PDF.js, локально).
 * Использование: PdfViewer.open({ src: "assets/pdf/file.pdf", title: "Заголовок", downloadName: "file.pdf" })
 * Ссылки с атрибутом data-pdf-view открывают окно автоматически (href = путь к PDF,
 * data-title — заголовок, data-download — имя файла при скачивании). Без JS ссылка просто откроет PDF.
 * PDF.js и его worker грузятся только при первом открытии окна.
 */
(function () {
  "use strict";

  var LIB = "js/pdfjs/pdf.min.mjs";
  var WORKER = "js/pdfjs/pdf.worker.min.mjs";
  var ASSETS = "js/pdfjs/";
  var ZMIN = 0.5, ZMAX = 4, ZSTEP = 0.25;
  var MAX_DPR = 2;            /* потолок плотности рендера */
  var MAX_PIXELS = 12e6;      /* потолок площади одного canvas (iOS ограничивает ~16,7 млн) */

  var T = {
    download: "Скачать", close: "Закрыть", zoomIn: "Увеличить", zoomOut: "Уменьшить", fit: "По ширине",
    loading: "Загружаем документ…", error: "Не удалось открыть документ в браузере.",
    openTab: "Открыть в новой вкладке", page: "Страница", of: "из"
  };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ICON = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v13m0 0l-5-5m5 5l5-5M5 20h14"/></svg>'
  };

  var libPromise = null;
  var docs = {};             /* кэш открытых документов по src */
  var el = null, ui = {};
  var state = null;          /* текущий просмотр */
  var lastFocus = null;

  function loadLib() {
    if (!libPromise) {
      libPromise = import(new URL(LIB, document.baseURI).href).then(function (lib) {
        lib.GlobalWorkerOptions.workerSrc = new URL(WORKER, document.baseURI).href;
        return lib;
      });
      libPromise.catch(function () { libPromise = null; });
    }
    return libPromise;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- разметка окна (создаётся один раз) ---------- */
  function build() {
    var D = window.SITE_DATA;
    if (D && D.ui && D.ui.pdf) Object.keys(D.ui.pdf).forEach(function (k) { T[k] = D.ui.pdf[k]; });
    el = document.createElement("div");
    el.className = "pdfv";
    el.hidden = true;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "pdfv-title");
    el.setAttribute("data-lenis-prevent", "");
    el.innerHTML =
      '<div class="pdfv__bar">' +
        '<p class="pdfv__title" id="pdfv-title"></p>' +
        '<div class="pdfv__zoom" role="group">' +
          '<button type="button" class="pdfv__ibtn" data-z="-" aria-label="' + T.zoomOut + '">' + ICON.minus + "</button>" +
          '<button type="button" class="pdfv__pct" data-z="fit" aria-label="' + T.fit + '">100%</button>' +
          '<button type="button" class="pdfv__ibtn" data-z="+" aria-label="' + T.zoomIn + '">' + ICON.plus + "</button>" +
        "</div>" +
        '<a class="pdfv__dl" download><span>' + T.download + "</span>" + ICON.download + "</a>" +
        '<button type="button" class="pdfv__ibtn pdfv__close" aria-label="' + T.close + '">' + ICON.close + "</button>" +
      "</div>" +
      '<div class="pdfv__body" tabindex="-1"><div class="pdfv__pages"></div><div class="pdfv__status" aria-live="polite"></div></div>' +
      '<button type="button" class="pdfv__thumb">' + ICON.close + "<span>" + T.close + "</span></button>";
    document.body.appendChild(el);
    ui.title = el.querySelector(".pdfv__title");
    ui.dl = el.querySelector(".pdfv__dl");
    ui.pct = el.querySelector(".pdfv__pct");
    ui.body = el.querySelector(".pdfv__body");
    ui.pages = el.querySelector(".pdfv__pages");
    ui.status = el.querySelector(".pdfv__status");

    el.querySelector(".pdfv__close").addEventListener("click", close);
    el.querySelector(".pdfv__thumb").addEventListener("click", close);
    el.querySelectorAll("[data-z]").forEach(function (b) {
      b.addEventListener("click", function () {
        var z = b.getAttribute("data-z");
        if (!state) return;
        if (z === "fit") setZoom(1);
        else setZoom(state.zoom + (z === "+" ? ZSTEP : -ZSTEP));
      });
    });
    el.addEventListener("keydown", onKey);
    /* Ctrl + колесо (и щипок на тачпаде) — масштаб */
    ui.body.addEventListener("wheel", function (e) {
      if (!e.ctrlKey || !state) return;
      e.preventDefault();
      setZoom(state.zoom * Math.exp(-e.deltaY * 0.0025), e.clientX, e.clientY, true);
    }, { passive: false });
    initPinch();
    window.addEventListener("resize", function () {
      if (!state) return;
      clearTimeout(state.resizeT);
      state.resizeT = setTimeout(function () { layout(); rerender(); }, 150);
    });
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) { e.preventDefault(); setZoom(state.zoom + ZSTEP); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === "-") { e.preventDefault(); setZoom(state.zoom - ZSTEP); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === "0") { e.preventDefault(); setZoom(1); return; }
    if (e.key !== "Tab") return;
    var f = [].slice.call(el.querySelectorAll("button, a[href], [tabindex='0']")).filter(function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  }

  /* ---------- открытие / закрытие ---------- */
  function open(opts) {
    if (!el) build();
    if (state) close(true);
    lastFocus = document.activeElement;
    state = { src: opts.src, zoom: 1, pages: [], visible: {}, tasks: {}, gen: 0 };
    /* «Документ · Мероприятие» — две строки: название документа и мелкая подпись */
    var parts = String(opts.title || "").split(" · ");
    ui.title.innerHTML = "<span>" + esc(parts[0]) + "</span>" + (parts[1] ? "<small>" + esc(parts.slice(1).join(" · ")) + "</small>" : "");
    ui.dl.href = opts.src;
    ui.dl.setAttribute("download", opts.downloadName || "");
    ui.pages.innerHTML = "";
    ui.body.scrollTop = 0; ui.body.scrollLeft = 0;
    ui.pct.textContent = "100%";
    status('<span class="pdfv__spin" aria-hidden="true"></span>' + T.loading);

    el.hidden = false;
    document.documentElement.classList.add("pdfv-open");
    document.dispatchEvent(new CustomEvent("pdfviewer:open"));
    requestAnimationFrame(function () { el.classList.add("is-open"); });
    el.querySelector(".pdfv__close").focus({ preventScroll: true });

    var my = state;
    loadLib().then(function (lib) {
      if (state !== my) return;
      if (!docs[opts.src]) {
        docs[opts.src] = lib.getDocument({
          url: opts.src,
          cMapUrl: ASSETS + "cmaps/", cMapPacked: true,
          standardFontDataUrl: ASSETS + "standard_fonts/",
          wasmUrl: ASSETS + "wasm/"
        }).promise;
        docs[opts.src].catch(function () { delete docs[opts.src]; });
      }
      return docs[opts.src];
    }).then(function (doc) {
      if (state !== my || !doc) return;
      my.doc = doc;
      return setupPages(doc, my);
    }).catch(function (err) {
      if (state !== my) return;
      if (window.console) console.warn("PdfViewer:", err);
      status('<p class="pdfv__err">' + T.error + "</p>" +
        '<p class="pdfv__actions"><a class="pdfv__btn" href="' + esc(opts.src) + '" target="_blank" rel="noopener">' + T.openTab + "</a>" +
        '<a class="pdfv__btn pdfv__btn--ghost" href="' + esc(opts.src) + '" download="' + esc(opts.downloadName || "") + '">' + T.download + "</a></p>");
    });
  }

  function close(silent) {
    if (!state) return;
    var s = state;
    state = null;
    Object.keys(s.tasks).forEach(function (k) { try { s.tasks[k].cancel(); } catch (e) {} });
    if (s.io) s.io.disconnect();
    el.classList.remove("is-open");
    var done = function () {
      if (state) return;
      el.hidden = true;
      /* освобождаем память canvas */
      ui.pages.querySelectorAll("canvas").forEach(function (c) { c.width = c.height = 0; });
      ui.pages.innerHTML = "";
    };
    if (reduce || silent) done(); else setTimeout(done, 320);
    document.documentElement.classList.remove("pdfv-open");
    document.dispatchEvent(new CustomEvent("pdfviewer:close"));
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function status(html) {
    ui.status.innerHTML = html || "";
    ui.status.hidden = !html;
  }

  /* ---------- страницы ---------- */
  function setupPages(doc, my) {
    var jobs = [];
    for (var i = 1; i <= doc.numPages; i++) jobs.push(doc.getPage(i));
    return Promise.all(jobs).then(function (pages) {
      if (state !== my) return;
      status("");
      pages.forEach(function (page, idx) {
        var vp = page.getViewport({ scale: 1 });
        var box = document.createElement("div");
        box.className = "pdfv__page";
        box.style.aspectRatio = vp.width + " / " + vp.height;
        box.setAttribute("role", "img");
        box.setAttribute("aria-label", T.page + " " + (idx + 1) + " " + T.of + " " + pages.length);
        box.setAttribute("data-i", idx);
        ui.pages.appendChild(box);
        my.pages.push({ page: page, box: box, w: vp.width, h: vp.height, key: "" });
      });
      layout();
      my.io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var i = +en.target.getAttribute("data-i");
          if (en.isIntersecting) { my.visible[i] = true; renderPage(my, i); }
          else delete my.visible[i];
        });
      }, { root: ui.body, rootMargin: "120% 0px" });
      my.pages.forEach(function (p) { my.io.observe(p.box); });
      ui.body.focus({ preventScroll: true });
    });
  }

  function fitWidth() {
    var cs = getComputedStyle(ui.pages);
    var pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    return Math.max(200, Math.min(ui.body.clientWidth - pad, 860));
  }

  function layout() {
    if (!state) return;
    ui.pages.style.setProperty("--pw", Math.round(fitWidth() * state.zoom) + "px");
  }

  function renderPage(my, i) {
    if (state !== my) return;
    var p = my.pages[i];
    var cssW = p.box.clientWidth;
    if (!cssW) return;
    var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    var scale = cssW / p.w * dpr;
    if (p.w * p.h * scale * scale > MAX_PIXELS) scale = Math.sqrt(MAX_PIXELS / (p.w * p.h));
    var key = scale.toFixed(3);
    if (p.key === key) return;
    p.key = key;
    if (my.tasks[i]) { try { my.tasks[i].cancel(); } catch (e) {} }
    var vp = p.page.getViewport({ scale: scale });
    var canvas = document.createElement("canvas");
    canvas.width = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);
    canvas.setAttribute("aria-hidden", "true");
    var task = p.page.render({ canvasContext: canvas.getContext("2d", { alpha: false }), viewport: vp });
    my.tasks[i] = task;
    task.promise.then(function () {
      delete my.tasks[i];
      if (state !== my) return;
      var old = p.box.querySelector("canvas");
      p.box.appendChild(canvas);
      if (old) { old.width = old.height = 0; old.remove(); }
      p.box.classList.add("is-ready");
      if (!p.links) addLinks(p);
    }).catch(function () { if (p.key === key) p.key = ""; });
  }

  /* ссылки внутри PDF (например «Фотоотчёт») — прозрачными областями поверх страницы */
  function addLinks(p) {
    p.links = true;
    p.page.getAnnotations().then(function (anns) {
      anns.forEach(function (a) {
        if (a.subtype !== "Link" || !a.url) return;
        var r = a.rect;
        var link = document.createElement("a");
        link.className = "pdfv__link";
        link.href = a.url; link.target = "_blank"; link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", a.url);
        link.style.left = (r[0] / p.w * 100) + "%";
        link.style.top = ((p.h - r[3]) / p.h * 100) + "%";
        link.style.width = ((r[2] - r[0]) / p.w * 100) + "%";
        link.style.height = ((r[3] - r[1]) / p.h * 100) + "%";
        p.box.appendChild(link);
      });
    }).catch(function () {});
  }

  function rerender() {
    if (!state) return;
    clearTimeout(state.rt);
    var my = state;
    my.rt = setTimeout(function () {
      Object.keys(my.visible).forEach(function (i) { renderPage(my, +i); });
    }, 160);
  }

  /* масштаб с сохранением точки под курсором / пальцами */
  function setZoom(z, ax, ay) {
    if (!state || !state.pages.length) return;
    z = Math.max(ZMIN, Math.min(ZMAX, z));
    if (Math.abs(z - state.zoom) < 0.001) return;
    var b = ui.body.getBoundingClientRect();
    if (ax == null) { ax = b.left + b.width / 2; ay = b.top + b.height / 2; }
    var r = ui.pages.getBoundingClientRect();
    var ox = ax - r.left, oy = ay - r.top, k = z / state.zoom;
    state.zoom = z;
    layout();
    var r2 = ui.pages.getBoundingClientRect();
    ui.body.scrollLeft += (r2.left + ox * k) - ax;
    ui.body.scrollTop += (r2.top + oy * k) - ay;
    ui.pct.textContent = Math.round(z * 100) + "%";
    rerender();
  }

  /* щипок двумя пальцами на телефоне: во время жеста — CSS-масштаб, после — перерисовка в нужном разрешении */
  function initPinch() {
    var start = null;
    function dist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
    function mid(t) { return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 }; }
    ui.body.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 2 || !state) return;
      var m = mid(e.touches), r = ui.pages.getBoundingClientRect();
      start = { d: dist(e.touches), m: m, ox: m.x - r.left, oy: m.y - r.top, s: 1 };
      ui.pages.style.transformOrigin = start.ox + "px " + start.oy + "px";
    }, { passive: true });
    ui.body.addEventListener("touchmove", function (e) {
      if (!start || e.touches.length !== 2) return;
      e.preventDefault();
      var z = state.zoom * dist(e.touches) / start.d;
      z = Math.max(ZMIN, Math.min(ZMAX, z));
      start.s = z / state.zoom;
      ui.pages.style.transform = "scale(" + start.s + ")";
    }, { passive: false });
    function end() {
      if (!start) return;
      var s = start.s, m = start.m;
      start = null;
      ui.pages.style.transform = "";
      ui.pages.style.transformOrigin = "";
      if (state && Math.abs(s - 1) > 0.01) setZoom(state.zoom * s, m.x, m.y);
    }
    ui.body.addEventListener("touchend", end);
    ui.body.addEventListener("touchcancel", end);
  }

  /* ---------- автоподключение ссылок data-pdf-view ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-pdf-view]");
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    open({ src: a.getAttribute("href"), title: a.getAttribute("data-title") || "", downloadName: a.getAttribute("data-download") || "" });
  });

  window.PdfViewer = { open: open, close: function () { close(); }, texts: T };
})();
