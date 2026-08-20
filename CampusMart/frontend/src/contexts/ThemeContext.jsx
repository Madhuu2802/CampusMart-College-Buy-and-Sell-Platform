import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    // Default to system preference
    return 'system';
  });

  // Get actual dark mode state based on theme mode
  const [systemDarkMode, setSystemDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const isDarkMode = themeMode === 'system' ? systemDarkMode : themeMode === 'dark';

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save theme preference to localStorage and update body attribute
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    const theme = isDarkMode ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
  }, [themeMode, isDarkMode]);

  // Set initial theme on body
  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
  }, []);

  const toggleTheme = () => {
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }
  };

  const setTheme = (mode) => {
    if (['light', 'dark', 'system'].includes(mode)) {
      setThemeMode(mode);
    }
  };

  // Create Material-UI theme based on mode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#CD1C18', // Custom red
        light: '#FFA896', // Custom light coral
        dark: '#9B1313', // Custom dark red
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#38000A', // Custom very dark red
        light: '#CD1C18', // Custom red as light variant
        dark: '#38000A', // Custom very dark red
        contrastText: '#ffffff',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f8f9fa',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#333333',
        secondary: isDarkMode ? '#b3b3b3' : '#666666',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: isDarkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDarkMode
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #9B1313 0%, #38000A 100%)',
            color: isDarkMode ? '#ffffff' : '#ffffff',
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
          },
        },
      },
      MuiBox: {
        styleOverrides: {
          root: {
            '&.theme-aware': {
              backgroundColor: isDarkMode ? '#121212' : '#f8f9fa',
              color: isDarkMode ? '#ffffff' : '#333333',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover fieldset': {
                borderColor: '#CD1C18',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#CD1C18',
              },
            },
          },
        },
      },
    },
  });

  const value = {
    isDarkMode,
    themeMode,
    toggleTheme,
    setTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;