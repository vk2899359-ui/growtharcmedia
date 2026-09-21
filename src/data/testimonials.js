/* GrowthArc Media — client testimonials.
 *
 * DELIBERATELY EMPTY.
 *
 * The previous site carried no testimonials anywhere — not on the clients
 * page, not on the homepage, not in any data file — so there were none to
 * bring over. Nothing here is written on a client's behalf: a quote
 * attributed to a real company that the company never said is a fabricated
 * endorsement, and it is their reputation and ours on the line, not a
 * copywriting choice.
 *
 * TO TURN THE SECTION ON
 * Add entries below with words the client actually gave you (WhatsApp, email
 * and Google reviews all count — keep the source in `via` so it can be
 * checked later). The homepage section renders itself the moment this array
 * is non-empty, and stays hidden while it is empty.
 *
 * Shape:
 * {
 *   quote:   'What they actually said.',
 *   author:  'Full Name',
 *   role:    'Founder',               // their title
 *   company: 'Auric Jewels',          // must match a name in about.js
 *   via:     'WhatsApp, Mar 2026',    // where the quote came from
 *   rating:  5,                       // optional, 1-5, only if they gave one
 *   caseStudy: '/work/auric-jewels.html',  // optional
 * }
 *
 * Only add `rating` where the client genuinely rated the work. Review and
 * AggregateRating schema is generated from these entries, and Google treats
 * invented ratings as a structured-data violation.
 */

export const testimonials = [];

/** Average of the ratings actually given — null when there are none. */
export function aggregateRating() {
  const rated = testimonials.filter((t) => typeof t.rating === 'number');
  if (!rated.length) return null;
  return {
    value: (rated.reduce((sum, t) => sum + t.rating, 0) / rated.length).toFixed(1),
    count: rated.length,
  };
}
