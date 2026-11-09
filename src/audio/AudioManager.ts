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
  | "voice"
  | "wind"
  | "quest"
  | "type"
  | "guessOk"
  | "guessBad"
  | "nextTask"
  | "chime"
  | "whoosh"

class AudioManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private sfxBus: GainNode | null = null
  private ambientNodes: OscillatorNode[] = []
  private ambientGain: GainNode | null = null
  private windSrc: AudioBufferSourceNode | null = null
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
    else if (name === "voice") this.talkBurst()
    else if (name === "wind") this.startWind()
    else if (name === "quest") this.arpeggio([440, 554, 659], 0.09, 0.12)
    else if (name === "type") this.blip(720 + Math.random() * 80, 0.035, "square")
    else if (name === "guessOk") {
      this.arpeggio([523, 659, 784, 1046], 0.09, 0.12)
    } else if (name === "guessBad") this.sweep(320, 110, 0.32, 0.08)
    else if (name === "nextTask") this.sweep(300, 720, 0.4, 0.07)
    else if (name === "chime") this.blip(1318, 0.18, "sine")
    else if (name === "whoosh") this.sweep(90, 420, 0.38, 0.09)
  }

  speak(text: string) {
    this.unlock()
    this.play("voice")
    const synth = window.speechSynthesis
    if (!synth || !text) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.95
    u.pitch = 1.05
    u.volume = this.sfxOn ? Math.min(1, this.sfxVol) : 0
    synth.speak(u)
  }

  private talkBurst() {
    ;[220, 260, 240, 300, 280, 250].forEach((f, i) => {
      window.setTimeout(() => this.blip(f, 0.07, "triangle"), i * 70)
    })
  }

  startWind() {
    if (!this.unlocked || !this.sfxOn) return
    const ctx = this.ensure()
    if (this.windSrc) return
    const n = ctx.sampleRate * 2
    const buf = ctx.createBuffer(1, n, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < n; i += 1) data[i] = (Math.random() * 2 - 1) * 0.4
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const filt = ctx.createBiquadFilter()
    filt.type = "bandpass"
    filt.frequency.value = 380
    const g = ctx.createGain()
    g.gain.value = 0.04
    src.connect(filt)
    filt.connect(g)
    g.connect(this.sfxBus!)
    src.start()
    this.windSrc = src
  }

  stopWind() {
    try {
      this.windSrc?.stop()
    } catch {
      /* */
    }
    this.windSrc = null
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
