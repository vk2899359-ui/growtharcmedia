// Shared page chrome for the generated pages (blog and about).
//
// Each generator used to carry its own copy of the header, footer and modal.
// Two copies is how the nav on one page quietly stops matching the nav on
// another, so they live here once.

export const SITE = 'https://growtharcmedia.in';

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// JSON-LD sits inside a <script> block, so the only escape that matters is one
// that would let the payload close that element early.
export const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

export function head({ title, description, canonical, image, extraMeta = '', schema = [] }) {
  return `<!DOCTYPE html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(SITE + canonical)}" />
    <meta name="author" content="GrowthArc Media" />
    <meta name="geo.region" content="IN" />
    <meta name="geo.placename" content="India" />

    <meta property="og:site_name" content="GrowthArc Media" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(SITE + canonical)}" />
    <meta property="og:image" content="${esc(image)}" />
${extraMeta}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(image)}" />

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://images.unsplash.com" />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <link rel="stylesheet" href="/src/style.css" />

${schema.map((s) => '    ' + jsonLd(s)).join('\n')}
  </head>
  <body class="bg-canvas text-black antialiased selection-highlight">`;
}

export function header(service) {
  return `
    <header class="site-header" id="siteHeader">
      <div class="site-container header-inner">
        <a href="/" class="brand-logo" aria-label="GrowthArc Media Home">
          <span class="logo-badge">GA</span>
          <div class="logo-meta">
            <span class="logo-title">GrowthArc<span class="dot-accent">.</span></span>
            <span class="logo-url">growtharcmedia.in</span>
          </div>
        </a>

        <nav class="desktop-nav">
          <a href="/about" class="nav-link">About Us</a>
          <a href="/#services" class="nav-link">What We Do</a>
          <a href="/work.html" class="nav-link">Our Work</a>
          <a href="/blog" class="nav-link">Blog</a>
          <a href="/#method" class="nav-link">Method</a>
          <a href="/#contact" class="nav-link">Contact Us</a>
        </nav>

        <div class="header-actions">
          <button type="button" class="btn-cta open-modal-btn" data-service="${esc(service)}">
            <span>Talk to an Expert</span>
            <i class="fas fa-arrow-right icon-arrow"></i>
          </button>
          <a href="https://api.whatsapp.com/send?phone=917906081795" target="_blank" rel="noopener" class="whatsapp-icon-btn" title="Chat on WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </a>
          <button type="button" class="mobile-menu-trigger" id="mobileMenuToggle" aria-label="Open Navigation Menu">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </header>

    <div class="mobile-overlay" id="mobileDrawer">
      <div class="mobile-overlay-content">
        <div class="mobile-overlay-header">
          <div class="brand-logo">
            <span class="logo-badge">GA</span>
            <span class="logo-title">GrowthArc<span class="dot-accent">.</span></span>
          </div>
          <button type="button" class="mobile-close" id="mobileMenuClose" aria-label="Close Navigation Menu"><i class="fas fa-times"></i></button>
        </div>
        <ul class="mobile-nav-menu">
          <li><a href="/about" class="mobile-link">About Us</a></li>
          <li><a href="/#services" class="mobile-link">What We Do</a></li>
          <li><a href="/work.html" class="mobile-link">Our Work</a></li>
          <li><a href="/blog" class="mobile-link">Blog</a></li>
          <li><a href="/#method" class="mobile-link">Method</a></li>
          <li><a href="/#contact" class="mobile-link">Contact Us</a></li>
        </ul>
        <div class="mobile-overlay-footer">
          <button type="button" class="btn-cta w-full open-modal-btn" data-service="${esc(service)}">Talk to an Expert</button>
        </div>
      </div>
    </div>
`;
}

export function footer() {
  return `
    <footer class="site-footer">
      <div class="site-container">
        <div class="footer-top-row">
          <div class="footer-brand">
            <a href="/" class="brand-logo">
              <span class="logo-badge">GA</span>
              <span class="logo-title">GrowthArc<span class="dot-accent">.</span></span>
            </a>
            <p class="footer-desc">
              GrowthArc Media (growtharcmedia.in) is a premier digital marketing &amp; performance agency.
            </p>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">Navigation</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/#services">What We Do</a></li>
              <li><a href="/work.html">Our Work</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/#contact">Contact Us</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">Services</h4>
            <ul>
              <li><a href="/services/brand-strategy.html">Brand Strategy</a></li>
              <li><a href="/services/brand-identity.html">Brand Identity</a></li>
              <li><a href="/services/creative-content.html">Creative &amp; Content</a></li>
              <li><a href="/services/digital-marketing.html">Digital Marketing</a></li>
              <li><a href="/services/performance-marketing.html">Performance Marketing</a></li>
              <li><a href="/services/web-development.html">Web Development</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">Contact</h4>
            <p class="footer-contact-line">vinod@growtharcmedia.in</p>
            <p class="footer-contact-line">+91 79060 81795</p>
            <div class="footer-social-row mt-20">
              <a href="https://www.instagram.com/growtharcmedia.in/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="https://www.linkedin.com/in/vinodkumar-calance" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
        <div class="footer-bottom-row">
          <div class="footer-closing-statement uppercase">
            BUILD<span class="dot-accent dot-pink">.</span>
            MARKET<span class="dot-accent dot-yellow">.</span>
            GROW<span class="dot-accent dot-green">.</span>
          </div>
          <div class="footer-copyright">&copy; 2023&ndash;2026 GrowthArc Media (growtharcmedia.in). All rights reserved.</div>
        </div>
      </div>
    </footer>
`;
}

export function modal(service) {
  return `
    <div class="modal-backdrop" id="enquiryModal" aria-hidden="true">
      <div class="modal-dialog">
        <button type="button" class="modal-close" id="modalCloseBtn" aria-label="Close"><i class="fas fa-times"></i></button>
        <div class="modal-header">
          <span class="section-label text-yellow">(GROWTH INQUIRY)</span>
          <h3 class="modal-title">Let's Discuss Your Project</h3>
        </div>
        <form id="enquiryForm" class="modal-form">
          <div class="form-field">
            <label class="field-label">Selected Service</label>
            <input type="text" id="selectedServiceInput" name="service" readonly class="field-input readonly-input" value="${esc(service)}" />
          </div>
          <div class="form-row">
            <div class="form-field"><label class="field-label">Full Name *</label><input type="text" name="name" required placeholder="John Doe" class="field-input" /></div>
            <div class="form-field"><label class="field-label">Work Email *</label><input type="email" name="email" required placeholder="john@company.com" class="field-input" /></div>
          </div>
          <div class="form-field"><label class="field-label">Project Details &amp; Goals *</label><textarea name="message" rows="3" required placeholder="Tell us about your brand targets..." class="field-input"></textarea></div>
          <button type="submit" class="btn-cta w-full text-center"><span>Submit Inquiry</span><i class="fas fa-paper-plane ml-2"></i></button>
        </form>
        <div id="formSuccessMessage" class="form-success-msg hidden"><i class="fas fa-check-circle success-icon"></i><p>Thank you! Your inquiry has been submitted. Our team at GrowthArc Media will contact you shortly.</p></div>
      </div>
    </div>

    <aside class="floating-controls">
      <a href="https://api.whatsapp.com/send?phone=917906081795" target="_blank" rel="noopener" class="fab-btn fab-whatsapp" title="WhatsApp Chat"><i class="fab fa-whatsapp"></i></a>
      <button type="button" class="fab-btn fab-top" id="scrollTopBtn" title="Back to top"><i class="fas fa-arrow-up"></i></button>
    </aside>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;
}
