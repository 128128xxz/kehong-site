"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, RoundedBox } from "@react-three/drei";

function PackageForm({ active }: { active: boolean }) {
  return (
    <group rotation={[-0.12, 0.35, 0.08]}>
      <RoundedBox args={[2.5, 0.24, 1.8]} radius={0.08} smoothness={4} position={[0, -0.55, 0]}>
        <meshStandardMaterial color="#d9c39b" roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[2.5, 0.18, 0.16]} radius={0.05} smoothness={4} position={[0, 0.15, -0.82]}>
        <meshStandardMaterial color="#f6efde" roughness={0.75} />
      </RoundedBox>
      <RoundedBox args={[0.18, 1.2, 1.8]} radius={0.05} smoothness={4} position={[-1.16, -0.15, 0]}>
        <meshStandardMaterial color="#eadabd" roughness={0.78} />
      </RoundedBox>
      <RoundedBox args={[0.18, 1.2, 1.8]} radius={0.05} smoothness={4} position={[1.16, -0.15, 0]}>
        <meshStandardMaterial color="#eadabd" roughness={0.78} />
      </RoundedBox>
      <RoundedBox args={[2.1, 0.16, 0.16]} radius={0.04} smoothness={4} position={[0, 0.12, 0.74]}>
        <meshStandardMaterial color="#f6efde" roughness={0.75} />
      </RoundedBox>
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]} scale={active ? 1.06 : 1}>
        <boxGeometry args={[1.55, 0.03, 0.85]} />
        <meshStandardMaterial color="#18372e" roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.48, 0.03, 0.3]} />
        <meshStandardMaterial color="#e8c06c" roughness={0.45} />
      </mesh>
    </group>
  );
}

export default function InteractivePortalScene({ active = false }: { active?: boolean }) {
  return (
    <div className="interactive-portal__canvas" aria-label="Interactive packaging structure preview">
      <Canvas camera={{ position: [3.6, 2.5, 4.2], fov: 34 }} dpr={[1, 1.5]} frameloop="demand">
        <color attach="background" args={["#e9e1d2"]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 4, 4]} intensity={2.2} color="#fff7e7" />
        <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#9eb4a7" />
        <PackageForm active={active} />
        <ContactShadows position={[0, -0.72, 0]} opacity={0.35} scale={5} blur={2.4} far={4} />
        <Environment preset="city" />
        <OrbitControls enablePan={false} minDistance={3.3} maxDistance={6} minPolarAngle={0.8} maxPolarAngle={1.8} />
      </Canvas>
    </div>
  );
}
