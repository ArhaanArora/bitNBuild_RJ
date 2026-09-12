import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';

interface CandidateComparison {
  name: string;
  role: string;
  trustScore: number;
  skillsScore: number;
  securityScore: number;
  color: string;
  position: [number, number, number];
}

export default function RecruiterCompareScene({
  candidates = [
    { name: 'Alex Chen', role: 'Full-Stack Dev', trustScore: 92, skillsScore: 94, securityScore: 91, color: '#10B981', position: [-2.6, 0, 0] },
    { name: 'Priya Sharma', role: 'ML Engineer', trustScore: 95, skillsScore: 97, securityScore: 93, color: '#6366F1', position: [2.6, 0, 0] },
  ],
  className = '',
}: {
  candidates?: CandidateComparison[];
  className?: string;
}) {
  return (
    <div className={`relative w-full h-[460px] rounded-2xl overflow-hidden bg-[#060913] border border-gray-800 ${className}`}>
      <Canvas camera={{ position: [0, 2, 7.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 8, 5]} intensity={2} color="#10B981" />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#6366F1" />

        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
          {candidates.map((cand) => (
            <group key={cand.name} position={cand.position}>
              {/* Candidate Core Sphere */}
              <mesh>
                <icosahedronGeometry args={[0.9 + (cand.trustScore / 100) * 0.4, 3]} />
                <meshStandardMaterial
                  color={cand.color}
                  emissive={cand.color}
                  emissiveIntensity={0.7}
                  roughness={0.2}
                />
              </mesh>

              {/* Orbiting Verification Rings */}
              <mesh rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[1.8, 0.02, 16, 64]} />
                <meshBasicMaterial color={cand.color} transparent opacity={0.4} />
              </mesh>

              <Html distanceFactor={11} position={[0, -1.6, 0]} center>
                <div className="pointer-events-none text-center whitespace-nowrap bg-gray-950/90 text-white px-3 py-1.5 rounded-xl border border-gray-700 shadow-2xl backdrop-blur-md">
                  <div className="font-bold text-xs">{cand.name}</div>
                  <div className="text-[10px] text-gray-400">{cand.role}</div>
                  <div className="mt-1 font-mono text-xs font-extrabold" style={{ color: cand.color }}>
                    Trust Score: {cand.trustScore}/100
                  </div>
                </div>
              </Html>
            </group>
          ))}
        </Float>

        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>

      <div className="absolute top-3 left-3 text-xs font-mono text-gray-400 bg-gray-950/80 px-3 py-1.5 rounded-xl border border-gray-800 pointer-events-none">
        <span className="text-indigo-400 font-bold">⚡ 3D Compare Mode</span> · Spatial Constellation Comparison
      </div>
    </div>
  );
}
