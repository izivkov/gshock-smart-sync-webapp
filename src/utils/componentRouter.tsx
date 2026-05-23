import React, { ComponentType, ReactNode } from 'react';

interface ComponentRegistryEntry {
  component: ComponentType<any>;
  exact?: boolean;
}

type ComponentRegistry = Record<string, ComponentRegistryEntry>;

let componentRegistry: ComponentRegistry = {};

/**
 * Register a component for a route path
 */
export const registerComponent = (path: string, component: ComponentType<any>, exact: boolean = false) => {
  componentRegistry[path] = { component, exact };
};

/**
 * Register multiple components at once
 */
export const registerComponents = (routes: Record<string, ComponentType<any>>) => {
  Object.entries(routes).forEach(([path, component]) => {
    registerComponent(path, component);
  });
};

/**
 * Get component for a pathname
 */
export const getComponent = (pathname: string): ComponentType<any> | null => {
  // Try exact match first
  if (componentRegistry[pathname]) {
    return componentRegistry[pathname].component;
  }

  // Try prefix match for nested routes
  const sortedPaths = Object.keys(componentRegistry).sort((a, b) => b.length - a.length);
  for (const path of sortedPaths) {
    if (pathname.startsWith(path)) {
      return componentRegistry[path].component;
    }
  }

  return null;
};

/**
 * Component renderer that displays the appropriate component based on pathname
 */
export const ComponentRouter: React.FC<{ pathname: string; fallback?: ReactNode }> = ({
  pathname,
  fallback,
}) => {
  const Component = getComponent(pathname);

  if (!Component) {
    return fallback ? <>{fallback}</> : <div>Page not found: {pathname}</div>;
  }

  return <Component />;
};

/**
 * Clear all registered components
 */
export const clearComponents = () => {
  componentRegistry = {};
};
