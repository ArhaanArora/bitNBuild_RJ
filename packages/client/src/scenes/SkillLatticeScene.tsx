import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

export interface LatticeSkill {
  name: string;
  category: string;
  score: number; // 0 - 100
  confidence: number; // 0 - 100
  status: string;
}

interface SkillLatticeSceneProps {
  skills: LatticeSkill[];
  className?: string;
}

function LatticeNode({
  skill,
  position,
  elevation,
}: {
  skill: LatticeSkill;
  position: [number, number, number];
  elevation: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
    }
  });

  const isVerified = skill.status === 'VERIFIED' || skill.score >= 70;
  const color = isVerified ? '#10B981' : '#6366F1';

  return (
    <group position={[position[0], elevation, position[2]]}>
      {/* Elevation Stalk connecting node to ground plane */}
      <mesh position={[0, -elevation / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, elevation, 8]} />
        <meshBasicMaterial color="#374151" transparent opacity={0.6} />
      </mesh>

      {/* Main Skill Node */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.3 : 1}
      >
        <octahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Floating HTML Label */}
      <Html distanceFactor={12} position={[0, 0.5, 0]} center>
        <div className="pointer-events-none text-center whitespace-nowrap">
          <div className="bg-gray-950/90 text-white px-2 py-0.5 rounded border border-gray-700 shadow-xl backdrop-blur-md text-[10px] font-mono">
            <span className="font-bold">{skill.name}</span>
            <span className="text-emerald-400 ml-1">({skill.score}%)</span>
            <div className="text-[9px] text-gray-400">Conf: {skill.confidence}%</div>
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function SkillLatticeScene({
  skills,
  className = '',
}: SkillLatticeSceneProps) {
  const displaySkills: LatticeSkill[] = skills.length > 0
    ? skills
    : [
        { name: 'Python', category: 'Backend', score: 92, confidence: 95, status: 'VERIFIED' },
        { name: 'Django', category: 'Backend', score: 88, confidence: 91, status: 'VERIFIED' },
        { name: 'React', category: 'Frontend', score: 94, confidence: 96, status: 'VERIFIED' },
        { name: 'TypeScript', category: 'Programming', score: 91, confidence: 93, status: 'VERIFIED' },
        { name: 'PostgreSQL', category: 'Database', score: 86, confidence: 89, status: 'VERIFIED' },
        { name: 'Three.js / 3D', category: 'Creative', score: 95, confidence: 94, status: 'VERIFIED' },
      ];

  return (
    <div className={`relative w-full h-[460px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#060A14] to-[#04060C] border border-gray-800 ${className}`}>
      <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 8, 5]} intensity={2} color="#10B981" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#6366F1" />

        {/* 3D Spatial Grid Floor */}
        <gridHelper args={[10, 10, '#10B981', '#1F2937']} position={[0, 0, 0]} />

        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          {displaySkills.map((skill, idx) => {
            const count = displaySkills.length;
            const angle = (idx / count) * Math.PI * 2;
            const radius = 2.6;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            // Elevation corresponds to confidence and score (higher = higher elevation)
            const elevation = 0.5 + (skill.score / 100) * 1.8;

            return (
              <LatticeNode
                key={skill.name}
                skill={skill}
                position={[x, 0, z]}
                elevation={elevation}
              />
            );
          })}
        </Float>

        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-3 left-3 text-[11px] font-mono text-gray-400 bg-gray-950/80 px-3 py-1.5 rounded-xl border border-gray-800 pointer-events-none">
        <span className="text-emerald-400 font-bold">▲ 3D Skill Lattice</span> · Elevation encodes verification confidence
      </div>
    </div>
  );
}
