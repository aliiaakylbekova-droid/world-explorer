import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    {
      name: "electron-file-protocol",
      transformIndexHtml(html) {
        return html.replaceAll(" crossorigin", "")
      },
    },
  ],
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 47231,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 47231,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
})
