#!/usr/bin/env python3
"""Builds the 1EYE website pages (home, product page, guides) into ../website."""
import json, html, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import guides_data

W = os.path.join(os.path.dirname(__file__), "..", "website")
SITE = "https://1eye.dpdns.org"
DATE = "2026-11-20"
GH = "https://github.com/balajsajjad7-bot/1eye"
IG = "https://www.instagram.com/1eye.app/"
esc = html.escape

def head(title, desc, url, ld, extra="", ogtype="website"):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#050505">
<meta name="color-scheme" content="dark">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:site_name" content="1EYE"><meta property="og:type" content="{ogtype}">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{SITE}/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{SITE}/og.png">
<link rel="icon" href="/favicon.png" type="image/png"><link rel="apple-touch-icon" href="/icon-192.png"><link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/site.css?v=n2">
<script>document.documentElement.classList.add("js")</script>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
{extra}</head>
<body>
<div class="gridbg" aria-hidden="true"></div><canvas id="gridfx" aria-hidden="true"></canvas>
'''

NAVLINKS = [("/#projects", "Projects"), ("/#manifesto", "Manifesto"), ("/data-transfer/", "Data transfer"), ("/guides/", "Guides"), (GH, "GitHub")]

def header(loader=False):
    nav = "".join(f'<a href="{u}">{t}</a>' for u, t in NAVLINKS)
    big = "".join(f'<a class="big" href="{u}">{t}</a>' for u, t in NAVLINKS + [(IG, "Instagram")])
    ld = '''<div class="loader" aria-hidden="true"><div><b style="font-size:21px;font-weight:600;letter-spacing:-.03em">1EYE</b><div class="lbl rule" style="margin-top:6px">Open source lab</div></div><div class="count">000</div><div><div class="mono">[ Opening the eye ]</div><div class="bar"><i></i></div></div></div>''' if loader else ""
    return f'''{ld}
<header class="hdr">
  <a class="brand" href="/" aria-label="1EYE home"><b><img src="/favicon.png" alt="" width="22" height="22">1EYE</b><span class="lbl rule">Open source lab</span></a>
  <nav class="nav" aria-label="Main">{nav}</nav>
  <button class="menu-btn" data-menu aria-label="Open menu">[ Menu ]</button>
</header>
<div class="sheet" aria-label="Menu"><button class="x mono" data-menu>[ Close ]</button><div class="mono" style="margin-bottom:18px">[ Index ]</div>{big}</div>
'''

def footer():
    return f'''<footer><div class="wrap">
  <div class="cols">
    <div><div class="mono" style="margin-bottom:10px">[ Lab ]</div><a href="/#projects">Projects</a><a href="/#manifesto">Manifesto</a><a href="/data-transfer/">Telepathic Data Transfer</a><a href="/guides/">Guides</a></div>
    <div><div class="mono" style="margin-bottom:10px">[ Download ]</div><a href="/data-transfer/#download">Windows</a><a href="/data-transfer/#download">Android</a><a href="/data-transfer/#download">macOS</a><a href="/data-transfer/#download">Linux</a></div>
    <div><div class="mono" style="margin-bottom:10px">[ Elsewhere ]</div><a href="{GH}">GitHub</a><a href="{IG}">Instagram</a><a href="{GH}/issues">Propose a project</a></div>
    <div><div class="mono" style="margin-bottom:10px">[ Legal ]</div><a href="/terms.html">Terms</a><a href="/privacy.html">Privacy</a><a href="/security.html">Security</a><a href="/legal.html">All legal</a></div>
  </div>
  <div class="big" aria-hidden="true">1EYE</div>
  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-top:18px" class="mono"><span>© <span data-year>2026</span> 1EYE · Built by Balaj</span><span>[ Open source · MIT ]</span></div>
