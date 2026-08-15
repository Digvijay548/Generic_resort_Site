# The Riverfront Resort — Website

A fast, responsive single-page website. All the text lives in **one file**, and
photos are just files you drop into folders — no naming rules, no coding.

---

## 1. Quick start (run the site on your computer)

Open a terminal in this folder and run:

```
python -m http.server 8899
```

Then open **http://127.0.0.1:8899**.

> Use a server rather than double-clicking `index.html`. Opening the file
> directly works for most things, but some browsers block the photo list from
> loading that way.

---

## 2. Photos — drop them in, that's it

**Filenames do not matter. How many you have does not matter.**

Put your `.jpg` / `.jpeg` / `.png` files into the matching folder inside
`assets/images/` and **refresh the page**. That is the whole job.

Five photos in a folder shows five. Add three more and it shows eight. Remove
some and it shows fewer. Every section, the gallery and the gallery's filter
tabs all resize themselves around whatever is there.

While you are working locally, `js/autoscan.js` reads the folders straight
from your dev server, so nothing needs running.

### …but run this before you publish

Photos found by scanning are served **at full size** — a 2 MB photo stays
2 MB, because only Python can build the small WebP copies. So once you are
happy with the photos:

```
Windows:  double-click  scripts\update-images.bat
Anywhere: python scripts/generate-images.py
```

That drops the whole set from ~10 MB to ~1 MB. The browser console tells you
when photos are still waiting for it.

> Deploying to Netlify? You can skip this — Netlify runs it for you on every
> push. See section 6.

### Which folder feeds which section

| Folder           | Where it shows up                                          |
|------------------|------------------------------------------------------------|
| `branding/`      | Logo in the header, footer and browser tab                  |
| `hero/`          | Big background photo at the top (1st = desktop, 2nd = mobile) |
| `resort/`        | About section, plus a **Resort** gallery tab                |
| `rooms/`         | Stay cards, plus a **Rooms** gallery tab                    |
| `pool/`          | **Swimming Pool** gallery tab                               |
| `food/`          | **Food** gallery tab                                        |
| `activities/`    | The "Group Outings" stay card, plus an **Activities** tab   |
| `gallery/`       | **Resort** gallery tab                                      |
| `surroundings/`  | Held in reserve — not shown in the gallery                  |

Sections fall through to another folder when their own is empty, so the About
section never shows the same photo twice and a Stay card never breaks because
you only uploaded one room photo.

### Adding a brand-new gallery tab

Create a folder (say `assets/images/spa/`), put photos in it, refresh. A
**Spa** tab appears on its own.

To control the exact wording of the tab, or to keep a folder out of the
gallery, add an entry to **`assets/images/folders.json`**. Both the Python
script and the browser read that same file, so they can never disagree.

### Photo descriptions (optional but good for Google)

Every photo needs a short description for screen readers and search engines.
One is written for you based on the folder. To write your own, drop an
`_alt.json` file into the folder:

```json
{
  "IMG_4821.jpg": "Sunset over the river from the lawn",
  "pool-02.jpg": "Children playing in the swimming pool"
}
```

### What the script does for you

* Makes small/medium/large **WebP** copies in `assets/images/_optimized/`, so a
  phone downloads a ~30 KB image instead of a 2 MB one. Your originals are
  never touched.
* Records each photo's real dimensions so the page does not jump about while
  loading.
* Writes a sensible description for each photo.

Re-running it is cheap — it only rebuilds copies whose original changed.
Add `--force` to rebuild everything, or `--clean` to start from scratch.

> The script needs **Pillow**. If it is missing, install it with
> `python -m pip install Pillow`. Without Pillow the site still works, it just
> serves the full-size originals.

---

## 3. Text, phone number, links

Open **`js/data.js`** — the only file you normally edit.

Everything visible is configurable there:

- **Brand & SEO** — `name`, `shortName`, `seo` (tab title, search description,
  and `seo.siteUrl`).
- **Every heading & button** — the `ui` block.
- **WhatsApp number** — ONE place: `whatsapp.number`. Used by every Book Now
  button, every Enquire Now card, the Location/Footer buttons and the form.
- **Address & map** — ONE place: `location.fullAddress`. The embedded map and
  the "Get Directions" button both follow it.
