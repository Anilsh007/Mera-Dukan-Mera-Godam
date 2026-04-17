"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme" className=" relative flex items-center gap-2 p-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 bg-[var(--toggle-bg)] border border-[var(--border-color)] " >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}