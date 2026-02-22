#!/bin/bash

cd /Users/taabasu5/parasmile/withswag

# Create .kiro directory
mkdir -p .kiro/steering

# Create main project documentation
cat > .kiro/PROJECT_OVERVIEW.md << 'EOF'
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
EOF

# Create guide for adding new tools
cat > .kiro/steering/ADDING_NEW_TOOL.md << 'EOF'
# Adding a New Tool to WithSwag

Follow these steps to add a new tool to the WithSwag platform.

## Step 1: Decide Tool Type

### Option A: Static Tool (like SRT Editor)
- Simple HTML/CSS/JS
- No build process
- Fast to develop

### Option B: React App (like Portrait Tool)
- Complex functionality
- Modern UI with React
- Requires build process

## Step 2: Add Tool to Project

### For Static Tool:

1. Create a new directory in root:
```bash
mkdir my-new-tool
cd my-new-tool
```

2. Create your tool files:
```bash
touch index.html
touch app.js
touch styles.css
```

3. Develop your tool in these files

### For React App:

1. Create React app in a subdirectory:
```bash
mkdir MyNewTool
cd MyNewTool
npm create vite@latest . -- --template react-ts
npm install
```

2. Configure base path in `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/my-tool/',  // Important for routing!
  // ... rest of config
});
```

3. Configure basename in `App.tsx`:
```typescript
<Router basename="/my-tool">
  {/* routes */}
</Router>
```

4. Build the app:
```bash
npm run build
```

## Step 3: Update Landing Page

Edit `index.html` and add a new tool card:

```html
<a href="/my-tool/" class="tool-card">
    <div class="tool-icon">🎨</div>
    <h2>My New Tool</h2>
    <p>Description of what your tool does.</p>
    <span class="badge">FREE</span>
</a>
```

## Step 4: Update Vercel Routing

Edit `vercel.json` and add routing rules:

### For Static Tool:
```json
{
  "src": "/my-tool/(.*)",
  "dest": "/my-tool/$1"
},
{
  "src": "/my-tool",
  "dest": "/my-tool/index.html"
}
```

### For React App:
```json
{
  "src": "/my-tool/(.*)",
  "dest": "/MyNewTool/dist/$1"
},
{
  "src": "/my-tool",
  "dest": "/MyNewTool/dist/index.html"
}
```

Add these BEFORE the catch-all route `"src": "/(.*)"`.

If it's a React app, also update the build command:
```json
{
  "buildCommand": "cd EasyPortrait && npm install && npm run build && cd ../MyNewTool && npm install && npm run build"
}
```

## Step 5: Update SEO Files

### Update `sitemap.xml`:
```xml
<url>
  <loc>https://withswag.org/my-tool/</loc>
  <lastmod>2026-02-22</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
```

### Update meta tags in `index.html`:
```html
<meta name="description" content="Free online tools for creators. SRT editor, passport photos, my new tool, and more.">
<meta name="keywords" content="free tools, srt editor, passport photo, my tool, online tools">
```

## Step 6: Test Locally (Optional)

For React apps:
```bash
cd MyNewTool
npm run dev
```

Note: The base path won't work in dev mode, but will work in production.

## Step 7: Deploy

```bash
git add .
git commit -m "Add new tool: My New Tool"
git push origin main
```

Vercel will automatically deploy.

## Step 8: Test Production

After deployment, test:
- `https://withswag.org/` - Check new card appears
- `https://withswag.org/my-tool/` - Check tool works
- All navigation and links work correctly

## Checklist

- [ ] Tool created and working
- [ ] Landing page card added
- [ ] vercel.json routing updated
- [ ] sitemap.xml updated
- [ ] Meta tags updated
- [ ] Committed and pushed
- [ ] Tested in production
- [ ] All links work correctly

## Common Issues

### Tool shows 404
- Check vercel.json routing order
- Ensure route is BEFORE the catch-all `"src": "/(.*)"` route

### React app assets not loading
- Verify `base: '/my-tool/'` in vite.config.ts
- Verify `basename="/my-tool"` in Router
- Rebuild the app

### Build fails on Vercel
- Check buildCommand includes your new tool
- Ensure package.json exists for React apps
- Check build logs for specific errors
EOF

# Create deployment guide
cat > .kiro/steering/DEPLOYMENT.md << 'EOF'
# WithSwag Deployment Guide

## Current Setup

