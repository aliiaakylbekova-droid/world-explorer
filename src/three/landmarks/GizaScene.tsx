import { Html } from "@react-three/drei"

function Pyramid({
  position,
  size,
  height,
}: {
  position: [number, number, number]
  size: number
  height: number
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <coneGeometry args={[size, height, 4]} />
      <meshStandardMaterial color="#c9ae7a" roughness={0.78} />
    </mesh>
  )
}

function Sphinx() {
  return (
    <group position={[3.4, 0.35, 2.8]} rotation={[0, -0.6, 0]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.8, 0.55, 0.7]} />
        <meshStandardMaterial color="#c2a36d" roughness={0.82} />
      </mesh>
      <mesh position={[0.85, 0.55, 0]} castShadow>
        <boxGeometry args={[0.55, 0.7, 0.55]} />
        <meshStandardMaterial color="#c2a36d" roughness={0.8} />
      </mesh>
      <mesh position={[0.85, 1.05, 0]}>
        <boxGeometry args={[0.42, 0.35, 0.42]} />
        <meshStandardMaterial color="#b99662" roughness={0.75} />
      </mesh>
      <mesh position={[1.12, 0.95, 0]}>
        <boxGeometry args={[0.12, 0.16, 0.18]} />
        <meshStandardMaterial color="#a78454" />
      </mesh>
      <mesh position={[-0.95, 0.05, 0.22]}>
        <boxGeometry args={[0.35, 0.18, 0.18]} />
        <meshStandardMaterial color="#c2a36d" />
      </mesh>
    </group>
  )
}

export function GizaScene({ onPoint }: { onPoint: (title: string, text: string) => void }) {
  return (
    <>
      <color attach="background" args={["#f0d5a0"]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffe6b0", "#8a6a3a", 0.7]} />
      <directionalLight position={[10, 18, 8]} intensity={2.2} color="#ffe6b3" castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#d7b57a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[18, 0.01, 8]}>
        <planeGeometry args={[22, 6]} />
        <meshStandardMaterial color="#4f8aa8" roughness={0.3} />
      </mesh>
      <Pyramid position={[0, 1.55, 0]} size={2.2} height={3.1} />
      <Pyramid position={[-3.4, 1.15, -1.1]} size={1.7} height={2.3} />
      <Pyramid position={[-5.6, 0.75, -2]} size={1.1} height={1.5} />
      <Sphinx />
      <Html position={[0, 3.3, 0]} center>
        <button type="button" className="hotspot" onClick={() => onPoint("Хеопс", "Великая пирамида. Единственное сохранившееся чудо древнего мира.")}>
          Хеопс
        </button>
      </Html>
      <Html position={[3.6, 1.4, 2.8]} center>
        <button type="button" className="hotspot" onClick={() => onPoint("Сфинкс", "Тело льва, лицо фараона. Смотрит на восток, к солнцу и Нилу.")}>
          Сфинкс
        </button>
      </Html>
      <Html position={[18, 0.8, 8]} center>
        <button type="button" className="hotspot" onClick={() => onPoint("Нил", "Долина реки кормила Египет. Пустыня начинается в сотнях метров от воды.")}>
          Нил
        </button>
      </Html>
    </>
  )
}
