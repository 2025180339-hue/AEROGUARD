import { AlertTriangle, Bell, BellRing, Check, Zap } from 'lucide-react';
import type { AlertItem } from '../types';
import { SEVERITY_META, formatStamp } from '../data';

interface Props {
  alerts: AlertItem[];
  onTrigger: () => void;
  onAcknowledge: (id: string) => void;
}

export function AlertPanel({ alerts, onTrigger, onAcknowledge }: Props) {
  const activeCount = alerts.filter((a) => !a.acknowledged).length;
  const hasCritical = alerts.some((a) => !a.acknowledged && a.severity === 'critical');

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-[#0b1628] transition ${
        hasCritical
          ? 'border-red-500/50 shadow-lg shadow-red-500/10'
          : 'border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <BellRing className="h-4 w-4 text-rose-400" />
            {activeCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-white">Emergency Alerts</h2>
        </div>
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
            hasCritical
              ? 'bg-red-500/20 text-red-200'
              : activeCount > 0
                ? 'bg-amber-500/15 text-amber-200'
                : 'bg-slate-800 text-slate-400'
          }`}
        >
          {hasCritical ? 'Critical' : activeCount > 0 ? 'Active' : 'Nominal'}
        </span>
      </div>

      <div className="max-h-[280px] flex-1 space-y-2 overflow-y-auto p-3">
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Bell className="h-6 w-6 text-slate-600" />
            <p className="text-xs text-slate-500">No active alerts. System nominal.</p>
          </div>
        )}
        {alerts.map((a) => {
          const meta = SEVERITY_META[a.severity];
          return (
            <div
              key={a.id}
              className={`ag-animate-in rounded-lg border p-3 ${meta.bg} ${meta.ring} ring-1`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className={`h-3.5 w-3.5 ${meta.text}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.text}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-white">{a.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {a.zone} · <span className="font-mono">{formatStamp(a.timestamp)}</span>
                  </p>
                </div>
                {!a.acknowledged ? (
                  <button
                    onClick={() => onAcknowledge(a.id)}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-[10px] font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700"
                  >
                    <Check className="h-3 w-3" /> Ack
                  </button>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-medium text-emerald-300">
                    <Check className="h-3 w-3" /> Ack
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-800/70 p-3">
        <button
          onClick={onTrigger}
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:from-rose-400 hover:to-red-500 active:scale-[0.98]"
        >
          <Zap className="h-4 w-4 transition group-hover:rotate-12" />
          Trigger Test Alert
        </button>
        <p className="mt-1.5 text-center text-[10px] text-slate-500">
          Generates a fictional incident for demonstration
        </p>
      </div>
    </div>
  );
}
