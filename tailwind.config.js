/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand colors
        cheese: "#FFCC00", 
        pepperoni: "#990000", 
        crust: "#000000", 
        olive: {
          DEFAULT: "#000000",
          dark: "#1a1a1a",
          light: "#333333",
        },
        accentwhite: "#FFFFFF",
        // Primary color (red)
        primary: {
          50: "#ffebeb",
          100: "#ffcdcd",
          200: "#ff9f9f",
          300: "#ff7070",
          400: "#ff4242",
          500: "#ff1414",
          600: "#ff0000",
          700: "#cc0000",
          800: "#990000", // Brand red
          900: "#660000",
          950: "#330000",
        },
        // Secondary color (yellow)
        secondary: {
          50: "#fffee7",
          100: "#fffbc3",
          200: "#fff885",
          300: "#ffef47",
          400: "#ffe61a",
          500: "#ffdd00",
          600: "#ffcc00", // Brand yellow
          700: "#cc9900",
          800: "#997300",
          900: "#664d00",
          950: "#332600",
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        secondary: ['Ojuju', 'Ojiji', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 7px 25px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
};
