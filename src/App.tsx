import "@/styles/globals.css";

import { ThemeProvider as MUIThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from '@components/MainLayout';
import { useRouter } from '@/utils/router';
import { useEffect, useState, createContext, Suspense } from 'react';
import { connection } from '@api/Connection';
import { progressEvents, EventAction } from '@api/ProgressEvents';
import { watchInfo } from '@api/WatchInfo';
import GShockAPI from '@/api/GShockAPI';
import { ComponentRouter } from '@/utils/componentRouter';
import { PhoneFinder } from '@pages/home/PhoneFinder';

let theme = createTheme({
  cssVariables: true,
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
    button: { textTransform: 'none' as const, fontWeight: 500 },
  },
  shape: {
    borderRadius: 16, // MD3 uses rounder corners
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.2, 0, 0, 1)', // Smooth, bouncy dynamic motion
      easeOut: 'cubic-bezier(0.2, 0, 0, 1)',
      easeIn: 'cubic-bezier(0.2, 0, 0, 1)',
      sharp: 'cubic-bezier(0.2, 0, 0, 1)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100, // Pill shape
          textTransform: 'none' as const,
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          '&:active': {
            transform: 'scale(0.96)', // Micro-animation on click
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24, // MD3 large surface rounding
          backgroundColor: '#FCEEE6',
          backgroundImage: 'none',
          boxShadow: 'none', // Remove heavy drop shadow
          border: '1px solid rgba(139, 94, 60, 0.1)', // Subtle border instead of shadow
          transition: 'box-shadow 0.2s, transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(139, 94, 60, 0.15)', // Tonal elevation on hover
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1)',
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
          borderTop: 'none',
          boxShadow: '0 -1px 4px rgba(0,0,0,0.05)',
          height: 80,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#7A5C44',
          minWidth: 0,
          padding: '8px 12px 12px',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          '&.Mui-selected': {
            color: '#8B5E3C',
            transform: 'translateY(-2px)', // Slight lift for active tab
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FCEEE6',
          borderRight: '1px solid rgba(139, 94, 60, 0.15)',
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

// Create a context for connection status
export const ConnectionContext = createContext({
  isConnected: false,
  setIsConnected: (status: boolean) => { },
});

export default function App() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  // Centralized connection management
  useEffect(() => {
    const handleDisconnect = () => {
      setIsConnected(false);
      watchInfo.reset();
      router.push('/');
    };

    const connectionActions: EventAction[] = [
      {
        label: "Connected",
        action: () => setIsConnected(true)
      },
      {
        label: "Disconnected",
        action: handleDisconnect
      },
      {
        label: "WatchInitializationCompleted",
        action: async () => {
          if (GShockAPI.isFindPhoneButtonPressed()) {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) PhoneFinder.ring();
          } else if (GShockAPI.isActionButtonPressed() || GShockAPI.isAutoTimeStarted()) {
            await GShockAPI.setTime();
          } else {
            // Only redirect if we're not already on a functional page
            const onLandingPage = router.pathname === '/' || router.pathname === '';
            if (onLandingPage) {
              router.push('/time/Time');
            }
          }
        }
      }
    ];

    progressEvents.runEventActions("AppRoot", connectionActions);

    // Initial route protection if started while disconnected
    const restrictedPaths = ['/time', '/alarms', '/events', '/settings', '/reminders'];
    if (!connection.isConnected() && restrictedPaths.some(path => router.pathname.startsWith(path))) {
        handleDisconnect();
    }

    return () => {
      progressEvents.stop("AppRoot");
    };
  }, []); // Run ONLY ONCE on mount

  // Cleanup: Remove redundant route protection effect as it's now handled by event listeners
  // and the initial check above.

  return (
    <ConnectionContext.Provider value={{ isConnected, setIsConnected }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <MainLayout>
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <ComponentRouter pathname={router.pathname} fallback={<div>Page not found</div>} />
          </Suspense>
        </MainLayout>
      </MUIThemeProvider>
    </ConnectionContext.Provider>
  );
}
