import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Added path for alias support

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Now you can use @/components/...
    },
  },
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000/",
        changeOrigin: true,
        secure: false, // Needed for HTTP instead of HTTPS
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
      "/storage": {
        target: "http://127.0.0.1:8000/",
        changeOrigin: true,
        secure: false,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    },
  },
});
