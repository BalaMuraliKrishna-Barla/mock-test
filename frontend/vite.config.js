import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy /api requests to our Node.js backend
      "/api": {
        target: "http://localhost:5001", // Your backend server
        changeOrigin: true,
      },
    },
  },
});


