import { useState } from 'react';
import { Database, Eye, FileClock, Lock, ShieldCheck, UserCheck } from 'lucide-react';

export function PrivacyAuditPanel() {
  const [retentionDays, setRetentionDays] = useState(14);
  const [blurFaces, setBlurFaces] = useState(true);
  const [noRecord, setNoRecord] = useState(true);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1628]">
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Privacy & Audit</h2>
        </div>
        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
          Compliant
        </span>
      </div>

      <div className="space-y-3 p-4">
        {/* Authorised operator */}
        <Section icon={<UserCheck className="h-4 w-4 text-emerald-400" />} title="Authorised Operator">
          <Row label="Operator ID" value="OP-0421" />
          <Row label="Name" value="A. Rahman" />
          <Row label="Shift" value="18:00 – 06:00 MYT" />
          <Row label="Two-factor" value="Enabled" valueClass="text-emerald-300" />
        </Section>

        {/* Data retention */}
        <Section icon={<Database className="h-4 w-4 text-sky-400" />} title="Data Retention">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Footage auto-purge</span>
              <span className="font-mono text-xs font-semibold text-white">{retentionDays} days</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1d</span>
              <span>30d</span>
            </div>
          </div>
        </Section>

        {/* Privacy controls */}
        <Section icon={<Lock className="h-4 w-4 text-amber-400" />} title="Privacy Controls">
          <Toggle
            label="Auto-blur faces in footage"
            description="On-device only — no biometric matching"
            value={blurFaces}
            onChange={setBlurFaces}
          />
          <Toggle
            label="No persistent tracking IDs"
            description="Drone does not identify or follow individuals"
            value={noRecord}
            onChange={setNoRecord}
          />
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Eye className="h-3 w-3" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Hard limits</span>
            </div>
            <ul className="mt-1.5 space-y-1 text-[11px] text-slate-400">
              <li>• No facial recognition</li>
              <li>• No autonomous pursuit</li>
              <li>• No automatic suspect identification</li>
              <li>• No real drone / CCTV integration</li>
            </ul>
          </div>
        </Section>

        {/* Audit trail */}
        <Section icon={<FileClock className="h-4 w-4 text-slate-300" />} title="Audit Trail">
          <Row label="All operator actions" value="Logged" valueClass="text-emerald-300" />
          <Row label="Last export" value="Never (demo)" />
          <Row label="Audit hash chain" value="Active" valueClass="text-emerald-300" />
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</h3>
      </div>
      <div className="mt-2.5 space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value, valueClass = 'text-white' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`font-mono text-xs font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-2.5 text-left transition hover:border-slate-700"
    >
      <div>
        <p className="text-xs font-medium text-slate-200">{label}</p>
        <p className="text-[10px] text-slate-500">{description}</p>
      </div>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          value ? 'bg-emerald-500/80' : 'bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            value ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}
