import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  useValueChainStore,
  useActiveSectorData,
  useSelectedActivity,
  isActivityBottleneck,
} from '../../store/useValueChainStore';

export const ActivityDetailDrawer: React.FC = () => {
  const selectActivity = useValueChainStore((s) => s.selectActivity);
  const updateActivityMetrics = useValueChainStore((s) => s.updateActivityMetrics);

  const [activeTab, setActiveTab] = useState<'details' | 'systemic' | 'simulator'>('simulator');

  const activity = useSelectedActivity();
  const sector = useActiveSectorData();

  const drawerContentRef = useRef<HTMLDivElement>(null);
  const drawerBackdropRef = useRef<HTMLDivElement>(null);

  // Lock body & html scroll when drawer is open
  useEffect(() => {
    if (!activity) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [activity]);

  // Close drawer on Escape
  useEffect(() => {
    if (!activity) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectActivity(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activity, selectActivity]);

  // Prevent background scroll and forward backdrop wheel delta to drawer content
  useEffect(() => {
    if (!activity) return;

    const backdrop = drawerBackdropRef.current;
    if (!backdrop) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (drawerContentRef.current) {
        drawerContentRef.current.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    };

    backdrop.addEventListener('wheel', handleWheel, { passive: false });
    return () => backdrop.removeEventListener('wheel', handleWheel);
  }, [activity]);

  const isBottleneck = activity ? isActivityBottleneck(activity) : false;

  // Handler for simulator inputs
  const handleBudgetChange = (value: number) => {
    if (activity) updateActivityMetrics(activity.id, { budgetUSD: value });
  };

  const handleAutomationChange = (value: number) => {
    if (activity) updateActivityMetrics(activity.id, { automationPct: value });
  };

  const handleSlaChange = (value: number) => {
    if (activity) updateActivityMetrics(activity.id, { slaPct: value });
  };

  const handleResetNodeMetrics = () => {
    if (activity) {
      updateActivityMetrics(activity.id, {
        budgetUSD: activity.defaultMetrics.budgetUSD,
        automationPct: activity.defaultMetrics.automationPct,
        slaPct: activity.defaultMetrics.slaPct,
      });
    }
  };

  return (
    <AnimatePresence>
      {activity && (
        <div className="fixed inset-0 z-[70] overflow-hidden pointer-events-none">
        {/* Backdrop for mobile or focusing */}
        <motion.div
          ref={drawerBackdropRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => selectActivity(null)}
          className="absolute inset-0 bg-[#050508]/60 backdrop-blur-sm pointer-events-auto cursor-pointer"
        />

        {/* Slide-over Drawer Panel */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-auto">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-screen max-w-xl bg-[#0D1322] border-l border-[#2C374B] shadow-2xl flex flex-col h-full overflow-hidden overscroll-contain"
          >
            {/* Header (Clean Minimalist Obsidian) */}
            <div className="px-6 py-5 border-b border-slate-800/80 bg-[#090D18] flex items-start justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap text-xs font-mono">
                  <span className="px-2 py-0.5 rounded font-bold bg-blue-600 text-white">
                    {activity.code}
                  </span>
                  <span className="text-slate-400">
                    {activity.category === 'primary'
                      ? 'Actividad Primaria'
                      : activity.category === 'support'
                      ? 'Actividad de Apoyo'
                      : 'Margen de Valor'}
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="text-slate-400">
                    ITIL 4: <span className="text-slate-200">{activity.itilStage}</span>
                  </span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-white">{activity.name}</h2>
              </div>

              <button
                onClick={() => selectActivity(null)}
                className="p-1.5 rounded-lg bg-[#0D1322] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs (Minimalist, Zero Icons, Pure Typography) */}
            <div className="flex border-b border-slate-800/80 bg-[#070B14] px-6 gap-6 shrink-0">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'simulator'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Simulador & SLAs
              </button>
              <button
                onClick={() => setActiveTab('systemic')}
                className={`py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'systemic'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Rol Sistémico
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Procesos & ITIL
              </button>
            </div>

            {/* Tab Contents (Scrollable) */}
            <div ref={drawerContentRef} className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain">
              {/* TAB 1: SIMULATOR (Ultra-Minimalist, Zero Icons, Reduced Visual Noise) */}
              {activeTab === 'simulator' && (
                <div className="space-y-3.5">
                  {/* Status Banner */}
                  <div
                    className={`p-3.5 rounded-xl border bg-[#090D18] flex flex-col gap-1 transition-colors ${
                      isBottleneck
                        ? 'border-rose-500/30'
                        : activity.metrics.efficiencyScore >= 90
                        ? 'border-emerald-500/30'
                        : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isBottleneck
                            ? 'bg-rose-500 animate-pulse'
                            : activity.metrics.efficiencyScore >= 90
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span
                        className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                          isBottleneck
                            ? 'text-rose-400'
                            : activity.metrics.efficiencyScore >= 90
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {isBottleneck
                          ? 'Cuello de Botella Detectado'
                          : activity.metrics.efficiencyScore >= 90
                          ? 'Operación en Estado Óptimo'
                          : 'Rendimiento Nominal'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans pl-3.5">
                      {isBottleneck
                        ? 'Los parámetros configurados generan fricción o déficit presupuestario que se propagará a los eslabones dependientes.'
                        : 'Este eslabón contribuye positivamente a la tasa de margen sistémico global.'}
                    </p>
                  </div>

                  {/* Efficiency Gauge Card */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Índice de Eficiencia Operativa
                      </span>
                      <span
                        className={`text-2xl font-mono font-bold tracking-tight ${
                          activity.metrics.efficiencyScore >= 85
                            ? 'text-emerald-400'
                            : activity.metrics.efficiencyScore >= 65
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {activity.metrics.efficiencyScore}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/60">
                      <motion.div
                        className={`h-full rounded-full transition-all duration-300 ${
                          activity.metrics.efficiencyScore >= 85
                            ? 'bg-emerald-400'
                            : activity.metrics.efficiencyScore >= 65
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                        animate={{ width: `${activity.metrics.efficiencyScore}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500 font-mono">
                      <span>
                        Ratio Costo/Eficiencia:{' '}
                        <strong className="text-slate-300 font-medium">{activity.metrics.costEfficiencyRatio}x</strong>
                      </span>
                      <span className="text-slate-700">·</span>
                      <span>
                        Madurez ITIL:{' '}
                        <strong className="text-slate-300 font-medium">{activity.metrics.maturityScore} / 5.0</strong>
                      </span>
                    </div>
                  </div>

                  {/* Control 1: Presupuesto Operativo Asignado */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 hover:border-slate-700/60 transition-colors space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Presupuesto Operativo
                      </label>
                      <div className="flex items-center gap-1 bg-[#0D1322] border border-slate-800 px-2 py-0.5 rounded-lg focus-within:border-blue-500/80 transition-colors">
                        <span className="text-[11px] text-slate-500 font-mono">$</span>
                        <input
                          type="number"
                          value={activity.metrics.budgetUSD}
                          onChange={(e) => handleBudgetChange(Number(e.target.value))}
                          min={0}
                          max={activity.metrics.maxBudgetUSD}
                          className="w-16 bg-transparent text-right text-xs font-mono font-semibold text-white focus:outline-none"
                        />
                        <span className="text-[11px] text-slate-500 font-mono">K USD</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={activity.metrics.maxBudgetUSD}
                      step={10}
                      value={activity.metrics.budgetUSD}
                      onChange={(e) => handleBudgetChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Mín $0K</span>
                      <span className="text-slate-400">Base ${activity.defaultMetrics.budgetUSD}K</span>
                      <span>Máx ${activity.metrics.maxBudgetUSD}K</span>
                    </div>
                  </div>

                  {/* Control 2: Nivel de Automatización de Procesos */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 hover:border-slate-700/60 transition-colors space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Nivel de Automatización
                      </label>
                      <div className="flex items-center gap-1 bg-[#0D1322] border border-slate-800 px-2 py-0.5 rounded-lg focus-within:border-blue-500/80 transition-colors">
                        <input
                          type="number"
                          value={activity.metrics.automationPct}
                          onChange={(e) => handleAutomationChange(Number(e.target.value))}
                          min={0}
                          max={100}
                          className="w-12 bg-transparent text-right text-xs font-mono font-semibold text-white focus:outline-none"
                        />
                        <span className="text-[11px] text-slate-500 font-mono">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={activity.metrics.automationPct}
                      onChange={(e) => handleAutomationChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>0% Manual</span>
                      <span className="text-slate-400">Nominal {activity.defaultMetrics.automationPct}%</span>
                      <span>100% Autónomo</span>
                    </div>
                  </div>

                  {/* Control 3: Compromiso de SLA / Disponibilidad */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 hover:border-slate-700/60 transition-colors space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Compromiso de SLA
                      </label>
                      <div className="flex items-center gap-1 bg-[#0D1322] border border-slate-800 px-2 py-0.5 rounded-lg focus-within:border-emerald-500/80 transition-colors">
                        <input
                          type="number"
                          value={activity.metrics.slaPct}
                          onChange={(e) => handleSlaChange(Number(e.target.value))}
                          min={80.0}
                          max={99.99}
                          step={0.01}
                          className="w-16 bg-transparent text-right text-xs font-mono font-semibold text-white focus:outline-none"
                        />
                        <span className="text-[11px] text-slate-500 font-mono">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={80.0}
                      max={99.99}
                      step={0.05}
                      value={activity.metrics.slaPct}
                      onChange={(e) => handleSlaChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>80.00% Mín</span>
                      <span className="text-slate-400">Nominal {activity.defaultMetrics.slaPct}%</span>
                      <span>99.99% Four Nines</span>
                    </div>
                  </div>

                  {/* Reset single node button */}
                  <div className="pt-1">
                    <button
                      onClick={handleResetNodeMetrics}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#090D18] hover:bg-[#0D1322] text-xs font-mono text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                    >
                      <span>Restablecer valores nominales</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SYSTEMIC ROLE (SENGE) - Minimalist Obsidian */}
              {activeTab === 'systemic' && (
                <div className="space-y-3.5">
                  {/* Archetype Context */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                      Arquetipo Sistémico
                    </span>
                    <h3 className="text-sm font-semibold text-white tracking-tight">
                      {sector.archetype.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                      {sector.archetype.description}
                    </p>
                  </div>

                  {/* Leverage Point (Punto de Apalancamiento) */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-blue-500/30 space-y-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold block">
                      Punto de Apalancamiento (Peter Senge)
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                      {activity.systemicRole.leveragePoint}
                    </p>
                  </div>

                  {/* Bottleneck Risk Analysis */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Riesgo Intrínseco de Cuello de Botella
                      </span>
                      <span
                        className={`text-[11px] font-mono uppercase font-semibold px-2 py-0.5 rounded ${
                          activity.systemicRole.bottleneckRisk === 'critical'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : activity.systemicRole.bottleneckRisk === 'high'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {activity.systemicRole.bottleneckRisk}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {activity.systemicRole.bottleneckCondition}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: DETAILS & ITIL PROCESSES - Minimalist Technical Sheet */}
              {activeTab === 'details' && (
                <div className="space-y-3.5">
                  {/* Technical Header Card (Replacing generic Unsplash stock photo) */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                        Práctica ITIL 4
                      </span>
                      <h3 className="text-sm font-semibold text-white">
                        {activity.itilPractice}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                        Etapa Cadena
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        {activity.itilStage}
                      </span>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                      Descripción Funcional
                    </span>
                    <p className="text-xs text-white font-medium leading-relaxed font-sans">
                      {activity.shortDescription}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans pt-1">
                      {activity.fullDescription}
                    </p>
                  </div>

                  {/* Key Processes */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 space-y-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                      Procesos Clave del Eslabón
                    </span>
                    <div className="space-y-2">
                      {activity.keyProcesses.map((proc, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <span className="font-mono text-slate-500 text-[11px] select-none pt-0.5">
                            0{i + 1}.
                          </span>
                          <span className="leading-relaxed font-sans">{proc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 space-y-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                      Stack Tecnológico & Herramientas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activity.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[#0D1322] border border-slate-800 text-[11px] font-mono text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block px-0.5">
                      Indicadores Clave de Desempeño (KPIs)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {activity.kpis.map((kpi, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-[#090D18] border border-slate-800/80 flex flex-col justify-between">
                          <span className="text-[11px] font-mono text-slate-400 truncate">{kpi.name}</span>
                          <div className="text-base font-mono font-bold text-white mt-1.5">{kpi.value}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-1">Meta: {kpi.target}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      )}
    </AnimatePresence>
  );
};