</div></footer>
<script src="/noir.js?v=n2" defer></script>
<script src="/lab.js?v=n2" defer></script>\n<script src="/eyecam.js?v=1" defer></script>
</body>
</html>
'''

WIN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.5 10 4.5v7H3zM11 4.3 21 3v8.5H11zM3 12.5h7v7l-7-1zM11 12.5h10V21l-10-1.4z"/></svg>'
def downloads(anchor_id="download"):
    return f'''<div id="{anchor_id}">
  <div class="dls">
    <a class="dl" data-os="win" href="/downloads/1EYE.exe" download="1EYE.exe"><span class="mono">[ Windows 10 / 11 ]</span><b>1EYE.exe</b><span class="mono">16 MB · no install</span></a>
    <a class="dl" data-os="apk" href="/downloads/1EYE.apk" download="1EYE.apk"><span class="mono">[ Android 8+ ]</span><b>1EYE.apk</b><span class="mono">32 MB · can host too</span></a>
    <a class="dl" data-os="mac" href="/downloads/1EYE-macOS-AppleSilicon" download="1EYE-macOS-AppleSilicon"><span class="mono">[ macOS · M1–M4 ]</span><b>Apple Silicon</b><span class="mono">16 MB</span></a>
    <a class="dl" href="/downloads/1EYE-macOS-Intel" download="1EYE-macOS-Intel"><span class="mono">[ macOS · Intel ]</span><b>Intel Mac</b><span class="mono">16 MB</span></a>
    <a class="dl" data-os="linux" href="/downloads/1EYE-Linux-x64" download="1EYE-Linux-x64"><span class="mono">[ Linux · x64 ]</span><b>Linux x64</b><span class="mono">16 MB</span></a>
    <a class="dl" href="/downloads/1EYE-Linux-arm64" download="1EYE-Linux-arm64"><span class="mono">[ Linux · ARM64 ]</span><b>Raspberry Pi</b><span class="mono">16 MB</span></a>
  </div>
  <code class="cmd" data-copy title="Click to copy">cd ~/Downloads && chmod +x 1EYE-macOS-* && xattr -c 1EYE-macOS-* && ./1EYE-macOS-*</code>
  <code class="cmd" data-copy title="Click to copy">cd ~/Downloads && chmod +x 1EYE-Linux-* && ./1EYE-Linux-*</code>
  <p class="mono" style="margin-top:14px;text-transform:none;letter-spacing:0;font-size:12px">iPhone and iPad need no app: scan the QR code from 1EYE on your computer. Mac and Linux run the command once because browsers save programs without permission to run. Windows may say "Unknown publisher": click More info → Run anyway. <a href="/downloads/SHA256SUMS.txt" style="border-bottom:1px solid var(--line2)">Checksums</a>.</p>
