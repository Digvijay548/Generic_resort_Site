(function () {
  "use strict";

  var DATA = null;

  function resolveData(raw, manifest) {
    var IMG = manifest || window.IMAGE_MANIFEST || { version: 2, order: [], folders: {} };

    function folderImages(name) {
      var folder = IMG.folders && IMG.folders[name];
      return (folder && folder.images) || [];
    }

    function folderLabel(name) {
      var folder = IMG.folders && IMG.folders[name];
      return (folder && folder.label) || "";
    }

    function tag(image, category) {
      if (!image) return null;
      return {
        src: image.src,
        original: image.original || image.src,
        srcset: image.srcset || "",
        alt: image.alt || "",
        w: image.w || 0,
        h: image.h || 0,
        category: category || "",
      };
    }

    var pools = {};
    function nextPhoto() {
      var names = Array.prototype.slice.call(arguments);
      var key = names.join("|");
      if (!pools[key]) {
        var images = [];
        names.forEach(function (name) {
          images = images.concat(folderImages(name));
        });
        pools[key] = { images: images, used: 0 };
      }
      var pool = pools[key];
      if (!pool.images.length) return null;
      var image = pool.images[pool.used % pool.images.length];
      pool.used += 1;
      return tag(image);
    }

    function galleryPhotos() {
      var out = [];
      (IMG.order || []).forEach(function (name) {
        var label = folderLabel(name);
        folderImages(name).forEach(function (image) {
          out.push(tag(image, label));
        });
      });
      return out;
    }

    function galleryTabs() {
      var labels = [];
      (IMG.order || []).forEach(function (name) {
        var label = folderLabel(name);
        if (label && !folderImages(name).length) return;
        if (label && labels.indexOf(label) === -1) labels.push(label);
      });
      return labels.length ? ["All"].concat(labels) : [];
    }

    // Deep clone raw so we don't modify the fallback source.
    var data = JSON.parse(JSON.stringify(raw));

    // Resolve hero image slideshow
    if (data.hero && data.hero.imagesPool) {
      var desktop = nextPhoto.apply(null, data.hero.imagesPool);
      var mobile = nextPhoto.apply(null, data.hero.imagesPool) || desktop;
      data.hero.images = [desktop, mobile].filter(Boolean);
    }

    // Resolve About images
    if (data.about) {
      data.about.image = nextPhoto.apply(null, data.about.imagePoolA || ["resort", "gallery", "surroundings"]);
      data.about.imageB = nextPhoto.apply(null, data.about.imagePoolB || ["resort", "gallery", "surroundings"]);
    }

    // Resolve Stay cards images
    if (data.stays && Array.isArray(data.stays)) {
      data.stays.forEach(function (stay) {
        stay.image = nextPhoto.apply(null, stay.imagePool || ["rooms", "gallery"]);
      });
    }

    // Resolve Gallery & filters
    data.galleryFilters = galleryTabs();
    data.gallery = galleryPhotos();

    // Resolve Location backdrop image
    if (data.location && data.location.imagePool) {
      data.location.image = nextPhoto.apply(null, data.location.imagePool);
    }

    // Derive maps and query details
    var mapQuery = encodeURIComponent(data.location.fullAddress);
    data.location.mapEmbedSrc = "https://www.google.com/maps?q=" + mapQuery + "&output=embed";
    data.location.directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + mapQuery;

    data.footer.quickLinks = data.nav.slice();

    var times = {
      checkIn: data.importantInfo.checkIn,
      checkOut: data.importantInfo.checkOut,
    };
    data.faq.items.forEach(function (item) {
      item.a = item.a
        .replace("{checkIn}", times.checkIn)
        .replace("{checkOut}", times.checkOut);
    });
    data.packages.plans.forEach(function (plan) {
      plan.features = plan.features.concat([
        "Check-in " + times.checkIn,
        "Check-out " + times.checkOut,
      ]);
    });

    return data;
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* If js/data.js failed to load there is nothing to render. Say so plainly
     instead of throwing on the first property access and leaving a blank page. */
  function showBootError() {
    document.documentElement.classList.add("data-missing");
    var warning = document.createElement("p");
    warning.className = "boot-error";
    warning.textContent =
      "This page could not load its content (js/data.js is missing). " +
      "Please call 072777 75060.";
    document.body.insertBefore(warning, document.body.firstChild);
  }

  var REDUCED_MOTION =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      encodeURIComponent(DATA.whatsapp.number) +
      "?text=" +
      encodeURIComponent(message || DATA.whatsapp.message)
    );
  }

  /* Hide a section whose content could not be built (e.g. no photos yet)
     rather than leaving an empty heading with nothing under it. */
  function hideSection(id) {
    var section = document.getElementById(id);
    if (section) section.hidden = true;
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
    mail:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6 8.5-6"/></svg>',
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

  /* Ambient motes drifting over the hero — soft points of light rather than
     illustrations, so they read as atmosphere instead of decoration. */
  var HERO_EFFECTS = {
    count: 10,
    colors: ["#d4af37", "#f2e6c4", "#ffffff"],
    minSize: 2,
    maxSize: 6,
  };

  /* How long each hero photo is held before cross-fading to the next.
     Must be longer than the 2.4s CSS fade. */
  var KEN_BURNS_HOLD_MS = 9000;

  /* ------------------------------ images ------------------------------ */
  /**
   * Build a <picture> from a manifest entry.
   *
   * The generator produces WebP copies at several widths, so the browser can
   * download the one that fits the screen instead of a full-size photo. The
   * <img> always points at a plain JPEG/PNG, which is what a browser without
   * WebP support falls back to.
   */
  function createPicture(photo, opts) {
    opts = opts || {};
    var wrapper = document.createElement("figure");
    wrapper.className = "img-frame skeleton" + (opts.className ? " " + opts.className : "");

    if (!photo) {
      wrapper.classList.add("is-loaded", "img-error");
      wrapper.classList.remove("skeleton");
      return wrapper;
    }

    var pic = document.createElement("picture");
    var html = "";
    if (photo.srcset) {
      html +=
        '<source type="image/webp" srcset="' + esc(photo.srcset) + '"' +
        (opts.sizes ? ' sizes="' + esc(opts.sizes) + '"' : "") + ">";
    }
    html +=
      '<img src="' + esc(photo.src) + '"' +
      ' alt="' + esc(photo.alt) + '"' +
      (photo.w ? ' width="' + photo.w + '"' : "") +
      (photo.h ? ' height="' + photo.h + '"' : "") +
      ' loading="' + (opts.eager ? "eager" : "lazy") + '"' +
      ' decoding="async"' +
      (opts.eager ? ' fetchpriority="high"' : "") +
      ">";
    pic.innerHTML = html;

    var img = pic.querySelector("img");
    function settle(ok) {
      wrapper.classList.remove("skeleton");
      wrapper.classList.add("is-loaded");
      if (!ok) wrapper.classList.add("img-error");
    }
    if (img.complete) {
      settle(img.naturalWidth > 0);
    } else {
      img.addEventListener("load", function () { settle(true); });
      img.addEventListener("error", function () {
        if (!fallBackToOriginal(pic, img, photo)) settle(false);
      });
    }
    wrapper.appendChild(pic);
    return wrapper;
  }

  /**
   * Last-ditch retry with the untouched original photo.
   *
   * The generated copies under assets/images/_optimized/ can go missing for
   * reasons that have nothing to do with the photo itself — a host that
   * strips underscore-prefixed folders, a part-finished image build, a bad
   * upload. When that happens the <source> elements have to go too, because
   * a <picture> does NOT fall back to its <img> when the source it picked
   * fails. Returns false when there is nothing left to try.
   */
  function fallBackToOriginal(pic, img, photo) {
    if (!photo || !photo.original || img.dataset.triedOriginal) return false;
    if (photo.original === photo.src && !pic.querySelector("source")) return false;
    img.dataset.triedOriginal = "1";
    $all("source", pic).forEach(function (s) { s.parentNode.removeChild(s); });
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.src = photo.original;
    return true;
  }

  /* ------------------------------ header / nav ------------------------------ */
  function buildHeader() {
    $("#navLogo").src = DATA.logo.image;
    $("#brandName").textContent = DATA.shortName;

    function fill(list, items) {
      items.forEach(function (item) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = item.href;
        a.textContent = item.label;
        a.dataset.target = item.href.slice(1);
        li.appendChild(a);
        list.appendChild(li);
      });
    }
    fill($("#navLinks"), DATA.nav);
    fill($("#mobileLinks"), DATA.nav);

    [$("#navBookBtn"), $("#mobileBookBtn")].forEach(function (btn) {
      btn.href = waHref();
      btn.textContent = DATA.ui.navBook;
    });
    $("#navBookBtn").className = "btn btn-gradient btn-sm";
    $("#mobileBookBtn").className = "btn btn-gradient";
  }

  function initNav() {
    var navToggle = $("#navToggle");
    var mobileMenu = $("#mobileMenu");

    /* A closed menu must be invisible AND unreachable by keyboard. `inert`
       does that in one step; the CSS visibility rule covers older browsers. */
    function setOpen(open) {
      mobileMenu.classList.toggle("open", open);
      mobileMenu.inert = !open;
      mobileMenu.setAttribute("aria-hidden", String(!open));
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    setOpen(false);

    navToggle.addEventListener("click", function () {
      setOpen(!mobileMenu.classList.contains("open"));
    });
    $all("a", mobileMenu).forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("click", function (e) {
      if (
        mobileMenu.classList.contains("open") &&
        !mobileMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        setOpen(false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
        setOpen(false);
        navToggle.focus();
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

    var media = $("#heroMedia");
    var photos = (hero.images || []).filter(Boolean);
    if (!photos.length) {
      media.classList.add("is-loaded", "no-photo");
      return;
    }

    /* Mark the hero ready on success AND on failure — otherwise a missing
       photo leaves the image permanently transparent over a dark panel. */
    function reveal(ok) {
      media.classList.add("is-loaded");
      if (!ok) media.classList.add("no-photo");
    }

    /* An ambient video takes over when one exists — but never on a phone and
       never for reduced-motion visitors, who get the photos instead. */
    if (hero.video && !REDUCED_MOTION && window.matchMedia &&
        window.matchMedia("(min-width: 993px)").matches) {
      tryHeroVideo(media, hero, photos, reveal);
      return;
    }

    /* One photo: a single still with a slow settle. */
    if (photos.length === 1 || REDUCED_MOTION) {
      var only = photos[0];
      var pic = document.createElement("picture");
      pic.innerHTML =
        (only.srcset
          ? '<source type="image/webp" srcset="' + esc(only.srcset) + '" sizes="100vw">'
          : "") +
        '<img src="' + esc(only.src) + '" alt="' + esc(only.alt) + '"' +
        (only.w ? ' width="' + only.w + '"' : "") +
        (only.h ? ' height="' + only.h + '"' : "") +
        ' loading="eager" decoding="async" fetchpriority="high">';
      var single = pic.querySelector("img");
      if (single.complete) {
        reveal(single.naturalWidth > 0);
      } else {
        single.addEventListener("load", function () { reveal(true); });
        single.addEventListener("error", function () {
          if (!fallBackToOriginal(pic, single, only)) reveal(false);
        });
      }
      media.appendChild(pic);
      return;
    }

    buildKenBurns(media, photos, reveal);
  }

  /**
   * Attempt the ambient video loop, falling back to the photo slideshow.
   *
   * There is no way to know a video exists without asking for it, so the
   * photos are laid down first and the video only replaces them once it is
   * actually playing. A missing file, an unsupported codec or a browser that
   * blocks autoplay all end up showing the photos — never a black rectangle.
   */
  function tryHeroVideo(media, hero, photos, reveal) {
    buildKenBurns(media, photos, reveal);

    var video = document.createElement("video");
    video.className = "hero-video";
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-hidden", "true");
    video.preload = "auto";
    video.tabIndex = -1;

    if (hero.videoWebm) {
      var webm = document.createElement("source");
      webm.src = hero.videoWebm;
      webm.type = "video/webm";
      video.appendChild(webm);
    }
    var mp4 = document.createElement("source");
    mp4.src = hero.video;
    mp4.type = "video/mp4";
    video.appendChild(mp4);

    var settled = false;
    function giveUp() {
      if (settled) return;
      settled = true;
      if (video.parentNode) video.parentNode.removeChild(video);
    }

    video.addEventListener("error", giveUp);
    video.addEventListener("stalled", giveUp);
    video.addEventListener("playing", function () {
      if (settled) return;
      settled = true;
      /* Only now is it safe to hide the photos underneath. */
      media.classList.add("has-video");
      video.classList.add("is-playing");
    });

    media.appendChild(video);

    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(giveUp); // autoplay refused — keep the photos
    }
    /* If nothing is playing within a few seconds, assume it never will. */
    setTimeout(function () { if (!settled) giveUp(); }, 6000);

    document.addEventListener("visibilitychange", function () {
      if (!settled || !video.parentNode) return;
      if (document.hidden) video.pause();
      else video.play().catch(function () {});
    });
  }

  /**
   * Slow zoom-and-drift across the hero photos, cross-fading between them.
   * Every photo in assets/images/hero/ becomes one layer, so adding another
   * photo simply lengthens the loop.
   */
  function buildKenBurns(media, photos, reveal) {
    var layers = photos.map(function (photo, i) {
      var layer = document.createElement("div");
      layer.className = "kb-layer";
      var pic = document.createElement("picture");
      pic.innerHTML =
        (photo.srcset
          ? '<source type="image/webp" srcset="' + esc(photo.srcset) + '" sizes="100vw">'
          : "") +
        '<img src="' + esc(photo.src) + '"' +
        /* Only the first layer is described; the rest are the same view and
           would just be noise for a screen reader. */
        ' alt="' + (i === 0 ? esc(photo.alt) : "") + '"' +
        (photo.w ? ' width="' + photo.w + '"' : "") +
        (photo.h ? ' height="' + photo.h + '"' : "") +
        (i === 0
          ? ' loading="eager" decoding="async" fetchpriority="high"'
          : ' loading="lazy" decoding="async"') +
        ">";
      layer.appendChild(pic);
      media.appendChild(layer);
      return layer;
    });

    var first = layers[0].querySelector("img");
    if (first.complete) {
      reveal(first.naturalWidth > 0);
    } else {
      first.addEventListener("load", function () { reveal(true); });
      first.addEventListener("error", function () {
        if (!fallBackToOriginal(first.parentNode, first, photos[0])) reveal(false);
      });
    }

    /* Every other layer gets the same retry, quietly. */
    layers.slice(1).forEach(function (layer, i) {
      var img = layer.querySelector("img");
      img.addEventListener("error", function () {
        fallBackToOriginal(layer.querySelector("picture") || layer, img, photos[i + 1]);
      });
    });

    var index = 0;
    var timer = null;

    function show(next) {
      layers[index].classList.remove("is-active");
      index = next % layers.length;
      var layer = layers[index];
      /* Re-trigger the drift animation from the start on every appearance. */
      var img = layer.querySelector("img");
      img.style.animation = "none";
      void img.offsetWidth;
      img.style.animation = "";
      layer.classList.add("is-active");
    }

    layers[0].classList.add("is-active");

    function start() {
      if (timer) return;
      var hold = (DATA.animations && DATA.animations.kenBurns && DATA.animations.kenBurns.holdMs) || KEN_BURNS_HOLD_MS;
      timer = setInterval(function () { show(index + 1); }, hold);
    }
    function stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }
    /* No point animating a hero nobody is looking at. */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  function buildHeroParticles() {
    if (REDUCED_MOTION) return;
    var cfg = DATA.animations && DATA.animations.heroParticles;
    if (!cfg || !cfg.enabled) return;
    var hero = $("#home");
    if (!hero) return;

    var wrap = document.createElement("div");
    wrap.className = "hero-particles";
    wrap.id = "heroParticles";
    wrap.setAttribute("aria-hidden", "true");
    hero.insertBefore(wrap, hero.querySelector(".hero-content"));

    var colors = cfg.colors || ["#d4af37", "#f2e6c4", "#ffffff"];
    var count = cfg.count !== undefined ? cfg.count : 10;
    var minSize = cfg.minSize !== undefined ? cfg.minSize : 2;
    var maxSize = cfg.maxSize !== undefined ? cfg.maxSize : 6;
    var minSway = cfg.minSway !== undefined ? cfg.minSway : -15;
    var maxSway = cfg.maxSway !== undefined ? cfg.maxSway : 15;

    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "hero-particle";
      var size = minSize + Math.random() * (maxSize - minSize);
      p.style.width = size.toFixed(1) + "px";
      p.style.height = size.toFixed(1) + "px";
      p.style.left = (Math.random() * 100).toFixed(2) + "%";
      p.style.top = (10 + Math.random() * 78).toFixed(2) + "%";
      p.style.color = colors[i % colors.length];
      p.style.setProperty("--dur", (14 + Math.random() * 12).toFixed(1) + "s");
      p.style.setProperty("--amp", (-(30 + Math.random() * 50)).toFixed(1) + "px");
      p.style.setProperty("--sway", (minSway + Math.random() * (maxSway - minSway)).toFixed(1) + "px");
      p.style.setProperty("--op", (0.10 + Math.random() * 0.14).toFixed(2));
      p.style.animationDelay = (-Math.random() * 20).toFixed(1) + "s";
      wrap.appendChild(p);
    }
  }

  /* ------------------------------ magnetic buttons ------------------------------ */
  /**
   * Buttons lean a few pixels toward the cursor while it is over them, then
   * ease back. Pointer devices only, and never under reduced motion.
   */
  function initMagneticButtons() {
    if (REDUCED_MOTION) return;
    if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;

    var STRENGTH = 0.28;   // fraction of the cursor's offset the button follows
    var MAX = 9;           // px, so a wide button does not slide too far

    function clamp(value) { return Math.max(-MAX, Math.min(MAX, value)); }

    document.addEventListener("pointerover", function (e) {
      var btn = e.target.closest && e.target.closest(".btn");
      if (!btn || btn.dataset.magnetic) return;
      btn.dataset.magnetic = "1";

      var frame = null;
      function move(ev) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = null;
          var box = btn.getBoundingClientRect();
          var dx = ev.clientX - (box.left + box.width / 2);
          var dy = ev.clientY - (box.top + box.height / 2);
          btn.style.setProperty("--mag-x", clamp(dx * STRENGTH).toFixed(1) + "px");
          btn.style.setProperty("--mag-y", clamp(dy * STRENGTH).toFixed(1) + "px");
        });
      }
      function reset() {
        if (frame) { cancelAnimationFrame(frame); frame = null; }
        btn.style.setProperty("--mag-x", "0px");
        btn.style.setProperty("--mag-y", "0px");
      }
      btn.addEventListener("pointermove", move);
      btn.addEventListener("pointerleave", reset);
      btn.addEventListener("blur", reset);
      btn.addEventListener("click", reset);
    });
  }

  /* ------------------------------ availability bar ------------------------------ */
  /**
   * The floating bar across the bottom of the hero. There is no booking
   * backend, so "Check Availability" hands the request to WhatsApp with the
   * dates, party size and suite already written out — the same channel every
   * other button on the page uses.
   */
  function initAvailabilityBar() {
    var form = $("#availBar");
    if (!form) return;

    var labels = DATA.ui.availability;
    var checkIn = $("#aCheckIn");
    var checkOut = $("#aCheckOut");
    var guests = $("#aGuests");
    var suite = $("#aSuite");
    var error = $("#availError");

    $("#aCheckInLabel").textContent = labels.checkIn;
    $("#aCheckOutLabel").textContent = labels.checkOut;
    $("#aGuestsLabel").textContent = labels.guests;
    $("#aSuiteLabel").textContent = labels.suite;
    $("#availSubmit").textContent = labels.submit;

    /* Suite options follow the Stay cards, so adding a stay adds an option. */
    var options = [labels.anySuite].concat(
      DATA.stays.map(function (stay) { return stay.title; })
    );
    options.forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      suite.appendChild(option);
    });

    var today = new Date().toISOString().slice(0, 10);
    checkIn.min = today;
    checkOut.min = today;

    /* Check-out can never precede check-in. */
    checkIn.addEventListener("change", function () {
      checkOut.min = checkIn.value || today;
      if (checkOut.value && checkOut.value <= checkIn.value) checkOut.value = "";
      error.textContent = "";
    });
    checkOut.addEventListener("change", function () { error.textContent = ""; });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (checkIn.value && checkOut.value && checkOut.value <= checkIn.value) {
        error.textContent = labels.errorDates;
        checkOut.focus();
        return;
      }
      error.textContent = "";

      var lines = [
        "Hello, I would like to check availability at " + DATA.name + ".",
        "",
        labels.checkIn + ": " + (checkIn.value || "Not specified"),
        labels.checkOut + ": " + (checkOut.value || "Not specified"),
        labels.guests + ": " + (guests.value || "2"),
        labels.suite + ": " + suite.value,
      ];
      window.open(waHref(lines.join("\n")), "_blank", "noopener");
    });
  }

  /* ------------------------------ about ------------------------------ */
  function buildAbout() {
    var about = DATA.about;
    $("#aboutText").textContent = about.text;
    $("#aboutWaBtn").href = waHref();

    var media = $("#aboutMedia");
    if (!about.image) {
      media.hidden = true;
      document.querySelector(".about-grid").classList.add("no-media");
      return;
    }
    media.appendChild(createPicture(about.image, {
      className: "about-main",
      eager: true,
      sizes: "(max-width: 900px) 92vw, 560px",
    }));
    /* Only show the small inset when it is a genuinely different photo. */
    if (about.imageB && about.imageB.src !== about.image.src) {
      media.appendChild(createPicture(about.imageB, {
        className: "about-b",
        sizes: "(max-width: 900px) 44vw, 260px",
      }));
    }
  }

  /* ------------------------------ stay cards ------------------------------ */
  function buildStays() {
    var grid = $("#stayGrid");
    DATA.stays.forEach(function (stay, i) {
      var card = document.createElement("article");
      card.className = "stay-card reveal reveal-d" + ((i % 3) + 1);

      if (stay.image) {
        card.appendChild(createPicture(stay.image, {
          className: "stay-media",
          sizes: "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 570px",
        }));
      }

      var body = document.createElement("div");
      body.className = "stay-body";
      var facs = stay.facilities.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
      var msg = "Hello, I would like to enquire about the " + stay.title + " at " + DATA.name + ".";
      body.innerHTML =
        "<h3>" + esc(stay.title) + "</h3>" +
        "<p>" + esc(stay.description) + "</p>" +
        '<ul class="stay-facilities">' + facs + "</ul>" +
        '<a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener" href="' +
        esc(waHref(msg)) + '">' + esc(DATA.ui.stay.enquire) + "</a>";

      card.appendChild(body);
      grid.appendChild(card);
    });
    $("#stayNote").textContent = DATA.stayNote;
  }

  /* ------------------------------ offers ------------------------------ */
  function buildOffers() {
    var grid = $("#offersGrid");
    if (!grid || !DATA.offers) return;
    DATA.offers.items.forEach(function (o, i) {
      var card = document.createElement("article");
      card.className = "offer-card reveal reveal-d" + ((i % 3) + 1);
      card.innerHTML =
        '<span class="offer-badge">' + esc(o.badge) + "</span>" +
        "<h3>" + esc(o.title) + "</h3>" +
        "<p>" + esc(o.text) + "</p>";
      grid.appendChild(card);
    });
  }

  /* ------------------------------ packages ------------------------------ */
  function buildPackages() {
    var grid = $("#plansGrid");
    if (!grid || !DATA.packages) return;
    DATA.packages.plans.forEach(function (p, i) {
      var card = document.createElement("article");
      card.className =
        "plan-card reveal reveal-d" + ((i % 3) + 1) + (p.featured ? " featured" : "");
      var feats = p.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
      var msg = "Hello, I would like to book the " + p.name + " at " + DATA.name + ".";
      card.innerHTML =
        (p.featured ? '<span class="plan-ribbon">Most Popular</span>' : "") +
        "<h3>" + esc(p.name) + "</h3>" +
        '<p class="plan-price">' + esc(p.price) + "</p>" +
        '<p class="plan-note">' + esc(p.priceNote) + "</p>" +
        '<ul class="plan-features">' + feats + "</ul>" +
        '<a class="btn btn-whatsapp" target="_blank" rel="noopener" href="' +
        esc(waHref(msg)) + '">' + esc(DATA.ui.packages.book) + "</a>";
      grid.appendChild(card);
    });
  }

  /* ------------------------------ testimonials ------------------------------ */
  function buildTestimonials() {
    var track = $("#testimTrack");
    if (!track || !DATA.testimonials) return;
    var items = DATA.testimonials.items;
    if (!items.length) { hideSection("testimonials"); return; }

    var dots = $("#testimDots");
    var slider = $("#testimSlider");
    var idx = 0;
    var timer = null;
    var paused = false;
    var slideCount = items.length;

    function stars(r) {
      var s = "";
      for (var i = 0; i < 5; i++) s += i < r ? "&#9733;" : "&#9734;";
      return s;
    }

    items.forEach(function (t, i) {
      var slide = document.createElement("div");
      slide.className = "testim-slide";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", (i + 1) + " of " + slideCount);
      slide.innerHTML =
        '<div class="testim-stars" role="img" aria-label="' + t.rating + ' out of 5 stars">' +
        stars(t.rating) + "</div>" +
        '<blockquote class="testim-text">' + esc(t.text) + "</blockquote>" +
        '<div class="testim-author">' +
        '<span class="testim-name">' + esc(t.name) + "</span>" +
        '<span class="testim-tag">' + esc(t.tag) + "</span>" +
        "</div>";
      track.appendChild(slide);

      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "ts-dot";
      dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
      dot.addEventListener("click", function () { goTo(i, true); });
      dots.appendChild(dot);
    });

    function goTo(n, fromUser) {
      idx = (n + slideCount) % slideCount;
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      $all(".ts-dot", dots).forEach(function (d, i) {
        d.classList.toggle("active", i === idx);
        d.setAttribute("aria-current", i === idx ? "true" : "false");
      });
      $all(".testim-slide", track).forEach(function (s, i) {
        s.inert = i !== idx;
      });
      if (fromUser) restart();
    }

    /* Autoplay is a convenience, not a requirement: it stops on hover, on
       keyboard focus, when the tab is hidden, and for reduced-motion users. */
    function restart() {
      if (timer) clearInterval(timer);
      timer = null;
      if (REDUCED_MOTION || paused || slideCount < 2) return;
      timer = setInterval(function () { goTo(idx + 1); }, 6000);
    }
    function setPaused(value) {
      paused = value;
      restart();
    }

    slider.addEventListener("mouseenter", function () { setPaused(true); });
    slider.addEventListener("mouseleave", function () { setPaused(false); });
    slider.addEventListener("focusin", function () { setPaused(true); });
    slider.addEventListener("focusout", function () { setPaused(false); });
    document.addEventListener("visibilitychange", function () {
      setPaused(document.hidden);
    });

    var prevBtn = $("#tsPrev");
    var nextBtn = $("#tsNext");
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(idx - 1, true); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(idx + 1, true); });

    var startX = null;
    track.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(idx + (dx < 0 ? 1 : -1), true);
      startX = null;
    }, { passive: true });

    goTo(0);
    restart();
  }

  /* ------------------------------ faq ------------------------------ */
  function buildFaq() {
    var list = $("#faqList");
    if (!list || !DATA.faq) return;
    DATA.faq.items.forEach(function (it, i) {
      var item = document.createElement("details");
      item.className = "faq-item";
      if (i === 0) item.open = true;
      item.innerHTML =
        "<summary>" + esc(it.q) + '<span class="faq-icon" aria-hidden="true"></span></summary>' +
        "<p>" + esc(it.a) + "</p>";
      list.appendChild(item);
    });
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
      sec.innerHTML = "<h3>" + esc(cat.title) + '</h3><ul class="amenity-grid">' + items + "</ul>";
      wrap.appendChild(sec);
    });
  }

  /* ------------------------------ gallery + lightbox ------------------------------ */
  var currentFilter = "All";

  /* How many tiles show before "View all". One full mosaic cycle. */
  var GALLERY_PREVIEW = 10;
  var galleryExpanded = false;

  function galleryItemsForFilter() {
    if (currentFilter === "All") return DATA.gallery.slice();
    return DATA.gallery.filter(function (g) { return g.category === currentFilter; });
  }

  function buildGallery() {
    if (!DATA.gallery.length) {
      hideSection("gallery");
      return;
    }

    var filters = $("#galleryFilters");
    DATA.galleryFilters.forEach(function (f, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-btn" + (i === 0 ? " active" : "");
      b.textContent = f;
      b.dataset.filter = f;
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
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
      item.appendChild(createPicture(g, {
        className: "gallery-media",
        sizes: "(max-width: 640px) 300px, 560px",
      }));
      var label = document.createElement("span");
      label.className = "gallery-label";
      label.textContent = g.category;
      item.appendChild(label);
      item.addEventListener("click", function () { openLightbox(i, item); });
      grid.appendChild(item);
    });

    layoutGallery();
  }

  /**
   * Size the mosaic tiles.
   *
   * Every 10 visible tiles form a block that fills a 4-column grid exactly:
   * a 2x2 feature, four singles, two singles, another 2x2 feature, two more
   * singles. The feature alternates between the left and right of the grid,
   * which is what gives the wall its rhythm.
   *
   * Sizes are assigned by position among the VISIBLE tiles, not by DOM index,
   * so filtering to a category re-flows the pattern instead of leaving holes.
   */
  function layoutGallery() {
    var all = $all(".gallery-item").filter(function (el) {
      return !el.classList.contains("is-hidden");
    });
    var visible = galleryExpanded ? all : all.slice(0, GALLERY_PREVIEW);
    var count = visible.length;

    var grid = $("#galleryGrid");
    /* Very few photos would leave a four-column grid mostly empty, so narrow
       the grid instead and let each photo be larger. */
    if (grid) grid.dataset.count = count < 4 ? String(count) : "many";

    visible.forEach(function (el, i) {
      var slot = i % 10;
      var remaining = count - i;
      /* A feature only earns its place if the tiles that close its block are
         actually there: the left-hand one needs four more after it, the
         right-hand one needs two. Otherwise it punches a hole in the wall. */
      var feature =
        (slot === 0 && remaining >= 5) || (slot === 7 && remaining >= 3);
      el.classList.toggle("g-feature", feature);
    });

    all.forEach(function (el, i) {
      el.classList.toggle("is-clipped", !galleryExpanded && i >= GALLERY_PREVIEW);
    });

    var more = $("#galleryMoreBtn");
    if (!more) return;
    if (all.length <= GALLERY_PREVIEW) {
      more.hidden = true;
      return;
    }
    more.hidden = false;
    more.textContent = galleryExpanded
      ? DATA.ui.gallery.viewLess
      : DATA.ui.gallery.viewAll.replace("{n}", all.length);
    more.setAttribute("aria-expanded", String(galleryExpanded));
  }

  function setFilter(filter) {
    currentFilter = filter;
    galleryExpanded = false; // a new category starts collapsed again
    $all(".filter-btn").forEach(function (b) {
      var on = b.dataset.filter === filter;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    $all(".gallery-item").forEach(function (item) {
      item.classList.toggle("is-hidden", !(filter === "All" || item.dataset.category === filter));
    });
    layoutGallery();
  }

  var lightbox = $("#lightbox");
  var lbImage = $("#lbImage");
  var lbCaption = $("#lbCaption");
  var lbCounter = $("#lbCounter");
  var lbItems = [];
  var lbPos = 0;
  var lbReturnFocus = null;

  function openLightbox(galleryIndex, trigger) {
    lbItems = galleryItemsForFilter();
    lbPos = lbItems.indexOf(DATA.gallery[galleryIndex]);
    if (lbPos < 0) lbPos = 0;
    lbReturnFocus = trigger || document.activeElement;
    renderLightbox();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-open");
    $("#lbClose").focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");
    /* Send focus back to the thumbnail that opened the viewer, so keyboard
       users are not dumped at the top of the document. */
    if (lbReturnFocus && lbReturnFocus.focus) lbReturnFocus.focus();
    lbReturnFocus = null;
  }

  function renderLightbox() {
    var item = lbItems[lbPos];
    if (!item) return;
    /* Use the plain original here: assigning an empty string would make the
       browser re-request the page itself as if it were an image. */
    lbImage.src = item.original || item.src;
    lbImage.alt = item.alt;
    lbCaption.textContent = item.alt;
    lbCounter.textContent = (lbPos + 1) + " / " + lbItems.length;
  }

  function stepLightbox(dir) {
    lbPos = (lbPos + dir + lbItems.length) % lbItems.length;
    renderLightbox();
  }

  function initLightbox() {
    var buttons = [$("#lbClose"), $("#lbPrev"), $("#lbNext")];
    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lbPrev").addEventListener("click", function () { stepLightbox(-1); });
    $("#lbNext").addEventListener("click", function () { stepLightbox(1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") { closeLightbox(); return; }
      if (e.key === "ArrowLeft") { stepLightbox(-1); return; }
      if (e.key === "ArrowRight") { stepLightbox(1); return; }
      /* Keep Tab inside the viewer while it is open. */
      if (e.key === "Tab") {
        var order = buttons.filter(function (b) { return b.offsetParent !== null; });
        if (!order.length) return;
        var at = order.indexOf(document.activeElement);
        var next = e.shiftKey ? at - 1 : at + 1;
        if (at === -1 || next < 0 || next >= order.length) {
          e.preventDefault();
          order[e.shiftKey ? order.length - 1 : 0].focus();
        }
      }
    });
  }

  function initGalleryExpand() {
    var more = $("#galleryMoreBtn");
    if (!more) return;

    more.addEventListener("click", function () {
      var grid = $("#galleryGrid");
      var wasCollapsed = !galleryExpanded;
      galleryExpanded = !galleryExpanded;
      layoutGallery();

      /* Collapsing can leave the viewport below the shortened wall, so bring
         the top of the gallery back into view. Expanding keeps your place. */
      if (!wasCollapsed && grid) {
        var top = grid.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: top, behavior: REDUCED_MOTION ? "auto" : "smooth" });
      }
    });
  }

  /* ------------------------------ important info ------------------------------ */
  /* Set a trailing AM/PM smaller and raised, so "1:00 PM" reads as a time
     rather than a run of same-size characters. Values without one (say
     "13:00") are left exactly as written. */
  function formatTime(value) {
    var parts = String(value).match(/^(.*?)\s*([AaPp]\.?[Mm]\.?)$/);
    if (!parts) return esc(value);
    return (
      esc(parts[1]) +
      '<span class="it-meridiem">' + esc(parts[2].toUpperCase()) + "</span>"
    );
  }

  function buildInfo() {
    var info = DATA.importantInfo;
    var items = info.items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    $("#infoCard").innerHTML =
      '<div class="info-times">' +
      '<div class="info-time"><p class="it-label">' + esc(DATA.ui.info.checkIn) +
      '</p><p class="it-value">' + formatTime(info.checkIn) + "</p></div>" +
      '<div class="info-time"><p class="it-label">' + esc(DATA.ui.info.checkOut) +
      '</p><p class="it-value">' + formatTime(info.checkOut) + "</p></div>" +
      "</div>" +
      '<ul class="info-list">' + items + "</ul>";
  }

  /* ------------------------------ location ------------------------------ */
  function buildLocation() {
    var loc = DATA.location;
    $("#locAddress").innerHTML = loc.addressLines.map(esc).join("<br>");

    $("#directionsBtn").href = loc.directionsUrl;
    $("#locCallBtn").href = "tel:" + DATA.phone.tel;
    $("#locWaBtn").href = waHref();

    $("#mapFacadeTitle").textContent = DATA.ui.location.mapTitle;
    $("#mapFacadeNote").textContent = DATA.ui.location.mapNote;
    $("#mapLoadBtn").textContent = DATA.ui.location.mapLoad;

    /* Backdrop for the facade: a photo of the surroundings if there is one. */
    if (loc.image) {
      $("#mapFacadeMedia").appendChild(
        createPicture(loc.image, { sizes: "(max-width: 900px) 100vw, 640px" })
      );
    }

    /* The embed is fetched only on request, so a visitor who never opens the
       map is never announced to Google. */
    $("#mapLoadBtn").addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = loc.mapEmbedSrc;
      iframe.title = "Google Map showing the location of " + DATA.name;
      iframe.loading = "lazy";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.setAttribute("allow", "fullscreen");
      var wrap = $("#locationMap");
      wrap.dataset.label = DATA.name;
      wrap.appendChild(iframe);
      wrap.classList.add("map-loaded");
      var facade = $("#mapFacade");
      if (facade) facade.remove();
      iframe.focus();
    });
  }

  /* ------------------------------ contact ------------------------------ */
  function buildContact() {
    var phoneLink = $("#contactPhone");
    phoneLink.href = "tel:" + DATA.phone.tel;
    phoneLink.textContent = DATA.phone.display;

    var waLink = $("#contactWa");
    waLink.href = waHref();
    waLink.textContent = DATA.phone.display;

    /* No email configured means no empty Email row. */
    if (DATA.email) {
      var mail = $("#contactEmail");
      mail.href = "mailto:" + DATA.email;
      mail.textContent = DATA.email;
    } else {
      $("#contactEmailRow").hidden = true;
    }

    $("#contactAddress").textContent = DATA.location.addressLines.join(", ");

    /* Icons come from each row's data-icon, so reordering the list in the
       HTML can no longer shuffle the icons out of step with the labels. */
    $all(".contact-info .ci-icon").forEach(function (el) {
      el.innerHTML = ICONS[el.dataset.icon] || ICONS.generic;
    });
  }

  /* ------------------------------ form ------------------------------ */
  function initForm() {
    var form = $("#enquiryForm");
    var fields = {
      name: {
        el: $("#fName"),
        err: $("#errName"),
        valid: function (v) { return v.trim().length >= 2; },
        message: "Please enter your full name.",
      },
      phone: {
        el: $("#fPhone"),
        err: $("#errPhone"),
        valid: function (v) { return /^[+\d][\d\s\-()]{8,14}$/.test(v.trim()); },
        message: "Please enter a valid phone number.",
      },
      checkin: {
        el: $("#fCheckIn"),
        err: $("#errCheckIn"),
        valid: function (v, all) { return !v || !all.checkout || all.checkout > v; },
        message: "Check-out must be after check-in.",
      },
      checkout: {
        el: $("#fCheckOut"),
        err: $("#errCheckOut"),
        valid: function (v, all) { return !v || !all.checkin || v > all.checkin; },
        message: "Check-out must be after check-in.",
      },
    };
    var keys = Object.keys(fields);

    // Nobody books a stay in the past.
    var today = new Date().toISOString().slice(0, 10);
    $("#fCheckIn").min = today;
    $("#fCheckOut").min = today;

    function values() {
      return {
        name: fields.name.el.value,
        phone: fields.phone.el.value,
        checkin: fields.checkin.el.value,
        checkout: fields.checkout.el.value,
        adults: $("#fAdults").value || "2",
        children: $("#fChildren").value || "0",
        preference: $("#fPref").value,
        message: $("#fMessage").value,
      };
    }

    function showError(key, msg) {
      var f = fields[key];
      if (!f || !f.err) return;
      f.el.closest(".form-field").classList.toggle("invalid", Boolean(msg));
      f.el.setAttribute("aria-invalid", msg ? "true" : "false");
      f.err.textContent = msg || "";
    }

    function validate() {
      var v = values();
      var firstBad = null;
      keys.forEach(function (k) {
        var ok = fields[k].valid(v[k], v);
        showError(k, ok ? "" : fields[k].message);
        if (!ok && !firstBad) firstBad = fields[k];
      });
      if (firstBad) firstBad.el.focus();
      return !firstBad;
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

      window.open(waHref(lines.join("\n")), "_blank", "noopener");

      var btn = $("#sendBtn");
      var original = btn.textContent;
      btn.textContent = "Opening WhatsApp…";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 3000);
    });

    keys.forEach(function (k) {
      fields[k].el.addEventListener("input", function () { showError(k, ""); });
    });
  }

  /* ------------------------------ footer ------------------------------ */
  function buildFooter() {
    $("#footerName").textContent = DATA.name;
    $("#footerNote").textContent = DATA.footer.note;
    $("#footerLogo").src = DATA.logo.image;

    var social = $("#footerSocial");
    /* A social icon with no address is a dead link — leave it out entirely. */
    DATA.footer.social.filter(function (s) { return s.href; }).forEach(function (s) {
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

    var fe = $("#footerEmail");
    if (DATA.email) {
      fe.href = "mailto:" + DATA.email;
      fe.textContent = DATA.email;
    } else {
      fe.hidden = true;
    }

    $("#footerWaBtn").href = waHref();

    $("#copyright").textContent =
      "© " + new Date().getFullYear() + " " + DATA.footer.copyrightHolder +
      ". All rights reserved.";
  }

  /* ------------------------------ SEO ------------------------------ */
  function siteOrigin() {
    var configured = (DATA.seo.siteUrl || "").replace(/\/+$/, "");
    if (configured) return configured;
    // Fall back to wherever the page is actually being served from.
    return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "");
  }

  function absoluteUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return siteOrigin() + "/" + String(path).replace(/^\/+/, "");
  }

  function setMeta(id, content) {
    var el = document.getElementById(id);
    if (el && content) el.setAttribute("content", content);
  }

  function buildSeo() {
    var seo = DATA.seo;
    document.title = seo.title;
    setMeta("metaDescription", seo.description);
    setMeta("ogTitle", seo.title);
    setMeta("ogDescription", seo.description);
    setMeta("ogSiteName", DATA.name);
    setMeta("twitterTitle", seo.title);
    setMeta("twitterDescription", seo.description);

    /* Link previews need a full https:// address — a relative path shows up
       as a blank card on WhatsApp, Facebook and X. */
    var shareImage = DATA.hero.images[0] || DATA.gallery[0];
    var shareUrl = absoluteUrl(shareImage ? shareImage.original : DATA.logo.image);
    setMeta("ogImage", shareUrl);
    setMeta("twitterImage", shareUrl);
    if (shareImage && shareImage.alt) setMeta("ogImageAlt", shareImage.alt);

    var pageUrl = siteOrigin() + "/";
    setMeta("ogUrl", pageUrl);
    var canonical = $("#canonicalLink");
    if (canonical) canonical.href = pageUrl;

    buildStructuredData(pageUrl, shareUrl);
  }

  /* Tells Google this is a resort with an address, phone, prices and reviews,
     which is what earns the rich result in search. */
  function buildStructuredData(pageUrl, shareUrl) {
    var loc = DATA.location;
    var schema = {
      "@context": "https://schema.org",
      "@type": "Resort",
      name: DATA.name,
      description: DATA.seo.description,
      url: pageUrl,
      telephone: DATA.phone.tel,
      priceRange: DATA.seo.priceRange,
      address: {
        "@type": "PostalAddress",
        streetAddress: loc.street,
        addressLocality: loc.city,
        addressRegion: loc.region,
        postalCode: loc.postalCode,
        addressCountry: loc.country,
      },
      checkinTime: DATA.importantInfo.checkIn,
      checkoutTime: DATA.importantInfo.checkOut,
      petsAllowed: true,
      smokingAllowed: false,
      hasMap: loc.directionsUrl,
      amenityFeature: Object.keys(DATA.amenities).reduce(function (out, key) {
        DATA.amenities[key].items.forEach(function (item) {
          out.push({ "@type": "LocationFeatureSpecification", name: item.label, value: true });
        });
        return out;
      }, []),
    };

    if (DATA.email) schema.email = DATA.email;
    if (shareUrl) schema.image = [shareUrl];

    var social = DATA.footer.social
      .filter(function (s) { return s.href; })
      .map(function (s) { return s.href; });
    if (social.length) schema.sameAs = social;

    if (DATA.seo.ratingValue && DATA.seo.ratingCount) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: DATA.seo.ratingValue,
        reviewCount: DATA.seo.ratingCount,
        bestRating: 5,
      };
    }

    schema.review = DATA.testimonials.items.map(function (t) {
      return {
        "@type": "Review",
        author: { "@type": "Person", name: t.name },
        reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
        reviewBody: t.text,
      };
    });

    var faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: DATA.faq.items.map(function (item) {
        return {
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        };
      }),
    };

    var tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify([schema, faq]);
    document.head.appendChild(tag);
  }

  /* ------------------------------ UI TEXTS ------------------------------ */
  function applyUi() {
    var ui = DATA.ui;
    var text = {
      brandSub: ui.nameSub,
      aboutEyebrow: ui.about.eyebrow,
      aboutHeading: ui.about.title,
      aboutExploreBtn: ui.about.explore,
      aboutWaBtn: ui.about.wa,
      stayEyebrow: ui.stay.eyebrow,
      stayTitle: ui.stay.title,
      staySub: ui.stay.sub,
      offersEyebrow: ui.offers.eyebrow,
      offersTitle: ui.offers.title,
      offersSub: ui.offers.sub,
      packagesEyebrow: ui.packages.eyebrow,
      packagesTitle: ui.packages.title,
      packagesSub: ui.packages.sub,
      testimEyebrow: ui.testimonials.eyebrow,
      testimTitle: ui.testimonials.title,
      testimSub: ui.testimonials.sub,
      faqEyebrow: ui.faq.eyebrow,
      faqTitle: ui.faq.title,
      faqSub: ui.faq.sub,
      amenEyebrow: ui.amenities.eyebrow,
      amenTitle: ui.amenities.title,
      amenSub: ui.amenities.sub,
      galEyebrow: ui.gallery.eyebrow,
      galTitle: ui.gallery.title,
      galSub: ui.gallery.sub,
      infoEyebrow: ui.info.eyebrow,
      infoTitle: ui.info.title,
      locEyebrow: ui.location.eyebrow,
      locHeading: ui.location.title,
      directionsBtn: ui.location.directions,
      locCallBtn: ui.location.call,
      locWaBtn: ui.location.wa,
      conEyebrow: ui.contact.eyebrow,
      conTitle: ui.contact.title,
      conIntro: ui.contact.intro,
      formTitle: ui.contact.formTitle,
      sendBtn: ui.contact.submit,
      formHint: ui.contact.hint,
      footerQuickTitle: ui.footer.quickLinks,
      footerContactTitle: ui.footer.contact,
      footerWaBtn: ui.footer.wa,
    };
    Object.keys(text).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = text[id];
    });

    var labels = ui.contact.labels;
    var required = ui.contact.required || [];
    function setLabel(inputId, value, key) {
      var lbl = document.querySelector('label[for="' + inputId + '"]');
      if (!lbl) return;
      lbl.innerHTML =
        esc(value) + (required.indexOf(key) > -1 ? ' <span class="req">*</span>' : "");
    }
    /* These ids must match the inputs in index.html exactly, capitals included. */
    setLabel("fName", labels.name, "name");
    setLabel("fPhone", labels.phone, "phone");
    setLabel("fCheckIn", labels.checkin, "checkin");
    setLabel("fCheckOut", labels.checkout, "checkout");
    setLabel("fAdults", labels.adults, "adults");
    setLabel("fChildren", labels.children, "children");
    setLabel("fPref", labels.preference, "preference");
    setLabel("fMessage", labels.message, "message");

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
    var queued = false;

    var sections = DATA.nav
      .map(function (n) { return document.getElementById(n.href.slice(1)); })
      .filter(Boolean);

    /* Reading offsetTop forces the browser to recalculate layout. Measure once
       and refresh on resize instead of doing it on every scroll event. */
    var offsets = [];
    function measure() {
      offsets = sections.map(function (s) { return { id: s.id, top: s.offsetTop }; });
      docHeight = document.documentElement.scrollHeight - window.innerHeight;
    }
    var docHeight = 0;

    function applyParallax(y) {
      if (!particlesEl) return;
      particlesEl.style.transform =
        "translate3d(" + (mouseX * 22).toFixed(1) + "px, " +
        (mouseY * 14 + y * 0.22).toFixed(1) + "px, 0)";
    }

    function render() {
      queued = false;
      var y = window.scrollY;

      header.classList.toggle("scrolled", y > 40);
      backToTop.classList.toggle("show", y > 600);
      progress.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + "%";
      applyParallax(y);

      var current = "";
      var mid = y + window.innerHeight * 0.35;
      for (var i = 0; i < offsets.length; i++) {
        if (offsets[i].top <= mid) current = offsets[i].id;
      }
      navAnchors.forEach(function (a) {
        a.classList.toggle("active", a.dataset.target === current);
      });
    }

    /* Coalesce bursts of scroll/mousemove events into one paint per frame. */
    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(render);
    }

    measure();
    render();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", function () { measure(); schedule(); });
    window.addEventListener("load", measure);

    if (!REDUCED_MOTION && window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
      document.addEventListener("mousemove", function (e) {
        mouseX = e.clientX / window.innerWidth - 0.5;
        mouseY = e.clientY / window.innerHeight - 0.5;
        document.documentElement.style.setProperty("--mx", (mouseX + 0.5) * 100 + "%");
        document.documentElement.style.setProperty("--my", (mouseY + 0.5) * 100 + "%");
        schedule();
      }, { passive: true });
    }

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" });
    });
  }

  /* ------------------------------ reveal animations ------------------------------ */
  function initReveal() {
    var targets = $all(".reveal");
    var cfg = DATA.animations && DATA.animations.reveal;
    var thresh = (cfg && cfg.threshold !== undefined) ? cfg.threshold : 0.12;
    var margin = (cfg && cfg.rootMargin) || "0px 0px -40px 0px";

    if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    /* Reveal once and stop watching — re-hiding content on scroll-up is
       distracting and keeps the observer running for the life of the page. */
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: thresh, rootMargin: margin }
    );
    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------ dynamic themes ------------------------------ */
  function applyTheme() {
    var activeTheme = DATA.activeTheme || "luxury-emerald";
    var theme = DATA.themes && DATA.themes[activeTheme];
    if (theme) {
      for (var prop in theme) {
        if (theme.hasOwnProperty(prop)) {
          document.documentElement.style.setProperty("--" + prop, theme[prop]);
        }
      }
    }
    var anim = DATA.animations;
    if (anim) {
      if (anim.bgBlobDrift && anim.bgBlobDrift.enabled) {
        var drift = anim.bgBlobDrift.driftTimeSeconds || 48;
        document.documentElement.style.setProperty("--bg-drift-time-1", (drift - 2) + "s");
        document.documentElement.style.setProperty("--bg-drift-time-2", (drift + 14) + "s");
        document.documentElement.style.setProperty("--bg-drift-time-3", (drift + 6) + "s");
      }
      if (anim.kenBurns) {
        var zoom = anim.kenBurns.zoomScale || 1.08;
        document.documentElement.style.setProperty("--kb-zoom-scale", zoom);
      }
    }
  }

  /* ------------------------------ reveal settings ------------------------------ */
  function applyRevealSettings() {
    var cfg = DATA.animations && DATA.animations.reveal;
    if (cfg && cfg.enabled) {
      document.documentElement.style.setProperty("--reveal-duration", cfg.duration || "1.1s");
      document.documentElement.style.setProperty("--reveal-ease", cfg.ease || "cubic-bezier(0.22, 0.61, 0.36, 1)");
      document.documentElement.style.setProperty("--reveal-distance-y", cfg.distanceY || "24px");
    }
  }

  /* ------------------------------ custom cursor ------------------------------ */
  function initCustomCursor() {
    var cfg = DATA.animations && DATA.animations.customCursor;
    if (!cfg || !cfg.enabled || REDUCED_MOTION) return;
    if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;

    var dot = document.createElement("div");
    dot.className = "custom-cursor-dot";
    dot.style.width = (cfg.dotSize || 6) + "px";
    dot.style.height = (cfg.dotSize || 6) + "px";
    dot.style.backgroundColor = cfg.dotColor || "#d4af37";

    var ring = document.createElement("div");
    ring.className = "custom-cursor-ring";
    ring.style.width = (cfg.ringSize || 36) + "px";
    ring.style.height = (cfg.ringSize || 36) + "px";
    ring.style.borderColor = cfg.ringColor || "rgba(212, 175, 55, 0.4)";

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mouseX = 0, mouseY = 0;
    var ringX = 0, ringY = 0;
    var dotX = 0, dotY = 0;

    document.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    document.addEventListener("pointerover", function (e) {
      var target = e.target;
      if (!target) return;
      var interactive = target.closest && (target.closest("a") || target.closest(".btn") || target.closest("button") || target.closest("input") || target.closest("select") || target.closest("textarea") || target.closest("summary"));
      if (interactive) {
        ring.classList.add("hover");
        ring.style.transform = "scale(" + (cfg.ringScaleHover || 1.6) + ")";
        ring.style.borderColor = cfg.ringHoverColor || "#ffffff";
        ring.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
      }
    });

    document.addEventListener("pointerout", function (e) {
      var target = e.target;
      if (!target) return;
      var interactive = target.closest && (target.closest("a") || target.closest(".btn") || target.closest("button") || target.closest("input") || target.closest("select") || target.closest("textarea") || target.closest("summary"));
      if (interactive) {
        var related = e.relatedTarget;
        if (!related || !interactive.contains(related)) {
          ring.classList.remove("hover");
          ring.style.transform = "scale(1)";
          ring.style.borderColor = cfg.ringColor || "rgba(212, 175, 55, 0.4)";
          ring.style.backgroundColor = "transparent";
        }
      }
    });

    function tick() {
      dotX += (mouseX - dotX) * 0.45;
      dotY += (mouseY - dotY) * 0.45;
      dot.style.left = dotX + "px";
      dot.style.top = dotY + "px";

      ringX += (mouseX - ringX) * (cfg.ease || 0.15);
      ringY += (mouseY - ringY) * (cfg.ease || 0.15);
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";

      requestAnimationFrame(tick);
    }
    tick();

    document.documentElement.classList.add("hide-native-cursor");
  }

  /* ------------------------------ 3d card tilt ------------------------------ */
  function initCardTilt() {
    var cfg = DATA.animations && DATA.animations.cardTilt;
    if (!cfg || !cfg.enabled || REDUCED_MOTION) return;
    if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;

    var cards = $all(".stay-card, .offer-card, .plan-card");
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var box = card.getBoundingClientRect();
        var x = e.clientX - box.left;
        var y = e.clientY - box.top;
        var xc = box.width / 2;
        var yc = box.height / 2;
        var dx = x - xc;
        var dy = y - yc;

        var maxAngle = cfg.maxAngle || 8;
        var rx = -(dy / yc) * maxAngle;
        var ry = (dx / xc) * maxAngle;

        card.style.transform = "perspective(" + (cfg.perspective || 1000) + "px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) scale(" + (cfg.scale || 1.02) + ")";
        card.style.transition = "transform 0.1s ease-out";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(" + (cfg.perspective || 1000) + "px) rotateX(0deg) rotateY(0deg) scale(1)";
        card.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      });
    });
  }

  /* ------------------------------ init ------------------------------ */
  function init() {
    applyTheme();
    applyRevealSettings();
    initCustomCursor();
    initCardTilt();
    buildSeo();
    applyUi();
    buildHeader();
    initNav();
    buildHero();
    buildHeroParticles();
    initAvailabilityBar();
    buildAbout();
    buildStays();
    buildOffers();
    buildPackages();
    buildAmenities();
    buildGallery();
    initLightbox();
    initGalleryExpand();
    buildTestimonials();
    buildFaq();
    buildInfo();
    buildLocation();
    buildContact();
    initForm();
    buildFooter();
    initScroll();
    initReveal();
    initMagneticButtons();
    document.documentElement.classList.add("js-ready");
  }

  /**
   * Boot order:
   *   1. wait for the DOM
   *   2. work out the photo list — js/autoscan.js reads the folders live so
   *      newly dropped images appear without running anything; if the server
   *      cannot list folders it falls back to the generated js/images.js
   *   3. build the content from data.json (or js/data.js fallback) using that list
   *   4. render
   */
  function boot() {
    function render(manifest) {
      fetch("data.json")
        .then(function (res) {
          if (!res.ok) throw new Error("Status " + res.status);
          return res.json();
        })
        .then(function (jsonData) {
          proceed(jsonData);
        })
        .catch(function (err) {
          console.warn("Could not load data.json, falling back to local JS data. Error:", err);
          proceed(window.FALLBACK_RESORT_DATA || null);
        });

      function proceed(rawData) {
        if (!rawData) {
          showBootError();
          return;
        }
        try {
          DATA = resolveData(rawData, manifest);
          window.RESORT_DATA = DATA;
          init();
        } catch (bootErr) {
          showBootError();
          throw bootErr;
        }
      }
    }

    if (window.ImageAutoScan && window.ImageAutoScan.discover) {
      window.ImageAutoScan.discover().then(render, function () {
        render(window.IMAGE_MANIFEST || null);
      });
    } else {
      render(window.IMAGE_MANIFEST || null);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
