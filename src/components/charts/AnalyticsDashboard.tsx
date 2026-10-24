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
import {
  TrendingUp,
  Activity,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { useValueChainStore } from '../../store/useValueChainStore';

export const AnalyticsDashboard: React.FC = () => {
  const getActiveSectorData = useValueChainStore((s) => s.getActiveSectorData);
  const calculateSimulationResult = useValueChainStore((s) => s.calculateSimulationResult);

  const sector = getActiveSectorData();
  const simResult = calculateSimulationResult();

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
    <div className="space-y-6">
      {/* Dynamic Simulation KPI Summary Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Value Margin */}
        <div className="p-4 rounded-xl bg-[#0D1322]/90 border border-[#2C374B] shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#8FA0B5] mb-1">
            <span>Margen de Valor Sistémico</span>
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#F2F5F8]">
              {simResult.systemicMarginPct}%
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                simResult.valueMarginDeltaPct >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {simResult.valueMarginDeltaPct >= 0 ? '+' : ''}
              {simResult.valueMarginDeltaPct}% vs base
            </span>
          </div>
          <p className="text-[11px] text-[#8FA0B5] mt-1 truncate">
            {simResult.isOptimized ? '✨ Estado óptimo de rendimiento' : 'Impacto ponderado de simulación'}
          </p>
        </div>

        {/* Card 2: Systemic Health */}
        <div className="p-4 rounded-xl bg-[#0D1322]/90 border border-[#2C374B] shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#8FA0B5] mb-1">
            <span>Índice de Salud Sistémica</span>
            <Activity className="w-4 h-4 text-[#387BFF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#387BFF]">
              {simResult.systemicHealthIndex}
            </span>
            <span className="text-xs font-mono text-[#8FA0B5]">/ 100 pts</span>
          </div>
          <p className="text-[11px] text-[#8FA0B5] mt-1 truncate">
            Calidad de flujos y equilibrio ITIL
          </p>
        </div>

        {/* Card 3: Avg Automation */}
        <div className="p-4 rounded-xl bg-[#0D1322]/90 border border-[#2C374B] shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#8FA0B5] mb-1">
            <span>Automatización Promedio</span>
            <Zap className="w-4 h-4 text-[#8AB8FF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#8AB8FF]">
              {simResult.avgAutomationPct}%
            </span>
            <span className="text-xs font-mono text-[#8FA0B5]">SLA Prom: {simResult.avgSlaPct}%</span>
          </div>
          <p className="text-[11px] text-[#8FA0B5] mt-1 truncate">
            Orquestación MLOps / SOAR activa
          </p>
        </div>

        {/* Card 4: Bottlenecks */}
        <div className="p-4 rounded-xl bg-[#0D1322]/90 border border-[#2C374B] shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-[#8FA0B5] mb-1">
            <span>Cuellos de Botella Activos</span>
            <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-mono font-extrabold ${
                simResult.activeBottlenecks.length > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'
              }`}
            >
              {simResult.activeBottlenecks.length}
            </span>
            <span className="text-xs font-mono text-[#8FA0B5]">
              {simResult.activeBottlenecks.length === 0 ? 'Flujo limpio' : 'Fricción'}
            </span>
          </div>
          <p className="text-[11px] text-[#8FA0B5] mt-1 truncate">
            {simResult.activeBottlenecks.length > 0
              ? `${simResult.activeBottlenecks[0].activityName}`
              : 'Sin alertas críticas en la cadena'}
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: AreaChart - Value Margin Projection & Simulation */}
        <div className="p-5 rounded-2xl bg-[#0D1322]/90 border border-[#2C374B] shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#1D63FF]/20 text-[#8AB8FF] border border-[#1D63FF]/30">
                PROYECCIÓN TEMPORAL
              </span>
              <h3 className="text-base font-bold text-[#F2F5F8] mt-1">
                Evolución de Margen de Valor y ROI Proyectado
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#8FA0B5]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D63FF]" />
                Simulado (%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#435068]" />
                Base Nominal
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="simulatedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D63FF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#1D63FF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#435068" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#435068" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C374B" opacity={0.4} />
                <XAxis dataKey="quarter" stroke="#8FA0B5" fontSize={11} tickLine={false} />
                <YAxis stroke="#8FA0B5" fontSize={11} tickLine={false} domain={[10, 50]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1322',
                    borderColor: '#2C374B',
                    borderRadius: '0.75rem',
                    color: '#F2F5F8',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="baseMargin"
                  name="Margen Base"
                  stroke="#435068"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#baseGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="simulatedMargin"
                  name="Margen Simulado"
                  stroke="#1D63FF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#simulatedGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: RadarChart - Porter/ITIL Maturity vs Benchmark */}
        <div className="p-5 rounded-2xl bg-[#0D1322]/90 border border-[#2C374B] shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#387BFF]/20 text-[#8AB8FF] border border-[#387BFF]/30">
                BENCHMARK SECTORIAL
              </span>
              <h3 className="text-base font-bold text-[#F2F5F8] mt-1">
                Madurez ITIL 4 vs Benchmark en Eslabones Primarios
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#8FA0B5]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D63FF]" />
                Actual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8FA0B5]" />
                Benchmark
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#2C374B" strokeOpacity={0.6} />
                <PolarAngleAxis dataKey="subject" stroke="#C5D0DE" fontSize={11} />
                <PolarRadiusAxis stroke="#8FA0B5" fontSize={10} domain={[0, 5]} />
                <Radar
                  name="Actual (Simulado)"
                  dataKey="actual"
                  stroke="#1D63FF"
                  fill="#1D63FF"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Benchmark Industria"
                  dataKey="benchmark"
                  stroke="#8FA0B5"
                  fill="#8FA0B5"
                  fillOpacity={0.15}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1322',
                    borderColor: '#2C374B',
                    borderRadius: '0.75rem',
                    color: '#F2F5F8',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHART 3: BarChart - Presupuesto vs Eficiencia por Eslabón */}
      <div className="p-5 rounded-2xl bg-[#0D1322]/90 border border-[#2C374B] shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
              DISTRIBUCIÓN DE RECURSOS
            </span>
            <h3 className="text-base font-bold text-[#F2F5F8] mt-1">
              Presupuesto Asignado ($K USD) vs Eficiencia por Actividad
            </h3>
          </div>
          <div className="text-xs font-mono text-[#8FA0B5]">
            Total Presupuesto Cadena:{' '}
            <strong className="text-white">${simResult.totalBudgetUSD.toLocaleString()}K USD</strong>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C374B" opacity={0.3} />
              <XAxis dataKey="name" stroke="#8FA0B5" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#8FA0B5" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1322',
                  borderColor: '#2C374B',
                  borderRadius: '0.75rem',
                  color: '#F2F5F8',
                  fontSize: '12px',
                }}
              />
              <Bar yAxisId="left" dataKey="presupuesto" name="Presupuesto ($K)" fill="#1D63FF" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="eficiencia" name="Eficiencia (%)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
