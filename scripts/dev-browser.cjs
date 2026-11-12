const { spawn } = require("node:child_process")
const http = require("node:http")
const path = require("node:path")

const root = path.join(__dirname, "..")
const host = "127.0.0.1"
const port = 47231
const url = `http://${host}:${port}/`

function pingVite() {
  return new Promise((resolve) => {
    const req = http.get({ hostname: host, port, path: "/", timeout: 800 }, (res) => {
      let body = ""
      res.setEncoding("utf8")
      res.on("data", (chunk) => {
        body += chunk
        if (body.length > 8000) res.destroy()
      })
      const done = () => resolve(body.includes("@vite/client") ? "vite" : "other")
      res.on("end", done)
      res.on("close", done)
    })
    req.on("error", () => resolve("down"))
    req.on("timeout", () => {
      req.destroy()
      resolve("down")
    })
  })
}

function waitForVite() {
  return new Promise((resolve, reject) => {
    let tries = 80
    const tick = async () => {
      const state = await pingVite()
      if (state === "vite") {
        console.log("GEO QUEST (browser): " + url)
        resolve()
        return
      }
      if (state === "other") {
        reject(new Error("Port " + port + " is not Vite HMR. Stop whatever is bound there, then npm run dev."))
        return
      }
      tries -= 1
      if (tries <= 0) reject(new Error("Vite did not start on " + url))
      else setTimeout(tick, 250)
    }
    tick()
  })
}

function openChrome() {
  const display = process.env.DISPLAY || ":1"
  const env = { ...process.env, DISPLAY: display }
  const plat = process.platform
  let cmd
  let args
  if (plat === "win32") {
    cmd = "cmd"
    args = ["/c", "start", "chrome", url]
  } else if (plat === "darwin") {
    cmd = "open"
    args = ["-a", "Google Chrome", url]
  } else {
    cmd = "google-chrome"
    args = [
      "--new-window",
      "--no-first-run",
      "--no-default-browser-check",
      url,
    ]
  }
  const child = spawn(cmd, args, { env, detached: true, stdio: "ignore", shell: plat === "win32" })
  child.on("error", () => {
    if (plat === "linux") {
      spawn("xdg-open", [url], { env, detached: true, stdio: "ignore" }).unref()
    }
  })
  child.unref()
}

async function main() {
  const state = await pingVite()
  let vite = null
  if (state === "other") {
    throw new Error("Port " + port + " is not Vite HMR. Stop whatever is bound there, then npm run dev.")
  }
  if (state === "down") {
    vite = spawn("npx", ["vite", "--host", host, "--port", String(port)], {
      cwd: root,
      stdio: "inherit",
      shell: platWin(),
    })
    vite.on("exit", (code) => process.exit(code ?? 0))
  } else {
    console.log("GEO QUEST: Vite already running at " + url)
  }
  await waitForVite()
  openChrome()
  if (!vite) {
    setInterval(() => {}, 1 << 30)
  }
}

function platWin() {
  return process.platform === "win32"
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
