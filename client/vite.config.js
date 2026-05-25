import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to backend during dev so no CORS issues
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        ws: true,    // also proxies WebSocket /api/stream
      },
    },
  },
});
