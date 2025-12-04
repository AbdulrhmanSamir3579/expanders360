// Core data models for the workflow monitoring system

export interface WorkflowEvent {
  id: string;
  type: 'case_intake' | 'approval' | 'document_review' | 'completed' | 'delayed' | 'sla_breach';
  status: 'completed' | 'pending' | 'anomaly';
  timestamp: string;
  title: string;
  duration?: number;
}

export interface Anomaly {
  id: string;
  type: 'delay' | 'sla_breach' | 'stuck_workflow' | 'duplicate_case';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  workflowId: string;
  hour?: number;
}

export interface OverviewStats {
  totalWorkflowsToday: number;
  averageCycleTime: number;
  slaCompliance: number;
  activeAnomaliesCount: number;
}

export interface TimelineEvent {
  timestamp: string;
  eventType: 'workflow_started' | 'workflow_completed' | 'anomaly_detected' | 'sla_warning';
  data: WorkflowEvent;
}

export interface WebSocketMessage {
  type: 'event' | 'anomaly' | 'stats_update';
  data: any;
  timestamp: string;
}

export interface FilterState {
  categories: Set<string>;
  anomalyTypes: Set<string>;
  timeRange: '6h' | '12h' | '24h';
}
