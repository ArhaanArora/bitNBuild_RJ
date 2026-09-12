import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Finding, ConstellationNode } from '../types/analysis';
import { ShieldCheck, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface EvidenceShellProps {
  node: ConstellationNode;
  findings: Finding[];
  onClose: () => void;
  className?: string;
}

function CrystallineFragment({
  finding,
  position,
  isSelected,
  onClick,
}: {
  finding: Finding;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  const color =
    finding.risk === 'CRITICAL'
      ? '#EF4444'
      : finding.risk === 'HIGH'
      ? '#F97316'
      : finding.risk === 'MEDIUM'
      ? '#FBBF24'
      : finding.risk === 'LOW'
      ? '#38BDF8'
      : '#10B981';

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={isSelected ? 1.4 : hovered ? 1.25 : 1}
      >
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.9 : hovered ? 0.7 : 0.4}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Mini Finding Tag */}
      {hovered && (
        <Html distanceFactor={10} position={[0, 0.6, 0]} center>
          <div className="pointer-events-none bg-gray-950 text-white px-2 py-1 rounded text-[10px] font-mono border border-gray-700 shadow-xl whitespace-nowrap">
            <span className="font-bold">{finding.title}</span>
            <span className="text-gray-400 ml-1">({finding.confidence}%)</span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function EvidenceShell({
  node,
  findings,
  onClose,
  className = '',
}: EvidenceShellProps) {
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(
    findings[0] || null
  );

  return (
    <div className={`relative w-full h-[520px] bg-[#050811] rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row ${className}`}>
      {/* 3D Crystalline Evidence Orbit (Left/Center) */}
      <div className="flex-1 relative h-64 md:h-full">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <pointLight position={[5, 5, 5]} intensity={2} color="#10B981" />
          <pointLight position={[-5, -5, -5]} intensity={1} color="#6366F1" />

          {/* Central Agent Node Halo */}
          <mesh>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.3}
              wireframe
            />
          </mesh>

          {/* Orbiting Crystalline Evidence Fragments */}
          <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
            {findings.map((f, idx) => {
              const angle = (idx / Math.max(1, findings.length)) * Math.PI * 2;
              const radius = 2.0 + (idx % 2) * 0.4;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(idx) * 0.8;
              const z = Math.sin(angle) * radius;

              return (
                <CrystallineFragment
                  key={f.id}
                  finding={f}
                  position={[x, y, z]}
                  isSelected={selectedFinding?.id === f.id}
                  onClick={() => setSelectedFinding(f)}
                />
              );
            })}
          </Float>

          <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.8} />
        </Canvas>

        {/* Header Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: node.color }}
            />
            <h3 className="font-bold text-white text-base">{node.label}</h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              Score: {node.score}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Click crystalline fragments to inspect verification findings
          </p>
        </div>

        {/* Close Shell Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-700 transition"
          title="Close Evidence Shell"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Finding Inspector Panel (Right) */}
      <div className="w-full md:w-96 bg-gray-950/95 border-t md:border-t-0 md:border-l border-gray-800/80 p-5 overflow-y-auto flex flex-col justify-between">
        {selectedFinding ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  selectedFinding.risk === 'CRITICAL' || selectedFinding.risk === 'HIGH'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : selectedFinding.risk === 'MEDIUM'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {selectedFinding.risk} Risk
              </span>
              <span className="text-xs font-mono text-gray-400">
                Confidence: <strong className="text-white">{selectedFinding.confidence}%</strong>
              </span>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm">{selectedFinding.title}</h4>
              <p className="text-[11px] font-mono text-indigo-400 mt-0.5">{selectedFinding.location}</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1.5 text-xs text-gray-300">
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Reasoning & Evidence</p>
              <p>{selectedFinding.reasoning}</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1 text-xs text-emerald-300">
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Recommendation</p>
              <p>{selectedFinding.recommendation}</p>
            </div>

            <div className="text-[11px] text-gray-500 font-mono border-t border-gray-800/80 pt-3">
              <span>Detection: {selectedFinding.detectionMethod}</span>
              {selectedFinding.falsePositiveExplanation && (
                <p className="text-gray-400 mt-1 italic">
                  * False-positive check: {selectedFinding.falsePositiveExplanation}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-xs">
            Select a fragment to inspect detailed evidence.
          </div>
        )}

        {/* Switch to flat findings button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-xs font-medium text-gray-300 hover:text-white border border-gray-700 transition text-center"
        >
          Return to Constellation
        </button>
      </div>
    </div>
  );
}
