// vite.config.ts — Vite's configuration file
// This tells Vite which plugins to use when building your app

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // NEW in Tailwind v4

export default defineConfig({
  plugins: [
    react(),        // handles React/JSX
    tailwindcss(),  // handles Tailwind — replaces the old PostCSS setup
  ],
});