import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useValueChainStore } from '../../store/useValueChainStore';
import type { ActivityNode } from '../../types/valueChain';

export const PorterMatrix2D: React.FC = () => {
  const getActiveSectorData = useValueChainStore((s) => s.getActiveSectorData);
  const selectedActivityId = useValueChainStore((s) => s.selectedActivityId);
  const selectActivity = useValueChainStore((s) => s.selectActivity);
  const hoveredActivityId = useValueChainStore((s) => s.hoveredActivityId);
  const setHoveredActivity = useValueChainStore((s) => s.setHoveredActivity);
  const highlightedLoopId = useValueChainStore((s) => s.highlightedLoopId);
  const setHighlightedLoop = useValueChainStore((s) => s.setHighlightedLoop);

  const sector = getActiveSectorData();
  const supportActivities = sector.activities.filter((a) => a.category === 'support');
  const primaryActivities = sector.activities
    .filter((a) => a.category === 'primary')
    .sort((a, b) => a.position3D[0] - b.position3D[0]);
  const marginActivity = sector.activities.find((a) => a.category === 'margin');

  // Check if a node is in the highlighted systemic loop
  const isNodeInHighlightedLoop = (nodeId: string) => {
    if (!highlightedLoopId) return false;
    const allLoops = [...sector.archetype.reinforcingLoops, ...sector.archetype.balancingLoops];
    const loop = allLoops.find((l) => l.id === highlightedLoopId);
    return loop ? loop.nodes.includes(nodeId) : false;
  };

  return (
    <div className="space-y-6">
      {/* Sector Subtitle & Systemic Archetype Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0D1322] via-[#1B2436] to-[#0D1322] border border-[#2C374B] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#1D63FF]/20 text-[#8AB8FF] border border-[#1D63FF]/30">
              {sector.badge}
            </span>
            <span className="text-xs text-[#8FA0B5] font-mono">
              Arquetipo de Peter Senge: {sector.archetype.sengeType}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#F2F5F8] tracking-tight">
            {sector.archetype.name}
          </h2>
          <p className="text-xs text-[#C5D0DE] max-w-3xl mt-1 leading-relaxed">
            {sector.archetype.description}
          </p>
        </div>

        {/* Systemic Loop Interactive Filters */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-[#8FA0B5] mr-1">Resaltar Bucle:</span>
          {sector.archetype.reinforcingLoops.map((loop) => (
            <button
              key={loop.id}
              onClick={() => setHighlightedLoop(highlightedLoopId === loop.id ? null : loop.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all border ${
                highlightedLoopId === loop.id
                  ? 'bg-[#1D63FF] text-white border-[#8AB8FF] shadow-[0_0_12px_rgba(29,99,255,0.4)]'
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
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all border ${
                highlightedLoopId === loop.id
                  ? 'bg-[#F59E0B] text-black border-[#FCD34D] shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-[#0D1322] text-[#F59E0B] border-[#2C374B] hover:border-[#F59E0B]'
              }`}
            >
              <Scale className="w-3 h-3 text-[#F59E0B]" />
              <span>{loop.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Classical Porter Matrix Layout in 2D with ITIL 4 Integration */}
      <div className="relative p-4 sm:p-6 rounded-2xl bg-[#0D1322]/90 border border-[#8FA0B5]/15 backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Main 9 Activities Area (Cols 1 to 10) */}
          <div className="lg:col-span-10 flex flex-col gap-4">
            {/* Section 1: Actividades de Apoyo (Upper Layer - Full width across primary activities) */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#8FA0B5] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5C96FF]" />
                  Actividades de Apoyo (Infraestructura, Talento, I+D, Compras)
                </span>
                <span className="text-[11px] font-mono text-[#8FA0B5]">Sustento transversal ITIL 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {supportActivities.map((act) => (
                  <ActivityCard
                    key={act.id}
                    activity={act}
                    isSelected={selectedActivityId === act.id}
                    isHovered={hoveredActivityId === act.id}
                    isHighlightedInLoop={isNodeInHighlightedLoop(act.id)}
                    onSelect={() => selectActivity(act.id)}
                    onHover={(h) => setHoveredActivity(h ? act.id : null)}
                  />
                ))}
              </div>
            </div>

            {/* Section 2: Actividades Primarias (Lower Layer - Sequential flow into Margin) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#8AB8FF] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1D63FF]" />
                  Actividades Primarias (Flujo Secuencial de Entrega de Servicio)
                </span>
                <span className="text-[11px] font-mono text-[#8FA0B5]">Cadena de Valor del Servicio ITIL 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {primaryActivities.map((act, index) => (
                  <div key={act.id} className="relative flex flex-col justify-between">
                    <ActivityCard
                      activity={act}
                      isSelected={selectedActivityId === act.id}
                      isHovered={hoveredActivityId === act.id}
                      isHighlightedInLoop={isNodeInHighlightedLoop(act.id)}
                      onSelect={() => selectActivity(act.id)}
                      onHover={(h) => setHoveredActivity(h ? act.id : null)}
                    />
                    {/* Arrow to next primary activity on large screens */}
                    {index < primaryActivities.length - 1 && (
                      <div className="hidden xl:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <ArrowRight className="w-3.5 h-3.5 text-[#1D63FF]/70" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Value / Margin Arrowhead Column (Cols 11 to 12) */}
          {marginActivity && (
            <div className="lg:col-span-2 flex flex-col">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#8AB8FF] mb-2 px-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#387BFF]" />
                Margen
              </span>

              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => selectActivity(marginActivity.id)}
                className={`flex-1 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between border relative overflow-hidden ${
                  selectedActivityId === marginActivity.id
                    ? 'bg-gradient-to-b from-[#1B2436] to-[#1D63FF]/30 border-[#8AB8FF] shadow-[0_0_20px_rgba(29,99,255,0.4)]'
                    : 'bg-[#1B2436]/80 hover:bg-[#1B2436] border-[#387BFF]/40 shadow-lg'
                }`}
              >
                {/* Background high-tech styling */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#1D63FF]/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#1D63FF] text-white">
                      {marginActivity.code}
                    </span>
                    <span className="text-[10px] font-mono text-[#8AB8FF]">Cocreación</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight mb-2">
                    {marginActivity.name}
                  </h3>
                  <p className="text-[11px] text-[#C5D0DE] leading-snug line-clamp-3">
                    {marginActivity.shortDescription}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2C374B]">
                  <div className="text-[10px] font-mono text-[#8FA0B5] mb-1">Margen Bruto Proyectado</div>
                  <div className="text-2xl font-mono font-extrabold text-[#10B981]">
                    {marginActivity.kpis[0]?.value || '34.8%'}
                  </div>
                  <div className="text-[10px] font-mono text-[#8AB8FF] mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#10B981]" />
                    <span>ROI: {marginActivity.kpis[2]?.value || '284%'}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ActivityCardProps {
  activity: ActivityNode;
  isSelected: boolean;
  isHovered: boolean;
  isHighlightedInLoop: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isSelected,
  isHovered,
  isHighlightedInLoop,
  onSelect,
  onHover,
}) => {
  const isBottleneck =
    activity.systemicRole.bottleneckRisk === 'critical' ||
    activity.metrics.budgetUSD < activity.defaultMetrics.budgetUSD * 0.6 ||
    activity.metrics.automationPct < 50;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`p-3.5 rounded-xl cursor-pointer transition-all border relative flex flex-col justify-between h-full ${
        isSelected
          ? 'bg-[#1B2436] border-[#387BFF] shadow-[0_0_18px_rgba(29,99,255,0.35)] ring-1 ring-[#1D63FF]'
          : isHighlightedInLoop
          ? 'bg-[#1B2436] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.3)]'
          : isBottleneck
          ? 'bg-[#0D1322] border-[#EF4444]/60 hover:border-[#EF4444]'
          : isHovered
          ? 'bg-[#1B2436]/90 border-[#387BFF]/70 shadow-md'
          : 'bg-[#0D1322]/85 hover:bg-[#1B2436]/90 border-[#2C374B] hover:border-[#435068]'
      }`}
    >
      <div>
        {/* Header tags */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
              isSelected
                ? 'bg-[#1D63FF] text-white'
                : 'bg-[#1B2436] text-[#8AB8FF] border border-[#2C374B]'
            }`}
          >
            {activity.code}
          </span>
          <span className="text-[10px] font-mono text-[#8FA0B5] truncate max-w-[120px]">
            {activity.itilStage}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-xs font-bold text-[#F2F5F8] leading-snug line-clamp-2 mb-1.5">
          {activity.name}
        </h4>

        {/* Short Description */}
        <p className="text-[11px] text-[#8FA0B5] line-clamp-2 leading-relaxed mb-3">
          {activity.shortDescription}
        </p>
      </div>

      {/* Bottom KPI & Status Row */}
      <div className="pt-2 border-t border-[#2C374B]/70 flex items-center justify-between text-[10px] font-mono">
        <span className="text-[#8FA0B5]">
          ${activity.metrics.budgetUSD}K
        </span>

        <div className="flex items-center gap-1.5">
          {isBottleneck ? (
            <span className="flex items-center gap-1 text-[#EF4444] font-semibold">
              <AlertTriangle className="w-3 h-3" />
              Botleneck
            </span>
          ) : (
            <span
              className={`font-semibold ${
                activity.metrics.efficiencyScore >= 85
                  ? 'text-[#10B981]'
                  : 'text-[#387BFF]'
              }`}
            >
              {activity.metrics.efficiencyScore}% Efic.
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
