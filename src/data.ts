import type { ActivityEvent, Incident, Severity, TownshipZone } from './types';

export const ZONES: TownshipZone[] = [
  { id: 'z1', name: 'Taman Sri Mawar', type: 'Residential', x: 12, y: 14, w: 26, h: 22 },
  { id: 'z2', name: 'Medan Niaga Sentral', type: 'Commercial', x: 42, y: 12, w: 22, h: 20 },
  { id: 'z3', name: 'Tasik Harmoni Park', type: 'Park / Lake', x: 68, y: 18, w: 22, h: 24 },
  { id: 'z4', name: 'Sekolah Kebangsaan Bakti', type: 'School', x: 16, y: 52, w: 24, h: 18 },
  { id: 'z5', name: 'Klinik Suria', type: 'Clinic', x: 46, y: 48, w: 18, h: 16 },
  { id: 'z6', name: 'Pangsapuri Indah', type: 'Apartments', x: 70, y: 54, w: 22, h: 18 },
];

export const INCIDENT_TEMPLATES: Array<
  Pick<Incident, 'code' | 'title' | 'severity' | 'summary'> & { zone: string }
> = [
  {
    code: 'AG-001',
    title: 'Suspicious vehicle parked after curfew',
    summary: 'Vehicle idle near residential access for 14 min. Operator review required.',
    severity: 'medium',
    zone: 'Taman Sri Mawar',
  },
  {
    code: 'AG-002',
    title: 'Perimeter breach — side gate',
    summary: 'Motion detected at side gate. No occupant badge activity in window.',
    severity: 'high',
    zone: 'Pangsapuri Indah',
  },
  {
    code: 'AG-003',
    title: 'Loitering reported near school',
    summary: 'Group assembled outside gate during off-hours. Operator to confirm.',
    severity: 'low',
    zone: 'Sekolah Kebangsaan Bakti',
  },
  {
    code: 'AG-004',
    title: 'Unattended package near storefront',
    summary: 'Item stationary for 9 min. Commercial zone alert.',
    severity: 'high',
    zone: 'Medan Niaga Sentral',
  },
  {
    code: 'AG-005',
    title: 'Noise complaint — park pavilion',
    summary: 'After-hours activity flagged by neighbourhood watch.',
    severity: 'low',
    zone: 'Tasik Harmoni Park',
  },
  {
    code: 'AG-006',
    title: 'Streetlight outage reported',
    summary: 'Dark section on main access road. Maintenance request suggested.',
    severity: 'low',
    zone: 'Taman Sri Mawar',
  },
];

export function zoneCoords(zoneName: string): { x: number; y: number } {
  const z = ZONES.find((z) => z.name === zoneName) ?? ZONES[0];
  return { x: z.x + z.w / 2, y: z.y + z.h / 2 };
}

let counter = 100;
export function nextId(prefix = 'ev') {
  counter += 1;
  return `${prefix}-${counter}-${Math.floor(Math.random() * 10000)}`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-MY', { hour12: false });
}

export function formatStamp(ts: number): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short' });
  const time = d.toLocaleTimeString('en-MY', { hour12: false });
  return `${date} ${time}`;
}

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-init-1',
    code: 'AG-004',
    title: 'Unattended package near storefront',
    zone: 'Medan Niaga Sentral',
    severity: 'high',
    reviewStatus: 'pending',
    timestamp: Date.now() - 1000 * 60 * 8,
    acknowledged: false,
    coords: zoneCoords('Medan Niaga Sentral'),
    summary: 'Item stationary for 9 min. Commercial zone alert.',
  },
  {
    id: 'inc-init-2',
    code: 'AG-001',
    title: 'Suspicious vehicle parked after curfew',
    zone: 'Taman Sri Mawar',
    severity: 'medium',
    reviewStatus: 'reviewed',
    timestamp: Date.now() - 1000 * 60 * 22,
    acknowledged: true,
    coords: zoneCoords('Taman Sri Mawar'),
    summary: 'Vehicle idle near residential access for 14 min. Operator review required.',
  },
  {
    id: 'inc-init-3',
    code: 'AG-003',
    title: 'Loitering reported near school',
    zone: 'Sekolah Kebangsaan Bakti',
    severity: 'low',
    reviewStatus: 'reviewed',
    timestamp: Date.now() - 1000 * 60 * 47,
    acknowledged: true,
    coords: zoneCoords('Sekolah Kebangsaan Bakti'),
    summary: 'Group assembled outside gate during off-hours. Operator to confirm.',
  },
];

export const INITIAL_ACTIVITY: ActivityEvent[] = [
  {
    id: nextId('ev'),
    timestamp: Date.now() - 1000 * 60 * 50,
    label: 'Shift opened',
    detail: 'Operator on-duty: A. Rahman (ID: OP-0421)',
    kind: 'info',
  },
  {
    id: nextId('ev'),
    timestamp: Date.now() - 1000 * 60 * 47,
    label: 'Incident AG-003 reviewed',
    detail: 'Loitering report confirmed and closed.',
    kind: 'alert',
  },
  {
    id: nextId('ev'),
    timestamp: Date.now() - 1000 * 60 * 22,
    label: 'Incident AG-001 reviewed',
    detail: 'Vehicle cleared by resident confirmation.',
    kind: 'alert',
  },
  {
    id: nextId('ev'),
    timestamp: Date.now() - 1000 * 60 * 8,
    label: 'Alert AG-004 raised',
    detail: 'Unattended package flagged in Medan Niaga Sentral.',
    kind: 'alert',
  },
];

export const SEVERITY_META: Record<
  Severity,
  { label: string; text: string; bg: string; ring: string; dot: string }
> = {
  low: {
    label: 'Low',
    text: 'text-sky-300',
    bg: 'bg-sky-500/10',
    ring: 'ring-sky-500/30',
    dot: 'bg-sky-400',
  },
  medium: {
    label: 'Medium',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/30',
    dot: 'bg-amber-400',
  },
  high: {
    label: 'High',
    text: 'text-rose-300',
    bg: 'bg-rose-500/10',
    ring: 'ring-rose-500/30',
    dot: 'bg-rose-400',
  },
  critical: {
    label: 'Critical',
    text: 'text-red-200',
    bg: 'bg-red-500/20',
    ring: 'ring-red-500/50',
    dot: 'bg-red-500',
  },
};

import type { Drone } from './types';

const mk = (n: number, x: number, battery: number): Drone => ({
  id: `d${n}`,
  name: `DR-0${n}`,
  base: { x, y: 45 },
  pos: { x, y: 45 },
  target: null,
  status: 'Available',
  battery,
});
export const FLEET: Drone[] = [mk(1, 22, 92), mk(2, 52, 88), mk(3, 82, 95)];

// Battery rules (demo)
export const MIN_BATTERY = 35; // below this a drone cannot be dispatched
export const LOW_BATTERY = 20; // a deployed drone this low returns to base by itself