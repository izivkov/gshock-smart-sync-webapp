import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider as MTThemeProvider } from "@material-tailwind/react";
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './components/MainLayout';
import { useRouter } from 'next/router';
import { useEffect, useState, createContext, useContext } from 'react';
import { connection } from '@api/Connection';

// Material 3 Design Tokens - Warm brown/peach theme matching the Android G-Shock app
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8B5E3C',           // warm brown
      light: '#B8896A',          // lighter warm brown
      dark: '#5C3A1E',           // deep brown
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7A5C44',
      light: '#A68B73',
      dark: '#4A3628',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5EDE4',        // warm linen — surface
      paper: '#FCEEE6',          // peach — surface-container
    },
    text: {
      primary: '#2D1A0E',        // on-surface
      secondary: '#7A5C44',      // on-surface-variant
    },
    divider: 'rgba(139, 94, 60, 0.15)',
    action: {
      hover: 'rgba(139, 94, 60, 0.08)',
      selected: 'rgba(139, 94, 60, 0.12)',
      focus: 'rgba(139, 94, 60, 0.12)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    // Material 3 Type Scale
    h1: { fontSize: '2.25rem', fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.01em' },
    h2: { fontSize: '1.75rem', fontWeight: 400, lineHeight: 1.3, letterSpacing: 0 },
    h3: { fontSize: '1.5rem', fontWeight: 400, lineHeight: 1.3, letterSpacing: 0 },
    h4: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.01em' },
    h5: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.01em' },
    h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.01em' },
    subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.01em' },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.01em' },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.03em' },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.03em' },
    button: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.75, letterSpacing: '0.03em', textTransform: 'none' as const },
    caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.03em' },
    overline: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 2, letterSpacing: '0.08em', textTransform: 'uppercase' as const },
  },
  shape: {
    borderRadius: 12, // M3 medium rounding
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100, // M3 full rounding for buttons
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 1px 3px rgba(139, 94, 60, 0.2)',
          },
        },
        outlined: {
          borderColor: 'rgba(139, 94, 60, 0.5)',
          color: '#8B5E3C',
          '&:hover': {
            background: 'rgba(139, 94, 60, 0.08)',
            borderColor: '#8B5E3C',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // M3 large rounding for cards
          boxShadow: '0 1px 2px rgba(139, 94, 60, 0.08)',
          background: '#FCEEE6',
          border: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#FCEEE6',
        },
        elevation1: {
          boxShadow: '0 1px 2px rgba(139, 94, 60, 0.08)',
        },
        elevation2: {
          boxShadow: '0 1px 3px rgba(139, 94, 60, 0.12)',
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
          borderTop: '1px solid rgba(139, 94, 60, 0.12)',
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
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            '&.Mui-selected': {
              fontSize: '0.75rem',
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 100, // M3 pill shape for nav items
          '&.Mui-selected': {
            backgroundColor: 'rgba(139, 94, 60, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(139, 94, 60, 0.16)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(139, 94, 60, 0.08)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FCEEE6',
          borderRight: '1px solid rgba(139, 94, 60, 0.12)',
        },
      },
    },
  },
});

// Create a context for connection status
export const ConnectionContext = createContext({
  isConnected: false,
  setIsConnected: (status: boolean) => {},
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Example: Replace with actual connection status logic
    const checkConnection = async () => {
      const connected = await fetchConnectionStatus(); // Replace with actual API or state
      setIsConnected(connected);

      const restrictedPaths = ['/time', '/alarms', '/events', '/settings'];
      if (!connected && restrictedPaths.includes(router.pathname)) {
        router.push('/');
      }
    };

    checkConnection();
  }, [router.pathname]);

  return (
    <ConnectionContext.Provider value={{ isConnected, setIsConnected }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <MTThemeProvider>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </MTThemeProvider>
      </MUIThemeProvider>
    </ConnectionContext.Provider>
  );
}

async function fetchConnectionStatus() {
  // Use the connection object to check if the watch is connected
  return connection.isConnected();
}
