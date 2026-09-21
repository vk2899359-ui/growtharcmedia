# GrowthArc Media — growtharcmedia.in

Static multi-page site built with Vite. No framework, no CSS library — plain HTML,
one stylesheet and one motion controller.

```
index.html              Home
work.html               Portfolio index
services/*.html         6 service pages
work/*.html             8 case studies
src/style.css           The entire stylesheet
src/main.js             Interaction & motion controller
src/video-sources.js    Video source override map (see below)
public/images/          Client project stills (also used as video posters)
scripts/qa.mjs          Full-site QA sweep
```

## Commands

```bash
npm install
npm run dev       # dev server
npm run build     # production build into dist/
npm run preview   # serve the build on :4173
npm run qa        # full-site QA sweep against the preview server
```

`npm run qa` needs the preview server running in another shell. It walks all 16
pages at 360 / 375 / 390 / 768 / 1024 / 1280 / 1440px and checks for runtime and
console errors, blank renders, horizontal overflow, header controls pushed out of
the viewport, dead links and anchors, video-container scale stability under wheel
scrolling, the refresh / back / forward / direct-URL / new-tab lifecycle, and the
enquiry modal and mobile drawer. Set `CHROME_PATH` to pin a browser binary.

## Motion rules

`src/main.js` is deliberately constrained:

- **Native scrolling is never hijacked.** Scroll position is only read. There is
  no smooth-scroll wrapper and no wheel interception.
- **Media containers never resize on scroll.** The hero frame moves between
  `0.98` and `1.01` and nothing else scales at all. All visible travel happens
  *inside* a frame as crop movement, so layout cannot shift.
- **One batched frame loop.** Effects register with `onFrame()`; the loop reads
  scroll once per animation frame and writes transform/opacity only.
- **Reveals are typed, not uniform.** Headings unmask upward, copy rises, media
  frames unmask by clip-path, repeating items stagger.
- **Reveals have a safety sweep.** An IntersectionObserver only reports states the
  browser samples, so a fast flick or an anchor jump can skip an element. A
  throttled sweep reveals anything the viewport has reached or passed.
- **`prefers-reduced-motion` disables all of it** and leaves the page fully
  rendered.

## Video

Every `<video>` keeps its source in the markup and is lazily played by an
IntersectionObserver (`preload="none"`, no `autoplay` except the hero). Offscreen
videos pause. If a video errors, is blocked, or never loads, it is replaced by its
poster image — the page never depends on a video succeeding.

### Replacing the videos with GrowthArc-hosted files

The video files currently referenced are hosted on a third-party domain
(`doorsstudio.com`) and are not GrowthArc assets. To swap in your own without
editing a single HTML page:

1. Drop the file into `public/videos/`.
2. Add one line to `src/video-sources.js`:

```js
export const VIDEO_SOURCE_OVERRIDES = {
  'brand-big-idea2.mp4': '/videos/growtharc-hero-reel.mp4',
};
```

The key is any substring of the current `src` (the filename is enough). Anything
not listed is left exactly as authored. Poster frames already come from
`public/images/`, so a swap needs no other change.

## Routing

All routes are real `.html` files declared in `vite.config.js`. There is no
client-side router, so every URL survives refresh, back/forward, direct entry and
opening in a new tab. In-page sections (`/#about`, `/#services`, `/#method`,
`/#global`, `/#contact`) live on the home page and have `scroll-margin-top` set to
clear the fixed header.
