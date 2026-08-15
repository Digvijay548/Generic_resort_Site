/**
 * ============================================================================
 *  LIVE PHOTO SCANNING — no script to run, just drop images in
 * ============================================================================
 *
 *  Drop a photo into any folder under assets/images/ and refresh. That is it.
 *  This file finds it at page load, so you do not have to run
 *  scripts/generate-images.py first.
 *
 *  HOW IT WORKS
 *  ------------
 *  A browser cannot read a folder off the disk — that is a security rule and
 *  there is no way around it. What it CAN do is ask the web server for a
 *  folder and read the index page most servers return. That is what happens
 *  here: assets/images/ is fetched, the folder links are read out of it, and
 *  each folder is fetched in turn for its photo links.
 *
 *  WHERE THIS WORKS
 *  ----------------
 *   works : python -m http.server (the command in README section 1)
 *   works : nginx with `autoindex on`, Apache with `Options +Indexes`
 *   works : most shared cPanel / VPS hosting
 *   NO    : GitHub Pages, Netlify, Vercel, Cloudflare Pages
 *   NO    : opening index.html straight off the disk (file://)
 *
 *  On the hosts that cannot list folders, this quietly gives up and the site
 *  uses js/images.js instead — so it still works, it just needs the Python
 *  script to have been run. Nothing ever breaks; you only lose the
 *  no-script-needed convenience.
 *
 *  ABOUT SPEED
 *  -----------
 *  Photos found this way are served at full size, because only the Python
 *  script can build the small WebP copies. A 2 MB photo stays 2 MB. That is
 *  fine while you are adding and rearranging photos. Before you put the site
 *  live, run the script once so visitors get the light versions:
 *
 *      python scripts/generate-images.py
 *
 *  Anything the script has already optimised keeps its fast version — this
 *  file only fills in photos the manifest has not seen yet.
 * ============================================================================
 */

