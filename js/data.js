/**
 * ============================================================================
 *  THE RIVERFRONT RESORT — CENTRAL SITE DATA
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

(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /*  IMAGE PLUMBING — reads js/images.js. No need to edit this block.   */
  /* ------------------------------------------------------------------ */
  var IMG = window.IMAGE_MANIFEST || { version: 2, order: [], folders: {} };

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
    name: "The Riverfront Resort",
    shortName: "The Riverfront",

    /* ------------------------------------------------------------------ */
    /*  SEO — browser tab, Google results, WhatsApp/Facebook link previews. */
    /* ------------------------------------------------------------------ */
    seo: {
      title: "The Riverfront Resort | Relax by nature",
      description:
        "The Riverfront Resort — a peaceful riverside resort in Pimpri-Chinchwad for families, couples, groups and pet owners. Rooms, amenities and a welcoming atmosphere.",
      // ==========================================================
      //  ⭐ PUT YOUR REAL WEBSITE ADDRESS HERE once the site is live.
      //  Link previews on WhatsApp/Facebook need the FULL address
      //  (they cannot resolve relative paths). Include https:// and
      //  no trailing slash.
      // ==========================================================
      siteUrl: "https://www.theriverfrontresort.in",
      // Star rating shown to search engines. Set to null to omit.
      ratingValue: 4.8,
      ratingCount: 6,
      priceRange: "₹₹",
    },

    logo: { image: "assets/images/branding/resort-logo.png" },

    phone: {
      display: "072777 75060",
      tel: "+917277775060",
    },

    whatsapp: {
      // ==========================================================
      //  ⭐ SINGLE WHATSAPP NUMBER USED EVERYWHERE:
      //  - "Book Now" / "Book Your Stay" buttons
      //  - "Enquire Now" on every Stay card
      //  - Location + Footer WhatsApp buttons
      //  - The enquiry form (opens WhatsApp with the form details)
      //  Format: country code + number, digits only (no +, no spaces).
      //  e.g. 917277775060 for +91 72777 75060
      // ==========================================================
      number: "917277775060",
      message:
        "Hello, I would like to enquire about availability at The Riverfront Resort.",
    },

    /* ------------------------------------------------------------------ */
    /*  NAVIGATION — add or remove a line and the header, mobile menu and   */
    /*  footer links all follow.                                            */
    /* ------------------------------------------------------------------ */
    nav: [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "Stay", href: "#stay" },
      { label: "Offers", href: "#offers" },
      { label: "Packages", href: "#packages" },
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
      nameSub: "Resort",
      navBook: "Book Now",
      hero: { book: "Book Your Stay", call: "Call Now" },
      about: {
        eyebrow: "About the Resort",
        title: "A peaceful escape on the riverfront",
        explore: "Explore Stays",
        wa: "Enquire on WhatsApp",
      },
      stay: {
        eyebrow: "Stay",
        title: "Choose your stay",
        sub: "Comfortable rooms and a welcoming riverside stay — perfect for families, couples, groups and pets.",
        enquire: "Enquire Now",
      },
      amenities: {
        eyebrow: "Amenities",
        title: "Everything you need for a comfortable stay",
        sub: "From the swimming pool to pet-friendly facilities — enjoy a relaxed, easy getaway.",
      },
      gallery: {
        eyebrow: "Gallery",
        title: "Moments at The Riverfront",
        sub: "A glimpse of the resort, rooms, pool and food.",
      },
      offers: {
        eyebrow: "Our Offers",
        title: "Special offers & discounts",
        sub: "Enjoy exclusive deals on your stay — perfect for honeymoons, family holidays and group getaways.",
      },
      packages: {
        eyebrow: "Stay Packages",
        title: "Pricing plan for the best value",
        sub: "Choose a package that fits your stay — every package includes meals and all amenities.",
        book: "Book Now",
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
      },
      contact: {
        eyebrow: "Contact",
        title: "Send us an enquiry",
        intro: "Tell us about your stay and we will get back to you on WhatsApp with availability.",
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
        preferences: ["Room", "Group Outing"],
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
      heading: "The Riverfront Resort",
      subtitle:
        "Relax by nature. Stay in comfort. Create unforgettable memories.",
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
      text: "Escape the noise of the city and enjoy a peaceful stay surrounded by nature at The Riverfront Resort. Whether you are planning a relaxing family holiday, a group outing, or a weekend getaway, the resort offers comfortable facilities, delicious food, and a welcoming atmosphere.",
      image: nextPhoto("resort", "gallery", "surroundings"),
      imageB: nextPhoto("resort", "gallery", "surroundings"),
    },

    /* ------------------------------------------------------------------ */
    /*  STAY CARDS — add or remove a card freely. Each card takes the next  */
    /*  unused photo from the folders it lists.                             */
    /* ------------------------------------------------------------------ */
    stays: [
      {
        title: "Resort Rooms",
        description:
          "Comfortable, well-furnished rooms designed for a relaxed riverside stay.",
        image: nextPhoto("rooms", "gallery"),
        facilities: [
          "Air conditioning",
          "Private bathroom",
          "Shower",
          "Kitchen facilities",
        ],
      },
      {
        title: "Family Stay",
        description:
          "A safe, friendly and spacious stay made for families travelling with children.",
        image: nextPhoto("rooms", "gallery"),
        facilities: [
          "Child friendly",
          "Spacious rooms",
          "Comfortable beds",
          "Kitchen facilities",
        ],
      },
      {
        title: "Group Outings",
        description:
          "The perfect riverside venue for group trips, outings and memorable getaways together.",
        image: nextPhoto("activities", "gallery"),
        facilities: [
          "Group friendly",
          "Ample space",
          "Food and drink",
          "Activities",
        ],
      },
    ],
    stayNote:
      "Resort room facilities include air conditioning, private bathroom, shower and kitchen facilities. For rates and availability, use the Enquire Now button on any card above.",

    /* ------------------------------------------------------------------ */
    /*  OFFERS & DISCOUNTS                                                  */
    /* ------------------------------------------------------------------ */
    offers: {
      items: [
        {
          badge: "25% off",
          title: "Honeymoon",
          text: "Enjoy an exclusive discount on your honeymoon stay at The Riverfront Resort.",
        },
        {
          badge: "10% off",
          title: "Family Stay",
          text: "A special discount for family holidays — more memories, less spend.",
        },
        {
          badge: "35% off",
          title: "Group Outing",
          text: "Exclusive group discounts for outings, corporate trips and reunions.",
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
          name: "Couple Package",
          price: "INR 7999/-",
          priceNote: "per couple per night",
          featured: false,
          features: [
            "Extra person Rs. 2000/-",
            "Child between 5-11 years Rs. 1500/-",
            "Child between 3-5 years Rs. 800/-",
            "Below 3 years FREE",
            "All amenities and meals included",
            "Stay / TV / hot water",
          ],
        },
        {
          name: "Group Package",
          price: "INR 2999/-",
          priceNote: "per person per night",
          featured: true,
          features: [
            "Minimum 4 persons required",
            "Child between 5-11 years Rs. 1500/-",
            "Child between 3-5 years Rs. 800/-",
            "Below 3 years FREE",
            "All amenities and meals included",
            "Stay / TV / hot water",
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /*  TESTIMONIALS — guest reviews carousel                               */
    /* ------------------------------------------------------------------ */
    testimonials: {
      items: [
        {
          name: "Rohan Deshmukh",
          tag: "Family Stay",
          rating: 5,
          text: "Took my parents and kids here for a weekend and everyone loved it. The rooms were clean, the food was home-style and the river view from the lawn is beautiful. Staff treated us like family.",
        },
        {
          name: "Priya Kulkarni",
          tag: "Honeymoon",
          rating: 5,
          text: "We spent our honeymoon here and it was perfect — quiet, peaceful and so green. Mornings by the river with chai were the best part. The private feel made it special for us.",
        },
        {
          name: "Amit Sharma",
          tag: "Group Outing",
          rating: 5,
          text: "Organised our office outing here with 15 people. Great open space, good food and the pool kept everyone busy. Rates are very reasonable for what you get. Highly recommended.",
        },
        {
          name: "Sneha Patil",
          tag: "Weekend Getaway",
          rating: 4,
          text: "Lovely little getaway from the city. The property is well maintained and very green. Would suggest reaching early to enjoy the whole day by the riverside. Will visit again!",
        },
        {
          name: "Vikram Joshi",
          tag: "Pet Friendly",
          rating: 5,
          text: "Finally a resort where our dog was genuinely welcome! Lots of open space to walk around, clean rooms and the staff even arranged a bowl for him. Thank you for the warm stay.",
        },
        {
          name: "Anjali Nair",
          tag: "Family Stay",
          rating: 5,
          text: "Booked the couple package for our parents' anniversary. Everything was arranged neatly — cake, good food and a beautiful riverside setting. They still talk about it!",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /*  FAQ — collapsible question & answer list.                           */
    /*  {checkIn} and {checkOut} are filled in from `importantInfo`.        */
    /* ------------------------------------------------------------------ */
    faq: {
      items: [
        {
          q: "What are the check-in and check-out timings?",
          a: "Check-in is at {checkIn} and check-out is at {checkOut}.",
        },
        {
          q: "Do your stay packages include meals?",
          a: "Yes, every stay package includes all meals and access to all amenities.",
        },
        {
          q: "Is the resort pet friendly?",
          a: "Yes, The Riverfront Resort is pet friendly — pets are welcome.",
        },
        {
          q: "How do I book a stay or enquire about availability?",
          a: "Tap any Book Now / Enquire Now button or use the enquiry form — it opens WhatsApp with your details and we reply with availability.",
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /*  AMENITIES — each item needs an icon name from ICONS in js/main.js.  */
    /*  An unknown icon name falls back to a plain circle, never an error.  */
    /* ------------------------------------------------------------------ */
    amenities: {
      popular: {
        title: "Popular Amenities",
        items: [
          { icon: "pool", label: "Swimming pool" },
          { icon: "parking", label: "Free parking" },
          { icon: "ac", label: "Air conditioning" },
          { icon: "coffee", label: "Breakfast" },
          { icon: "wifi", label: "Wi-Fi" },
          { icon: "food", label: "Food and drink" },
          { icon: "service", label: "Table service" },
          { icon: "buffet", label: "Buffet dinner" },
          { icon: "roomsvc", label: "Room service" },
          { icon: "breakfast", label: "Breakfast buffet" },
        ],
      },
      services: {
        title: "Services",
        items: [
          { icon: "storage", label: "Baggage storage" },
          { icon: "cleaning", label: "Daily housekeeping" },
          { icon: "shuttle", label: "Local shuttle service" },
        ],
      },
      family: {
        title: "Family & Accessibility",
        items: [
          { icon: "child", label: "Child-friendly property" },
          { icon: "accessible", label: "Accessible premises" },
          { icon: "parking", label: "Accessible parking" },
          { icon: "pet", label: "Pet-friendly facilities" },
          { icon: "petfree", label: "Pets stay free" },
          { icon: "dog", label: "Dogs allowed" },
          { icon: "cat", label: "Cats allowed" },
        ],
      },
      languages: {
        title: "Languages Spoken",
        items: [
          { icon: "en", label: "English" },
          { icon: "hi", label: "Hindi" },
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
      checkIn: "1:00 PM",
      checkOut: "10:00 AM",
      items: [
        "Smoke-free property",
        "Credit cards are not accepted",
        "Debit cards accepted",
        "NFC mobile payments accepted",
        "Cash accepted",
        "No hot tub",
        "No fitness centre",
      ],
    },

    /* ------------------------------------------------------------------ */
    /*  LOCATION                                                            */
    /* ------------------------------------------------------------------ */
    location: {
      addressLines: [
        "The Riverfront Resort",
        "Solu, Alandi-Markal Road, behind Dosti Hotel,",
        "Pimpri-Chinchwad, Maharashtra 412105",
      ],
      // Structured version of the same address, used for Google rich results.
      street: "Solu, Alandi-Markal Road, behind Dosti Hotel",
      city: "Pimpri-Chinchwad",
      region: "Maharashtra",
      postalCode: "412105",
      country: "IN",
      // ==========================================================
      //  ⭐ GOOGLE MAP — change the address string below and both
      //  the embedded map and the "Get Directions" button follow.
      // ==========================================================
      fullAddress:
        "The Riverfront Resort, Solu, Alandi-Markal Road, behind Dosti Hotel, Pimpri-Chinchwad, Maharashtra 412105",
    },

    /* ------------------------------------------------------------------ */
    /*  FOOTER                                                              */
    /*  Quick links mirror the `nav` block above automatically.             */
    /*  Social: set `href` to your real page, or delete the line to hide    */
    /*  that icon.                                                          */
    /* ------------------------------------------------------------------ */
    footer: {
      note: "Escape the noise of the city and enjoy a peaceful riverside stay.",
      social: [
        { icon: "facebook", label: "Facebook", href: "" },
        { icon: "instagram", label: "Instagram", href: "" },
        { icon: "youtube", label: "YouTube", href: "" },
      ],
      copyrightHolder: "The Riverfront Resort",
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

  window.RESORT_DATA = RESORT_DATA;
})();
