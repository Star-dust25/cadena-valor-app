import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
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

type PresentationStyle = 'neural' | 'apple' | 'microsoft';

export const PorterMatrix2D: React.FC = () => {
  const sector = useActiveSectorData();
  const selectedActivityId = useValueChainStore((s) => s.selectedActivityId);
  const selectActivity = useValueChainStore((s) => s.selectActivity);
  const highlightedLoopId = useValueChainStore((s) => s.highlightedLoopId);
  const setHighlightedLoop = useValueChainStore((s) => s.setHighlightedLoop);
  const setFilterType = useValueChainStore((s) => s.setFilterType);
  const setSearchQuery = useValueChainStore((s) => s.setSearchQuery);

  const [styleMode, setStyleMode] = useState<PresentationStyle>('neural');

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

  // Color schemes based on style mode - unified on dark obsidian canvas to eliminate harsh glare and poor contrast
  const getContainerBg = () => 'bg-[#090D18] text-[#F2F5F8] border-slate-800 shadow-xl';

  const getMarginArrowStyle = () => {
    switch (styleMode) {
      case 'apple':
        return {
          fill: '#0B101D',
          stroke: '#F59E0B',
          headerColor: 'text-amber-400',
        };
      case 'microsoft':
        return {
          fill: '#0B101D',
          stroke: '#0284C7',
          headerColor: 'text-sky-400',
        };
      case 'neural':
      default:
        return {
          fill: '#0B101D',
          stroke: '#1E293B',
          headerColor: 'text-blue-400',
        };
    }
  };

  const marginColors = getMarginArrowStyle();

  return (
    <div className="space-y-4">
      {/* 1. Academic Header - Minimalist Editorial (Zero UTP, Zero Badges, Zero Icons) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090D18] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Sector & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="uppercase tracking-wider">{sector.badge}</span>
            <span className="text-slate-600">•</span>
            <span>Gestión Estratégica GSTI</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Cadena de valor de {sector.name}
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Flujo operacional de 5 eslabones primarios y 4 líneas transversales de apoyo
          </p>
        </div>

        {/* Right: Style Selector Toggle */}
        <div className="p-1 rounded-lg bg-[#050811] border border-slate-800 flex items-center gap-1 text-xs shrink-0">
          <span className="text-slate-400 font-medium px-2.5 hidden sm:inline">Vista:</span>
          <button
            onClick={() => setStyleMode('neural')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              styleMode === 'neural'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Oscuro
          </button>
          <button
            onClick={() => setStyleMode('apple')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              styleMode === 'apple'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Post-its
          </button>
          <button
            onClick={() => setStyleMode('microsoft')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              styleMode === 'microsoft'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Columnas
          </button>
        </div>
      </div>

      {/* 2. Systemic Loops Indicator (Peter Senge) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1 text-xs">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Arquetipo sistémico:</span>
          <span className="font-semibold text-white">{sector.archetype.name}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-xs text-slate-400 mr-1">Resaltar bucle:</span>
          {sector.archetype.reinforcingLoops.map((loop) => (
            <button
              key={loop.id}
              onClick={() => setHighlightedLoop(highlightedLoopId === loop.id ? null : loop.id)}
              className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold border transition-all ${
                highlightedLoopId === loop.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-[#090D18] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {loop.id}
            </button>
          ))}
          {sector.archetype.balancingLoops.map((loop) => (
            <button
              key={loop.id}
              onClick={() => setHighlightedLoop(highlightedLoopId === loop.id ? null : loop.id)}
              className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold border transition-all ${
                highlightedLoopId === loop.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-[#090D18] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {loop.id}
            </button>
          ))}
        </div>
      </div>

      {/* 3. The Iconic Porter Chevron Canvas */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-all duration-300 overflow-x-auto ${getContainerBg()}`}>
        <div className="min-w-[940px] flex items-stretch gap-3 relative">
          {/* Main Body of the Value Chain (Activities) */}
          <div className="flex-1 flex flex-col gap-6">
            {/* --- ACTIVIDADES DE APOYO (4 Horizontal Rows) --- */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-semibold uppercase tracking-wider text-slate-300">
                    Actividades de Apoyo
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500 font-normal">
                    Sustento transversal corporativo
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Infraestructura • RRHH • I+D • Compras
                </div>
              </div>

              {/* Empty state when 0 results match */}
              {isFilteringActive && matchCount === 0 && (
                <div className="p-8 rounded-xl bg-[#0B101D] border border-slate-800 text-center space-y-3">
                  <SearchX className="w-8 h-8 text-slate-500 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No se encontraron eslabones coincidentes</h4>
                  <p className="text-xs text-slate-400">
                    No hay actividades que cumplan con los filtros o término de búsqueda seleccionado.
                  </p>
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-semibold uppercase tracking-wider text-slate-300">
                    Actividades Primarias
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500 font-normal">
                    Flujo secuencial de valor
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Entrada → Operaciones → Salida → Comercial → Servicio
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2.5 items-stretch">
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

          {/* --- THE MARGEN CHEVRON SCORECARD --- */}
          {marginActivity && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => selectActivity(marginActivity.id)}
              className={`w-32 sm:w-36 shrink-0 relative flex items-center justify-center cursor-pointer group transition-all duration-300 ${
                isFilteringActive && !activeIds.has(marginActivity.id)
                  ? 'opacity-25 grayscale pointer-events-none'
                  : 'opacity-100'
              }`}
              style={{ minHeight: '440px' }}
            >
              {/* SVG Chevron Arrow matching Porter Diagram */}
              <svg
                className="absolute inset-0 w-full h-full filter drop-shadow-md transition-all"
                viewBox="0 0 100 300"
                preserveAspectRatio="none"
              >
                <polygon
                  points="0,0 45,0 100,150 45,300 0,300 50,150"
                  fill="#0B101D"
                  stroke={marginColors.stroke}
                  strokeWidth="1.5"
                  className="transition-colors group-hover:stroke-blue-400"
                />
              </svg>

              {/* Text & Content Inside Arrow */}
              <div className="relative z-10 flex flex-col items-center text-center px-2 select-none pointer-events-none">
                <span className={`font-mono text-xs font-bold tracking-widest uppercase ${marginColors.headerColor}`}>
                  Margen
                </span>

                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold tracking-tight text-white font-mono">
                    {simResult.systemicMarginPct}%
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mt-0.5">
                    Margen Sistémico
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 w-20 text-center">
                  <div className="text-xs font-mono font-semibold text-emerald-400">
                    ROI {marginActivity.kpis[2]?.value || '284%'}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    Retorno Valor
                  </span>
                </div>

                <span className="mt-5 text-[10px] font-mono text-slate-400 group-hover:text-white transition-colors">
                  Auditar →
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
  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onSelect}
      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B101D] hover:bg-[#0E1526] ${
        isDimmed
          ? 'opacity-25 grayscale pointer-events-none'
          : isSelected
          ? 'border-blue-500 bg-[#0E1529] shadow-sm'
          : isHighlighted
          ? 'border-amber-500/70 bg-[#16130B]'
          : isFilterMatched
          ? 'border-blue-500/40'
          : 'border-slate-800'
      }`}
    >
      {/* Title & Code */}
      <div className="sm:w-64 shrink-0">
        <div className="flex items-center gap-1.5 mb-0.5 whitespace-nowrap">
          <span className={`font-mono text-xs font-bold shrink-0 ${
            styleMode === 'apple' ? 'text-amber-400' : 'text-blue-400'
          }`}>
            {activity.code}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs font-mono text-slate-400 truncate whitespace-nowrap">
            {activity.itilStage}
          </span>
        </div>
        <h4 className="text-xs font-semibold text-white leading-tight truncate">
          {activity.name}
        </h4>
      </div>

      {/* Sub-process Items */}
      <div className="flex-1 flex flex-wrap items-center gap-2">
        {(activity.subChips || activity.keyProcesses).slice(0, 4).map((chip, i) => (
          <span
            key={i}
            className={`px-2.5 py-1 rounded text-xs transition-all border ${
              styleMode === 'apple'
                ? 'bg-[#FEF08A] hover:bg-[#FDE047] text-slate-950 font-medium border-amber-300 shadow-sm hover:scale-[1.02]'
                : styleMode === 'microsoft'
                ? 'bg-[#131B2E] text-slate-200 border-slate-700/70 hover:border-slate-600'
                : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <span className="truncate max-w-[200px]">{chip}</span>
          </span>
        ))}
      </div>

      {/* Right KPI & Efficiency */}
      <div className="shrink-0 flex items-center gap-3 text-xs font-mono self-end sm:self-auto">
        <span className="text-slate-400">${activity.metrics.budgetUSD}K</span>
        <span className="font-medium text-emerald-400">{activity.metrics.efficiencyScore}% Efic.</span>
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
  const microsoftColumnAccents = [
    { border: 'border-t-2 border-t-amber-500', headerBg: 'bg-amber-950/20', codeColor: 'text-amber-400' },
    { border: 'border-t-2 border-t-yellow-400', headerBg: 'bg-yellow-950/20', codeColor: 'text-yellow-400' },
    { border: 'border-t-2 border-t-sky-400', headerBg: 'bg-sky-950/20', codeColor: 'text-sky-400' },
    { border: 'border-t-2 border-t-teal-400', headerBg: 'bg-teal-950/20', codeColor: 'text-teal-400' },
    { border: 'border-t-2 border-t-purple-400', headerBg: 'bg-purple-950/20', codeColor: 'text-purple-400' },
  ];

  const msAccent = microsoftColumnAccents[index % microsoftColumnAccents.length];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className={`rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden bg-[#0B101D] hover:bg-[#0E1526] ${
        styleMode === 'microsoft' ? msAccent.border : ''
      } ${
        isDimmed
          ? 'opacity-25 grayscale pointer-events-none'
          : isSelected
          ? 'border-blue-500 bg-[#0E1529] shadow-sm'
          : isHighlighted
          ? 'border-amber-500/70 bg-[#16130B]'
          : isFilterMatched
          ? 'border-blue-500/40'
          : 'border-slate-800'
      }`}
    >
      {/* Top Header of Column */}
      <div className={`p-3 text-left border-b border-slate-800 ${
        styleMode === 'microsoft'
          ? msAccent.headerBg
          : styleMode === 'apple'
          ? 'bg-[#0E1424]'
          : 'bg-[#080D19]'
      }`}>
        <div className="flex items-center justify-between font-mono text-[11px] mb-1">
          <span className={`font-bold ${
            styleMode === 'microsoft'
              ? msAccent.codeColor
              : styleMode === 'apple'
              ? 'text-amber-400'
              : 'text-blue-400'
          }`}>
            {activity.code}
          </span>
          <span className="font-medium text-slate-400">
            {activity.metrics.slaPct}% SLA
          </span>
        </div>
        <h4 className="text-xs font-semibold leading-snug line-clamp-2 min-h-[2.25rem] text-white">
          {activity.name}
        </h4>
      </div>

      {/* Process list */}
      <div className="p-2.5 space-y-2 flex-1 flex flex-col justify-start">
        {(activity.subChips || activity.keyProcesses).map((chip, i) => (
          <div
            key={i}
            className={`p-2 rounded text-xs leading-snug border transition-all ${
              styleMode === 'apple'
                ? 'bg-[#FEF08A] hover:bg-[#FDE047] text-slate-950 font-medium border-amber-300 shadow-sm hover:scale-[1.01]'
                : styleMode === 'microsoft'
                ? 'bg-[#131B2E] text-slate-200 border-slate-700/70 hover:border-slate-600'
                : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            {chip}
          </div>
        ))}
      </div>

      {/* Footer info: Budget & Efficiency */}
      <div className="p-2.5 bg-[#080D19] border-t border-slate-800 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">${activity.metrics.budgetUSD}K</span>
        <span className="font-medium text-emerald-400">{activity.metrics.efficiencyScore}% Efic.</span>
      </div>
    </motion.div>
  );
};
