import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider as MTThemeProvider } from "@material-tailwind/react";
import { ThemeProvider as MUIThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './components/MainLayout';
import { useMemo } from 'react';

// Define a modern Material 3 inspired theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4', // M3 Purple
      light: '#EADDFF',
      dark: '#21005D',
    },
    secondary: {
      main: '#625B71',
      light: '#E8DEF8',
      dark: '#1D192B',
    },
    background: {
      default: 'transparent', // Let the animated background show through
      paper: 'rgba(255, 255, 255, 0.7)',
    },
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
          borderRadius: 100, // M3 Stadium button
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          background: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
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
