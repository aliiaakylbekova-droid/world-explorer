import { Html } from "@react-three/drei"
import { useMemo } from "react"
import { Color, DoubleSide, Float32BufferAttribute, PlaneGeometry } from "three"

function height(x: number, z: number) {
  const ridge = Math.exp(-((z + 4) ** 2) / 18) * 4.2 + Math.exp(-((z - 6) ** 2) / 22) * 3.4
  const noise = Math.sin(x * 0.45) * 0.35 + Math.sin(x * 0.12 + z * 0.2) * 0.55
  const bowl = -Math.exp(-(x * x) / 28) * Math.exp(-((z - 0.4) ** 2) / 10) * 1.8
  return ridge + noise + bowl
}

function Terrain() {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(36, 28, 90, 70)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      pos.setY(i, height(x, z))
    }
    g.computeVertexNormals()
    const colors = new Float32Array(pos.count * 3)
    const snow = new Color("#eef6ff")
    const rock = new Color("#8b8680")
    const grass = new Color("#4d6a48")
    const sand = new Color("#c4b18a")
    const c = new Color()
    for (let i = 0; i < pos.count; i += 1) {
      const y = pos.getY(i)
      if (y > 3.3) c.copy(snow)
      else if (y > 1.6) c.lerpColors(rock, snow, (y - 1.6) / 1.7)
      else if (y > 0.35) c.lerpColors(grass, rock, (y - 0.35) / 1.25)
      else c.copy(sand)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    g.setAttribute("color", new Float32BufferAttribute(colors, 3))
    return g
  }, [])
  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshStandardMaterial vertexColors color="#ffffff" roughness={0.92} metalness={0} />
    </mesh>
  )
}

export function TianShanScene({ onPoint }: { onPoint: (title: string, text: string) => void }) {
  return (
    <>
      <color attach="background" args={["#9ec7e6"]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#d7e8ff", "#6b5a40", 0.85]} />
      <directionalLight position={[12, 16, 6]} intensity={2.1} color="#fff5d6" />
      <Terrain />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.38, 0.15]} scale={[1, 0.55, 1]}>
        <circleGeometry args={[6.2, 48]} />
        <meshStandardMaterial color="#1f7aa8" roughness={0.18} metalness={0.08} side={DoubleSide} />
      </mesh>
      <Html position={[0, 1.1, 0]} center>
        <button type="button" className="hotspot" onClick={() => onPoint("Иссык-Куль", "Соль и глубина почти не дают озеру замёрзнуть.")}>
          Иссык-Куль
        </button>
      </Html>
      <Html position={[-2.2, 3.8, -5.5]} center>
        <button type="button" className="hotspot" onClick={() => onPoint("Тянь-Шань", "Снеговые хребты держат котловину озера.")}>
          Тянь-Шань
        </button>
      </Html>
      <Html position={[4.5, 1.4, 2]} center>
        <button type="button" className="hotspot" onClick={() => onPoint("Чуйская долина", "На северо-западе — путь к Бишкеку и степи.")}>
          К северу
        </button>
      </Html>
    </>
  )
}
