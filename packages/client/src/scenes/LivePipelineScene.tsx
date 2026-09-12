import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { AgentResult } from '../types/analysis';

interface LivePipelineSceneProps {
  agents: AgentResult[];
  activeAgentIndex: number;
  className?: string;
}

function PipelineNode({
  agent,
  index,
  total,
  isActive,
  isCompleted,
}: {
  agent: AgentResult;
  index: number;
  total: number;
  isActive: boolean;
  isCompleted: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Position along a gentle circular arc
  const angle = (index / (total - 1 || 1)) * Math.PI - Math.PI / 2;
  const radius = 4.2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * 2.2;

  useFrame(({ clock }) => {
    if (isActive && ringRef.current) {
      ringRef.current.rotation.z += 0.05;
      const s = 1 + Math.sin(clock.getElapsedTime() * 6) * 0.15;
      ringRef.current.scale.set(s, s, s);
    }
  });

  const nodeColor = isCompleted
    ? '#10B981' // Green
    : isActive
    ? '#6366F1' // Indigo pulsing
    : '#374151'; // Dim gray

  return (
    <group position={[x, y, 0]}>
      {/* Active Pulsing Ring */}
      {isActive && (
        <mesh ref={ringRef}>
          <ringGeometry args={[0.55, 0.65, 32]} />
          <meshBasicMaterial color="#818CF8" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Main Agent Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isActive ? 0.9 : isCompleted ? 0.6 : 0.1}
          wireframe={!isCompleted && !isActive}
        />
      </mesh>

      {/* HTML Agent Label */}
      <Html distanceFactor={11} position={[0, -0.6, 0]} center>
        <div className="pointer-events-none text-center whitespace-nowrap">
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              isActive
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-500 animate-pulse font-bold'
                : isCompleted
                ? 'bg-emerald-950/80 text-emerald-400 font-semibold'
                : 'text-gray-500'
            }`}
          >
            {agent.name.replace(' Agent', '')}
          </span>
        </div>
      </Html>
    </group>
  );
}

export default function LivePipelineScene({
  agents,
  activeAgentIndex,
  className = '',
}: LivePipelineSceneProps) {
  return (
    <div className={`relative w-full h-[360px] rounded-2xl overflow-hidden bg-[#070B16] border border-gray-800 ${className}`}>
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#10B981" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#6366F1" />

        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          {agents.map((agent, i) => (
            <PipelineNode
              key={agent.agentId}
              agent={agent}
              index={i}
              total={agents.length}
              isActive={i === activeAgentIndex}
              isCompleted={i < activeAgentIndex}
            />
          ))}
        </Float>
      </Canvas>

      <div className="absolute top-3 left-3 text-xs font-mono text-gray-400 pointer-events-none">
        <span className="text-emerald-400 font-bold">● 3D Spatial Pipeline</span> · Watch agent nodes ignite
      </div>
    </div>
  );
}
