import { useEffect, useRef, useState } from 'react';
import { Camera, Maximize2, Radio, Upload, Video, Webcam } from 'lucide-react';
import type { DroneStatus, Incident } from '../types';
import { DemoBadge } from './Header';

interface Props {
  droneStatus: DroneStatus;
  selected: Incident | null;
  paused?: boolean;
  speed?: number;
}

export function CameraPanel({ droneStatus, selected, paused = false, speed = 1 }: Props) {
  const [feedIndex, setFeedIndex] = useState(0);
  const [tick, setTick] = useState(0);
  // Real recording: default file is public/drone-feed.mp4, or pick any video from the laptop
  const [src, setSrc] = useState('/drone-feed.mp4');
  const [videoOk, setVideoOk] = useState(true);
  const [webcam, setWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const feeds = ['CAM-A · Nose', 'CAM-B · Wide', 'CAM-C · Thermal-IR'];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-MY', { hour12: false });
  const dateStr = now.toLocaleDateString('en-MY');

  const active = droneStatus !== 'Available';
  const hasVideo = webcam || videoOk;

  // Play the recording only while the drone is deployed (and the demo is not paused)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || webcam) return;
    v.playbackRate = speed;
    if (active && !paused) v.play()?.catch(() => {});
    else if (active) v.pause();
    else {
      v.pause();
      v.currentTime = 0;
    }
  }, [active, paused, speed, webcam, src, videoOk]);

  // Laptop camera: switched on only while deployed, switched off after
  useEffect(() => {
    const v = videoRef.current;
    if (!webcam || !active || !v) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((st) => {
        if (cancelled) return st.getTracks().forEach((t) => t.stop());
        stream = st;
        v.srcObject = st;
        v.play()?.catch(() => {});
      })
      .catch(() => setWebcam(false));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    };
  }, [webcam, active]);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (src.startsWith('blob:')) URL.revokeObjectURL(src);
    setSrc(URL.createObjectURL(f));
    setVideoOk(true);
    setWebcam(false);
    e.target.value = '';
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1628]">
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Drone Camera Feed</h2>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge />
          <span className="flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" style={{ animation: 'ag-blink 1s steps(2) infinite' }} />
            {webcam ? 'Live Webcam' : videoOk ? 'Demo Recording' : 'Simulated Feed'}
          </span>
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden bg-black">
        {/* Simulated footage backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1426] via-[#0b1628] to-[#040810]" />
        <div className="ag-grid-bg absolute inset-0 opacity-30" />

        {/* Faux terrain blobs */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute left-[10%] top-[55%] h-24 w-40 rounded-full bg-slate-700/30 blur-2xl" />
          <div className="absolute right-[15%] top-[30%] h-20 w-32 rounded-full bg-slate-700/20 blur-2xl" />
          <div className="absolute left-[45%] top-[65%] h-16 w-48 rounded-full bg-slate-800/30 blur-2xl" />
        </div>

        {/* Real recording / webcam */}
        {hasVideo && (
          <video
            key={webcam ? 'cam' : src}
            ref={videoRef}
            src={webcam ? undefined : src}
            muted
            loop
            playsInline
            onError={() => !webcam && setVideoOk(false)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Scan line */}
        <div
          className="pointer-events-none absolute left-0 right-0 h-px bg-cyan-400/40"
          style={{ animation: 'ag-scan 4s linear infinite' }}
        />

        {/* Simulated subject box */}
        {!hasVideo && active && selected && (
          <div
            className="absolute rounded border border-rose-400/70"
            style={{
              left: '38%',
              top: '42%',
              width: '18%',
              height: '26%',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.15)',
            }}
          >
            <span className="absolute -top-5 left-0 rounded-sm bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              ZONE · {selected.code}
            </span>
          </div>
        )}

        {/* HUD overlay */}
        <div className="absolute inset-0 p-3 font-mono text-[10px] text-cyan-300/80">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <Radio className="h-2.5 w-2.5" /> {feeds[feedIndex]}
              </div>
              <div>LAT 3.0512°N · LON 101.6429°E</div>
              <div>ALT {active ? '42' : '0'}m · HDG {active ? '247' : '---'}°</div>
            </div>
            <div className="space-y-0.5 text-right">
              <div>{dateStr}</div>
              <div className="text-cyan-200">{timeStr}.{String(tick % 10)}{String(tick % 10)}</div>
              <div className={active ? 'text-rose-300' : 'text-slate-500'}>
                {active ? '● REC' : '○ STANDBY'}
              </div>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="rounded bg-black/60 px-1.5 py-0.5">
              {active ? `TARGET: ${selected?.zone ?? '--'}` : 'NO ACTIVE DEPLOYMENT'}
            </span>
            <span className="rounded bg-black/60 px-1.5 py-0.5">
              1280×720 · 30fps
            </span>
          </div>
        </div>

        {/* Crosshair */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-6 w-px bg-cyan-400/40" />
          <div className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-cyan-400/40" />
        </div>

        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <Video className="h-7 w-7 text-slate-600" />
            <p className="text-xs text-slate-500">Drone in standby — no live feed</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-800/70 px-3 py-2">
        <div className="flex gap-1">
          {feeds.map((f, i) => (
            <button
              key={f}
              onClick={() => setFeedIndex(i)}
              className={`rounded-md px-2 py-1 text-[10px] font-medium transition ${
                feedIndex === i
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              CAM-{String.fromCharCode(65 + i)}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <input ref={fileRef} type="file" accept="video/*" onChange={pickFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 rounded-md border border-slate-800 px-2 py-1 text-[10px] text-slate-400 hover:bg-slate-800"
          >
            <Upload className="h-3 w-3" /> Video
          </button>
          <button
            onClick={() => setWebcam((w) => !w)}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] hover:bg-slate-800 ${
              webcam ? 'border-cyan-500/50 text-cyan-300' : 'border-slate-800 text-slate-400'
            }`}
          >
            <Webcam className="h-3 w-3" /> Webcam
          </button>
          <button
            onClick={() => videoRef.current?.requestFullscreen?.()}
            className="flex items-center gap-1 rounded-md border border-slate-800 px-2 py-1 text-[10px] text-slate-400 hover:bg-slate-800"
          >
            <Maximize2 className="h-3 w-3" /> Full
          </button>
        </div>
      </div>
      <p className="border-t border-slate-800/50 px-3 py-2 text-center text-[10px] text-slate-500">
        {hasVideo
          ? 'Demo only — pre-recorded or webcam footage, not a real drone or CCTV link'
          : 'Simulated placeholder — put drone-feed.mp4 in the public folder, or press Video'}
      </p>
    </div>
  );
}