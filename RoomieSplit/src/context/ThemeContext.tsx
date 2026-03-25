import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ dark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('rs_dark_mode');
      if (saved !== null) return saved === 'true';
    } catch {
      /* ignore storage errors */
    }
    return typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? true
      : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('rs_dark_mode', String(dark));
    } catch {
      /* ignore storage errors */
    }
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
