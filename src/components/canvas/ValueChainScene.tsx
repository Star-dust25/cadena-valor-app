import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RotateCcw, Play, Pause, Layers, Sparkles, ChevronRight } from 'lucide-react';
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
  const resetCamera = useValueChainStore((s) => s.resetCamera);
  const selectActivity = useValueChainStore((s) => s.selectActivity);
  const hoveredActivityId = useValueChainStore((s) => s.hoveredActivityId);

  const { activeIds, isFilteringActive } = useFilteredActivityIds();

  const controlsRef = useRef<OrbitControlsHandle>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Active hovered activity details for the clean HUD bar
  const hoveredActivity = sector.activities.find((a) => a.id === hoveredActivityId);

  // Handle camera reset
  useEffect(() => {
    if (controlsRef.current && cameraResetTrigger > 0) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0.6, 0.5, 0);
      controlsRef.current.object.position.set(0.6, 0.5, 15);
      controlsRef.current.update();
    }
  }, [cameraResetTrigger]);

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[580px] bg-gradient-to-b from-[#050508] via-[#0D1322]/90 to-[#050508] rounded-2xl overflow-hidden border border-[#8FA0B5]/15 shadow-2xl">
      {/* 1. Top Left Viewport Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-lg bg-[#0D1322]/90 backdrop-blur-md border border-[#2C374B] text-[12px] font-medium text-[#F2F5F8] flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#1D63FF] animate-ping" />
          <span className="font-semibold">{sector.name}</span>
          <span className="text-[#8FA0B5] font-mono text-[11px] hidden sm:inline">| Cadena 3D</span>
        </div>

        <button
          onClick={resetCamera}
          title="Restablecer posición de cámara"
          className="p-2 rounded-lg bg-[#0D1322]/85 hover:bg-[#1B2436] text-[#C5D0DE] hover:text-white border border-[#2C374B] transition-all shadow-md active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Pausar auto-rotación' : 'Activar rotación orbital'}
          className={`p-2 rounded-lg border transition-all shadow-md active:scale-95 ${
            autoRotate
              ? 'bg-[#1D63FF] text-white border-[#8AB8FF] shadow-[0_0_12px_rgba(29,99,255,0.4)]'
              : 'bg-[#0D1322]/85 hover:bg-[#1B2436] text-[#C5D0DE] hover:text-white border-[#2C374B]'
          }`}
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Alternar retícula de suelo"
          className={`p-2 rounded-lg border transition-all shadow-md active:scale-95 hidden sm:flex ${
            showGrid
              ? 'bg-[#1B2436] text-[#8AB8FF] border-[#387BFF]/50'
              : 'bg-[#0D1322]/85 text-[#8FA0B5] border-[#2C374B]'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Top Right Visual Category Legend */}
      <div className="absolute top-4 right-4 z-10 hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#0D1322]/90 backdrop-blur-md border border-[#2C374B] text-[11px] font-mono shadow-lg pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#4338CA] border border-[#818CF8]" />
          <span className="text-indigo-200">Apoyo (Secundarias)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0284C7] border border-[#38BDF8]" />
          <span className="text-sky-200">Primarias (Flujo)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706] border border-amber-300" />
          <span className="text-amber-200">Margen</span>
        </div>
      </div>

      {/* 3. Bottom Minimalist Reactive HUD Bar (Zero 3D collisions!) */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-center pointer-events-none">
        <div
          onClick={() => {
            if (hoveredActivity) {
              selectActivity(hoveredActivity.id);
            }
          }}
          className={`max-w-2xl w-full px-4 py-2.5 rounded-xl bg-[#0D1322]/95 border border-[#2C374B] shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs transition-all pointer-events-auto ${
            hoveredActivity
              ? 'cursor-pointer hover:border-[#1D63FF] hover:bg-[#111A2E] active:scale-[0.99]'
              : ''
          }`}
        >
          {hoveredActivity ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] shrink-0 ${
                  hoveredActivity.category === 'support'
                    ? 'bg-indigo-600 text-white'
                    : hoveredActivity.category === 'margin'
                    ? 'bg-amber-500 text-black'
                    : 'bg-sky-600 text-white'
                }`}
              >
                {hoveredActivity.code}
              </span>
              <div className="truncate">
                <span className="font-bold text-white mr-2">{hoveredActivity.name}</span>
                <span className="text-[11px] text-[#8FA0B5] font-mono hidden sm:inline">
                  {hoveredActivity.category === 'support' ? 'Actividad de Apoyo' : hoveredActivity.category === 'margin' ? 'Margen de Valor' : 'Actividad Primaria'} • SLA: {hoveredActivity.metrics.slaPct}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#8FA0B5] text-[11px] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#387BFF]" />
              <span>Haz clic en cualquier bloque 3D para abrir el panel de simulación de valor y procesos</span>
            </div>
          )}

          <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-[#387BFF]">
            <span className="hidden sm:inline">Clic para inspeccionar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 4. Canvas */}
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
            dampingFactor={0.06}
            minDistance={6}
            maxDistance={22}
            maxPolarAngle={Math.PI / 2.05}
          />

          {/* Lighting */}
          <ambientLight intensity={0.9} color="#E2E8F0" />
          <directionalLight position={[10, 15, 10]} intensity={1.5} color="#FFFFFF" />
          <pointLight position={[-6, 6, 4]} intensity={1.0} color="#818CF8" distance={25} />
          <pointLight position={[6, 4, 4]} intensity={1.2} color="#38BDF8" distance={25} />
          <pointLight position={[7, 0, 4]} intensity={1.2} color="#F59E0B" distance={20} />

          {/* 3D Nodes (Native WebGL rendering without DOM collisions) */}
          {sector.activities.map((activity) => (
            <Node3D
              key={activity.id}
              activity={activity}
              isDimmed={isFilteringActive && !activeIds.has(activity.id)}
            />
          ))}

          {/* 3D Connections and Systemic Loops */}
          <Connections3D activities={sector.activities} />

          {/* Cyber Floor Grid (Optional toggle) */}
          {showGrid && (
            <group position={[0, -4.5, 0]}>
              <gridHelper args={[30, 30, '#1D63FF', '#1B2436']} />
            </group>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};
