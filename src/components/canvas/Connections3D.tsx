import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { ActivityNode } from '../../types/valueChain';
import { useValueChainStore } from '../../store/useValueChainStore';

interface Connections3DProps {
  activities: ActivityNode[];
}

export const Connections3D: React.FC<Connections3DProps> = ({ activities }) => {
  const selectedActivityId = useValueChainStore((s) => s.selectedActivityId);
  const hoveredActivityId = useValueChainStore((s) => s.hoveredActivityId);
  const highlightedLoopId = useValueChainStore((s) => s.highlightedLoopId);

  // Map of nodes by ID for fast coordinate lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, ActivityNode>();
    activities.forEach((act) => map.set(act.id, act));
    return map;
  }, [activities]);

  // Primary sequential flow: PR-01 -> PR-02 -> PR-03 -> PR-04 -> PR-05 -> VAL-00
  const primaryFlow = useMemo(() => {
    const primaryNodes = activities
      .filter((a) => a.category === 'primary')
      .sort((a, b) => a.position3D[0] - b.position3D[0]);
    const marginNode = activities.find((a) => a.category === 'margin');

    const pairs: [ActivityNode, ActivityNode][] = [];
    for (let i = 0; i < primaryNodes.length - 1; i++) {
      pairs.push([primaryNodes[i], primaryNodes[i + 1]]);
    }
    if (primaryNodes.length > 0 && marginNode) {
      pairs.push([primaryNodes[primaryNodes.length - 1], marginNode]);
    }
    return pairs;
  }, [activities]);

  // Support to Primary influence connections
  const supportConnections = useMemo(() => {
    const supportNodes = activities.filter((a) => a.category === 'support');
    const connections: [ActivityNode, ActivityNode][] = [];

    supportNodes.forEach((sup) => {
      sup.systemicRole.reinforces.forEach((targetId) => {
        const target = nodeMap.get(targetId);
        if (target) {
          connections.push([sup, target]);
        }
      });
    });

    return connections;
  }, [activities, nodeMap]);

  // Systemic Feedback Loop (Service to Inbound - e.g. Data Flywheel / Threat Intelligence)
  const feedbackLoop = useMemo(() => {
    const serviceNode = activities.find((a) => a.porterType === 'service');
    const inboundNode = activities.find((a) => a.porterType === 'inbound_logistics');
    if (!serviceNode || !inboundNode) return null;

    // Arching curve above the scene
    const start = new THREE.Vector3(...serviceNode.position3D);
    const end = new THREE.Vector3(...inboundNode.position3D);
    const mid = new THREE.Vector3(
      (start.x + end.x) / 2,
      start.y + 4.5,
      (start.z + end.z) / 2 - 2.5
    );

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(32).map((p) => [p.x, p.y, p.z] as [number, number, number]);

    return { curve, points, serviceNode, inboundNode };
  }, [activities]);

  // Energy pulse spheres tracking
  const p1Ref = useRef<THREE.Mesh>(null);
  const p2Ref = useRef<THREE.Mesh>(null);
  const p3Ref = useRef<THREE.Mesh>(null);
  const pFeedbackRef = useRef<THREE.Mesh>(null);

  // Animate pulses
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Feedback curve pulse
    if (feedbackLoop && pFeedbackRef.current) {
      const progress = (t * 0.25) % 1;
      const pos = feedbackLoop.curve.getPoint(progress);
      pFeedbackRef.current.position.set(pos.x, pos.y, pos.z);
    }

    // Primary stream pulses
    if (primaryFlow.length > 0) {
      const activePair1 = primaryFlow[0];
      const activePair2 = primaryFlow[Math.min(2, primaryFlow.length - 1)];
      const activePair3 = primaryFlow[primaryFlow.length - 1];

      if (p1Ref.current && activePair1) {
        const p = (t * 0.8) % 1;
        p1Ref.current.position.lerpVectors(
          new THREE.Vector3(...activePair1[0].position3D),
          new THREE.Vector3(...activePair1[1].position3D),
          p
        );
      }
      if (p2Ref.current && activePair2) {
        const p = ((t + 0.5) * 0.8) % 1;
        p2Ref.current.position.lerpVectors(
          new THREE.Vector3(...activePair2[0].position3D),
          new THREE.Vector3(...activePair2[1].position3D),
          p
        );
      }
      if (p3Ref.current && activePair3) {
        const p = ((t + 1.0) * 0.8) % 1;
        p3Ref.current.position.lerpVectors(
          new THREE.Vector3(...activePair3[0].position3D),
          new THREE.Vector3(...activePair3[1].position3D),
          p
        );
      }
    }
  });

  return (
    <group>
      {/* 1. Primary sequential value flow lines (Thick, glowing Neural Blue) */}
      {primaryFlow.map(([source, target], idx) => {
        const isRelated =
          selectedActivityId === source.id ||
          selectedActivityId === target.id ||
          hoveredActivityId === source.id ||
          hoveredActivityId === target.id;

        return (
          <group key={`primary-flow-${idx}`}>
            <Line
              points={[source.position3D, target.position3D]}
              color={isRelated ? '#8AB8FF' : '#1D63FF'}
              lineWidth={isRelated ? 4 : 2.5}
              transparent
              opacity={isRelated ? 0.95 : 0.65}
            />
          </group>
        );
      })}

      {/* 2. Support-to-Primary influence lines (Subtle curved or dashed links) */}
      {supportConnections.map(([support, primary], idx) => {
        const isRelated =
          selectedActivityId === support.id ||
          selectedActivityId === primary.id ||
          hoveredActivityId === support.id ||
          hoveredActivityId === primary.id;

        // Create subtle arched curve
        const start = new THREE.Vector3(...support.position3D);
        const end = new THREE.Vector3(...primary.position3D);
        const mid = new THREE.Vector3(
          (start.x + end.x) / 2,
          (start.y + end.y) / 2 + 0.4,
          (start.z + end.z) / 2
        );
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(16).map((p) => [p.x, p.y, p.z] as [number, number, number]);

        return (
          <group key={`support-flow-${idx}`}>
            <Line
              points={points}
              color={isRelated ? '#387BFF' : '#435068'}
              lineWidth={isRelated ? 3 : 1.2}
              transparent
              opacity={isRelated ? 0.9 : 0.3}
              dashed={!isRelated}
              dashSize={0.3}
              gapSize={0.2}
            />
          </group>
        );
      })}

      {/* 3. Systemic Arching Feedback Loop (Data Flywheel / Threat Loop) */}
      {feedbackLoop && (
        <group>
          <Line
            points={feedbackLoop.points}
            color={highlightedLoopId ? '#8AB8FF' : '#387BFF'}
            lineWidth={3.5}
            transparent
            opacity={0.8}
          />
          {/* Traveling energy photon on feedback loop */}
          <mesh ref={pFeedbackRef}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial color="#8AB8FF" />
          </mesh>
        </group>
      )}

      {/* Traveling energy photons on primary stream */}
      <mesh ref={p1Ref}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color="#5C96FF" />
      </mesh>
      <mesh ref={p2Ref}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color="#8AB8FF" />
      </mesh>
      <mesh ref={p3Ref}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#387BFF" />
      </mesh>
    </group>
  );
};
