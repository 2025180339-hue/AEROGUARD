import { Battery, Plane, Zap } from 'lucide-react';
import type { Drone, DroneStatus } from '../types';
import { MIN_BATTERY } from '../data';

const DOT: Record<DroneStatus, string> = {
  Available: 'bg-emerald-400',
  Dispatched: 'bg-cyan-400',
  Returning: 'bg-amber-400',
};

const batteryColor = (b: number) => (b < MIN_BATTERY ? 'text-rose-300' : b < 60 ? 'text-amber-300' : 'text-slate-400');
const barColor = (b: number) => (b < MIN_BATTERY ? 'bg-rose-400' : b < 60 ? 'bg-amber-400' : 'bg-emerald-400');

export function FleetPanel({ drones, decision }: { drones: Drone[]; decision: string | null }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1628]">
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Drone Fleet</h2>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">
          {drones.filter((d) => d.status === 'Available' && d.battery >= MIN_BATTERY).length}/{drones.length} ready
        </span>
      </div>
      <ul className="divide-y divide-slate-800/60">
        {drones.map((d) => {
          const lowCharging = d.status === 'Available' && d.battery < MIN_BATTERY;
          return (
            <li key={d.id} className="px-4 py-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono font-semibold text-white">
                  <span className={`h-2 w-2 rounded-full ${DOT[d.status]}`} />
                  {d.name}
                </span>
                <span className="text-slate-300">{lowCharging ? 'Charging · not ready' : d.status !== 'Available' && d.battery < MIN_BATTERY ? `${d.status} · low battery` : d.status}</span>
                <span className={`flex items-center gap-1 font-mono ${batteryColor(d.battery)}`}>
                  {d.status === 'Available' && d.battery < 100 ? <Zap className="h-3 w-3" /> : <Battery className="h-3 w-3" />}
                  {d.battery}%
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full transition-all ${barColor(d.battery)}`} style={{ width: `${d.battery}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-slate-800/70 px-4 py-2.5 text-[11px] text-slate-400">
        <span className="font-semibold uppercase tracking-widest text-slate-500">Dispatch decision</span>
        <p className="mt-1 font-mono text-cyan-200/90">{decision ?? 'Nearest ready unit is chosen automatically.'}</p>
      </div>
    </div>
  );
}