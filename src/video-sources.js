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
  // Empty on purpose. The homepage and the service pages keep the exact video
  // sources they were authored with — nothing on those pages is remapped.
  //
  // GrowthArc's own reels live in /public/videos/ and are used directly by the
  // blog page markup, not through this map.
};

/** Returns the URL a given video element should actually load. */
export function resolveVideoSource(originalSrc) {
  if (!originalSrc) return originalSrc;
  for (const [needle, replacement] of Object.entries(VIDEO_SOURCE_OVERRIDES)) {
    if (originalSrc.includes(needle)) return replacement;
  }
  return originalSrc;
}
