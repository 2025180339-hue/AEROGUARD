import { FastForward, Pause, Play, RotateCcw, Siren } from 'lucide-react';

interface Props {
  paused: boolean;
  speed: 1 | 2;
  canStart: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeed: () => void;
  autoOn: boolean;
  onAuto: () => void;
}

const btn =
  'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

export function DemoControls({ paused, speed, canStart, onStart, onPause, onReset, onSpeed, autoOn, onAuto }: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-[#0b1628] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Demo controls</span>
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
            paused ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
          }`}
        >
          {paused ? 'Paused' : `Running ×${speed}`}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onStart}
          disabled={!canStart}
          title={canStart ? 'Start the panic-button scenario' : 'Scenario already started — press Reset first'}
          className={`${btn} border-cyan-500/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20`}
        >
          <Play className="h-3.5 w-3.5" /> Start
        </button>
        <button
          onClick={onPause}
          className={`${btn} border-slate-700 text-slate-200 hover:bg-slate-800`}
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={onSpeed}
          className={`${btn} ${
            speed === 2 ? 'border-cyan-500/50 text-cyan-300' : 'border-slate-700 text-slate-200'
          } hover:bg-slate-800`}
        >
          <FastForward className="h-3.5 w-3.5" /> ×2
        </button>
        <button
          onClick={onAuto}
          title="New simulated incidents appear every 20-30 s"
          className={`${btn} ${
            autoOn ? 'border-rose-500/50 text-rose-300' : 'border-slate-700 text-slate-400'
          } hover:bg-slate-800`}
        >
          <Siren className="h-3.5 w-3.5" /> Auto incidents {autoOn ? 'ON' : 'OFF'}
        </button>
        <button onClick={onReset} className={`${btn} border-slate-700 text-slate-200 hover:bg-slate-800`}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}