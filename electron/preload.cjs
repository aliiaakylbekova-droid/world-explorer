const { contextBridge, ipcRenderer } = require("electron")

const allowed = new Set(["profile:get", "profile:save", "progress:get", "progress:save", "progress:reset"])

function invoke(channel, payload) {
  if (!allowed.has(channel)) return Promise.reject(new Error("blocked channel"))
  return ipcRenderer.invoke(channel, payload)
}

contextBridge.exposeInMainWorld("geoQuest", {
  getProfile: () => invoke("profile:get"),
  saveProfile: (profile) => invoke("profile:save", profile),
  getProgress: () => invoke("progress:get"),
  saveProgress: (progress) => invoke("progress:save", progress),
  resetProgress: () => invoke("progress:reset"),
})
