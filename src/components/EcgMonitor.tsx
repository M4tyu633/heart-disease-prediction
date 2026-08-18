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
 * Animated SVG ECG Waveform Monitor
 * Simulates a continuous medical telemetry monitor with real-time sweep scanline,
 * PQRST cardiac electrophysiology morphology, and reactive ST segment depression.
 */
export default function EcgMonitor({
  heartRate = 75,
  stDepression = 0.0,
  riskPercentage = 25,
  riskColor = "#10b981",
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

  // Screen virtual coordinate space
  const WIDTH = 800;
  const HEIGHT = 200;
  const BASE_Y = 108;
  const ERASE_GAP = 36; // Erase gap ahead of sweep line (classic CRT/LCD monitor behavior)

  /**
   * PQRST waveform function for a single cardiac cycle
   * Normalized t in [0, 1)
   */
  const getPqrstY = (t: number, stDep: number): number => {
    // Isoelectric baseline 1 (TP/PR start)
    if (t < 0.12) {
      return BASE_Y;
    }
    // P wave: atrial depolarization (smooth upward hump)
    if (t < 0.22) {
      const pProgress = (t - 0.12) / 0.10;
      return BASE_Y - 9 * Math.sin(pProgress * Math.PI);
    }
    // PR segment (isoelectric delay at AV node)
    if (t < 0.32) {
      return BASE_Y;
    }
    // Q wave: initial septal depolarization (small downward deflection)
    if (t < 0.36) {
      const qProgress = (t - 0.32) / 0.04;
      return BASE_Y + 7 * Math.sin(qProgress * Math.PI);
    }
    // R wave: ventricular depolarization (tall sharp positive spike)
    if (t < 0.42) {
      const rProgress = (t - 0.36) / 0.06;
      return BASE_Y - 72 * Math.sin(rProgress * Math.PI);
    }
    // S wave: late ventricular depolarization (deep downward deflection)
    if (t < 0.48) {
      const sProgress = (t - 0.42) / 0.06;
      return BASE_Y + 22 * Math.sin(sProgress * Math.PI);
    }
    // ST segment: ventricular plateau phase
    // When stDepression > 0, the ST segment is depressed below the isoelectric baseline
    const stOffset = Math.min(stDep, 6.0) * 4.8; // 0 to ~28px depression
    if (t < 0.62) {
      const stProgress = (t - 0.48) / 0.14;
      // Smooth curve transitioning from S wave end (+22) into depressed ST segment (+stOffset)
      const blend = Math.sin(stProgress * (Math.PI / 2));
      return BASE_Y + (22 * (1 - blend) + stOffset * blend);
    }
    // T wave: ventricular repolarization (rounded wave)
    if (t < 0.78) {
      const tProgress = (t - 0.62) / 0.16;
      const tWaveHump = -18 * Math.sin(tProgress * Math.PI);
      const stRecovery = stOffset * (1 - tProgress);
      return BASE_Y + stRecovery + tWaveHump;
    }
    // TP segment: isoelectric recovery back to baseline
    return BASE_Y;
  };

  // Generate the full SVG path data across the width based on HR and ST depression
  const { pathData, beatWidth } = useMemo(() => {
    // Determine spatial beat width based on heart rate:
    // Faster HR = more beats per screen width (shorter beat width)
    const beatsPerScreen = Math.max(2.5, (clampedHr / 60) * 3.2);
    const bWidth = WIDTH / beatsPerScreen;

    const points: string[] = [];
    const step = 2; // 2px sampling resolution for smooth rendering

    for (let x = 0; x <= WIDTH; x += step) {
      const t = (x % bWidth) / bWidth;
      const y = getPqrstY(t, clampedSt);
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
    // Sweep speed: sweep duration scales inversely with heart rate
    // 70 bpm -> ~3.5s per sweep, 205 bpm -> ~1.2s per sweep
    const sweepDurationSec = Math.max(1.0, 3.8 * (70 / clampedHr));
    const sweepSpeedPxPerSec = WIDTH / sweepDurationSec;

    lastTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Advance sweep line
      sweepXRef.current = (sweepXRef.current + sweepSpeedPxPerSec * dt) % WIDTH;
      const currentSweepX = sweepXRef.current;

      // Calculate current waveform Y at sweep position for the glowing dot cursor
      const t = (currentSweepX % beatWidth) / beatWidth;
      const currentSweepY = getPqrstY(t, clampedSt);

      // Directly update SVG DOM elements via refs for 60fps performance without React re-render lag
      if (sweepCursorRef.current) {
        sweepCursorRef.current.setAttribute(
          "transform",
          `translate(${currentSweepX.toFixed(1)}, ${currentSweepY.toFixed(1)})`
        );
      }

      if (brightClipRectRef.current) {
        // Bright newly drawn trace: from 0 to currentSweepX
        brightClipRectRef.current.setAttribute("x", "0");
        brightClipRectRef.current.setAttribute("width", Math.max(0, currentSweepX).toFixed(1));
      }

      if (dimClipRectRef.current) {
        // Dim lingering phosphor trace: from currentSweepX + ERASE_GAP to WIDTH
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

  // Pulse animation duration in seconds for synchronized BPM dot indicator
  const pulseIntervalSec = (60 / clampedHr).toFixed(2);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[155px] bg-[#07090e] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl flex flex-col justify-between select-none"
      style={{
        boxShadow: `inset 0 0 30px rgba(0, 0, 0, 0.9), 0 8px 24px rgba(0, 0, 0, 0.4)`,
      }}
    >
      {/* Top Status & Overlay Header */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-2.5 pointer-events-none">
        {/* Left: Lead & Monitor Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-slate-900/90 border border-slate-700/60 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5" style={{ color: riskColor }} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-wider text-slate-200">
                ECG MONITOR
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-semibold border border-cyan-500/20">
                LEAD II
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              25mm/s &middot; 10mm/mV &middot; {clampedSt > 1.0 ? `ST Dep: ${clampedSt.toFixed(1)}mm` : "ST: Isoelectric"}
            </span>
          </div>
        </div>

        {/* Right: Heart Rate BPM readout with synchronized pulse indicator */}
        <div className="flex items-center gap-3">
          {/* Synchronized pulsing cardiac dot */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800">
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

      {/* Center Animated ECG SVG Canvas */}
      <div className="absolute inset-0 w-full h-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            {/* Dark Theme Fine ECG Grid Pattern (Minor: 16px) */}
            <pattern
              id="ecg-minor-grid"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 16 0 L 0 0 0 16"
                fill="none"
                stroke="#141a24"
                strokeWidth="0.75"
                strokeOpacity="0.7"
              />
            </pattern>

            {/* Major ECG Grid Pattern (Major: 80px / 5 subdivisions) */}
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
                stroke="#1c2331"
                strokeWidth="1.2"
                strokeOpacity="0.9"
              />
            </pattern>

            {/* Waveform Neon Glow Filter */}
            <filter id="ecg-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur1" />
              <feGaussianBlur stdDeviation="5.0" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clip path for freshly drawn trace (0 to current sweepX) */}
            <clipPath id="ecg-bright-clip">
              <rect
                ref={brightClipRectRef}
                x="0"
                y="0"
                width="0"
                height={HEIGHT}
              />
            </clipPath>

            {/* Clip path for lingering phosphor trace (sweepX + ERASE_GAP to WIDTH) */}
            <clipPath id="ecg-dim-clip">
              <rect
                ref={dimClipRectRef}
                x="0"
                y="0"
                width={WIDTH}
                height={HEIGHT}
              />
            </clipPath>

            {/* Sweep vertical laser beam gradient */}
            <linearGradient id="ecg-sweep-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={riskColor} stopOpacity="0.0" />
              <stop offset="30%" stopColor={riskColor} stopOpacity="0.3" />
              <stop offset="50%" stopColor={riskColor} stopOpacity="0.7" />
              <stop offset="70%" stopColor={riskColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={riskColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background ECG Paper Grid */}
          <rect width={WIDTH} height={HEIGHT} fill="url(#ecg-major-grid)" />

          {/* Isoelectric Baseline Reference Line */}
          <line
            x1="0"
            y1={BASE_Y}
            x2={WIDTH}
            y2={BASE_Y}
            stroke="#1c2331"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeOpacity="0.5"
          />

          {/* 1. Dim / Phosphor lingering trace from previous sweep */}
          <g clipPath="url(#ecg-dim-clip)" opacity="0.22">
            <path
              d={pathData}
              fill="none"
              stroke={riskColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* 2. Bright active newly drawn trace */}
          <g clipPath="url(#ecg-bright-clip)">
            {/* Outer Glow Pass */}
            <path
              d={pathData}
              fill="none"
              stroke={riskColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#ecg-glow)"
              opacity="0.75"
            />
            {/* Crisp Inner Core Pass */}
            <path
              d={pathData}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d={pathData}
              fill="none"
              stroke={riskColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* 3. Sweep cursor with vertical telemetry laser and glowing lead head */}
          <g ref={sweepCursorRef} transform="translate(0, 108)">
            {/* Vertical scanning laser line */}
            <line
              x1="0"
              y1={-BASE_Y}
              x2="0"
              y2={HEIGHT - BASE_Y}
              stroke="url(#ecg-sweep-beam)"
              strokeWidth="2.5"
            />

            {/* Glowing sweep cursor dot */}
            <circle
              r="7"
              fill={riskColor}
              opacity="0.35"
              filter="url(#ecg-glow)"
            />
            <circle
              r="4.5"
              fill={riskColor}
              opacity="0.9"
            />
            <circle
              r="2"
              fill="#ffffff"
            />
          </g>
        </svg>
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="relative z-20 flex items-center justify-between px-4 pb-2.5 text-[10px] font-mono text-slate-400 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE TELEMETRY
          </span>
          <span className="hidden sm:inline text-slate-500">·</span>
          <span className="hidden sm:inline text-slate-400">
            SPEED: {((clampedHr / 75) * 25).toFixed(1)} mm/s
          </span>
        </div>

        <div className="flex items-center gap-2">
          {clampedSt > 1.0 ? (
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

      {/* Keyframe for synchronized cardiac pulse */}
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
