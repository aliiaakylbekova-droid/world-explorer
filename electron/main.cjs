const { app, BrowserWindow, ipcMain, Menu, session } = require("electron")
const fs = require("node:fs")
const path = require("node:path")

const DEV_URL = process.env.ELECTRON_START_URL || "http://127.0.0.1:47231"
const CHANNELS = new Set(["profile:get", "profile:save", "progress:get", "progress:save", "progress:reset"])

if (process.env.ELECTRON_NO_SANDBOX === "1") {
  app.commandLine.appendSwitch("no-sandbox")
}
app.commandLine.appendSwitch("disable-dev-shm-usage")
app.commandLine.appendSwitch("allow-file-access-from-files")
app.commandLine.appendSwitch("use-angle", "swiftshader")
app.commandLine.appendSwitch("use-gl", "angle")

app.setName("GEO QUEST")

function storePath() {
  return path.join(app.getPath("userData"), "geo-quest.json")
}

function readStore() {
  try {
    const raw = fs.readFileSync(storePath(), "utf8")
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object") return parsed
  } catch {
    /* first launch */
  }
  return { profile: null, progress: null }
}

function writeStore(next) {
  const file = storePath()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(next, null, 2), "utf8")
}

function isTrusted(event) {
  const url = event.senderFrame?.url ?? ""
  if (app.isPackaged) return url.startsWith("file:")
  return url.startsWith("http://127.0.0.1:47231") || url.startsWith("file:")
}

function createWindow() {
  const preload = path.join(__dirname, "preload.cjs")
  const win = new BrowserWindow({
    title: "GEO QUEST",
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#07162b",
    autoHideMenuBar: true,
    fullscreenable: true,
    show: true,
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  })

  win.setMenuBarVisibility(false)

  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      win.setFullScreen(!win.isFullScreen())
      event.preventDefault()
    }
  })

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }))
  win.webContents.on("will-navigate", (event, url) => {
    const allowed = app.isPackaged ? url.startsWith("file:") : url.startsWith("http://127.0.0.1:47231")
    if (!allowed) event.preventDefault()
  })

  win.webContents.on("console-message", (_e, _level, message) => {
    console.log("[renderer]", message)
  })
  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    console.error("did-fail-load", code, desc, url)
  })
  win.once("ready-to-show", () => win.show())
  win.webContents.openDevTools()

  const distIndex = path.join(__dirname, "../dist/index.html")
  if (app.isPackaged) {
    win.loadFile(distIndex)
  } else {
    win.loadURL(process.env.ELECTRON_START_URL || DEV_URL)
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const script = app.isPackaged
      ? "script-src 'self'"
      : "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          `default-src 'self'; ${script}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:47231 http://127.0.0.1:47231 https://*.supabase.co wss://*.supabase.co; worker-src 'self' blob:`,
        ],
      },
    })
  })

  ipcMain.handle("profile:get", (event) => {
    if (!isTrusted(event) || !CHANNELS.has("profile:get")) return null
    return readStore().profile ?? null
  })

  ipcMain.handle("profile:save", (event, profile) => {
    if (!isTrusted(event)) return { ok: false }
    if (!profile || typeof profile !== "object" || typeof profile.name !== "string") {
      return { ok: false }
    }
    const store = readStore()
    store.profile = {
      name: String(profile.name).slice(0, 40),
      avatar: String(profile.avatar ?? "ocean").slice(0, 24),
      createdAt: Number(profile.createdAt) || Date.now(),
    }
    writeStore(store)
    return { ok: true, profile: store.profile }
  })

  ipcMain.handle("progress:get", (event) => {
    if (!isTrusted(event)) return null
    return readStore().progress ?? null
  })

  ipcMain.handle("progress:save", (event, progress) => {
    if (!isTrusted(event)) return { ok: false }
    if (!progress || typeof progress !== "object") return { ok: false }
    const store = readStore()
    store.progress = progress
    writeStore(store)
    return { ok: true }
  })

  ipcMain.handle("progress:reset", (event) => {
    if (!isTrusted(event)) return { ok: false }
    const store = readStore()
    store.progress = null
    writeStore(store)
    return { ok: true }
  })

  createWindow()
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
