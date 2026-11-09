import { Html } from "@react-three/drei"

function Beam(props: { position: [number, number, number]; args: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <mesh position={props.position} rotation={props.rotation} castShadow>
      <boxGeometry args={props.args} />
      <meshStandardMaterial color="#6b5a3e" metalness={0.55} roughness={0.38} />
    </mesh>
  )
}

function Leg({ x, z }: { x: number; z: number }) {
  const s = Math.sign(x || 1)
  const t = Math.sign(z || 1)
  return (
    <group>
      <Beam position={[x, 1.15, z]} args={[0.09, 2.4, 0.09]} rotation={[t * 0.18, 0, -s * 0.18]} />
      <Beam position={[x * 0.62, 2.55, z * 0.62]} args={[0.08, 1.5, 0.08]} rotation={[t * 0.1, 0, -s * 0.1]} />
    </group>
  )
}

export function EiffelScene({ onPoint }: { onPoint: (title: string, text: string) => void }) {
  return (
    <>
      <color attach="background" args={["#b9d4ee"]} />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#e7f1ff", "#6a6248", 0.85]} />
      <directionalLight position={[8, 14, 6]} intensity={2.2} color="#fff3cc" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#6f8a58" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.5, 0.02, 2]} receiveShadow>
        <planeGeometry args={[14, 3.2]} />
        <meshStandardMaterial color="#3b7ea8" roughness={0.25} metalness={0.15} />
      </mesh>
      <group>
        {([-1.15, 1.15] as const).flatMap((x) =>
          ([-1.15, 1.15] as const).map((z) => <Leg key={`${x}-${z}`} x={x} z={z} />),
        )}
        <Beam position={[0, 2.15, 0]} args={[1.7, 0.08, 1.7]} />
        <Beam position={[0, 2.15, 0]} args={[2.2, 0.04, 0.05]} />
        <Beam position={[0, 2.15, 0]} args={[0.05, 0.04, 2.2]} />
        <mesh position={[0, 3.7, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.55, 2.2, 4]} />
          <meshStandardMaterial color="#6b5a3e" metalness={0.5} roughness={0.4} />
        </mesh>
        {[2.9, 3.4, 3.9, 4.4].map((y) => (
          <Beam key={y} position={[0, y, 0]} args={[0.85 - (y - 2.8) * 0.12, 0.04, 0.85 - (y - 2.8) * 0.12]} />
        ))}
        <mesh position={[0, 5.15, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.22, 1.4, 6]} />
          <meshStandardMaterial color="#6b5a3e" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0, 6.05, 0]}>
          <coneGeometry args={[0.08, 0.45, 8]} />
          <meshStandardMaterial color="#d7c48a" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      <Html position={[0, 2.4, 1.2]} center>
        <button type="button" className="hotspot" onClick={() => onPoint("Первый ярус", "Платформа держит решётку ног — ветер проходит сквозь металл.")}>
          Решётка
        </button>
      </Html>
      <Html position={[6.5, 0.6, 2]} center>
        <button type="button" className="hotspot" onClick={() => onPoint("Сена", "Река делит Париж. Башня — на левом берегу, у Марсова поля.")}>
          Сена
        </button>
      </Html>
      <Html position={[0, 6.2, 0]} center>
        <button type="button" className="hotspot" onClick={() => onPoint("Шпиль", "Полная высота с антенной — 324 метра.")}>
          324 м
        </button>
      </Html>
    </>
  )
}
