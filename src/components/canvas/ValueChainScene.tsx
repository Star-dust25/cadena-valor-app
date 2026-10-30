import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { toast } from 'sonner';
import { Node3D } from './Node3D';
import { Connections3D } from './Connections3D';
import {
  useValueChainStore,
  useActiveSectorData,
  useFilteredActivityIds,
} from '../../store/useValueChainStore';

type OrbitControlsHandle = React.ComponentRef<typeof OrbitControls>;

export const ValueChainScene: React.FC = () => {
  const sector = useActiveSectorData();
  const cameraResetTrigger = useValueChainStore((s) => s.cameraResetTrigger);
  const selectActivity = useValueChainStore((s) => s.selectActivity);
  const hoveredActivityId = useValueChainStore((s) => s.hoveredActivityId);

  const { activeIds, isFilteringActive } = useFilteredActivityIds();

  const controlsRef = useRef<OrbitControlsHandle>(null);
  const [controlMode, setControlMode] = useState<'pan' | 'orbit'>('pan');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Active hovered activity details for the clean HUD bar
  const hoveredActivity = sector.activities.find((a) => a.id === hoveredActivityId);

  // Directly resets the 3D orbit/pan controls to standard perspective
  const resetCameraView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0.6, 0.5, 0);
      controlsRef.current.object.position.set(0.6, 0.5, 15);
      controlsRef.current.update();
    }
  };

  // Center camera button handler (zero state mutation, zero infinite loops)
  const handleCenterCamera = () => {
    resetCameraView();
    toast('Cámara 3D restablecida', {
      description: 'Vista ortogonal y posición de órbita reajustada.',
      duration: 2000,
    });
  };

  // Handle external camera reset triggers from store (purely imperatively)
  useEffect(() => {
    if (controlsRef.current && cameraResetTrigger > 0) {
      resetCameraView();
    }
  }, [cameraResetTrigger]);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full min-h-[460px] lg:min-h-[580px] bg-[#070B14] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none"
    >
      {/* 1. Top Left Viewport Controls (Minimalist, zero badges, text-driven) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-auto">
        <div className="p-1 rounded-lg bg-[#090D18]/90 backdrop-blur-md border border-slate-800 flex items-center gap-1 shadow-lg text-xs">
          {/* Mode Switcher: Pan (Mover) vs Orbit (Girar) */}
          <button
            onClick={() => setControlMode('pan')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              controlMode === 'pan'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mover
          </button>
          <button
            onClick={() => setControlMode('orbit')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              controlMode === 'orbit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Girar
          </button>

          <span className="w-px h-4 bg-slate-800 mx-1" />

          {/* Center camera */}
          <button
            onClick={handleCenterCamera}
            className="px-2.5 py-1.5 rounded-md text-slate-400 hover:text-white transition-all font-medium"
          >
            Centrar
          </button>

          {/* Auto rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1.5 rounded-md transition-all font-medium ${
              autoRotate ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Auto-giro
          </button>

          {/* Toggle grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1.5 rounded-md transition-all font-medium hidden sm:inline ${
              showGrid ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rejilla
          </button>
        </div>
      </div>

      {/* 2. Top Right Visual Category Legend (Quiet, typographical, zero boxes) */}
      <div className="absolute top-4 right-4 z-10 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090D18]/90 backdrop-blur-md border border-slate-800 text-xs font-medium shadow-lg pointer-events-none">
        <span className="text-indigo-400">Apoyo</span>
        <span className="text-slate-600">•</span>
        <span className="text-sky-400">Primarias</span>
        <span className="text-slate-600">•</span>
        <span className="text-amber-400">Margen</span>
      </div>

      {/* 3. Bottom Minimalist Reactive HUD Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-center pointer-events-none">
        <div
          onClick={() => {
            if (hoveredActivity) {
              selectActivity(hoveredActivity.id);
            }
          }}
          className={`max-w-2xl w-full px-4 py-2.5 rounded-xl bg-[#090D18]/95 border border-slate-800 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs transition-all pointer-events-auto ${
            hoveredActivity
              ? 'cursor-pointer hover:border-blue-500 hover:bg-[#0D1424] active:scale-[0.99]'
              : ''
          }`}
        >
          {hoveredActivity ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="font-mono font-bold text-blue-400 shrink-0">
                {hoveredActivity.code}
              </span>
              <div className="truncate">
                <span className="font-semibold text-white mr-2">{hoveredActivity.name}</span>
                <span className="text-slate-400 text-xs hidden sm:inline">
                  ({hoveredActivity.category === 'support' ? 'Apoyo' : hoveredActivity.category === 'margin' ? 'Margen' : 'Primaria'} • SLA: {hoveredActivity.metrics.slaPct}%)
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-xs">
              Arrastra para mover la vista • Clic en cualquier bloque para auditar
            </div>
          )}

          <div className="shrink-0 text-xs font-medium text-blue-400">
            {hoveredActivity ? 'Clic para inspeccionar →' : 'Auditoría GSTI'}
          </div>
        </div>
      </div>

      {/* 4. Canvas with full 2D screen-space panning and 3D orbiting */}
      <Canvas
        camera={{ position: [0.6, 0.5, 15], fov: 44, near: 0.1, far: 100 }}
        onPointerMissed={() => selectActivity(null)}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <OrbitControls
            ref={controlsRef}
            target={[0.6, 0.5, 0]}
            autoRotate={autoRotate}
            autoRotateSpeed={0.6}
            enableDamping
            dampingFactor={0.08}
            enablePan={true}
            screenSpacePanning={true}
            panSpeed={1.2}
            minDistance={4}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2.05}
            mouseButtons={{
              LEFT: controlMode === 'pan' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: controlMode === 'pan' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
            }}
            touches={{
              ONE: controlMode === 'pan' ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
          />

          {/* Lighting */}
          <ambientLight intensity={0.9} color="#E2E8F0" />
          <directionalLight position={[10, 15, 10]} intensity={1.5} color="#FFFFFF" />
          <pointLight position={[-6, 6, 4]} intensity={1.0} color="#818CF8" distance={25} />
          <pointLight position={[6, 4, 4]} intensity={1.2} color="#38BDF8" distance={25} />
          <pointLight position={[7, 0, 4]} intensity={1.2} color="#F59E0B" distance={20} />

          {/* 3D Nodes */}
          {sector.activities.map((activity) => (
            <Node3D
              key={activity.id}
              activity={activity}
              isDimmed={isFilteringActive && !activeIds.has(activity.id)}
            />
          ))}

          {/* 3D Connections and Systemic Loops */}
          <Connections3D activities={sector.activities} />

          {/* Optional Floor Grid */}
          {showGrid && (
            <group position={[0, -4.5, 0]}>
              <gridHelper args={[30, 30, '#1D63FF', '#1E293B']} />
            </group>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};
