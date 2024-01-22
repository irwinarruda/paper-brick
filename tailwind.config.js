import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addBase, config }) {
      addBase({
        body: {
          overflow: "hidden",
        },
        "#root": {
          overflow: "hidden",
          borderRadius: config("theme.borderRadius.md"),
        },
        button: {
          cursor: "default",
        },
      });
    }),
  ],
};
