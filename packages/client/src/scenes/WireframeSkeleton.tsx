import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function WireframeSkeleton() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group>
      {/* Central Wireframe Icosahedron */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshStandardMaterial
          wireframe
          color="#10B981"
          emissive="#059669"
          emissiveIntensity={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Orbiting Shimmer Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.2, 0.03, 16, 100]} />
        <meshBasicMaterial color="#34D399" wireframe opacity={0.5} transparent />
      </mesh>

      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#10B981" />
    </group>
  );
}
