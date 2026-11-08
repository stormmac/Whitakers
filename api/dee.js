// POST /api/dee  { turns: [{ role: "user" | "assistant", content: string | [image, text] }] }  ->  { reply: string }
// Visitors can include a photo of their jewellery (base64 JPEG/PNG/WebP), which Dee can see.
// Dee's live replies, from Claude. Needs ANTHROPIC_API_KEY set in the hosting environment.
import Anthropic from "@anthropic-ai/sdk";
import { DEE_SYSTEM_PROMPT } from "../lib/deePrompt.js";

const MODEL = "claude-opus-5-5";
// If a safety classifier declines a request, the API retries it on Anthropic's recommended fallback model.
const FALLBACK_BETA = "server-side-fallback-2026-07-01";
const MAX_TURNS = 30;
const MAX_CHARS = 1000;

export const BUSY_REPLY = "Lots of people are chatting with me right now. Give me a moment and ask again, or call the team on 02 4927 0100.";
export const ERROR_REPLY = "Oh no, my wings got in a little tangle and I lost what I was going to say. Could you ask me that again? You can also call the team on 02 4927 0100.";
const REFUSAL_REPLY = "I can't help with that one, but I'd love to help with anything jewellery. What are you hoping to create?";

let client = null;
const getClient = () => (client ??= new Anthropic());

const MAX_IMAGES = 2;
const MAX_IMAGE_CHARS = 2_000_000; // base64 characters, about 1.5 MB
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// A turn's content is text, or (from the visitor) a photo of their jewellery plus text.
function cleanContent(t, imagesLeft) {
  if (typeof t.content === "string") return t.content.trim().slice(0, MAX_CHARS);
  if (t.role !== "user" || !Array.isArray(t.content)) return "";
  const text = t.content.filter((b) => b?.type === "text" && typeof b.text === "string").map((b) => b.text).join(" ").trim().slice(0, MAX_CHARS);
  const img = t.content.find((b) => b?.type === "image" && b.source?.type === "base64");
  const ok = img && IMAGE_TYPES.has(img.source.media_type) && typeof img.source.data === "string" && img.source.data.length <= MAX_IMAGE_CHARS;
  if (!ok || imagesLeft.n <= 0) return img ? `[I shared a photo] ${text}`.trim() : text;
  imagesLeft.n--;
  return [
    { type: "image", source: { type: "base64", media_type: img.source.media_type, data: img.source.data } },
    { type: "text", text: text || "Here's a photo of my jewellery." },
  ];
}

function cleanTurns(raw) {
  if (!Array.isArray(raw)) return null;
  const imagesLeft = { n: MAX_IMAGES };
  // Walk newest first so the most recent photos are the ones kept.
  const turns = raw
    .slice(-MAX_TURNS)
    .filter((t) => t && (t.role === "user" || t.role === "assistant"))
    .reverse()
    .map((t) => ({ role: t.role, content: cleanContent(t, imagesLeft) }))
    .filter((t) => t.content.length)
    .reverse();
  // The conversation must start with the visitor and end with their latest message.
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns.at(-1).role !== "user") return null;
  return turns;
}

function textOf(message) {
  if (message.stop_reason === "refusal") return REFUSAL_REPLY;
  const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  return text || ERROR_REPLY;
}

async function ask(messages) {
  const system = [{ type: "text", text: DEE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }];
  const base = { model: MODEL, max_tokens: 4000, output_config: { effort: "low" }, system, messages };
  try {
    return await getClient().beta.messages.create({ ...base, betas: [FALLBACK_BETA], fallbacks: "default" });
  } catch (err) {
    // A setting the API no longer accepts: try once more as a plain request so the visitor still gets an answer.
    if (!(err instanceof Anthropic.BadRequestError || err instanceof Anthropic.NotFoundError)) throw err;
    console.error("Dee request rejected, trying a plain request", err.status, err.message);
    return getClient().messages.create(base);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "Dee isn't connected yet." });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
  const turns = cleanTurns(body.turns);
  if (!turns) return res.status(400).json({ error: "Send the conversation as turns, ending with the visitor's message." });
  try {
    const message = await ask(turns);
    return res.status(200).json({ reply: textOf(message) });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError) {
      return res.status(503).json({ error: BUSY_REPLY });
    }
    console.error("Dee failed", err?.status, err?.message);
    return res.status(502).json({ error: ERROR_REPLY });
  }
}
