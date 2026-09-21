/* GrowthArc Media — video source overrides
 *
 * Every <video> on the site keeps its original `src` in the markup. This map
 * lets you re-point any of them to a GrowthArc-hosted file without touching a
 * single HTML page: drop the file into `public/videos/` and add one line here.
 *
 * Key   = any substring of the current src (the filename is enough)
 * Value = the replacement URL, served from this site
 *
 * Example — once you upload your own brand reel:
 *   'brand-big-idea2.mp4': '/videos/growtharc-brand-reel.mp4',
 *
 * Anything not listed here is left exactly as authored.
 */
export const VIDEO_SOURCE_OVERRIDES = {
  // GrowthArc's own reels, recovered from the previous site and now served
  // from this repo. These replace the third-party doorsstudio.com hotlinks
  // that the markup shipped with — those were another studio's files and
  // could be pulled or hotlink-blocked at any time.
  'brand-big-idea2.mp4': '/videos/hero-reel.mp4',
  'marketing-is-our-jam.mp4': '/videos/about-reel.mp4',
  'explore-method.mp4': '/videos/work-reel.mp4',

  // Six service panels, two reels — alternated so adjacent panels differ.
  'brand-strategy.mp4': '/videos/services-hero.mp4',
  'brand-identity.mp4': '/videos/services-reel.mp4',
  'brand-communication.mp4': '/videos/services-hero.mp4',
  'digital-marketing.mp4': '/videos/services-reel.mp4',
  'performance-marketing.mp4': '/videos/services-hero.mp4',
  'web-development.mp4': '/videos/services-reel.mp4',
};

/** Returns the URL a given video element should actually load. */
export function resolveVideoSource(originalSrc) {
  if (!originalSrc) return originalSrc;
  for (const [needle, replacement] of Object.entries(VIDEO_SOURCE_OVERRIDES)) {
    if (originalSrc.includes(needle)) return replacement;
  }
  return originalSrc;
}
