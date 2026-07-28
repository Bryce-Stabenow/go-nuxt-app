/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // Deep navy canvas + panels
        ink: "#08182E",
        navy: {
          950: "#081C34",
          900: "#0B2038",
          800: "#102C4C",
          700: "#173a63",
          600: "#1B3D66",
          500: "#2A5488",
        },
        // Single brand accent — brass/gold
        brass: {
          DEFAULT: "#F2B441",
          soft: "#F6C766",
          deep: "#C88A1E",
        },
        // Functional completion accent — citron (checked / success only)
        citron: {
          DEFAULT: "#BEEA4C",
          deep: "#8FBF2E",
        },
        // Text + neutrals on navy
        cloud: "#E9F0FA",
        mist: "#93A9C7",
        // Destructive
        coral: "#FF6B57",
        // Rare warm paper
        paper: "#F4EFE1",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.28em",
      },
      borderRadius: {
        ticket: "6px",
      },
      boxShadow: {
        ticket: "0 24px 60px -30px rgba(3, 10, 22, 0.9)",
        glow: "0 0 0 1px rgba(242, 180, 65, 0.35), 0 18px 40px -18px rgba(242, 180, 65, 0.25)",
      },
      keyframes: {
        "ticket-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "rule-draw": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "ticket-in": "ticket-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "rule-draw": "rule-draw 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
};
