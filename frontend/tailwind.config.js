module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0f",
        surface: "#13131a",
        "surface-2": "#1a1a24",
        border: "#1e1e2e",
        accent: "#6c47ff",
        cyan: "#00d4ff",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 30px rgba(108, 71, 255, 0.3)",
        "glow-cyan": "0 0 30px rgba(0, 212, 255, 0.2)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.2)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        ticker: "ticker 30s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
}
