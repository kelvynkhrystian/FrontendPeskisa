/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
type PrimaryColor = 'orange' | 'blue' | 'purple' | 'emerald';

interface ThemeContextData {
  theme: Theme;
  toggleTheme: () => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const colorValues: Record<PrimaryColor, { main: string; hover: string }> = {
  orange: { main: '#f97316', hover: '#ea580c' },
  blue: { main: '#2563eb', hover: '#1d4ed8' },
  purple: { main: '#9333ea', hover: '#7e22ce' },
  emerald: { main: '#059669', hover: '#047857' },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('@Peskisa:theme') as Theme) || 'dark';
  });

  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>(() => {
    return (
      (localStorage.getItem('@Peskisa:primaryColor') as PrimaryColor) ||
      'orange'
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('@Peskisa:theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = colorValues[primaryColor] || colorValues.orange;

    // Injeta as variáveis direto na raiz do documento HTML
    root.style.setProperty('--primary-color', colors.main);
    root.style.setProperty('--primary-hover', colors.hover);

    localStorage.setItem('@Peskisa:primaryColor', primaryColor);
  }, [primaryColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setPrimaryColor = (color: PrimaryColor) => {
    setPrimaryColorState(color);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, primaryColor, setPrimaryColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