</div>'''

FAQ = [
 ("Is 1EYE free?", "Yes. Everything 1EYE makes is free and open source under the MIT License. No ads, no accounts, no paid tier."),
 ("What is Telepathic Data Transfer?", "1EYE's first project: an app that works like AirDrop for Windows, Android, macOS and Linux. Open it on your computer, scan the QR code with your phone, and send files, text and links between them over Wi-Fi or from anywhere."),
 ("Do my files go to a cloud server?", "No. Files go straight from one of your devices to another and are saved on your own computer or phone. There is no 1EYE server. Cloud storage is optional and uses your own Google Drive or WebDAV account."),
 ("Can I send files when my phone and computer are on different networks?", "Yes. Press Go online and 1EYE gives your computer a private https link, protected by your PIN, that works from mobile data or any other Wi-Fi."),
 ("Does it work with iPhone?", "Yes, through Safari. Scan the QR code shown by 1EYE on your computer with the iPhone camera and the 1EYE page opens. No separate iPhone app needed."),
 ("Is there a file size limit?", "No fixed limit. Files stream straight to disk, so the limit is the free space on the receiving device."),
 ("Why does Windows say Unknown publisher?", "The Windows app isn't code-signed yet, so SmartScreen warns the first time. Click More info, then Run anyway. The source code is public on GitHub."),
 ("How can I contribute or propose a project?", "Open an issue or a pull request on GitHub. Bug reports, ideas and code are all welcome."),
]
def faq_html(items):
    return "".join(f'<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in items)
def faq_ld(items):
    return {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}

APP_LD = {"@type": "SoftwareApplication", "@id": SITE + "/data-transfer/#app", "name": "1EYE Telepathic Data Transfer", "alternateName": ["1EYE", "AirDrop for Windows"],
  "applicationCategory": "UtilitiesApplication", "applicationSubCategory": "File transfer", "operatingSystem": "Windows 10, Windows 11, Android 8+, macOS 11+, Linux",
  "softwareVersion": "1.9", "fileSize": "16MB", "downloadUrl": SITE + "/data-transfer/#download", "url": SITE + "/data-transfer/", "image": SITE + "/og.png",
  "description": "Send files, chat and links between your phone and computer over Wi-Fi or from anywhere. One file, no account, no cloud. Free and open source.",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}, "license": "https://opensource.org/licenses/MIT", "isAccessibleForFree": True,
  "author": {"@id": SITE + "/#org"}, "publisher": {"@id": SITE + "/#org"}}
ORG_LD = {"@type": "Organization", "@id": SITE + "/#org", "name": "1EYE", "alternateName": "1EYE Open Source Lab", "url": SITE + "/", "logo": SITE + "/icon-512.png",
  "description": "An open-source lab that builds free tools people need: no accounts, no tracking.", "founder": {"@type": "Person", "name": "Balaj"}, "sameAs": [GH, IG]}

# ============================== HOME ==============================
def home():
    ld = {"@context": "https://schema.org", "@graph": [ORG_LD, {"@type": "WebSite", "@id": SITE + "/#site", "name": "1EYE", "url": SITE + "/", "publisher": {"@id": SITE + "/#org"}}, APP_LD, faq_ld(FAQ[:5])]}
    p = head("1EYE — Open Source Lab · Telepathic Data Transfer (AirDrop for Windows & Android)",
             "1EYE is an open-source lab building free tools you need. First release: Telepathic Data Transfer, AirDrop for Windows, Android, Mac and Linux. No account, no cloud.",
             SITE + "/", ld)
    p += header(loader=True)
    p += f'''<main>
<section class="hero" aria-label="1EYE">
  <div class="eyewrap">
    <canvas id="eye" data-zoom=".74" aria-label="A black-and-white close-up of a human eye that glances around and follows your cursor" role="img"></canvas>
    <div class="vf" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <span class="readout ro1">[ Macro 1:1 ]</span><span class="readout ro2" id="ro-pupil">Pupil 2.8 mm</span>
    <span class="readout ro3" id="ro-gaze">Gaze +0.00 / +0.00</span><span class="readout ro4">[ Live · WebGL ]</span>
    <video id="camv" class="camv" playsinline muted hidden aria-hidden="true"></video>
  </div>
  <h1 class="ttl">One eye.<br>Open<br>source.</h1>
  <div class="copy" data-r><span class="lbl rule">Est. 2026</span><p>An open-source lab building the tools we need ourselves, and giving them away. Free. No accounts. Nothing hidden.</p></div>
  <div class="side" data-r="2"><button class="mono cam" id="cam" type="button">[ Let it see you ]</button><small class="camnote" id="camnote">Uses your camera. Stays on your device.</small><a class="mono" href="#projects" data-scramble>[ Scroll to see ]</a></div>
</section>

<section id="manifesto" class="manifesto"><div class="wrap">
  <div class="sechead"><span class="lbl rule">Manifesto</span><span class="mono">[ 01 / 04 ]</span></div>
  <div class="line" data-r><span class="mono">01</span><span class="h-l">Build what we need.</span></div>
  <div class="line" data-r><span class="mono">02</span><span class="h-l">Give it away.</span></div>
  <div class="line" data-r><span class="mono">03</span><span class="h-l">Hide nothing.</span></div>
  <div class="line" data-r><span class="mono">04</span><span class="h-l muted">No accounts. No ads. No trackers.</span></div>
