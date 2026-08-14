AMBIENT HERO VIDEO (optional)
=============================

Drop a short looping clip here named:

    hero.mp4        (required)
    hero.webm       (optional - smaller where supported)

The hero plays it automatically. Until you add one, the hero cross-fades the
photos in assets/images/hero/ with a slow zoom instead. Nothing breaks either
way - if the file is missing, unplayable, or autoplay is blocked, the photos
simply stay.

WHAT MAKES A GOOD CLIP
  * 5-15 seconds, seamlessly looping
  * no audio track at all (browsers block autoplay with sound)
  * 1920x1080, H.264 for the .mp4
  * under 4 MB - this loads on every desktop visit

Phones and visitors who ask for reduced motion always get the photos, never
the video, so nobody pays for it on mobile data.

To change the filename or turn the video off entirely, edit `hero.video` in
js/data.js. Set it to "" to always use the photos.

MAKING ONE FROM A LONGER RECORDING (ffmpeg)
    ffmpeg -i source.mov -t 12 -an -vf "scale=1920:-2" \
           -c:v libx264 -crf 30 -preset slow -movflags +faststart hero.mp4
    ffmpeg -i hero.mp4 -an -c:v libvpx-vp9 -crf 40 -b:v 0 hero.webm
