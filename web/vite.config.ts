import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Root-absolute assets. For GitHub project pages, set base to "/chattong/".
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
});
