/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // dark mode is forced on via <html class="dark"> in app/layout.tsx
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F0F0F",   // Dark Black — main background
        secondary: "#1E1E1E", // Slightly lighter panels/cards
        accent: "#F5C542",    // Gold — CTAs, highlights, active states
        "accent-dark": "#D9A92E", // hover/pressed state for gold elements
        ink: "#FFFFFF",        // primary text on dark backgrounds
        muted: "#A1A1AA",      // secondary/body text
        border: "#2A2A2A",     // subtle dividers/card borders
        success: "#3FB68B",
        danger: "#E5484D",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(245, 197, 66, 0.15), 0 8px 24px -4px rgba(245, 197, 66, 0.25)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        shimmer: "shimmer 1.8s infinite linear",
        "fade-up": "fadeUp 0.5s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
