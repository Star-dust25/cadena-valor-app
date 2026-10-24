import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  ShieldAlert,
  Layers,
  Box,
  TableProperties,
  Search,
  Filter,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useValueChainStore } from '../../store/useValueChainStore';
import type { SectorType, ViewMode, FilterType } from '../../types/valueChain';

export const Navbar: React.FC = () => {
  const activeSector = useValueChainStore((s) => s.activeSector);
  const switchSector = useValueChainStore((s) => s.switchSector);
  const viewMode = useValueChainStore((s) => s.viewMode);
  const setViewMode = useValueChainStore((s) => s.setViewMode);
  const filterType = useValueChainStore((s) => s.filterType);
  const setFilterType = useValueChainStore((s) => s.setFilterType);
  const searchQuery = useValueChainStore((s) => s.searchQuery);
  const setSearchQuery = useValueChainStore((s) => s.setSearchQuery);
  const setIsSummaryModalOpen = useValueChainStore((s) => s.setIsSummaryModalOpen);
  const resetSimulation = useValueChainStore((s) => s.resetSimulation);

  const sectors: { id: SectorType; label: string; icon: React.ReactNode; subtitle: string }[] = [
    {
      id: 'ai',
      label: 'Sector A: Inteligencia Artificial',
      subtitle: 'Enterprise AI & MLOps',
      icon: <Brain className="w-4 h-4 text-[#387BFF]" />,
    },
    {
      id: 'cybersecurity',
      label: 'Sector B: Ciberseguridad',
      subtitle: 'MSSP & Zero Trust',
      icon: <ShieldAlert className="w-4 h-4 text-[#8AB8FF]" />,
    },
  ];

  const views: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'hybrid', label: 'Híbrido (3D + KPIs)', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: '3d', label: '3D Inmersivo', icon: <Box className="w-3.5 h-3.5" /> },
    { id: 'matrix', label: 'Matriz Porter & ITIL', icon: <TableProperties className="w-3.5 h-3.5" /> },
  ];

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'primary', label: 'Primarias' },
    { id: 'support', label: 'Apoyo' },
    { id: 'bottleneck', label: 'Cuellos de Botella' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050508]/85 backdrop-blur-xl border-b border-[#8FA0B5]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tier: Title, Sector Switcher & Executive Report */}
        <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-4">
          {/* Logo & Course Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1D63FF] to-[#8AB8FF] flex items-center justify-center shadow-[0_0_20px_rgba(29,99,255,0.4)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#1D63FF]/20 text-[#8AB8FF] border border-[#1D63FF]/30">
                  GSTI • CASO PRÁCTICO 02
                </span>
                <span className="text-[11px] font-mono text-[#8FA0B5] hidden sm:inline">
                  Porter + ITIL 4 + Dinámica Sistémica
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#F2F5F8]">
                Arquetipo Sistémico de Cadena de Valor
              </h1>
            </div>
          </div>

          {/* Sector Switcher (Animated with Framer Motion layoutId) */}
          <div className="flex items-center p-1 rounded-xl bg-[#0D1322] border border-[#2C374B] shadow-inner">
            {sectors.map((sec) => {
              const isActive = activeSector === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => switchSector(sec.id)}
                  className="relative px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 z-10"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSectorPill"
                      className="absolute inset-0 bg-gradient-to-r from-[#1B2436] to-[#1D63FF]/30 border border-[#387BFF]/60 rounded-lg shadow-[0_0_15px_rgba(29,99,255,0.35)] -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  {sec.icon}
                  <div className="text-left">
                    <span className={isActive ? 'text-white' : 'text-[#8FA0B5]'}>{sec.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Executive Report & Reset Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#1B2436] hover:bg-[#2C374B] text-[#F2F5F8] border border-[#387BFF]/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-[#8AB8FF]" />
              <span>Resumen Ejecutivo</span>
            </button>

            <button
              onClick={resetSimulation}
              title="Restablecer simulación a valores nominales"
              className="p-2 rounded-lg bg-[#0D1322] hover:bg-[#1B2436] text-[#8FA0B5] hover:text-[#F2F5F8] border border-[#2C374B] transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Tier: View Modes, Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-3 pt-1 border-t border-[#8FA0B5]/10 gap-3">
          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-[#0D1322]/80 p-1 rounded-lg border border-[#2C374B]/70">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === v.id
                    ? 'bg-[#1D63FF] text-white shadow-sm font-semibold'
                    : 'text-[#8FA0B5] hover:text-[#C5D0DE] hover:bg-[#1B2436]/60'
                }`}
              >
                {v.icon}
                <span>{v.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <span className="text-[11px] font-mono text-[#8FA0B5] mr-1 flex items-center gap-1 hidden lg:flex">
              <Filter className="w-3 h-3" />
              Filtro:
            </span>
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-all border ${
                  filterType === f.id
                    ? 'bg-[#1D63FF]/20 text-[#8AB8FF] border-[#1D63FF]/70 font-semibold'
                    : 'bg-transparent text-[#8FA0B5] border-[#2C374B] hover:text-[#C5D0DE] hover:border-[#435068]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-48 lg:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8FA0B5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar eslabón o ITIL..."
              className="w-full pl-8 pr-3 py-1 rounded-lg bg-[#0D1322] border border-[#2C374B] text-xs text-[#F2F5F8] placeholder-[#8FA0B5]/60 focus:outline-none focus:border-[#1D63FF] focus:ring-1 focus:ring-[#1D63FF] transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
