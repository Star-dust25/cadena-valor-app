import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { ActivityNode } from '../../types/valueChain';
import { useValueChainStore, useFilteredActivityIds } from '../../store/useValueChainStore';

interface Connections3DProps {
  activities: ActivityNode[];
}

export const Connections3D: React.FC<Connections3DProps> = ({ activities }) => {
  const selectedActivityId = useValueChainStore((s) => s.selectedActivityId);
  const hoveredActivityId = useValueChainStore((s) => s.hoveredActivityId);
  const highlightedLoopId = useValueChainStore((s) => s.highlightedLoopId);

  const { activeIds, isFilteringActive } = useFilteredActivityIds();

  // Map of nodes by ID for fast coordinate lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, ActivityNode>();
    activities.forEach((act) => map.set(act.id, act));
    return map;
  }, [activities]);

  // Primary sequential flow: PR-01 -> PR-02 -> PR-03 -> PR-04 -> PR-05 -> VAL-00
  // Computed edge-to-edge so lines NEVER cross through block interiors or over text
  const primaryFlowSegments = useMemo(() => {
    const primaryNodes = activities
      .filter((a) => a.category === 'primary')
      .sort((a, b) => a.position3D[0] - b.position3D[0]);
    const marginNode = activities.find((a) => a.category === 'margin');

    const segments: {
      source: ActivityNode;
      target: ActivityNode;
      points: [[number, number, number], [number, number, number]];
      arrowPos: [number, number, number];
    }[] = [];

    for (let i = 0; i < primaryNodes.length - 1; i++) {
      const src = primaryNodes[i];
      const tgt = primaryNodes[i + 1];
      const startX = src.position3D[0] + 0.82;
      const endX = tgt.position3D[0] - 0.82;
      const y = -2.4;
      segments.push({
        source: src,
        target: tgt,
        points: [
          [startX, y, 0],
          [endX, y, 0],
        ],
        arrowPos: [(startX + endX) / 2, y, 0],
      });
    }

    if (primaryNodes.length > 0 && marginNode) {
      const src = primaryNodes[primaryNodes.length - 1];
      const startX = src.position3D[0] + 0.82;
      const endX = 6.0; // Entrance to Margin Chevron base
      const y = -2.4;
      segments.push({
        source: src,
        target: marginNode,
        points: [
          [startX, y, 0],
          [endX, y, 0],
        ],
        arrowPos: [(startX + endX) / 2, y, 0],
      });
    }

    return segments;
  }, [activities]);

  // Support to Primary / Support to Support / Support to Margin connections
  // Engineered with smart routing:
  // - Support to Margin: Exits right side (x=3.65) and flows in clear corridor to Margin
  // - Support to Support: Curves along right corridor (x=4.3)
  // - Support to Primary: Curves BEHIND blocks in depth (z=-1.6) so it NEVER crosses over text
  const supportConnectionPaths = useMemo(() => {
    const supportNodes = activities.filter((a) => a.category === 'support');
    const paths: {
      support: ActivityNode;
      target: ActivityNode;
      points: [number, number, number][];
    }[] = [];

    supportNodes.forEach((sup) => {
      sup.systemicRole.reinforces.forEach((targetId) => {
        const tgt = nodeMap.get(targetId);
        if (!tgt) return;

        if (tgt.category === 'margin') {
          // Route cleanly along the open right corridor into Margin notch
          const start = new THREE.Vector3(3.65, sup.position3D[1], 0);
          const end = new THREE.Vector3(6.8, 0.5, 0);
          const mid = new THREE.Vector3(5.2, (start.y + end.y) / 2, 0);
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          paths.push({
            support: sup,
            target: tgt,
            points: curve.getPoints(16).map((p) => [p.x, p.y, p.z]),
          });
        } else if (tgt.category === 'support') {
          // Route along the right corridor outside the support blocks
          const start = new THREE.Vector3(3.65, sup.position3D[1], 0);
          const end = new THREE.Vector3(3.65, tgt.position3D[1], 0);
          const mid = new THREE.Vector3(4.35, (start.y + end.y) / 2, 0);
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          paths.push({
            support: sup,
            target: tgt,
            points: curve.getPoints(16).map((p) => [p.x, p.y, p.z]),
          });
        } else {
          // Target is primary: Curve BEHIND the intermediate support blocks
          // Using deep negative Z (z=-1.6) so it passes behind the 3D meshes without cutting across text
          const start = new THREE.Vector3(sup.position3D[0], sup.position3D[1] - 0.38, -0.3);
          const end = new THREE.Vector3(tgt.position3D[0], -1.3, -0.3);
          const mid = new THREE.Vector3(
            (start.x + end.x) / 2,
            (start.y + end.y) / 2,
            -1.6
          );
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          paths.push({
            support: sup,
            target: tgt,
            points: curve.getPoints(20).map((p) => [p.x, p.y, p.z]),
          });
        }
      });
    });

    return paths;
  }, [activities, nodeMap]);

  // Systemic Feedback Loop (Service to Inbound - e.g. Data Flywheel / Threat Intelligence)
  const feedbackLoop = useMemo(() => {
    const serviceNode = activities.find((a) => a.porterType === 'service');
    const inboundNode = activities.find((a) => a.porterType === 'inbound_logistics');
    if (!serviceNode || !inboundNode) return null;

    // Arching curve beneath the entire primary row at y = -4.2
    const start = new THREE.Vector3(serviceNode.position3D[0], -3.5, 0);
    const end = new THREE.Vector3(inboundNode.position3D[0], -3.5, 0);
    const mid = new THREE.Vector3((start.x + end.x) / 2, -4.3, -0.8);

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(24).map((p) => [p.x, p.y, p.z] as [number, number, number]);

    return { curve, points, serviceNode, inboundNode };
  }, [activities]);

  // Energy pulse spheres tracking
  const p1Ref = useRef<THREE.Mesh>(null);
  const p2Ref = useRef<THREE.Mesh>(null);
  const pFeedbackRef = useRef<THREE.Mesh>(null);

  // Animate pulses exclusively in the gaps
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Feedback curve pulse
    if (feedbackLoop && pFeedbackRef.current) {
      const progress = (t * 0.25) % 1;
      const pos = feedbackLoop.curve.getPoint(progress);
      pFeedbackRef.current.position.set(pos.x, pos.y, pos.z);
    }

    // Primary stream gap pulses
    if (primaryFlowSegments.length > 0) {
      const seg1 = primaryFlowSegments[0];
      const segLast = primaryFlowSegments[primaryFlowSegments.length - 1];

      if (p1Ref.current && seg1) {
        const p = (t * 0.8) % 1;
        p1Ref.current.position.lerpVectors(
          new THREE.Vector3(...seg1.points[0]),
          new THREE.Vector3(...seg1.points[1]),
          p
        );
      }
      if (p2Ref.current && segLast) {
        const p = ((t + 0.5) * 0.8) % 1;
        p2Ref.current.position.lerpVectors(
          new THREE.Vector3(...segLast.points[0]),
          new THREE.Vector3(...segLast.points[1]),
          p
        );
      }
    }
  });

  return (
    <group>
      {/* 1. Primary sequential value flow lines (Sleek, gap-bridging Neural Blue) */}
      {primaryFlowSegments.map((seg, idx) => {
        const isRelated =
          selectedActivityId === seg.source.id ||
          selectedActivityId === seg.target.id ||
          hoveredActivityId === seg.source.id ||
          hoveredActivityId === seg.target.id;

        const isDimmed = isFilteringActive && (!activeIds.has(seg.source.id) || !activeIds.has(seg.target.id));

        return (
          <group key={`primary-flow-${idx}`}>
            <Line
              points={seg.points}
              color={isRelated ? '#38BDF8' : '#0284C7'}
              lineWidth={isRelated ? 2.5 : 1.4}
              transparent
              opacity={isDimmed ? 0.08 : isRelated ? 0.95 : 0.55}
            />
            {/* Directional flow arrow marker in gap */}
            <mesh position={seg.arrowPos} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.07, 0.16, 8]} />
              <meshBasicMaterial
                color={isRelated ? '#38BDF8' : '#0284C7'}
                transparent
                opacity={isDimmed ? 0.08 : isRelated ? 0.95 : 0.65}
              />
            </mesh>
          </group>
        );
      })}

      {/* 2. Support-to-Primary influence lines: ONLY visible on hover/select, routed outside or behind */}
      {supportConnectionPaths.map(({ support, target, points }, idx) => {
        const isRelated =
          selectedActivityId === support.id ||
          selectedActivityId === target.id ||
          hoveredActivityId === support.id ||
          hoveredActivityId === target.id ||
          Boolean(highlightedLoopId);

        if (!isRelated) return null; // Keep scene completely clean when idle!

        return (
          <group key={`support-flow-${idx}`}>
            <Line
              points={points}
              color="#818CF8"
              lineWidth={2.2}
              transparent
              opacity={0.85}
              dashed
              dashSize={0.25}
              gapSize={0.15}
              depthTest={true}
            />
          </group>
        );
      })}

      {/* 3. Systemic Arching Feedback Loop (Only visible when loop active or hovered) */}
      {feedbackLoop && (
        <group>
          <Line
            points={feedbackLoop.points}
            color="#38BDF8"
            lineWidth={highlightedLoopId ? 3.0 : 1.5}
            transparent
            opacity={highlightedLoopId ? 0.9 : 0.4}
            dashed
            dashSize={0.3}
            gapSize={0.2}
          />
          {/* Traveling energy photon */}
          <mesh ref={pFeedbackRef}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>
        </group>
      )}

      {/* Primary stream energy photons */}
      <mesh ref={p1Ref}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#38BDF8" />
      </mesh>
      <mesh ref={p2Ref}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#F59E0B" />
      </mesh>
    </group>
  );
};
