import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const pxToRem = require("tailwindcss-preset-px-to-rem")

const borderGradientPlugin = plugin(({ addUtilities, theme }) => {
  const surfaceGradient = theme("backgroundImage.gradient-surface") as string;

  addUtilities({
    ".border-gradient-surface": {
      border: "1px solid transparent",
      backgroundImage: `${surfaceGradient}, linear-gradient(135deg, ${theme("colors.border-first")} 0%, ${theme("colors.border-last")} 100%)`,
      backgroundOrigin: "border-box",
      backgroundClip: "padding-box, border-box",
    },
    ".border-b-gradient-surface": {
      borderBottom: "1px solid transparent",
      borderImageSource: `linear-gradient(to right, ${theme("colors.border-first")} 0%, ${theme("colors.border-last")} 100%)`,
      borderImageSlice: "0 0 1 0",
      borderImageRepeat: "stretch",
    },
  });
});

const config: Config = {
  presets : [pxToRem],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  plugins: [borderGradientPlugin],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-surface":
          "linear-gradient(135deg, #424147 0%, #141619 100%)",
      },
      colors: {
        placeholder: "#BBBBBB",
        text: "#FFFFFF",
        surface: "#424147",
        background: "#141619",
        "border-first": "#CACACA",
        "border-last": "#8C8C8C",
      },
      fontFamily: {
        "pretendard-light": ["var(--font-pretendard-light)", "sans-serif"],
        "pretendard-semibold": [
          "var(--font-pretendard-semibold)",
          "sans-serif",
        ],
      },
    },
  },
};

export default config;
