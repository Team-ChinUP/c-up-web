import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        "pretendard-light": ["var(--font-pretendard-light)", "sans-serif"],
        "pretendard-semibold": ["var(--font-pretendard-semibold)", "sans-serif"],
      },
    },
  },
};

export default config;
