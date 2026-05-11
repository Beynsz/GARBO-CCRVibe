import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ── GARBO Color Palette (SDD §3.1.1) ───────────────────────────────────
      // Inspired by sustainability / earth tones
      colors: {
        // Primary — dark olive green
        primary: {
          DEFAULT: "#626F47",
          50:  "#F2F4EC",
          100: "#E0E5CF",
          200: "#C5CDA8",
          300: "#A9B681",
          400: "#8E9E5A",
          500: "#626F47",   // ← brand primary
          600: "#505C3A",
          700: "#3E472E",
          800: "#2C3221",
          900: "#1A1E13",
        },
        // Secondary — moss green
        secondary: {
          DEFAULT: "#A4B465",
          50:  "#F6F8EE",
          100: "#EBF0D4",
          200: "#D4E1A8",
          300: "#BDD27D",
          400: "#A4B465",   // ← brand secondary
          500: "#8A9A50",
          600: "#6F7B40",
          700: "#545D30",
          800: "#3A3F20",
          900: "#1F2110",
        },
        // Neutral — light olive (backgrounds, highlights)
        olive: {
          50:  "#FAFDF2",
          100: "#F2F9DC",
          200: "#E5F3B8",
          300: "#C8DA9C",   // ← light olive from SDD
          400: "#B2C87A",
          500: "#9BB658",
        },
        // Neutral — warm sand (page background)
        sand: {
          DEFAULT: "#F5ECD5",
          50:  "#FDFAF4",
          100: "#FAF5E8",
          200: "#F5ECD5",   // ← warm sand from SDD
          300: "#ECD8B0",
          400: "#E0C48A",
          500: "#D4B064",
        },
        // Accent — warm amber (from SDD brand palette)
        accent: {
          DEFAULT: "#F0BB78",
          light:  "#F7D9AE",
          dark:   "#C8892A",
        },
        // Semantic states
        success: {
          DEFAULT: "#4CAF50",
          light:   "#E8F5E9",
          dark:    "#2E7D32",
        },
        warning: {
          DEFAULT: "#FF9800",
          light:   "#FFF3E0",
          dark:    "#E65100",
        },
        danger: {
          DEFAULT: "#F44336",
          light:   "#FFEBEE",
          dark:    "#B71C1C",
        },
        // Status pills (SRS §3.2.1.1)
        status: {
          completed: "#4CAF50",
          delayed:   "#FF9800",
          missed:    "#F44336",
          pending:   "#9E9E9E",
        },
      },

      // ── Typography (SDD §3.1.2) ─────────────────────────────────────────────
      fontFamily: {
        // Besley — transitional serif for headings
        heading: ["Besley", "Georgia", "serif"],
        // Figtree — clean geometric sans for body/data
        body: ["Figtree", "system-ui", "sans-serif"],
        // Monospace for code/data values
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },

      fontSize: {
        // Besley heading scale (SDD §3.1.2)
        "h1": ["2rem",    { lineHeight: "1.2", fontWeight: "700" }],  // 32px
        "h2": ["1.5rem",  { lineHeight: "1.3", fontWeight: "700" }],  // 24px
        "h3": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],  // 20px
        "h4": ["1.125rem",{ lineHeight: "1.4", fontWeight: "400" }],  // 18px
        "h5": ["1rem",    { lineHeight: "1.5", fontWeight: "400" }],  // 16px
        "h6": ["0.875rem",{ lineHeight: "1.5", fontWeight: "400" }],  // 14px
        // Figtree body scale
        "body-lg": ["1rem",    { lineHeight: "1.6" }],  // 16px
        "body-md": ["0.875rem",{ lineHeight: "1.6" }],  // 14px
        "body-sm": ["0.75rem", { lineHeight: "1.5" }],  // 12px light
      },

      // ── Spacing (SDD §3.1.3) ────────────────────────────────────────────────
      // 8-point system based on 4px increments
      spacing: {
        "1":  "4px",
        "2":  "8px",
        "3":  "12px",
        "4":  "16px",
        "5":  "20px",
        "6":  "24px",
        "8":  "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },

      // ── Border Radius ───────────────────────────────────────────────────────
      borderRadius: {
        "sm":  "4px",
        "md":  "8px",
        "lg":  "12px",
        "xl":  "16px",
        "2xl": "24px",
        "full":"9999px",
      },

      // ── Box Shadow ──────────────────────────────────────────────────────────
      boxShadow: {
        "card":  "0 2px 8px rgba(98, 111, 71, 0.10)",
        "card-hover": "0 4px 16px rgba(98, 111, 71, 0.18)",
        "modal": "0 8px 32px rgba(0, 0, 0, 0.18)",
        "input": "inset 0 1px 3px rgba(0,0,0,0.06)",
        "input-focus": "0 0 0 3px rgba(98, 111, 71, 0.20)",
      },

      // ── Layout ──────────────────────────────────────────────────────────────
      screens: {
        // Optimized for 1440×1024 (SRS §3.6.1.1) — desktop-first
        "sm":  "640px",
        "md":  "768px",
        "lg":  "1024px",
        "xl":  "1280px",
        "2xl": "1440px",
      },

      // Sidebar width token
      width: {
        "sidebar": "220px",
        "sidebar-collapsed": "64px",
      },

      // ── Animations ──────────────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-8px)", opacity: "0" },
          to:   { transform: "translateX(0)",    opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in":   "fade-in 0.2s ease-out",
        "slide-in":  "slide-in 0.2s ease-out",
        "pulse-soft":"pulse-soft 2s ease-in-out infinite",
        "spin-slow": "spin-slow 1.2s linear infinite",
      },
    },
  },

  plugins: [],
};

export default config;