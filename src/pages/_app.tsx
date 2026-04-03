import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider as MTThemeProvider } from "@material-tailwind/react";
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './components/MainLayout';

// Warm brown/peach theme matching the Android G-Shock app
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8B5E3C',       // warm brown
      light: '#FCEEE6',      // peach card background
      dark: '#5C3A1E',       // deep brown
      contrastText: '#FFF8F4',
    },
    secondary: {
      main: '#7A5C44',
      light: '#F5EDE4',
      dark: '#4A3628',
    },
    background: {
      default: '#F5EDE4',    // warm linen — static, never changes
      paper: '#FCEEE6',      // slightly lighter peach for cards
    },
    text: {
      primary: '#2D1A0E',
      secondary: '#7A5C44',
    },
    divider: 'rgba(139, 94, 60, 0.15)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 28px',
        },
        outlined: {
          borderColor: '#8B5E3C',
          color: '#8B5E3C',
          '&:hover': {
            background: 'rgba(139, 94, 60, 0.08)',
            borderColor: '#5C3A1E',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 2px 12px rgba(139, 94, 60, 0.10)',
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
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#8B5E3C',
            '& + .MuiSwitch-track': {
              backgroundColor: '#8B5E3C',
            },
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          background: '#FCEEE6',
          borderTop: '1px solid rgba(139, 94, 60, 0.15)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#7A5C44',
          '&.Mui-selected': {
            color: '#8B5E3C',
          },
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <MTThemeProvider>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </MTThemeProvider>
    </MUIThemeProvider>
  );
}
