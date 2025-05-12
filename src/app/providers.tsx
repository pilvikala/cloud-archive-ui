"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      background: {
        default: prefersDarkMode ? '#0a0a0a' : '#ffffff',
        paper: prefersDarkMode ? '#1a1a1a' : '#ffffff',
      },
    },
  });

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <SessionProvider>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
} 