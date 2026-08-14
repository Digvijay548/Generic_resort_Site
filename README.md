# The Riverfront Resort & Camping — Website

A simple, fast, responsive single-page website for the resort. Everything you need to update
is kept in **one file**, and photos are just files you drop into folders — no coding required.

---

## 1. Quick start (run the site on your computer)

Open a terminal in this folder and run:

```
python -m http.server 8899
```

Then open **http://127.0.0.1:8899** in your browser.
(If you don't have Python, any simple static server works — or just double-click `index.html`.)

---

## 2. Where to change things

### Change text, phone number, WhatsApp number, links
Open **`js/data.js`** — this is the ONLY file you normally edit for content.
It is full of labels like `name`, `phone`, `whatsapp`, `hero`, `about`, `stays`, `amenities`,
`gallery`, `location`, `footer`. Change the words/numbers there and save. Refresh the page.

Everything visible on the page is configurable in `data.js`:
- **Brand & SEO** — `name`, `shortName`, `tagline`, `seo` (browser-tab title + search description).
- **Every heading & button text** — the `ui` block (section titles, eyebrows, form labels,
  placeholders, submit button, footer headings). Rename sections or buttons without touching HTML.
- **WhatsApp number** — ONE place: `whatsapp.number` (used by the Book Now buttons, every
  "Enquire Now" card button, the Location/Footer WhatsApp buttons, **and the enquiry form**).
  Format: country code + number, digits only.
- **Google Map** — ONE place: `location.mapEmbedSrc` (paste any Google Maps embed URL).
  The "Get Directions" button uses `location.directionsUrl`.

> Tip: use Ctrl+F in `data.js` to find the field you want, e.g. search `072777 75060` to change the phone.

### Add or replace photos

All photos live in **`assets/images/`** in folders by category. **No naming
conventions are needed** — the site scans each folder automatically.

To add a photo: drop your `.jpg`/`.jpeg`/`.png` file into the right folder, then
run:

```
python scripts/generate-images.py
```

and refresh the page. New images appear automatically in the Gallery and in the
sections that read that folder.

> If a matching `.webp` file (same name) exists next to a photo, browsers show
> that faster version. If you don't add one, the original image is shown instead
> — you only ever need to drop in the `.jpg`.

Which folder feeds which section:

| Section                | Folder(s) used                       |
|------------------------|--------------------------------------|
| Hero background        | `hero/` (first photo = desktop, second = mobile) |
| About                  | `resort/` (first two photos)         |
| Stay cards             | `rooms/`, `camping/`, `activities/`  |
| Gallery                | **all** folders, in the order: `gallery/`, `resort/`, `rooms/`, `camping/`, `pool/`, `food/`, `activities/`, `surroundings/` |
| Location               | `surroundings/` (first photo)        |

### Add more gallery photos
Drop the photo into any of the folders listed above (e.g. `assets/images/gallery/`),
run `python scripts/generate-images.py` and refresh. The gallery auto-scrolls, so
any number works.

---

## 3. Folder structure

```
deepseek/
├── index.html                  ← the page itself
├── README.md                   ← this file
├── css/
│   └── styles.css              ← colours, layout, animations (usually no need to touch)
├── js/
│   ├── images.js              ← ⭐ AUTO-GENERATED image list (run scripts/generate-images.py)
│   ├── data.js                ← ⭐ ALL text, phone, links & image folder choices live here
│   └── main.js                ← page behaviour (usually no need to touch)
├── scripts/
│   ├── generate-images.py     ← ⭐ scans the image folders → writes js/images.js
│   └── generate-placeholders.py  ← optional: regenerates the placeholder images
└── assets/
    └── images/                 ← ⭐ put your photos in these folders
        ├── branding/           ← resort-logo.png, resort-favicon.png
        ├── hero/               ← hero-main.jpg, hero-mobile.jpg  (big background)
        ├── resort/             ← exterior & riverfront photos (About section)
        ├── rooms/              ← room photos (Stay cards + Gallery)
        ├── camping/            ← camping photos (Stay cards + Gallery)
        ├── pool/               ← swimming pool photos (Gallery)
        ├── food/               ← breakfast / buffet / dinner photos (Gallery)
        ├── activities/         ← family / group activity photos (Gallery)
        ├── surroundings/       ← nature around the resort (Location + Gallery)
        └── gallery/            ← extra gallery photos
```

### Image naming rules (they no longer matter)
Previously images had to follow strict naming rules. **Now the site scans the
folders automatically**, so any filename works. If you want tidy, predictable
ordering, simple lowercase hyphenated names (e.g. `pool-01.jpg`, `room-02.jpg`)
still look best because images are shown in alphabetical order.

All current images are **replaceable placeholders** (simple illustrations), not photos of the actual resort.

---

## 4. What each website section uses (image map)

| Section                  | Image folders used                          |
|--------------------------|---------------------------------------------|
| Header logo / favicon    | `branding/`                                 |
| Hero background          | `hero/`                                     |
| About                    | `resort/`                                   |
| Stay & Camping cards     | `rooms/`, `camping/`, `activities/`         |
| Amenities (icons)        | (built-in icons, no images)                 |
| Gallery (Moments)        | `gallery/`, `rooms/`, `camping/`, `pool/`, `food/`, `activities/`, `surroundings/`, `resort/` |
| Location                 | `surroundings/` + a Google Map embed        |
| Contact / footer         | text only (from `data.js`)                  |

---

## 5. I want to regenerate the placeholder images

Placeholders are generated with Python (Pillow). From this folder run:

```
python scripts/generate-placeholders.py
```

This recreates every placeholder `.jpg` + `.webp` in `assets/images/`.

After regenerating, update the auto image list with:

```
python scripts/generate-images.py
```

---

## Notes
- No backend needed — the enquiry form opens WhatsApp with the entered details.
- The site works offline except for the Google Fonts and Google Map embed, which need internet.