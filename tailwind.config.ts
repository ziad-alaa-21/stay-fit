/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stay: {
          red: "#E63946",
          black: "#0A0A0A",
          card: "#1A1A1A",
          elevated: "#252525",
          border: "#333333",
          muted: "#A0A0A0",
          success: "#22C55E",
          warning: "#EAB308",
          danger: "#DC2626",
        },
      },
      boxShadow: {
        glow: "0 0 24px rgba(230,57,70,0.26)",
      },
      fontFamily: {
        sans: ["Inter", "Montserrat", "Arial", "sans-serif"],
        display: ["Oswald", "Impact", "Arial Narrow", "sans-serif"],
      },
    },
  },
  plugins: [],
};
