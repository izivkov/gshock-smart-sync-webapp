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
