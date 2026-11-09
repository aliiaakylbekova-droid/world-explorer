import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(({ command }) => {
  const web = Boolean(process.env.VERCEL)
  return {
    plugins: [
      react(),
      {
        name: "electron-file-protocol",
        transformIndexHtml(html) {
          return html.replaceAll(" crossorigin", "")
        },
      },
    ],
    // Dev/Vercel: absolute `/` so HMR websocket and module URLs are not relative
    // (relative `base: './'` made Chrome/Electron keep stale chunks). Electron
    // production still needs `./` for file://.
    base: command === "build" && !web ? "./" : "/",
    server: {
      host: "127.0.0.1",
      port: 47231,
      strictPort: true,
      hmr: {
        protocol: "ws",
        host: "127.0.0.1",
        port: 47231,
        clientPort: 47231,
      },
      watch: {
        usePolling: true,
        interval: 400,
      },
    },
    preview: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: true,
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: false,
    },
    envPrefix: ["VITE_"],
  }
})
