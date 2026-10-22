import { Activity, Radio, ShieldCheck } from 'lucide-react';

export function Header({ now }: { now: number }) {
  const dateStr = new Date(now).toLocaleDateString('en-MY', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = new Date(now).toLocaleTimeString('en-MY', { hour12: false });

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0a1426]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow-lg shadow-sky-500/20">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wide text-white sm:text-xl">
                AEROGUARD
              </h1>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
                Township Watch
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Privacy-conscious drone-assisted neighbourhood monitoring
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <DemoBadge />
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5">
            <span
              className="h-2 w-2 rounded-full bg-emerald-400"
              style={{ animation: 'ag-ping-dot 1.6s ease-in-out infinite' }}
            />
            <span className="text-xs font-medium text-slate-300">System online</span>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 sm:flex">
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-mono text-xs text-slate-300">{dateStr} · {timeStr}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">OP-0421 · A. Rahman</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function DemoBanner() {
  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center">
      <p className="text-xs font-medium text-amber-200">
        <span className="font-bold">DEMO SIMULATION</span> — All data, incidents, drone activity, and
        camera feeds are fictional. Not connected to real drones, sensors, CCTV, or live tracking.
      </p>
    </div>
  );
}

export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Demo Simulation
    </span>
  );
}
