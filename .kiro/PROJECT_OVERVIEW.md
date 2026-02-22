# WithSwag Project Overview

## What is WithSwag?

WithSwag is a monorepo containing multiple free online tools for creators, all served under the `withswag.org` domain.

## Current Tools

1. **Landing Page** (`/`)
   - Location: Root directory (`index.html`)
   - Shows all available tools with cards
   - SEO optimized with sitemap and meta tags

2. **SRT Subtitle Editor** (`/srt-editor/`)
   - Location: `/srt-editor/` directory
   - Static HTML/CSS/JS application
   - No build process required

3. **Passport Photo Creator** (`/portrait/`)
   - Location: `/EasyPortrait/` directory
   - React + TypeScript + Vite application
   - Requires build process
   - Built files go to `/EasyPortrait/dist/`

## Project Structure

```
withswag/
├── index.html              # Landing page
├── logo.png                # Site logo
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine directives
├── ads.txt                 # AdSense configuration
├── privacy.html            # Privacy policy
├── srt-editor/             # SRT tool (static)
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── EasyPortrait/           # Portrait tool (React app)
│   ├── src/                # Source code
│   ├── dist/               # Built files (generated)
│   ├── package.json
│   └── vite.config.ts
├── vercel.json             # Vercel routing configuration
└── .kiro/                  # Project documentation
    └── steering/
        ├── ADDING_NEW_TOOL.md
        └── DEPLOYMENT.md
```

## Technology Stack

- **Landing Page**: Static HTML/CSS
- **SRT Editor**: Vanilla JavaScript
- **Portrait Tool**: React 18, TypeScript, Vite, Tailwind CSS
- **Hosting**: Vercel
- **Domain**: withswag.org

## Key Files

- `vercel.json` - Controls routing for all tools
- `sitemap.xml` - SEO sitemap (update when adding tools)
- `index.html` - Landing page (add new tool cards here)

## Development Workflow

1. Make changes to any tool
2. If changing EasyPortrait: rebuild with `npm run build`
3. Commit and push to GitHub
4. Vercel auto-deploys

## Important Notes

- All tools must be accessible under `withswag.org` for SEO
- Each tool should have its own card on the landing page
- Update sitemap.xml when adding new tools
- EasyPortrait uses `/portrait/` as base path in routing
