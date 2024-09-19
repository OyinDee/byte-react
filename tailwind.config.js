/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cheese: "#FFD700", 
        pepperoni: "#FF6347", 
        crust: "#8B4513", 
        olive: "#000000",
        accentwhite: "#FFFFFF", 
      },
    },
  },
  plugins: [],
};
