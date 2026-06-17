# I3W — Company Website

A dark, immersive, **WebGL-driven** multi-page site for **I3W (Idea · Innovation · Impact Wing)**, the AI-native venture studio inside Infinity Learn.

Theme: **Molten Core** — a live, noise-displaced molten-orange energy sphere (Three.js shader + UnrealBloom) glowing in char-black space, reactive to scroll and mouse. Brand-locked tokens: Char Black `#191919` + Molten Orange `#FC5810`, fonts Unbounded / Montserrat / IBM Plex Mono.

## Pages
| File | Purpose |
|---|---|
| `index.html` | Home — full Molten Core hero, thesis, products, impact, careers teaser |
| `about.html` | Our story — thesis, the 5 brand values, principles, timeline |
| `products.html` | Infi Companion · InfiNotes · NEET mocks · Poshan AI (public good) |
| `research.html` | Field notes — how I3W thinks about AI in learning |
| `careers.html` | Why join, open roles, what we offer |
| `contact.html` | Contact form + the team |

## Preview locally
No build step — it's static HTML. From this folder:
```bash
python3 -m http.server 8000
# open http://localhost:8000
```
(A plain `open index.html` works too, but a server is cleaner for the ES-module imports.)

## Deploy
Drag-and-drop or point any static host at this folder:
- **Vercel:** `vercel deploy` (framework preset: *Other*)
- **Netlify:** drop the folder, or `netlify deploy`
- **GitHub Pages / Cloudflare Pages:** push and serve the root

## Tech
- **3D:** Three.js `0.160` + UnrealBloom, loaded via CDN `importmap` (no bundler). Engine in `assets/js/core.js` — one shared engine, two scenes (`data-scene="hero"` full core, `data-scene="ambient"` smaller core on subpages). Pure-CSS molten fallback if WebGL is unavailable; renders a single static frame under `prefers-reduced-motion`; pauses when the tab/canvas is offscreen.
- **Motion:** GSAP + ScrollTrigger (CDN, optional/guarded) for stat count-ups + hero parallax; IntersectionObserver for scroll reveals.
- **CSS:** one design system in `assets/css/i3w.css` (tokens, components, responsive 375/768/1024/1440, dark-mode, reduced-motion).
- **Logo:** `assets/img/i3w-mark.png` (orange mark, transparent) + `i3w-lockup-dark.png` (white-lettered lockup) + `favicon.png`, processed from the brand source files.

## Editing content
The 5 inner pages are assembled from a shared template so the header/nav/footer can never drift:
- `_template.html` — canonical head + nav + footer (edit nav/footer **here**, then re-assemble)
- `_parts/<page>.html` — just the `<main>` content of each page (edit copy here)
- `_assemble.py` — injects parts into the template, sets the active nav state → run `python3 _assemble.py`

`index.html` is hand-authored (it has the unique full hero) — edit it directly. Files prefixed `_` are build tooling, not part of the deployed site.

## Notes for Achal
- **Team page** (`contact.html`) lists the real team with roles/initials as placeholder avatars — swap in photos or trim names as you like.
- **Open roles** (`careers.html`) are illustrative for an AI-edtech studio — edit to your live hiring.
- **Launch dates** are intentionally kept vague ("launching 2026", "in development") since the Companion date is readiness-driven — no hard public date is committed anywhere.
- **Research "Read the note →"** links point to in-page anchors (placeholders) — wire them to real notes when the content exists.
- All metrics on the site are the safe-to-share ones (10K+ students, 12.9% conversion, 1.47L children / 0.88 AUC / 9,947 caught) — no rupee pipeline numbers are published.
