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
