import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './components/MainLayout';
import { useRouter } from 'next/router';
import { useEffect, useState, createContext } from 'react';
import { connection } from '@api/Connection';
import { progressEvents, EventAction } from '@api/ProgressEvents';
import GShockAPI from '@/api/GShockAPI';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8B5E3C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7A5C44',
    },
    background: {
      default: '#F5EDE4',
      paper: '#FCEEE6',
    },
    text: {
      primary: '#2D1A0E',
      secondary: '#7A5C44',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 400 },
    h2: { fontSize: '1.75rem', fontWeight: 400 },
    h3: { fontSize: '1.5rem', fontWeight: 400 },
    h4: { fontSize: '1.25rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 400 },
    button: { textTransform: 'none' as const },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          textTransform: 'none' as const,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#FCEEE6',
          backgroundImage: 'none',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#8B5E3C',
            '& + .MuiSwitch-track': {
              backgroundColor: '#8B5E3C',
              opacity: 1,
            },
          },
        },
        track: {
          borderRadius: 100,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          background: '#FCEEE6',
          borderTop: '1px solid rgba(139, 94, 60, 0.15)',
          height: 80,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#7A5C44',
          minWidth: 0,
          padding: '8px 12px 12px',
          '&.Mui-selected': {
            color: '#8B5E3C',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FCEEE6',
          borderRight: '1px solid rgba(139, 94, 60, 0.15)',
        },
      },
    },
  },
});

// Create a context for connection status
export const ConnectionContext = createContext({
  isConnected: false,
  setIsConnected: (status: boolean) => { },
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  // Listen for connection events from the watch and try to auto-reconnect
  useEffect(() => {
    const connectionActions: EventAction[] = [
      { label: "Connected", action: () => setIsConnected(true) },
      { label: "Disconnected", action: () => setIsConnected(false) },
    ];

    progressEvents.runEventActions("AppRoot", connectionActions);
    return () => {
      progressEvents.stop("AppRoot");
    };
  }, []);

  // Route protection: redirect to home if visiting restricted paths while disconnected
  useEffect(() => {
    const restrictedPaths = ['/time', '/alarms', '/events', '/settings'];
    if (!isConnected && restrictedPaths.some(path => router.pathname.startsWith(path))) {
      router.push('/');
    }
  }, [isConnected, router]);

  return (
    <ConnectionContext.Provider value={{ isConnected, setIsConnected }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </MUIThemeProvider>
    </ConnectionContext.Provider>
  );
}