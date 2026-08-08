import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  actualTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('carrier_os_theme') as ThemeMode;
    return saved || 'dark';
  });

  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('dark');

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('carrier_os_theme', mode);
  };

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let resolved: 'dark' | 'light' = 'dark';
      if (theme === 'system') {
        resolved = mediaQuery.matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }

      setActualTheme(resolved);

      if (resolved === 'light') {
        root.classList.remove('dark');
        root.classList.add('light-theme');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#0f172a';
      } else {
        root.classList.add('dark');
        root.classList.remove('light-theme');
        document.body.style.backgroundColor = '#09090b';
        document.body.style.color = '#fafafa';
      }
    };

    applyTheme();

    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
