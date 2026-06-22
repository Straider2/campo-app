import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  return <ThemeContext.Provider value={{ dark, toggle: () => setDark(!dark) }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