</div></section>

<section id="projects"><div class="wrap">
  <div class="sechead"><div><span class="lbl rule">Projects</span><h2 class="h-l" style="margin-top:18px" data-r>The index.</h2></div><span class="mono">[ 02 / 04 ]</span></div>
  <div class="plist">
    <a class="prow" href="/data-transfer/" data-preview="/media/telepathic.jpg" data-r>
      <span class="mono">001</span><span class="nm">Telepathic Data Transfer</span><span class="mono cat">File transfer · AirDrop for everyone</span><span class="mono pf">Win · Android · macOS · Linux</span><span class="mono yr">2026</span><span class="st"><span class="pill"><i></i>Live v1.9</span></span>
    </a>
    <div class="prow" data-r="2">
      <span class="mono">002</span><span class="nm muted">[ Redacted ]</span><span class="mono cat">In development</span><span class="mono pf">—</span><span class="mono yr">2027</span><span class="st"><span class="pill" style="color:var(--muted)">Soon</span></span>
    </div>
    <a class="prow" href="{GH}/issues" data-r="3">
      <span class="mono">003</span><span class="nm muted">Your idea</span><span class="mono cat">Propose a tool on GitHub</span><span class="mono pf">Anyone</span><span class="mono yr">—</span><span class="st"><span class="pill">Propose →</span></span>
    </a>
  </div>
  <div class="preview" aria-hidden="true"></div>
</div></section>

<section id="flagship"><div class="wrap">
  <div class="sechead"><span class="lbl rule">Project 001</span><span class="mono">[ 03 / 04 ]</span></div>
  <div class="spot">
    <div>
      <h2 class="h-l" data-r>Drop anything.<br><span class="muted">It just arrives.</span></h2>
      <p class="p-l" style="margin-top:26px;max-width:560px" data-r="2">Telepathic Data Transfer is AirDrop for Windows, Android, Mac and Linux. Send files, photos, chat and links between your phone and computer over Wi-Fi, or from anywhere in the world. One small app. No account, no cable, no cloud.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:30px" data-r="3"><a class="btn primary" href="/data-transfer/">Explore the project</a><a class="btn" href="/guides/airdrop-for-windows.html">How it works</a></div>
      <p class="mono" style="margin-top:26px" data-hide-local>Already running 1EYE at home? <a id="openeye" href="#" style="color:var(--ink);border-bottom:1px solid var(--line2)">Open my eye →</a></p>
    </div>
    <div data-r="2"><div class="mono" style="margin-bottom:12px">[ Download · free ]</div>{downloads("all")}</div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="sechead"><span class="lbl rule">In numbers</span><span class="mono">[ 04 / 04 ]</span></div>
  <div class="stats">
    <div data-r><b>04</b><span class="mono">Platforms + any browser</span></div>
    <div data-r="2"><b>00</b><span class="mono">Accounts, ads, trackers</span></div>
    <div data-r="3"><b>16MB</b><span class="mono">One file, no install</span></div>
    <div data-r="4"><b>MIT</b><span class="mono">Open source licence</span></div>
  </div>
</div></section>

<section id="faq" class="faq"><div class="wrap">
  <div class="sechead"><span class="lbl rule">Questions</span><a class="mono" href="{GH}" data-scramble>[ Source on GitHub ]</a></div>
  <div style="max-width:980px">{faq_html(FAQ)}</div>
</div></section>

