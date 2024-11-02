import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@/state": "/src/state",
      "@/state/*": "/src/state/*",
    },
  },
});
