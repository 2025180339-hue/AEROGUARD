import { Battery, Clock, Plane, RotateCcw, Send, Wifi } from 'lucide-react';
import type { DroneStatus } from '../types';

interface Props {
  name: string;
  status: DroneStatus;
  battery: number;
  signal: number;
  lastDeploy: number | null;
  onDispatch: () => void;
  onReturn: () => void;
  canDispatch: boolean;
}

const STATUS_META: Record<
  DroneStatus,
  { label: string; text: string; bg: string; ring: string; dot: string }
> = {
  Available: {
    label: 'Available',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  Dispatched: {
    label: 'Dispatched',
    text: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    ring: 'ring-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  Returning: {
    label: 'Returning',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/30',
    dot: 'bg-amber-400',
  },
};

export function DroneStatusCard({
  name,
  status,
  battery,
  signal,
  lastDeploy,
  onDispatch,
  onReturn,
  canDispatch,
}: Props) {
  const meta = STATUS_META[status];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1628]">
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Drone Unit · {name}</h2>
        </div>
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${meta.bg} ${meta.text} ring-1 ${meta.ring}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="p-4">
        {/* Drone illustration */}
        <div className="relative mb-4 flex h-24 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-[#0a1426] to-[#0b1628]">
          <div className="ag-grid-bg absolute inset-0 opacity-40" />
          <div className="relative flex flex-col items-center">
            <div
              className="text-cyan-400"
              style={{
                animation:
                  status === 'Available'
                    ? 'none'
                    : 'ag-ping-dot 1.4s ease-in-out infinite',
              }}
            >
              <Plane
                className="h-9 w-9"
                style={{
                  transform:
                    status === 'Returning' ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.5s ease',
                }}
              />
            </div>
            <span className={`mt-1 text-[10px] font-semibold ${meta.text}`}>
              {status === 'Available'
                ? 'Standby at base'
                : status === 'Dispatched'
                  ? 'En route to incident'
                  : 'Returning to base'}
            </span>
          </div>
        </div>

        {/* Telemetry */}
        <div className="grid grid-cols-3 gap-2">
          <Telemetry icon={<Battery className="h-3.5 w-3.5" />} label="Battery" value={`${battery}%`} bar={battery} barClass="bg-emerald-400" />
          <Telemetry icon={<Wifi className="h-3.5 w-3.5" />} label="Signal" value={`${signal}%`} bar={signal} barClass="bg-sky-400" />
          <Telemetry
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Last deploy"
            value={lastDeploy ? new Date(lastDeploy).toLocaleTimeString('en-MY', { hour12: false }) : '--:--'}
          />
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onDispatch}
            disabled={!canDispatch}
            className="group flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-sky-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="h-4 w-4 transition group-hover:translate-x-0.5" />
            Dispatch Drone
          </button>
          <button
            onClick={onReturn}
            disabled={status !== 'Dispatched'}
            className="group flex flex-1 items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4 transition group-hover:-rotate-45" />
            Return Drone
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-500">
          Simulated deployment — no real drone hardware
        </p>
      </div>
    </div>
  );
}

function Telemetry({
  icon,
  label,
  value,
  bar,
  barClass = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bar?: number;
  barClass?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2.5">
      <div className="flex items-center gap-1 text-slate-400">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 font-mono text-sm font-semibold text-white">{value}</p>
      {bar !== undefined && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barClass}`}
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
    </div>
  );
}