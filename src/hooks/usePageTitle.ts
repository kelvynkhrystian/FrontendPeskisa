import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function usePageTitle(pageName: string) {
  const { nomeApp } = useTheme();

  useEffect(() => {
    document.title = `${pageName} - ${nomeApp}`;
  }, [pageName, nomeApp]);
}
