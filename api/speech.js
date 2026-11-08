// GET /api/speech            ->  { enabled: boolean }  (whether the Australian cloud voice is set up)
// GET /api/speech?text=...   ->  MP3 of Suni saying it, in Azure's en-AU-NatashaNeural voice (same as my247tutor).
// Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION; without them Suni uses the visitor's device voice.
const VOICE = "en-AU-NatashaNeural";
// Longer than anything Suni says in one go, short enough that the route can't be used as a free TTS service.
const MAX_LENGTH = 400;

const configured = () => Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
const escapeXml = (t) => t.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

export default async function handler(req, res) {
  const text = typeof req.query?.text === "string" ? req.query.text : null;
  if (text === null) return res.status(200).json({ enabled: configured() });
  if (!configured()) return res.status(503).json({ error: "The cloud voice isn't set up." });
  const clean = text.trim();
  if (!clean || clean.length > MAX_LENGTH) return res.status(400).json({ error: "Nothing to say." });
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU">` +
    `<voice name="${VOICE}"><prosody rate="-5%">${escapeXml(clean)}</prosody></voice></speak>`;
  const azure = await fetch(
    `https://${encodeURIComponent(process.env.AZURE_SPEECH_REGION)}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "whitakers-site",
      },
      body: ssml,
      signal: AbortSignal.timeout(10_000),
    },
  ).catch(() => null);
  if (!azure?.ok) {
    if (azure) console.error("Azure speech failed", azure.status, await azure.text().catch(() => ""));
    return res.status(502).json({ error: "The voice didn't work." });
  }
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
  return res.status(200).send(Buffer.from(await azure.arrayBuffer()));
}
