// POST /api/book  { name, phone, email, reason, date: "YYYY-MM-DD", time: "10:30am" }  ->  { ok: true }
// An appointment request from Dee's chat, emailed to the shop through Resend (https://resend.com).
// Needs RESEND_API_KEY and BOOKING_TO (the shop's inbox) in the hosting environment; BOOKING_FROM is optional.
// Without them it answers 503 and Dee tells the visitor the request wasn't sent.

const clean = (v, max = 200) => (typeof v === "string" ? v.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "");
const escape = (v) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }
  const { RESEND_API_KEY, BOOKING_TO, BOOKING_FROM } = process.env;
  if (!RESEND_API_KEY || !BOOKING_TO) return res.status(503).json({ error: "Bookings aren't connected yet." });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
  const b = Object.fromEntries(["name", "phone", "email", "reason", "date", "time"].map((k) => [k, clean(body[k])]));
  if (!b.name || !(b.phone || b.email) || !/^\d{4}-\d{2}-\d{2}$/.test(b.date) || !/^\d{1,2}:\d{2}(am|pm)$/.test(b.time)) {
    return res.status(400).json({ error: "Name, a phone or email, a day and a time are needed." });
  }
  const day = new Date(`${b.date}T12:00:00`).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const rows = [["Name", b.name], ["Phone", b.phone || "-"], ["Email", b.email || "-"], ["For", b.reason || "-"], ["Requested", `${day} at ${b.time}`]];
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: BOOKING_FROM || "Dee at Whitakers <onboarding@resend.dev>",
      to: BOOKING_TO.split(",").map((s) => s.trim()),
      reply_to: b.email || undefined,
      subject: `Appointment request: ${b.name}, ${day} ${b.time}`,
      html: `<p>New appointment request from Dee on the website. Please confirm with the customer.</p><table>${rows
        .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escape(v)}</td></tr>`)
        .join("")}</table>`,
    }),
  }).catch(() => null);
  if (!r || !r.ok) {
    console.error("Booking email failed", r?.status, r && (await r.text().catch(() => "")));
    return res.status(502).json({ error: "The request couldn't be sent. Please call 02 4927 0100." });
  }
  return res.status(200).json({ ok: true });
}
