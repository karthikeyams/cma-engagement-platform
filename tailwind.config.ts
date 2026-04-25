import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cma: {
          brown: "#240C00",
          taupe: "#7C6D66",
          beige: "#F7F2F0",
          gold: "#C8A882",
          border: "#E3D6D3",
          muted: "#988f8a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
