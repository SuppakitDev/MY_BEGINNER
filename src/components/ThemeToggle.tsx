"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
  }, []);

  if (!mounted) return null;

  const toggle = () => {
    const root = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:shadow-sm transition
                 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
      title="Toggle theme"
    >
      <span className="i-sun hidden dark:inline">🌞</span>
      <span className="i-moon inline dark:hidden">🌙</span>
      <span>{isDark ? "Light" : "Dark"} mode</span>
    </button>
  );
}
