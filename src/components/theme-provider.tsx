"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ThemeContextType = {
  theme: string;
  savedTheme: string;
  previewTheme: string | null;
  setPreviewTheme: (t: string | null) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "blue",
  savedTheme: "blue",
  previewTheme: null,
  setPreviewTheme: () => {},
});

export function ThemeProvider({ initialTheme, children }: { initialTheme: string; children: ReactNode }) {
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const activeTheme = previewTheme || initialTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        savedTheme: initialTheme,
        previewTheme,
        setPreviewTheme,
      }}
    >
      <div className={`theme-${activeTheme} min-h-screen bg-paper text-ink flex`}>{children}</div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
