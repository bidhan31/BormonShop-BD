"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by rendering invisible content or generic until mounted
    // We return children directly to avoid layout shift, but suppress hydration warning in layout.tsx
    return <>{children}</>;
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" themes={['light', 'dark', 'ambient']}>
      {children}
    </NextThemesProvider>
  );
}
