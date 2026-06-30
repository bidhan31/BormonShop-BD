"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by rendering a placeholder of the same size
    return <div className="w-24 h-8 bg-secondary rounded-full animate-pulse" />;
  }

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="bg-secondary border border-border rounded-full px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent cursor-pointer transition-colors"
      aria-label="Select Theme"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="ambient">Ambient</option>
    </select>
  );
}
