# AeroGuard: Drone-Assisted Neighbourhood Security Dashboard

**Sime Darby Property University Hackathon 2026 · Track: People · Team [Team Name]**

> Demo prototype. All incidents, zones and telemetry are fictional. There is no connection to real drones, sensors, CCTV or live location tracking.

**Links:** [Demo video]([VIDEO_LINK]) · [Live demo]([NETLIFY_LINK]) · [Pitch deck]([DECK_LINK]) · [Supporting document]([DOC_LINK])

## The problem
When a break-in happens in a housing estate, a house alarm only reaches the nearest neighbours. Residents further away may never hear it, no evidence is captured while the incident unfolds, and police arrive with little information.

## Our solution
AeroGuard is an operator dashboard for a township security post. A panic alert triggers an automated workflow in which the **nearest available drone** is dispatched, **after a human operator approves**, to record the scene and send location and evidence to the police while residents are alerted.

Key principle: **the system records and reports; it does not identify or chase people.**

## Features
- **One-click demo scenario:** panic alert, resident and police broadcast, operator approval, drone dispatch, on-scene recording, sealed evidence package, police handoff, drone return.
- **Three-drone fleet** with live status and battery, and **automatic nearest-available-drone selection**.
- **Response-time comparison:** drone ETA versus a guard on foot for the same incident location.
- **Township map** with incident markers, drone stations and live drone movement.
- **Incident log** with operator review and escalation.
- **Activity timeline** that works as an audit trail.
- **Privacy panel** listing the design limits: operator in the loop, no autonomous pursuit, no facial recognition, no persistent tracking IDs.
- **Manual controls:** raise a random alert, dispatch and recall drones.

## What is built and what is simulated
| Built | Simulated |
|---|---|
| Dashboard UI and map | Drones and flight (movement is animated) |
| Dispatch logic (nearest available drone) | Alarm sensors and panic buttons |
| Incident, alert and audit-log workflow | Camera feed and evidence package |
| Response-time model | Face blurring and police notification |

## How to run
Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

Other commands:

```bash
npm run build       # production build
npm run typecheck   # TypeScript check
```

## Try the demo
1. Pick an **incident location** in the Demo Scenario panel.
2. Press **Run scenario** and watch the steps complete.
3. Check the **Drone ETA vs Guard on foot** metrics and the **Activity Timeline**.
4. Press **Reset**, choose another location, and see a different drone selected.

## Model assumptions
1 map unit = 15 m · drone speed 10 m/s · guard on foot 1.4 m/s · straight-line distances. Results are model outputs, not field measurements. Details are in the supporting document.

## Tech stack
React 18, TypeScript, Vite, Tailwind CSS, lucide-react. No backend: all data is held in memory and resets on refresh.

## Project structure
```
src/
  App.tsx                  state, dispatch logic and scenario engine
  data.ts / types.ts       zones, fleet, incident templates and types
  components/
    TownshipMap.tsx        map, drone stations and drone movement
    ScenarioPanel.tsx      one-click scenario and response-time metrics
    FleetPanel.tsx         drone fleet status
    AlertPanel.tsx         alerts
    DroneStatusCard.tsx    manual dispatch and recall
    IncidentLog.tsx        incident list and operator review
    ActivityTimeline.tsx   audit trail
    CameraPanel.tsx        simulated camera view
    PrivacyAuditPanel.tsx  privacy and safety limits
```

## Limitations and next steps
- Real deployment would need CAAM approval and legal review (drone flight rules, PDPA). See the supporting document.
- Real sensors, a backend and a live video pipeline are not implemented.
- Future work: false-alarm filtering, supervised pilot in one township, measured response times.

## Team
- [Name 1] · [role]
- [Name 2] · [role]
- [Name 3] · [role]
- [Name 4] · [role]

[University and course]