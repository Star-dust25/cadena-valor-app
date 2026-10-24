import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Zap,
  DollarSign,
  Workflow,
  Sparkles,
} from 'lucide-react';
import { useValueChainStore } from '../../store/useValueChainStore';

export const ActivityDetailDrawer: React.FC = () => {
  const selectActivity = useValueChainStore((s) => s.selectActivity);
  const getSelectedActivity = useValueChainStore((s) => s.getSelectedActivity);
  const updateActivityMetrics = useValueChainStore((s) => s.updateActivityMetrics);
  const getActiveSectorData = useValueChainStore((s) => s.getActiveSectorData);

  const [activeTab, setActiveTab] = useState<'details' | 'systemic' | 'simulator'>('simulator');

  const activity = getSelectedActivity();
  const sector = getActiveSectorData();

  if (!activity) return null;

  const isBottleneck =
    activity.systemicRole.bottleneckRisk === 'critical' ||
    activity.metrics.budgetUSD < activity.defaultMetrics.budgetUSD * 0.6 ||
    activity.metrics.automationPct < 50;

  // Handler for simulator inputs
  const handleBudgetChange = (value: number) => {
    updateActivityMetrics(activity.id, { budgetUSD: value });
  };

  const handleAutomationChange = (value: number) => {
    updateActivityMetrics(activity.id, { automationPct: value });
  };

  const handleSlaChange = (value: number) => {
    updateActivityMetrics(activity.id, { slaPct: value });
  };

  const handleResetNodeMetrics = () => {
    updateActivityMetrics(activity.id, {
      budgetUSD: activity.defaultMetrics.budgetUSD,
      automationPct: activity.defaultMetrics.automationPct,
      slaPct: activity.defaultMetrics.slaPct,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
        {/* Backdrop for mobile or focusing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => selectActivity(null)}
          className="absolute inset-0 bg-[#050508]/60 backdrop-blur-sm pointer-events-auto"
        />

        {/* Slide-over Drawer Panel */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-auto">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-screen max-w-xl bg-[#0D1322] border-l border-[#2C374B] shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#2C374B] bg-[#050508]/80 backdrop-blur-md flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-[#1D63FF] text-white shadow-sm">
                    {activity.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-xs font-medium uppercase border ${
                      activity.category === 'primary'
                        ? 'bg-[#1D63FF]/15 text-[#8AB8FF] border-[#1D63FF]/30'
                        : activity.category === 'support'
                        ? 'bg-[#5C96FF]/15 text-[#C5D0DE] border-[#5C96FF]/30'
                        : 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                    }`}
                  >
                    {activity.category === 'primary'
                      ? 'Actividad Primaria'
                      : activity.category === 'support'
                      ? 'Actividad de Apoyo'
                      : 'Margen de Valor'}
                  </span>
                  <span className="text-xs text-[#8FA0B5] font-mono">
                    ITIL 4: <span className="text-[#F2F5F8]">{activity.itilStage}</span>
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-[#F2F5F8]">{activity.name}</h2>
              </div>

              <button
                onClick={() => selectActivity(null)}
                className="p-2 rounded-lg bg-[#1B2436] hover:bg-[#2C374B] text-[#8FA0B5] hover:text-white transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#2C374B] bg-[#0D1322] px-6 gap-2">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'simulator'
                    ? 'border-[#1D63FF] text-[#8AB8FF]'
                    : 'border-transparent text-[#8FA0B5] hover:text-[#C5D0DE]'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Simulador de Valor & SLAs</span>
              </button>
              <button
                onClick={() => setActiveTab('systemic')}
                className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'systemic'
                    ? 'border-[#1D63FF] text-[#8AB8FF]'
                    : 'border-transparent text-[#8FA0B5] hover:text-[#C5D0DE]'
                }`}
              >
                <Workflow className="w-4 h-4" />
                <span>Rol Sistémico (Senge)</span>
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'details'
                    ? 'border-[#1D63FF] text-[#8AB8FF]'
                    : 'border-transparent text-[#8FA0B5] hover:text-[#C5D0DE]'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Procesos & ITIL</span>
              </button>
            </div>

            {/* Tab Contents (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: SIMULATOR */}
              {activeTab === 'simulator' && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      isBottleneck
                        ? 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
                        : activity.metrics.efficiencyScore >= 90
                        ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                        : 'bg-[#1D63FF]/10 border-[#1D63FF]/30 text-[#8AB8FF]'
                    }`}
                  >
                    {isBottleneck ? (
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#EF4444]" />
                    ) : (
                      <Zap className="w-5 h-5 shrink-0 mt-0.5 text-[#1D63FF]" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        {isBottleneck
                          ? 'Cuello de Botella Detectado'
                          : activity.metrics.efficiencyScore >= 90
                          ? 'Operación en Estado Óptimo'
                          : 'Rendimiento Nominal de Eslabón'}
                      </h4>
                      <p className="text-xs text-[#C5D0DE] mt-1">
                        {isBottleneck
                          ? 'Los parámetros configurados generan fricción o déficit presupuestario que se propagará a los eslabones dependientes.'
                          : 'Este eslabón contribuye positivamente a la tasa de margen sistémico global.'}
                      </p>
                    </div>
                  </div>

                  {/* Efficiency Gauge Card */}
                  <div className="p-4 rounded-xl bg-[#1B2436]/60 border border-[#2C374B]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-[#8FA0B5]">Índice de Eficiencia Operativa</span>
                      <span
                        className={`text-lg font-mono font-bold ${
                          activity.metrics.efficiencyScore >= 85
                            ? 'text-[#10B981]'
                            : activity.metrics.efficiencyScore >= 65
                            ? 'text-[#F59E0B]'
                            : 'text-[#EF4444]'
                        }`}
                      >
                        {activity.metrics.efficiencyScore}%
                      </span>
                    </div>
                    <div className="w-full bg-[#0D1322] h-2.5 rounded-full overflow-hidden border border-[#2C374B]">
                      <motion.div
                        className={`h-full rounded-full transition-all duration-300 ${
                          activity.metrics.efficiencyScore >= 85
                            ? 'bg-gradient-to-r from-[#1D63FF] to-[#10B981]'
                            : activity.metrics.efficiencyScore >= 65
                            ? 'bg-gradient-to-r from-[#1D63FF] to-[#F59E0B]'
                            : 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444]'
                        }`}
                        animate={{ width: `${activity.metrics.efficiencyScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-3 text-[11px] text-[#8FA0B5] font-mono">
                      <span>Ratio Costo/Eficiencia: <strong className="text-white">{activity.metrics.costEfficiencyRatio}x</strong></span>
                      <span>Maturity ITIL: <strong className="text-white">{activity.metrics.maturityScore}/5.0</strong></span>
                    </div>
                  </div>

                  {/* Input 1: Budget ($K USD) */}
                  <div className="space-y-2 p-4 rounded-xl bg-[#050508]/40 border border-[#2C374B]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#F2F5F8] flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#1D63FF]" />
                        Presupuesto Operativo Asignado
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#8FA0B5] font-mono">$</span>
                        <input
                          type="number"
                          value={activity.metrics.budgetUSD}
                          onChange={(e) => handleBudgetChange(Number(e.target.value))}
                          min={0}
                          max={activity.metrics.maxBudgetUSD}
                          className="w-20 px-2 py-0.5 rounded bg-[#1B2436] border border-[#2C374B] text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-[#1D63FF]"
                        />
                        <span className="text-xs text-[#8FA0B5] font-mono">K USD</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={activity.metrics.maxBudgetUSD}
                      step={10}
                      value={activity.metrics.budgetUSD}
                      onChange={(e) => handleBudgetChange(Number(e.target.value))}
                      className="w-full accent-[#1D63FF] cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-[#8FA0B5]">
                      <span>Mínimo: $0K</span>
                      <span>Base: ${activity.defaultMetrics.budgetUSD}K</span>
                      <span>Máx: ${activity.metrics.maxBudgetUSD}K</span>
                    </div>
                  </div>

                  {/* Input 2: Automation Level (%) */}
                  <div className="space-y-2 p-4 rounded-xl bg-[#050508]/40 border border-[#2C374B]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#F2F5F8] flex items-center gap-1.5">
                        <Workflow className="w-3.5 h-3.5 text-[#387BFF]" />
                        Nivel de Automatización de Procesos
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={activity.metrics.automationPct}
                          onChange={(e) => handleAutomationChange(Number(e.target.value))}
                          min={0}
                          max={100}
                          className="w-16 px-2 py-0.5 rounded bg-[#1B2436] border border-[#2C374B] text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-[#1D63FF]"
                        />
                        <span className="text-xs text-[#8FA0B5] font-mono">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={activity.metrics.automationPct}
                      onChange={(e) => handleAutomationChange(Number(e.target.value))}
                      className="w-full accent-[#387BFF] cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-[#8FA0B5]">
                      <span>0% (Manual)</span>
                      <span>Nominal: {activity.defaultMetrics.automationPct}%</span>
                      <span>100% (Autónomo)</span>
                    </div>
                  </div>

                  {/* Input 3: SLA Objective (%) */}
                  <div className="space-y-2 p-4 rounded-xl bg-[#050508]/40 border border-[#2C374B]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#F2F5F8] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                        Compromiso de SLA / Disponibilidad
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={activity.metrics.slaPct}
                          onChange={(e) => handleSlaChange(Number(e.target.value))}
                          min={80.0}
                          max={99.99}
                          step={0.01}
                          className="w-20 px-2 py-0.5 rounded bg-[#1B2436] border border-[#2C374B] text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-[#1D63FF]"
                        />
                        <span className="text-xs text-[#8FA0B5] font-mono">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={80.0}
                      max={99.99}
                      step={0.05}
                      value={activity.metrics.slaPct}
                      onChange={(e) => handleSlaChange(Number(e.target.value))}
                      className="w-full accent-[#10B981] cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] font-mono text-[#8FA0B5]">
                      <span>80.00% (Mínimo ITIL)</span>
                      <span>Nominal: {activity.defaultMetrics.slaPct}%</span>
                      <span>99.99% (Four Nines)</span>
                    </div>
                  </div>

                  {/* Reset single node button */}
                  <div className="pt-2">
                    <button
                      onClick={handleResetNodeMetrics}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#1B2436] hover:bg-[#2C374B] text-xs font-semibold text-[#C5D0DE] hover:text-white border border-[#2C374B] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#8FA0B5]" />
                      <span>Restablecer métricas nominales de este eslabón</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SYSTEMIC ROLE (SENGE) */}
              {activeTab === 'systemic' && (
                <div className="space-y-6">
                  {/* Archetype Context */}
                  <div className="p-4 rounded-xl bg-[#1B2436]/50 border border-[#2C374B]">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#8AB8FF] mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{sector.archetype.name}</span>
                    </div>
                    <p className="text-xs text-[#C5D0DE] leading-relaxed">
                      {sector.archetype.description}
                    </p>
                  </div>

                  {/* Leverage Point (Punto de Apalancamiento) */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#1D63FF]/15 to-transparent border border-[#1D63FF]/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#8AB8FF] mb-1 uppercase tracking-wider font-mono">
                      <TrendingUp className="w-4 h-4 text-[#1D63FF]" />
                      Punto de Apalancamiento Sistémico (Peter Senge)
                    </div>
                    <p className="text-xs text-[#F2F5F8] leading-relaxed font-medium mt-1">
                      {activity.systemicRole.leveragePoint}
                    </p>
                  </div>

                  {/* Systemic Connections */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8FA0B5]">
                      Eslabones Relacionados en el Flujo
                    </h4>

                    {/* Reinforces */}
                    <div>
                      <span className="text-[11px] font-mono text-[#8FA0B5] block mb-1.5">
                        Potencia Directamente a (Bucle Reforzador):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {activity.systemicRole.reinforces.map((targetId) => {
                          const targetNode = sector.activities.find((a) => a.id === targetId);
                          return (
                            <button
                              key={targetId}
                              onClick={() => selectActivity(targetId)}
                              className="px-2.5 py-1 rounded-lg bg-[#1B2436] hover:bg-[#1D63FF]/30 border border-[#2C374B] text-xs font-medium text-[#C5D0DE] hover:text-white flex items-center gap-1.5 transition-all"
                            >
                              <span>{targetNode?.code || targetId}</span>
                              <ArrowRight className="w-3 h-3 text-[#1D63FF]" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Depends On */}
                    <div className="pt-2">
                      <span className="text-[11px] font-mono text-[#8FA0B5] block mb-1.5">
                        Depende Operativamente de:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {activity.systemicRole.dependsOn.map((depId) => {
                          const depNode = sector.activities.find((a) => a.id === depId);
                          return (
                            <button
                              key={depId}
                              onClick={() => selectActivity(depId)}
                              className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#1B2436] border border-[#2C374B] text-xs font-medium text-[#8FA0B5] hover:text-[#C5D0DE] flex items-center gap-1.5 transition-all"
                            >
                              <span>{depNode?.code || depId}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottleneck Risk Analysis */}
                  <div className="p-4 rounded-xl bg-[#050508]/50 border border-[#2C374B]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-[#8FA0B5]">Riesgo Intrínseco de Cuello de Botella</span>
                      <span
                        className={`text-xs font-bold uppercase font-mono px-2 py-0.5 rounded ${
                          activity.systemicRole.bottleneckRisk === 'critical'
                            ? 'bg-[#EF4444]/20 text-[#EF4444]'
                            : activity.systemicRole.bottleneckRisk === 'high'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                            : 'bg-[#10B981]/20 text-[#10B981]'
                        }`}
                      >
                        {activity.systemicRole.bottleneckRisk}
                      </span>
                    </div>
                    <p className="text-xs text-[#C5D0DE] leading-relaxed">
                      {activity.systemicRole.bottleneckCondition}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: DETAILS & ITIL PROCESSES */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Hero image with fallback */}
                  <div className="relative h-44 rounded-xl overflow-hidden border border-[#2C374B] group">
                    <img
                      src={activity.imageUrl}
                      alt={activity.name}
                      onError={(e) => {
                        // Fallback image in case of network issue
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1322] via-[#0D1322]/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#050508]/80 text-[#8AB8FF] border border-[#2C374B]">
                        {activity.itilPractice}
                      </span>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8FA0B5]">
                      Descripción Funcional
                    </h4>
                    <p className="text-xs text-[#F2F5F8] font-medium leading-relaxed">
                      {activity.shortDescription}
                    </p>
                    <p className="text-xs text-[#C5D0DE] leading-relaxed pt-1">
                      {activity.fullDescription}
                    </p>
                  </div>

                  {/* Key Processes */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8FA0B5]">
                      Procesos Clave del Eslabón
                    </h4>
                    <div className="space-y-1.5">
                      {activity.keyProcesses.map((proc, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-[#C5D0DE]">
                          <CheckCircle2 className="w-4 h-4 text-[#1D63FF] shrink-0 mt-0.5" />
                          <span>{proc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8FA0B5]">
                      Stack Tecnológico & Herramientas
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activity.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-[#1B2436] text-[#8AB8FF] border border-[#2C374B] text-[11px] font-mono font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8FA0B5]">
                      Indicadores Clave de Desempeño (KPIs)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {activity.kpis.map((kpi, i) => (
                        <div key={i} className="p-3 rounded-lg bg-[#050508]/40 border border-[#2C374B]">
                          <div className="text-[10px] text-[#8FA0B5] truncate">{kpi.name}</div>
                          <div className="text-sm font-bold text-white font-mono mt-0.5">{kpi.value}</div>
                          <div className="text-[10px] text-[#387BFF] font-mono">Meta: {kpi.target}</div>
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
    </AnimatePresence>
  );
};
