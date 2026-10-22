import { useEffect, useRef, useState } from 'react';
import { Activity as ActivityIcon, AlertTriangle, Bell, Download, Plane, ShieldCheck } from 'lucide-react';
import type { ActivityEvent } from '../types';
import { formatStamp } from '../data';

interface Props {
  events: ActivityEvent[];
}

const KIND_META: Record<
  ActivityEvent['kind'],
  { icon: React.ReactNode; ring: string; text: string; label: string }
> = {
  info: { icon: <ShieldCheck className="h-3.5 w-3.5" />, ring: 'bg-slate-700', text: 'text-slate-300', label: 'Info' },
  drone: { icon: <Plane className="h-3.5 w-3.5" />, ring: 'bg-cyan-500/80', text: 'text-cyan-300', label: 'Drone' },
  alert: { icon: <AlertTriangle className="h-3.5 w-3.5" />, ring: 'bg-rose-500/80', text: 'text-rose-300', label: 'Alert' },
  privacy: { icon: <Bell className="h-3.5 w-3.5" />, ring: 'bg-amber-500/80', text: 'text-amber-300', label: 'Privacy' },
};

type Filter = 'all' | ActivityEvent['kind'];
const FILTERS: Filter[] = ['all', 'alert', 'drone', 'privacy', 'info'];

export function ActivityTimeline({ events }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const shown = filter === 'all' ? events : events.filter((e) => e.kind === filter);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events]);

  // Download the whole log as a text file (oldest first)
  const exportLog = () => {
    const lines = [...events]
      .reverse()
      .map((e) => `${formatStamp(e.timestamp)}  [${e.kind.toUpperCase()}]  ${e.label} — ${e.detail}`);
    const blob = new Blob([`AEROGUARD DEMO LOG (fictional data)\n\n${lines.join('\n')}\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aeroguard-demo-log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-[#0b1628]">
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-slate-300" />
          <h2 className="text-sm font-semibold text-white">Activity Timeline</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
            {events.length} events
          </span>
          <button
            onClick={exportLog}
            title="Download log as .txt"
            className="flex items-center gap-1 rounded-md border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400 hover:bg-slate-800"
          >
            <Download className="h-3 w-3" /> Export
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-800/50 px-3 py-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-2 py-0.5 text-[10px] font-medium capitalize transition ${
              filter === f ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {f === 'all' ? 'All' : KIND_META[f].label}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-3">
        {shown.length === 0 && <p className="py-6 text-center text-xs text-slate-500">No events of this type yet.</p>}
        <ol className="relative space-y-3 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
          {shown.map((ev) => {
            const meta = KIND_META[ev.kind];
            return (
              <li key={ev.id} className="ag-animate-in relative flex gap-3 pl-0">
                <span
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${meta.ring}`}
                >
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold text-white">{ev.label}</p>
                    <span className="shrink-0 font-mono text-[10px] text-slate-500">
                      {formatStamp(ev.timestamp)}
                    </span>
                  </div>
                  <p className={`mt-0.5 text-xs ${meta.text}`}>{ev.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}