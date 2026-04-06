/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        "primary-dark": "#1D4ED8",
        dark: "#0F172A",
        "dark-card": "#1E293B",
        "dark-border": "#334155",
        accent: "#6366F1",
      },
    },
  },
  plugins: [],
};
