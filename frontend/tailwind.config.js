/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maroon: "#7A1735",
        rose: "#C0395A",
        blush: "#FDF5F7",
        border: "#F1DCE3",
      },
    },
  },
  plugins: [],
};