(function () {
  "use strict";

  var IMAGES_BASE = "assets/images/";
  var CONFIG_URL = IMAGES_BASE + "folders.json";
  /* Only formats a browser can actually render. Overridden from
     assets/images/folders.json so this and scripts/generate-images.py can
     never drift apart — a format one accepts and the other ignores shows up
     locally and then vanishes after a build. Anything else (a .heic straight
     off a phone, a .tif) is converted to JPEG by the build script, and only
     appears once that has run. */
  var DEFAULT_BROWSER_EXTS = ["jpg", "jpeg", "jfif", "png", "webp", "gif", "avif"];
  var IMAGE_EXT = extPattern(DEFAULT_BROWSER_EXTS);

  function extPattern(list) {
    var safe = list
      .map(function (e) { return String(e).toLowerCase().replace(/[^a-z0-9]/g, ""); })
      .filter(Boolean);
    return new RegExp("\.(" + safe.join("|") + ")$", "i");
  }

  /* Give up rather than delay the page if the server is slow to answer. */
  var TIMEOUT_MS = 4000;

  /* Filename words that carry no meaning, used to decide whether a filename
     is descriptive enough to become alt text. Keep in step with the same list
     in scripts/generate-images.py. */
  var NOISE_WORDS = {
    img: 1, image: 1, images: 1, photo: 1, photos: 1, pic: 1, pics: 1,
    picture: 1, dsc: 1, dscn: 1, pxl: 1, screenshot: 1, capture: 1, copy: 1,
    final: 1, "new": 1, untitled: 1, download: 1, saveclip: 1, app: 1,
    whatsapp: 1, gemini: 1, generated: 1, unnamed: 1, resized: 1, edited: 1,
    "export": 1, output: 1,
  };

  var DEFAULT_CONFIG = {
    siteName: "",
    galleryOrder: [],
    folders: {},
  };

  /* ---------------------------------------------------------------- utils */
  function titleize(text) {
    return String(text)
      .replace(/[-_]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
      .join(" ");
  }

  /* True when a filename reads like words rather than camera/export noise. */
  function isDescriptive(filename) {
    var stem = filename.replace(/\.[^.]+$/, "");
    var tokens = stem.toLowerCase().split(/[-_\s.]+/);
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (!token || token.length < 3) continue;
      if (/^\d+$/.test(token)) continue;
      if (NOISE_WORDS[token]) continue;
      var digits = (token.match(/\d/g) || []).length;
      if (digits > token.length / 2) continue;
      if (!/[aeiou]/.test(token)) continue;          // real words have vowels
      if (token.length > 12 && digits) continue;     // export ids
      return true;
    }
    return false;
  }

  function settingsFor(folder, config) {
    var entry = config.folders && config.folders[folder];
    if (entry) {
      return {
        label: entry.label != null ? entry.label : titleize(folder),
        gallery: entry.gallery !== false && !!entry.label,
        alt: entry.alt || titleize(folder) + " at {site}",
      };
    }
    // Unknown folder: show it, name it after itself.
    var label = titleize(folder);
    return { label: label, gallery: true, alt: label + " at {site}" };
  }

  function buildAlt(filename, folder, index, total, config) {
    if (isDescriptive(filename)) return titleize(filename.replace(/\.[^.]+$/, ""));
    var phrase = settingsFor(folder, config).alt
      .replace("{site}", config.siteName || "the resort");
    return total > 1 ? phrase + " (" + (index + 1) + " of " + total + ")" : phrase;
  }

  function fetchWithTimeout(url) {
    if (typeof fetch !== "function") return Promise.reject(new Error("no fetch"));
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var options = controller ? { signal: controller.signal } : {};
    var timer = setTimeout(function () { if (controller) controller.abort(); }, TIMEOUT_MS);
    return fetch(url, options).then(
      function (response) {
        clearTimeout(timer);
        if (!response.ok) throw new Error(url + " -> " + response.status);
        return response;
      },
      function (err) { clearTimeout(timer); throw err; }
    );
  }

  /**
   * Pull the hrefs out of a server's folder index page. Handles the formats
   * produced by python http.server, nginx autoindex and Apache mod_autoindex.
   */
  function linksFrom(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var anchors = Array.prototype.slice.call(doc.querySelectorAll("a[href]"));
    return anchors
      .map(function (a) { return a.getAttribute("href") || ""; })
      .filter(function (href) {
        if (!href || href.charAt(0) === "?" || href.charAt(0) === "#") return false;
        if (href.charAt(0) === "/") return false;          // absolute / parent
        if (href.indexOf("://") > -1) return false;        // off-site
        if (href.indexOf("..") === 0) return false;        // "Parent Directory"
        return true;
      });
  }

  function listFolder(path) {
    return fetchWithTimeout(path)
      .then(function (response) {
        var type = response.headers.get("content-type") || "";
        if (type.indexOf("html") === -1) throw new Error("not a listing");
        return response.text();
      })
      .then(linksFrom);
  }

  /* ------------------------------------------------------------- scanning */
  function scanFolder(folder, config) {
    return listFolder(IMAGES_BASE + folder + "/").then(function (links) {
      // A folder holding both photo.jpg and photo.webp holds ONE photo.
      var byStem = {};
      links.forEach(function (href) {
        var name = decodeURIComponent(href.replace(/\/$/, ""));
        if (!IMAGE_EXT.test(name)) return;
        if (name.indexOf("/") > -1) return;
        var stem = name.replace(/\.[^.]+$/, "").toLowerCase();
        var isWebp = /\.webp$/i.test(name);
        if (!byStem[stem] || (isWebp === false && /\.webp$/i.test(byStem[stem].name))) {
          byStem[stem] = { name: name, href: href };
        }
      });

      var files = Object.keys(byStem)
        .sort()
        .map(function (k) { return byStem[k]; });

      return files.map(function (file, index) {
        var rel = IMAGES_BASE + folder + "/" + file.href;
        return {
          src: rel,
          original: rel,
          srcset: "",            // no generated sizes; the script makes those
          alt: buildAlt(file.name, folder, index, files.length, config),
          w: 0,
          h: 0,
          scanned: true,
        };
      });
    });
  }

  function galleryOrderKey(folder, config) {
    var order = config.galleryOrder || [];
    var at = order.indexOf(folder);
    return at === -1 ? [1, 0, folder] : [0, at, folder];
  }

  /**
   * Merge a freshly scanned manifest over the generated one.
   * The generated entry always wins for a photo it already knows about,
   * because it carries the WebP sizes and real dimensions. Scanned entries
   * only fill in photos the manifest has never seen.
   */
  function merge(generated, scanned) {
    if (!generated || !generated.folders) return scanned;
    if (!scanned || !scanned.folders) return generated;

    var folders = {};
    var names = {};
    Object.keys(generated.folders).forEach(function (n) { names[n] = 1; });
    Object.keys(scanned.folders).forEach(function (n) { names[n] = 1; });

    Object.keys(names).forEach(function (name) {
      var gen = generated.folders[name];
      var scan = scanned.folders[name];
      if (!scan) { folders[name] = gen; return; }
      if (!gen) { folders[name] = scan; return; }

      var optimised = {};
      gen.images.forEach(function (image) {
        optimised[(image.original || image.src).toLowerCase()] = image;
      });

      /* Scan order is the real folder order, so walk it and swap in the
         optimised version wherever we have one. A photo that has since been
         DELETED from the folder disappears, which is what you would expect. */
      var images = scan.images.map(function (image) {
        var key = image.original.toLowerCase();
        return optimised[key] || image;
      });

      folders[name] = { label: gen.label, gallery: gen.gallery, images: images };
    });

    var order = Object.keys(folders)
      .filter(function (n) { return folders[n].gallery && folders[n].images.length; })
      .sort(function (a, b) {
        var ka = galleryOrderKey(a, scanned.config || {});
        var kb = galleryOrderKey(b, scanned.config || {});
        return ka[0] - kb[0] || ka[1] - kb[1] || (ka[2] < kb[2] ? -1 : 1);
      });

    return { version: 2, order: order, folders: folders, scanned: true };
  }

  /* --------------------------------------------------------------- public */
  /**
   * Resolve the manifest the page should render from.
   * Always succeeds: falls back to window.IMAGE_MANIFEST, then to empty.
   */
  function discover() {
    var generated = window.IMAGE_MANIFEST || null;

    if (window.RESORT_DISABLE_AUTOSCAN) {
      return Promise.resolve(generated || { version: 2, order: [], folders: {} });
    }

    var config = DEFAULT_CONFIG;

    return fetchWithTimeout(CONFIG_URL)
      .then(function (r) { return r.json(); })
      .catch(function () { return null; })
      .then(function (loaded) {
        if (loaded) {
          config = loaded;
          var browser = loaded.formats && loaded.formats.browserSafe;
          if (browser && browser.length) IMAGE_EXT = extPattern(browser);
        }
        return listFolder(IMAGES_BASE);
      })
      .then(function (links) {
        var folders = links
          .filter(function (href) { return /\/$/.test(href); })
          .map(function (href) { return decodeURIComponent(href.replace(/\/$/, "")); })
          // Leading _ or . marks our own or the OS's folders, never photos.
          .filter(function (name) {
            return name && name.charAt(0) !== "_" && name.charAt(0) !== ".";
          });

        if (!folders.length) throw new Error("no folders listed");

        return Promise.all(
          folders.map(function (name) {
            return scanFolder(name, config).then(
              function (images) { return { name: name, images: images }; },
              function () { return { name: name, images: [] }; }
            );
          })
        );
      })
      .then(function (results) {
        var folders = {};
        results.forEach(function (result) {
          if (!result.images.length) return;
          var settings = settingsFor(result.name, config);
          folders[result.name] = {
            label: settings.label,
            gallery: settings.gallery,
            images: result.images,
          };
        });
        if (!Object.keys(folders).length) throw new Error("no photos found");

        var order = Object.keys(folders)
          .filter(function (n) { return folders[n].gallery; })
          .sort(function (a, b) {
            var ka = galleryOrderKey(a, config);
            var kb = galleryOrderKey(b, config);
            return ka[0] - kb[0] || ka[1] - kb[1] || (ka[2] < kb[2] ? -1 : 1);
          });

        var scanned = {
          version: 2, order: order, folders: folders,
          scanned: true, config: config,
        };
        var merged = merge(generated, scanned);

        var total = 0, live = 0;
        Object.keys(merged.folders).forEach(function (n) {
          merged.folders[n].images.forEach(function (i) {
            total++; if (i.scanned) live++;
          });
        });
        if (live) {
          console.info(
            "[photos] " + total + " found by scanning the folders; " + live +
            " have no optimised copy yet. Run  python scripts/generate-images.py  " +
            "before going live so visitors download the small versions."
          );
        }
        return merged;
      })
      .catch(function () {
        /* Expected on GitHub Pages, Netlify and friends — they do not list
           folders. The generated manifest covers it. */
        return generated || { version: 2, order: [], folders: {} };
      });
  }

  window.ImageAutoScan = { discover: discover };
})();
