import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ActivityNode } from '../../types/valueChain';
import { useValueChainStore } from '../../store/useValueChainStore';

interface Node3DProps {
  activity: ActivityNode;
}

export const Node3D: React.FC<Node3DProps> = ({ activity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);

  const selectedActivityId = useValueChainStore((s) => s.selectedActivityId);
  const hoveredActivityId = useValueChainStore((s) => s.hoveredActivityId);
  const selectActivity = useValueChainStore((s) => s.selectActivity);
  const setHoveredActivity = useValueChainStore((s) => s.setHoveredActivity);

  const isSelected = selectedActivityId === activity.id;
  const isHovered = hoveredActivityId === activity.id;
  const isMargin = activity.category === 'margin';
  const isSupport = activity.category === 'support';
  const isBottleneck =
    activity.systemicRole.bottleneckRisk === 'critical' ||
    activity.metrics.budgetUSD < activity.defaultMetrics.budgetUSD * 0.6 ||
    activity.metrics.automationPct < 50;

  const [hoveredLocal, setHoveredLocal] = useState(false);

  // Smooth hover/select scaling and subtle idle rotation
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetScale = isSelected ? 1.15 : isHovered || hoveredLocal ? 1.08 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);

    // Margin node spins slightly
    if (isMargin) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.z += delta * 0.2;
    }

    // Pulse glow if selected or bottleneck
    if (glowMeshRef.current) {
      if (isBottleneck) {
        const pulse = (Math.sin(state.clock.elapsedTime * 4) + 1) * 0.5;
        const mat = glowMeshRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.25 + pulse * 0.35;
      } else if (isSelected) {
        const pulse = (Math.sin(state.clock.elapsedTime * 3) + 1) * 0.5;
        const mat = glowMeshRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + pulse * 0.25;
      }
    }
  });

  // Base colors
  let baseColor = '#0D1322';
  let emissiveColor = '#1D63FF';
  let emissiveIntensity = 0.2;

  if (isMargin) {
    baseColor = '#1B2436';
    emissiveColor = '#387BFF';
    emissiveIntensity = 0.7;
  } else if (isSupport) {
    baseColor = '#111827';
    emissiveColor = '#5C96FF';
    emissiveIntensity = 0.15;
  }

  if (isBottleneck) {
    emissiveColor = '#EF4444';
    emissiveIntensity = 0.8;
  } else if (isSelected) {
    emissiveColor = '#387BFF';
    emissiveIntensity = 0.9;
  } else if (isHovered || hoveredLocal) {
    emissiveColor = '#8AB8FF';
    emissiveIntensity = 0.6;
  }

  // Node dimensions based on category
  const boxWidth = isMargin ? 1.8 : isSupport ? 2.1 : 2.0;
  const boxHeight = isMargin ? 1.8 : isSupport ? 1.1 : 1.3;
  const boxDepth = isMargin ? 1.8 : isSupport ? 1.2 : 1.4;

  return (
    <Float
      speed={isMargin ? 2.5 : 1.5}
      rotationIntensity={isMargin ? 0.4 : 0.15}
      floatIntensity={isMargin ? 0.6 : 0.3}
      position={activity.position3D}
    >
      <group>
        {/* Outer Glow Halo for Selected or Bottleneck or Margin */}
        {(isSelected || isBottleneck || isMargin) && (
          <mesh ref={glowMeshRef}>
            <sphereGeometry args={[isMargin ? 1.6 : 1.5, 16, 16]} />
            <meshBasicMaterial
              color={isBottleneck ? '#EF4444' : isMargin ? '#387BFF' : '#1D63FF'}
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>
        )}

        {/* Main 3D Interactive Mesh */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            selectActivity(activity.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredLocal(true);
            setHoveredActivity(activity.id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHoveredLocal(false);
            setHoveredActivity(null);
            document.body.style.cursor = 'auto';
          }}
        >
          {isMargin ? (
            <octahedronGeometry args={[1.2, 0]} />
          ) : (
            <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
          )}

          <meshStandardMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Wireframe border cage for high tech cyber aesthetic */}
        <mesh position={[0, 0, 0]}>
          {isMargin ? (
            <octahedronGeometry args={[1.22, 0]} />
          ) : (
            <boxGeometry args={[boxWidth + 0.02, boxHeight + 0.02, boxDepth + 0.02]} />
          )}
          <meshBasicMaterial
            color={
              isBottleneck
                ? '#EF4444'
                : isSelected
                ? '#8AB8FF'
                : isMargin
                ? '#387BFF'
                : isSupport
                ? '#2C374B'
                : '#1D63FF'
            }
            wireframe
            transparent
            opacity={isSelected || isHovered || hoveredLocal ? 0.9 : 0.35}
          />
        </mesh>

        {/* Floating Label and Tooltip HTML Overlay */}
        <Html
          position={[0, isSupport ? 0.95 : 1.1, 0]}
          center
          distanceFactor={18}
          className="pointer-events-none select-none"
        >
          <div className="flex flex-col items-center">
            {/* Primary Pill Badge */}
            <div
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase border shadow-lg transition-all duration-300 backdrop-blur-md ${
                isSelected
                  ? 'bg-[#1D63FF] text-white border-[#8AB8FF] shadow-[0_0_15px_rgba(29,99,255,0.6)] scale-110'
                  : isBottleneck
                  ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/60 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : isMargin
                  ? 'bg-[#1B2436]/90 text-[#8AB8FF] border-[#387BFF]/50 shadow-[0_0_12px_rgba(56,123,255,0.4)]'
                  : 'bg-[#0D1322]/90 text-[#C5D0DE] border-[#2C374B]'
              }`}
            >
              <span>{activity.code}</span>
            </div>

            {/* Title preview */}
            <span
              className={`mt-1 text-[11px] font-semibold whitespace-nowrap px-2 py-0.5 rounded transition-all duration-200 ${
                isSelected
                  ? 'text-[#8AB8FF] bg-[#050508]/80'
                  : isHovered || hoveredLocal
                  ? 'text-white bg-[#0D1322]/90 shadow'
                  : 'text-[#8FA0B5] bg-[#050508]/60'
              }`}
            >
              {activity.name.length > 24 ? activity.name.slice(0, 22) + '...' : activity.name}
            </span>

            {/* Hover Tooltip Card */}
            {(isHovered || hoveredLocal) && !isSelected && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#0D1322]/95 border border-[#1D63FF]/50 shadow-2xl backdrop-blur-xl text-left w-56 animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between text-[10px] text-[#8FA0B5] mb-1 font-mono">
                  <span className="uppercase text-[#8AB8FF]">{activity.category}</span>
                  <span>SLA: {activity.metrics.slaPct}%</span>
                </div>
                <div className="text-[12px] font-bold text-[#F2F5F8] leading-snug mb-1">
                  {activity.name}
                </div>
                <div className="text-[10px] text-[#C5D0DE] line-clamp-2 mb-2">
                  {activity.shortDescription}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#2C374B] text-[10px] font-mono">
                  <span className="text-[#8FA0B5]">Eficiencia</span>
                  <span className="text-[#10B981] font-bold">{activity.metrics.efficiencyScore}%</span>
                </div>
              </div>
            )}
          </div>
        </Html>
      </group>
    </Float>
  );
};
