import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Workflow,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useValueChainStore } from '../../store/useValueChainStore';

export const ExecutiveSummaryModal: React.FC = () => {
  const isSummaryModalOpen = useValueChainStore((s) => s.isSummaryModalOpen);
  const setIsSummaryModalOpen = useValueChainStore((s) => s.setIsSummaryModalOpen);
  const getActiveSectorData = useValueChainStore((s) => s.getActiveSectorData);
  const calculateSimulationResult = useValueChainStore((s) => s.calculateSimulationResult);

  const sector = getActiveSectorData();
  const sim = calculateSimulationResult();

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

    toast.success('Reporte Ejecutivo Exportado Exitosamente', {
      description: `Documento generado en formato JSON con métricas de ITIL 4 y Porter para ${sector.name}.`,
      duration: 4000,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSummaryModalOpen(false)}
          className="fixed inset-0 bg-[#050508]/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#0D1322] border border-[#2C374B] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#2C374B] bg-[#050508]/60 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1D63FF]/20 border border-[#1D63FF]/40 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#8AB8FF]" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-[#8AB8FF] uppercase">
                  Gestión del Servicio de TI (GSTI) • Informe Académico & Ejecutivo
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#F2F5F8] tracking-tight">
                  {sector.title} — Arquetipo Sistémico de Cadena de Valor
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportReport}
                className="px-3 py-1.5 rounded-lg bg-[#1D63FF] hover:bg-[#387BFF] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#1B2436] hover:bg-[#2C374B] text-[#8FA0B5] hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#C5D0DE]">
            {/* 1. Executive Synopsis */}
            <div className="p-4 rounded-xl bg-[#1B2436]/60 border border-[#2C374B] space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                <Sparkles className="w-4 h-4 text-[#1D63FF]" />
                1. Contexto Estratégico y Planteamiento del Problema
              </div>
              <p className="leading-relaxed">{sector.overview}</p>
              <div className="p-3 rounded-lg bg-[#050508]/50 border border-[#2C374B] mt-2">
                <strong className="text-white font-mono block mb-0.5">Meta Estratégica GSTI:</strong>
                <p className="text-[#8AB8FF]">{sector.strategicObjective}</p>
              </div>
            </div>

            {/* 2. Systemic Archetype Details (Peter Senge) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                <Workflow className="w-4 h-4 text-[#387BFF]" />
                2. Diagnóstico de Dinámica de Sistemas (Arquetipo de Peter Senge)
              </div>
              <div className="p-4 rounded-xl bg-[#050508]/40 border border-[#2C374B] space-y-3">
                <div>
                  <span className="text-xs font-bold text-[#8AB8FF] block font-mono">
                    {sector.archetype.name} ({sector.archetype.sengeType})
                  </span>
                  <p className="mt-1 leading-relaxed text-[#C5D0DE]">
                    {sector.archetype.description}
                  </p>
                </div>

                {/* Loops */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-[#1B2436]/40 border border-[#2C374B]">
                    <span className="text-[11px] font-mono font-bold text-[#387BFF] block mb-1">
                      Bucles Reforzadores (Virtuosos - Crecimiento):
                    </span>
                    <ul className="space-y-1.5">
                      {sector.archetype.reinforcingLoops.map((r) => (
                        <li key={r.id} className="text-[11px]">
                          <strong className="text-white">{r.code}:</strong> {r.description}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-[#1B2436]/40 border border-[#2C374B]">
                    <span className="text-[11px] font-mono font-bold text-[#F59E0B] block mb-1">
                      Bucles Compensadores (Fricción y Techos de Crecimiento):
                    </span>
                    <ul className="space-y-1.5">
                      {sector.archetype.balancingLoops.map((b) => (
                        <li key={b.id} className="text-[11px]">
                          <strong className="text-white">{b.code}:</strong> {b.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Leverage Points */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono font-bold text-[#10B981] block mb-1.5">
                    Puntos de Apalancamiento Sistémico Recomendados:
                  </span>
                  <div className="space-y-1.5">
                    {sector.archetype.leveragePoints.map((lev, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">{lev.title}:</strong> {lev.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Porter & ITIL 4 Cross-Matrix Summary Table */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                3. Matriz de Integración Porter vs Cadena de Valor ITIL 4
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#2C374B]">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-[#1B2436] text-[#8FA0B5] uppercase border-b border-[#2C374B]">
                    <tr>
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Eslabón Porter</th>
                      <th className="py-2.5 px-3">Etapa ITIL 4</th>
                      <th className="py-2.5 px-3">Práctica ITIL</th>
                      <th className="py-2.5 px-3 text-right">Presupuesto</th>
                      <th className="py-2.5 px-3 text-right">SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C374B]/50 bg-[#0D1322]">
                    {sector.activities.map((a) => (
                      <tr key={a.id} className="hover:bg-[#1B2436]/40 transition-colors">
                        <td className="py-2 px-3 font-bold text-[#8AB8FF]">{a.code}</td>
                        <td className="py-2 px-3 text-[#F2F5F8] font-sans font-medium">{a.name}</td>
                        <td className="py-2 px-3 text-[#C5D0DE]">{a.itilStage}</td>
                        <td className="py-2 px-3 text-[#8FA0B5] text-[10px]">{a.itilPractice}</td>
                        <td className="py-2 px-3 text-right text-white">${a.metrics.budgetUSD}K</td>
                        <td className="py-2 px-3 text-right text-[#10B981]">{a.metrics.slaPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#2C374B] bg-[#050508]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#8FA0B5]">
            <span>GSTI • Modelo Académico Evaluativo para Entornos Corporativos</span>
            <button
              onClick={() => setIsSummaryModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#1B2436] hover:bg-[#2C374B] text-white font-semibold transition-all active:scale-95"
            >
              Cerrar Resumen
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
