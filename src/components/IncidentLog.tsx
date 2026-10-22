import { useState } from 'react';
import { CheckCircle2, Clock3, Eye, ShieldAlert } from 'lucide-react';
import type { Incident, ReviewStatus } from '../types';
import { SEVERITY_META, formatStamp } from '../data';

interface Props {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReview: (id: string, status: ReviewStatus) => void;
}

const REVIEW_META: Record<ReviewStatus, { label: string; text: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending review', text: 'text-amber-300', bg: 'bg-amber-500/10', icon: <Clock3 className="h-3 w-3" /> },
  reviewed: { label: 'Reviewed', text: 'text-emerald-300', bg: 'bg-emerald-500/10', icon: <CheckCircle2 className="h-3 w-3" /> },
  escalated: { label: 'Escalated', text: 'text-rose-300', bg: 'bg-rose-500/10', icon: <ShieldAlert className="h-3 w-3" /> },
};

export function IncidentLog({ incidents, selectedId, onSelect, onReview }: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');

  const filtered = incidents.filter((i) =>
    filter === 'all' ? true : filter === 'pending' ? i.reviewStatus === 'pending' : i.reviewStatus !== 'pending',
  );

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-[#0b1628]">
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-white">Live Incident Log</h2>
        </div>
        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
          {incidents.length} records
        </span>
      </div>

      <div className="flex gap-1 border-b border-slate-800/70 px-3 py-2">
        {(['all', 'pending', 'reviewed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition ${
              filter === f
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-500">No incidents in this view.</p>
        )}
        {filtered.map((inc) => {
          const meta = SEVERITY_META[inc.severity];
          const review = REVIEW_META[inc.reviewStatus];
          const active = inc.id === selectedId;
          return (
            <div
              key={inc.id}
              onClick={() => onSelect(inc.id)}
              className={`ag-animate-in cursor-pointer rounded-lg border p-3 transition ${
                active
                  ? 'border-sky-500/50 bg-sky-500/5 ring-1 ring-sky-500/30'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    <span className="font-mono text-xs font-semibold text-slate-300">{inc.code}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${meta.bg} ${meta.text}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-white">{inc.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{inc.zone}</p>
                  <p className="mt-1 font-mono text-[10px] text-slate-500">{formatStamp(inc.timestamp)}</p>
                </div>
                <span className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium ${review.bg} ${review.text}`}>
                  {review.icon}
                  {review.label}
                </span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-400">{inc.summary}</p>

              <div className="mt-2.5 flex items-center gap-2 border-t border-slate-800/70 pt-2.5">
                {inc.reviewStatus !== 'reviewed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReview(inc.id, 'reviewed');
                    }}
                    className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Mark reviewed
                  </button>
                )}
                {inc.reviewStatus !== 'escalated' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReview(inc.id, 'escalated');
                    }}
                    className="flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-medium text-rose-300 transition hover:bg-rose-500/20"
                  >
                    <ShieldAlert className="h-3 w-3" /> Escalate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
