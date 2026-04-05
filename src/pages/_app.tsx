import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from './components/MainLayout';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8B5E3C',
      light: '#FCEEE6',
      dark: '#5C3A1E',
      contrastText: '#FFF8F4',
    },
    secondary: {
      main: '#7A5C44',
      light: '#F5EDE4',
      dark: '#4A3628',
    },
    background: {
      default: '#F5EDE4',
      paper: '#FCEEE6',
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
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 2px 12px rgba(139, 94, 60, 0.10)',
          background: '#FCEEE6',
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {/* Material Tailwind Provider was removed here to resolve the 
          "Objects are not valid as a React child" error in React 19.
      */}
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </MUIThemeProvider>
  );
}