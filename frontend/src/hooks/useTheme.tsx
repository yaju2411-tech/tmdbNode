import { useState, useEffect } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return localStorage.getItem("theme") !== "light";
  });

  useEffect(() => {
    // Apply initial theme on mount
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }

    // Observe changes to the 'dark' class on document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const currentlyDark = document.documentElement.classList.contains("dark");
    if (currentlyDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return { isDark, toggleTheme };
}