<section id="join"><div class="wrap">
  <span class="lbl rule">Join</span>
  <h2 class="h-xl" style="margin-top:22px" data-r>Fork it.<br><span class="muted">Ship it.</span></h2>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:34px" data-r="2"><a class="btn primary" href="{GH}">Star on GitHub</a><a class="btn" href="{IG}">Follow on Instagram</a><a class="btn" id="sh-x" href="#">Share on X</a><a class="btn" id="sh-wa" href="#">WhatsApp</a></div>
  <div id="support" hidden style="margin-top:20px"><a class="btn" id="supportbtn" href="#">Support 1EYE · pay what you want</a></div>
  <p class="p-l muted" style="margin-top:46px;max-width:720px" data-r="3">“I built 1EYE because I needed it myself: one eye across every device I own, and nothing in between.” <span class="mono" style="display:block;margin-top:10px">— Balaj, founder</span></p>
</div></section>
</main>
'''
    p += footer()
    open(os.path.join(W, "index.html"), "w").write(p)

# ============================== PRODUCT PAGE ==============================
def product():
    url = SITE + "/data-transfer/"
    ld = {"@context": "https://schema.org", "@graph": [ORG_LD, APP_LD, faq_ld(FAQ[1:7]),
          {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "1EYE", "item": SITE + "/"}, {"@type": "ListItem", "position": 2, "name": "Telepathic Data Transfer", "item": url}]}]}
    p = head("Telepathic Data Transfer — AirDrop for Windows, Android, Mac & Linux · Free · 1EYE",
             "Send files, photos, chat and links between your phone and PC over Wi-Fi or from anywhere. Free and open source. No account, no cable, no cloud. Windows, Android, macOS, Linux.",
             url, ld)
    p += header()
    feats = [("Files of any size", "Drag, drop or paste. Files stream straight to disk in full quality with live speed. Preview photos, video, audio and PDFs."),
             ("Wi-Fi or anywhere", "Instant on your home network, even without internet. One click gives your computer a private https link, or use your own domain."),
             ("Private chat", "A live channel between your own devices for codes, notes and addresses."),
             ("Links shelf", "Paste a link on your phone and open it on your computer in one tap."),
             ("PIN-locked", "A 6-digit PIN decides who connects. Disconnect any device instantly."),
             ("Free cloud", "Connect Google Drive or WebDAV storage. Public links that work when your computer is off."),
             ("1EYE AI", "Ask about your files, chat and links, or type @eye in chat. Runs on your own free Groq key."),
             ("Phone as a server", "The Android app can host too. Share straight from Gallery into 1EYE."),
             ("Eye ID", "Unlock with your face instead of the PIN. Look, blink, you're in. Face data stays on your computer, never a photo.")]
    cards = "".join(f'<div class="card" data-r="{i % 3 + 1}"><span class="mono">{i + 1:02d}</span><h3>{esc(t)}</h3><p>{esc(d)}</p></div>' for i, (t, d) in enumerate(feats))
    steps = [("Open 1EYE", "Double-click on Windows, Mac or Linux, or tap the app on Android. It shows a QR code and a PIN."),
             ("Scan the eye", "Point any phone camera at the QR code, enter the PIN and name the device."),
             ("Send anything", "Files, text and links show up on every linked device at once. Press Go online when you're away.")]
    stp = "".join(f'<div class="card" data-r="{i + 1}"><span class="mono">Step {i + 1:02d}</span><h3>{esc(t)}</h3><p>{esc(d)}</p></div>' for i, (t, d) in enumerate(steps))
    gl = "".join(f'<a class="card" href="/guides/{g["slug"]}.html" data-r="{i % 3 + 1}"><span class="mono">Guide {i + 1:02d}</span><h3>{esc(g["h1"])}</h3></a>' for i, g in enumerate(guides_data.G))
    p += f'''<main>
<section class="hero" aria-label="Telepathic Data Transfer">
  <div class="eyewrap" style="width:min(70vh,70svh,86vw)">
    <canvas id="eye" data-zoom=".7" aria-hidden="true"></canvas>
    <div class="vf" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <span class="readout ro1">[ Project 001 ]</span><span class="readout ro2">[ v1.9 · Live ]</span><span class="readout ro3" id="ro-gaze">Gaze +0.00 / +0.00</span><span class="readout ro4" id="ro-pupil">Pupil 2.8 mm</span>
  </div>
  <h1 class="ttl">Drop<br>anything.<br><span class="muted">It just<br>arrives.</span></h1>
  <div class="copy" data-r><span class="lbl rule">Telepathic Data Transfer</span><p>AirDrop for Windows, Android, Mac and Linux. Files, photos, chat and links between your phone and computer, over Wi-Fi or from anywhere. Free, open source, no account.</p></div>
  <div class="side" data-r="2"><a class="mono" href="#download" data-scramble>[ Download free ]</a></div>
