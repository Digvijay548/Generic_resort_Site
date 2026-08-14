(function () {
  "use strict";

  var DATA = window.RESORT_DATA;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function waHref(message) {
    return (
      "https://wa.me/" +
      DATA.whatsapp.number +
      "?text=" +
      encodeURIComponent(message || DATA.whatsapp.message)
    );
  }

  var ICONS = {
    generic:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/></svg>',
    pool:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7c1.6-1 2.6-1 4.2 0s2.6 1 4.2 0 2.6-1 4.2 0 2.6 1 4.2 0"/><path d="M4 12c1.6-1 2.6-1 4.2 0s2.6 1 4.2 0 2.6-1 4.2 0 2.6 1 4.2 0"/><path d="M4 17c1.6-1 2.6-1 4.2 0s2.6 1 4.2 0 2.6-1 4.2 0 2.6 1 4.2 0"/></svg>',
    parking:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a2.5 2.5 0 0 1 0 5H9"/></svg>',
    ac:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M4.9 6.5l14.2 11M4.9 17.5l14.2-11M12 2l-2 2M12 2l2 2M12 22l-2-2M12 22l2-2"/></svg>',
    coffee:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h11v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M15 9h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M7 2v2M10 2v2M13 2v2"/></svg>',
    wifi:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8.5a14 14 0 0 1 19 0M5.5 12a9.5 9.5 0 0 1 13 0M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></svg>',
    food:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2v7M5 2v5a2 2 0 0 0 2 2v13M17 2v20M17 2c-2 2-2 5 0 6"/></svg>',
    service:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6a1 1 0 0 1 1-1 1 1 0 0 1 1 1c3 1 5 3 5 7H6c0-4 2-6 5-7z"/><path d="M12 4V3M10 3h4M4 14h16"/><circle cx="12" cy="16.5" r="2"/></svg>',
    buffet:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M3 12a9 9 0 0 1 18 0M3 12c0 2 1.5 3 3 3h12c1.5 0 3-1 3-3"/><path d="M10 15l1 4M14 15l-1 4"/></svg>',
    roomsvc:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 9a6 6 0 0 0-12 0c0 6-2 7-2 7h16s-2-1-2-7z"/><path d="M10.5 20a1.8 1.8 0 0 0 3 0"/></svg>',
    breakfast:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="7"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>',
    storage:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
    cleaning:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.8L18.5 9l-4.7 1.2L12 15l-1.8-4.8L5.5 9l4.7-1.2L12 3z"/><path d="M5 18l3-3M4 21l5-5"/></svg>',
    shuttle:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H4a1 1 0 0 1-1-1v-4l2-5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2l2 5v4a1 1 0 0 1-1 1h-1"/><rect x="4" y="11" width="16" height="4" rx="1"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/><path d="M8 6v5M16 6v5"/></svg>',
    child:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7" r="3"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/></svg>',
    accessible:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="4.5" r="1.8"/><path d="M11 8h5l-1.5 5H12v6M8 12.5a5.5 5.5 0 1 0 7.5 5"/></svg>',
    pet:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><ellipse cx="6" cy="8" rx="2.2" ry="3"/><ellipse cx="11.5" cy="5.5" rx="2.2" ry="3"/><ellipse cx="17" cy="8" rx="2.2" ry="3"/><path d="M12 11c-3 0-5.5 2-5.5 4.5 0 1.5 1 2.5 2 2.5.8 0 1.2-.4 2-.4s1.2.4 2 .4c1 0 2-1 2-2.5C17.5 13 15 11 12 11z"/></svg>',
    petfree:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><ellipse cx="6" cy="8" rx="2.2" ry="3"/><ellipse cx="11.5" cy="5.5" rx="2.2" ry="3"/><ellipse cx="17" cy="8" rx="2.2" ry="3"/><path d="M12 11c-3 0-5.5 2-5.5 4.5 0 1.5 1 2.5 2 2.5.8 0 1.2-.4 2-.4s1.2.4 2 .4c1 0 2-1 2-2.5C17.5 13 15 11 12 11z"/><path d="M3 21L21 3"/></svg>',
    dog:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10c0-4 3.5-6 4.5-2 .5 1.5 1.5 2 3.5 2s3-.5 3.5-2c1-4 4.5-2 4.5 2 0 4-2 5-2 8 0 2-2 4-6 4s-6-2-6-4c0-3-2-4-2-8z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/></svg>',
    cat:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l3 2a6 6 0 0 1 10 0l3-2-1.5 4a6 6 0 0 1-2 9H7.5a6 6 0 0 1-2-9L4 8z"/><circle cx="9.5" cy="13.5" r=".9" fill="currentColor"/><circle cx="14.5" cy="13.5" r=".9" fill="currentColor"/></svg>',
    en:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><text x="12" y="16.5" text-anchor="middle" font-size="9" font-weight="bold" fill="currentColor" stroke="none">EN</text></svg>',
    hi:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><text x="12" y="16.5" text-anchor="middle" font-size="9" font-weight="bold" fill="currentColor" stroke="none">&#2361;&#2367;&#2306;</text></svg>',
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4 14.9l-.4-.2-3 .8.8-2.9-.2-.4A8 8 0 0 1 12 4zm-3.2 4.6c-.2 0-.5 0-.7.3-.2.3-.8.8-.8 2s.8 2 1 2.3c.1.3 1.6 2.5 4 3.4 2 .8 2.4.6 2.8.6.5 0 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.7-.4l-1.4-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.8-.4-1.6-.9-2.2-1.7-.4-.5-.7-1-.8-1.2 0-.2 0-.3.1-.4l.5-.6c.1-.2.2-.3.1-.5l-.6-1.5c-.2-.4-.4-.4-.6-.4z"/></svg>',
    pin:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h3l.5-3H13V9.2c0-.9.3-1.7 1.7-1.7H16.6V4.9c-.3 0-1.3-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4.1V11H7v3h3v8h3z"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12s0-3.5-.5-5.1c-.3-1-1.1-1.8-2.1-2C17.8 4.4 12 4.4 12 4.4s-5.8 0-7.4.5c-1 .2-1.8 1-2.1 2C2 8.5 2 12 2 12s0 3.5.5 5.1c.3 1 1.1 1.8 2.1 2 1.6.5 7.4.5 7.4.5s5.8 0 7.4-.5c1-.2 1.8-1 2.1-2 .5-1.6.5-5.1.5-5.1zM10 15.5v-7l6 3.5-6 3.5z"/></svg>',
    leaf:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z"/><path d="M5 19c3-6 7-9 11-11"/></svg>',
    drop:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3z"/></svg>',
    sparkle:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.8L18.5 9l-4.7 1.2L12 15l-1.8-4.8L5.5 9l4.7-1.2L12 3z"/></svg>',
    sun:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>',
    wave:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12c1.5-1 2.5-1 4 0s2.5 1 4 0 2.5-1 4 0 2.5 1 4 0 2.5-1 4 0"/></svg>',
    tree:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l4 6H8l4-6z"/><path d="M8.5 9h7l-3.5 5-3.5-5z"/><rect x="11" y="14" width="2" height="6"/></svg>',
    flower:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="6.5" r="1.8"/><circle cx="17" cy="9" r="1.8"/><circle cx="15.5" cy="14.8" r="1.8"/><circle cx="8.5" cy="14.8" r="1.8"/><circle cx="7" cy="9" r="1.8"/></svg>',
    bird:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16c4-2 7-5 8-10 2 4 5 7 9 8-4 0-7 1-9 4-1-1-3-2-8-2z"/></svg>',
  };

  /* Hero ambient particles — add icons here to grow the pool */
  var HERO_EFFECTS = {
    particles: 16,
    colors: ["#ffffff", "#f5c878", "#8cd2be", "#ffeeb0", "#a9e0f0"],
    icons: ["leaf", "drop", "sparkle", "sun", "wave", "tree", "flower", "bird"],
  };

  function createPicture(photoObj, opts) {
    opts = opts || {};
    var wrapper = document.createElement("figure");
    wrapper.className = "img-frame skeleton" + (opts.className ? " " + opts.className : "");

    var pic = document.createElement("picture");
    var srcs = "";
    var hasWebp = photoObj.webp && photoObj.webp !== photoObj.jpg;
    if (opts.media) {
      if (hasWebp) srcs += '<source media="' + esc(opts.media) + '" srcset="' + photoObj.webp + '" type="image/webp">';
      srcs += '<source media="' + esc(opts.media) + '" srcset="' + photoObj.jpg + '">';
    } else if (hasWebp) {
      srcs += '<source srcset="' + photoObj.webp + '" type="image/webp">';
    }
    var loading = opts.eager ? "eager" : "lazy";
    var extra = opts.eager ? ' fetchpriority="high"' : "";
    pic.innerHTML =
      srcs +
      '<img src="' + photoObj.jpg + '" alt="' + esc(photoObj.alt) + '" loading="' + loading + '" decoding="async"' + extra + ">";

    var img = pic.querySelector("img");
    if (img.complete) {
      if (img.naturalWidth > 0) {
        wrapper.classList.add("is-loaded");
        wrapper.classList.remove("skeleton");
      } else {
        wrapper.classList.add("is-loaded", "img-error");
        wrapper.classList.remove("skeleton");
      }
    } else {
      img.addEventListener("load", function () {
        wrapper.classList.add("is-loaded");
        wrapper.classList.remove("skeleton");
      });
      img.addEventListener("error", function () {
        wrapper.classList.add("is-loaded", "img-error");
        wrapper.classList.remove("skeleton");
      });
    }
    wrapper.appendChild(pic);
    return wrapper;
  }

  /* ------------------------------ header / nav ------------------------------ */
  function buildHeader() {
    $("#navLogo").src = DATA.logo.image;
    $("#brandName").textContent = DATA.shortName;

    var navLinks = $("#navLinks");
    DATA.nav.forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      a.dataset.target = item.href.slice(1);
      li.appendChild(a);
      navLinks.appendChild(li);
    });

    var mobileLinks = $("#mobileLinks");
    DATA.nav.forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      li.appendChild(a);
      mobileLinks.appendChild(li);
    });

    $("#navBookBtn").className = "btn btn-gradient btn-sm";
    $("#navBookBtn").href = waHref();
    $("#navBookBtn").textContent = DATA.ui.navBook;
    $("#mobileBookBtn").className = "btn btn-gradient";
    $("#mobileBookBtn").href = waHref();
    $("#mobileBookBtn").textContent = DATA.ui.navBook;
  }

  var navToggle = $("#navToggle");
  var mobileMenu = $("#mobileMenu");

  function initNav() {
    navToggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $all("a", mobileMenu).forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", function (e) {
      if (mobileMenu.classList.contains("open") && !mobileMenu.contains(e.target) && !navToggle.contains(e.target)) {
        mobileMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------ hero ------------------------------ */
  function buildHero() {
    var hero = DATA.hero;
    $("#heroHeading").textContent = hero.heading;
    $("#heroSubtitle").textContent = hero.subtitle;

    $("#heroBookBtn").href = waHref();
    $("#heroCallBtn").href = "tel:" + DATA.phone.tel;
    $("#heroBookBtn").textContent = DATA.ui.hero.book;
    $("#heroCallBtn").textContent = DATA.ui.hero.call;

    var desktop = hero.images[0];
    var mobile = hero.images[1] || desktop;
    var media = $("#heroMedia");
    var pic = document.createElement("picture");
    var html =
      (mobile.webp && mobile.webp !== mobile.jpg
        ? '<source media="(max-width: 992px)" srcset="' + mobile.webp + '" type="image/webp">'
        : "") +
      '<source media="(max-width: 992px)" srcset="' + mobile.jpg + '">' +
      (desktop.webp && desktop.webp !== desktop.jpg
        ? '<source srcset="' + desktop.webp + '" type="image/webp">'
        : "") +
      '<img src="' + desktop.jpg + '" alt="' + esc(desktop.alt) + '" loading="eager" decoding="async" fetchpriority="high">';
    pic.innerHTML = html;
    var img = pic.querySelector("img");
    if (img.complete && img.naturalWidth > 0) {
      media.classList.add("is-loaded");
    } else {
      img.addEventListener("load", function () { media.classList.add("is-loaded"); });
    }
    media.appendChild(pic);
  }

  /* ------------------------------ hero particles ------------------------------ */
  function buildHeroParticles() {
    var cfg = HERO_EFFECTS;
    var hero = $("#home");
    if (!hero) return;

    var wrap = document.createElement("div");
    wrap.className = "hero-particles";
    wrap.id = "heroParticles";
    wrap.setAttribute("aria-hidden", "true");

    var content = hero.querySelector(".hero-content");
    hero.insertBefore(wrap, content);

    for (var i = 0; i < cfg.particles; i++) {
      var p = document.createElement("span");
      p.className = "hero-particle";
      var icon = cfg.icons[i % cfg.icons.length];
      p.innerHTML = ICONS[icon] || ICONS.sparkle;
      var size = 14 + Math.random() * 30;
      p.style.width = size.toFixed(1) + "px";
      p.style.height = size.toFixed(1) + "px";
      p.style.left = (Math.random() * 100).toFixed(2) + "%";
      p.style.top = (8 + Math.random() * 82).toFixed(2) + "%";
      p.style.color = cfg.colors[i % cfg.colors.length];
      p.style.setProperty("--dur", (6 + Math.random() * 8).toFixed(1) + "s");
      p.style.setProperty("--amp", (-(16 + Math.random() * 32)).toFixed(1) + "px");
      p.style.setProperty("--sway", ((Math.random() * 26) - 13).toFixed(1) + "px");
      p.style.setProperty("--op", (0.4 + Math.random() * 0.45).toFixed(2));
      p.style.animationDelay = (-Math.random() * 10).toFixed(1) + "s";
      wrap.appendChild(p);
    }
  }

  /* ------------------------------ about ------------------------------ */
  function buildAbout() {
    var about = DATA.about;
    $("#aboutText").textContent = about.text;
    $("#aboutWaBtn").href = waHref();

    var media = $("#aboutMedia");
    var main = createPicture(about.image, { className: "about-main", eager: true });
    media.appendChild(main);
    var secondary = createPicture(about.imageB, { className: "about-b" });
    media.appendChild(secondary);
  }

  /* ------------------------------ stay & camping ------------------------------ */
  function buildStays() {
    var grid = $("#stayGrid");
    DATA.stays.forEach(function (stay, i) {
      var card = document.createElement("article");
      card.className = "stay-card reveal reveal-d" + (i % 3);

      var media = createPicture(stay.image, { className: "stay-media" });

      var body = document.createElement("div");
      body.className = "stay-body";
      var facs = stay.facilities.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
      var msg = "Hello, I would like to enquire about the " + stay.title + " at The Riverfront Resort & Camping.";
      body.innerHTML =
        "<h3>" + esc(stay.title) + "</h3>" +
        "<p>" + esc(stay.description) + "</p>" +
        '<ul class="stay-facilities">' + facs + "</ul>" +
        '<a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener" href="' + waHref(msg) + '">' + DATA.ui.stay.enquire + "</a>";

      card.appendChild(media);
      card.appendChild(body);
      grid.appendChild(card);
    });
    $("#stayNote").textContent = DATA.stayNote;
  }

  /* ------------------------------ amenities ------------------------------ */
  function buildAmenities() {
    var wrap = $("#amenityCats");
    Object.keys(DATA.amenities).forEach(function (key) {
      var cat = DATA.amenities[key];
      var sec = document.createElement("section");
      sec.className = "amenity-cat reveal";
      var items = cat.items
        .map(function (it) {
          return (
            '<li class="amenity-item">' +
            '<span class="amenity-icon" aria-hidden="true">' + (ICONS[it.icon] || ICONS.generic) + "</span>" +
            "<span>" + esc(it.label) + "</span>" +
            "</li>"
          );
        })
        .join("");
      sec.innerHTML = "<h3>" + esc(cat.title) + "</h3><ul class='amenity-grid'>" + items + "</ul>";
      wrap.appendChild(sec);
    });
  }

  /* ------------------------------ gallery + lightbox ------------------------------ */
  var currentFilter = "All";

  function galleryItemsForFilter() {
    if (currentFilter === "All") return DATA.gallery.slice();
    return DATA.gallery.filter(function (g) { return g.category === currentFilter; });
  }

  function buildGallery() {
    var filters = $("#galleryFilters");
    DATA.galleryFilters.forEach(function (f, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-btn" + (i === 0 ? " active" : "");
      b.textContent = f;
      b.dataset.filter = f;
      b.addEventListener("click", function () { setFilter(f); });
      filters.appendChild(b);
    });

    var grid = $("#galleryGrid");
    DATA.gallery.forEach(function (g, i) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "gallery-item reveal reveal-d" + ((i % 3) + 1);
      item.dataset.index = i;
      item.dataset.category = g.category;
      item.setAttribute("aria-label", "View image: " + g.alt);
      item.appendChild(createPicture(g, { className: "gallery-media" }));
      var label = document.createElement("span");
      label.className = "gallery-label";
      label.textContent = g.category;
      item.appendChild(label);
      item.addEventListener("click", function () { openLightbox(i); });
      grid.appendChild(item);
    });
  }

  function setFilter(filter) {
    currentFilter = filter;
    $all(".filter-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.filter === filter);
    });
    $all(".gallery-item").forEach(function (item) {
      var show = filter === "All" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !show);
    });
  }

  var lightbox = $("#lightbox");
  var lbImage = $("#lbImage");
  var lbCaption = $("#lbCaption");
  var lbCounter = $("#lbCounter");
  var lbItems = [];
  var lbPos = 0;

  function openLightbox(galleryIndex) {
    lbItems = galleryItemsForFilter();
    lbPos = lbItems.findIndex(function (g) {
      return DATA.gallery.indexOf(g) === galleryIndex;
    });
    if (lbPos < 0) lbPos = 0;
    renderLightbox();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-open");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");
  }

  function renderLightbox() {
    var item = lbItems[lbPos];
    lbImage.src = item.webp;
    lbImage.alt = item.alt;
    lbImage.onerror = function () {
      lbImage.onerror = null;
      lbImage.src = item.jpg;
    };
    lbCaption.textContent = item.alt;
    lbCounter.textContent = (lbPos + 1) + " / " + lbItems.length;
  }

  function stepLightbox(dir) {
    lbPos = (lbPos + dir + lbItems.length) % lbItems.length;
    renderLightbox();
  }

  function initLightbox() {
    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lbPrev").addEventListener("click", function () { stepLightbox(-1); });
    $("#lbNext").addEventListener("click", function () { stepLightbox(1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });
  }

  function initGalleryScroll() {
    var grid = $("#galleryGrid");
    var next = $("#gsNext");
    var prev = $("#gsPrev");
    if (!grid || !next || !prev) return;

    function updateArrows() {
      var max = grid.scrollWidth - grid.clientWidth;
      prev.classList.toggle("disabled", grid.scrollLeft <= 4);
      next.classList.toggle("disabled", grid.scrollLeft >= max - 4);
    }

    next.addEventListener("click", function () {
      grid.scrollBy({ left: grid.clientWidth * 0.85, behavior: "smooth" });
    });
    prev.addEventListener("click", function () {
      grid.scrollBy({ left: -grid.clientWidth * 0.85, behavior: "smooth" });
    });
    grid.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();
  }

  /* ------------------------------ important info ------------------------------ */
  function buildInfo() {
    var info = DATA.importantInfo;
    var items = info.items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    $("#infoCard").innerHTML =
      '<div class="info-times">' +
      '<div class="info-time"><p class="it-label">' + esc(DATA.ui.info.checkIn) + "</p><p class=\"it-value\">" + esc(info.checkIn) + "</p></div>" +
      '<div class="info-time"><p class="it-label">' + esc(DATA.ui.info.checkOut) + "</p><p class=\"it-value\">" + esc(info.checkOut) + "</p></div>" +
      "</div>" +
      '<ul class="info-list">' + items + "</ul>";
  }

  /* ------------------------------ location ------------------------------ */
  function buildLocation() {
    var loc = DATA.location;
    var addr = $("#locAddress");
    addr.innerHTML = loc.addressLines.map(esc).join("<br>");

    $("#directionsBtn").href = loc.directionsUrl;
    $("#locCallBtn").href = "tel:" + DATA.phone.tel;
    $("#locWaBtn").href = waHref();

    var iframe = document.createElement("iframe");
    iframe.src = loc.mapEmbedSrc;
    iframe.title = "Google Map showing the location of " + DATA.name;
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.setAttribute("allow", "fullscreen");
    $("#locationMap").appendChild(iframe);
  }

  /* ------------------------------ contact ------------------------------ */
  function buildContact() {
    var phoneLink = $("#contactPhone");
    phoneLink.href = "tel:" + DATA.phone.tel;
    phoneLink.textContent = DATA.phone.display;

    var waLink = $("#contactWa");
    waLink.href = waHref();
    waLink.textContent = DATA.phone.display;

    $("#contactAddress").textContent = DATA.location.addressLines.join(", ");

    var icons = ["phone", "whatsapp", "pin"];
    $all(".contact-info .ci-icon").forEach(function (el, i) {
      el.innerHTML = ICONS[icons[i]] || ICONS.generic;
    });
  }

  /* ------------------------------ form ------------------------------ */
  function initForm() {
    var form = $("#enquiryForm");
    var fields = {
      name: { el: $("#fName"), err: $("#errName"), valid: function (v) { return v.trim().length >= 2; } },
      phone: {
        el: $("#fPhone"),
        err: $("#errPhone"),
        valid: function (v) { return /^[+\d][\d\s\-()]{8,14}$/.test(v.trim()); },
      },
      checkin: { el: $("#fCheckIn"), err: $("#errCheckIn"), valid: function (v, all) { return !v || !all.checkout || all.checkout > v; } },
      checkout: { el: $("#fCheckOut"), err: $("#errCheckOut"), valid: function (v, all) { return !v || !all.checkin || v > all.checkin; } },
      adults: { el: $("#fAdults"), err: null, valid: function (v) { return !v || parseInt(v, 10) >= 1; } },
    };

    function values() {
      return {
        name: fields.name.el.value,
        phone: fields.phone.el.value,
        checkin: fields.checkin.el.value,
        checkout: fields.checkout.el.value,
        adults: fields.adults.el.value || "2",
        children: $("#fChildren").value || "0",
        preference: $("#fPref").value,
        message: $("#fMessage").value,
      };
    }

    function showError(key, msg) {
      var f = fields[key];
      if (!f || !f.err) return;
      f.el.closest(".form-field").classList.toggle("invalid", Boolean(msg));
      f.err.textContent = msg || "";
    }

    function validate() {
      var v = values();
      var allOk = true;

      showError("name", fields.name.valid(v.name) ? "" : "Please enter your full name.");
      showError("phone", fields.phone.valid(v.phone) ? "" : "Please enter a valid phone number.");
      showError("checkin", fields.checkin.valid(v.checkin, v) ? "" : "Check-out must be after check-in.");
      showError("checkout", fields.checkout.valid(v.checkout, v) ? "" : "Check-out must be after check-in.");
      if (fields.adults.valid(v.adults)) {
        showError("adults", "");
      }

      ["name", "phone", "checkin", "checkout"].forEach(function (k) {
        if (!fields[k].valid(v[k], v)) allOk = false;
      });
      return allOk;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      var v = values();
      var lines = [
        DATA.whatsapp.message,
        "",
        "Full Name: " + v.name,
        "Phone: " + v.phone,
        "Check-in: " + (v.checkin || "Not specified"),
        "Check-out: " + (v.checkout || "Not specified"),
        "Adults: " + v.adults,
        "Children: " + v.children,
        "Stay Preference: " + v.preference,
      ];
      if (v.message.trim()) lines.push("Message: " + v.message.trim());

      window.open(waHref(lines.join("\n")), "_blank");

      var btn = $("#sendBtn");
      var original = btn.textContent;
      btn.textContent = "Opening WhatsApp…";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 3000);
    });

    ["name", "phone", "checkin", "checkout"].forEach(function (k) {
      fields[k].el.addEventListener("input", function () {
        showError(k, "");
      });
    });
  }

  /* ------------------------------ footer ------------------------------ */
  function buildFooter() {
    $("#footerName").textContent = DATA.name;
    $("#footerNote").textContent = DATA.footer.note;

    var social = $("#footerSocial");
    DATA.footer.social.forEach(function (s) {
      var a = document.createElement("a");
      a.href = s.href;
      a.setAttribute("aria-label", s.label);
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = ICONS[s.icon] || ICONS.generic;
      social.appendChild(a);
    });

    var links = $("#footerLinks");
    DATA.footer.quickLinks.forEach(function (l) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = l.href;
      a.textContent = l.label;
      li.appendChild(a);
      links.appendChild(li);
    });

    $("#footerAddress").innerHTML = DATA.location.addressLines.map(esc).join("<br>");
    var fp = $("#footerPhone");
    fp.href = "tel:" + DATA.phone.tel;
    fp.textContent = DATA.phone.display;
    $("#footerWaBtn").href = waHref();

    var year = new Date().getFullYear();
    $("#copyright").textContent = "\u00A9 " + year + " " + DATA.footer.copyrightHolder + ". All rights reserved.";
  }

  /* ------------------------------ SEO ------------------------------ */
  function buildSeo() {
    var seo = DATA.seo;
    document.title = seo.title;
    var desc = $("#metaDescription");
    if (desc) desc.setAttribute("content", seo.description);
    var ogTitle = $("#ogTitle");
    if (ogTitle) ogTitle.setAttribute("content", seo.title);
    var ogDesc = $("#ogDescription");
    if (ogDesc) ogDesc.setAttribute("content", seo.description);
    var ogImage = $("#ogImage");
    if (ogImage && DATA.hero.images[0]) ogImage.setAttribute("content", DATA.hero.images[0].jpg);
  }

  /* ------------------------------ UI TEXTS ------------------------------ */
  function applyUi() {
    var ui = DATA.ui;

    $("#brandSub").textContent = ui.nameSub;
    $("#navBookBtn").textContent = ui.navBook;
    $("#mobileBookBtn").textContent = ui.navBook;

    $("#heroBookBtn").textContent = ui.hero.book;
    $("#heroCallBtn").textContent = ui.hero.call;

    $("#aboutEyebrow").textContent = ui.about.eyebrow;
    $("#aboutHeading").textContent = ui.about.title;
    $("#aboutExploreBtn").textContent = ui.about.explore;
    $("#aboutWaBtn").textContent = ui.about.wa;

    $("#stayEyebrow").textContent = ui.stay.eyebrow;
    $("#stayTitle").textContent = ui.stay.title;
    $("#staySub").textContent = ui.stay.sub;

    $("#amenEyebrow").textContent = ui.amenities.eyebrow;
    $("#amenTitle").textContent = ui.amenities.title;
    $("#amenSub").textContent = ui.amenities.sub;

    $("#galEyebrow").textContent = ui.gallery.eyebrow;
    $("#galTitle").textContent = ui.gallery.title;
    $("#galSub").textContent = ui.gallery.sub;

    $("#infoEyebrow").textContent = ui.info.eyebrow;
    $("#infoTitle").textContent = ui.info.title;

    $("#locEyebrow").textContent = ui.location.eyebrow;
    $("#locHeading").textContent = ui.location.title;
    $("#directionsBtn").textContent = ui.location.directions;
    $("#locCallBtn").textContent = ui.location.call;
    $("#locWaBtn").textContent = ui.location.wa;

    $("#conEyebrow").textContent = ui.contact.eyebrow;
    $("#conTitle").textContent = ui.contact.title;
    $("#conIntro").textContent = ui.contact.intro;
    $("#formTitle").textContent = ui.contact.formTitle;
    $("#sendBtn").textContent = ui.contact.submit;
    $("#formHint").textContent = ui.contact.hint;

    var L = ui.contact.labels;
    var req = ui.contact.required || [];
    function setLabel(forId, text, key) {
      var lbl = document.querySelector('label[for="' + forId + '"]');
      if (lbl) lbl.innerHTML = text + (req.indexOf(key) > -1 ? ' <span class="req">*</span>' : "");
    }
    setLabel("fName", L.name, "name");
    setLabel("fPhone", L.phone, "phone");
    setLabel("fCheckin", L.checkin, "checkin");
    setLabel("fCheckout", L.checkout, "checkout");
    setLabel("fAdults", L.adults, "adults");
    setLabel("fChildren", L.children, "children");
    setLabel("fPref", L.preference, "preference");
    setLabel("fMessage", L.message, "message");

    $("#fName").placeholder = ui.contact.placeholders.name;
    $("#fPhone").placeholder = ui.contact.placeholders.phone;
    $("#fMessage").placeholder = ui.contact.placeholders.message;

    var sel = $("#fPref");
    sel.innerHTML = "";
    ui.contact.preferences.forEach(function (p) {
      var o = document.createElement("option");
      o.value = p;
      o.textContent = p;
      sel.appendChild(o);
    });

    $("#footerQuickTitle").textContent = ui.footer.quickLinks;
    $("#footerContactTitle").textContent = ui.footer.contact;
    $("#footerWaBtn").textContent = ui.footer.wa;
  }

  /* ------------------------------ scroll behaviours ------------------------------ */
  function initScroll() {
    var header = $("#siteHeader");
    var backToTop = $("#backToTop");
    var progress = $("#scrollProgress");
    var particlesEl = $("#heroParticles");
    var navAnchors = $all(".nav-links a");
    var mouseX = 0;
    var mouseY = 0;

    var sections = DATA.nav
      .map(function (n) { return document.getElementById(n.href.slice(1)); })
      .filter(Boolean);

    function applyParallax() {
      if (!particlesEl) return;
      var offX = mouseX * 22;
      var offY = mouseY * 14 + window.scrollY * 0.22;
      particlesEl.style.transform = "translate3d(" + offX.toFixed(1) + "px, " + offY.toFixed(1) + "px, 0)";
    }

    function onScroll() {
      var y = window.scrollY;
      header.classList.toggle("scrolled", y > 40);
      backToTop.classList.toggle("show", y > 600);

      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? (y / docH) * 100 : 0;
      progress.style.width = pct + "%";

      applyParallax();

      var current = "";
      var mid = y + window.innerHeight * 0.35;
      sections.forEach(function (s) {
        if (s.offsetTop <= mid) current = s.id;
      });
      navAnchors.forEach(function (a) {
        a.classList.toggle("active", a.dataset.target === current);
      });
    }

    if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
      document.addEventListener("mousemove", function (e) {
        mouseX = e.clientX / window.innerWidth - 0.5;
        mouseY = e.clientY / window.innerHeight - 0.5;
        applyParallax();
        document.documentElement.style.setProperty("--mx", (e.clientX / window.innerWidth) * 100 + "%");
        document.documentElement.style.setProperty("--my", (e.clientY / window.innerHeight) * 100 + "%");
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------ reveal animations ------------------------------ */
  function initReveal() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("in", entry.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    $all(".reveal").forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------ init ------------------------------ */
  function init() {
    buildSeo();
    applyUi();
    buildHeader();
    initNav();
    buildHero();
    buildHeroParticles();
    buildAbout();
    buildStays();
    buildAmenities();
    buildGallery();
    initLightbox();
    initGalleryScroll();
    buildInfo();
    buildLocation();
    buildContact();
    initForm();
    buildFooter();
    initScroll();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
