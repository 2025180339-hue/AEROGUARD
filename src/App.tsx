import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ActivityEvent, AlertItem, Drone, Incident, ReviewStatus } from './types';
import {
  FLEET,
  INITIAL_ACTIVITY,
  INITIAL_INCIDENTS,
  INCIDENT_TEMPLATES,
  LOW_BATTERY,
  MIN_BATTERY,
  SEVERITY_META,
  ZONES,
  nextId,
  zoneCoords,
} from './data';
import { DemoBanner, Header } from './components/Header';
import { TownshipMap } from './components/TownshipMap';
import { AlertPanel } from './components/AlertPanel';
import { DroneStatusCard } from './components/DroneStatusCard';
import { IncidentLog } from './components/IncidentLog';
import { CameraPanel } from './components/CameraPanel';
import { PrivacyAuditPanel } from './components/PrivacyAuditPanel';
import { ActivityTimeline } from './components/ActivityTimeline';
import { ScenarioPanel, type ScenarioStage } from './components/ScenarioPanel';
import { FleetPanel } from './components/FleetPanel';
import { DemoControls } from './components/DemoControls';

const M_PER_UNIT = 15;
type Pt = { x: number; y: number };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const demoHash = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const initialAlerts = (): AlertItem[] =>
  INITIAL_INCIDENTS.filter((i) => !i.acknowledged).map((i) => ({
    id: `alert-${i.id}`,
    incidentId: i.id,
    title: i.title,
    zone: i.zone,
    severity: i.severity,
    timestamp: i.timestamp,
    acknowledged: i.acknowledged,
  }));

const TICK_MS = 100;
const UNITS_PER_MS = 0.0075; // drone flight speed
const DRAIN_EVERY_MS = 1000; // -1% while deployed
const CHARGE_EVERY_MS = 2000; // +1% while parked at base
const AUTO_FIRST_MS = 15000; // first automatic incident
const AUTO_MIN_MS = 20000; // then one every 20-30 s (simulation time)
const AUTO_SPREAD_MS = 10000;
const MAX_PENDING = 6; // stop adding while this many alerts are unacknowledged

