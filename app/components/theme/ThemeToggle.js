"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme" className=" relative flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 bg-[var(--toggle-bg)] border border-[var(--border-color)] " >
      {/* Sun */}
      <Sun size={15} className={`transition-all duration-300 ${isDark ? "text-[var(--text-muted)] opacity-40" : "text-amber-500 opacity-100"}`} />

      {/* Toggle pill */}
      <div className="relative w-9 h-5 rounded-full transition-all duration-300 border border-[var(--border-color)] ">
        <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-300 bg-[var(--sidebar-active)]
            ${isDark ? "left-[18px]" : "left-0.5"} `}
        />
      </div>

      {/* Moon */}
      <Moon size={15} className={`transition-all duration-300 ${isDark ? "text-blue-300 opacity-100" : "text-[var(--text-muted)] opacity-40"}`} />
    </button>
  );
}