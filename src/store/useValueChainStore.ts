import { useMemo } from 'react';
import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  SectorType,
  ViewMode,
  FilterType,
  ActivityNode,
  SectorData,
  ActivityMetrics,
  SimulationResult,
  BottleneckSeverity,
} from '../types/valueChain';
import { SECTORS_DATA } from '../data/valueChainData';

// Debounce timer for slider/metric update toasts to prevent notification spam
let toastDebounceTimer: ReturnType<typeof setTimeout> | null = null;

interface ValueChainStore {
  // State
  activeSector: SectorType;
  selectedActivityId: string | null;
  hoveredActivityId: string | null;
  viewMode: ViewMode;
  filterType: FilterType;
  searchQuery: string;
  sectorsData: Record<SectorType, SectorData>;
  isSummaryModalOpen: boolean;
  cameraResetTrigger: number;
  highlightedLoopId: string | null;

  // Actions
  switchSector: (sector: SectorType) => void;
  selectActivity: (activityId: string | null) => void;
  setHoveredActivity: (activityId: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilterType: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  setIsSummaryModalOpen: (isOpen: boolean) => void;
  resetCamera: () => void;
  setHighlightedLoop: (loopId: string | null) => void;

  // Simulation Actions
  updateActivityMetrics: (
    activityId: string,
    metricsUpdate: Partial<Pick<ActivityMetrics, 'budgetUSD' | 'automationPct' | 'slaPct'>>
  ) => void;
  resetSimulation: () => void;

  // Selectors / Helpers
  getActiveSectorData: () => SectorData;
  getSelectedActivity: () => ActivityNode | null;
  getFilteredActivities: () => ActivityNode[];
  calculateSimulationResult: () => SimulationResult;
}

export const useValueChainStore = create<ValueChainStore>((set, get) => ({
  activeSector: 'ai',
  selectedActivityId: null,
  hoveredActivityId: null,
  viewMode: 'hybrid',
  filterType: 'all',
  searchQuery: '',
  sectorsData: JSON.parse(JSON.stringify(SECTORS_DATA)),
  isSummaryModalOpen: false,
  cameraResetTrigger: 0,
  highlightedLoopId: null,

  switchSector: (sector: SectorType) => {
    const current = get().activeSector;
    if (current === sector) return;

    set({
      activeSector: sector,
      selectedActivityId: null,
      hoveredActivityId: null,
      searchQuery: '',
      highlightedLoopId: null,
    });

    const targetName = sector === 'ai' ? 'Inteligencia Artificial (Enterprise MLOps)' : 'Ciberseguridad (MSSP Zero Trust)';
    toast.info(`Cambiando a Sector: ${targetName}`, {
      description: 'Modelo de Porter, ITIL 4 y Arquetipo Sistémico actualizados en tiempo real.',
      duration: 3500,
    });
  },

  selectActivity: (activityId: string | null) => {
    set({ selectedActivityId: activityId });
  },

  setHoveredActivity: (activityId: string | null) => {
    set({ hoveredActivityId: activityId });
  },

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
  },

  setFilterType: (filter: FilterType) => {
    set({ filterType: filter });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setIsSummaryModalOpen: (isOpen: boolean) => {
    set({ isSummaryModalOpen: isOpen });
  },

  resetCamera: () => {
    set((state) => ({ cameraResetTrigger: state.cameraResetTrigger + 1 }));
    toast('Cámara 3D restablecida', {
      description: 'Vista ortogonal y posición de órbita reajustada.',
      duration: 2000,
    });
  },

  setHighlightedLoop: (loopId: string | null) => {
    set({ highlightedLoopId: loopId });
  },

  updateActivityMetrics: (activityId, metricsUpdate) => {
    const { activeSector, sectorsData } = get();
    const currentSectorData = sectorsData[activeSector];
    const activityIndex = currentSectorData.activities.findIndex((a) => a.id === activityId);

    if (activityIndex === -1) return;

    const activity = currentSectorData.activities[activityIndex];
    const currentMetrics = activity.metrics;

    // Strict Validations (silent clamping to avoid continuous alert spam while typing or dragging)
    let newBudget = metricsUpdate.budgetUSD !== undefined ? metricsUpdate.budgetUSD : currentMetrics.budgetUSD;
    let newAutomation = metricsUpdate.automationPct !== undefined ? metricsUpdate.automationPct : currentMetrics.automationPct;
    let newSla = metricsUpdate.slaPct !== undefined ? metricsUpdate.slaPct : currentMetrics.slaPct;

    if (newBudget < 0) newBudget = 0;
    if (newSla < 80.0) newSla = 80.0;
    if (newSla > 99.99) newSla = 99.99;
    if (newAutomation < 0) newAutomation = 0;
    if (newAutomation > 100) newAutomation = 100;

    // Dynamic efficiency calculation
    const budgetRatio = newBudget / Math.max(1, activity.defaultMetrics.budgetUSD);
    const automationFactor = newAutomation / 100;
    const slaFactor = (newSla - 80) / 19.99;

    const calculatedEfficiency = Math.min(
      99,
      Math.max(
        20,
        Math.round((0.35 * Math.min(1.2, budgetRatio) + 0.35 * automationFactor + 0.3 * slaFactor) * 100)
      )
    );

    const calculatedCostEfficiencyRatio = Number(
      ((calculatedEfficiency / 100) * (1.1 + (newAutomation / 100) * 0.4)).toFixed(2)
    );

    const updatedActivity: ActivityNode = {
      ...activity,
      metrics: {
        ...currentMetrics,
        budgetUSD: Math.round(newBudget),
        automationPct: Math.round(newAutomation),
        slaPct: Number(newSla.toFixed(2)),
        efficiencyScore: calculatedEfficiency,
        costEfficiencyRatio: calculatedCostEfficiencyRatio,
      },
    };

    const newActivities = [...currentSectorData.activities];
    newActivities[activityIndex] = updatedActivity;

    const newSectorsData = {
      ...sectorsData,
      [activeSector]: {
        ...currentSectorData,
        activities: newActivities,
      },
    };

    set({ sectorsData: newSectorsData });

    // Systemic bottleneck alert evaluation
    // Debounced with stable `id` so Sonner updates in-place instead of stacking multiple toasts
    if (toastDebounceTimer) {
      clearTimeout(toastDebounceTimer);
    }

    toastDebounceTimer = setTimeout(() => {
      const defaultBudget = activity.defaultMetrics.budgetUSD;
      const toastId = `activity-status-${activity.id}`;

      if (newBudget < defaultBudget * 0.55 && activity.category !== 'margin') {
        toast.warning(`⚠️ Cuello de Botella: ${activity.name}`, {
          id: toastId,
          description: `Presupuesto reducido a $${Math.round(newBudget)}K USD. Riesgo de fricción sistémica en la cadena.`,
          duration: 3500,
        });
      } else if (newAutomation < 45 && activity.category === 'primary') {
        toast.warning(`⚠️ Alerta de Rendimiento: ${activity.name}`, {
          id: toastId,
          description: `Automatización baja (${Math.round(newAutomation)}%). Riesgo de sobrecarga manual.`,
          duration: 3500,
        });
      } else if (calculatedEfficiency >= 94) {
        toast.success(`✨ Actividad Optimizada: ${activity.code}`, {
          id: toastId,
          description: `Alta eficiencia (${calculatedEfficiency}%) impulsa el margen proyectado.`,
          duration: 3000,
        });
      } else {
        // Dismiss alert if activity returned to nominal healthy state
        toast.dismiss(toastId);
      }
    }, 450);
  },

  resetSimulation: () => {
    const { activeSector } = get();
    const defaultSector = JSON.parse(JSON.stringify(SECTORS_DATA[activeSector]));

    set((state) => ({
      sectorsData: {
        ...state.sectorsData,
        [activeSector]: defaultSector,
      },
    }));

    toast.success('Simulador restablecido a valores base de referencia', {
      description: 'Métricas de Porter, presupuestos y SLAs devueltos al estado nominal.',
      duration: 3000,
    });
  },

  getActiveSectorData: () => {
    const { activeSector, sectorsData } = get();
    return sectorsData[activeSector];
  },

  getSelectedActivity: () => {
    const { selectedActivityId, getActiveSectorData } = get();
    if (!selectedActivityId) return null;
    const sectorData = getActiveSectorData();
    return sectorData.activities.find((a) => a.id === selectedActivityId) || null;
  },

  getFilteredActivities: () => {
    const { filterType, searchQuery, getActiveSectorData } = get();
    const sector = getActiveSectorData();
    let list = sector.activities;

    // Text search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          a.itilStage.toLowerCase().includes(q) ||
          a.itilPractice.toLowerCase().includes(q) ||
          a.shortDescription.toLowerCase().includes(q)
      );
    }

    // Category / Status Filter
    if (filterType === 'primary') {
      list = list.filter((a) => a.category === 'primary');
    } else if (filterType === 'support') {
      list = list.filter((a) => a.category === 'support');
    } else if (filterType === 'bottleneck') {
      list = list.filter(
        (a) =>
          a.systemicRole.bottleneckRisk === 'high' ||
          a.systemicRole.bottleneckRisk === 'critical' ||
          a.metrics.budgetUSD < a.defaultMetrics.budgetUSD * 0.7 ||
          a.metrics.automationPct < 60
      );
    } else if (filterType === 'critical_itil') {
      list = list.filter(
        (a) =>
          a.itilStage.includes('Entregar') ||
          a.itilStage.includes('Obtener') ||
          a.category === 'margin'
      );
    }

    return list;
  },

  calculateSimulationResult: () => {
    const { getActiveSectorData } = get();
    const sector = getActiveSectorData();
    const activities = sector.activities;

    let totalBudget = 0;
    let sumAutomation = 0;
    let sumSla = 0;
    let sumEfficiency = 0;
    const activeBottlenecks: {
      activityId: string;
      activityName: string;
      reason: string;
      severity: BottleneckSeverity;
    }[] = [];

    activities.forEach((act) => {
      totalBudget += act.metrics.budgetUSD;
      sumAutomation += act.metrics.automationPct;
      sumSla += act.metrics.slaPct;
      sumEfficiency += act.metrics.efficiencyScore;

      // Check bottleneck condition
      if (act.metrics.budgetUSD < act.defaultMetrics.budgetUSD * 0.6) {
        activeBottlenecks.push({
          activityId: act.id,
          activityName: act.name,
          reason: `Presupuesto reducido en un ${Math.round((1 - act.metrics.budgetUSD / act.defaultMetrics.budgetUSD) * 100)}% genera retrasos en el flujo de valor.`,
          severity: 'high',
        });
      } else if (act.metrics.automationPct < 50 && act.category === 'primary') {
        activeBottlenecks.push({
          activityId: act.id,
          activityName: act.name,
          reason: `Nivel de automatización de solo ${act.metrics.automationPct}% crea saturación manual y cola de incidentes.`,
          severity: 'medium',
        });
      } else if (act.metrics.slaPct < 90) {
        activeBottlenecks.push({
          activityId: act.id,
          activityName: act.name,
          reason: `SLA de ${act.metrics.slaPct}% infringe acuerdos de servicio contractuales con clientes clave.`,
          severity: 'critical',
        });
      }
    });

    const count = activities.length;
    const avgAutomation = Math.round(sumAutomation / count);
    const avgSla = Number((sumSla / count).toFixed(2));
    const avgEfficiency = Math.round(sumEfficiency / count);

    // Baseline margin
    const baselineMargin = sector.id === 'ai' ? 34.8 : 38.2;
    // Systemic margin delta: efficiency gains, automation boost minus bottleneck penalties
    const efficiencyImpact = ((avgEfficiency - 85) / 100) * 8;
    const automationImpact = ((avgAutomation - 75) / 100) * 6;
    const bottleneckPenalty = activeBottlenecks.length * 2.5;

    const systemicMarginPct = Number(
      Math.max(8.0, Math.min(52.0, baselineMargin + efficiencyImpact + automationImpact - bottleneckPenalty)).toFixed(1)
    );
    const valueMarginDeltaPct = Number((systemicMarginPct - baselineMargin).toFixed(1));

    const healthIndex = Math.max(
      10,
      Math.min(100, Math.round(avgEfficiency * 0.6 + avgAutomation * 0.4 - activeBottlenecks.length * 10))
    );

    return {
      totalBudgetUSD: totalBudget,
      avgAutomationPct: avgAutomation,
      avgSlaPct: avgSla,
      systemicMarginPct,
      valueMarginDeltaPct,
      systemicHealthIndex: healthIndex,
      activeBottlenecks,
      isOptimized: activeBottlenecks.length === 0 && systemicMarginPct >= baselineMargin + 2,
    };
  },
}));

