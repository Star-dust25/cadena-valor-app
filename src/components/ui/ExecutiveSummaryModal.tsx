import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useValueChainStore,
  useActiveSectorData,
  useSimulationResult,
} from '../../store/useValueChainStore';

export const ExecutiveSummaryModal: React.FC = () => {
  const isSummaryModalOpen = useValueChainStore((s) => s.isSummaryModalOpen);
  const setIsSummaryModalOpen = useValueChainStore((s) => s.setIsSummaryModalOpen);

  const sector = useActiveSectorData();
  const sim = useSimulationResult();

  if (!isSummaryModalOpen) return null;

  const handleExportReport = () => {
    const reportData = {
      caso: 'Caso Práctico 02 - Gestión del Servicio de TI (GSTI)',
      sector: sector.name,
      titulo: sector.title,
      objetivoEstrategico: sector.strategicObjective,
      arquetipoSistemico: sector.archetype,
      metricasSimuladas: {
        margenSistemicoPct: sim.systemicMarginPct,
        deltaMargenPct: sim.valueMarginDeltaPct,
        saludSistemicaIndice: sim.systemicHealthIndex,
        presupuestoTotalUSD: `$${sim.totalBudgetUSD.toLocaleString()}K`,
        automatizacionPromedioPct: sim.avgAutomationPct,
        slaPromedioPct: sim.avgSlaPct,
      },
      actividades: sector.activities.map((a) => ({
        codigo: a.code,
        nombre: a.name,
        categoriaPorter: a.category,
        etapaITIL4: a.itilStage,
        practicaITIL: a.itilPractice,
        presupuestoUSD: `$${a.metrics.budgetUSD}K`,
        automatizacion: `${a.metrics.automationPct}%`,
        sla: `${a.metrics.slaPct}%`,
        eficiencia: `${a.metrics.efficiencyScore}%`,
        apalancamientoSenge: a.systemicRole.leveragePoint,
      })),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_GSTI_Cadena_Valor_${sector.id}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Reporte Exportado', {
      description: `Archivo JSON generado con las métricas de ${sector.name}.`,
      duration: 3500,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-8 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSummaryModalOpen(false)}
          className="fixed inset-0 bg-[#05070E]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[88vh] bg-[#070B14] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header (Clean, typographical, ZERO icons, ZERO badges) */}
          <div className="px-6 py-5 border-b border-slate-800/80 bg-[#090D18] flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Resumen Ejecutivo
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {sector.name} — Modelo de Cadena de Valor e ITIL 4
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportReport}
                className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all active:scale-95"
              >
                Exportar JSON
              </button>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="h-9 px-3 rounded-lg bg-[#0D1322] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Body Content (Clean Editorial Layout - Zero decorative icons) */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 text-sm text-slate-300">
            {/* 1. Contexto Estratégico */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Contexto Estratégico y Planteamiento
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                {sector.overview}
              </p>
              <div className="p-4 rounded-xl bg-[#0B101D] border-l-2 border-blue-500 border-y border-r border-slate-800/80 mt-2">
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  Meta Estratégica GSTI
                </span>
                <p className="text-sm text-slate-200 font-medium">
                  {sector.strategicObjective}
                </p>
              </div>
            </div>

            {/* 2. Dinámica de Sistemas (Peter Senge) */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Dinámica de Sistemas (Arquetipo de Peter Senge)
              </h3>
              
              <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800/80 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {sector.archetype.name}
                  </h4>
                  <p className="text-xs text-blue-400 font-mono mt-0.5">
                    {sector.archetype.sengeType}
                  </p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {sector.archetype.description}
                  </p>
                </div>

                {/* Loops Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-lg bg-[#070B14] border border-slate-800/90 space-y-2">
                    <span className="text-xs font-semibold text-blue-400 block">
                      Bucles Reforzadores (Crecimiento)
                    </span>
                    <ul className="space-y-2 text-xs">
                      {sector.archetype.reinforcingLoops.map((r) => (
                        <li key={r.id} className="text-slate-300">
                          <strong className="text-white">{r.code}:</strong> {r.description}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#070B14] border border-slate-800/90 space-y-2">
                    <span className="text-xs font-semibold text-amber-400 block">
                      Bucles Compensadores (Fricción)
                    </span>
                    <ul className="space-y-2 text-xs">
                      {sector.archetype.balancingLoops.map((b) => (
                        <li key={b.id} className="text-slate-300">
                          <strong className="text-white">{b.code}:</strong> {b.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Leverage Points */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-emerald-400 block mb-2">
                    Puntos de Apalancamiento Sistémico
                  </span>
                  <div className="space-y-2">
                    {sector.archetype.leveragePoints.map((lev, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <div>
                          <strong className="text-white">{lev.title}:</strong> {lev.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Matriz de Integración Porter vs ITIL 4 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                3. Integración Porter vs Cadena de Valor ITIL 4
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0B101D]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070B14] text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3.5">Código</th>
                      <th className="py-3 px-3.5">Eslabón Porter</th>
                      <th className="py-3 px-3.5">Etapa ITIL 4</th>
                      <th className="py-3 px-3.5">Práctica ITIL</th>
                      <th className="py-3 px-3.5 text-right">Presupuesto</th>
                      <th className="py-3 px-3.5 text-right">SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {sector.activities.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono font-bold text-blue-400">{a.code}</td>
                        <td className="py-2.5 px-3.5 text-white font-medium">{a.name}</td>
                        <td className="py-2.5 px-3.5 text-slate-300">{a.itilStage}</td>
                        <td className="py-2.5 px-3.5 text-slate-400 text-xs">{a.itilPractice}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono text-white">${a.metrics.budgetUSD}K</td>
                        <td className="py-2.5 px-3.5 text-right font-mono text-emerald-400">{a.metrics.slaPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer (Clean, simple, no clutter) */}
          <div className="px-6 py-4 border-t border-slate-800/80 bg-[#090D18] flex items-center justify-between text-xs text-slate-400">
            <span>Caso Práctico 02 • GSTI</span>
            <button
              onClick={() => setIsSummaryModalOpen(false)}
              className="h-9 px-4 rounded-lg bg-[#0D1322] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-medium transition-all"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
