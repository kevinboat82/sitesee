/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Premium Color Palette
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },

      // Font Family
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },

      // Border Radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Box Shadow
      boxShadow: {
        'glow-sm': '0 0 10px rgb(59 130 246 / 0.2)',
        'glow': '0 0 20px rgb(59 130 246 / 0.3)',
        'glow-lg': '0 0 40px rgb(59 130 246 / 0.4)',
        'glow-amber': '0 0 20px rgb(245 158 11 / 0.3)',
        'glow-emerald': '0 0 20px rgb(16 185 129 / 0.3)',
        'glow-purple': '0 0 20px rgb(139 92 246 / 0.3)',
        'inner-glow': 'inset 0 0 20px rgb(59 130 246 / 0.1)',
        'premium': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },

      // Backdrop Blur
      backdropBlur: {
        'xs': '2px',
        '3xl': '64px',
      },

      // Animations
      animation: {
        // Existing animations
        "shine": "shine var(--duration) infinite linear",
        "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",

        // New premium animations
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "fade-down": "fade-down 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-in": "scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-up": "slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "float": "float 3s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "gradient": "gradient-shift 8s ease infinite",
        "ripple": "ripple 1.5s ease-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "spotlight": "spotlight 2s ease-in-out infinite",
        "border-beam": "border-beam 4s linear infinite",
      },

      // Keyframes
      keyframes: {
        // Existing keyframes
        "shine": {
          "0%": { "background-position": "0% 0%" },
          "50%": { "background-position": "100% 100%" },
          "100%": { "background-position": "0% 0%" },
        },
        "shimmer-slide": {
          "to": { transform: "translate(calc(100cqw - 100%), 0)" },
        },
        "spin-around": {
          "0%": { transform: "translateZ(0) rotate(0)" },
          "15%, 35%": { transform: "translateZ(0) rotate(90deg)" },
          "65%, 85%": { transform: "translateZ(0) rotate(270deg)" },
          "100%": { transform: "translateZ(0) rotate(360deg)" },
        },

        // New keyframes
        "fade-in": {
          "from": { opacity: "0" },
          "to": { opacity: "1" },
        },
        "fade-up": {
          "from": { opacity: "0", transform: "translateY(20px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "from": { opacity: "0", transform: "translateY(-20px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "from": { opacity: "0", transform: "scale(0.95)" },
          "to": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "from": { transform: "translateY(100%)" },
          "to": { transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgb(59 130 246 / 0.3)" },
          "50%": { boxShadow: "0 0 40px rgb(59 130 246 / 0.5)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "ripple": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "spin-slow": {
          "from": { transform: "rotate(0deg)" },
          "to": { transform: "rotate(360deg)" },
        },
        "spotlight": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0", transform: "scale(1.1)" },
        },
        "border-beam": {
          "0%": { offsetDistance: "0%" },
          "100%": { offsetDistance: "100%" },
        },
      },

      // Transition Timing
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      // Background Image
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'mesh-gradient': `
          radial-gradient(at 40% 20%, rgb(59 130 246 / 0.15) 0, transparent 50%),
          radial-gradient(at 80% 0%, rgb(139 92 246 / 0.1) 0, transparent 50%),
          radial-gradient(at 0% 50%, rgb(6 182 212 / 0.1) 0, transparent 50%)
        `,
      },
    },
  },
  plugins: [],
}