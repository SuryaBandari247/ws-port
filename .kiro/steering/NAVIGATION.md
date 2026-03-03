# WithSwag Navigation Standards

inclusion: manual

## Overview

WithSwag is focused on passport photos, visa photos, and immigration-related photo content. The site uses path-based routing with the portrait tool as the main app and static HTML guides for SEO content.

## Architecture

```
withswag.org/              → Landing page (passport photo focused)
withswag.org/portrait/     → EasyPortrait (React app)
withswag.org/guides/       → Photo requirement guides (static HTML)
```

## Shared App Registry

All navigation entries are registered in a single constant.

### TypeScript (React apps)

```typescript
// src/constants/apps.ts
export const WITHSWAG_APPS = [
  { name: 'Passport Photo', path: '/portrait/', icon: 'Camera', description: 'Passport & visa photos for 50+ countries' },
  { name: 'Photo Guides', path: '/guides/', icon: 'BookOpen', description: 'Country-specific photo requirements' },
];
```

### JavaScript (Static pages)

```javascript
const WITHSWAG_APPS = [
  { name: 'Passport Photo', path: '/portrait/', icon: 'camera', description: 'Passport & visa photos for 50+ countries' },
  { name: 'Photo Guides', path: '/guides/', icon: 'book-open', description: 'Country-specific photo requirements' },
];
```

---

## Required Navigation Components

Every tool must include all three:

1. **Home Button** — top-left corner
2. **App Switcher** — top-right corner
3. **Breadcrumbs** — below the top bar or integrated into the header

---

## 1. Home Button

Links to `/` (the tool hub). Uses the Lucide `Home` icon — no emoji.

### React (Tailwind CSS)

```tsx
import { Home } from 'lucide-react';

function HomeButton() {
  return (
    <a
      href="/"
      title="Back to WithSwag Home"
      className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 text-gray-700 hover:text-indigo-600 font-medium"
    >
      <Home size={20} />
      <span className="hidden sm:inline text-sm">Home</span>
    </a>
  );
}
```

### Static HTML/CSS

```html
<a href="/" class="ws-home-btn" title="Back to WithSwag Home">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </svg>
  <span>Home</span>
</a>
```

```css
.ws-home-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #374151;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.ws-home-btn:hover {
  color: #6366f1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.ws-home-btn span {
  display: none;
}

@media (min-width: 768px) {
  .ws-home-btn span {
    display: inline;
  }
}
```

---

## 2. App Switcher (9-dot Grid)

A floating button in the top-right corner using the Lucide `LayoutGrid` icon. Clicking it opens a dropdown/popover listing all tools from `WITHSWAG_APPS`. Clicking outside closes it.

On mobile (< 768px), the dropdown becomes a full-width bottom sheet.

### React (Tailwind CSS)

```tsx
import { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Camera, FileText, X } from 'lucide-react';
import { WITHSWAG_APPS } from '../constants/apps';

// Map icon names to Lucide components
const iconMap: Record<string, React.ElementType> = {
  Camera,
  FileText,
  // Add new icons here as tools are added
};

function AppSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div ref={ref} className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open app switcher"
        aria-expanded={open}
        className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 text-gray-700 hover:text-indigo-600"
      >
        {open ? <X size={20} /> : <LayoutGrid size={20} />}
      </button>

      {open && (
        <>
          {/* Desktop dropdown */}
          <div className="hidden md:block absolute top-12 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">WithSwag Tools</p>
            </div>
            <div className="p-2">
              {WITHSWAG_APPS.map((app) => {
                const Icon = iconMap[app.icon];
                return (
                  <a
                    key={app.path}
                    href={app.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors group"
                  >
                    {Icon && <Icon size={18} className="text-indigo-500 group-hover:text-indigo-600" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{app.name}</p>
                      <p className="text-xs text-gray-500">{app.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Mobile bottom sheet */}
          <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)}>
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl animate-in slide-in-from-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="text-base font-semibold text-gray-900">WithSwag Tools</p>
                <button onClick={() => setOpen(false)} aria-label="Close app switcher">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="p-3 pb-8">
                {WITHSWAG_APPS.map((app) => {
                  const Icon = iconMap[app.icon];
                  return (
                    <a
                      key={app.path}
                      href={app.path}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      {Icon && <Icon size={20} className="text-indigo-500" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{app.name}</p>
                        <p className="text-xs text-gray-500">{app.description}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AppSwitcher;
```

### Static HTML/CSS/JS

```html
<div class="ws-app-switcher" id="appSwitcher">
  <button class="ws-app-switcher-btn" id="appSwitcherBtn" aria-label="Open app switcher" aria-expanded="false">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
      <rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>
    </svg>
  </button>
  <div class="ws-app-switcher-dropdown" id="appSwitcherDropdown" hidden>
    <div class="ws-app-switcher-header">WithSwag Tools</div>
    <div class="ws-app-switcher-list" id="appSwitcherList">
      <!-- Populated by JS from WITHSWAG_APPS -->
    </div>
  </div>
</div>
```

