import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface Router {
  pathname: string;
  push: (path: string) => void;
  query: Record<string, string | string[]>;
}

const RouterContext = createContext<Router | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState('/');
  const lastNavigationTime = useRef(0);

  const push = useCallback((path: string) => {
    const now = Date.now();
    // Guard: Prevent rapid-fire navigation (within 100ms) to the same path
    if (path === pathname || (now - lastNavigationTime.current < 100)) {
        return;
    }

    lastNavigationTime.current = now;
    setPathname(path);

    // Ping the server to ensure Nginx access logs record the navigation.
    // We use a relative path to avoid Mixed Content errors.
    if (window.location.protocol === 'https:') {
        fetch(path, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
    }
  }, [pathname]);

  const router: Router = {
    pathname,
    push,
    query: {},
  };

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
