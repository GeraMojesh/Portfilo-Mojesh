# Gera Mojesh — Portfolio

A 3D, editorial-style personal portfolio for **Gera Mojesh** — AI Engineer, Web &
App Designer, Video Editor & Maker, cybersecurity researcher, and **Founder of
[Trigon Cyber-Tech](https://trigon-cyber-techno.netlify.app/)**.

Built as a zero-dependency static site (HTML + CSS + vanilla JS) with:

- Rotating 3D logo coin and mouse-driven tilt cards
- Parallax background layers
- YouTube video lightbox (client + personal work)
- Scroll reveals, animated counters, responsive layout

## Run locally

Any static server works. For example:

```bash
python -m http.server 5500
# then open http://localhost:5500
```

## Deploy on Render (free Static Site)

This repo includes a `render.yaml` blueprint, so deployment is automatic.

1. Push this folder to a GitHub repository.
2. Go to https://dashboard.render.com/ → **New** → **Static Site**
   (or **New** → **Blueprint** to use `render.yaml` directly).
3. Connect your GitHub account and select this repository.
4. Render auto-detects the settings:
   - **Build Command:** _(empty — no build step)_
   - **Publish Directory:** `.`
5. Click **Create Static Site**. The **Free** instance type is selected by default.

Every push to the connected branch will auto-deploy.
