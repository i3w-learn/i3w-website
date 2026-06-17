# I3W Website — UI/UX Audit + Brand-Aligned Design System

**Author:** Pravar (design) · **Date:** 17 Jun 2026
**Scope:** Audit the live site (`i3w-learn/i3w-website`, live at https://i3w-learn.github.io/i3w-website/) against the I3W Brand Identity System, then specify a design system that is **sharp-geometric, zero-gradient, and brand-true**.
**Direction (locked):** Sharp corners. No gradients. Sharp geometric is the UI language.
**Method:** Read the real source (`assets/css/i3w.css`, `index.html`, `core.js`), rendered the live pages, and compared every token/component against the brand kit (palette, type, logo rationale, voice).

---

## 0. TL;DR — the one-paragraph diagnosis

The site is **well-engineered but speaks the wrong dialect.** It's built in a *dark-immersive, molten-glow, soft-SaaS* idiom — bevelled 3D logo with bloom, gradient fills, pill buttons, rounded cards, orange used as a *glow*. The brand kit is the opposite language: **flat, angular, high-contrast, brutalist-confident** — hard diagonal cuts, one deliberate curve, orange used as *bold flat blocks*. On top of that, the CSS quietly drifted off the brand hex values. The fix is not a rebuild — the information architecture, copy, and component inventory are good. It's a **re-skin at the token + shape + surface level**: snap to exact brand color, kill every radius, kill every gradient, and convert orange from a glow into a structural block.

---

# PART A — THE AUDIT

Findings are ranked by severity. **P0 = breaks brand fidelity or function · P1 = strong off-direction · P2 = polish.**

## A1 · Brand token drift — the root cause `P0`

The design system's base tokens do not match the brand kit. This silently de-brands every screen.

| Token | Brand kit | Site CSS (`:root`) | Drift |
|---|---|---|---|
| Char Black | `#191919` | `--char-deep: #0a0b0f`, `--char: #101218` | Site is **darker and cooler/bluer** — the comment literally says *"obsidian, subtly cool, NOT orange-tinted."* That's a deliberate departure from brand. |
| Molten Orange | `#FC5810` | `--orange: #f2641e` | Site orange is **lighter, more amber/red**. The signature brand spark is wrong. |
| Grey Stone | `#C6C6C6` | `--stone: #c6cbd4` | Blue-tinted, not neutral. |
| Ash White | `#FFFFFF` | `--ash: #f3f4f7` | Off-white (defensible for dark-mode eye comfort, but document it). |
| (theme-color) | — | `#0d0d0d` | A **third** black, different from both brand and the CSS bg. |

**Consequence:** there are three competing "blacks" and a wrong orange. Brand recall depends on exact, repeated color. **Fix:** rebase the whole ramp on `#191919` + `#FC5810` (see Part B tokens). The "cool obsidian" choice is the single biggest reason the site doesn't *feel* like the brand deck.

## A2 · Roundness contradicts the entire direction `P0`

The brand mark is built on **sharp diagonal strokes** with exactly **one** sweeping curve ("deliberate tension between fluidity and precision"). The UI inverts that ratio — almost everything is rounded:

- **Buttons / CTAs:** `border-radius: 100px` → **full pills.** Loudest violation; these are the most-repeated element on the site.
- **Cards:** `--radius-lg: 22px` · **Inputs / icon tiles:** `12px` · **Tags / chips / pills / job-chips:** `100px` · **base `--radius: 14px`** · focus ring `4px` · scrollbar thumb `20px`.

**Fix:** global `--radius: 0`. Sharp 90° corners everywhere. Reintroduce the brand's "one curve" as **one** signature move only — a 45° **corner-cut** (`clip-path`) on the primary CTA or hero card, echoing the logo's diagonal. One cut, not rounding everywhere. (See B3.)

## A3 · Gradients are pervasive — you asked for zero `P0`

Inventory of gradients/glows actually in the CSS:

- **Gradient text** — `.ink-molten` on the hero word "intelligence" (`linear-gradient(orange-hot → orange → ember)`).
- **Card fills** — `.card` background `linear-gradient(180deg, surface → surface-2)`; `.card--glow` radial; gradient **hairline border** via `.card::before`.
- **Section/struct** — `.section--solid`, `.band`, `.timeline::before`, `.hero-scroll .bar`, `.person .ph` all use gradients.
- **Glows (soft shadows)** — `.btn-primary` orange `box-shadow` bloom; `.pill .dot` + `.tl-item::before` orange glow halos; nav `backdrop-filter` blur.
- **WebGL** — `UnrealBloom` post-processing on the 3D logo (atmospheric glow), plus `.scene-fallback` / `.scene-veil` radial+linear gradients.

**Fix:** replace every gradient with **flat fills** and every glow with **flat 1px borders**. Depth comes from discrete tonal steps (`#191919 → #1f1f1f → #2a2a2a`) and hard borders, never blends. Orange becomes a solid fill, not a gradient or a halo. Hero "intelligence" → solid `#FC5810`, not gradient ink.

## A4 · The WebGL "molten core" is the central vibe-mismatch `P1`

The hero centerpiece is a **bevelled, studio-lit, copper-metal 3D logo with bloom**, slowly rocking, with floating dust particles. It is *soft, reflective, atmospheric* — the exact opposite of the brand's **flat, hard-edged, matte** mark. It's also a poor fit for the **actual audience** (students on low-end Bharat phones): WebGL + bloom = battery, heat, jank, and a CDN-dependent failure surface.

Two-tier recommendation:
- **Conservative (cheap, on-brand fast):** keep the 3D mark but **kill bloom, kill bevel, kill the copper PBR material** → flat matte `#FC5810` faces with hard edges and a single hard key light. Reads as a rotating *paper-cut* logo, not molten metal. Drop dust particles.
- **Premium (bespoke, highest impact):** replace 3D with a **2D kinetic build** — the angular mark assembling from its diagonal slices, or large kinetic Unbounded typography ("FAST · SHARP · HUMAN · RESTLESS · DELIBERATE") sliding as hard color blocks. Cheaper to run, zero WebGL, and far more *brutalist-confident*.

## A5 · Orange is used as a sprinkle, not as structure `P1`

The CSS sets a great rule — *"a rare, deliberate spark (logo + key CTA only)"* — then breaks it: orange appears as gradient text, every eyebrow tick, `.txt-orange` keywords, tags, timeline dots, pulse dots, role labels, link hovers, button glow. It's *frequent but weak* (thin lines, small dots, glows). The brand uses orange the opposite way: **rare but loud** — giant flat blocks (the `W`, full headline words, full-bleed panels).

**Fix:** define two orange roles only — (1) **Impact block**: large flat `#FC5810` fills (a hero word, a full CTA band, the active-state) and (2) **Single accent**: one hairline / one label per view. Remove orange from incidental dots and glows.

## A6 · Type system: brand fidelity vs. the mono layer `P1`

- Brand fonts: **Unbounded** (primary/display) + **Montserrat** (secondary/body). The site uses both correctly **and adds IBM Plex Mono** for eyebrows, labels, button text, stats labels.
- IBM Plex Mono is **not in the brand kit.** It does give a "technical / systems / structured-chaos" texture that suits the voice — but it's an undocumented brand extension. **Decide:** either (a) **adopt it officially** as the "system/label" tier and add it to the brand kit, or (b) drop labels to Montserrat all-caps. *Recommendation: adopt it, document it* — it's the most characterful thing on the site and reinforces "engineering" half of the brand.
- **Unbounded reads friendly, not sharp**, because its forms are round. To pull it toward "sharp": tighter tracking on display (`-0.03em`), heavier weights (800) for big sizes, and **ALL-CAPS for display headers** (matches every header in the brand deck — "WHO WE ARE", "LOGO OVERVIEW", "BRAND PERSONALITY"). The site currently uses sentence case for H1/H2; the deck is uppercase. Align.

## A7 · UX / reliability / a11y — the "other things that influence direction" `P0–P2`

These are not cosmetic; they shape how the site is experienced.

- **`P0` Stat count-ups can stick at "0".** Stats render `0` in HTML and animate up via GSAP (CDN, "optional/guarded"). On the rendered impact band the numbers showed **0 / 0 / 0** — if the CDN is blocked/slow or the observer misfires, the headline metrics read zero. **Fix:** put the *final* value in the HTML; animate *from* it; never ship a `0` that depends on an optional script.
- **`P1` Content is gated behind scroll-reveal.** Everything below the hero is `opacity:0` until IntersectionObserver fires (a full-page screenshot renders the page **blank below the fold**). Fragile if JS fails. **Fix:** content should be visible by default and *enhanced* by reveal (progressive enhancement), not hidden by default.
- **`P1` Heavy CDN/WebGL dependency for a low-end audience.** Three.js 0.160 + GSAP + ScrollTrigger, all CDN, no bundler/fallback pinning. The audience is students on cheap Android. A glowy WebGL hero fights both the brand (efficient/sharp) and the hardware. Ties into A4.
- **`P2` Low-contrast text.** `--muted-2: #555a65` on `#0a0b0f` (placeholders, help text, footer) is ~3:1 — under WCAG AA for body. Lift muted tones.
- **`P2` Rounded focus ring** (`border-radius:4px`) — make sharp to match.
- **`P2` Three blacks / favicon mismatch** — `theme-color #0d0d0d` ≠ brand ≠ CSS bg. Unify.

## A8 · What's genuinely good — keep it (don't rebuild) `✓`

Per "integrate, don't replace": the bones are strong. Preserve —
- **IA & page set** (Home / About / Products / Research / Team / Careers / Contact) — complete and sensible.
- **Copy & voice** — already on-brand ("did a real student get a real win today?", the marquee `Fast · Sharp · Human · Restless · Deliberate` pulled straight from the brand personality slide). Excellent.
- **Component inventory** — nav, cards, product cards, rows, marquee, timeline, JD accordion, forms, footer. All the right parts exist; they just need re-skinning.
- **Build hygiene** — template + `_parts` + `_assemble.py` so nav/footer can't drift; reduced-motion handling; 8pt spacing rhythm. Good engineering.

**The job is a re-skin, not a teardown.**

---

# PART B — THE DESIGN SYSTEM (sharp-geometric, zero-gradient, brand-true)

A drop-in replacement for the current token + component layer. No code deliverable requested — this is the spec the CSS should implement.

## B1 · Color — flat, exact, brand-locked

**Core (snap to brand kit exactly):**

| Role | Hex | Use |
|---|---|---|
| Char Black | `#191919` | Primary background. The one true black. |
| Molten Orange | `#FC5810` | Impact blocks + single accent. Flat only. |
| Grey Stone | `#C6C6C6` | Body text on dark, secondary UI. |
| Ash White | `#FFFFFF` | Headlines, max-contrast text. |

**Extended neutral ramp (for flat depth — replaces gradients):**

| Token | Hex | Use |
|---|---|---|
| `ink-900` | `#191919` | Page bg |
| `ink-800` | `#1F1F1F` | Card / surface (flat) |
| `ink-700` | `#2A2A2A` | Raised surface / hover |
| `ink-600` | `#3A3A3A` | Borders (hard, 1px) |
| `stone-400` | `#8A8A8A` | Muted text (lift from current `#555` for AA) |
| `stone-200` | `#C6C6C6` | Body text |
| `white` | `#FFFFFF` | Headings |

**Orange support (flat states only — no glow):** hover `#FF6A28`, pressed `#E04A0A`. No `orange-soft`/`ember` gradient stops.

**Rules:** depth = discrete steps + 1px hard borders, never blends. Orange is never a gradient, never a `box-shadow` glow, never a thin sprinkle. One impact-orange moment per viewport, max.

## B2 · Typography — Unbounded / Montserrat / (Plex Mono, documented)

| Tier | Font | Treatment |
|---|---|---|
| Display / H1–H2 | **Unbounded** 800 | **ALL CAPS**, tracking `-0.03em`, line-height `0.95`. Matches the brand deck headers. |
| H3 / card titles | Unbounded 700 | Caps or sentence case; tracking `-0.02em`. |
| Body / lead | **Montserrat** 400–500 | Sentence case, line-height 1.6, max 60ch. |
| Emphasis | Montserrat 600 | `#FFFFFF`. |
| System labels / eyebrows / buttons / stats-labels | **IBM Plex Mono** 500 | UPPERCASE, tracking `0.16–0.26em`. *Officially adopt + add to brand kit.* |

Type scale (keep the existing fluid `clamp()` scale — it's well-built): eyebrow `.7rem` → display `~4rem`. Only change is **caps + tighter tracking** on display.

## B3 · Shape — the radius rule + the one signature cut

- **`--radius: 0` everywhere.** Buttons, cards, inputs, tags, chips, images, focus ring — all hard 90° corners.
- **The one curve becomes one cut.** The brand mark's single sweeping curve is honored as **one 45° corner-cut**, used sparingly as the signature move:
  - Primary CTA: notch the top-right or bottom-left corner via `clip-path: polygon(...)` (≈14px cut).
  - Optionally the hero card / one feature panel.
  - **Never** combine the cut with anything else; one cut per element; not on every card.
- Borders: **1px solid `#3A3A3A`** (or `#FC5810` for active/focus). Hard, visible, structural — they replace the gradient hairlines.

## B4 · Elevation & surfaces (no gradients, no shadows-as-glow)

- No drop shadows for glow. Allowed: a single **hard offset shadow** (e.g. `4px 4px 0 #000`) on key interactive blocks if a "printed/brutalist" lift is wanted — flat, no blur. Optional, premium.
- Card = `#1F1F1F` flat fill + `1px #3A3A3A` border. Hover = lift to `#2A2A2A` + border `#FC5810` (no transform glow; a 1px→border-color swap or a 2px translate is enough).
- Section separation by **flat color blocks** (`#191919` ↔ `#1F1F1F`) and **hard 1px rules**, not gradient fades.

## B5 · Components (re-skin of what already exists)

| Component | Now | Sharp-geometric spec |
|---|---|---|
| **Button — primary** | orange pill, glow shadow | Flat `#FC5810` fill, `#191919` text (or white), **0 radius**, optional 45° corner-cut, Plex Mono caps. Hover = `#FF6A28` flat, no glow. |
| **Button — ghost** | translucent pill | Transparent, **1px `#C6C6C6`** border, 0 radius. Hover = fill `#FFFFFF`/text `#191919` (hard invert) or border→orange. |
| **Card** | gradient fill + gradient border + 22px | Flat `#1F1F1F`, 1px `#3A3A3A`, 0 radius. Number label in orange Plex Mono. Hover = border→orange. |
| **Product tag** (live/soon/gov) | rounded pill, tinted | Square (0 radius), 1px border, flat. Keep the color *coding* (green/orange/blue) but as **bordered square chips**, not glowy pills. |
| **Input / select / textarea** | 12px radius, focus glow | 0 radius, 1px `#3A3A3A`; focus = 1px `#FC5810` (no background tint glow). |
| **Nav** | blur glass on scroll | Solid `#191919` bar with a 1px bottom rule on scroll (drop the saturate/blur if you want true flat; blur is the one defensible exception). Active link = orange underline (keep — it's already sharp). |
| **Eyebrow** | mono + orange tick | Keep — already on-brand. Tick stays as a **hard 1px orange bar**. |
| **Marquee** | outlined Unbounded | Keep. Consider solid orange words alternating with white for more block-impact. |
| **Timeline / dots** | orange glow dots | Replace round glow dots with **small orange squares** + hard 1px connector line (no gradient). |
| **Stat** | count-up from 0 | Final number in HTML (caps the A7 bug); Unbounded; label Plex Mono. |

## B6 · Motion

- Keep it **fast and mechanical** ("fast, restless, deliberate"): short durations (`.2–.3s`), hard cubic eases, **transform/opacity only**.
- Reveal = enhancement, never a gate (fix A7): start visible, animate if JS present.
- Hover = **state snap** (color/border invert), not soft float + glow.
- Honor `prefers-reduced-motion` (already done).

## B7 · Do / Don't

**Do** — flat `#191919` + `#FC5810` · hard 90° corners · 1px structural borders · ALL-CAPS Unbounded display · orange as big flat blocks · one 45° signature cut · Plex Mono for system labels.

**Don't** — no gradients (text, fill, border, or glow) · no pills / rounded corners · no bloom / orange halos · no "cool obsidian" off-brand black · no orange sprinkled as thin dots/lines · no content hidden behind JS reveals · no stat that can render `0`.

---

## C · Suggested sequence (so it's a re-skin, not a rebuild)

1. **Tokens** — rebase `:root` on exact brand hex + the flat ramp (A1, B1). *Biggest brand-fidelity win, smallest change.*
2. **Radius → 0** globally; add the single corner-cut to the primary CTA (A2, B3).
3. **Strip gradients** — fills, borders, glows, gradient text (A3, B4).
4. **Orange discipline** — convert to blocks + single accent (A5, B5).
5. **Display → ALL CAPS** + tighter tracking; formally adopt Plex Mono (A6, B2).
6. **Fix the reliability bugs** — stat count-ups, reveal-gating, contrast (A7).
7. **Decide the hero** — flat-matte 3D vs. 2D kinetic (A4) — the one strategic call.

Everything in steps 1–6 is a CSS-token-and-shape pass on the existing markup. Step 7 is the only open design decision.
