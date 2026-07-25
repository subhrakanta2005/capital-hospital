/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Inspired by Kalinga temple architecture — laterite red & gold
        brand: {
          50: "#fdf3f0",
          100: "#fbe4dc",
          500: "#a83a2c",
          600: "#8f2f22",
          700: "#7a2620",
          900: "#4a1512",
        },
        gold: {
          400: "#e0b04f",
          500: "#cc9838",
          600: "#a97c2a",
        },
      },
    },
  },
  plugins: [],
}