- **Check-in / check-out** — ONE place: `importantInfo`. The FAQ answer and
  every pricing card read from it, so the times can never disagree.
- **Navigation** — `nav`. The header, mobile menu and footer links all follow.

### Sections you can add to freely

The code loops over these arrays, so any number of items renders automatically.

| Section    | Config block in `js/data.js` | Shape of one entry                                 |
|------------|------------------------------|----------------------------------------------------|
| Reviews    | `testimonials.items[]`       | `{ name, tag, rating, text }` (rating 1–5)         |
| Offers     | `offers.items[]`             | `{ badge, title, text }`                            |
| Pricing    | `packages.plans[]`           | `{ name, price, priceNote, featured, features[] }`  |
| Amenities  | `amenities.<group>.items[]`  | `{ icon, label }`                                   |
| Stay cards | `stays[]`                    | `{ title, description, image, facilities[] }`       |
| FAQ        | `faq.items[]`                | `{ q, a }`                                          |
| Nav links  | `nav[]`                      | `{ label, href }`                                   |
| Social     | `footer.social[]`            | `{ icon, label, href }` — blank `href` hides it     |

Amenity `icon` names must exist in the `ICONS` map in `js/main.js`; an unknown
name falls back to a plain circle rather than breaking.

---

## 4. Hero background video (optional)

The hero cross-fades the photos in `assets/images/hero/` with a slow zoom. To
replace that with an ambient video loop, drop a clip at:

```
assets/video/hero.mp4     (required)
assets/video/hero.webm    (optional, smaller where supported)
```

No configuration needed — the hero picks it up. Guidance and an ffmpeg recipe
are in `assets/video/README.txt`. Keep it under 4 MB, 5–15 seconds, and with
**no audio track** (browsers block autoplay with sound).

Phones and visitors who ask for reduced motion always get the photos, never
the video. If the file is missing, unplayable or autoplay is refused, the
photos simply stay — the page never shows a black rectangle.

---

## 5. Fonts

Fonts are **self-hosted** in `assets/fonts/`, so the page contacts no third
party before a visitor interacts with it, and text paints without an extra
round trip to Google.

You only need this if you change the fonts:

```
python scripts/fetch-fonts.py
```

It downloads the woff2 files and rewrites `css/fonts.css`. Both are committed
to the repo and must be uploaded with the site.

---

## 6. Deploying to Netlify

`netlify.toml` is already in the repo, so there is nothing to set up in
Netlify's dashboard.

1. Go to **app.netlify.com → Add new site → Import an existing project**.
2. Pick this GitHub repository.
3. Leave every field as Netlify suggests — it reads `netlify.toml`.
4. **Deploy**.

Every push to the branch redeploys automatically.

### Photos on Netlify

Netlify does not serve directory listings, so the live-scanning in
`js/autoscan.js` cannot work there. Instead **Netlify runs the image script
for you** during the build (`scripts/netlify-build.sh`), so the workflow is
unchanged:

```
drop photos into assets/images/…  →  commit  →  push  →  live
```

You never run the script by hand. It builds the WebP copies on Netlify's
servers, and the first build takes an extra minute or two while it does.

The build **cannot fail the deploy** — the script always exits successfully.
If Python or Pillow is unavailable, the site falls back to the committed
`js/images.js` and `assets/images/_optimized/`, which is always a working
state. That is also why both are committed rather than ignored.

### What the config sets

- `404.html` is served for unknown addresses (Netlify finds it by name).
- Fonts cached for a year; photos for a day, so replacing a photo shows up
  quickly; HTML/CSS/JS always revalidated.
- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and
  `Permissions-Policy` are set on every response.
- A stricter `Content-Security-Policy` is included but **commented out**,
  because the search-engine data is added by JavaScript and a few browsers
  block that as an inline script. Turn it on after confirming the page still
  passes <https://search.google.com/test/rich-results>.

### After the first deploy

Netlify gives you a `something.netlify.app` address. Put your real domain in
`js/data.js` (`seo.siteUrl`), `robots.txt` and `sitemap.xml` — see the next
section — then push again.

---

## 6b. Deploying to GitHub Pages

It works, but there is one trap.

