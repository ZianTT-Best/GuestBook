import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gb: {
          bg: "#ffffff",
          fg: "#000000",
          border: "#000000",
          muted: "#888888",
          light: "#f5f5f5",
        },
      },
      fontFamily: {
        mono: ["Menlo", "Monaco", "'Courier New'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
