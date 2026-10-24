import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Play, Pause, Layers, Sparkles } from 'lucide-react';
import { Node3D } from './Node3D';
import { Connections3D } from './Connections3D';
import { useValueChainStore } from '../../store/useValueChainStore';

type OrbitControlsHandle = React.ComponentRef<typeof OrbitControls>;

export const ValueChainScene: React.FC = () => {
  const getActiveSectorData = useValueChainStore((s) => s.getActiveSectorData);
  const cameraResetTrigger = useValueChainStore((s) => s.cameraResetTrigger);
  const resetCamera = useValueChainStore((s) => s.resetCamera);
  const selectActivity = useValueChainStore((s) => s.selectActivity);

  const sector = getActiveSectorData();
  const controlsRef = useRef<OrbitControlsHandle>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Handle camera reset
  useEffect(() => {
    if (controlsRef.current && cameraResetTrigger > 0) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0.8, 0.4, 0);
      controlsRef.current.object.position.set(0, 5, 14);
      controlsRef.current.update();
    }
  }, [cameraResetTrigger]);

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[580px] bg-gradient-to-b from-[#050508] via-[#0D1322]/80 to-[#050508] rounded-2xl overflow-hidden border border-[#8FA0B5]/15 shadow-2xl">
      {/* 3D Viewport Controls & Legend Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-lg bg-[#0D1322]/90 backdrop-blur-md border border-[#2C374B] text-[12px] font-medium text-[#F2F5F8] flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#1D63FF] animate-ping" />
          <span className="font-semibold">{sector.name}</span>
          <span className="text-[#8FA0B5] font-mono text-[11px] hidden sm:inline">| Escenario 3D</span>
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
          title={autoRotate ? 'Pausar auto-rotación' : 'Activar rotación orbital continua'}
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
          title="Alternar plano reticular cibernético"
          className={`p-2 rounded-lg border transition-all shadow-md active:scale-95 hidden sm:flex ${
            showGrid
              ? 'bg-[#1B2436] text-[#8AB8FF] border-[#387BFF]/50'
              : 'bg-[#0D1322]/85 text-[#8FA0B5] border-[#2C374B]'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Top Right Quick Legend */}
      <div className="absolute top-4 right-4 z-10 hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#0D1322]/85 backdrop-blur-md border border-[#2C374B] text-[11px] font-mono text-[#8FA0B5] shadow-lg pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#5C96FF] border border-[#8AB8FF]" />
          <span>Apoyo (Elevado)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#1D63FF] border border-[#387BFF]" />
          <span>Primarias (Flujo)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rotate-45 bg-[#8AB8FF] border border-white" />
          <span>Margen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span>Cuello de Botella</span>
        </div>
      </div>

      {/* Bottom Guidance Hint */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none text-[11px] font-mono text-[#8FA0B5]/80 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#387BFF]" />
        <span>Arrastra para orbitar • Rueda para zoom • Clic en nodo para inspeccionar y simular</span>
      </div>

      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 5, 14], fov: 44, near: 0.1, far: 100 }}
        onClick={() => selectActivity(null)}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <OrbitControls
            ref={controlsRef}
            target={[0.8, 0.4, 0]}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
            enableDamping
            dampingFactor={0.06}
            minDistance={5}
            maxDistance={22}
            maxPolarAngle={Math.PI / 2.05} // Prevent going below floor
          />

          {/* Lighting */}
          <ambientLight intensity={0.85} color="#C5D0DE" />
          <directionalLight position={[12, 16, 8]} intensity={1.8} color="#FFFFFF" castShadow />
          <pointLight position={[-8, 6, -6]} intensity={1.2} color="#1D63FF" distance={25} />
          <pointLight position={[10, 4, 6]} intensity={1.5} color="#8AB8FF" distance={25} />
          <pointLight position={[0, -2, 2]} intensity={0.6} color="#387BFF" distance={15} />

          {/* 3D Nodes */}
          {sector.activities.map((activity) => (
            <Node3D key={activity.id} activity={activity} />
          ))}

          {/* 3D Connections and Systemic Loops */}
          <Connections3D activities={sector.activities} />

          {/* Cybernetic High-Tech Floor Grid */}
          {showGrid && (
            <group position={[0, -2.1, 0]}>
              <gridHelper args={[28, 28, '#1D63FF', '#1B2436']} />
              {/* Floor glow disc */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <circleGeometry args={[14, 32]} />
                <meshBasicMaterial
                  color="#0D1322"
                  transparent
                  opacity={0.7}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};
