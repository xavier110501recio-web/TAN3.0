/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sauce: {
          black: "#080808",
          ink: "#0C0C0B",
          surface: "#111110",
          surface2: "#161614",
          surface3: "#1C1B18",
          border: "#26241F",
          borderStrong: "#3A3730",
          hairline: "rgba(242,234,216,0.08)",
          hairlineStrong: "rgba(242,234,216,0.18)",
          gold: "#C8A45A",
          goldBright: "#E8C47A",
          goldDim: "#8A6E32",
          cream: "#F2EAD8",
          creamMuted: "rgba(242,234,216,0.62)",
          muted: "#7A7060",
          success: "#4A7C59",
        },
      },
      fontFamily: {
        display: ["Bodoni Moda", "Bodoni 72", "Didot", "Georgia", "serif"],
        body: ["Hanken Grotesk", "Helvetica Neue", "system-ui", "sans-serif"],
        mono: ["Martian Mono", "ui-monospace", "Menlo", "monospace"],
      },
      fontSize: {
        "folio": ["10px", { lineHeight: "1.1", letterSpacing: "0.22em" }],
        "label": ["11px", { lineHeight: "1.2", letterSpacing: "0.18em" }],
        "label-lg": ["12px", { lineHeight: "1.25", letterSpacing: "0.16em" }],
        "caption": ["13px", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        "body": ["16px", { lineHeight: "1.55", letterSpacing: "-0.005em" }],
        "lede": ["18px", { lineHeight: "1.6", letterSpacing: "-0.01em" }],
      },
      spacing: {
        gutter: "clamp(20px, 5vw, 32px)",
        section: "clamp(40px, 7vw, 72px)",
      },
      letterSpacing: {
        tightest: "-0.03em",
        editorial: "-0.018em",
      },
      borderRadius: {
        none: "0",
        xs: "2px",
        sm: "3px",
        md: "5px",
        lg: "8px",
        xl: "10px",
      },
      keyframes: {
        "folio-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "rule-draw": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "typing-bounce": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: ".4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        "screen-enter": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "ticker-rise": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "12%": { opacity: "1", transform: "translateY(0)" },
          "88%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-10px)" },
        },
        "success-flash": {
          "0%": { backgroundColor: "rgba(200,164,90,0.22)" },
          "100%": { backgroundColor: "transparent" },
        },
        "confetti-fall": {
          "0%": { opacity: "1", transform: "translate(0,0) rotate(0deg)" },
          "100%": { opacity: "0", transform: "translate(var(--cx), var(--cy)) rotate(var(--cr))" },
        },
      },
      animation: {
        "folio-blink": "folio-blink 1.6s ease-in-out infinite",
        "rule-draw": "rule-draw 600ms cubic-bezier(.2,.7,.2,1) both",
        "typing-bounce": "typing-bounce 1.1s ease-in-out infinite",
        "screen-enter": "screen-enter 340ms cubic-bezier(.2,.7,.2,1) both",
        "ticker-rise": "ticker-rise 4.2s cubic-bezier(.2,.7,.2,1) infinite",
        "success-flash": "success-flash 800ms ease-out",
      },
    },
  },
  plugins: [],
};
