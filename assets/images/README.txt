PUT YOUR PHOTOS HERE
====================

Drop photos into the folder that matches what they show. That is the whole job.

  * Filenames DO NOT MATTER. "IMG_4821.jpg" works exactly as well as
    "pool-sunset.jpg". Spaces and non-English names are fine too.
  * HOW MANY DO NOT MATTER. Five photos in a folder shows five. Add three
    more and it shows eight. Delete some and it shows fewer.
  * THE FORMAT DOES NOT MATTER. jpg, jpeg, jfif, png, webp, gif, avif, bmp,
    tif, tiff and heic all work. Photos straight off an iPhone (.heic) and
    scans (.tif) are converted automatically, because no browser can show
    those as they are.
  * You do not need to resize or convert anything. Small copies for phones
    are made for you.

AFTER ADDING OR REMOVING PHOTOS
-------------------------------
Run this once so the website notices them:

    Windows:  double-click  scripts\update-images.bat
    Anywhere: python scripts/generate-images.py

Then refresh the page in your browser.

FOLDERS
-------
  branding/       resort logo (also used as the browser-tab icon)
  hero/           big background photo at the top
                  (1st photo = desktop, 2nd = mobile)
  resort/         the villa exterior & grounds — used by the About section
  rooms/          room photos — used by the Stay cards
  pool/           swimming pool
  food/           breakfast / buffet / dinner
  activities/     family & group activities
  surroundings/   nature around the resort
  gallery/        anything else you want in the gallery

Everything except branding/, hero/ and surroundings/ also appears in the
photo gallery, each folder as its own filter tab.

WANT A NEW GALLERY TAB?
-----------------------
Make a new folder here, put photos in it, and re-run the script. A tab named
after the folder appears by itself. For example, a folder called "spa"
becomes a "Spa" tab. To control the exact wording, add the folder to the
FOLDERS list at the top of scripts/generate-images.py.

DESCRIBING A PHOTO (optional)
-----------------------------
Screen readers and Google read each photo's description. One is written for
you from the folder name. To write your own, create a file called _alt.json
inside the folder:

    {
      "IMG_4821.jpg": "Sunset over the river from the lawn",
      "pool-02.jpg":  "Children playing in the swimming pool"
    }

WHAT IS THE _optimized FOLDER?
------------------------------
Small, fast copies of your photos, made automatically. Do not edit it and do
not put your own photos in it — it is rebuilt every time you run the script.
Your originals are never modified or moved.

See README.md at the project root for the full guide.
