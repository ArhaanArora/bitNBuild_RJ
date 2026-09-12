import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ConstellationSceneData, ConstellationNode } from '../types/analysis';

interface TrustConstellationProps {
  sceneData: ConstellationSceneData;
  onSelectNode?: (node: ConstellationNode) => void;
  selectedNodeId?: string | null;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Satellite Agent Sphere with Orbit
// ─────────────────────────────────────────────────────────────────────────────
function SatelliteNode({
  node,
  isSelected,
  onClick,
  prefersReducedMotion,
}: {
  node: ConstellationNode;
  isSelected: boolean;
  onClick: () => void;
  prefersReducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (prefersReducedMotion) return;
    const t = clock.getElapsedTime() * node.orbitSpeed;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(t) * node.orbitRadius;
      groupRef.current.position.z = Math.sin(t) * node.orbitRadius;
      groupRef.current.position.y = Math.sin(t * 1.5) * node.orbitTilt * 2;
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[node.orbitRadius, 0, 0]}>
      {/* Node Sphere */}
      <mesh
        ref={sphereRef}
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
        <sphereGeometry args={[node.radius, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected ? 0.9 : hovered ? 0.7 : 0.4}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Halo Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[node.radius * 1.25, node.radius * 1.35, 32]} />
        <meshBasicMaterial
          color={node.color}
          side={THREE.DoubleSide}
          transparent
          opacity={isSelected ? 0.8 : hovered ? 0.6 : 0.25}
        />
      </mesh>

      {/* Floating HTML Label */}
      {(hovered || isSelected) && (
        <Html distanceFactor={14} position={[0, node.radius + 0.5, 0]} center>
          <div className="pointer-events-none bg-gray-950/90 text-white px-2.5 py-1 rounded-lg border border-gray-700 shadow-2xl backdrop-blur-md text-[11px] font-mono whitespace-nowrap z-50">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: node.color }}
              />
              <span className="font-bold">{node.label}</span>
              <span className="text-gray-400">({node.score}%)</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Confidence: {node.confidence}% · Findings: {node.findingsCount}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Central Core Score Sphere
// ─────────────────────────────────────────────────────────────────────────────
function CoreSphere({
  node,
  isSelected,
  onClick,
}: {
  node: ConstellationNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = -t * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Glowing Core */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.2 : hovered ? 1.1 : 1}
      >
        <icosahedronGeometry args={[node.radius, 4]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>

      {/* Orbiting Concentric Halos */}
      <mesh ref={haloRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[node.radius * 1.5, 0.03, 16, 64]} />
        <meshBasicMaterial color={node.color} transparent opacity={0.4} />
      </mesh>

      <Html distanceFactor={12} position={[0, -node.radius - 0.6, 0]} center>
        <div className="pointer-events-none text-center select-none">
          <div className="bg-gray-950/90 text-white px-3 py-1.5 rounded-xl border border-gray-700 shadow-2xl backdrop-blur-md">
            <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">
              Trust Score
            </span>
            <span className="text-lg font-extrabold font-mono text-emerald-400">
              {node.score}/100
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated Connecting Beams
// ─────────────────────────────────────────────────────────────────────────────
function RelationshipBeams({ sceneData }: { sceneData: ConstellationSceneData }) {
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const colors: number[] = [];

    sceneData.edges.forEach((edge) => {
      const sourceNode = sceneData.nodes.find((n) => n.id === edge.source);
      const targetNode = sceneData.nodes.find((n) => n.id === edge.target);

      if (sourceNode && targetNode) {
        const srcPos = new THREE.Vector3(
          sourceNode.orbitRadius || 0,
          0,
          0
        );
        const tgtPos = new THREE.Vector3(
          targetNode.orbitRadius || 0,
          0,
          0
        );

        points.push(srcPos, tgtPos);
        const col = edge.type === 'contradiction' ? 0xff3b30 : 0x10b981;
        colors.push(col, col);
      }
    });

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [sceneData]);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial
        color="#10B981"
        transparent
        opacity={0.25}
        linewidth={1.5}
      />
    </lineSegments>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Master Trust Constellation Canvas
// ─────────────────────────────────────────────────────────────────────────────
export default function TrustConstellation({
  sceneData,
  onSelectNode,
  selectedNodeId,
  className = '',
}: TrustConstellationProps) {
  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const coreNode = sceneData.nodes.find((n) => n.role === 'core');
  const satelliteNodes = sceneData.nodes.filter((n) => n.role === 'satellite');

  return (
    <div
      className={`relative w-full h-full min-h-[440px] bg-gradient-to-b from-[#060911] via-[#0A0F1D] to-[#060911] rounded-2xl overflow-hidden border border-gray-800/80 shadow-2xl ${className}`}
    >
      <Canvas
        camera={{ position: [0, 6, 12], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 15, 10]} intensity={2.5} color="#34D399" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#6366F1" />

        {/* Ambient Cosmic Starfield */}
        <Stars radius={40} depth={30} count={1200} factor={4} saturation={0.5} fade speed={1} />

        <Float speed={prefersReducedMotion ? 0 : 1.2} rotationIntensity={0.2} floatIntensity={0.4}>
          {/* Core Node */}
          {coreNode && (
            <CoreSphere
              node={coreNode}
              isSelected={selectedNodeId === coreNode.id}
              onClick={() => onSelectNode?.(coreNode)}
            />
          )}

          {/* Orbiting Satellite Nodes */}
          {satelliteNodes.map((node) => (
            <SatelliteNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onClick={() => onSelectNode?.(node)}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}

          {/* Relationship Beams */}
          <RelationshipBeams sceneData={sceneData} />
        </Float>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={6}
          maxDistance={22}
          maxPolarAngle={Math.PI / 2 + 0.2}
          autoRotate={!prefersReducedMotion && !selectedNodeId}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Spatial Legend & Controls overlay */}
      <div className="absolute bottom-3 left-3 pointer-events-none flex flex-wrap items-center gap-2 text-[11px] font-mono text-gray-400 bg-gray-950/80 px-3 py-1.5 rounded-xl border border-gray-800/80 backdrop-blur-md">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          High Trust (80+)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          Review (50-79)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          Risk (&lt;50)
        </span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-400">Drag to rotate · Scroll to zoom · Click node to inspect</span>
      </div>
    </div>
  );
}
