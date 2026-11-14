# Vite Migration Guide

This document outlines the changes made to migrate from Next.js to Vite.

## Summary of Changes

### 1. Build System
- **Removed**: Next.js build system
- **Added**: Vite build system
- **Files Changed**: 
  - `vite.config.ts` - New Vite configuration
  - `package.json` - Updated build scripts and dependencies
  - `tsconfig.json` - Updated for Vite compatibility

### 2. Routing System
- **Removed**: Next.js file-based routing with `pages/` directory
- **Added**: Custom SPA router with component-based routing

#### New Router Files
- `src/utils/router.tsx` - React context-based router providing `useRouter()` hook
- `src/utils/componentRouter.tsx` - Component registry and dynamic component rendering

#### How the New Router Works
1. `RouterProvider` manages the current pathname in React context
2. Uses React state (`useState`) for route management
3. `registerComponents()` maps routes to React components
4. `ComponentRouter` component dynamically renders the appropriate component based on pathname
5. Navigation acts as a pure direct component replacement driven by state.

### 3. Application Entry Point
- **Removed**: Next.js `_app.page.tsx` and `_document.page.tsx`
- **Added**: 
  - `src/main.tsx` - Vite entry point
  - `index.html` - HTML entry point
  - `src/App.tsx` - Root React component (renamed from `_app.page.tsx`)

### 4. Component Updates
- **Removed**: All `"use client"` directives (not needed in Vite)
- **Updated Imports**:
  - `useRouter` now comes from `@/utils/router` instead of `next/navigation` or `next/router`
  - `ConnectionContext` imports updated to use `@/App` instead of relative paths

### 5. Page Structure
Pages have been updated to work as regular React components:
- `src/pages/index.page.tsx` - Home page
- `src/pages/time/Time.page.tsx` - Time/watch page
- `src/pages/alarms/Alarms.page.tsx` - Alarms page
- `src/pages/reminders/Reminders.page.tsx` - Reminders/Events page
- `src/pages/settings/Settings.page.tsx` - Settings page

### 6. Component Registration
In `src/main.tsx`, all routes are registered:

```typescript
registerComponents({
  '/': HomePage,
  '/time': TimePage,
  '/time/Time': TimePage,
  '/alarms': AlarmsPage,
  '/alarms/Alarms': AlarmsPage,
  '/reminders': RemindersPage,
  '/reminders/Reminders': RemindersPage,
  '/events': RemindersPage,
  '/settings': SettingsPage,
  '/settings/Settings': SettingsPage,
})
```

### 7. Files No Longer Needed
The following Next.js configuration files are no longer needed:
- `next.config.js` - Vite config replaces this
- `eslint.config.mts` - Can be simplified or removed
- `.next/` directory - Build output directory (now `dist/`)

## API and Services
All API files remain unchanged:
- `src/api/` - GShock API communication
- `src/model/` - Data models
- All services work the same way

## Development

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
This starts Vite dev server at `http://localhost:3000`

### Build for Production
```bash
npm run build
```
Output will be in `dist/` directory

### Preview Production Build
```bash
npm run preview
```

## URL Structure
The application uses state-based virtual paths for routing (URL remains static):
- Home: `/`
- Time: `/time`
- Alarms: `/alarms`
- Reminders: `/reminders`
- Settings: `/settings`

## Key Differences from Next.js

1. **No Server-Side Rendering**: This is now a pure SPA. There's no server-side rendering capability.
2. **Client-Side Only**: All rendering happens in the browser
3. **State-Based Routing**: Navigation doesn't change the browser URL; it relies on direct component replacement via state.
4. **No API Routes**: Next.js API routes (`pages/api/`) are not used. All API communication should be through the existing API services.
5. **Build Output**: Production build is in `dist/` instead of `.next/`

## Adding New Routes

To add a new route:

1. Create your page component in `src/pages/yourpage/`
2. Import it in `src/main.tsx`
3. Register it with `registerComponents()`:
   ```typescript
   '/yourpage': YourPageComponent,
   ```
4. The navigation will automatically route to it using `router.push('/yourpage')`

## Migration Notes

- The custom router is lightweight and doesn't support all Next.js routing features (like dynamic routes with `[id]`). If you need those features, consider using `react-router-dom` or similar instead.
- All ESM imports are used throughout
- TypeScript configuration uses Vite types
- Theme and styling (MUI) remain unchanged
