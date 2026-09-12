import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function AmbientConstellationGroup() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  // Generate satellite points
  const satellites = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => {
      const angle = (i / 9) * Math.PI * 2;
      const radius = 3.2 + (i % 3) * 0.8;
      const speed = 0.3 + (i % 2) * 0.15;
      const color = i % 3 === 0 ? '#10B981' : i % 3 === 1 ? '#3B82F6' : '#6366F1';
      return { angle, radius, speed, color, size: 0.22 + (i % 2) * 0.08 };
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.25;
      coreRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.2;
    if (ring2Ref.current) ring2Ref.current.rotation.y = -t * 0.15;
  });

  return (
    <group ref={groupRef}>
      {/* Central Trust Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.2, 3]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#059669"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Orbit Rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.35} />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[4.4, 0.02, 16, 100]} />
        <meshBasicMaterial color="#6366F1" transparent opacity={0.3} />
      </mesh>

      {/* Orbiting Satellites */}
      {satellites.map((s, idx) => (
        <mesh
          key={idx}
          position={[
            Math.cos(s.angle) * s.radius,
            Math.sin(s.angle * 2) * 0.5,
            Math.sin(s.angle) * s.radius,
          ]}
        >
          <sphereGeometry args={[s.size, 16, 16]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroConstellation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-[480px] rounded-3xl overflow-hidden ${className}`}>
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#10B981" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#6366F1" />
        <Stars radius={50} depth={40} count={900} factor={3} saturation={0} fade speed={1} />
        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
          <AmbientConstellationGroup />
        </Float>
      </Canvas>
    </div>
  );
}
