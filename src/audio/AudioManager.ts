type Sfx =
  | "start"
  | "startClick"
  | "ambient"
  | "zoom"
  | "discovery"
  | "success"
  | "fail"
  | "xp"
  | "unlock"
  | "transition"
  | "missionComplete"

class AudioManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private sfxBus: GainNode | null = null
  private ambientNodes: OscillatorNode[] = []
  private ambientGain: GainNode | null = null
  unlocked = false
  musicOn = true
  sfxOn = true
  musicVol = 0.32
  sfxVol = 0.7
  masterVol = 0.7

  private ensure() {
    if (this.ctx) return this.ctx
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctx()
    this.master = this.ctx.createGain()
    this.musicBus = this.ctx.createGain()
    this.sfxBus = this.ctx.createGain()
    this.musicBus.connect(this.master)
    this.sfxBus.connect(this.master)
    this.master.connect(this.ctx.destination)
    this.applyGains()
    return this.ctx
  }

  applyGains() {
    if (!this.master || !this.musicBus || !this.sfxBus) return
    this.master.gain.value = this.masterVol
    this.musicBus.gain.value = this.musicOn ? this.musicVol : 0
    this.sfxBus.gain.value = this.sfxOn ? this.sfxVol : 0
  }

  setMusic(on: boolean) {
    this.musicOn = on
    this.applyGains()
    if (on && this.unlocked) this.startAmbient()
    if (!on) this.stopAmbient()
  }

  setSfx(on: boolean) {
    this.sfxOn = on
    this.applyGains()
  }

  setMusicVol(v: number) {
    this.musicVol = v
    this.applyGains()
  }

  setSfxVol(v: number) {
    this.sfxVol = v
    this.applyGains()
  }

  setMaster(v: number) {
    this.masterVol = v
    this.applyGains()
  }

  unlock() {
    const ctx = this.ensure()
    if (ctx.state === "suspended") void ctx.resume()
    this.unlocked = true
  }

  play(name: Sfx) {
    if (!this.unlocked) return
    const ctx = this.ensure()
    if (ctx.state === "suspended") void ctx.resume()
    if (name === "ambient") {
      this.startAmbient()
      return
    }
    if (name === "startClick") this.blip(520, 0.09, "triangle")
    else if (name === "start") this.arpeggio([196, 247, 294, 392], 0.12, 0.16)
    else if (name === "zoom") this.sweep(180, 520, 0.42, 0.08)
    else if (name === "discovery") this.arpeggio([523, 659, 784], 0.1, 0.11)
    else if (name === "success") this.arpeggio([392, 494, 587, 784], 0.11, 0.14)
    else if (name === "fail") this.sweep(280, 140, 0.28, 0.07)
    else if (name === "xp") this.blip(880, 0.06, "sine")
    else if (name === "unlock") this.arpeggio([659, 784, 988, 1175], 0.08, 0.1)
    else if (name === "transition") this.sweep(240, 640, 0.55, 0.06)
    else if (name === "missionComplete") this.arpeggio([262, 330, 392, 523, 659], 0.12, 0.15)
  }

  private bus() {
    return this.sfxBus!
  }

  private blip(freq: number, dur: number, type: OscillatorType) {
    if (!this.sfxOn || !this.ctx || !this.sfxBus) return
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g)
    g.connect(this.bus())
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  private sweep(from: number, to: number, dur: number, vol: number) {
    if (!this.sfxOn || !this.ctx || !this.sfxBus) return
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(from, t)
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(vol, t + 0.04)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g)
    g.connect(this.bus())
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  private arpeggio(notes: number[], step: number, dur: number) {
    notes.forEach((n, i) => {
      window.setTimeout(() => this.blip(n, dur, i % 2 ? "triangle" : "sine"), i * step * 1000)
    })
  }

  startAmbient() {
    if (!this.unlocked || !this.musicOn) return
    const ctx = this.ensure()
    if (this.ambientGain) return
    const g = ctx.createGain()
    g.gain.value = 0.0001
    g.connect(this.musicBus!)
    const freqs = [110, 164.8, 196]
    this.ambientNodes = freqs.map((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = i === 0 ? "sine" : "triangle"
      osc.frequency.value = f
      const filt = ctx.createBiquadFilter()
      filt.type = "lowpass"
      filt.frequency.value = 640
      osc.connect(filt)
      filt.connect(g)
      osc.start()
      return osc
    })
    g.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 1.6)
    this.ambientGain = g
  }

  stopAmbient() {
    const ctx = this.ctx
    if (this.ambientGain && ctx) {
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4)
    }
    this.ambientNodes.forEach((o) => {
      try {
        o.stop()
      } catch {
        /* already stopped */
      }
    })
    this.ambientNodes = []
    this.ambientGain = null
  }
}

export const audio = new AudioManager()
