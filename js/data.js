/**
 * ============================================================================
 *  BADE FARMS — CENTRAL SITE DATA
 * ============================================================================
 *  This is the ONLY file you normally need to edit to update the website.
 *
 *  TEXT / PHONE / LINKS
 *  --------------------
 *  Edit the values below. The rest of the site reads everything from here.
 *
 *  PHOTOS
 *  ------
 *  You do NOT list photos here. Drop any .jpg/.jpeg/.png into a folder inside
 *  assets/images/ (any filename, any number of them), then run:
 *
 *      python scripts/generate-images.py
 *      (or double-click scripts/update-images.bat on Windows)
 *
 *  The page lays itself out around whatever is in those folders. Five photos
 *  shows five. Add three more and it shows eight. Create a brand-new folder
 *  and it becomes a new gallery tab. Nothing below needs changing.
 *
 *  Sections pull from folders in a preference order, so a section never shows
 *  the same photo twice and never breaks when a folder is empty — it just
 *  falls through to the next folder in its list.
 * ============================================================================
 */

/* This file is a factory: js/main.js calls it once the photo list is ready
   (see js/autoscan.js). You still only ever edit the values below. */
window.buildResortData = function (manifest) {
  "use strict";

  /* ------------------------------------------------------------------ */
  /*  IMAGE PLUMBING — no need to edit this block.                       */
  /* ------------------------------------------------------------------ */
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

  /* Hand out photos from a list of folders, never repeating one until the
     whole pool has been used. Call it once per slot that needs a picture. */
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

  /* Every gallery-flagged folder, in the order the generator decided. */
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

  /* Filter tabs are derived from the folders that actually contain photos, so
     there is never a tab that shows nothing and never a folder without a tab. */
  function galleryTabs() {
    var labels = [];
    (IMG.order || []).forEach(function (name) {
      var label = folderLabel(name);
      if (label && !folderImages(name).length) return;
      if (label && labels.indexOf(label) === -1) labels.push(label);
    });
    return labels.length ? ["All"].concat(labels) : [];
  }

  var RESORT_DATA = {
    /* ------------------------------------------------------------------ */
    /*  BRANDING & CONTACT                                                  */
    /* ------------------------------------------------------------------ */
    name: "Bade Farms",
    shortName: "Bade",

    /* ------------------------------------------------------------------ */
    /*  SEO — browser tab, Google results, WhatsApp/Facebook link previews. */
    /* ------------------------------------------------------------------ */
    seo: {
      title: "Bade Farms | Private 5BHK villa with pool, Kolhapur",
      description:
        "Bade Farms — a private 5BHK villa on two acres in Kolhapur, with a crystal-clear swimming pool, lawns and parking for 50 cars. Book the whole property for family stays, pool parties, weddings and corporate days out.",
      // ==========================================================
      //  ⭐ PUT YOUR REAL WEBSITE ADDRESS HERE once the site is live.
      //  Link previews on WhatsApp/Facebook need the FULL address
      //  (they cannot resolve relative paths). Include https:// and
      //  no trailing slash.
      // ==========================================================
      // badefarms.com is registered but currently parked (it serves an empty
      // page that redirects to /lander). Point it at this site when ready.
      siteUrl: "https://www.badefarms.com",
      // Left null on purpose. Google's review-snippet policy forbids a
      // business publishing star markup for reviews of itself, and no
      // verified review feed is wired up. Let the Google Business Profile
      // carry the stars instead.
      ratingValue: null,
      ratingCount: null,
      priceRange: "₹₹₹",
    },

    logo: { image: "assets/images/branding/resort-logo.png" },

    phone: {
      // From the resort's own Instagram bio: "FOR BOOKING - 7249352979"
      display: "72493 52979",
      tel: "+917249352979",
    },

    // ==========================================================
    //  ⭐ EMAIL — shown in Contact and the footer, and given to
    //  Google. Set to "" to hide it everywhere.
    // ==========================================================
    // TODO CONFIRM: listed on third-party directories, not on any page the
    // business controls. Verify before publishing, or set to "" to hide it.
    email: "badefarms79@gmail.com",

    whatsapp: {
      // ==========================================================
      //  ⭐ SINGLE WHATSAPP NUMBER USED EVERYWHERE:
      //  - "Book Now" / "Book Your Stay" buttons
      //  - "Enquire Now" on every Stay card
      //  - Location + Footer WhatsApp buttons
      //  - The enquiry form (opens WhatsApp with the form details)
      //  Format: country code + number, digits only (no +, no spaces).
      //  e.g. 917249352979 for +91 72493 52979
      // ==========================================================
      number: "917249352979",
      message:
        "Hello, I would like to enquire about availability at Bade Farms.",
    },

    /* ------------------------------------------------------------------ */
    /*  NAVIGATION — add or remove a line and the header, mobile menu and   */
    /*  footer links all follow.                                            */
    /* ------------------------------------------------------------------ */
    nav: [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "The Villa", href: "#stay" },
      { label: "Why Us", href: "#offers" },
      { label: "Rates", href: "#packages" },
      { label: "Amenities", href: "#amenities" },
      { label: "Gallery", href: "#gallery" },
      { label: "FAQ", href: "#faq" },
      { label: "Location", href: "#location" },
      { label: "Contact", href: "#contact" },
    ],

    /* ------------------------------------------------------------------ */
    /*  UI TEXTS — every visible heading, label and button on the page.    */
    /*  Change these to rebrand the whole site for any client.             */
    /* ------------------------------------------------------------------ */
    ui: {
      nameSub: "Farms · Kolhapur",
      navBook: "Book Now",
      hero: { book: "Check Dates", call: "Call Now" },
      // Floating availability bar at the bottom of the hero
      availability: {
        checkIn: "From",
        checkOut: "To",
        guests: "Guests",
        suite: "Occasion",
        submit: "Check Availability",
        anySuite: "Not sure yet",
        errorDates: "Please choose a check-out date after your check-in date.",
      },
      about: {
        eyebrow: "About Bade Farms",
        title: "A private villa, and the grounds around it",
        explore: "Explore Stays",
        wa: "Enquire on WhatsApp",
      },
      stay: {
        eyebrow: "What We Host",
        title: "One property, three ways to use it",
        sub: "Stay the weekend, throw a pool party, or hand the whole two acres over to a wedding.",
        enquire: "Enquire Now",
      },
      amenities: {
        eyebrow: "Amenities",
        title: "What comes with the property",
        sub: "Pool, kitchen, lawns, lighting, sound and parking — all included when you book the whole place.",
      },
      gallery: {
        eyebrow: "Gallery",
        title: "A look around Bade Farms",
        sub: "The villa, the pool, the lawns and evenings on the property.",
        // {n} becomes the number of photos in the current filter
        viewAll: "View all {n} photos",
        viewLess: "Show fewer",
      },
      offers: {
        eyebrow: "Why Bade Farms",
        title: "Booked whole, never shared",
        sub: "The reasons people choose a private property over a hall or a hotel block.",
      },
      packages: {
        eyebrow: "Rates",
        title: "What it costs",
        sub: "The whole property, one booking at a time. Message us for dates and a firm quote.",
        book: "Enquire Now",
      },
      testimonials: {
        eyebrow: "Testimonials",
        title: "What our guests say",
        sub: "Real experiences from happy guests who relaxed by the river.",
      },
      faq: {
        eyebrow: "FAQ",
        title: "Frequently asked questions",
        sub: "Answers to the questions guests ask us most.",
      },
      info: {
        eyebrow: "Good to Know",
        title: "Important information",
        checkIn: "Check-in",
        checkOut: "Check-out",
      },
      location: {
        eyebrow: "Location",
        title: "Find Us",
        directions: "Get Directions",
        call: "Call Resort",
        wa: "WhatsApp",
        mapTitle: "View us on the map",
        mapNote: "The map is loaded from Google only when you choose to open it.",
        mapLoad: "Load map",
      },
      contact: {
        eyebrow: "Contact",
        title: "Send us an enquiry",
        intro: "Tell us your dates and what you are planning, and we will come back on WhatsApp with availability and a quote.",
        formTitle: "Enquiry Form",
        labels: {
          name: "Full name",
          phone: "Phone number",
          checkin: "Check-in date",
          checkout: "Check-out date",
          adults: "Number of adults",
          children: "Number of children",
          preference: "Stay preference",
          message: "Message",
        },
        placeholders: {
          name: "Your full name",
          phone: "e.g. 98200 00000",
          message: "Tell us about your planned stay…",
        },
        required: ["name", "phone"], // field keys that show a red *
        submit: "Send Enquiry",
        hint: "Your enquiry opens in WhatsApp — no account or backend needed.",
        preferences: ["Villa stay", "Pool party", "Wedding", "Corporate event"],
      },
      footer: {
        quickLinks: "Quick Links",
        contact: "Contact",
        wa: "WhatsApp Us",
      },
    },

    /* ------------------------------------------------------------------ */
    /*  HERO — uses assets/images/hero/                                     */
    /*  First photo = desktop, second = mobile. Only one photo in the       */
    /*  folder? It is used for both.                                        */
    /* ------------------------------------------------------------------ */
    hero: {
      heading: "Two Acres, Entirely Yours",
      subtitle:
        "A private five-bedroom villa and pool in Kolhapur — booked whole, never shared.",

      // ==========================================================
      //  ⭐ AMBIENT BACKGROUND VIDEO (optional)
      //  Drop a short, muted, looping clip at the path below and the
      //  hero plays it instead of the photo slideshow. 5–15 seconds,
      //  ideally under 4 MB. See assets/video/README.txt.
      //
      //  Phones and reduced-motion visitors always get the photos —
      //  a background video is not worth their data or battery.
      //
      //  While no file exists here, desktop visits make one failed
      //  request (~0.5 KB) and fall back to the photos. That is the
      //  price of "drop the file in and it works". Set both values to
      //  "" if you would rather have no request at all.
      // ==========================================================
      video: "assets/video/hero.mp4",
      videoWebm: "assets/video/hero.webm", // optional, smaller where supported

      images: (function () {
        var desktop = nextPhoto("hero", "resort", "gallery");
        var mobile = nextPhoto("hero", "resort", "gallery") || desktop;
        return [desktop, mobile].filter(Boolean);
      })(),
    },

    /* ------------------------------------------------------------------ */
    /*  ABOUT — two photos from resort/, falling through to gallery/ so the */
    /*  large image and the small inset are never the same picture.         */
    /* ------------------------------------------------------------------ */
    about: {
      text: "Bade Farms is a five-bedroom villa set in two acres of private green on the edge of Kolhapur, a few minutes from Ratnappa Kumbhar Nagar. You book the whole property — the house, the pool, the lawns and the parking — so there are no other guests, no shared spaces and no fixed schedule. It suits a family weekend as easily as a pool party, a wedding or a company day out.",
      image: nextPhoto("resort", "gallery", "surroundings"),
      imageB: nextPhoto("resort", "gallery", "surroundings"),
    },

    /* ------------------------------------------------------------------ */
    /*  STAY CARDS — add or remove a card freely. Each card takes the next  */
    /*  unused photo from the folders it lists.                             */
    /* ------------------------------------------------------------------ */
    stays: [
      {
        title: "The Whole Villa",
        description:
          "All five bedrooms, the living areas, the pool and both acres — yours for the booking, with nobody else on the property.",
        image: nextPhoto("rooms", "gallery"),
        facilities: [
          "5 bedrooms",
          "Air conditioning",
          "Private pool",
          "Full kitchen",
        ],
      },
      {
        title: "Pool Parties",
        description:
          "A crystal-clear pool, open lawn and covered seating — set up for birthdays, reunions and get-togethers that run into the evening.",
        image: nextPhoto("pool", "gallery"),
        facilities: [
          "Swimming pool",
          "Music and DJ setup",
          "Evening lighting",
          "Catering available",
        ],
      },
      {
        title: "Weddings & Events",
        description:
          "Two acres with room for 250 seated or 500 standing, a bridal suite, in-house catering and parking for fifty cars.",
        image: nextPhoto("activities", "gallery"),
        facilities: [
          "250 seated / 500 standing",
          "Bridal suite",
          "50 car parking",
          "Power backup",
        ],
      },
    ],
    stayNote:
      "Bade Farms is only ever let as a whole property, so your group has the house, the pool and the grounds to itself. Message us for dates and a quote.",

    /* ------------------------------------------------------------------ */
    /*  OFFERS & DISCOUNTS                                                  */
    /* ------------------------------------------------------------------ */
    offers: {
      items: [
        {
          badge: "Whole villa",
          title: "Nothing Shared",
          text: "Five bedrooms, the pool and two acres go to one booking at a time. No other guests, no shared lawn, no fixed timings.",
        },
        {
          badge: "500 guests",
          title: "Room To Celebrate",
          text: "250 seated or 500 standing across the grounds, with a bridal suite, power backup and parking for fifty cars.",
        },
        {
          badge: "Your caterer",
          title: "Food Your Way",
          text: "In-house catering does both veg and non-veg, or bring your own cook and decorators — outside vendors are welcome.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /*  STAY PACKAGES & PRICING                                             */
    /*  Check-in / check-out times come from `importantInfo` below so they  */
    /*  can only ever be stated once.                                       */
    /* ------------------------------------------------------------------ */
    packages: {
      plans: [
        {
          name: "Event Day",
          // Rate published on wedding-venue directories. TODO CONFIRM.
          price: "INR 35,000/-",
          priceNote: "per day, whole venue",
          featured: true,
          features: [
            "Exclusive use of all two acres",
            "250 seated / 500 standing",
            "Bridal suite and changing rooms",
            "Lighting, sound and DJ setup",
            "Parking for 50 cars",
            "Power backup",
            "Outside decorators welcome",
          ],
        },
        {
          name: "Villa Stay",
          price: "On request",
          priceNote: "per night, whole villa",
          featured: false,
          features: [
            "All 5 bedrooms, air conditioned",
            "Private swimming pool",
            "Full kitchen and dining",
            "Two acres of private grounds",
            "In-house catering optional",
            "Parking for 50 cars",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /*  TESTIMONIALS — guest reviews carousel                               */
    /* ------------------------------------------------------------------ */
    testimonials: {
      // Deliberately empty. The previous entries were written for a different
      // property and inventing reviews for a real business is not on. The
      // whole section hides itself while this is empty — paste in real,
      // attributable guest quotes and it reappears.
      items: [],
    },

    /* ------------------------------------------------------------------ */
    /*  FAQ — collapsible question & answer list.                           */
    /*  {checkIn} and {checkOut} are filled in from `importantInfo`.        */
    /* ------------------------------------------------------------------ */
    faq: {
      items: [
        {
          q: "Do we get the whole property to ourselves?",
          a: "Yes. Bade Farms is let as one booking at a time, so the villa, the pool and both acres are yours for the duration of your stay or event.",
        },
        {
          q: "How many people can you host?",
          a: "Around 250 seated or 500 standing across the grounds for an event. For an overnight stay the villa has five bedrooms.",
        },
        {
          q: "Can we bring our own caterer and decorators?",
          a: "Yes. In-house catering is available for both veg and non-veg menus, and outside caterers and decorators are welcome.",
        },
        {
          q: "Is there parking?",
          a: "There is space for around 50 cars on the property.",
        },
        {
          q: "What are the check-in and check-out times?",
          a: "Check-in is at {checkIn} and check-out is at {checkOut}.",
        },
        {
          q: "How do we book?",
          a: "Tap any Book Now or Enquire button, or use the form — it opens WhatsApp with your details and we reply with dates and a quote.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /*  AMENITIES — each item needs an icon name from ICONS in js/main.js.  */
    /*  An unknown icon name falls back to a plain circle, never an error.  */
    /* ------------------------------------------------------------------ */
    amenities: {
      popular: {
        title: "The Property",
        items: [
          { icon: "pool", label: "Private swimming pool" },
          { icon: "ac", label: "Air conditioning" },
          { icon: "parking", label: "Parking for 50 cars" },
          { icon: "wifi", label: "Wi-Fi" },
          { icon: "food", label: "In-house catering" },
          { icon: "coffee", label: "Full kitchen" },
          { icon: "tree", label: "Two acres of grounds" },
          { icon: "sun", label: "Open lawn" },
        ],
      },
      events: {
        title: "For Events",
        items: [
          { icon: "sparkle", label: "Lighting and sound" },
          { icon: "service", label: "DJ setup" },
          { icon: "storage", label: "Bridal suite" },
          { icon: "buffet", label: "Veg and non-veg menus" },
          { icon: "generic", label: "Power backup" },
          { icon: "flower", label: "Outside decorators welcome" },
        ],
      },
      stay: {
        title: "For Overnight Stays",
        items: [
          { icon: "roomsvc", label: "Five bedrooms" },
          { icon: "cleaning", label: "Housekeeping" },
          { icon: "breakfast", label: "Breakfast on request" },
          { icon: "child", label: "Child friendly" },
        ],
      },
      languages: {
        title: "Languages Spoken",
        items: [
          { icon: "hi", label: "Marathi / Hindi" },
          { icon: "en", label: "English" },
        ],
      },
    },

    /* ------------------------------------------------------------------ */
    /*  GALLERY — entirely automatic. Both the photos and the filter tabs   */
    /*  come from whatever is in assets/images/. To add a tab, make a new   */
    /*  folder and re-run the image script.                                 */
    /* ------------------------------------------------------------------ */
    galleryFilters: galleryTabs(),
    gallery: galleryPhotos(),

    /* ------------------------------------------------------------------ */
    /*  IMPORTANT INFORMATION — the single source of truth for check-in and */
    /*  check-out times (the FAQ and packages read them from here).         */
    /* ------------------------------------------------------------------ */
    importantInfo: {
      // TODO CONFIRM: not published anywhere the business controls. These are
      // the usual times for a whole-villa let; check before publishing.
      checkIn: "1:00 PM",
      checkOut: "11:00 AM",
      items: [
        "Whole property let to one booking at a time",
        "Around 250 seated or 500 standing for events",
        "Parking for approximately 50 cars",
        "Outside caterers and decorators welcome",
        "Veg and non-veg both available",
        "Power backup on site",
        "Event bookings: 30% on booking, balance on the day",
      ],
    },

    /* ------------------------------------------------------------------ */
    /*  LOCATION                                                            */
    /* ------------------------------------------------------------------ */
    location: {
      addressLines: [
        "Bade Farms",
        "Behind Khadicha Ganapati, Ratnappa Kumbhar Nagar,",
        "Kolhapur, Maharashtra 416013",
      ],
      // Structured version of the same address, used for Google rich results.
      street: "Behind Khadicha Ganapati, Ratnappa Kumbhar Nagar",
      city: "Kolhapur",
      region: "Maharashtra",
      postalCode: "416013",
      country: "IN",
      // ==========================================================
      //  ⭐ GOOGLE MAP — change the address string below and both
      //  the embedded map and the "Get Directions" button follow.
      // ==========================================================
      fullAddress:
        "Bade Farms, Behind Khadicha Ganapati, Ratnappa Kumbhar Nagar, Kolhapur, Maharashtra 416013",
      // Backdrop shown before the Google map is loaded. Uses the first photo
      // in assets/images/surroundings/.
      image: nextPhoto("surroundings", "resort", "gallery"),
    },

    /* ------------------------------------------------------------------ */
    /*  FOOTER                                                              */
    /*  Quick links mirror the `nav` block above automatically.             */
    /*  Social: set `href` to your real page, or delete the line to hide    */
    /*  that icon.                                                          */
    /* ------------------------------------------------------------------ */
    footer: {
      note: "A private five-bedroom villa and pool on two acres in Kolhapur.",
      // ==========================================================
      //  ⭐ SOCIAL — paste your real page addresses. An entry with a
      //  blank href is hidden, so an unused network shows no icon
      //  and never becomes a dead link.
      // ==========================================================
      social: [
        { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/badefarms/" },
        { icon: "facebook", label: "Facebook", href: "https://www.facebook.com/BadeFarms/" },
        { icon: "youtube", label: "YouTube", href: "" },
      ],
      copyrightHolder: "Bade Farms",
    },
  };

  /* ------------------------------------------------------------------ */
  /*  DERIVED VALUES — built from the settings above so the same fact is  */
  /*  never written down twice.                                           */
  /* ------------------------------------------------------------------ */
  var mapQuery = encodeURIComponent(RESORT_DATA.location.fullAddress);
  RESORT_DATA.location.mapEmbedSrc =
    "https://www.google.com/maps?q=" + mapQuery + "&output=embed";
  RESORT_DATA.location.directionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=" + mapQuery;

  // Footer quick links mirror the main navigation.
  RESORT_DATA.footer.quickLinks = RESORT_DATA.nav.slice();

  // Check-in / check-out are stated once and substituted everywhere.
  var times = {
    checkIn: RESORT_DATA.importantInfo.checkIn,
    checkOut: RESORT_DATA.importantInfo.checkOut,
  };
  RESORT_DATA.faq.items.forEach(function (item) {
    item.a = item.a
      .replace("{checkIn}", times.checkIn)
      .replace("{checkOut}", times.checkOut);
  });
  RESORT_DATA.packages.plans.forEach(function (plan) {
    plan.features = plan.features.concat([
      "Check-in " + times.checkIn,
      "Check-out " + times.checkOut,
    ]);
  });

  return RESORT_DATA;
};
