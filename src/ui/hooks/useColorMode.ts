import { useState, useEffect, useMemo } from 'react';
import { PaletteMode, useMediaQuery, createTheme } from '@mui/material';

export const useColorMode = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode') as PaletteMode;
    if (savedMode && ['light', 'dark'].includes(savedMode)) {
      return savedMode;
    }
    return prefersDarkMode ? 'dark' : 'light';
  });

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as PaletteMode;
    if (!savedMode) {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]);

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#f50057',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    [mode],
  );

  return { mode, toggleColorMode, theme };
};
