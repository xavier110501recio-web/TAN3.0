export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sauce: {
          black: "#080808",
          surface: "#111111",
          surface2: "#1A1A1A",
          border: "#242424",
          gold: "#C8A45A",
          goldBright: "#E8C47A",
          goldDim: "#8A6E32",
          cream: "#F2EAD8",
          muted: "#7A7060",
          success: "#4A7C59",
        },
      },
      fontFamily: {
        heading: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "ui-monospace", "monospace"],
      },
      spacing: {
        18: "4.5rem",
      },
      borderRadius: {
        sauce: "6px",
      },
      keyframes: {
        "ring-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: ".7" },
        },
        "typing-bounce": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: ".5" },
          "30%": { transform: "translateY(-5px)", opacity: "1" },
        },
        "screen-enter": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "live-in": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "ring-pulse": "ring-pulse 1.6s ease-in-out infinite",
        "typing-bounce": "typing-bounce 1.1s ease-in-out infinite",
        "screen-enter": "screen-enter 300ms ease-out both",
        "live-in": "live-in 300ms ease-out both",
      },
    },
  },
  plugins: [],
};
