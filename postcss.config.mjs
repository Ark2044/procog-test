/** @type {import('postcss-load-config').Config} */
const config = {
  content: ["./app/**/*.{html,js,css}"],
  theme: {
    extend: {},
  },
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
