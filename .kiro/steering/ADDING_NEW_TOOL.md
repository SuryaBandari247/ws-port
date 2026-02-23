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

## UI/UX Guidelines

### Navigation (Required)

Every tool MUST implement the standard WithSwag navigation components. See `.kiro/steering/NAVIGATION.md` for full details.

Required components:
1. **Home Button** (top-left) — Lucide `Home` icon, links to `/`
2. **App Switcher** (top-right) — Lucide `LayoutGrid` icon, dropdown with all tools
3. **Breadcrumbs** — `WithSwag > Tool Name > Current Step`

When adding a new tool, also update the `WITHSWAG_APPS` constant in the shared registry.

### Color Palette & Design System

All tools should follow the WithSwag design system for consistency:

#### Primary Colors
- **Primary**: `#6366f1` (Indigo) - Main brand color
- **Primary Hover**: `#4f46e5` (Darker indigo)
- **Secondary**: `#8b5cf6` (Purple)
- **Accent**: `#d946ef` (Pink)

#### Background Colors
- **Light Background**: `#f8f9fa` or `#f3f4f6`
- **White**: `#ffffff`
- **Gradient**: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)`

#### Text Colors
- **Primary Text**: `#1a1a1a` or `#111827`
- **Secondary Text**: `#666666` or `#6b7280`
- **Light Text**: `#9ca3af`

#### UI Elements
- **Border Radius**: `8px` for buttons, `16px` for cards
- **Shadows**: 
  - Small: `0 2px 8px rgba(0,0,0,0.1)`
  - Medium: `0 4px 16px rgba(0,0,0,0.15)`
  - Large: `0 12px 40px rgba(0,0,0,0.25)`
- **Transitions**: `all 0.2s` or `all 0.3s ease`

#### Typography
- **Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Headings**: Bold (700), sizes: 48px (h1), 32px (h2), 24px (h3)
- **Body**: Regular (400), 16px
- **Small**: 14px

#### Buttons
```css
/* Primary Button */
.action-btn {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.6);
}

/* Secondary Button */
.secondary-btn {
    background: white;
    color: #6366f1;
    border: 2px solid #6366f1;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
}

.secondary-btn:hover {
    background: #6366f1;
    color: white;
}
```

#### Cards
```css
.tool-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    transition: transform 0.2s, box-shadow 0.2s;
}

.tool-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.25);
}
```

### Responsive Design

All tools must be mobile-responsive:
- Use `max-width: 768px` for mobile breakpoint
- Stack elements vertically on mobile
- Adjust font sizes and padding for smaller screens
- Ensure touch targets are at least 44x44px

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure sufficient color contrast (WCAG AA minimum)
- Support keyboard navigation
- Include focus states for interactive elements

### Example Implementation

See existing tools for reference:
- **SRT Editor**: Static HTML/CSS with gradient background
- **EasyPortrait**: React app with Tailwind CSS

Both follow the design system and include home buttons.
