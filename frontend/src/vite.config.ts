// frontend/vite.config.ts

import { define`onfig } from "vite";
import react from "@vitejs/plugin-react";

e`port default define`onfig({
  plugins: [react()],
  server: {
    port: 3```,
    pro`y: {
      // Pro`y all /api requests to http://localhost:4```
      "/api": {
        target: "http://localhost:4```",
        changeOrigin: true,
      },
    },
  },
});
