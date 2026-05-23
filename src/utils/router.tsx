import React, { createContext, useContext, useState, useCallback } from 'react';

interface Router {
  pathname: string;
  push: (path: string) => void;
  query: Record<string, string | string[]>;
}

const RouterContext = createContext<Router | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState('/');

  const push = useCallback((path: string) => {
    setPathname(path);
    // Update browser history for back/forward support
    window.history.pushState({ path }, '', `#${path}`);
  }, []);

  // Handle browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.hash.slice(1) || '/';
      setPathname(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize from URL hash
  React.useEffect(() => {
    const initialPath = window.location.hash.slice(1) || '/';
    setPathname(initialPath);
  }, []);

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
