/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', "sans-serif"],
      },
      fontWeight: {
        DEFAULT: "500",
        medium: "500",
      },
      colors: {
        background: {
          DEFAULT: "#0a0a0f",
          card: "#111118",
          glass: "rgba(255,255,255,0.04)",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          focus: "rgba(139,92,246,0.6)",
        },
        accent: {
          purple: "#8b5cf6",
          blue: "#3b82f6",
          glow: "rgba(139,92,246,0.3)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":
          "radial-gradient(ellipse at top, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(59,130,246,0.1) 0%, transparent 60%)",
      },
      boxShadow: {
        glass: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        glow: "0 0 20px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.15)",
        card: "0 8px 32px rgba(0,0,0,0.5)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        fadeUp: "fadeUp 0.5s ease forwards",
      },
    },
  },
  plugins: [],
};