### `.nojekyll` must stay in the repo root

GitHub Pages runs every site through Jekyll, and **Jekyll deletes anything
whose name starts with an underscore**. All the optimised photos live in
`assets/images/_optimized/`, so without `.nojekyll` the site publishes with
**98 of its 127 image URLs returning 404** — no hero, no gallery, no card
photos. Locally it all looks perfect, which makes it a confusing one to chase.

The `.nojekyll` file in the repo root switches Jekyll off. Do not delete it.

> Why not just rename the folder? The underscore is what tells
> `js/autoscan.js` to skip it, so renaming would fix Pages and break the
> photo scanner. Keep the underscore and keep `.nojekyll`.

### No build step

Pages cannot run the Python script, so it serves whatever is committed. That
is fine — `js/images.js` and `assets/images/_optimized/` are both in the repo.
Just remember to run the script yourself after adding photos:

```
python scripts/generate-images.py
```

then commit the changes. (Netlify does this for you; Pages does not.)

### Project sites live under a sub-path

A project site is served from `https://<user>.github.io/<repo>/`. Every asset
path in the site is relative, so that works as-is. Two things do not:

- `seo.siteUrl` in `js/data.js`, plus `robots.txt` and `sitemap.xml`, still
  name the real domain. Link previews will point at the real domain rather
  than the Pages URL until it is live.
- The links on `404.html` start with `/`, so on a project site they land on
  the user's root site instead of the project. On a custom domain they are
  correct.

Neither affects the pages themselves. A custom domain clears both.

---

## 7. Before going live

1. Set **`seo.siteUrl`** in `js/data.js` to your real address, e.g.
   `https://www.theriverfrontresort.in`. WhatsApp and Facebook link previews
   need the full address — without it the preview image is blank.
2. Update the same address in **`robots.txt`** and **`sitemap.xml`**.
3. Set **`email`** in `js/data.js` to a mailbox you actually read, or `""` to
   hide it from the Contact list, the footer and the search-engine data.
4. Fill in **`footer.social`** hrefs. A blank one hides that icon, so an
   unused network never becomes a dead link.
5. **Check `seo.ratingValue`.** It publishes a star rating to Google. Google's
   review-snippet policy forbids a business marking up reviews of itself, so
   unless these are verifiable reviews, set `ratingValue: null` and let your
   Google Business Profile carry the stars instead.
6. Point your host's **404 handler** at `404.html` (GitHub Pages and Netlify
   pick it up automatically; Apache needs `ErrorDocument 404 /404.html`).
7. Run `python scripts/generate-images.py` one last time and commit
   `assets/images/_optimized/` — those files are part of the live site.

---

## 8. Folder structure

```
Generic_resort_Site/
├── index.html                     ← the page itself
├── 404.html                       ← shown for a missing address
├── robots.txt, sitemap.xml        ← for search engines (update the domain)
├── css/
│   ├── styles.css                 ← colours, layout, animations
│   └── fonts.css                  ← AUTO-GENERATED font declarations
├── js/
│   ├── images.js                  ← ⭐ AUTO-GENERATED photo list — do not edit
│   ├── data.js                    ← ⭐ all text, phone, links
│   └── main.js                    ← page behaviour
├── scripts/
│   ├── generate-images.py         ← ⭐ scans photo folders → writes js/images.js
│   ├── update-images.bat          ← ⭐ double-click version of the above
│   ├── fetch-fonts.py             ← re-downloads the self-hosted fonts
│   └── generate-placeholders.py   ← optional stand-in art for a brand-new site
└── assets/
    ├── fonts/                     ← self-hosted woff2 files
    ├── video/                     ← optional hero.mp4 (see its README)
    └── images/                    ← ⭐ your photos, in folders
        ├── branding/  hero/  resort/  rooms/
        ├── pool/  food/  activities/  surroundings/  gallery/
        └── _optimized/            ← auto-made fast copies, do not edit
```

---

## Notes

- No backend and no build step. The enquiry form opens WhatsApp with the
  details filled in.
- The site works offline apart from Google Fonts and the Google Map embed.
- `js/images.js` and `assets/images/_optimized/` are generated. Re-run the
  image script rather than editing them by hand.
