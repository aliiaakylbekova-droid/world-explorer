export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas")
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true })
    return Boolean(gl)
  } catch {
    return false
  }
}
