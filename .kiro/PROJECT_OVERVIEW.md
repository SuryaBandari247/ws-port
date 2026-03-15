# WithSwag Project Overview

## What is WithSwag?

WithSwag is an online passport photo tool focused on passport photos, visa photos, and immigration-related photo content. All served under `withswag.org`.

## Site Structure

1. **Landing Page** (`/`) — Photo-focused landing page with country guides and CTA
2. **Passport Photo Tool** (`/portrait/`) — React app for creating passport/visa photos
3. **Photo Guides** (`/guides/`) — Static HTML guides for 50+ countries and visa types

## Project Structure

```
withswag/
├── index.html              # Landing page (photo-focused)
├── logo.png                # Site logo
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine directives
├── ads.txt                 # AdSense configuration
├── about.html              # About page
├── contact.html            # Contact page
├── privacy.html            # Privacy policy
├── vercel.json             # Vercel routing configuration
├── guides/                 # Photo requirement guides (static HTML)
│   ├── index.html          # Guides hub
│   ├── styles.css          # Shared guide styles
│   └── */index.html        # Individual country/visa guides
├── EasyPortrait/           # Portrait tool source (React app)
│   ├── src/                # Source code
│   ├── package.json
│   └── vite.config.ts
├── portrait/               # Built portrait app (committed, deployed)
└── .kiro/                  # Project config & steering
    └── steering/
```

## Technology Stack

- **Portrait Tool**: React 18, TypeScript, Vite, Tailwind CSS
- **Guides & Landing**: Static HTML/CSS
- **Hosting**: Vercel (auto-deploy from main)
- **Domain**: withswag.org
- **Ads**: Google AdSense Auto Ads (not on /portrait/)

## Development Workflow

1. Edit source files in `EasyPortrait/src/`
2. Build: `cd EasyPortrait && npm run build` (outputs to `../portrait/`)
3. Commit both source AND `portrait/` folder
4. Push to main — Vercel auto-deploys

## Key Rules

- Site focus: passport photos + visa/immigration photos ONLY
- Single photo price: €3, collage: $8
- No AdSense on the portrait React app
- Amazon affiliate tag: `withswag-20`
- AdSense publisher: `ca-pub-8351430872646121`
- Build outputs to `portrait/` at repo root (not `dist/`)
