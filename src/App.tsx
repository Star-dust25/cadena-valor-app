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
        {/* Sector Briefing Banner */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-r from-[#0D1322] via-[#1B2436]/90 to-[#0D1322] border border-[#2C374B] shadow-2xl overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#1D63FF]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D63FF] animate-pulse" />
                <span className="text-xs font-mono font-bold text-[#8AB8FF] uppercase tracking-wider">
                  {sector.badge}
                </span>
                <span className="text-xs font-mono text-[#8FA0B5]">
                  • Modelo Sistémico Unificado
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F2F5F8]">
                {sector.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#C5D0DE] mt-1.5 max-w-3xl leading-relaxed">
                {sector.tagline}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <div className="p-3 rounded-xl bg-[#050508]/60 border border-[#2C374B] text-right">
                <span className="text-[10px] font-mono text-[#8FA0B5] block">Meta Estratégica GSTI</span>
                <span className="text-xs font-mono font-bold text-[#10B981]">
                  {sector.id === 'ai' ? 'ROI +34.8% en Inferencia' : 'MTTR < 7 min con SOAR'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* VIEW MODE: HYBRID (Default: 3D Scene + Matrix + Dashboard) */}
        {viewMode === 'hybrid' && (
          <div className="space-y-8">
            {/* 3D Scene Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1D63FF]" />
                  <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-[#8FA0B5]">
                    Escenario 3D Interactivo de la Cadena de Valor
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#8FA0B5]">
                  Órbita 360° • Clic en nodo para simular
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
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#387BFF]" />
                <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-[#8FA0B5]">
                  Matriz Porter Integrada con ITIL 4 & Dinámica Sistémica
                </h3>
              </div>
              <ErrorBoundary fallbackTitle="Error al cargar la Matriz de Porter">
                <PorterMatrix2D />
              </ErrorBoundary>
            </section>

            {/* Real-Time Analytics & Projection Section */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-[#8FA0B5]">
                  Dashboard de Métricas, Benchmarking & Simulación en Vivo
                </h3>
              </div>
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
