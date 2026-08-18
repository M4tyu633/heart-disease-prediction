"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { Activity } from "lucide-react";

export interface EcgMonitorProps {
  heartRate: number;      // thalch: 70-205 bpm
  stDepression: number;   // oldpeak: 0-6.0 mm
  riskPercentage: number; // 0-100
  riskColor: string;      // hex color from prediction
}

/**
 * High-Fidelity Clinical Lead II ECG Telemetry Monitor
 * Models true electrophysiology:
 * - P-wave atrial depolarization
 * - PR isoelectric segment
 * - Sharp QRS complex (<100ms ventricular depolarization)
 * - Ischemic ST segment depression (oldpeak calibrated)
 * - Asymmetric T-wave ventricular repolarization
 * - Micro-fluctuations mimicking physiological baseline & diagnostic bandwidth
 */
export default function EcgMonitor({
  heartRate = 75,
  stDepression = 0.0,
  riskPercentage = 25,
  riskColor = "#f43f5e",
}: EcgMonitorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sweepCursorRef = useRef<SVGGElement>(null);
  const brightClipRectRef = useRef<SVGRectElement>(null);
  const dimClipRectRef = useRef<SVGRectElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const sweepXRef = useRef<number>(0);

  // Clamped clinical parameters
  const clampedHr = Math.min(Math.max(heartRate, 50), 220);
  const clampedSt = Math.min(Math.max(stDepression, 0), 6.0);

  // Virtual canvas geometry
  const WIDTH = 800;
  const HEIGHT = 160;
  const BASE_Y = 88;
  const ERASE_GAP = 32;

  /**
   * Anatomically accurate PQRST voltage curve generator
   * Normalized cardiac cycle t in [0, 1)
   */
  const getPqrstY = (t: number, stDep: number, xPos: number): number => {
    // Subtle physiological baseline respiration wander + micro-analog noise
    const wander = 0.7 * Math.sin((xPos / WIDTH) * 2 * Math.PI) + 0.3 * Math.sin(xPos * 0.18);

    // 1. Isoelectric Baseline (TP interval start)
    if (t < 0.08) {
      return BASE_Y + wander;
    }

    // 2. P Wave: Atrial depolarization (gentle smooth deflection, ~0.10s)
    if (t < 0.20) {
      const pProgress = (t - 0.08) / 0.12;
      const pDeflection = 7.5 * Math.pow(Math.sin(pProgress * Math.PI), 1.3);
      return BASE_Y - pDeflection + wander;
    }

    // 3. PR Segment: AV node conduction delay (flat isoelectric)
    if (t < 0.30) {
      return BASE_Y + wander;
    }

    // 4. Q Wave: Septal depolarization (crisp negative notch)
    if (t < 0.34) {
      const qProgress = (t - 0.30) / 0.04;
      const qDeflection = 5.5 * Math.sin(qProgress * Math.PI);
      return BASE_Y + qDeflection + wander;
    }

    // 5. R Wave: Rapid ventricular depolarization (razor-sharp spike, ~30ms up / 30ms down)
    if (t < 0.40) {
      const rProgress = (t - 0.34) / 0.06;
      let rDeflection: number;
      if (rProgress <= 0.5) {
        // Fast steep upstroke
        const up = rProgress / 0.5;
        rDeflection = 68.0 * Math.pow(up, 1.6);
      } else {
        // Fast steep downstroke
        const down = (1 - rProgress) / 0.5;
        rDeflection = 68.0 * Math.pow(down, 1.4);
      }
      return BASE_Y - rDeflection + wander;
    }

    // 6. S Wave: Late ventricular depolarization (sharp descent below baseline)
    if (t < 0.45) {
      const sProgress = (t - 0.40) / 0.05;
      const sDeflection = 18.0 * Math.sin(sProgress * Math.PI);
      return BASE_Y + sDeflection + wander;
    }

    // 7. ST Segment: Plateau phase & J-Point
    // When stDep > 0, the J-point & ST segment is depressed below baseline
    const stOffset = Math.min(stDep, 6.0) * 4.2; // 0 to 25px depression
    if (t < 0.62) {
      const stProgress = (t - 0.45) / 0.17;
      // Smooth transition from S return into depressed ST segment plateau
      const blend = Math.sin(stProgress * (Math.PI / 2));
      return BASE_Y + stOffset * blend + wander;
    }

    // 8. T Wave: Asymmetric ventricular repolarization
    if (t < 0.82) {
      const tProgress = (t - 0.62) / 0.20;
      // Asymmetric skewed curve (slower ascent, steeper descent)
      const tWave = 14.5 * Math.sin(Math.pow(tProgress, 0.85) * Math.PI);
      const stRecovery = stOffset * (1 - tProgress);
      return BASE_Y + stRecovery - tWave + wander;
    }

    // 9. TP Segment: Diastolic isoelectric pause
    return BASE_Y + wander;
  };

  // Generate the full SVG path data across the width based on HR and ST depression
  const { pathData, beatWidth } = useMemo(() => {
    // Realistic beat spacing scaling with BPM
    const beatsPerScreen = Math.max(2.4, (clampedHr / 60) * 2.8);
    const bWidth = WIDTH / beatsPerScreen;

    const points: string[] = [];
    const step = 1.5; // High resolution 1.5px sampling for razor-sharp fidelity

    for (let x = 0; x <= WIDTH; x += step) {
      const t = (x % bWidth) / bWidth;
      const y = getPqrstY(t, clampedSt, x);
      if (x === 0) {
        points.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
      } else {
        points.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
    }

    return { pathData: points.join(" "), beatWidth: bWidth };
  }, [clampedHr, clampedSt]);

  // RequestAnimationFrame 60fps sweep animation loop
  useEffect(() => {
    const sweepDurationSec = Math.max(1.2, 3.2 * (75 / clampedHr));
    const sweepSpeedPxPerSec = WIDTH / sweepDurationSec;

    lastTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Advance sweep scanline
      sweepXRef.current = (sweepXRef.current + sweepSpeedPxPerSec * dt) % WIDTH;
      const currentSweepX = sweepXRef.current;

      const t = (currentSweepX % beatWidth) / beatWidth;
      const currentSweepY = getPqrstY(t, clampedSt, currentSweepX);

      if (sweepCursorRef.current) {
        sweepCursorRef.current.setAttribute(
          "transform",
          `translate(${currentSweepX.toFixed(1)}, ${currentSweepY.toFixed(1)})`
        );
      }

      if (brightClipRectRef.current) {
        brightClipRectRef.current.setAttribute("x", "0");
        brightClipRectRef.current.setAttribute("width", Math.max(0, currentSweepX).toFixed(1));
      }

      if (dimClipRectRef.current) {
        const startDim = currentSweepX + ERASE_GAP;
        if (startDim < WIDTH) {
          dimClipRectRef.current.setAttribute("x", startDim.toFixed(1));
          dimClipRectRef.current.setAttribute("width", (WIDTH - startDim).toFixed(1));
        } else {
          dimClipRectRef.current.setAttribute("x", "0");
          dimClipRectRef.current.setAttribute("width", "0");
        }
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [clampedHr, clampedSt, beatWidth]);

  const pulseIntervalSec = (60 / clampedHr).toFixed(2);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[155px] bg-[#06080d] rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl flex flex-col justify-between select-none"
      style={{
        boxShadow: `inset 0 0 35px rgba(0, 0, 0, 0.95), 0 8px 24px rgba(0, 0, 0, 0.5)`,
      }}
    >
      {/* Top Status Overlay */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-2.5 pointer-events-none">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#0e121a] border border-slate-700/80 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5" style={{ color: riskColor }} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-wider text-slate-200">
                ECG MONITOR
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-cyan-400 font-semibold border border-cyan-500/20">
                LEAD II
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              25mm/s · 10mm/mV · {clampedSt > 0.5 ? `ST Dep: ${clampedSt.toFixed(1)}mm` : "ST: Isoelectric"}
            </span>
          </div>
        </div>

        {/* BPM readout with synchronized heartbeat pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e121a]/95 border border-slate-800 shadow-md">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: riskColor,
                boxShadow: `0 0 8px ${riskColor}`,
                animation: `ecg-heartbeat ${pulseIntervalSec}s ease-in-out infinite`,
              }}
            />
            <span
              className="text-xl font-black font-mono tracking-tight leading-none"
              style={{ color: riskColor }}
            >
              {clampedHr}
            </span>
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider ml-0.5">
              BPM
            </span>
          </div>
        </div>
      </div>

      {/* SVG Waveform Canvas */}
      <div className="absolute inset-0 w-full h-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            {/* Minor Grid: 16px (0.04s) */}
            <pattern
              id="ecg-minor-grid"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 16 0 L 0 0 0 16"
                fill="none"
                stroke="#0e141f"
                strokeWidth="0.6"
                strokeOpacity="0.8"
              />
            </pattern>

            {/* Major Grid: 80px (0.20s) */}
            <pattern
              id="ecg-major-grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <rect width="80" height="80" fill="url(#ecg-minor-grid)" />
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="#162030"
                strokeWidth="1.0"
                strokeOpacity="0.9"
              />
            </pattern>

            {/* Tight, refined glow filter */}
            <filter id="ecg-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.0" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clip paths for sweep effect */}
            <clipPath id="ecg-bright-clip">
              <rect
                ref={brightClipRectRef}
                x="0"
                y="0"
                width="0"
                height={HEIGHT}
              />
            </clipPath>

            <clipPath id="ecg-dim-clip">
              <rect
                ref={dimClipRectRef}
                x="0"
                y="0"
                width={WIDTH}
                height={HEIGHT}
              />
            </clipPath>

            {/* Sweep laser line gradient */}
            <linearGradient id="ecg-sweep-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={riskColor} stopOpacity="0.0" />
              <stop offset="30%" stopColor={riskColor} stopOpacity="0.25" />
              <stop offset="50%" stopColor={riskColor} stopOpacity="0.6" />
              <stop offset="70%" stopColor={riskColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={riskColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect width={WIDTH} height={HEIGHT} fill="url(#ecg-major-grid)" />

          {/* Isoelectric Baseline Reference Line */}
          <line
            x1="0"
            y1={BASE_Y}
            x2={WIDTH}
            y2={BASE_Y}
            stroke="#162030"
            strokeWidth="0.8"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />

          {/* 1. Lingering Phosphor Decay Trace */}
          <g clipPath="url(#ecg-dim-clip)" opacity="0.18">
            <path
              d={pathData}
              fill="none"
              stroke={riskColor}
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* 2. Active Trace (Sharp, Crisp, Authentic Hospital Telemetry) */}
          <g clipPath="url(#ecg-bright-clip)">
            {/* Subtle Bloom Pass */}
            <path
              d={pathData}
              fill="none"
              stroke={riskColor}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#ecg-glow)"
              opacity="0.45"
            />
            {/* Crisp High-Definition Core Stroke */}
            <path
              d={pathData}
              fill="none"
              stroke={riskColor}
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={pathData}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
          </g>

          {/* 3. Sweep Cursor with Laser and Head Dot */}
          <g ref={sweepCursorRef} transform="translate(0, 88)">
            <line
              x1="0"
              y1={-BASE_Y}
              x2="0"
              y2={HEIGHT - BASE_Y}
              stroke="url(#ecg-sweep-beam)"
              strokeWidth="2.0"
            />
            <circle
              r="5"
              fill={riskColor}
              opacity="0.3"
              filter="url(#ecg-glow)"
            />
            <circle
              r="3.2"
              fill={riskColor}
              opacity="0.9"
            />
            <circle
              r="1.4"
              fill="#ffffff"
            />
          </g>
        </svg>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pb-2.5 text-[10px] font-mono text-slate-400 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE TELEMETRY
          </span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="hidden sm:inline text-slate-400">
            SPEED: {((clampedHr / 75) * 25).toFixed(1)} mm/s
          </span>
        </div>

        <div className="flex items-center gap-2">
          {clampedSt > 0.5 ? (
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40 animate-pulse">
              ST DEPRESSION ({clampedSt.toFixed(1)} mm)
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ST ISOELECTRIC
            </span>
          )}
          <span className="text-slate-400 font-bold">
            RISK: <span style={{ color: riskColor }}>{riskPercentage}%</span>
          </span>
        </div>
      </div>

      {/* Synchronized Pulse Keyframe */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ecg-heartbeat {
          0% { transform: scale(0.9); opacity: 0.6; }
          15% { transform: scale(1.35); opacity: 1; }
          30% { transform: scale(0.95); opacity: 0.7; }
          45% { transform: scale(1.15); opacity: 0.9; }
          60% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
      `}} />
    </div>
  );
}
