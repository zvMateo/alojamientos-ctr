import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Aumentar límite de memoria para evitar crashes
    rollupOptions: {
      maxParallelFileOps: 1, // Procesar archivos uno por uno
      output: {
        // Code splitting por vendor chunks
        manualChunks: {
          // Vendor chunks para librerías grandes
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "google-maps": [
            "@vis.gl/react-google-maps",
            "@googlemaps/markerclusterer",
          ],
          "ui-vendor": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-aspect-ratio",
          ],
          "query-vendor": [
            "@tanstack/react-query",
            "@tanstack/react-query-devtools",
          ],
          "utils-vendor": ["axios", "zod", "zustand", "clsx", "tailwind-merge"],
        },
        // Optimizar nombres de chunks
        chunkFileNames: () => {
          return `js/[name]-[hash].js`;
        },
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name || "")) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    // Compresión y optimización
    minify: "terser",
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps para debugging en producción (opcional)
    sourcemap: false,
  },
  // Optimizaciones de desarrollo
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "@vis.gl/react-google-maps",
      "zustand",
      "axios",
    ],
  },
  // Preload de módulos críticos
  server: {
    fs: {
      allow: [".."],
    },
  },
});