</section>

<section id="get"><div class="wrap">
  <div class="sechead"><span class="lbl rule">Download</span><span class="mono">[ Free · MIT ]</span></div>
  <div class="spot">
    <div><h2 class="h-l" data-r>One file.<br><span class="muted">Every device.</span></h2>
      <p class="p-l" style="margin-top:24px;max-width:520px" data-r="2">Nothing to install on Windows, Mac or Linux. Android gets a small app that can host too. iPhone uses Safari.</p></div>
    <div data-r="2">{downloads()}</div>
  </div>
</div></section>

<section id="features"><div class="wrap">
  <div class="sechead"><div><span class="lbl rule">Features</span><h2 class="h-l" style="margin-top:18px" data-r>Everything you keep<br><span class="muted">sending yourself.</span></h2></div></div>
  <div class="cards">{cards}</div>
</div></section>

<section id="how"><div class="wrap">
  <div class="sechead"><div><span class="lbl rule">How it works</span><h2 class="h-l" style="margin-top:18px" data-r>Ten seconds.</h2></div></div>
  <div class="cards">{stp}</div>
</div></section>

<section id="compare"><div class="wrap">
  <div class="sechead"><div><span class="lbl rule">Compare</span><h2 class="h-l" style="margin-top:18px" data-r>Still sending files<br><span class="muted">to yourself?</span></h2></div></div>
  <p class="p-l" style="max-width:640px;margin-bottom:28px">AirDrop only works between Apple devices. Here's how 1EYE compares with what most people use between a phone and a Windows PC.</p>
  <div class="table"><table>
    <tr><th></th><th class="me">1EYE</th><th>WhatsApp to yourself</th><th>Email to yourself</th><th>USB cable</th></tr>
    <tr><td>Full original quality</td><td class="me y">Yes</td><td class="m">Only as a document</td><td class="y">Yes</td><td class="y">Yes</td></tr>
    <tr><td>Big files (1 GB+)</td><td class="me y">Yes, no limit</td><td class="n">2 GB max</td><td class="n">About 25 MB</td><td class="y">Yes</td></tr>
    <tr><td>Works without internet</td><td class="me y">Yes, on Wi-Fi</td><td class="n">No</td><td class="n">No</td><td class="y">Yes</td></tr>
    <tr><td>Works from anywhere</td><td class="me y">Yes</td><td class="y">Yes</td><td class="y">Yes</td><td class="n">No</td></tr>
    <tr><td>Files stay off other companies' servers</td><td class="me y">Yes</td><td class="n">No</td><td class="n">No</td><td class="y">Yes</td></tr>
    <tr><td>Account needed</td><td class="me y">None</td><td class="n">Phone number</td><td class="n">Email account</td><td class="y">None</td></tr>
  </table></div>
</div></section>

<section id="guides"><div class="wrap">
  <div class="sechead"><div><span class="lbl rule">Guides</span><h2 class="h-l" style="margin-top:18px" data-r>Move anything,<br><span class="muted">anywhere.</span></h2></div><a class="mono" href="/guides/" data-scramble>[ All guides ]</a></div>
  <div class="cards">{gl}</div>
</div></section>

<section id="faq" class="faq"><div class="wrap">
  <div class="sechead"><span class="lbl rule">Questions</span></div>
  <div style="max-width:980px">{faq_html(FAQ[1:7])}</div>
