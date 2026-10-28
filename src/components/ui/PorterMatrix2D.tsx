import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCw,
  Scale,
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  SearchX,
  RotateCcw,
} from 'lucide-react';
import {
  useValueChainStore,
  useActiveSectorData,
  useSimulationResult,
  useFilteredActivityIds,
} from '../../store/useValueChainStore';
import type { ActivityNode } from '../../types/valueChain';

type PresentationStyle = 'apple' | 'microsoft' | 'utp_classic' | 'neural';

export const PorterMatrix2D: React.FC = () => {
  const sector = useActiveSectorData();
  const selectedActivityId = useValueChainStore((s) => s.selectedActivityId);
  const selectActivity = useValueChainStore((s) => s.selectActivity);
  const highlightedLoopId = useValueChainStore((s) => s.highlightedLoopId);
  const setHighlightedLoop = useValueChainStore((s) => s.setHighlightedLoop);
  const setFilterType = useValueChainStore((s) => s.setFilterType);
  const setSearchQuery = useValueChainStore((s) => s.setSearchQuery);

  const [styleMode, setStyleMode] = useState<PresentationStyle>('apple');

  const simResult = useSimulationResult();
  const { activeIds, isFilteringActive, matchCount } = useFilteredActivityIds();

  const supportActivities = useMemo(
    () => sector.activities.filter((a) => a.category === 'support'),
    [sector]
  );
  const primaryActivities = useMemo(
    () =>
      sector.activities
        .filter((a) => a.category === 'primary')
        .sort((a, b) => a.position3D[0] - b.position3D[0]),
    [sector]
  );
  const marginActivity = useMemo(
    () => sector.activities.find((a) => a.category === 'margin'),
    [sector]
  );

  // Check if a node is in the highlighted systemic loop
  const isNodeInHighlightedLoop = (nodeId: string) => {
    if (!highlightedLoopId) return false;
    const allLoops = [...sector.archetype.reinforcingLoops, ...sector.archetype.balancingLoops];
    const loop = allLoops.find((l) => l.id === highlightedLoopId);
    return loop ? loop.nodes.includes(nodeId) : false;
  };

  // Color schemes based on style mode
  const getContainerBg = () => {
    switch (styleMode) {
      case 'apple':
        return 'bg-[#FAFBFD] text-slate-900 border-slate-300 shadow-2xl';
      case 'microsoft':
        return 'bg-[#F8FAFC] text-slate-900 border-slate-300 shadow-2xl';
      case 'utp_classic':
        return 'bg-[#FFFBEB] text-slate-950 border-amber-400 shadow-2xl';
      case 'neural':
      default:
        return 'bg-[#0D1322]/95 text-[#F2F5F8] border-[#2C374B] shadow-2xl';
    }
  };

  const getMarginArrowStyle = () => {
    switch (styleMode) {
      case 'apple':
        return {
          fill: '#F59E0B',
          stroke: '#D97706',
          textColor: 'text-amber-950',
          badgeBg: 'bg-white/80 text-amber-900',
        };
      case 'microsoft':
        return {
          fill: '#0284C7',
          stroke: '#0369A1',
          textColor: 'text-white',
          badgeBg: 'bg-white/20 text-white',
        };
      case 'utp_classic':
        return {
          fill: '#1D4ED8',
          stroke: '#1E3A8A',
          textColor: 'text-white',
          badgeBg: 'bg-yellow-400 text-blue-950 font-bold',
        };
      case 'neural':
      default:
        return {
          fill: '#1D63FF',
          stroke: '#8AB8FF',
          textColor: 'text-white',
          badgeBg: 'bg-[#0D1322]/80 text-[#8AB8FF]',
        };
    }
  };

  const marginColors = getMarginArrowStyle();

  return (
    <div className="space-y-4">
      {/* 1. Academic Header styled directly like UTP Lecture Slide */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0D1322] via-[#1B2436] to-[#0D1322] border border-[#2C374B] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: UTP Case Title & Logos */}
        <div className="flex items-center gap-3.5">
          {/* UTP Logo Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-md border border-slate-200">
            <div className="w-7 h-7 rounded bg-[#C8102E] flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-sm">
              UTP
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <span className="text-[10px] font-bold text-slate-800 uppercase block">Universidad Tecnológica</span>
              <span className="text-[9px] font-medium text-slate-500 block">del Perú • GSTI</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1D63FF]/20 text-[#8AB8FF] border border-[#1D63FF]/30">
                TRANSFORMACIÓN: CASO DE ÉXITO
              </span>
              <span className="text-xs text-[#8FA0B5] font-mono">
                {sector.badge}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>Cadena de valor de {sector.name}</span>
              {sector.id === 'ai' ? (
                <Cpu className="w-5 h-5 text-[#387BFF]" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-[#8AB8FF]" />
              )}
            </h2>
          </div>
        </div>

        {/* Right: Style Selector Toggle */}
        <div className="flex flex-wrap items-center gap-2 bg-[#050508]/70 p-1.5 rounded-xl border border-[#2C374B]">
          <span className="text-[11px] font-mono text-[#8FA0B5] px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#387BFF]" />
            Estilo:
          </span>
          <button
            onClick={() => setStyleMode('apple')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              styleMode === 'apple'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'text-[#8FA0B5] hover:text-white hover:bg-[#1B2436]'
            }`}
          >
            Post-its (Apple)
          </button>
          <button
            onClick={() => setStyleMode('microsoft')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              styleMode === 'microsoft'
                ? 'bg-sky-500 text-white font-bold shadow-md'
                : 'text-[#8FA0B5] hover:text-white hover:bg-[#1B2436]'
            }`}
          >
            Columnas (Microsoft)
          </button>
          <button
            onClick={() => setStyleMode('utp_classic')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              styleMode === 'utp_classic'
                ? 'bg-yellow-400 text-blue-950 font-bold shadow-md'
                : 'text-[#8FA0B5] hover:text-white hover:bg-[#1B2436]'
            }`}
          >
            TIC Amarillo (UTP)
          </button>
          <button
            onClick={() => setStyleMode('neural')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              styleMode === 'neural'
                ? 'bg-[#1D63FF] text-white font-bold shadow-md'
                : 'text-[#8FA0B5] hover:text-white hover:bg-[#1B2436]'
            }`}
          >
            Neural Dark
          </button>
        </div>
      </div>

      {/* 2. Systemic Loops Indicator (Peter Senge) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#387BFF]" />
          <span className="text-[#8FA0B5] font-mono text-[11px]">
            Arquetipo: <strong className="text-white">{sector.archetype.name}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-[#8FA0B5] mr-1">Resaltar Bucle Sistémico:</span>
          {sector.archetype.reinforcingLoops.map((loop) => (
            <button
              key={loop.id}
              onClick={() => setHighlightedLoop(highlightedLoopId === loop.id ? null : loop.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 border transition-all ${
                highlightedLoopId === loop.id
                  ? 'bg-[#1D63FF] text-white border-[#8AB8FF] shadow-[0_0_12px_rgba(29,99,255,0.5)]'
                  : 'bg-[#0D1322] text-[#8AB8FF] border-[#2C374B] hover:border-[#1D63FF]'
              }`}
            >
              <RotateCw className="w-3 h-3 text-[#387BFF]" />
              <span>{loop.id}</span>
            </button>
          ))}
          {sector.archetype.balancingLoops.map((loop) => (
            <button
              key={loop.id}
              onClick={() => setHighlightedLoop(highlightedLoopId === loop.id ? null : loop.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 border transition-all ${
                highlightedLoopId === loop.id
                  ? 'bg-[#F59E0B] text-black border-[#FCD34D] shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-[#0D1322] text-[#F59E0B] border-[#2C374B] hover:border-[#F59E0B]'
              }`}
            >
              <Scale className="w-3 h-3 text-[#F59E0B]" />
              <span>{loop.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. The Iconic Porter Chevron Arrow Canvas */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-all duration-300 overflow-x-auto ${getContainerBg()}`}>
        <div className="min-w-[940px] flex items-stretch gap-2 relative">
          {/* Main Body of the Value Chain (Activities) */}
          <div className="flex-1 flex flex-col gap-6">
            {/* --- ACTIVIDADES DE APOYO (4 Horizontal Stacked Rows) --- */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-1 pb-1 border-b border-indigo-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#6366F1] shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <span
                    className={`text-xs font-mono font-black uppercase tracking-wider ${
                      styleMode === 'apple' || styleMode === 'microsoft' || styleMode === 'utp_classic'
                        ? 'text-indigo-950 font-bold'
                        : 'text-indigo-200'
                    }`}
                  >
                    ACTIVIDADES DE APOYO (SECUNDARIAS)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Sustento Transversal
                  </span>
                </div>
                <span className="text-[11px] font-mono opacity-70">
                  Infraestructura • RRHH • I+D • Compras
                </span>
              </div>

              {/* Empty state when 0 results match */}
              {isFilteringActive && matchCount === 0 && (
                <div className="p-8 rounded-xl bg-[#0D1322]/90 border border-[#2C374B] text-center space-y-3">
                  <SearchX className="w-8 h-8 text-[#8FA0B5] mx-auto" />
                  <h4 className="text-sm font-bold text-white">No se encontraron eslabones coincidentes</h4>
                  <p className="text-xs text-[#8FA0B5]">
                    No hay actividades que cumplan con los filtros o término de búsqueda seleccionado.
                  </p>
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#1D63FF] hover:bg-[#387BFF] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer Filtros</span>
                  </button>
                </div>
              )}

              <div className="space-y-2.5">
                {supportActivities.map((act) => (
                  <SupportRowCard
                    key={act.id}
                    activity={act}
                    styleMode={styleMode}
                    isSelected={selectedActivityId === act.id}
                    isHighlighted={isNodeInHighlightedLoop(act.id)}
                    isDimmed={isFilteringActive && !activeIds.has(act.id)}
                    isFilterMatched={isFilteringActive && activeIds.has(act.id)}
                    onSelect={() => selectActivity(act.id)}
                  />
                ))}
              </div>
            </div>

            {/* --- ACTIVIDADES PRIMARIAS (5 Vertical Columns Flowing Left to Right) --- */}
            <div className="space-y-2.5 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-1 pb-1 border-b border-sky-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#0284C7] shadow-[0_0_8px_rgba(2,132,199,0.5)]" />
                  <span
                    className={`text-xs font-mono font-black uppercase tracking-wider ${
                      styleMode === 'apple' || styleMode === 'microsoft' || styleMode === 'utp_classic'
                        ? 'text-sky-950 font-bold'
                        : 'text-sky-200'
                    }`}
                  >
                    ACTIVIDADES PRIMARIAS (OPERACIONALES)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Flujo de Valor Secuencial
                  </span>
                </div>
                <span className="text-[11px] font-mono opacity-70">
                  Logística Entrada ➔ Operaciones ➔ Salida ➔ Marketing ➔ Servicio
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 items-stretch">
                {primaryActivities.map((act, idx) => (
                  <PrimaryColumnCard
                    key={act.id}
                    activity={act}
                    styleMode={styleMode}
                    index={idx}
                    isSelected={selectedActivityId === act.id}
                    isHighlighted={isNodeInHighlightedLoop(act.id)}
                    isDimmed={isFilteringActive && !activeIds.has(act.id)}
                    isFilterMatched={isFilteringActive && activeIds.has(act.id)}
                    onSelect={() => selectActivity(act.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- THE MARGEN CHEVRON ARROW (Iconic right-pointing arrowhead) --- */}
          {marginActivity && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectActivity(marginActivity.id)}
              className={`w-28 sm:w-36 shrink-0 relative flex items-center justify-center cursor-pointer group transition-all duration-300 ${
                isFilteringActive && !activeIds.has(marginActivity.id)
                  ? 'opacity-25 grayscale pointer-events-none'
                  : 'opacity-100'
              }`}
              style={{ minHeight: '440px' }}
            >
              {/* SVG Chevron Arrow matching Porter Diagram */}
              <svg
                className="absolute inset-0 w-full h-full filter drop-shadow-lg transition-transform group-hover:scale-x-105"
                viewBox="0 0 100 300"
                preserveAspectRatio="none"
              >
                <polygon
                  points="0,0 45,0 100,150 45,300 0,300 50,150"
                  fill={marginColors.fill}
                  stroke={marginColors.stroke}
                  strokeWidth="2"
                  className="transition-colors"
                />
              </svg>

              {/* Text & Content Inside Arrow */}
              <div className="relative z-10 flex flex-col items-center text-center px-1 select-none pointer-events-none">
                <span className={`text-base sm:text-lg font-black tracking-widest uppercase font-sans ${marginColors.textColor}`}>
                  M
                </span>
                <span className={`text-base sm:text-lg font-black tracking-widest uppercase font-sans ${marginColors.textColor}`}>
                  A
                </span>
                <span className={`text-base sm:text-lg font-black tracking-widest uppercase font-sans ${marginColors.textColor}`}>
                  R
                </span>
                <span className={`text-base sm:text-lg font-black tracking-widest uppercase font-sans ${marginColors.textColor}`}>
                  G
                </span>
                <span className={`text-base sm:text-lg font-black tracking-widest uppercase font-sans ${marginColors.textColor}`}>
                  E
                </span>
                <span className={`text-base sm:text-lg font-black tracking-widest uppercase font-sans ${marginColors.textColor}`}>
                  N
                </span>

                <div className={`mt-3 px-2 py-1 rounded text-[11px] font-mono font-bold shadow ${marginColors.badgeBg}`}>
                  {simResult.systemicMarginPct}%
                </div>
                <span className="text-[9px] font-mono text-white/90 mt-1 uppercase font-semibold">
                  ROI: {marginActivity.kpis[2]?.value || '284%'}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SUPPORT ROW CARD (4 Horizontal Stacked Bars) ---
interface SupportRowProps {
  activity: ActivityNode;
  styleMode: PresentationStyle;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isFilterMatched: boolean;
  onSelect: () => void;
}

const SupportRowCard: React.FC<SupportRowProps> = ({
  activity,
  styleMode,
  isSelected,
  isHighlighted,
  isDimmed,
  isFilterMatched,
  onSelect,
}) => {
  // Styles for each mode
  const getRowStyle = () => {
    switch (styleMode) {
      case 'apple':
        return 'bg-[#FFF1EE] hover:bg-[#FFEAE4] border-red-200/80 text-slate-800 shadow-sm';
      case 'microsoft':
        return 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm';
      case 'utp_classic':
        return 'bg-[#FEF08A] hover:bg-[#FDE047] border-amber-400 text-slate-950 shadow-sm';
      case 'neural':
      default:
        return 'bg-[#111827]/80 hover:bg-[#1B2436] border-[#2C374B] text-[#F2F5F8] shadow-md';
    }
  };

  const getChipStyle = () => {
    switch (styleMode) {
      case 'apple':
        // Post-it sticky note style from Apple slide
        return 'bg-[#FEF9C3] text-amber-950 border-amber-300 shadow-sm hover:shadow-md';
      case 'microsoft':
        return 'bg-white text-slate-800 border-slate-300 shadow-sm';
      case 'utp_classic':
        return 'bg-white text-slate-950 border-black shadow-sm font-medium';
      case 'neural':
      default:
        return 'bg-[#1B2436] text-[#8AB8FF] border-[#2C374B] hover:border-[#1D63FF]';
    }
  };

  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onSelect}
      className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${getRowStyle()} ${
        isDimmed
          ? 'opacity-20 grayscale scale-[0.99] pointer-events-none'
          : isFilterMatched
          ? 'ring-2 ring-[#387BFF] shadow-[0_0_16px_rgba(56,123,255,0.35)] opacity-100 scale-[1.008]'
          : isSelected
          ? 'ring-2 ring-[#1D63FF] shadow-lg scale-[1.005]'
          : isHighlighted
          ? 'ring-2 ring-amber-500 shadow-lg'
          : ''
      }`}
    >
      {/* Title & Code */}
      <div className="sm:w-64 shrink-0">
        <div className="flex items-center gap-1.5 mb-0.5 whitespace-nowrap">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1D63FF] text-white whitespace-nowrap inline-block shrink-0">
            {activity.code}
          </span>
          <span className="text-[10px] font-mono opacity-70 truncate whitespace-nowrap">
            {activity.itilStage}
          </span>
        </div>
        <h4 className="text-xs font-bold leading-tight truncate">
          {activity.name}
        </h4>
      </div>

      {/* Sub-process Chips / Post-its (Apple/UTP style) */}
      <div className="flex-1 flex flex-wrap items-center gap-1.5">
        {(activity.subChips || activity.keyProcesses).slice(0, 4).map((chip, i) => (
          <span
            key={i}
            className={`px-2 py-1 rounded-md text-[11px] font-sans flex items-center gap-1 transition-transform hover:scale-105 border ${getChipStyle()}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D63FF]/60 shrink-0" />
            <span className="truncate max-w-[180px]">{chip}</span>
          </span>
        ))}
      </div>

      {/* Right KPI & Efficiency */}
      <div className="shrink-0 flex items-center gap-3 text-[11px] font-mono self-end sm:self-auto">
        <span className="opacity-75">${activity.metrics.budgetUSD}K</span>
        <span className="font-bold text-[#10B981]">{activity.metrics.efficiencyScore}% Efic.</span>
      </div>
    </motion.div>
  );
};

// --- PRIMARY COLUMN CARD (5 Vertical Pillars Flowing Left to Right) ---
interface PrimaryColumnProps {
  activity: ActivityNode;
  styleMode: PresentationStyle;
  index: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isFilterMatched: boolean;
  onSelect: () => void;
}

const PrimaryColumnCard: React.FC<PrimaryColumnProps> = ({
  activity,
  styleMode,
  index,
  isSelected,
  isHighlighted,
  isDimmed,
  isFilterMatched,
  onSelect,
}) => {
  // Microsoft mode has distinct colors for each of the 5 primary columns
  const microsoftColumnColors = [
    { header: 'bg-[#FED7AA] text-orange-950', body: 'bg-[#FFF7ED] border-orange-200' }, // Logística entrada (Peach)
    { header: 'bg-[#FEF08A] text-yellow-950', body: 'bg-[#FEFCE8] border-yellow-200' }, // Operaciones (Gold)
    { header: 'bg-[#BAE6FD] text-sky-950', body: 'bg-[#F0F9FF] border-sky-200' }, // Logística salida (Aqua)
    { header: 'bg-[#99F6E4] text-teal-950', body: 'bg-[#F0FDFA] border-teal-200' }, // Marketing y ventas (Teal)
    { header: 'bg-[#DDD6FE] text-purple-950', body: 'bg-[#FAF5FF] border-purple-200' }, // Servicio (Purple)
  ];

  const getColumnStyle = () => {
    switch (styleMode) {
      case 'apple':
        return {
          container: 'bg-[#ECFDF5] hover:bg-[#D1FAE5] border-emerald-200 text-slate-800 shadow-sm',
          header: 'bg-emerald-600 text-white font-bold',
          chip: 'bg-[#FEF9C3] text-amber-950 border-amber-300 shadow-sm hover:shadow-md',
        };
      case 'microsoft': {
        const c = microsoftColumnColors[index % microsoftColumnColors.length];
        return {
          container: `${c.body} shadow-sm`,
          header: `${c.header} font-bold`,
          chip: 'bg-white text-slate-800 border-slate-200 shadow-sm',
        };
      }
      case 'utp_classic':
        return {
          container: 'bg-[#FEF08A] hover:bg-[#FDE047] border-amber-400 text-slate-950 shadow-sm',
          header: 'bg-amber-400 text-slate-950 font-black border-b border-black',
          chip: 'bg-white text-slate-950 border-black shadow-sm font-medium',
        };
      case 'neural':
      default:
        return {
          container: 'bg-[#0D1322] hover:bg-[#1B2436] border-[#2C374B] text-[#F2F5F8] shadow-md',
          header: 'bg-[#1D63FF] text-white font-bold',
          chip: 'bg-[#1B2436] text-[#8AB8FF] border-[#2C374B] hover:border-[#1D63FF]',
        };
    }
  };

  const colStyle = getColumnStyle();

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onSelect}
      className={`rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${colStyle.container} ${
        isDimmed
          ? 'opacity-20 grayscale scale-[0.98] pointer-events-none'
          : isFilterMatched
          ? 'ring-2 ring-[#0284C7] shadow-[0_0_16px_rgba(2,132,199,0.35)] opacity-100 scale-[1.01]'
          : isSelected
          ? 'ring-2 ring-[#1D63FF] shadow-lg scale-[1.01]'
          : isHighlighted
          ? 'ring-2 ring-amber-500 shadow-lg'
          : ''
      }`}
    >
      {/* Top Header of Column */}
      <div className={`p-2.5 text-center text-xs ${colStyle.header}`}>
        <div className="font-mono text-[10px] font-bold opacity-90 uppercase mb-0.5 whitespace-nowrap tracking-wider">
          {activity.code}
        </div>
        <h4 className="font-bold leading-tight">
          {activity.name.length > 28 ? activity.name.slice(0, 26) + '...' : activity.name}
        </h4>
      </div>

      {/* Process chips (Post-its like Apple / bullet items like Microsoft) */}
      <div className="p-2.5 space-y-2 flex-1 flex flex-col justify-start">
        {(activity.subChips || activity.keyProcesses).map((chip, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-[11px] font-sans border transition-all hover:scale-105 flex items-start gap-1.5 ${colStyle.chip}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D63FF] shrink-0 mt-1" />
            <span className="leading-snug">{chip}</span>
          </div>
        ))}
      </div>

      {/* Footer info: SLA & Efficiency */}
      <div className="p-2 bg-black/5 dark:bg-black/30 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-mono">
        <span className="opacity-80">${activity.metrics.budgetUSD}K</span>
        <span className="font-bold text-[#10B981]">{activity.metrics.efficiencyScore}%</span>
      </div>
    </motion.div>
  );
};
