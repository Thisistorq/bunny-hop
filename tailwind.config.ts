import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // Brand palette — spring cycling event
        spring: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        earth: {
          50:  "#fdf8f0",
          100: "#fcecd8",
          200: "#f8d5ac",
          300: "#f2b87a",
          400: "#eb9445",
          500: "#e5762a",
          600: "#d45d1f",
          700: "#b0451a",
          800: "#8d391b",
          900: "#732f19",
        },
        bone: {
          50:  "#fdfcf8",
          100: "#f8f5ec",
          200: "#ede8d5",
          300: "#ddd5b8",
          400: "#c9bc93",
          500: "#b5a270",
          600: "#9e8856",
          700: "#836e44",
          800: "#6b593a",
          900: "#584932",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "hop": "hop 0.6s ease-in-out",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        hop: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
