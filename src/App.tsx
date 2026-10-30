import React from 'react';
import { Toaster } from 'sonner';
import { Navbar } from './components/ui/Navbar';
import { ValueChainScene } from './components/canvas/ValueChainScene';
import { PorterMatrix2D } from './components/ui/PorterMatrix2D';
import { ActivityDetailDrawer } from './components/ui/ActivityDetailDrawer';
import { AnalyticsDashboard } from './components/charts/AnalyticsDashboard';
import { ExecutiveSummaryModal } from './components/ui/ExecutiveSummaryModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useValueChainStore, useActiveSectorData } from './store/useValueChainStore';

export const App: React.FC = () => {
  const viewMode = useValueChainStore((s) => s.viewMode);
  const sector = useActiveSectorData();

  return (
    <div className="min-h-screen bg-[#050508] text-[#F2F5F8] flex flex-col font-sans selection:bg-[#1D63FF]/30 selection:text-[#8AB8FF]">
      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: '#0D1322',
            border: '1px solid #2C374B',
            color: '#F2F5F8',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Sector Briefing Banner (Minimalist, zero badges, low visual noise) */}
        <div className="p-5 sm:p-6 rounded-xl bg-[#070B14]/95 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {sector.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-3xl">
              {sector.tagline}
            </p>
          </div>

          <div className="flex flex-col sm:items-end justify-center self-start sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
            <span className="text-xs text-slate-500 font-medium">Meta Estratégica</span>
            <span className="text-sm font-semibold text-slate-200 mt-0.5">
              {sector.id === 'ai' ? 'ROI +34.8% en Inferencia' : 'MTTR < 7 min con SOAR'}
            </span>
          </div>
        </div>

        {/* VIEW MODE: HYBRID (Default: 3D Scene + Matrix + Dashboard) */}
        {viewMode === 'hybrid' && (
          <div className="space-y-8">
            {/* 3D Scene Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  Escenario 3D de la Cadena de Valor
                </h2>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Órbita 360° • Clic en nodo para detalles
                </span>
              </div>

              <div className="h-[480px] lg:h-[560px]">
                <ErrorBoundary fallbackTitle="Error al cargar el Escenario 3D">
                  <ValueChainScene />
                </ErrorBoundary>
              </div>
            </section>

            {/* 2D Porter Matrix & Systemic Archetype Section */}
            <section className="space-y-3">
              <h2 className="font-mono text-xs uppercase tracking-wider text-slate-400">
                Matriz Porter & ITIL 4
              </h2>
              <ErrorBoundary fallbackTitle="Error al cargar la Matriz de Porter">
                <PorterMatrix2D />
              </ErrorBoundary>
            </section>

            {/* Real-Time Analytics & Projection Section */}
            <section className="space-y-3">
              <h2 className="font-mono text-xs uppercase tracking-wider text-slate-400">
                Dashboard de Métricas & Simulación
              </h2>
              <ErrorBoundary fallbackTitle="Error al cargar el Dashboard de Analítica">
                <AnalyticsDashboard />
              </ErrorBoundary>
            </section>
          </div>
        )}

        {/* VIEW MODE: 3D IMMERSIVE ONLY */}
        {viewMode === '3d' && (
          <div className="space-y-6">
            <div className="h-[75vh] min-h-[550px]">
              <ErrorBoundary fallbackTitle="Error al cargar el Escenario 3D">
                <ValueChainScene />
              </ErrorBoundary>
            </div>
            {/* Quick KPI Strip underneath */}
            <ErrorBoundary fallbackTitle="Error al cargar el Dashboard de Analítica">
              <AnalyticsDashboard />
            </ErrorBoundary>
          </div>
        )}

        {/* VIEW MODE: CLASSIC MATRIX + ITIL 4 ONLY */}
        {viewMode === 'matrix' && (
          <div className="space-y-8">
            <ErrorBoundary fallbackTitle="Error al cargar la Matriz de Porter">
              <PorterMatrix2D />
            </ErrorBoundary>
            <ErrorBoundary fallbackTitle="Error al cargar el Dashboard de Analítica">
              <AnalyticsDashboard />
            </ErrorBoundary>
          </div>
        )}
      </main>

      {/* Slide-out Activity Details Drawer & Interactive Simulator */}
      <ActivityDetailDrawer />

      {/* Academic Executive Summary Report Modal */}
      <ExecutiveSummaryModal />

      {/* Footer */}
      <footer className="mt-16 border-t border-[#8FA0B5]/15 bg-[#050508] py-8 text-xs text-[#8FA0B5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-[#8AB8FF] font-bold">GSTI</span>
            <span>•</span>
            <span>Gestión del Servicio de TI</span>
            <span>•</span>
            <span>Caso Práctico 02</span>
          </div>

          <div className="text-center font-mono text-[11px] text-[#8FA0B5]/80">
            Cadena de Valor Michael Porter • ITIL v4 Service Value Chain • Dinámica de Sistemas Peter Senge
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-[#1D63FF]">React 19 + Three.js</span>
            <span className="text-[#387BFF]">Zustand</span>
            <span className="text-[#8AB8FF]">Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
