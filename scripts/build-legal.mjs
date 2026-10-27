// Generates the legal and contact pages: /privacy, /terms and /contact.
// Emitted as <slug>/index.html, which a static host serves at /<slug>.

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, head, header, footer, modal } from './lib/page-chrome.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const STYLE = `<style>
      .legal-page { padding: 150px 0 90px; }
      .legal-page .legal-inner { max-width: 760px; margin: 0 auto; padding: 0 20px; }
      .legal-page h1 { font-size: clamp(34px, 6vw, 56px); line-height: 1.05; margin: 0 0 8px; font-weight: 800; }
      .legal-page .legal-updated { opacity: .65; font-size: 14px; margin: 0 0 36px; }
      .legal-page h2 { font-size: 22px; margin: 34px 0 10px; font-weight: 700; }
      .legal-page p, .legal-page li { font-size: 16.5px; line-height: 1.7; }
      .legal-page ul { padding-left: 22px; margin: 8px 0 14px; }
      .legal-page a { text-decoration: underline; }
      .legal-page .legal-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
      .legal-page .legal-card { border: 1px solid rgba(0,0,0,.12); border-radius: 14px; padding: 20px 22px; margin: 14px 0; }
    </style>`;

const PAGES = [
  {
    slug: 'privacy',
    label: 'Privacy Policy',
    title: 'Privacy Policy | GrowthArc Media',
    description: 'How GrowthArc Media collects, uses and protects the personal information you share through growtharcmedia.in.',
    body: `
      <h1>Privacy Policy</h1>
      <p class="legal-updated">Last updated: 27 October 2026</p>
      <p>This policy explains how GrowthArc Media (&ldquo;we&rdquo;, &ldquo;us&rdquo;), the agency behind growtharcmedia.in, handles personal information that you share with us through this website, WhatsApp, phone or email. We handle it in line with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023 of India.</p>

      <h2>1. Who is responsible</h2>
      <p>GrowthArc Media, founded and run by Vinod Kumar. You can reach us at <a href="mailto:vinod@growtharcmedia.in">vinod@growtharcmedia.in</a> or +91 79060 81795.</p>

      <h2>2. What we collect</h2>
      <ul>
        <li><strong>Enquiry form:</strong> your name, email address, the message you write, the service or page you enquired from, and anything else you choose to include.</li>
        <li><strong>WhatsApp, phone and email:</strong> your number or email address and the content of the conversation.</li>
        <li><strong>Technical data:</strong> basic information such as IP address, browser type and pages requested, which our hosting provider records in server logs for security and reliability.</li>
      </ul>
      <p>We do not ask for payment details, passwords or government ID numbers through this website.</p>

      <h2>3. Why we use it</h2>
      <ul>
        <li>To reply to your enquiry and discuss your project.</li>
        <li>To prepare proposals and, if you become a client, to deliver and invoice our services.</li>
        <li>To keep the website secure and working properly.</li>
      </ul>
      <p>We rely on your consent, which you give when you submit the form or message us. You can withdraw it at any time by writing to us.</p>

      <h2>4. Who we share it with</h2>
      <p>We do not sell your personal information. We share it only with service providers that help us run the website and handle enquiries, such as our hosting provider (Vercel), email and messaging tools (for example Gmail and WhatsApp) and similar business tools. They may process the data on our behalf, including on servers outside India. We may also disclose information where the law requires it.</p>

      <h2>5. Third-party content</h2>
      <p>This website loads fonts and icons from third-party services (such as Google Fonts and Font Awesome), which means your browser connects to them and they can see your IP address. Links to other sites, including Instagram, LinkedIn and WhatsApp, are governed by those sites&rsquo; own policies.</p>

      <h2>6. How long we keep it</h2>
      <p>We keep enquiry details only as long as needed to respond to you and, for clients, to meet accounting and legal record-keeping requirements. After that we delete or anonymise them.</p>

      <h2>7. Your rights</h2>
      <p>You can ask us to tell you what personal data we hold about you, correct it, delete it, or stop contacting you. Email <a href="mailto:vinod@growtharcmedia.in">vinod@growtharcmedia.in</a> and we will respond within a reasonable time. You also have the right to complain to the Data Protection Board of India once it is operational.</p>

      <h2>8. Security</h2>
      <p>The website is served over HTTPS and we limit access to enquiry data to the people who need it. No online service is completely secure, so please do not send sensitive information in an enquiry.</p>

      <h2>9. Children</h2>
      <p>This website is meant for businesses and is not directed at children under 18.</p>

      <h2>10. Changes</h2>
      <p>We may update this policy. The date at the top shows when it was last changed.</p>

      <h2>11. Grievance contact</h2>
      <p>Vinod Kumar, GrowthArc Media &mdash; <a href="mailto:vinod@growtharcmedia.in">vinod@growtharcmedia.in</a>, +91 79060 81795.</p>
      `,
  },
  {
    slug: 'terms',
    label: 'Terms of Service',
    title: 'Terms of Service | GrowthArc Media',
    description: "The terms that apply when you use growtharcmedia.in and enquire about GrowthArc Media's services.",
    body: `
      <h1>Terms of Service</h1>
      <p class="legal-updated">Last updated: 27 October 2026</p>
      <p>These terms apply to your use of growtharcmedia.in. By using the website you agree to them. If you do not agree, please do not use the site.</p>

      <h2>1. About the website</h2>
      <p>This website is operated by GrowthArc Media and describes our brand strategy, creative, digital marketing, performance marketing and web development services. The information is for general guidance and is not a binding offer.</p>

      <h2>2. Our services</h2>
      <p>Any engagement with us is governed by a separate written proposal or agreement that sets out the scope, fees, timelines and responsibilities. Sending an enquiry does not create a client relationship or oblige either side to proceed.</p>

      <h2>3. No guarantee of results</h2>
      <p>Case studies, figures and examples on this website describe work for specific clients at specific times. Advertising and marketing results depend on many factors outside our control, including budget, product, pricing, market and competition. We do not guarantee that you will get the same or any particular result.</p>

      <h2>4. Intellectual property</h2>
      <p>The website&rsquo;s design, text and code belong to GrowthArc Media. Client names, logos and project images belong to their respective owners and appear with their knowledge as examples of our work. You may not copy or reuse our content without written permission.</p>

      <h2>5. Acceptable use</h2>
      <p>Do not misuse the website: no attempts to break or overload it, to access it without authorisation, or to send spam or unlawful content through the enquiry form.</p>

      <h2>6. Third-party links</h2>
      <p>The website links to third-party sites such as Instagram, LinkedIn and WhatsApp. We are not responsible for their content or practices.</p>

      <h2>7. Disclaimer and liability</h2>
      <p>The website is provided &ldquo;as is&rdquo;. To the extent permitted by law, GrowthArc Media is not liable for any indirect or consequential loss arising from your use of the website or reliance on its content.</p>

      <h2>8. Privacy</h2>
      <p>How we handle personal information is explained in our <a href="/privacy">Privacy Policy</a>.</p>

      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of India. Courts at Gurugram, Haryana have jurisdiction over any dispute, subject to any different arrangement in a written client agreement.</p>

      <h2>10. Changes and contact</h2>
      <p>We may update these terms and the date above will change when we do. Questions: <a href="mailto:vinod@growtharcmedia.in">vinod@growtharcmedia.in</a> or +91 79060 81795.</p>
      `,
  },
  {
    slug: 'contact',
    label: 'Contact',
    title: 'Contact GrowthArc Media | Email, WhatsApp & Enquiry',
    description: 'Contact GrowthArc Media: email, phone and WhatsApp details for performance marketing, branding and web development enquiries.',
    body: `
      <h1>Contact GrowthArc Media</h1>
      <p class="legal-updated">We reply to every enquiry, usually within one working day.</p>
      <p>Tell us about your brand and what you want to achieve, and we will come back with an honest view of whether and how we can help.</p>

      <div class="legal-card">
        <p><strong>Email</strong><br /><a href="mailto:vinod@growtharcmedia.in">vinod@growtharcmedia.in</a></p>
        <p><strong>Phone &amp; WhatsApp</strong><br /><a href="tel:+917906081795">+91 79060 81795</a> &middot; <a href="https://api.whatsapp.com/send?phone=917906081795&amp;text=Hello%20GrowthArc%20Media!" target="_blank" rel="noopener">Chat on WhatsApp</a></p>
        <p><strong>Where we work</strong><br />Our team is based in Gurugram (Delhi NCR) and Goa, and we work remotely with brands across India, the UAE and the United States.</p>
        <p><strong>Founder</strong><br />Vinod Kumar &mdash; <a href="/about">about the agency</a></p>
      </div>

      <div class="legal-cta">
        <button type="button" class="btn-cta open-modal-btn" data-service="Contact Page Inquiry"><span>Send an enquiry</span><i class="fas fa-arrow-right icon-arrow"></i></button>
      </div>
      <p style="margin-top:26px;font-size:14px;opacity:.7">See also our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Service</a>.</p>
      `,
  },
];

for (const p of PAGES) {
  const service = `${p.label} Inquiry`;
  const page = `${head({
    title: p.title,
    description: p.description,
    canonical: `/${p.slug}`,
    image: `${SITE}/og-image.png`,
    extraMeta: STYLE,
  })}
${header(service)}
    <main class="legal-page">
      <div class="legal-inner">${p.body}      </div>
    </main>
${footer()}
${modal(service)}`;

  const dir = resolve(root, p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), page);
}

console.log(`build-legal: wrote ${PAGES.map((p) => '/' + p.slug).join(', ')}`);
