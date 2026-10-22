import { Check, Play, RotateCcw, Timer } from 'lucide-react';

export type ScenarioStage = 'idle' | 'alert' | 'dispatched' | 'onscene' | 'done';

interface Props {
  stage: ScenarioStage;
  distanceM: number | null;
  droneEta: number | null;
  guardEta: number | null;
  onRun: () => void;
  onReset: () => void;
  zone: string;
  zones: string[];
  onZone: (z: string) => void;
  droneName: string | null;
}

const ORDER: ScenarioStage[] = ['idle', 'alert', 'dispatched', 'onscene', 'done'];

const STEPS: Array<{ id: ScenarioStage; label: string }> = [
  { id: 'alert', label: 'Panic alert + broadcast to residents' },
  { id: 'dispatched', label: 'Operator approves · drone dispatched' },
  { id: 'onscene', label: 'On scene · recording · evidence sealed' },
  { id: 'done', label: 'Police handoff · drone returns' },
];

function fmt(sec: number | null) {
  if (sec === null) return '--';
  return sec >= 60 ? `${Math.floor(sec / 60)}m ${sec % 60}s` : `${sec}s`;
}

export function ScenarioPanel({ stage, distanceM, droneEta, guardEta, onRun, onReset, zone, zones, onZone, droneName }: Props) {
  const idx = ORDER.indexOf(stage);
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1628]">
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Demo Scenario · Robbery</h2>
        </div>
        <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Scripted
        </span>
      </div>
      <div className="space-y-3 p-4">
        <ol className="space-y-1.5">
          {STEPS.map((s) => {
            const done = idx >= ORDER.indexOf(s.id);
            return (
              <li key={s.id} className="flex items-center gap-2 text-xs">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    done ? 'bg-emerald-500/80 text-white' : 'bg-slate-800 text-transparent'
                  }`}
                >
                  <Check className="h-3 w-3" />
                </span>
                <span className={done ? 'text-slate-200' : 'text-slate-500'}>{s.label}</span>
              </li>
            );
          })}
        </ol>

        <div className="grid grid-cols-3 gap-2">
          <Metric label="Distance" value={distanceM === null ? '--' : `${distanceM} m`} />
          <Metric label={droneName ? `${droneName} ETA` : 'Drone ETA'} value={fmt(droneEta)} accent="text-cyan-300" />
          <Metric label="Guard on foot" value={fmt(guardEta)} accent="text-amber-300" />
        </div>
        <p className="text-[10px] text-slate-500">
          Model assumptions: 1 map unit = 15 m, drone 10 m/s, guard 1.4 m/s. Animation is sped up.
        </p>

        <label className="block text-[11px] text-slate-400">
          Incident location (nearest available drone is auto-selected)
          <select
            value={zone}
            disabled={stage !== 'idle'}
            onChange={(e) => onZone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 disabled:opacity-50"
          >
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            onClick={onRun}
            disabled={stage !== 'idle'}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="h-4 w-4" /> Run scenario
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent = 'text-white' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 font-mono text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}