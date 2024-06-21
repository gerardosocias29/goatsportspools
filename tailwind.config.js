/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#100c44',
        'backgroundS': '#064ab8',
        'primary': '#453f65',
        'primaryS': '#d69a3e'
      }
    },
  },
  plugins: [],
}

