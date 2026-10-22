export type DroneStatus = 'Available' | 'Dispatched' | 'Returning';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ReviewStatus = 'pending' | 'reviewed' | 'escalated';

export interface Incident {
  id: string;
  code: string;
  title: string;
  zone: string;
  severity: Severity;
  reviewStatus: ReviewStatus;
  timestamp: number;
  acknowledged: boolean;
  coords: { x: number; y: number };
  summary: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: number;
  label: string;
  detail: string;
  kind: 'info' | 'drone' | 'alert' | 'privacy';
}

export interface AlertItem {
  id: string;
  incidentId: string;
  title: string;
  zone: string;
  severity: Severity;
  timestamp: number;
  acknowledged: boolean;
}

export interface TownshipZone {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Drone {
  id: string;
  name: string;
  base: { x: number; y: number };
  pos: { x: number; y: number };
  target: { x: number; y: number } | null;
  status: DroneStatus;
  battery: number;
}
