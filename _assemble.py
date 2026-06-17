#!/usr/bin/env python3
"""Assemble I3W subpages from _template.html + per-page main parts in _parts/.
Guarantees identical head/nav/footer across pages; only the <main> differs."""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).parent
TEMPLATE = (ROOT / "_template.html").read_text(encoding="utf-8")

# file -> (title, desc, scene, active)
PAGES = {
    "about.html":    ("About — I3W · Idea Innovation Impact Wing",
                       "I3W is the AI-native venture studio inside Infinity Learn. Our story, our thesis, and how we build intelligence that matters.",
                       "ambient", "about.html"),
    "products.html": ("Products — Infi Companion, InfiNotes & AI for public good | I3W",
                       "The products of I3W: Infi Companion, InfiNotes, NEET mock tests, and Poshan AI for public good.",
                       "ambient", "products.html"),
    "research.html": ("Research & Insights — How I3W thinks about AI in learning",
                       "Field notes from I3W on building AI for Indian students: the daily-help thesis, Hinglish voice design, retention hooks, and guardrails for minors.",
                       "ambient", "research.html"),
    "team.html":     ("Team — The people behind I3W",
                       "Meet the team behind Infi Companion, InfiNotes and Poshan AI — a small, senior crew from Unacademy, PhysicsWallah, Shopify, Atlassian, Zupee and NID.",
                       "ambient", "team.html"),
    "careers.html":  ("Careers — Build AI that reaches millions | I3W",
                       "Join I3W, the AI-native venture studio inside Infinity Learn. Ship AI to real students in weeks. Open roles in engineering, design, product and growth.",
                       "ambient", "careers.html"),
    "contact.html":  ("Contact & Team — I3W",
                       "Get in touch with I3W — for students, schools, district administrations, partnerships, press, or to join the team.",
                       "ambient", "contact.html"),
}

ALLOWED_TAGS = {"section","div","span","h1","h2","h3","h4","p","a","article","ul","li","ol",
                "svg","path","circle","rect","line","polyline","polygon","g","strong","b","em","i",
                "form","label","input","textarea","select","option","button","hr","br","figure","blockquote","img"}

def clean(main: str) -> str:
    main = main.strip()
    # strip markdown fences if an author added them
    main = re.sub(r"^```[a-zA-Z]*\n", "", main)
    main = re.sub(r"\n```$", "", main).strip()
    # drop any accidental wrapper tags an author may have added
    main = re.sub(r"</?(?:main|body|html|head)\b[^>]*>", "", main, flags=re.IGNORECASE)
    return main.strip()

def set_active(html: str, active: str) -> str:
    # add class="active" to nav + mobile links whose href is the active page
    return html.replace(f'<a href="{active}">', f'<a href="{active}" class="active">')

def audit(file: str, main: str):
    tags = set(t.lower() for t in re.findall(r"<\s*([a-zA-Z][a-zA-Z0-9]*)", main))
    bad = tags - ALLOWED_TAGS
    warns = []
    if bad: warns.append(f"unexpected tags: {sorted(bad)}")
    if "<script" in main.lower() or "<style" in main.lower(): warns.append("contains script/style")
    if not main.lstrip().startswith('<section class="page-head"'): warns.append("does not start with page-head")
    # links
    for href in re.findall(r'href="([^"]+)"', main):
        if href.startswith("#") or href.startswith("mailto:"): continue
        if href not in PAGES and href != "index.html":
            warns.append(f"off-site link: {href}")
    return warns

def main():
    parts = ROOT / "_parts"
    report = []
    for file,(title,desc,scene,active) in PAGES.items():
        p = parts / f"{file}"
        if not p.exists():
            report.append(f"  SKIP {file} (no part)"); continue
        body = clean(p.read_text(encoding="utf-8"))
        warns = audit(file, body)
        page = (TEMPLATE
                .replace("{{TITLE}}", title)
                .replace("{{DESC}}", desc)
                .replace("{{SCENE}}", scene)
                .replace("{{MAIN}}", body))
        # only mark active in the nav/mobile region (before <main>), never in the footer
        idx = page.find("<main>")
        page = set_active(page[:idx], active) + page[idx:]
        (ROOT / file).write_text(page, encoding="utf-8")
        report.append(f"  OK   {file}  ({len(body):>6} chars main)" + ("  ⚠ "+ "; ".join(warns) if warns else ""))
    print("Assembled:")
    print("\n".join(report))

if __name__ == "__main__":
    main()
