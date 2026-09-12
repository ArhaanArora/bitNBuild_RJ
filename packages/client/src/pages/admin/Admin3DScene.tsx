import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, Shield, Cpu, Database, Server, Zap, RefreshCw } from 'lucide-react';

interface ServiceNode {
  id: string;
  name: string;
  role: string;
  position: [number, number, number];
  color: string;
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  latency: string;
  rps: string;
}

const NODES: ServiceNode[] = [
  { id: 'gateway', name: 'API Gateway', role: 'Express Node Port 6970', position: [0, 1.2, 0], color: '#6366F1', status: 'OPTIMAL', latency: '4ms', rps: '420 req/s' },
  { id: 'postgres', name: 'PostgreSQL DB', role: 'Neon Cloud Cluster', position: [-2.4, -0.6, 0], color: '#10B981', status: 'OPTIMAL', latency: '14ms', rps: '1,840 op/s' },
  { id: 'ai_engine', name: 'AI Inference Engine', role: 'Model Router (Sec 20A)', position: [2.4, -0.6, 0], color: '#A855F7', status: 'OPTIMAL', latency: '920ms', rps: '18 inf/m' },
  { id: 'verification', name: 'Verification Worker', role: 'Static AST & Proctoring', position: [-1.4, 2.2, -1], color: '#3B82F6', status: 'OPTIMAL', latency: '650ms', rps: '35 job/m' },
  { id: 'auth', name: 'Auth & RBAC Guard', role: 'JWT & Session Tokenizer', position: [1.4, 2.2, -1], color: '#EC4899', status: 'OPTIMAL', latency: '2ms', rps: '140 auth/s' },
  { id: 'cache', name: 'Redis Cache Layer', role: 'Query & Token Cache', position: [0, -2.0, 0.5], color: '#F59E0B', status: 'OPTIMAL', latency: '1ms', rps: '2,400 hit/s' },
];

function NodeMesh({ node, onSelect, isSelected }: { node: ServiceNode; onSelect: (node: ServiceNode) => void; isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group position={node.position}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => onSelect(node)}
          scale={isSelected ? 1.3 : (hovered ? 1.2 : 1)}
        >
          <octahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={hovered || isSelected ? 0.8 : 0.3}
            roughness={0.2}
            metalness={0.8}
            wireframe={false}
          />
        </mesh>

        {/* Glow halo */}
        <mesh scale={isSelected ? 1.6 : (hovered ? 1.4 : 1.2)}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={hovered ? 0.25 : 0.12}
            wireframe
          />
        </mesh>

        {/* Text Label */}
        <Text
          position={[0, -0.65, 0]}
          fontSize={0.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          {node.name}
        </Text>
      </Float>
    </group>
  );
}

function ConnectionLines() {
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#4F46E5', transparent: true, opacity: 0.35 });
  const points = [
    new THREE.Vector3(0, 1.2, 0), new THREE.Vector3(-2.4, -0.6, 0),
    new THREE.Vector3(0, 1.2, 0), new THREE.Vector3(2.4, -0.6, 0),
    new THREE.Vector3(0, 1.2, 0), new THREE.Vector3(-1.4, 2.2, -1),
    new THREE.Vector3(0, 1.2, 0), new THREE.Vector3(1.4, 2.2, -1),
    new THREE.Vector3(-2.4, -0.6, 0), new THREE.Vector3(0, -2.0, 0.5),
    new THREE.Vector3(2.4, -0.6, 0), new THREE.Vector3(0, -2.0, 0.5),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return <primitive object={new THREE.LineSegments(geometry, lineMaterial)} />;
}

export const Admin3DScene: React.FC<{ onSwitchTo2D: () => void }> = ({ onSwitchTo2D }) => {
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(NODES[0]);

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black border border-gray-800 shadow-2xl">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4F46E5" />
        
        <ConnectionLines />
        {NODES.map(node => (
          <NodeMesh
            key={node.id}
            node={node}
            onSelect={n => setSelectedNode(n)}
            isSelected={selectedNode?.id === node.id}
          />
        ))}

        <OrbitControls enablePan={true} enableZoom={true} maxDistance={10} minDistance={3} />
      </Canvas>

      {/* Control Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-gray-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-700/60 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-white tracking-wide uppercase">3D Spatial Topology Mode</span>
          <span className="text-[10px] text-gray-400">WebGL Active</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onSwitchTo2D}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-xs text-white border border-gray-700 backdrop-blur-md transition shadow-md"
          >
            Switch to Standard 2D View
          </button>
        </div>
      </div>

      {/* Node Inspector Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-gray-900/90 backdrop-blur-md border border-gray-700/80 rounded-xl p-4 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h4 className="text-sm font-bold text-white">{selectedNode.name}</h4>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">{selectedNode.role}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] rounded font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {selectedNode.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-800 text-xs">
            <div className="bg-gray-950/60 p-2 rounded-lg border border-gray-800">
              <span className="text-[10px] text-gray-500 block">Roundtrip Latency</span>
              <span className="font-mono font-bold text-emerald-400">{selectedNode.latency}</span>
            </div>
            <div className="bg-gray-950/60 p-2 rounded-lg border border-gray-800">
              <span className="text-[10px] text-gray-500 block">Active Throughput</span>
              <span className="font-mono font-bold text-indigo-300">{selectedNode.rps}</span>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-gray-500 flex items-center justify-between">
            <span>Drag to rotate 3D view</span>
            <span>Scroll to zoom</span>
          </div>
        </div>
      )}
    </div>
  );
};
