# Joko Production

Personal site for Artem Koshevarov — cinematographer & photographer based in Charlotte, NC.

Static HTML/CSS/JS. No build step. Deploy anywhere that serves static files.

---

## Run locally

From the project root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or use any other static server (`npx serve`, `php -S localhost:8000`, etc).

> **Note:** opening `index.html` directly with `file://` will work, but autoplay video and some browser features behave better over `http://`. Use the local server.

---

## Project structure

```
.
├── index.html              # Markup (sections: hero, work, about, services, contact)
├── assets/
│   ├── css/style.css       # All styles. Custom-property driven.
│   ├── js/main.js          # Lenis smooth scroll, hover-preview, cursor, timecode
│   ├── favicon.svg
│   └── media/              # Drop real video/photo assets here (see below)
└── README.md
```

---

## Replacing the placeholder media

All placeholder videos currently come from **Coverr** (free CC0 stock). To swap in Artem's own footage, do this:

### 1. Hero loop (the autoplay full-screen video)

Encode the showreel to two MP4 files:

| File                          | Specs                                                    |
|-------------------------------|----------------------------------------------------------|
| `assets/media/hero.mp4`       | 1920×1080 (or 2560×1440), H.264, 24fps, no audio, 8–15s, ~3–5 MB |
| `assets/media/hero-mobile.mp4`| 1080×1920 portrait, H.264, 24fps, no audio, 8–15s, ~1 MB |
| `assets/media/hero-poster.jpg`| First-frame poster, 1920×1080, ~150 KB                    |

Quick ffmpeg recipe:

```bash
ffmpeg -i source.mov -vf "scale=1920:1080,fps=24" -c:v libx264 -preset slow \
       -crf 24 -an -movflags +faststart -t 12 assets/media/hero.mp4
```

Once `assets/media/hero.mp4` exists it will be loaded **before** the Coverr fallback — no other changes needed.

### 2. Work-preview clips (8 short loops, ~3–5 s each)

The work list uses `data-poster` attributes on each `<li class="work-item">` to point at the video that swaps into the preview pane on hover. Replace each URL with a local path:

```html
<li class="work-item" data-poster="assets/media/work/01-northbound.mp4" ...>
```

Recommend 720p, no audio, ~1–2 MB per clip. Same ffmpeg command as above with `scale=1280:720`.

### 3. About portrait

In `index.html`, swap the Unsplash URL inside `.about__portrait img` with a local path like `assets/media/portrait.jpg`. Aspect ratio 4:5.

### 4. Open Graph image

Save a 1200×630 hero still to `assets/media/og.jpg` (referenced in `<meta property="og:image">`).

---

## Editing the copy

All text lives in `index.html`. Common edits:

- **Project list:** edit each `<li class="work-item">` — title, client, category, year, and the `data-poster` URL.
- **About paragraphs:** inside `.about__copy`.
- **Stats:** inside `<ul class="stats">`.
- **Email / phone / socials:** inside `.contact__cols`.
- **Domain in email link:** find `hello@jokoproduction.com` and replace.

---

## Tweaking the design

Open `assets/css/style.css` — all colors, fonts, and spacing are defined as CSS custom properties at the top of the file:

```css
:root {
  --bg: #000000;            /* page background */
  --fg: #e8e2d4;            /* warm cream text */
  --accent: #e8e2d4;
  --red: #ff3838;           /* REC dot */
  --f-sans: "Geist", ...;
  --f-serif: "Instrument Serif", ...;
}
```

Change any of those and the whole site updates.

---

## Deployment

Any static host works. Recommended (free, fast, with HTTPS):

### Vercel (drag & drop)

1. Go to <https://vercel.com/new>
2. Drag the project folder onto the page
3. Done — you get a `*.vercel.app` URL within 30 seconds

### Netlify (drag & drop)

1. Sign in at <https://app.netlify.com/drop>
2. Drag the project folder onto the drop zone
3. Done

### GitHub Pages

1. Push the repo to GitHub
2. Settings → Pages → Source: `main` branch, `/` (root)
3. Site goes live at `https://<user>.github.io/<repo>/`

### Custom domain

After deploying, point `jokoproduction.com` (or whatever Artem buys) at the host's DNS targets — both Vercel and Netlify make this two clicks.

---

## Browser support

Tested in current Safari, Chrome, Firefox, and Edge. Mobile Safari/Chrome supported.

- Smooth scroll requires Lenis (loaded from jsDelivr CDN). Falls back to native scroll if blocked.
- Custom cursor is suppressed on touch devices.
- Honors `prefers-reduced-motion`.

---

## Credits

- Type: [Geist](https://fonts.google.com/specimen/Geist), [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (Google Fonts)
- Smooth scroll: [Lenis](https://github.com/studio-freight/lenis)
- Placeholder video: [Coverr](https://coverr.co) (CC0)
- Placeholder photography: [Unsplash](https://unsplash.com)
