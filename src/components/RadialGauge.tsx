"use client";

import React, { useId } from "react";

export interface RadialGaugeProps {
  percentage: number; // 0-100
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  riskColor: string; // hex color
}

/**
 * Modern High-Tech Clinical Radial Gauge
 * Clean semi-circular telemetry meter with smooth gradient arc,
 * dynamic indicator glow, crisp tick marks, and centered typography with zero overlap.
 */
export default function RadialGauge({
  percentage = 0,
  riskLevel = "LOW",
  riskColor = "#10b981",
}: RadialGaugeProps) {
  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `gauge-grad-${uniqueId}`;
  const glowId = `gauge-glow-${uniqueId}`;

  const clamped = Math.min(Math.max(percentage, 0), 100);

  // Gauge geometry
  const CX = 140;
  const CY = 122;
  const RADIUS = 92;
  const STROKE = 10;

  const ARC_LENGTH = Math.PI * RADIUS; // ~289 px
  const strokeDashoffset = ARC_LENGTH * (1 - clamped / 100);

  // Indicator angle for the glowing tip along the arc
  const angleRad = Math.PI * (1 - clamped / 100);
  const pointerX = CX - RADIUS * Math.cos(angleRad);
  const pointerY = CY - RADIUS * Math.sin(angleRad);

  const ticks = [
    { p: 0, label: "0%" },
    { p: 25, label: "25%" },
    { p: 50, label: "50%" },
    { p: 75, label: "75%" },
    { p: 100, label: "100%" },
  ];

  return (
    <div className="relative w-full max-w-[280px] h-[160px] flex flex-col items-center justify-start select-none mx-auto">
      {/* Ambient background glow */}
      <div
        className="absolute top-2 w-48 h-32 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20"
        style={{ backgroundColor: riskColor }}
      />

      <svg
        viewBox="0 0 280 155"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>

          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Track background */}
        <path
          d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
          fill="none"
          stroke="#18202f"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* 2. Subdued tick marks */}
        {ticks.map(({ p, label }) => {
          const a = (p / 100) * Math.PI;
          const r1 = RADIUS + 8;
          const r2 = RADIUS + 14;
          const rt = RADIUS + 23;

          const x1 = CX - r1 * Math.cos(a);
          const y1 = CY - r1 * Math.sin(a);
          const x2 = CX - r2 * Math.cos(a);
          const y2 = CY - r2 * Math.sin(a);
          const xt = CX - rt * Math.cos(a);
          const yt = CY - rt * Math.sin(a) + (p === 0 || p === 100 ? 2 : 0);

          return (
            <g key={p}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#334155"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <text
                x={xt}
                y={yt}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#64748b"
                fontSize="8.5"
                fontFamily="ui-monospace, monospace"
                fontWeight="500"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* 3. Filled Gradient Arc with smooth transition */}
        <path
          d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* 4. Glowing Arc Pass */}
        <path
          d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE + 4}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={strokeDashoffset}
          filter={`url(#${glowId})`}
          opacity="0.3"
          style={{
            transition: "stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* 5. Glowing Pointer Beacon at the edge of the active arc */}
        {clamped > 0 && (
          <g>
            <circle
              cx={pointerX}
              cy={pointerY}
              r="6"
              fill={riskColor}
              filter={`url(#${glowId})`}
              opacity="0.85"
            />
            <circle
              cx={pointerX}
              cy={pointerY}
              r="3.5"
              fill="#ffffff"
            />
          </g>
        )}
      </svg>

      {/* Centered Clean Numerical Readout */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline justify-center gap-0.5 leading-none">
          <span
            className="text-5xl font-black font-mono tracking-tight transition-colors duration-500"
            style={{ color: riskColor }}
          >
            {clamped}
          </span>
          <span className="text-base font-bold text-slate-400 font-mono">%</span>
        </div>
        <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mt-1">
          Probability of CAD
        </span>
      </div>
    </div>
  );
}

