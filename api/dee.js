// POST /api/dee  { turns: [{ role: "user" | "assistant", content: string }] }  ->  { reply: string }
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

function cleanTurns(raw) {
  if (!Array.isArray(raw)) return null;
  const turns = raw
    .slice(-MAX_TURNS)
    .filter((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string" && t.content.trim())
    .map((t) => ({ role: t.role, content: t.content.trim().slice(0, MAX_CHARS) }));
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
