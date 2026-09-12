import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';

interface TeamMemberNode {
  name: string;
  role: string;
  skills: string[];
  color: string;
  pos: [number, number, number];
}

export default function TeamGraphScene({
  members = [
    { name: 'Alex Chen', role: 'Full-Stack Lead', skills: ['Python', 'Django', 'React'], color: '#10B981', pos: [-2, 0, 0] },
    { name: 'Priya Sharma', role: 'ML Engineer', skills: ['Python', 'Machine Learning'], color: '#6366F1', pos: [2, 0, 0] },
    { name: 'Role Gap', role: 'UI/UX Designer', skills: ['Figma', 'Design Systems'], color: '#F43F5E', pos: [0, 1.8, 0] },
  ],
  className = '',
}: {
  members?: TeamMemberNode[];
  className?: string;
}) {
  return (
    <div className={`relative w-full h-[440px] rounded-2xl overflow-hidden bg-[#060813] border border-gray-800 ${className}`}>
      <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 8, 5]} intensity={2} color="#10B981" />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#6366F1" />

        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
          {/* Team Center Hub */}
          <mesh position={[0, 0, 0]}>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color="#10B981" emissive="#059669" emissiveIntensity={0.8} />
          </mesh>

          {/* Members */}
          {members.map((m) => (
            <group key={m.name} position={m.pos}>
              <mesh>
                <sphereGeometry args={[0.5, 24, 24]} />
                <meshStandardMaterial
                  color={m.color}
                  emissive={m.color}
                  emissiveIntensity={0.6}
                  wireframe={m.role.includes('Gap')}
                />
              </mesh>

              <Html distanceFactor={11} position={[0, -0.8, 0]} center>
                <div className="pointer-events-none text-center whitespace-nowrap bg-gray-950/90 text-white px-2.5 py-1 rounded-lg border border-gray-700 shadow-xl backdrop-blur-md">
                  <div className="font-bold text-[11px]">{m.name}</div>
                  <div className="text-[10px] text-gray-400">{m.role}</div>
                  <div className="flex gap-1 justify-center mt-1">
                    {m.skills.map((s) => (
                      <span key={s} className="text-[9px] font-mono bg-gray-800 px-1 rounded text-gray-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Html>
            </group>
          ))}
        </Float>

        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>

      <div className="absolute top-3 left-3 text-xs font-mono text-gray-400 bg-gray-950/80 px-3 py-1.5 rounded-xl border border-gray-800 pointer-events-none">
        <span className="text-emerald-400 font-bold">◈ 3D Team Formation Graph</span> · Verified skill coverage &amp; gaps
      </div>
    </div>
  );
}
