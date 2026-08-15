# Branch: `client/bade-farms`

The same codebase as `main`, rebranded for **Bade Farms**, Kolhapur.

Read this before showing the site to the client or putting it online.

---

## Does Bade Farms already have a website?

**No.** `badefarms.com` is registered but **parked** — it serves a 114-byte
page whose only content is a script redirecting to `/lander`, which is the
standard domain-parking stub:

```
$ curl -sL https://badefarms.com
<!DOCTYPE html><html><head><script>
window.onload=function(){window.location.href="/lander"}
</script></head></html>
```

`www.badefarms.com` and the `http://` variants all return the same thing.

So the domain exists — most likely already theirs — but there is no site on
it. `seo.siteUrl` is set to `https://www.badefarms.com` ready for it.

---

## What is verified, and where it came from

| Detail | Value | Source |
|---|---|---|
| Name | Bade Farms | Instagram, Facebook, directories |
| Phone / WhatsApp | **7249352979** | Their own Instagram bio: "FOR BOOKING - 7249352979" |
| Address | Behind Khadicha Ganapati, Ratnappa Kumbhar Nagar, Kolhapur 416013 | mandap.com listing |
| Property | 5BHK villa, swimming pool, 2 acres | Their own Instagram bio |
| Capacity | 250 seated / 500 standing | weddingbazaar.com, mandap.com |
| Event rate | ₹35,000 per day | weddingbazaar.com, mandap.com |
| Parking | ~50 cars | weddingbazaar.com, mandap.com |
| Catering | In-house veg + non-veg; outside food allowed | mandap.com |
| Instagram | instagram.com/badefarms | verified live |
| Facebook | facebook.com/BadeFarms | verified live |

Note the Instagram bio (**2 acres, 5BHK**) disagrees with some directory
listings (1.5 acres, "2 rooms"). The business's own account wins — the "2
rooms" on wedding sites almost certainly means changing rooms, not bedrooms.

---

## What is NOT verified — fix before publishing

Each of these is marked `TODO CONFIRM` in `js/data.js`.

1. **Email — `badefarms79@gmail.com`.** Appears on third-party directories
   only, never on a page the business controls. Confirm it, or set
   `email: ""` and the row disappears from Contact, the footer and the
   search-engine data.

2. **Check-in / check-out — 1:00 PM / 11:00 AM.** Not published anywhere.
   These are the usual times for a whole-villa let. One value in
   `importantInfo` feeds the FAQ answer and both rate cards.

3. **The ₹35,000 rate** is from wedding directories, not from the business.
   Confirm it is current.

4. **Overnight rate** is deliberately "On request" rather than a guess.

---

## Things deliberately left empty

- **`testimonials.items` is `[]`.** The six reviews on `main` were written for
  a different property. Inventing reviews for a real business is not
  something to ship. The whole section hides itself while the array is empty
  — paste in real, attributable guest quotes and it comes back.

- **`seo.ratingValue` is `null`.** It published a star rating to Google built
  from those invented reviews. Google's review-snippet policy forbids a
  business marking up reviews of itself. Leave it null and let the Google
  Business Profile carry the stars.

- **YouTube** has a blank `href`, so the icon stays hidden rather than
  becoming a dead link.

---

## Photos and logo — still from the other project

**Every photo in `assets/images/` is still The Riverfront Resort's.** They are
here only so the layout renders while you build. They must all be replaced
before anyone outside sees this.

The logo (`assets/images/branding/resort-logo.png`) is a generated
placeholder illustration, not any real business's mark, so it is safe to
leave in place until a real logo arrives.

Replacing them is the easy part — drop files in and refresh:

```
assets/images/hero/          the villa, wide shots
assets/images/resort/        exterior and grounds
assets/images/rooms/         the five bedrooms
assets/images/pool/          the pool
assets/images/food/          catering
assets/images/activities/    events, parties, weddings
assets/images/gallery/       anything else
assets/images/branding/      the real logo, if they have one
```

Filenames and counts do not matter. Delete the old ones, drop the new ones
in, refresh. Before publishing run `python scripts/generate-images.py` (or
let Netlify do it) so the WebP copies are rebuilt.

Their Instagram (`@badefarms`, ~3,100 followers) is the obvious source — ask
them for the originals rather than pulling compressed copies off the feed.

---

## Content that is written to fit, but should be checked by the client

The positioning throughout is **"one private property, booked whole"**, taken
from the Instagram bio. The Stay section became three uses of the one
property rather than three room types:

- The Whole Villa
- Pool Parties
- Weddings & Events

Amenities, FAQ and the enquiry form's "Occasion" dropdown all follow from
that. If they also let individual rooms, this framing needs revisiting.

---

## Deploying this branch

`netlify.toml` is inherited from `main` and needs no changes. Point a separate
Netlify site at this branch, or merge it when the photos and the four
`TODO CONFIRM` values are settled.