```css
.ws-app-switcher {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
}

.ws-app-switcher-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.ws-app-switcher-btn:hover {
  color: #6366f1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.ws-app-switcher-dropdown {
  position: absolute;
  top: 48px;
  right: 0;
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  animation: ws-dropdown-in 0.15s ease-out;
}

@keyframes ws-dropdown-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.ws-app-switcher-header {
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
}

.ws-app-switcher-list {
  padding: 8px;
}

.ws-app-switcher-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #111827;
  font-family: 'Inter', sans-serif;
  transition: background 0.15s;
}

.ws-app-switcher-item:hover {
  background: #eef2ff;
}

.ws-app-switcher-item-icon {
  color: #6366f1;
  flex-shrink: 0;
}

.ws-app-switcher-item-name {
  font-size: 14px;
  font-weight: 500;
}

.ws-app-switcher-item-desc {
  font-size: 12px;
  color: #6b7280;
}

/* Mobile: bottom sheet */
@media (max-width: 767px) {
  .ws-app-switcher-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 16px 16px 0 0;
    animation: ws-sheet-in 0.2s ease-out;
  }

  @keyframes ws-sheet-in {
    from { opacity: 0; transform: translateY(100%); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ws-app-switcher-list {
    padding: 8px 12px 24px;
  }

  .ws-app-switcher-item {
    padding: 12px;
  }
}
```

```javascript
// App Switcher logic
(function () {
  const btn = document.getElementById('appSwitcherBtn');
  const dropdown = document.getElementById('appSwitcherDropdown');
  const list = document.getElementById('appSwitcherList');

  // Render app list
  WITHSWAG_APPS.forEach(function (app) {
    const a = document.createElement('a');
    a.href = app.path;
    a.className = 'ws-app-switcher-item';
    a.innerHTML =
      '<div class="ws-app-switcher-item-icon">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>' +
      '</div>' +
      '<div>' +
        '<div class="ws-app-switcher-item-name">' + app.name + '</div>' +
        '<div class="ws-app-switcher-item-desc">' + app.description + '</div>' +
      '</div>';
    list.appendChild(a);
  });

  // Toggle
  btn.addEventListener('click', function () {
    const isOpen = !dropdown.hidden;
    dropdown.hidden = isOpen;
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  // Close on outside click
  document.addEventListener('mousedown', function (e) {
    if (!document.getElementById('appSwitcher').contains(e.target)) {
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      dropdown.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
```

---

## 3. Breadcrumb Navigation

Shows the user's current location: `WithSwag > Tool Name > Current Step`.

Uses the Lucide `ChevronRight` icon as separator.

### React (Tailwind CSS)

```tsx
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  toolName: string;
  currentStep?: string;
}

function Breadcrumbs({ toolName, currentStep }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 font-medium px-4 py-2">
      <a href="/" className="hover:text-indigo-600 transition-colors">WithSwag</a>
      <ChevronRight size={14} className="text-gray-400" />
      <span className={currentStep ? 'hover:text-indigo-600 transition-colors cursor-pointer' : 'text-gray-900'}>
        {toolName}
      </span>
      {currentStep && (
        <>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-900">{currentStep}</span>
        </>
      )}
    </nav>
  );
}
```

### Static HTML/CSS

```html
<nav class="ws-breadcrumbs" aria-label="Breadcrumb">
  <a href="/" class="ws-breadcrumb-link">WithSwag</a>
  <svg class="ws-breadcrumb-sep" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
  <span class="ws-breadcrumb-current">Tool Name</span>
</nav>
```

```css
.ws-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6b7280;
}

.ws-breadcrumb-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.ws-breadcrumb-link:hover {
  color: #6366f1;
}

.ws-breadcrumb-sep {
  color: #9ca3af;
  flex-shrink: 0;
}

.ws-breadcrumb-current {
  color: #111827;
  font-weight: 500;
}
```

---

## Design System Compliance

All navigation components must follow the WithSwag design system:

| Property         | Value                                    |
|------------------|------------------------------------------|
| Primary color    | `#6366f1` (Indigo)                       |
| Font family      | `'Inter', -apple-system, sans-serif`     |
| Border radius    | `8px` (buttons), `12px` (dropdowns)      |
| Shadow (small)   | `0 2px 8px rgba(0,0,0,0.1)`             |
| Shadow (large)   | `0 12px 40px rgba(0,0,0,0.2)`           |
| Transition       | `all 0.2s`                               |
| Backdrop blur    | `blur(8px)` on floating elements         |
| Mobile breakpoint| `768px`                                  |

---

## Adding a New Tool to Navigation

When you add a new tool to WithSwag:

1. Add an entry to `WITHSWAG_APPS` in the shared registry constant.
2. If using React, add the corresponding Lucide icon import to the `iconMap` in `AppSwitcher`.
3. The home button and breadcrumbs require no changes — they're tool-specific by nature.
4. That's it. The app switcher picks up the new entry automatically.

---

## Accessibility Requirements

- All buttons must have `aria-label` attributes.
- The app switcher button must toggle `aria-expanded`.
- Breadcrumbs must use `<nav aria-label="Breadcrumb">`.
- Dropdown must close on `Escape` key press.
- All interactive elements must have visible focus states.
- Touch targets must be at least 44×44px on mobile.
