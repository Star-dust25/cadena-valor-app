import React, { useEffect, useRef } from 'react';
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

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Lock background body & html scroll completely while modal is open
  useEffect(() => {
    if (!isSummaryModalOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Compensate for scrollbar disappearance to prevent horizontal layout shift
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
  }, [isSummaryModalOpen]);

  // 2. Wheel event delegation: Scrolling outside the modal window (on backdrop or padding)
  // scrolls the modal content directly, and prevents any scroll leakage to the background.
  useEffect(() => {
    if (!isSummaryModalOpen) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    const handleWheel = (e: WheelEvent) => {
      const content = contentRef.current;
      if (!content) return;

      const isOutsideContent = !content.contains(e.target as Node);

      if (isOutsideContent) {
        // If cursor is outside the modal content (backdrop, margins, header, footer):
        // prevent default background scroll and forward delta to modal content
        e.preventDefault();
        content.scrollBy({
          top: e.deltaY,
          left: e.deltaX,
          behavior: 'auto',
        });
      } else {
        // If cursor is inside content: prevent scroll chaining to window when hitting boundaries
        const { scrollTop, scrollHeight, clientHeight } = content;
        const isAtTop = scrollTop <= 0 && e.deltaY < 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

        if (isAtTop || isAtBottom) {
          e.preventDefault();
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const content = contentRef.current;
      if (!content) return;
      if (!content.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    overlay.addEventListener('wheel', handleWheel, { passive: false });
    overlay.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      overlay.removeEventListener('wheel', handleWheel);
      overlay.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isSummaryModalOpen]);

  // 3. Keyboard navigation: Escape to close, arrows/page keys to scroll content
  useEffect(() => {
    if (!isSummaryModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSummaryModalOpen(false);
        return;
      }

      const activeTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const content = contentRef.current;
      if (!content) return;

      if (e.key === 'ArrowDown') {
        content.scrollBy({ top: 44, behavior: 'smooth' });
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        content.scrollBy({ top: -44, behavior: 'smooth' });
        e.preventDefault();
      } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        content.scrollBy({ top: content.clientHeight * 0.8, behavior: 'smooth' });
        e.preventDefault();
      } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        content.scrollBy({ top: -content.clientHeight * 0.8, behavior: 'smooth' });
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSummaryModalOpen, setIsSummaryModalOpen]);

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
      {isSummaryModalOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 overflow-hidden p-4 sm:p-6 md:p-8 flex items-center justify-center overscroll-contain"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSummaryModalOpen(false)}
            className="fixed inset-0 bg-[#05070E]/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[88vh] bg-[#070B14] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 overscroll-contain"
          >
            {/* Header (Clean, typographical, ZERO icons, ZERO badges) */}
            <div className="px-6 py-5 border-b border-slate-800/80 bg-[#090D18] flex items-center justify-between gap-4 shrink-0">
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
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 text-sm text-slate-300 overscroll-contain"
            >
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
            <div className="px-6 py-4 border-t border-slate-800/80 bg-[#090D18] flex items-center justify-between text-xs text-slate-400 shrink-0">
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
      )}
    </AnimatePresence>
  );
};