</div></section>
</main>
'''
    p += footer()
    os.makedirs(os.path.join(W, "data-transfer"), exist_ok=True)
    open(os.path.join(W, "data-transfer", "index.html"), "w").write(p)

# ============================== GUIDES ==============================
def guides():
    G = guides_data.G
    for g in G:
        url = f'{SITE}/guides/{g["slug"]}.html'
        body = g["body"].replace('href="/#all"', 'href="/data-transfer/#download"').replace('href="/"', 'href="/data-transfer/"').replace('class="box glass"', 'class="box"')
        body = body.replace('<p class="lead">', '<p class="lead">', 1)
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "Article", "headline": g["h1"], "description": g["desc"], "datePublished": DATE, "dateModified": DATE, "author": {"@type": "Person", "name": "Balaj"},
             "publisher": {"@id": SITE + "/#org", "@type": "Organization", "name": "1EYE", "logo": {"@type": "ImageObject", "url": SITE + "/icon-512.png"}}, "image": SITE + "/og.png", "mainEntityOfPage": url},
            {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "1EYE", "item": SITE + "/"}, {"@type": "ListItem", "position": 2, "name": "Guides", "item": SITE + "/guides/"}, {"@type": "ListItem", "position": 3, "name": g["crumb"], "item": url}]}]}
        if g["faq"]: ld["@graph"].append(faq_ld(g["faq"]))
        rel = "".join(f'<a href="/guides/{o["slug"]}.html">{esc(o["h1"])}</a>' for o in G if o is not g)
        qa = "".join(f'<h3 style="margin-top:18px">{esc(q)}</h3><p>{esc(a)}</p>' for q, a in g["faq"])
        p = head(g["title"], g["desc"], url, ld, ogtype="article") + header()
        p += f'''<main class="wrap"><article class="article">
<nav class="crumbs"><a href="/">1EYE</a> / <a href="/guides/">Guides</a> / {esc(g["crumb"])}</nav>
<h1>{esc(g["h1"])}</h1>
<p class="crumbs">By Balaj · Updated 20 November 2026 · 3 min read</p>
{body}
<h2>Quick answers</h2>{qa}
<div class="box" style="text-align:center;padding:34px 24px"><p style="font-size:24px;color:var(--ink);letter-spacing:-.02em">Drop anything. It just arrives.</p><p class="mono">Free for Windows, Android, macOS and Linux · no account</p><p style="margin-top:18px"><a class="btn primary" href="/data-transfer/#download" style="border:0">Download free</a></p></div>
<h2>More guides</h2><div class="related">{rel}</div>
</article></main>'''
        p += footer()
        open(os.path.join(W, "guides", g["slug"] + ".html"), "w").write(p)
    url = SITE + "/guides/"
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "1EYE guides", "url": url, "hasPart": [{"@type": "Article", "headline": g["h1"], "url": f'{SITE}/guides/{g["slug"]}.html'} for g in G]}
    cards = "".join(f'<a class="card" href="/guides/{g["slug"]}.html" data-r="{i % 3 + 1}"><span class="mono">Guide {i + 1:02d}</span><h3>{esc(g["h1"])}</h3><p>{esc(g["desc"])}</p></a>' for i, g in enumerate(G))
    p = head("File Transfer Guides: Phone to PC, AirDrop for Windows and More · 1EYE", "Simple guides to move files between Android, iPhone, Windows, Mac and Linux: without cables, accounts or compression.", url, ld) + header()
    p += f'''<main><section style="padding-top:clamp(130px,16vw,200px)"><div class="wrap">
<div class="sechead"><div><span class="lbl rule">Guides</span><h1 class="h-l" style="margin-top:18px">Move anything,<br><span class="muted">anywhere.</span></h1></div><span class="mono">[ {len(G):02d} guides ]</span></div>
<div class="cards">{cards}</div></div></section></main>'''
    p += footer()
    open(os.path.join(W, "guides", "index.html"), "w").write(p)

if __name__ == "__main__":
    home(); product(); guides(); print("built")
