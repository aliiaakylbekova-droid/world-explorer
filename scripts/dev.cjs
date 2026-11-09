const { spawn } = require("node:child_process")
const http = require("node:http")
const path = require("node:path")

const root = path.join(__dirname, "..")
const port = 47231

function waitForVite() {
  return new Promise((resolve, reject) => {
    let tries = 80
    const ping = () => {
      const req = http.get({ hostname: "127.0.0.1", port, path: "/", timeout: 800 }, (res) => {
        let body = ""
        res.setEncoding("utf8")
        res.on("data", (chunk) => {
          body += chunk
          if (body.length > 8000) res.destroy()
        })
        let finished = false
        const finish = () => {
          if (finished) return
          finished = true
          const viteDev = body.includes("@vite/client")
          const distHash = /assets\/index-[A-Za-z0-9_-]+\.js/.test(body)
          if (!viteDev && distHash) {
            reject(
              new Error(
                "Port 47231 is serving dist/ (stale production build), not Vite HMR. Stop `vite preview` and run npm run electron:dev.",
              ),
            )
            return
          }
          if (viteDev) {
            console.log("GEO QUEST: live Vite src at http://127.0.0.1:" + port + "/ (not dist/)")
            resolve()
            return
          }
          tries -= 1
          if (tries <= 0) reject(new Error("Vite did not start"))
          else setTimeout(ping, 250)
        }
        res.on("end", finish)
        res.on("close", finish)
      })
      req.on("error", () => {
        tries -= 1
        if (tries <= 0) reject(new Error("Vite did not start"))
        else setTimeout(ping, 250)
      })
    }
    ping()
  })
}

const vite = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", String(port)], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
})

waitForVite()
  .then(() => {
    const electron = spawn("npx", ["electron", "."], {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: {
        ...process.env,
        ELECTRON_START_URL: `http://127.0.0.1:${port}`,
        ELECTRON_NO_SANDBOX: process.env.ELECTRON_NO_SANDBOX || "1",
      },
    })
    electron.on("exit", (code) => {
      vite.kill("SIGTERM")
      process.exit(code ?? 0)
    })
  })
  .catch((error) => {
    console.error(error)
    vite.kill("SIGTERM")
    process.exit(1)
  })
