import React, { useState, useEffect, memo } from "react";
import { Sun, Moon } from "lucide-react";

export const ColorModeSwitch = memo(() => {
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 sm:p-2.5 rounded-full bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 text-amber-500 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer"
      aria-label="Toggle Color Theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5 transition-transform rotate-0 dark:rotate-90" />
      ) : (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
      )}
    </button>
  );
});

ColorModeSwitch.displayName = "ColorModeSwitch";

export default ColorModeSwitch;