function App() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [activity, setActivity] = useState<ActivityEvent[]>(INITIAL_ACTIVITY);
  const [drones, setDrones] = useState<Drone[]>(FLEET);
  const [signal] = useState(96);
  const [lastDeploy, setLastDeploy] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_INCIDENTS[0]?.id ?? null);
  const [now, setNow] = useState(Date.now());
  const [zone, setZone] = useState('Taman Sri Mawar');
  const [scenario, setScenario] = useState<{
    stage: ScenarioStage;
    incidentId: string | null;
    distanceM: number | null;
    droneId: string | null;
  }>({ stage: 'idle', incidentId: null, distanceM: null, droneId: null });
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [decision, setDecision] = useState<string | null>(null);
  const [autoOn, setAutoOn] = useState(true);

  // Simulation clock: pausing and speed change affect movement, battery AND scheduled steps
  const sim = useRef<{ t: number; tasks: Array<{ at: number; fn: () => void }> }>({ t: 0, tasks: [] });
  const pausedRef = useRef(false);
  const speedRef = useRef<1 | 2>(1);
  const dronesRef = useRef<Drone[]>(FLEET);
  const lowFlag = useRef<Set<string>>(new Set());
  const autoRef = useRef(true);
  const autoAtRef = useRef(AUTO_FIRST_MS);
  const spawnRef = useRef<() => void>(() => {});
  const stageRef = useRef<ScenarioStage>('idle');
  const pendingRef = useRef(0);
  autoRef.current = autoOn;
  pausedRef.current = paused;
  speedRef.current = speed;
  dronesRef.current = drones;
  stageRef.current = scenario.stage;
  pendingRef.current = alerts.filter((a) => !a.acknowledged).length;

  const later = useCallback((fn: () => void, ms: number) => {
    sim.current.tasks.push({ at: sim.current.t + ms, fn });
  }, []);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const pushActivity = useCallback((ev: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    setActivity((prev) => [{ ...ev, id: nextId('ev'), timestamp: Date.now() }, ...prev].slice(0, 200));
  }, []);

  const patch = useCallback((id: string, p: Partial<Drone>) => {
    setDrones((prev) => prev.map((d) => (d.id === id ? { ...d, ...p } : d)));
  }, []);

  // One tick drives everything: flight, battery and scheduled scenario steps
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const dt = TICK_MS * speedRef.current;
      const prev = sim.current.t;
      const t = prev + dt;
      sim.current.t = t;
      const drain = Math.floor(t / DRAIN_EVERY_MS) - Math.floor(prev / DRAIN_EVERY_MS);
      const charge = Math.floor(t / CHARGE_EVERY_MS) - Math.floor(prev / CHARGE_EVERY_MS);

      setDrones((list) =>
        list.map((d) => {
          let nd = d;
          const goal = d.target ?? d.base;
          const dx = goal.x - d.pos.x;
          const dy = goal.y - d.pos.y;
          const dd = Math.hypot(dx, dy);
          if (dd > 0) {
            if (dd < 0.4) nd = { ...nd, pos: goal };
            else {
              const step = Math.min(dd, UNITS_PER_MS * dt);
              nd = { ...nd, pos: { x: d.pos.x + (dx / dd) * step, y: d.pos.y + (dy / dd) * step } };
            }
          }
          if (d.status !== 'Available' && drain > 0) nd = { ...nd, battery: Math.max(0, d.battery - drain) };
          if (d.status === 'Available' && charge > 0 && d.battery < 100)
            nd = { ...nd, battery: Math.min(100, d.battery + charge) };
          return nd;
        }),
      );

      const due = sim.current.tasks.filter((x) => x.at <= t);
      if (due.length) {
        sim.current.tasks = sim.current.tasks.filter((x) => x.at > t);
        due.sort((x, y) => x.at - y.at).forEach((x) => x.fn());
      }

      // New incidents appear by themselves (not in the middle of the main scenario)
      if (autoRef.current && t >= autoAtRef.current) {
        autoAtRef.current = t + AUTO_MIN_MS + Math.random() * AUTO_SPREAD_MS;
        const calm = stageRef.current === 'idle' || stageRef.current === 'done';
        if (calm && pendingRef.current < MAX_PENDING) spawnRef.current();
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const selectedIncident = useMemo(
    () => incidents.find((i) => i.id === selectedId) ?? null,
    [incidents, selectedId],
  );

  const focus = drones.find((d) => d.status !== 'Available') ?? drones[0];

  // Pick the nearest drone that is free AND has enough battery, and explain why
  const chooseDrone = useCallback(
    (c: Pt) => {
      const ready = drones
        .filter((d) => d.status === 'Available' && d.battery >= MIN_BATTERY)
        .sort((a, b) => dist(a.pos, c) - dist(b.pos, c));
      const best = ready[0] ?? null;
      const skipped = drones
        .filter((d) => d !== best && (d.status !== 'Available' || d.battery < MIN_BATTERY))
        .map((d) =>
          d.status !== 'Available'
            ? `${d.name} ${d.status === 'Returning' ? 'returning' : 'on mission'}`
            : `${d.name} battery ${d.battery}%`,
        );
      if (!best) {
        return { drone: null, distanceM: 0, detail: `No unit ready · ${skipped.join(', ')}` };
      }
      const distanceM = Math.round(dist(best.pos, c) * M_PER_UNIT);
      const farther = ready
        .slice(1)
        .map((d) => `${d.name} ${Math.round(dist(d.pos, c) * M_PER_UNIT)} m`);
      const detail =
        `${best.name} nearest ready unit · ${distanceM} m · battery ${best.battery}%` +
        (farther.length ? ` · not chosen (farther): ${farther.join(', ')}` : '') +
        (skipped.length ? ` · skipped: ${skipped.join(', ')}` : '');
      return { drone: best, distanceM, detail };
    },
    [drones],
  );

  const returnDrone = useCallback(
    (d: Drone) => {
      const cur = dronesRef.current.find((x) => x.id === d.id);
      if (!cur || cur.status !== 'Dispatched') return;
      patch(d.id, { status: 'Returning', target: null });
    },
    [patch],
  );

  // A returning drone becomes available only once it has really reached its base
  useEffect(() => {
    drones.forEach((d) => {
      if (d.status === 'Returning' && dist(d.pos, d.base) < 0.5) {
        patch(d.id, { status: 'Available', pos: d.base });
        pushActivity({ label: `Drone ${d.name} available`, detail: `Back at base · charging · battery ${d.battery}%`, kind: 'drone' });
      }
    });
  }, [drones, patch, pushActivity]);

  // Deployed drone with a nearly empty battery goes home by itself
  useEffect(() => {
    drones.forEach((d) => {
      if (d.status === 'Available') lowFlag.current.delete(d.id);
      else if (d.status === 'Dispatched' && d.battery <= LOW_BATTERY && !lowFlag.current.has(d.id)) {
        lowFlag.current.add(d.id);
        pushActivity({ label: `Drone ${d.name} low battery`, detail: `Battery ${d.battery}% · automatic return to base`, kind: 'drone' });
        returnDrone(d);
      }
    });
  }, [drones, returnDrone, pushActivity]);

  const spawnIncident = useCallback(
    (auto: boolean) => {
      const tpl = INCIDENT_TEMPLATES[Math.floor(Math.random() * INCIDENT_TEMPLATES.length)];
      const inc: Incident = {
        id: nextId('inc'),
        code: `${tpl.code}-${Math.floor(Math.random() * 90 + 10)}`,
        title: tpl.title,
        zone: tpl.zone,
        severity: tpl.severity,
        reviewStatus: 'pending',
        timestamp: Date.now(),
        acknowledged: false,
        coords: zoneCoords(tpl.zone),
        summary: tpl.summary,
      };
      setIncidents((prev) => [inc, ...prev].slice(0, 30));
      setAlerts((prev) =>
        [
          { id: `alert-${inc.id}`, incidentId: inc.id, title: inc.title, zone: inc.zone, severity: inc.severity, timestamp: inc.timestamp, acknowledged: false },
          ...prev,
        ].slice(0, 30),
      );
      if (!auto) setSelectedId(inc.id); // auto incidents never steal the operator's selection
      pushActivity({
        label: `Alert ${inc.code} raised`,
        detail: `${SEVERITY_META[inc.severity].label} severity · ${inc.zone}${auto ? ' · simulated detection' : ''}`,
        kind: 'alert',
      });
    },
    [pushActivity],
  );
  spawnRef.current = () => spawnIncident(true);
  const handleTriggerAlert = useCallback(() => spawnIncident(false), [spawnIncident]);

  const handleAcknowledge = useCallback(
    (alertId: string) => {
      const a = alerts.find((x) => x.id === alertId);
      setAlerts((prev) => prev.map((x) => (x.id === alertId ? { ...x, acknowledged: true } : x)));
      if (a) setIncidents((incs) => incs.map((i) => (i.id === a.incidentId ? { ...i, acknowledged: true } : i)));
    },
    [alerts],
  );

  const handleDispatch = useCallback(() => {
    const target = selectedIncident ?? incidents.find((i) => !i.acknowledged) ?? incidents[0];
    if (!target) return;
    const pick = chooseDrone(target.coords);
    if (!pick.drone) {
      setDecision(pick.detail);
      pushActivity({ label: 'No drone available', detail: pick.detail, kind: 'drone' });
      return;
    }
    const d = pick.drone;
    patch(d.id, { status: 'Dispatched', target: target.coords });
    setLastDeploy(Date.now());
    setDecision(`${target.code}: ${pick.detail}`);
    pushActivity({ label: `Drone ${d.name} dispatched`, detail: `${target.code} · ${target.zone} · ${pick.detail}`, kind: 'drone' });
  }, [selectedIncident, incidents, chooseDrone, patch, pushActivity]);

  const handleReturn = useCallback(() => {
    drones
      .filter((d) => d.status === 'Dispatched')
      .forEach((d) => {
        returnDrone(d);
        pushActivity({ label: `Drone ${d.name} returning`, detail: 'Recall to base initiated by operator', kind: 'drone' });
      });
  }, [drones, returnDrone, pushActivity]);

  const resetDemo = useCallback(() => {
    sim.current = { t: 0, tasks: [] };
    lowFlag.current.clear();
    autoAtRef.current = AUTO_FIRST_MS;
    setPaused(false);
    setSpeed(1);
    setAutoOn(true);
    setScenario({ stage: 'idle', incidentId: null, distanceM: null, droneId: null });
    setDrones(FLEET);
    setLastDeploy(null);
    setIncidents(INITIAL_INCIDENTS);
    setAlerts(initialAlerts());
    setActivity(INITIAL_ACTIVITY);
    setSelectedId(INITIAL_INCIDENTS[0]?.id ?? null);
    setDecision(null);
  }, []);

  const runScenario = useCallback(() => {
    if (scenario.stage !== 'idle') return;
    const coords = zoneCoords(zone);
    const pick = chooseDrone(coords);
    if (!pick.drone) {
      setDecision(pick.detail);
      pushActivity({ label: 'No drone available', detail: pick.detail, kind: 'drone' });
      return;
    }
    const drone = pick.drone;
    const distanceM = pick.distanceM;
    const inc: Incident = {
      id: nextId('inc'),
      code: 'AG-ROB-01',
      title: 'Robbery in progress — panic button pressed',
      zone,
      severity: 'critical',
      reviewStatus: 'pending',
      timestamp: Date.now(),
      acknowledged: false,
      coords,
      summary: 'Panic button triggered. Operator approval required before dispatch.',
    };
    setIncidents((prev) => [inc, ...prev]);
    setAlerts((prev) => [
      { id: `alert-${inc.id}`, incidentId: inc.id, title: inc.title, zone: inc.zone, severity: inc.severity, timestamp: inc.timestamp, acknowledged: false },
      ...prev,
    ]);
    setSelectedId(inc.id);
    setScenario({ stage: 'alert', incidentId: inc.id, distanceM, droneId: drone.id });
    setDecision(`${inc.code}: ${pick.detail}`);
    pushActivity({ label: 'Panic button pressed', detail: zone, kind: 'alert' });
    later(() => pushActivity({ label: 'Alert broadcast', detail: 'Residents app, guard post and police notified with location', kind: 'alert' }), 1500);
    later(() => {
      patch(drone.id, { status: 'Dispatched', target: coords });
      setLastDeploy(Date.now());
      setScenario((s) => ({ ...s, stage: 'dispatched' }));
      pushActivity({ label: 'Dispatch approved', detail: 'Operator OP-0421 confirmed (human-in-the-loop)', kind: 'privacy' });
      pushActivity({ label: `Drone ${drone.name} dispatched`, detail: `${zone} · ${pick.detail}`, kind: 'drone' });
    }, 3500);
  }, [scenario.stage, zone, chooseDrone, patch, pushActivity, later]);

  const handlePause = useCallback(() => {
    const next = !pausedRef.current;
    setPaused(next);
    pushActivity({ label: next ? 'Demo paused' : 'Demo resumed', detail: 'Operator control', kind: 'info' });
  }, [pushActivity]);

  const handleSpeed = useCallback(() => {
    const next = speedRef.current === 1 ? 2 : 1;
    setSpeed(next);
    pushActivity({ label: `Simulation speed ×${next}`, detail: 'Operator control', kind: 'info' });
  }, [pushActivity]);

  const handleAuto = useCallback(() => {
    const next = !autoRef.current;
    setAutoOn(next);
    pushActivity({
      label: next ? 'Auto incidents on' : 'Auto incidents off',
      detail: next ? 'New simulated incidents every 20-30 s' : 'Only manual alerts from now on',
      kind: 'info',
    });
  }, [pushActivity]);

  const handleStart = useCallback(() => {
    setPaused(false);
    runScenario();
  }, [runScenario]);

  useEffect(() => {
    if (scenario.stage !== 'dispatched') return;
    const d = drones.find((x) => x.id === scenario.droneId);
    if (d && d.status !== 'Dispatched') {
      setScenario((s) => ({ ...s, stage: 'done' }));
      pushActivity({ label: 'Scenario ended early', detail: `Drone ${d.name} recalled before reaching the scene`, kind: 'info' });
      return;
    }
    if (!d || !d.target || dist(d.pos, d.target) > 1) return;
    const incId = scenario.incidentId;
    setScenario((s) => ({ ...s, stage: 'onscene' }));
    pushActivity({ label: `Drone ${d.name} on scene`, detail: 'Recording started · faces auto-blurred · no identification', kind: 'drone' });
    later(() => pushActivity({ label: 'Evidence package sealed', detail: `Demo hash ${demoHash()} · timestamped`, kind: 'privacy' }), 3000);
    later(() => pushActivity({ label: 'Police notified', detail: 'Live location + evidence link shared', kind: 'alert' }), 5000);
    later(() => {
      setScenario((s) => ({ ...s, stage: 'done' }));
      setIncidents((prev) => prev.map((i) => (i.id === incId ? { ...i, acknowledged: true, reviewStatus: 'escalated' } : i)));
      setAlerts((prev) => prev.map((a) => (a.incidentId === incId ? { ...a, acknowledged: true } : a)));
      pushActivity({ label: 'Incident escalated to police', detail: `Drone ${d.name} returning to base`, kind: 'drone' });
      returnDrone(d);
    }, 8000);
  }, [drones, scenario.stage, scenario.droneId, scenario.incidentId, pushActivity, later, returnDrone]);

  const handleReview = useCallback(
    (incId: string, status: ReviewStatus) => {
      setIncidents((prev) => prev.map((i) => (i.id === incId ? { ...i, reviewStatus: status } : i)));
      const inc = incidents.find((i) => i.id === incId);
      pushActivity({
        label: `Incident ${inc?.code ?? incId} ${status}`,
        detail: status === 'reviewed' ? 'Operator reviewed and closed the incident.' : 'Operator escalated the incident for further action.',
        kind: 'privacy',
      });
    },
    [incidents, pushActivity],
  );

  const scenarioDrone = drones.find((d) => d.id === scenario.droneId);

  return (
    <div className="min-h-screen bg-[#060d1a] text-slate-200">
      <Header now={now} />
      <DemoBanner />

      <main className="mx-auto max-w-[1600px] px-3 py-4 sm:px-6 sm:py-6">
        <DemoControls
          paused={paused}
          speed={speed}
          canStart={scenario.stage === 'idle'}
          onStart={handleStart}
          onPause={handlePause}
          onReset={resetDemo}
          onSpeed={handleSpeed}
          autoOn={autoOn}
          onAuto={handleAuto}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7 xl:col-span-8">
            <TownshipMap incidents={incidents} drones={drones} selectedIncidentId={selectedId} onSelect={setSelectedId} />
            <CameraPanel droneStatus={focus.status} selected={selectedIncident} paused={paused} speed={speed} />
          </div>

          <div className="space-y-4 lg:col-span-5 xl:col-span-4">
            <ScenarioPanel
              stage={scenario.stage}
              distanceM={scenario.distanceM}
              droneEta={scenario.distanceM === null ? null : Math.round(scenario.distanceM / 10)}
              guardEta={scenario.distanceM === null ? null : Math.round(scenario.distanceM / 1.4)}
              onRun={runScenario}
              onReset={resetDemo}
              zone={zone}
              zones={ZONES.map((z) => z.name)}
              onZone={setZone}
              droneName={scenarioDrone?.name ?? null}
            />
            <FleetPanel drones={drones} decision={decision} />
            <AlertPanel alerts={alerts} onTrigger={handleTriggerAlert} onAcknowledge={handleAcknowledge} />
            <DroneStatusCard
              name={focus.name}
              status={focus.status}
              battery={focus.battery}
              signal={signal}
              lastDeploy={lastDeploy}
              onDispatch={handleDispatch}
              onReturn={handleReturn}
              canDispatch={!!selectedIncident && drones.some((d) => d.status === 'Available' && d.battery >= MIN_BATTERY)}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="h-[420px]">
              <IncidentLog incidents={incidents} selectedId={selectedId} onSelect={setSelectedId} onReview={handleReview} />
            </div>
          </div>
          <div className="lg:col-span-4 xl:col-span-4">
            <div className="h-[420px]">
              <ActivityTimeline events={activity} />
            </div>
          </div>
          <div className="lg:col-span-3 xl:col-span-4">
            <PrivacyAuditPanel />
          </div>
        </div>

        <footer className="mt-6 border-t border-slate-800/60 pt-4 text-center">
          <p className="text-[11px] text-slate-500">
            AEROGUARD · University hackathon demo · All incidents, zones, and telemetry are fictional. No connection to real
            drones, sensors, CCTV, or live location tracking.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;