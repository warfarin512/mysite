import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'SF Pro Display'", "'Hiragino Sans'", "'Yu Gothic UI'", "system-ui", "sans-serif"],
        body: ["'SF Pro Text'", "'Hiragino Sans'", "'Yu Gothic UI'", "system-ui", "sans-serif"],
      },
      colors: {
        ink: { DEFAULT: "#0B0E14", soft: "#3A4252" },
        paper: "#F5F6F8",
        accent: { DEFAULT: "#3B82F6", warm: "#F97316" },
      },
      boxShadow: {
        float: "0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        "float-lg": "0 24px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 32px rgba(0,0,0,0.12)",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
export default config;
