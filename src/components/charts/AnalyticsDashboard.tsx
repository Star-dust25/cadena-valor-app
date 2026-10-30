import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { useActiveSectorData, useSimulationResult } from '../../store/useValueChainStore';

export const AnalyticsDashboard: React.FC = () => {
  const sector = useActiveSectorData();
  const simResult = useSimulationResult();

  // Radar Data: 5 Primary Activities Maturity vs Benchmark
  const radarData = useMemo(() => {
    return sector.activities
      .filter((a) => a.category === 'primary')
      .map((a) => ({
        subject: a.code,
        fullName: a.name,
        actual: Number((a.metrics.maturityScore * (a.metrics.efficiencyScore / 85)).toFixed(1)),
        benchmark: a.metrics.benchmarkMaturity,
      }));
  }, [sector]);

  // Area Chart Data: Dynamic Quarter Projection reacting to simulation delta
  const timelineData = useMemo(() => {
    const delta = simResult.valueMarginDeltaPct;
    return sector.marginProjection.map((pt) => ({
      quarter: pt.quarter,
      baseMargin: pt.baseMargin,
      simulatedMargin: Number((pt.simulatedMargin + delta).toFixed(1)),
      operationalCost: pt.operationalCost,
      roi: Math.round(pt.roi * (1 + delta / 40)),
    }));
  }, [sector, simResult.valueMarginDeltaPct]);

  // Bar Chart Data: Activity Budget vs Efficiency
  const barData = useMemo(() => {
    return sector.activities.map((a) => ({
      name: a.code,
      fullName: a.name,
      presupuesto: a.metrics.budgetUSD,
      eficiencia: a.metrics.efficiencyScore,
    }));
  }, [sector]);

  return (
    <div className="space-y-4">
      {/* 1. Dynamic Simulation KPI Summary Ribbon (Minimalist, Zero Icons, Zero Badges) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Value Margin */}
        <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 hover:border-slate-700/60 transition-colors flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Margen Sistémico
          </span>
          <div className="my-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {simResult.systemicMarginPct}%
            </span>
            <span
              className={`text-xs font-mono font-medium ${
                simResult.valueMarginDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {simResult.valueMarginDeltaPct >= 0 ? '+' : ''}
              {simResult.valueMarginDeltaPct}% vs base
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 truncate">
            {simResult.isOptimized ? 'Rendimiento óptimo' : 'Impacto ponderado'}
          </p>
        </div>

        {/* Card 2: Systemic Health */}
        <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 hover:border-slate-700/60 transition-colors flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Salud Sistémica
          </span>
          <div className="my-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {simResult.systemicHealthIndex}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 100 pts</span>
          </div>
          <p className="text-xs font-mono text-slate-500 truncate">
            Equilibrio ITIL v4 y flujos
          </p>
        </div>

        {/* Card 3: Avg Automation */}
        <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 hover:border-slate-700/60 transition-colors flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Automatización
          </span>
          <div className="my-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {simResult.avgAutomationPct}%
            </span>
            <span className="text-xs font-mono text-slate-500">
              SLA {simResult.avgSlaPct}%
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 truncate">
            Orquestación MLOps activa
          </p>
        </div>

        {/* Card 4: Bottlenecks */}
        <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800/80 hover:border-slate-700/60 transition-colors flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Cuellos de Botella
          </span>
          <div className="my-1.5 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight ${
                simResult.activeBottlenecks.length > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {simResult.activeBottlenecks.length}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {simResult.activeBottlenecks.length === 0 ? 'Flujo limpio' : 'Fricción activa'}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 truncate">
            {simResult.activeBottlenecks.length > 0
              ? simResult.activeBottlenecks[0].activityName
              : 'Sin alertas críticas en la cadena'}
          </p>
        </div>
      </div>

      {/* 2. Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: AreaChart - Value Margin Projection & Simulation */}
        <div className="p-5 rounded-2xl bg-[#090D18] border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                Proyección Temporal
              </span>
              <h3 className="text-sm font-semibold text-white mt-0.5">
                Evolución de Margen de Valor y ROI Proyectado
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Simulado
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                Base Nominal
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full min-h-[260px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="simulatedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748B" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} opacity={0.5} />
                <XAxis dataKey="quarter" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#1E293B' }} domain={[10, 50]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D18',
                    borderColor: '#1E293B',
                    borderRadius: '0.5rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                  }}
                  itemStyle={{ color: '#E2E8F0', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#94A3B8', fontSize: '11px', fontFamily: 'monospace', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="baseMargin"
                  name="Margen Base"
                  stroke="#64748B"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#baseGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="simulatedMargin"
                  name="Margen Simulado"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#simulatedGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: RadarChart - Porter/ITIL Maturity vs Benchmark */}
        <div className="p-5 rounded-2xl bg-[#090D18] border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                Benchmark Sectorial
              </span>
              <h3 className="text-sm font-semibold text-white mt-0.5">
                Madurez ITIL 4 vs Benchmark de Industria
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Actual
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                Benchmark
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full min-h-[260px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#1E293B" strokeOpacity={0.6} gridType="polygon" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
                />
                <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                <Radar
                  name="Actual (Simulado)"
                  dataKey="actual"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Benchmark Industria"
                  dataKey="benchmark"
                  stroke="#64748B"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fill="#64748B"
                  fillOpacity={0.06}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D18',
                    borderColor: '#1E293B',
                    borderRadius: '0.5rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                  }}
                  itemStyle={{ color: '#E2E8F0', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#94A3B8', fontSize: '11px', fontFamily: 'monospace', fontWeight: 600 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. CHART 3: BarChart - Presupuesto vs Eficiencia por Eslabón */}
      <div className="p-5 rounded-2xl bg-[#090D18] border border-slate-800/80 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
              Distribución de Recursos
            </span>
            <h3 className="text-sm font-semibold text-white mt-0.5">
              Presupuesto Asignado ($K USD) vs Eficiencia por Actividad
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Presupuesto ($K)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Eficiencia (%)
            </span>
            <span className="text-slate-500 border-l border-slate-800 pl-3">
              Total: <strong className="text-white">${simResult.totalBudgetUSD.toLocaleString()}K USD</strong>
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full min-h-[260px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
              <YAxis yAxisId="left" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090D18',
                  borderColor: '#1E293B',
                  borderRadius: '0.5rem',
                  color: '#F8FAFC',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                }}
                itemStyle={{ color: '#E2E8F0', fontSize: '11px', fontFamily: 'monospace' }}
                labelStyle={{ color: '#94A3B8', fontSize: '11px', fontFamily: 'monospace', fontWeight: 600 }}
              />
              <Bar yAxisId="left" dataKey="presupuesto" name="Presupuesto ($K)" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar yAxisId="right" dataKey="eficiencia" name="Eficiencia (%)" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
