import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f6fb",
          100: "#dbe7f5",
          200: "#b7d0eb",
          300: "#8ab2dc",
          400: "#5c8fc9",
          500: "#3b6fb0",
          600: "#2c5591",
          700: "#254575",
          800: "#213a61",
          900: "#1e3252",
        },
      },
    },
  },
  plugins: [],
};

export default config;
