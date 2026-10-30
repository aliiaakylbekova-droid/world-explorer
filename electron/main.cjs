const { app, BrowserWindow, Menu } = require("electron")
const path = require("path")

const DEV_URL = process.env.ELECTRON_START_URL || "http://127.0.0.1:47231"

if (process.env.ELECTRON_NO_SANDBOX === "1") {
  app.commandLine.appendSwitch("no-sandbox")
}

app.setName("METEOR MATH")

function createWindow() {
  const win = new BrowserWindow({
    title: "METEOR MATH",
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#07051a",
    autoHideMenuBar: true,
    fullscreenable: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.setMenuBarVisibility(false)

  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      win.setFullScreen(!win.isFullScreen())
      event.preventDefault()
    }
  })

  win.once("ready-to-show", () => {
    win.show()
  })

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../dist/index.html"))
  } else {
    win.loadURL(DEV_URL)
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
