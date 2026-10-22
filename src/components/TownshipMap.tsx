import { MapPin, Navigation, Plane } from 'lucide-react';
import type { Drone, Incident } from '../types';
import { ZONES, SEVERITY_META } from '../data';

interface Props {
  incidents: Incident[];
  drones: Drone[];
  selectedIncidentId: string | null;
  onSelect: (id: string) => void;
}

export function TownshipMap({
  incidents,
  drones,
  selectedIncidentId,
  onSelect,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#08111f]">
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-white">Township Overview Map</h2>
        </div>
        <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Fictional Township
        </span>
      </div>

      <div className="relative ag-grid-bg">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="block aspect-[16/10] w-full"
        >
          {/* Roads */}
          <g stroke="rgba(148,163,184,0.18)" strokeWidth="0.6" fill="none">
            <path d="M0 44 L100 44" />
            <path d="M0 46 L100 46" />
            <path d="M38 0 L38 100" />
            <path d="M40 0 L40 100" />
            <path d="M64 0 L64 100" />
          </g>

          {/* Zones */}
          {ZONES.map((z) => (
            <g key={z.id}>
              <rect
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                rx="1.5"
                fill="rgba(56,132,197,0.06)"
                stroke="rgba(56,132,197,0.25)"
                strokeWidth="0.3"
                strokeDasharray="1 1"
              />
              <text
                x={z.x + 1}
                y={z.y + 3.2}
                fontSize="2"
                fill="rgba(203,213,225,0.55)"
                className="font-mono"
              >
                {z.name}
              </text>
              <text
                x={z.x + 1}
                y={z.y + 5.2}
                fontSize="1.6"
                fill="rgba(148,163,184,0.45)"
                className="font-mono"
              >
                {z.type}
              </text>
            </g>
          ))}

          {/* Drone dispatch trace */}
          {drones.map((d) =>
            d.target ? (
              <line
                key={`trace-${d.id}`}
                x1={d.pos.x}
                y1={d.pos.y}
                x2={d.target.x}
                y2={d.target.y}
                stroke="rgba(56,189,248,0.5)"
                strokeWidth="0.4"
                strokeDasharray="2 1.5"
              />
            ) : null,
          )}

          {/* Incident markers */}
          {incidents.map((inc) => {
            const meta = SEVERITY_META[inc.severity];
            const active = inc.id === selectedIncidentId;
            const color =
              inc.severity === 'critical'
                ? '#ef4444'
                : inc.severity === 'high'
                  ? '#fb7185'
                  : inc.severity === 'medium'
                    ? '#fbbf24'
                    : '#38bdf8';
            return (
              <g
                key={inc.id}
                transform={`translate(${inc.coords.x} ${inc.coords.y})`}
                className="cursor-pointer"
                onClick={() => onSelect(inc.id)}
              >
                {!inc.acknowledged && (
                  <circle r="2.2" fill={color} opacity="0.35">
                    <animate
                      attributeName="r"
                      values="1.5;4;1.5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0;0.5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  r={active ? 1.8 : 1.4}
                  fill={color}
                  stroke="#0a1426"
                  strokeWidth="0.3"
                />
                {active && (
                  <circle
                    r="3"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.3"
                  />
                )}
              </g>
            );
          })}

          {/* Drones */}
          {drones.map((d) => (
            <g key={d.id} transform={`translate(${d.pos.x} ${d.pos.y})`}>
              <circle r="2.6" fill="rgba(34,211,238,0.15)" />
              <circle r="1.4" fill="#22d3ee" stroke="#08111f" strokeWidth="0.3" />
              <path d="M-1.6 0 L1.6 0 M0 -1.6 L0 1.6" stroke="#67e8f9" strokeWidth="0.25" />
              <text y="-2.6" textAnchor="middle" fontSize="1.6" fill="#67e8f9" className="font-mono">
                {d.name}
              </text>
            </g>
          ))}
        </svg>

        {/* HTML overlay for incident labels (crisper than SVG text) */}
        {incidents.slice(0, 6).map((inc) => {
          const meta = SEVERITY_META[inc.severity];
          const active = inc.id === selectedIncidentId;
          return (
            <button
              key={`label-${inc.id}`}
              onClick={() => onSelect(inc.id)}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-[9px] font-medium transition ${
                active
                  ? `border-slate-500 bg-slate-700/90 text-white ${meta.ring} ring-1`
                  : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500'
              }`}
              style={{
                left: `${inc.coords.x}%`,
                top: `${inc.coords.y + 5}%`,
              }}
            >
              <span className="flex items-center gap-1">
                <span className={`h-1 w-1 rounded-full ${meta.dot}`} />
                {inc.code}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/70 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Plane className="h-3 w-3 text-cyan-400" /> Drone
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> High / Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> Low
          </span>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-slate-500">
          <MapPin className="h-3 w-3" /> Click a marker to inspect
        </span>
      </div>
    </div>
  );
}