- **Repository**: github.com/SuryaBandari247/WithSwag
- **Hosting**: Vercel
- **Domain**: withswag.org
- **Branch**: main (auto-deploys)

## Deployment Process

### Automatic Deployment

Every push to `main` branch triggers automatic deployment:

1. Push changes to GitHub
2. Vercel detects the push
3. Runs build command (builds React apps)
4. Deploys to production
5. Available at withswag.org in ~2 minutes

### Manual Deployment

If needed, you can manually deploy:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /path/to/withswag
vercel --prod
```

## Build Process

Vercel runs this build command (from `vercel.json`):
```bash
cd EasyPortrait && npm install && npm run build
```

This:
1. Installs EasyPortrait dependencies
2. Builds EasyPortrait to `EasyPortrait/dist/`
3. Static files are served from root

## Routing Configuration

All routing is controlled by `vercel.json`:

- `/` → `index.html` (landing page)
- `/srt-editor/` → `srt-editor/` directory
- `/portrait/` → `EasyPortrait/dist/` directory
- Static files (images, CSS, etc.) → root directory

## Updating Tools

### Static Tools (SRT Editor)
1. Edit files directly
2. Commit and push
3. No build needed

### React Apps (Portrait Tool)
1. Edit source files in `src/`
2. Build locally: `npm run build`
3. Commit both source AND dist files
4. Push to GitHub

**Important**: Always commit the `dist/` folder for React apps!

## Domain Configuration

Domain is configured in Vercel dashboard:
- Project: WithSwag
- Domain: withswag.org
- DNS: Managed by domain registrar, points to Vercel

## Monitoring

Check deployment status:
- Vercel Dashboard: https://vercel.com/dashboard
- Build logs available for each deployment
- Runtime logs for debugging

## Rollback

If a deployment breaks:

1. Go to Vercel dashboard
2. Find previous working deployment
3. Click "Promote to Production"

Or rollback via git:
```bash
git revert HEAD
git push origin main
```

## Environment Variables

Currently none needed. If you add backend features:
1. Add in Vercel dashboard
2. Settings → Environment Variables
3. Redeploy to apply

## Performance

- Static files cached by Vercel CDN
- React apps code-split for fast loading
- Images should be optimized before committing

## Troubleshooting

### Deployment fails
- Check build logs in Vercel
- Verify buildCommand in vercel.json
- Ensure all dependencies in package.json

### 404 errors
- Check vercel.json routing
- Verify file paths are correct
- Check route order (specific before general)

### Assets not loading
- Check browser console for errors
- Verify base paths in React apps
- Check vercel.json routes

## Best Practices

1. Test locally before pushing
2. Always commit dist/ folders for React apps
3. Update sitemap.xml when adding tools
4. Keep vercel.json routing organized
5. Monitor Vercel dashboard after deployments
EOF

# Create README for the .kiro directory
cat > .kiro/README.md << 'EOF'
# WithSwag Project Documentation

This directory contains comprehensive documentation for the WithSwag project.

## Files

- `PROJECT_OVERVIEW.md` - High-level project structure and overview
- `steering/ADDING_NEW_TOOL.md` - Step-by-step guide for adding new tools
- `steering/DEPLOYMENT.md` - Deployment process and troubleshooting

## Quick Links

- **Adding a new tool?** → Read `steering/ADDING_NEW_TOOL.md`
- **Deployment issues?** → Read `steering/DEPLOYMENT.md`
- **Understanding the project?** → Read `PROJECT_OVERVIEW.md`

## For AI Assistants

When helping with this project:
1. Read PROJECT_OVERVIEW.md first to understand structure
2. Follow ADDING_NEW_TOOL.md when adding features
3. Reference DEPLOYMENT.md for deployment questions
4. Always maintain the monorepo structure
5. Keep all tools under withswag.org domain for SEO
EOF

# Commit the documentation
git add .kiro/
git commit -m "Add comprehensive project documentation in .kiro directory"
git push origin main

echo ""
echo "✅ Documentation created in .kiro directory!"
echo ""
echo "Files created:"
echo "  - .kiro/PROJECT_OVERVIEW.md"
echo "  - .kiro/steering/ADDING_NEW_TOOL.md"
echo "  - .kiro/steering/DEPLOYMENT.md"
echo "  - .kiro/README.md"
echo ""
echo "These files will help you (and AI assistants) understand and maintain the project!"
