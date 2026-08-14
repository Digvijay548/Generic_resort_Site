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

1. Put your `.jpg` / `.jpeg` / `.png` files into the matching folder inside
   `assets/images/`.
2. Run the image script:

   ```
   Windows:  double-click  scripts\update-images.bat
   Anywhere: python scripts/generate-images.py
   ```

3. Refresh the page.

Five photos in a folder shows five. Add three more, run the script, and it
shows eight. Remove some and it shows fewer. Every section, the gallery and
the gallery's filter tabs all resize themselves around whatever is there.

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

Create a folder (say `assets/images/spa/`), put photos in it, run the script.
A **Spa** tab appears on its own. To control the exact wording of the tab,
add one line to the `FOLDERS` list at the top of
`scripts/generate-images.py`.

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

## 4. Before going live

1. Set **`seo.siteUrl`** in `js/data.js` to your real address, e.g.
   `https://www.theriverfrontresort.in`. WhatsApp and Facebook link previews
   need the full address — without it the preview image is blank.
2. Update the same address in **`robots.txt`** and **`sitemap.xml`**.
3. Fill in **`footer.social`** hrefs, or leave them blank to hide those icons.
4. Run `python scripts/generate-images.py` one last time and commit
   `assets/images/_optimized/` — those files are part of the live site.

---

## 5. Folder structure

```
Generic_resort_Site/
├── index.html                     ← the page itself
├── robots.txt, sitemap.xml        ← for search engines (update the domain)
├── css/
│   └── styles.css                 ← colours, layout, animations
├── js/
│   ├── images.js                  ← ⭐ AUTO-GENERATED photo list — do not edit
│   ├── data.js                    ← ⭐ all text, phone, links
│   └── main.js                    ← page behaviour
├── scripts/
│   ├── generate-images.py         ← ⭐ scans photo folders → writes js/images.js
│   ├── update-images.bat          ← ⭐ double-click version of the above
│   └── generate-placeholders.py   ← optional stand-in art for a brand-new site
└── assets/
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
