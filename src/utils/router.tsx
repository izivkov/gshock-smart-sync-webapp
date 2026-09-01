import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

interface Router {
  pathname: string;
  push: (path: string) => void;
  query: Record<string, string | string[]>;
}

const RouterContext = createContext<Router | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState('/');
  const lastNavigationTime = useRef(0);
  const pathnameRef = useRef(pathname);

  // Keep ref in sync
  pathnameRef.current = pathname;

  const push = useCallback((path: string) => {
    const now = Date.now();
    // Guard: Prevent rapid-fire navigation (within 100ms) or redundant navigation
    if (path === pathnameRef.current || (now - lastNavigationTime.current < 100)) {
        return;
    }

    lastNavigationTime.current = now;
    setPathname(path);
    pathnameRef.current = path; // Sync ref immediately for subsequent guard calls

    // Ping the server to ensure Nginx access logs record the navigation.
    // We use a relative path to avoid Mixed Content errors.
    // Only fetch if on a non-local environment to avoid confusion during dev.
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Use a cache-busting query param to ensure it hits the server
        fetch(`${path}${path.includes('?') ? '&' : '?'}_t=${now}`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
    }
  }, []); // Stable push function

  const router = useMemo(() => ({
    pathname,
    push,
    query: {},
  }), [pathname, push]);

  return (
    <RouterContext.Provider value={router}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return router;
};
