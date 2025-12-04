
export type ChartType = 'bar' | 'line' | 'heatmap' | 'timeline';

export interface ChartColors {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  text: string;
  grid: string;
}

export interface ChartConfig {
  colors?: Partial<ChartColors>;
  fontFamily?: string;
  fontSize?: number;
  borderRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  smooth?: boolean;
  stacked?: boolean;
  hybrid?: boolean; // Enable bar+line hybrid chart
}

export interface ChartDataPoint {
  name: string | number;
  value: number;
  label?: string;
  color?: string;
}

export interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  label?: string;
}

export interface TimelineData {
  timestamp: string;
  status: 'completed' | 'pending' | 'anomaly';
  title: string;
  description?: string;
}
