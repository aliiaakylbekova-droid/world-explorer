let ctx: AudioContext | null = null
let alarmOn = false
let alarmTimer = 0

function context(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

export function primeAudio() {
  context()
}

function beep() {
  const audio = context()
  const now = audio.currentTime
  for (const freq of [494, 740]) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = "square"
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.42), now + 0.18)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start(now)
    osc.stop(now + 0.24)
  }
}

export function setAlarm(on: boolean) {
  if (on === alarmOn) return
  alarmOn = on
  window.clearInterval(alarmTimer)
  if (!on) return
  beep()
  alarmTimer = window.setInterval(beep, 560)
}

export function playBoom() {
  const audio = context()
  const now = audio.currentTime
  const length = Math.floor(audio.sampleRate * 0.42)
  const buffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) {
    const t = index / length
    data[index] = (Math.random() * 2 - 1) * (1 - t) ** 2
  }
  const noise = audio.createBufferSource()
  noise.buffer = buffer
  const filter = audio.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.setValueAtTime(480, now)
  filter.frequency.exponentialRampToValueAtTime(70, now + 0.38)
  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.32, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42)
  noise.connect(filter)
  filter.connect(gain)
  gain.connect(audio.destination)
  noise.start(now)

  const osc = audio.createOscillator()
  const tone = audio.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(150, now)
  osc.frequency.exponentialRampToValueAtTime(38, now + 0.4)
  tone.gain.setValueAtTime(0.22, now)
  tone.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
  osc.connect(tone)
  tone.connect(audio.destination)
  osc.start(now)
  osc.stop(now + 0.42)
}

function tone(freq: number, delay: number, duration: number, volume: number) {
  const audio = context()
  const now = audio.currentTime + delay
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = "sine"
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

export function playChime() {
  tone(523.25, 0, 0.18, 0.07)
  tone(659.25, 0.08, 0.2, 0.06)
  tone(783.99, 0.15, 0.28, 0.05)
}
