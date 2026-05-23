# Vite SPA Router - Quick Reference

## Basic Usage

### Navigation
```typescript
import { useRouter } from '@/utils/router';

export function MyComponent() {
  const router = useRouter();
  
  // Navigate to a route
  const handleClick = () => {
    router.push('/settings');
  };
  
  return <button onClick={handleClick}>Go to Settings</button>;
}
```

### Getting Current Route
```typescript
const router = useRouter();
console.log(router.pathname); // e.g., "/time"
```

### Registering Routes
```typescript
// In src/main.tsx
import { registerComponents } from '@/utils/componentRouter';
import HomePage from '@pages/index.page';
import SettingsPage from '@pages/settings/Settings.page';

registerComponents({
  '/': HomePage,
  '/settings': SettingsPage,
  // ... more routes
});
```

## Route Structure

Routes can be:
- **Exact**: `/` matches only `/`
- **Prefix**: `/settings` matches `/settings`, `/settings/*`

## Limitations vs Next.js

❌ No dynamic routes like `[id].tsx`
❌ No nested layouts from file structure
❌ No API routes
❌ No server-side rendering
❌ No incremental static regeneration

✅ Simple to understand and modify
✅ Perfect for SPA applications
✅ No build complexity
✅ Fast dev server

## If You Need More Advanced Routing

Consider using `react-router-dom` instead:
```bash
npm install react-router-dom
```

Then replace `RouterProvider` with:
```typescript
import { BrowserRouter } from 'react-router-dom';
// And use Routes and Route components
```

This would give you dynamic routes, nested layouts, and more, but would require refactoring the app structure.

## Environment Variables

To use environment variables in Vite, prefix them with `VITE_`:

```javascript
// .env
VITE_API_URL=https://api.example.com

// In code
const apiUrl = import.meta.env.VITE_API_URL;
```

## TypeScript Path Aliases

Available in the app:
- `@/*` → `src/*`
- `@api/*` → `src/api/*`
- `@io/*` → `src/api/io/*`
- `@utils/*` → `src/api/utils/*` (API utilities)
- `@model/*` → `src/model/*`
- `@pages/*` → `src/pages/*`
- `@components/*` → `src/pages/components/*`

For general utilities in `src/utils/`, use `@/utils/*`

## CSS/Styling

MUI is already set up and working. For global styles:
- Edit `src/styles/globals.css`
- Import CSS files in components with `import './style.css'`
- Vite automatically processes SCSS/Sass/Less if installed

## Build Output

Production build creates optimized files in `dist/`:
- `dist/index.html` - Main HTML file
- `dist/assets/` - JavaScript, CSS, and image assets

Deploy the entire `dist/` folder to your hosting provider.

## Common Issues

**"Cannot find module X"**
- Check that the path alias exists in `vite.config.ts`
- Verify the file actually exists at that path
- Make sure file extensions are correct (no .tsx in imports)

**Styles not loading**
- Ensure Vite is running (`npm run dev`)
- Check browser console for CSS errors
- Verify file paths in CSS imports

**Blank page after build**
- Check if serving from wrong directory
- Ensure `index.html` is in root of dist folder
- Check network tab for failed requests
- Look at browser console for JavaScript errors

**Port already in use**
- Kill the process on port 3000: `kill -9 $(lsof -t -i:3000)`
- Or use different port: `npm run dev -- --port 3001`
