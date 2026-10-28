export type SectorType = 'ai' | 'cybersecurity';

export type ActivityCategory = 'primary' | 'support' | 'margin';

export type PorterType =
  // Primary
  | 'inbound_logistics'
  | 'operations'
  | 'outbound_logistics'
  | 'marketing_sales'
  | 'service'
  // Support
  | 'firm_infrastructure'
  | 'human_resource_management'
  | 'technology_development'
  | 'procurement'
  // Margin
  | 'margin';

export type BottleneckSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ActivityKPI {
  name: string;
  value: string;
  target: string;
  trend: 'up' | 'down' | 'neutral';
  status: 'optimal' | 'stable' | 'warning' | 'critical';
}

export interface SystemicRole {
  reinforces: string[]; // IDs of nodes this activity amplifies (Reinforcing Loop)
  dependsOn: string[]; // IDs of nodes required
  bottleneckRisk: BottleneckSeverity;
  bottleneckCondition: string; // Condition when this becomes a bottleneck
  leveragePoint: string; // Senge's leverage point definition
  reinforcingLoopTag?: string; // e.g. "R1: Data Network Effect"
  balancingLoopTag?: string; // e.g. "B1: Compute Cost Cap"
}

export interface ActivityMetrics {
  budgetUSD: number; // In Thousands (e.g., 450 = $450,000 USD)
  minBudgetUSD: number;
  maxBudgetUSD: number;
  automationPct: number; // 0 - 100 %
  slaPct: number; // 80.00 - 99.99 %
  maturityScore: number; // 1 - 5 ITIL/Porter maturity
  benchmarkMaturity: number; // 1 - 5 Industry Benchmark
  efficiencyScore: number; // Calculated dynamically
  costEfficiencyRatio: number; // Calculated dynamic factor
}

export interface ActivityNode {
  id: string;
  code: string; // e.g. "PR-01", "SP-02", "VAL-00"
  name: string;
  category: ActivityCategory;
  porterType: PorterType;
  itilStage: string; // ITIL 4 Service Value Chain: Planificar, Mejorar, Involucrar, Diseño y Transición, Obtener/Construir, Entregar y Soportar
  itilPractice: string; // Specific practice (e.g. "Gestión de la Disponibilidad", "Gestión de Incidentes")
  shortDescription: string;
  fullDescription: string;
  keyProcesses: string[];
  techStack: string[];
  kpis: ActivityKPI[];
  position3D: [number, number, number];
  colorAccent?: string;
  subChips?: string[]; // Post-it style task chips like Apple / UTP slides
  imageUrl: string;
  systemicRole: SystemicRole;
  metrics: ActivityMetrics;
  defaultMetrics: ActivityMetrics;
}

export interface SystemicArchetypeDefinition {
  name: string;
  sengeType: string; // e.g. "Límites al crecimiento" / "Éxito para los que tienen éxito" / "Desplazamiento de la carga"
  description: string;
  reinforcingLoops: {
    id: string;
    code: string;
    name: string;
    description: string;
    nodes: string[];
  }[];
  balancingLoops: {
    id: string;
    code: string;
    name: string;
    description: string;
    nodes: string[];
  }[];
  coreBottlenecks: {
    id: string;
    title: string;
    severity: BottleneckSeverity;
    consequence: string;
    mitigation: string;
  }[];
  leveragePoints: {
    id: string;
    title: string;
    description: string;
    impact: 'Alto' | 'Estratégico' | 'Transformacional';
  }[];
}

export interface MarginTimelinePoint {
  quarter: string;
  baseMargin: number;
  simulatedMargin: number;
  operationalCost: number;
  roi: number;
}

export interface SectorData {
  id: SectorType;
  name: string;
  title: string;
  badge: string;
  subtitle: string;
  tagline: string;
  overview: string;
  strategicObjective: string;
  activities: ActivityNode[];
  archetype: SystemicArchetypeDefinition;
  marginProjection: MarginTimelinePoint[];
}

export type ViewMode = 'hybrid' | '3d' | 'matrix';
export type FilterType = 'all' | 'primary' | 'support' | 'bottleneck' | 'critical_itil';

export interface SimulationResult {
  totalBudgetUSD: number;
  avgAutomationPct: number;
  avgSlaPct: number;
  systemicMarginPct: number; // e.g. 28.5%
  valueMarginDeltaPct: number; // delta compared to baseline
  systemicHealthIndex: number; // 0 - 100
  activeBottlenecks: { activityId: string; activityName: string; reason: string; severity: BottleneckSeverity }[];
  isOptimized: boolean;
}
