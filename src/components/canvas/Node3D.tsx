import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ActivityNode } from '../../types/valueChain';
import { useValueChainStore, useSimulationResult, isActivityBottleneck } from '../../store/useValueChainStore';

interface Node3DProps {
  activity: ActivityNode;
  isDimmed?: boolean;
}

export const Node3D: React.FC<Node3DProps> = ({ activity, isDimmed = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const selectedActivityId = useValueChainStore((s) => s.selectedActivityId);
  const hoveredActivityId = useValueChainStore((s) => s.hoveredActivityId);
  const selectActivity = useValueChainStore((s) => s.selectActivity);
  const setHoveredActivity = useValueChainStore((s) => s.setHoveredActivity);

  const isSelected = selectedActivityId === activity.id;
  const isHovered = hoveredActivityId === activity.id;
  const isMargin = activity.category === 'margin';
  const isSupport = activity.category === 'support';
  const isBottleneck = isActivityBottleneck(activity);

  const [hoveredLocal, setHoveredLocal] = useState(false);
  const simulation = useSimulationResult();

  // Reset body cursor on unmount to prevent cursor stickiness
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Chevron shape for the Margin 3D Arrowhead (Clean, sharp, symmetric 2.4-width arrow)
  const chevronShape = useMemo(() => {
    const s = new THREE.Shape();
    // Symmetric Chevron pointing right:
    // Vertical span: y = -4.1 to y = 4.1 (covers both support and primary rows)
    // Apex pointing right at y = -0.1 (x = 2.5)
    // Inner notch at y = -0.1 (x = 0.1)
    // Horizontal thickness = 2.4 everywhere
    s.moveTo(-1.2, -4.1);
    s.lineTo(1.2, -4.1);
    s.lineTo(2.5, -0.1);
    s.lineTo(1.2, 4.1);
    s.lineTo(-1.2, 4.1);
    s.lineTo(0.1, -0.1);
    s.closePath();
    return s;
  }, []);

  // Smooth hover/select scaling
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetScale = isDimmed ? 0.95 : isSelected ? 1.05 : isHovered || hoveredLocal ? 1.03 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
  });

  // Category-based colors for distinct UX clarity
  // Support: Deep Indigo / Lavender
  // Primary: Deep Navy / Electric Sky Blue
  // Margin: Deep Bronze / Golden Amber
  const baseColor = isSupport ? '#151D33' : isMargin ? '#24180A' : '#0B1D3A';
  let emissiveColor = isSupport ? '#818CF8' : isMargin ? '#F59E0B' : '#38BDF8';
  let emissiveIntensity = isMargin ? 0.45 : isSelected ? 0.65 : isHovered || hoveredLocal ? 0.45 : 0.15;

  if (isBottleneck) {
    emissiveColor = '#EF4444';
    emissiveIntensity = 0.75;
  }

  // Node dimensions based on Porter Chevron layout
  const boxWidth = isSupport ? 8.4 : 1.6;
  const boxHeight = isSupport ? 0.75 : 2.2;
  const boxDepth = 0.45;

  // Short labels for clean primary column display
  const getPrimaryShortLabel = () => {
    switch (activity.porterType) {
      case 'inbound_logistics':
        return 'Logística\nEntrada';
      case 'operations':
        return 'Operaciones';
      case 'outbound_logistics':
        return 'Logística\nSalida';
      case 'marketing_sales':
        return 'Marketing\ny Ventas';
      case 'service':
        return 'Servicio\nPostventa';
      default:
        return activity.name;
    }
  };

  return (
    <Float
      speed={isMargin ? 1.2 : 0.6}
      rotationIntensity={0.02}
      floatIntensity={0.1}
      position={activity.position3D}
    >
      <group
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
        {/* Main 3D Interactive Mesh */}
        <mesh
          ref={meshRef}
          position={isMargin ? [0, 0, -0.2] : [0, 0, 0]}
        >
          {isMargin ? (
            <extrudeGeometry
              args={[
                chevronShape,
                { depth: 0.5, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04 },
              ]}
            />
          ) : (
            <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
          )}

          <meshStandardMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={isDimmed ? 0.02 : emissiveIntensity}
            roughness={isDimmed ? 0.9 : 0.25}
            metalness={isDimmed ? 0.1 : 0.7}
            transparent={true}
            opacity={isDimmed ? 0.18 : 1.0}
          />
        </mesh>

        {/* 1. Support Activities: Native WebGL 3D Text on horizontal slab (Never wraps or collides!) */}
        {isSupport && (
          <group position={[-3.9, 0, 0.25]} visible={!isDimmed || isSelected}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.22}
              color="#A5B4FC"
              anchorX="left"
              anchorY="middle"
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- •&"
            >
              {activity.code}
            </Text>
            <Text
              position={[0.9, 0, 0]}
              fontSize={0.2}
              color="#FFFFFF"
              anchorX="left"
              anchorY="middle"
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- •&"
            >
              {`•  ${activity.name}`}
            </Text>
          </group>
        )}

        {/* 2. Primary Activities: Native WebGL 3D Text on vertical pillar (Clean, centered, no collisions!) */}
        {!isSupport && !isMargin && (
          <group position={[0, 0, 0.25]} visible={!isDimmed || isSelected}>
            <Text
              position={[0, 0.65, 0]}
              fontSize={0.24}
              color="#38BDF8"
              anchorX="center"
              anchorY="middle"
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-"
            >
              {activity.code}
            </Text>
            <Text
              position={[0, -0.05, 0]}
              fontSize={0.16}
              lineHeight={1.2}
              textAlign="center"
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 "
            >
              {getPrimaryShortLabel()}
            </Text>
            <Text
              position={[0, -0.75, 0]}
              fontSize={0.14}
              color="#10B981"
              anchorX="center"
              anchorY="middle"
              characters="0123456789%Efic. "
            >
              {`${activity.metrics.efficiencyScore}%`}
            </Text>
          </group>
        )}

        {/* 3. Margin Arrow: Native WebGL 3D HUD & Typography on Chevron face */}
        {isMargin && (
          <group position={[1.30, -0.1, 0.38]} visible={!isDimmed || isSelected}>
            {/* Dark glass HUD plate with illuminated border */}
            <mesh position={[0, 0, 0.005]}>
              <planeGeometry args={[2.0, 3.6]} />
              <meshStandardMaterial
                color="#060C1B"
                roughness={0.25}
                metalness={0.7}
                transparent
                opacity={0.88}
              />
            </mesh>
            <lineSegments position={[0, 0, 0.01]}>
              <edgesGeometry args={[new THREE.PlaneGeometry(2.0, 3.6)]} />
              <lineBasicMaterial color="#F59E0B" transparent opacity={0.65} />
            </lineSegments>

            {/* Typography hierarchy with perfect contrast & spacing */}
            <Text
              position={[0, 1.42, 0.02]}
              fontSize={0.15}
              color="#FBBF24"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.06}
            >
              VAL-00 • MARGEN
            </Text>
            <Text
              position={[0, 1.16, 0.02]}
              fontSize={0.16}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
            >
              Margen de Valor
            </Text>
            <Text
              position={[0, 0.65, 0.02]}
              fontSize={0.42}
              color="#34D399"
              anchorX="center"
              anchorY="middle"
            >
              {`+${simulation.systemicMarginPct}%`}
            </Text>
            <Text
              position={[0, 0.32, 0.02]}
              fontSize={0.12}
              color="#94A3B8"
              anchorX="center"
              anchorY="middle"
            >
              Margen Operativo Bruto
            </Text>
            <Text
              position={[0, -0.05, 0.02]}
              fontSize={0.17}
              color="#FDE047"
              anchorX="center"
              anchorY="middle"
            >
              {`ROI TI: ${activity.kpis[2]?.value ? activity.kpis[2].value.replace('ROI', '').trim() : '284%'}`}
            </Text>
            <Text
              position={[0, -0.38, 0.02]}
              fontSize={0.15}
              color="#38BDF8"
              anchorX="center"
              anchorY="middle"
            >
              {`Retención: ${activity.kpis[1]?.value || '138%'}`}
            </Text>
            <Text
              position={[0, -0.70, 0.02]}
              fontSize={0.14}
              color="#C084FC"
              anchorX="center"
              anchorY="middle"
            >
              {`SLA: ${simulation.avgSlaPct}%`}
            </Text>
            <Text
              position={[0, -1.10, 0.02]}
              fontSize={0.11}
              color="#10B981"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.05}
            >
              ● RESULTADO SISTÉMICO
            </Text>
            <Text
              position={[0, -1.40, 0.02]}
              fontSize={0.10}
              color="#F59E0B"
              anchorX="center"
              anchorY="middle"
            >
              Clic para auditar detalles
            </Text>
          </group>
        )}
      </group>
    </Float>
  );
};
