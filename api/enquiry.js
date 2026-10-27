// Vercel serverless function: receives the website enquiry form and forwards it.
// Delivery is configured with environment variables (set in Vercel project settings):
//   WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ENQUIRY_WHATSAPP_TO - WhatsApp Cloud API (see sendWhatsApp)
//   RESEND_API_KEY      - optional: also send an email through Resend (https://resend.com)
//   ENQUIRY_TO          - recipient, defaults to vinod@growtharcmedia.in
//   ENQUIRY_FROM        - verified sender, e.g. "GrowthArc Website <leads@growtharcmedia.in>"
//   ENQUIRY_WEBHOOK_URL - optional: also POST the lead as JSON (Google Sheet / Make / Zapier)
// If nothing is configured, or every channel fails, the function returns an error so the
// website never shows "submitted" for a lead that was not actually delivered.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);

async function sendEmail(lead) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const to = process.env.ENQUIRY_TO || "vinod@growtharcmedia.in";
  const from = process.env.ENQUIRY_FROM || "GrowthArc Website <onboarding@resend.dev>";
  const rows = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Budget", lead.budget],
    ["Service", lead.service],
    ["Page", lead.page],
    ["Message", lead.message],
  ].filter(([, v]) => v);
  const html = `<h2>New website enquiry</h2><table cellpadding="6">${rows
    .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: lead.email,
      subject: `New enquiry from ${lead.name}${lead.service ? ` (${lead.service})` : ""}`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
  return true;
}

// WhatsApp Cloud API: sends the lead to the owner's WhatsApp number.
// Needs WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID and ENQUIRY_WHATSAPP_TO (digits with country code, e.g. 917906081795).
// Set WHATSAPP_TEMPLATE_NAME (+ optional WHATSAPP_TEMPLATE_LANG, default en) to use an approved template whose body has
// 4 variables: {{1}} name, {{2}} email/phone, {{3}} service/page, {{4}} message. Without a template a plain text message is sent,
// which WhatsApp only delivers if the owner messaged that business number in the last 24 hours.
async function sendWhatsApp(lead) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = (process.env.ENQUIRY_WHATSAPP_TO || "").replace(/\D/g, "");
  if (!token || !phoneId || !to) return null;
  const one = (v) => String(v || "-").replace(/\s+/g, " ").slice(0, 900);
  const contact = [lead.email, lead.phone].filter(Boolean).join(" / ");
  const where = [lead.service, lead.page].filter(Boolean).join(" @ ");
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const payload = template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
          components: [
            { type: "body", parameters: [lead.name, contact, where, lead.message].map((t) => ({ type: "text", text: one(t) })) },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: `New website enquiry\nName: ${lead.name}\nEmail: ${lead.email}${lead.phone ? `\nPhone: ${lead.phone}` : ""}${
            lead.budget ? `\nBudget: ${lead.budget}` : ""
          }\nService: ${lead.service || "-"}\nPage: ${lead.page || "-"}\n\n${lead.message}`,
        },
      };
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`whatsapp ${res.status}`);
  return true;
}

async function sendWebhook(lead) {
  const url = process.env.ENQUIRY_WEBHOOK_URL;
  if (!url) return null;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString(), source: "growtharcmedia.in" }),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  // Honeypot: real visitors never fill this hidden field.
  if (body.website) return res.status(200).json({ ok: true });

  const lead = {
    name: clean(body.name, 120),
    email: clean(body.email, 200),
    phone: clean(body.phone, 40),
    budget: clean(body.budget, 80),
    service: clean(body.service, 120),
    page: clean(body.page, 200),
    message: clean(body.message, 4000),
  };

  if (lead.name.length < 2 || !EMAIL_RE.test(lead.email) || lead.message.length < 5) {
    return res.status(400).json({ ok: false, error: "invalid_input" });
  }

  const channels = [sendWhatsApp, sendEmail, sendWebhook];
  let delivered = false;
  let configured = false;
  for (const send of channels) {
    try {
      const r = await send(lead);
      if (r !== null) {
        configured = true;
        delivered = delivered || r === true;
      }
    } catch (err) {
      configured = true;
      console.error("enquiry delivery failed:", err.message);
    }
  }

  if (!configured) {
    console.error("enquiry received but no delivery channel is configured (set RESEND_API_KEY or ENQUIRY_WEBHOOK_URL)");
    return res.status(503).json({ ok: false, error: "not_configured" });
  }
  if (!delivered) return res.status(502).json({ ok: false, error: "delivery_failed" });
  return res.status(200).json({ ok: true });
}
