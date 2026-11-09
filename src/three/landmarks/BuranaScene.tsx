import { Guide } from "./Guide"

export function BuranaScene({
  speech,
  speaking,
}: {
  speech: string
  speaking: boolean
}) {
  return (
    <>
      <color attach="background" args={["#c5dff2"]} />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={["#e7f3ff", "#7a6a48", 0.8]} />
      <directionalLight position={[8, 14, 5]} intensity={2.1} color="#fff4d0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color="#c4b07a" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[4.2, 32]} />
        <meshStandardMaterial color="#b89a62" roughness={0.88} />
      </mesh>
      {[-2.4, -0.8, 0.9, 2.2].map((x, i) => (
        <mesh key={x} position={[x, 0.18, -2.6 - (i % 2) * 0.4]}>
          <boxGeometry args={[0.7, 0.36, 0.5]} />
          <meshStandardMaterial color="#a88858" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.82, 3.1, 12]} />
        <meshStandardMaterial color="#c9a56a" roughness={0.72} />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.48, 0.55, 0.28, 12]} />
        <meshStandardMaterial color="#b89058" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.55, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 0.45, 8]} />
        <meshStandardMaterial color="#d7c48a" />
      </mesh>
      <Guide position={[0, 3.85, 0.15]} speech={speech} speaking={speaking} />
    </>
  )
}
