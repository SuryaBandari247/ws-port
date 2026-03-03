# WithSwag — Passport Photo Maker Online

Online passport photo maker for 50+ countries. AI background removal, auto-crop to official dimensions, print-ready at 300 DPI.

**Live:** [withswag.org](https://withswag.org)

## What's Here

- `/portrait/` — Passport photo maker (React app, built from `EasyPortrait/`)
- `/guides/` — Country-specific photo requirement guides (static HTML)
- `index.html` — Landing page

## Tech Stack

- React 18 + TypeScript + Vite + Tailwind CSS (portrait tool)
- Static HTML/CSS (guides, landing page)
- Vercel (hosting, auto-deploy from main)

## Development

```bash
cd EasyPortrait
npm install
npm run dev
```

## Build & Deploy

```bash
cd EasyPortrait
npm run build    # outputs to ../portrait/
```

Commit the `portrait/` folder and push to main. Vercel auto-deploys.

## Domain

withswag.org — managed via Vercel.