// Reactive custom hooks to guarantee immediate React re-renders without snapshot instability
export const useActiveSectorData = (): SectorData =>
  useValueChainStore((s) => s.sectorsData[s.activeSector]);

export const useSelectedActivity = (): ActivityNode | null => {
  const selectedActivityId = useValueChainStore((s) => s.selectedActivityId);
  const sector = useActiveSectorData();

  return useMemo(() => {
    if (!selectedActivityId) return null;
    return sector.activities.find((a) => a.id === selectedActivityId) || null;
  }, [selectedActivityId, sector]);
};

export const useSimulationResult = (): SimulationResult => {
  const sector = useActiveSectorData();
  const calculateSimulationResult = useValueChainStore((s) => s.calculateSimulationResult);

  return useMemo(() => {
    void sector;
    return calculateSimulationResult();
  }, [sector, calculateSimulationResult]);
};

export interface FilterResult {
  activeIds: Set<string>;
  isFilteringActive: boolean;
  matchCount: number;
}

export const useFilteredActivityIds = (): FilterResult => {
  const filterType = useValueChainStore((s) => s.filterType);
  const searchQuery = useValueChainStore((s) => s.searchQuery);
  const sector = useActiveSectorData();

  return useMemo(() => {
    const isSearchActive = searchQuery.trim().length > 0;
    const isFilterActive = filterType !== 'all';
    const isFilteringActive = isSearchActive || isFilterActive;

    if (!isFilteringActive) {
      return {
        activeIds: new Set(sector.activities.map((a) => a.id)),
        isFilteringActive: false,
        matchCount: sector.activities.length,
      };
    }

    let list = sector.activities;

    // Search query filter
    if (isSearchActive) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) => {
        const inName = a.name.toLowerCase().includes(q);
        const inCode = a.code.toLowerCase().includes(q);
        const inItilStage = a.itilStage.toLowerCase().includes(q);
        const inItilPractice = a.itilPractice.toLowerCase().includes(q);
        const inShortDesc = a.shortDescription.toLowerCase().includes(q);
        const inSubChips = a.subChips?.some((c) => c.toLowerCase().includes(q)) ?? false;
        const inProcesses = a.keyProcesses?.some((p) => p.toLowerCase().includes(q)) ?? false;
        const inTech = a.techStack?.some((t) => t.toLowerCase().includes(q)) ?? false;
        return inName || inCode || inItilStage || inItilPractice || inShortDesc || inSubChips || inProcesses || inTech;
      });
    }

    // Category / Status Filter
    if (filterType === 'primary') {
      list = list.filter((a) => a.category === 'primary');
    } else if (filterType === 'support') {
      list = list.filter((a) => a.category === 'support');
    } else if (filterType === 'bottleneck') {
      list = list.filter(
        (a) =>
          a.systemicRole.bottleneckRisk === 'high' ||
          a.systemicRole.bottleneckRisk === 'critical' ||
          a.metrics.budgetUSD < a.defaultMetrics.budgetUSD * 0.7 ||
          a.metrics.automationPct < 60
      );
    } else if (filterType === 'critical_itil') {
      list = list.filter(
        (a) =>
          a.itilStage.toLowerCase().includes('entregar') ||
          a.itilStage.toLowerCase().includes('obtener') ||
          a.category === 'margin'
      );
    }

    const matchedIds = new Set(list.map((a) => a.id));

    return {
      activeIds: matchedIds,
      isFilteringActive: true,
      matchCount: matchedIds.size,
    };
  }, [filterType, searchQuery, sector]);
};


