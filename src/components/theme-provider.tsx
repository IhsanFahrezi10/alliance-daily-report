"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeContextType = {
  theme: string;
  mode: string;
  savedTheme: string;
  savedMode: string;
  previewTheme: string | null;
  setPreviewTheme: (t: string | null) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "blue",
  mode: "light",
  savedTheme: "blue",
  savedMode: "light",
  previewTheme: null,
  setPreviewTheme: () => {},
});

export function ThemeProvider({ initialTheme, initialMode, children }: { initialTheme: string; initialMode: string; children: ReactNode }) {
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const activeTheme = previewTheme || initialTheme;
  const activeMode = initialMode || "light";

  // Set class `dark` di <html> biar body background ikut gelap
  useEffect(() => {
    if (activeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [activeMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        mode: activeMode,
        savedTheme: initialTheme,
        savedMode: initialMode,
        previewTheme,
        setPreviewTheme,
      }}
    >
      <div className={`theme-${activeTheme} ${activeMode === "dark" ? "dark" : ""} min-h-screen bg-paper text-ink flex`}>{children}</div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
