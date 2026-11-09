import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import type { LandmarkDef } from "../data/world"
import { LandmarkMesh } from "./LandmarkMesh"

export function LandmarkStage({ landmark }: { landmark: LandmarkDef }) {
  return (
    <Canvas camera={{ position: [2.4, 1.8, 3.4], fov: 40 }} dpr={[1, 2]}>
      <color attach="background" args={["#08203a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} color="#fff1c9" />
      <directionalLight position={[-3, 1, -2]} intensity={0.5} color="#2ec4b6" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[2.4, 40]} />
        <meshStandardMaterial color="#0b2a4a" metalness={0.2} roughness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.55, 1.7, 40]} />
        <meshBasicMaterial color="#e8c547" />
      </mesh>
      <group position={[0, 0.02, 0]}>
        <LandmarkMesh kind={landmark.kind} id={landmark.id} />
      </group>
      <OrbitControls enablePan={false} minDistance={2.2} maxDistance={6} autoRotate autoRotateSpeed={0.8} />
    </Canvas>
  )
}
