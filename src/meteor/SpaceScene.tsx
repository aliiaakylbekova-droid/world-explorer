import { useFrame } from "@react-three/fiber"
import { memo, useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import type { MeteorSpec } from "./field.ts"
import type { EffectKind } from "./useMeteorGame.ts"
import {
  gasTexture,
  glowTexture,
  GLOW,
  moonTexture,
  rockGeometry,
  rockMaterial,
  rustTexture,
  starTexture,
  terraTexture,
} from "./rocks.ts"

type SceneProps = {
  meteors: MeteorSpec[]
  focusId: number | null
  effect: EffectKind
  effectToken: number
}

const FOCUS = new THREE.Vector3(0, 0.15, 1.75)
const _target = new THREE.Vector3()

const skyVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const skyFragment = /* glsl */ `
varying vec3 vDir;
void main() {
  vec3 dir = normalize(vDir);
  float h = dir.y;
  vec3 top = vec3(0.018, 0.026, 0.06);
  vec3 mid = vec3(0.006, 0.008, 0.02);
  vec3 bot = vec3(0.025, 0.01, 0.016);
  vec3 col = mix(bot, mid, smoothstep(-0.5, 0.05, h));
  col = mix(col, top, smoothstep(0.05, 0.9, h));
  float band = exp(-pow((h - 0.05) * 3.6, 2.0));
  col += vec3(0.03, 0.015, 0.05) * band;
  float warm = exp(-pow((dir.x + 0.4) * 1.6, 2.0)) * exp(-pow(h * 2.2, 2.0));
  col += vec3(0.04, 0.015, 0.005) * warm;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

function Starfield() {
  const group = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const count = 1600
    const array = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      const radius = 28 + Math.random() * 48
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      array[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
      array[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      array[index * 3 + 2] = radius * Math.cos(phi)
    }
    return array
  }, [])
  const map = useMemo(() => starTexture(), [])

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.008
  })

  return (
    <points ref={group}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={map}
        color="#e7eeff"
        size={0.22}
        transparent
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        opacity={0.95}
      />
    </points>
  )
}

function Dust() {
  const ref = useRef<THREE.Points>(null)
  const map = useMemo(() => starTexture(), [])
  const base = useMemo(() => {
    const count = 220
    const array = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      array[index * 3] = (Math.random() - 0.5) * 22
      array[index * 3 + 1] = (Math.random() - 0.5) * 14
      array[index * 3 + 2] = (Math.random() - 0.5) * 16
    }
    return array
  }, [])
  const current = useMemo(() => new Float32Array(base), [base])

  useFrame(({ clock }) => {
    const points = ref.current
    if (!points) return
    const t = clock.elapsedTime
    const attr = points.geometry.getAttribute("position")
    if (!(attr instanceof THREE.BufferAttribute)) return
    for (let index = 0; index < base.length / 3; index += 1) {
      const x = base[index * 3] ?? 0
      const y = base[index * 3 + 1] ?? 0
      const z = base[index * 3 + 2] ?? 0
      current[index * 3] = x + Math.sin(t * 0.18 + y) * 0.18
      current[index * 3 + 1] = y + Math.cos(t * 0.14 + x) * 0.16
      current[index * 3 + 2] = z + Math.sin(t * 0.1 + x) * 0.12
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={map}
        color="#9ec4ff"
        size={0.035}
        transparent
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        opacity={0.4}
      />
    </points>
  )
}

function Nebula({
  position,
  scale,
  color,
  opacity,
}: {
  position: [number, number, number]
  scale: number
  color: string
  opacity: number
}) {
  const map = useMemo(() => glowTexture(), [])
  return (
    <sprite position={position} scale={[scale, scale * 0.62, 1]}>
      <spriteMaterial
        map={map}
        color={color}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={opacity}
        toneMapped={false}
      />
    </sprite>
  )
}

function Planet({
  position,
  radius,
  map,
  speed,
}: {
  position: [number, number, number]
  radius: number
  map: THREE.Texture
  speed: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 56, 56]} />
      <meshStandardMaterial map={map} roughness={0.92} metalness={0.05} />
    </mesh>
  )
}

function MeteorBody({
  spec,
  focused,
  concealed,
  reduce,
}: {
  spec: MeteorSpec
  focused: boolean
  concealed: boolean
  reduce: boolean
}) {
  const ref = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Mesh>(null)
  const booted = useRef(false)
  const wasHidden = useRef(false)
  const home = useMemo(() => new THREE.Vector3(...spec.position), [spec.position])
  const geo = useMemo(() => rockGeometry(spec.seed, spec.palette), [spec.palette, spec.seed])
  const glow = useMemo(() => glowTexture(), [])

  useFrame((state, dt) => {
    const group = ref.current
    const mesh = spin.current
    if (!group || !mesh) return
    const step = Math.min(dt, 0.05)
    if (!booted.current) {
      group.position.copy(home)
      group.scale.setScalar(spec.scale)
      booted.current = true
    }
    const motion = reduce ? 0.22 : 1
    mesh.rotation.x += step * spec.spin[0] * motion
    mesh.rotation.y += step * spec.spin[1] * motion
    mesh.rotation.z += step * spec.spin[2] * motion
    if (concealed) {
      wasHidden.current = true
      group.scale.setScalar(Math.max(0.001, group.scale.x * (1 - Math.min(0.4, step * 8))))
      return
    }
    if (wasHidden.current) {
      group.position.copy(home)
      group.scale.setScalar(0.05)
      wasHidden.current = false
    }
    const t = state.clock.elapsedTime
    if (focused) _target.copy(FOCUS)
    else {
      _target.set(
        home.x + Math.sin(t * spec.drift + spec.seed) * 0.4 * motion,
        home.y + Math.cos(t * spec.drift * 0.82 + spec.seed * 1.3) * 0.3 * motion,
        home.z + Math.sin(t * 0.22 + spec.seed) * 0.18 * motion,
      )
    }
    const k = 1 - Math.exp(-step * (focused ? 4.8 : 1.7))
    group.position.lerp(_target, k)
    const desired = focused ? 1.62 : spec.scale
    const next = group.scale.x + (desired - group.scale.x) * k
    group.scale.setScalar(Math.max(0.001, next))
  })

  return (
    <group ref={ref}>
      <mesh ref={spin} geometry={geo} material={rockMaterial} dispose={null} />
      <sprite position={[0, 0, -0.15]} scale={[2.35, 2.35, 1]}>
        <spriteMaterial
          map={glow}
          color={GLOW[spec.palette] ?? "#ff8a3d"}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={focused ? 0.55 : 0.28}
          toneMapped={false}
        />
      </sprite>
      <pointLight
        color={GLOW[spec.palette] ?? "#ff8a3d"}
        intensity={focused ? 5.5 : 1.25}
        distance={focused ? 11 : 5.5}
        decay={2}
      />
    </group>
  )
}

function Burst({
  token,
  kind,
}: {
  token: number
  kind: EffectKind
}) {
  const count = 72
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const start = useRef(performance.now())
  const pieces = useMemo(() => {
    return Array.from({ length: count }, () => {
      const dir = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
      return {
        dir,
        speed: 1.6 + Math.random() * 4.4,
        spin: Math.random() * 7,
        size: 0.05 + Math.random() * (kind === "blast" ? 0.16 : 0.09),
      }
    })
  }, [kind, token])
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, kind === "blast" ? 0 : 1), [kind])
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: kind === "blast" ? "#ffd0aa" : "#ffe7a4",
        toneMapped: false,
      }),
    [kind],
  )

  useEffect(() => {
    start.current = performance.now()
  }, [token])

  useFrame(() => {
    const inst = mesh.current
    if (!inst || kind === "none") return
    const t = (performance.now() - start.current) / 1000
    const life = kind === "blast" ? 1.35 : 1.05
    for (let index = 0; index < pieces.length; index += 1) {
      const piece = pieces[index]!
      const dist = piece.speed * t * (1 - t * 0.15)
      dummy.position.set(FOCUS.x + piece.dir.x * dist, FOCUS.y + piece.dir.y * dist, FOCUS.z + piece.dir.z * dist)
      dummy.rotation.set(t * piece.spin, t * 1.8, t * 0.6)
      const scale = piece.size * Math.max(0, 1 - t / life)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      inst.setMatrixAt(index, dummy.matrix)
    }
    inst.instanceMatrix.needsUpdate = true
  })

  if (kind === "none") return null
  return <instancedMesh ref={mesh} args={[geo, mat, count]} />
}

function Sparks({ token, kind }: { token: number; kind: EffectKind }) {
  const count = 140
  const ref = useRef<THREE.Points>(null)
  const map = useMemo(() => starTexture(), [])
  const dirs = useMemo(() => {
    const array = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let index = 0; index < count; index += 1) {
      const dir = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
      array[index * 3] = dir.x
      array[index * 3 + 1] = dir.y
      array[index * 3 + 2] = dir.z
      speeds[index] = 1.2 + Math.random() * 6
    }
    return { array, speeds }
  }, [token])
  const positions = useMemo(() => new Float32Array(count * 3), [token])
  const start = useRef(performance.now())

  useEffect(() => {
    start.current = performance.now()
  }, [token])

  useFrame(() => {
    const points = ref.current
    if (!points || kind === "none") return
    const t = (performance.now() - start.current) / 1000
    const attr = points.geometry.getAttribute("position")
    if (!(attr instanceof THREE.BufferAttribute)) return
    for (let index = 0; index < count; index += 1) {
      const speed = dirs.speeds[index] ?? 1
      const dist = speed * t
      positions[index * 3] = FOCUS.x + (dirs.array[index * 3] ?? 0) * dist
      positions[index * 3 + 1] = FOCUS.y + (dirs.array[index * 3 + 1] ?? 0) * dist
      positions[index * 3 + 2] = FOCUS.z + (dirs.array[index * 3 + 2] ?? 0) * dist
    }
    attr.needsUpdate = true
    const material = points.material
    if (material instanceof THREE.PointsMaterial) {
      material.opacity = Math.max(0, 1 - t / (kind === "blast" ? 1.3 : 1))
    }
  })

  if (kind === "none") return null
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={map}
        color={kind === "blast" ? "#ffd2b0" : "#fff1b0"}
        size={kind === "break" ? 0.16 : 0.1}
        transparent
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

function Shockwave({ token, kind }: { token: number; kind: EffectKind }) {
  const ref = useRef<THREE.Mesh>(null)
  const start = useRef(performance.now())
  useEffect(() => {
    start.current = performance.now()
  }, [token, kind])
  useFrame(() => {
    const mesh = ref.current
    if (!mesh || kind !== "blast") return
    const t = (performance.now() - start.current) / 1000
    const scale = 0.15 + t * 4.8
    mesh.scale.set(scale, scale, scale)
    const material = mesh.material
    if (material instanceof THREE.MeshBasicMaterial) material.opacity = Math.max(0, 0.75 * (1 - t / 0.9))
  })
  if (kind !== "blast") return null
  return (
    <mesh ref={ref} position={FOCUS} rotation={[0.15, 0.2, 0]}>
      <ringGeometry args={[0.78, 0.96, 48]} />
      <meshBasicMaterial color="#ffe6cc" transparent opacity={0.75} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

function Flash({ token, kind }: { token: number; kind: EffectKind }) {
  const ref = useRef<THREE.PointLight>(null)
  const start = useRef(performance.now())
  useEffect(() => {
    start.current = performance.now()
  }, [token, kind])
  useFrame(() => {
    const light = ref.current
    if (!light || kind === "none") return
    const t = (performance.now() - start.current) / 1000
    const peak = kind === "blast" ? 30 : 14
    light.intensity = Math.max(0, peak * (1 - t / 0.38))
  })
  if (kind === "none") return null
  return (
    <pointLight
      ref={ref}
      position={[0, 0.2, 3.1]}
      color={kind === "blast" ? "#fff4e4" : "#ffe7a8"}
      intensity={18}
      distance={20}
      decay={2}
    />
  )
}

function CameraRig({ token, kind }: { token: number; kind: EffectKind }) {
  const power = useRef(0)
  useEffect(() => {
    power.current = kind === "blast" ? 0.2 : kind === "break" ? 0.05 : 0
  }, [kind, token])
  useFrame((state, dt) => {
    power.current *= Math.exp(-Math.min(dt, 0.05) * 3.4)
    const t = state.clock.elapsedTime
    const shake = power.current
    state.camera.position.set(
      Math.sin(t * 0.12) * 0.08 + (Math.random() - 0.5) * shake,
      0.15 + Math.cos(t * 0.09) * 0.04 + (Math.random() - 0.5) * shake,
      8.7,
    )
    state.camera.lookAt(0, 0.15, 0)
  })
  return null
}

function SpaceScene({ meteors, focusId, effect, effectToken }: SceneProps) {
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )
  const gas = useMemo(() => gasTexture(), [])
  const terra = useMemo(() => terraTexture(), [])
  const moon = useMemo(() => moonTexture(), [])
  const rust = useMemo(() => rustTexture(), [])

  return (
    <>
      <color attach="background" args={["#050714"]} />
      <hemisphereLight args={["#c9d7ff", "#1a1020", 0.42]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[12, 16, 10]} intensity={2.15} color="#f4f7ff" />
      <directionalLight position={[-8, -3, 5]} intensity={0.4} color="#ffb07a" />
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[90, 32, 32]} />
        <shaderMaterial side={THREE.BackSide} vertexShader={skyVertex} fragmentShader={skyFragment} />
      </mesh>
      <Starfield />
      <Dust />
      <Nebula position={[-18, 7, -48]} scale={16} color="#6d4dff" opacity={0.07} />
      <Nebula position={[20, -6, -52]} scale={14} color="#ff6a3a" opacity={0.05} />
      <Nebula position={[1, 9, -56]} scale={18} color="#2f6dff" opacity={0.05} />
      <Planet position={[-15, 4.6, -34]} radius={6.2} map={gas} speed={0.05} />
      <mesh position={[-15, 4.6, -34]} rotation={[1.15, 0.2, 0.35]}>
        <ringGeometry args={[8.1, 10.6, 72]} />
        <meshBasicMaterial color="#e6c7a2" side={THREE.DoubleSide} transparent opacity={0.48} />
      </mesh>
      <Planet position={[16.5, -3.4, -30]} radius={4.1} map={terra} speed={0.08} />
      <Planet position={[-7.5, -5.4, -18]} radius={1.55} map={moon} speed={0.04} />
      <Planet position={[9.5, 6.2, -22]} radius={1.9} map={rust} speed={0.06} />
      {meteors.map((spec) => (
        <MeteorBody
          key={spec.id}
          spec={spec}
          focused={spec.id === focusId && effect === "none"}
          concealed={spec.id === focusId && effect !== "none"}
          reduce={reduce}
        />
      ))}
      <Burst token={effectToken} kind={effect} />
      <Sparks token={effectToken} kind={effect} />
      <Shockwave token={effectToken} kind={effect} />
      <Flash token={effectToken} kind={effect} />
      <CameraRig token={effectToken} kind={effect} />
    </>
  )
}

export default memo(SpaceScene)
