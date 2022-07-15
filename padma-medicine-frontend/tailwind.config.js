/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{html,ts}", "../src/app/**/*.{html,ts}"],
  theme: {
    extend: {},
    colors: {
      primary: "#0A151B",
      card: "#2A2A2A",
      background: "#141414",
    },
  },
  plugins: [],
};
