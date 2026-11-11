"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import PinkDecorations from "./theme/pink-decorations";
import ForestDecorations from "./theme/forest-decorations";
import MidnightDecorations from "./theme/midnight-decorations";
import SunsetDecorations from "./theme/sunset-decorations";
import ClassicDecorations from "./theme/classic-decorations";

type ThemeContextType = {
  theme: string;
  mode: string;
  savedTheme: string;
  savedMode: string;
  previewTheme: string | null;
  setPreviewTheme: (t: string | null) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "classic",
  mode: "light",
  savedTheme: "classic",
  savedMode: "light",
  previewTheme: null,
  setPreviewTheme: () => {},
});

/** Normalize legacy theme names to new names */
function normalizeTheme(theme: string): string {
  const map: Record<string, string> = {
    blue: "classic",
    green: "forest",
    purple: "midnight",
    orange: "sunset",
    red: "sunset", // fallback for red
    pink: "sakura",
  };
  return map[theme] ?? theme;
}

export function ThemeProvider({
  initialTheme,
  initialMode,
  children,
}: {
  initialTheme: string;
  initialMode: string;
  children: ReactNode;
}) {
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const activeTheme = normalizeTheme(previewTheme || initialTheme);
  const activeMode = initialMode || "light";

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
        savedTheme: normalizeTheme(initialTheme),
        savedMode: initialMode,
        previewTheme,
        setPreviewTheme,
      }}
    >
      <div
        className={`theme-${activeTheme} ${activeMode === "dark" ? "dark" : ""} min-h-screen bg-paper text-ink flex relative`}
        data-theme={activeTheme}
      >
        {/* Theme decorations — fixed behind content */}
        {activeTheme === "sakura" && <PinkDecorations />}
        {activeTheme === "forest" && <ForestDecorations />}
        {activeTheme === "midnight" && <MidnightDecorations />}
        {activeTheme === "sunset" && <SunsetDecorations />}
        {activeTheme === "classic" && <ClassicDecorations />}

        {/* Content wrapper — z-10 biar di atas decorations */}
        <div className="relative z-10 flex w-full min-h-screen">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
