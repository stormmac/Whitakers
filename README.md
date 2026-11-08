# Whitakers Jewellers — website rebuild

Static HTML/CSS prototype. Open `index.html` in a browser; no build step.

| File | What it is |
|---|---|
| `index.html` | **New custom-first homepage** |
| `replica.html` | Replica of the current whitakers.com.au homepage and its full mega-menu, for comparison |
| `custom-design.html` | Engagement, wedding, remodel and bespoke jewellery, plus the 4-step process |
| `contact.html` | Consultation request form (demo, not connected yet), address and hours |
| `assets/styles.css`, `assets/main.js` | Shared styles, shared footer, mobile menu |

## Placeholders to replace
- Beige tiles with a ring outline are photo placeholders (label in the corner says what goes there).
- Review text: copy from the live Testimonials page.
- Logo: currently a text wordmark; swap in `whitakers-logo-horizontal-reversed-rgb.svg` from Shopify.
- Enquiry form needs a backend (Shopify contact form, Formspree, or email).
- Postcode: live site shows both 2290 and 2300 for 212 Pacific Highway, Charlestown.

## Notes
The live site is a Shopify store. "Shop" links point to the existing Shopify collections, so this design can become a Shopify theme homepage rather than replacing the store.

## Dee the dragonfly (live chat and voice)

Dee is the Whitakers dragonfly mascot, set up the same way as Suni in my247tutor. Dee floats over every page (`assets/main.js`), talks back out loud with a moving mouth and arm, and listens when you hold the microphone button. The artwork is split into layers in `assets/dee/` (body, jaw, raised arm) so the mouth and arm can move; `dee-original.png` is the source image.

- `api/dee.js` sends the conversation to Claude (`claude-opus-5-5`) with the Whitakers prompt in `lib/deePrompt.js`.
- `api/speech.js` gives Dee the same Australian Azure voice as my247tutor (`en-AU-NatashaNeural`). Without Azure keys Dee uses the visitor's device voice.
- Opened as plain files or in the Claude preview, there's no server, so Dee falls back to pre-written replies.

### Deploy on Vercel
1. Import this repo in Vercel (no build settings needed; it's a static site plus the `api/` functions).
2. Add environment variables:
   - `ANTHROPIC_API_KEY` (required for live replies)
   - `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` (optional, for the Australian cloud voice; you can reuse the my247tutor ones)
3. Deploy.
