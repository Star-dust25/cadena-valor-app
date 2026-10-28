import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useValueChainStore, useFilteredActivityIds } from '../../store/useValueChainStore';
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

  const { isFilteringActive, matchCount } = useFilteredActivityIds();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sectors: { id: SectorType; label: string }[] = [
    { id: 'ai', label: 'Inteligencia Artificial' },
    { id: 'cybersecurity', label: 'Ciberseguridad' },
  ];

  const views: { id: ViewMode; label: string }[] = [
    { id: 'hybrid', label: 'Híbrido' },
    { id: '3d', label: '3D' },
    { id: 'matrix', label: 'Matriz' },
  ];

  const filters: { id: FilterType; label: string; desc: string }[] = [
    { id: 'all', label: 'Todas las Actividades', desc: 'Vista completa de la cadena de valor' },
    { id: 'primary', label: 'Actividades Primarias', desc: 'Flujo operacional secuencial (5 eslabones)' },
    { id: 'support', label: 'Actividades de Apoyo', desc: 'Pilares transversales de soporte' },
    { id: 'bottleneck', label: 'Cuellos de Botella', desc: 'Nodos con saturación o riesgo crítico' },
  ];

  const activeFilterLabel =
    filterType === 'primary'
      ? 'Primarias'
      : filterType === 'support'
      ? 'Apoyo'
      : filterType === 'bottleneck'
      ? 'Cuellos'
      : 'Filtro';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070B14]/95 backdrop-blur-2xl border-b border-slate-800">
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3.5 gap-4">
          {/* 1. Brand (Pure, elegant typography - ZERO badges, ZERO icons) */}
          <div className="flex items-center shrink-0">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight whitespace-nowrap">
              Cadena de Valor
            </span>
          </div>

          {/* 2. Center: Sector Switcher (Pure text, h-10, comfortable, single-line) */}
          <div className="flex items-center h-10 p-1 rounded-lg bg-[#0D1322] border border-slate-800 shrink-0">
            {sectors.map((sec) => {
              const isActive = activeSector === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => switchSector(sec.id)}
                  className={`relative h-8 px-4 sm:px-5 rounded-md text-sm font-semibold transition-all whitespace-nowrap z-10 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSectorPill"
                      className="absolute inset-0 bg-[#1A2642] border border-blue-500/50 rounded-md -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {sec.label}
                </button>
              );
            })}
          </div>

          {/* 3. Right: Controls & Actions (Unified h-10, pure text, ZERO icons) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center h-10 bg-[#0D1322] p-1 rounded-lg border border-slate-800">
              {views.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className={`h-8 px-3.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    viewMode === v.id
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Filter Dropdown Popover */}
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`h-10 px-3.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  filterType !== 'all'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-[#0D1322] text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{activeFilterLabel}</span>
                <span className="text-[10px] opacity-60">▼</span>
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0D1322] border border-slate-700 shadow-2xl p-2 z-50 backdrop-blur-2xl"
                  >
                    <div className="px-3 py-1.5 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 font-semibold">
                      Filtrar por Dimensión
                    </div>
                    {filters.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setFilterType(f.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex flex-col gap-0.5 transition-colors ${
                          filterType === f.id
                            ? 'bg-blue-600/20 text-blue-300 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{f.label}</span>
                          {filterType === f.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          )}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">
                          {f.desc}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="h-10 px-3.5 w-28 sm:w-36 md:w-44 focus:w-56 transition-all duration-200 text-sm bg-[#0D1322] border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  title="Limpiar búsqueda"
                  className="absolute right-2.5 text-sm text-slate-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter Results Counter */}
            {isFilteringActive && (
              <span className="hidden xl:inline text-xs px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 whitespace-nowrap">
                {matchCount} {matchCount === 1 ? 'coincidencia' : 'coincidencias'}
              </span>
            )}

            {/* Executive Report Button */}
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="h-10 px-4 rounded-lg bg-[#0D1322] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-sm font-semibold transition-all whitespace-nowrap active:scale-95"
            >
              Resumen
            </button>

            {/* Reset Simulation Button */}
            <button
              onClick={resetSimulation}
              title="Restablecer valores nominales"
              className="h-10 px-3 rounded-lg bg-[#0D1322] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-sm font-medium transition-all whitespace-nowrap active:scale-95 shrink-0"
            >
              Reiniciar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
