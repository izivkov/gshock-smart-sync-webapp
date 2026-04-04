import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider as MTThemeProvider } from "@material-tailwind/react";
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4c1d95', // purple-900
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <MTThemeProvider>
        <Component {...pageProps} />
      </MTThemeProvider>
    </MUIThemeProvider>
  );
}
