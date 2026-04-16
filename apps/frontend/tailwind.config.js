/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eeedfb",
          100: "#d5d3f5",
          200: "#ada9ec",
          300: "#847ee3",
          400: "#6b65dc",
          500: "#534AB7",
          600: "#4840a4",
          700: "#3a3388",
          800: "#2d286c",
          900: "#1e1b49",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
