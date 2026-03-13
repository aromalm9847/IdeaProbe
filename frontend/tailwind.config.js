module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f8fafc",
        surface: "#ffffff",
        "surface-2": "#f1f5f9",
        border: "#e2e8f0",
        accent: "#6366f1",
        cyan: "#6366f1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 30px rgba(99, 102, 241, 0.12)",
        "glow-cyan": "0 0 30px rgba(99, 102, 241, 0.10)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.15)",
        soft: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        card: "0 4px 24px rgba(99,102,241,0.07), 0 1px 3px rgba(0,0,0,0.05)",
        "card-hover": "0 8px 40px rgba(99,102,241,0.13), 0 2px 8px rgba(0,0,0,0.06)",
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
