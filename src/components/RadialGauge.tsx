"use client";

import React, { useId } from "react";

export interface RadialGaugeProps {
  percentage: number;     // 0-100
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  riskColor: string;      // hex color
}

/**
 * RadialGauge Component
 * High-precision 180-degree semi-circular speedometer gauge with
 * dynamic SVG gradients, spring-damped needle physics, ambient glow, and clinical risk badges.
 */
export default function RadialGauge({
  percentage = 0,
  riskLevel = "LOW",
  riskColor = "#10b981",
}: RadialGaugeProps) {
  // Generate unique IDs for SVG gradients and filters to prevent collisions across multiple instances
  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `radial-gauge-grad-${uniqueId}`;
  const glowFilterId = `radial-gauge-glow-${uniqueId}`;

  // Clamped percentage to [0, 100]
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  // Geometry configuration
  const CX = 150;
  const CY = 142;
  const RADIUS = 96;
  const STROKE_WIDTH = 14;
  const ARC_LENGTH = Math.PI * RADIUS; // ~301.59 px

  // Stroke dashoffset for the filled gradient arc
  const strokeDashoffset = ARC_LENGTH * (1 - clampedPercentage / 100);

  // Needle angle (-90deg is left at 0%, 0deg is straight up at 50%, +90deg is right at 100%)
  const needleRotationAngle = (clampedPercentage / 100) * 180 - 90;

  // Major and minor tick definitions
  const majorTicks = [
    { p: 0, label: "0%" },
    { p: 25, label: "25%" },
    { p: 50, label: "50%" },
    { p: 75, label: "75%" },
    { p: 100, label: "100%" },
  ];

  const minorTicks = [12.5, 37.5, 62.5, 87.5];

  return (
    <div className="relative w-[300px] h-[180px] flex flex-col items-center justify-between select-none mx-auto">
      {/* Ambient Glow Background Effect */}
      <div
        className="absolute top-4 w-44 h-28 rounded-full blur-2xl pointer-events-none transition-all duration-700 opacity-25"
        style={{ backgroundColor: riskColor }}
      />

      {/* SVG Semicircular Gauge Canvas */}
      <svg
        viewBox="0 0 300 180"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Semicircle Gradient: Emerald (0-35%) -> Amber (35-65%) -> Rose (65-100%) */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#10b981" />
            <stop offset="48%" stopColor="#f59e0b" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="82%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>

          {/* SVG Glow Filter */}
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Background Inactive Track (slate-800/50) */}
        <path
          d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeOpacity="0.6"
        />

        {/* 2. Ambient Glow Track underneath active arc */}
        <path
          d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE_WIDTH + 6}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={strokeDashoffset}
          filter={`url(#${glowFilterId})`}
          opacity="0.35"
          style={{
            transition: "stroke-dashoffset 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* 3. Filled Active Progress Arc */}
        <path
          d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* 4. Minor Ticks */}
        {minorTicks.map((p) => {
          const alpha = (p / 100) * Math.PI;
          const rIn = RADIUS + 11;
          const rOut = RADIUS + 15;
          const x1 = CX - rIn * Math.cos(alpha);
          const y1 = CY - rIn * Math.sin(alpha);
          const x2 = CX - rOut * Math.cos(alpha);
          const y2 = CY - rOut * Math.sin(alpha);
          return (
            <line
              key={`minor-${p}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#475569"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
          );
        })}

        {/* 5. Major Ticks and Labels */}
        {majorTicks.map(({ p, label }) => {
          const alpha = (p / 100) * Math.PI;
          const rIn = RADIUS + 10;
          const rOut = RADIUS + 18;
          const rText = RADIUS + 28;

          const x1 = CX - rIn * Math.cos(alpha);
          const y1 = CY - rIn * Math.sin(alpha);
          const x2 = CX - rOut * Math.cos(alpha);
          const y2 = CY - rOut * Math.sin(alpha);
          const tx = CX - rText * Math.cos(alpha);
          const ty = CY - rText * Math.sin(alpha) + (p === 0 || p === 100 ? 1 : 0);

          return (
            <g key={`major-${p}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="600"
                className="select-none"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* 6. Animated Needle / Indicator */}
        <g
          style={{
            transform: `rotate(${needleRotationAngle}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
            transition: "transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Shadow Behind Needle */}
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - RADIUS + 18}
            stroke="#000000"
            strokeWidth="4"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />

          {/* Needle Shaft */}
          <polygon
            points={`${CX - 3.5},${CY} ${CX - 1},${CY - RADIUS + 20} ${CX},${CY - RADIUS + 14} ${CX + 1},${CY - RADIUS + 20} ${CX + 3.5},${CY}`}
            fill="#e2e8f0"
          />

          {/* Glowing Needle Tip in riskColor */}
          <circle
            cx={CX}
            cy={CY - RADIUS + 18}
            r="3.5"
            fill={riskColor}
            filter={`url(#${glowFilterId})`}
          />
          <circle
            cx={CX}
            cy={CY - RADIUS + 18}
            r="2"
            fill="#ffffff"
          />

          {/* Pivot Base Extension (Counterweight) */}
          <polygon
            points={`${CX - 3},${CY} ${CX},${CY + 12} ${CX + 3},${CY}`}
            fill="#64748b"
          />
        </g>

        {/* 7. Center Needle Pivot Hub */}
        <circle
          cx={CX}
          cy={CY}
          r="10"
          fill="#0f172a"
          stroke="#475569"
          strokeWidth="2.5"
        />
        <circle
          cx={CX}
          cy={CY}
          r="4.5"
          fill={riskColor}
          style={{ transition: "fill 500ms ease" }}
        />
      </svg>

      {/* Center Readout: Large Bold Percentage & Risk Level Badge */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-center -mb-1">
        {/* Percentage Number */}
        <div className="flex items-baseline justify-center gap-0.5 leading-none">
          <span
            className="text-4xl font-black font-mono tracking-tight transition-colors duration-500"
            style={{ color: riskColor }}
          >
            {clampedPercentage}
          </span>
          <span className="text-sm font-bold text-slate-400 font-mono">%</span>
        </div>

        {/* Risk Level Badge */}
        <div className="mt-1.5">
          <span
            className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-500"
            style={{
              backgroundColor: `${riskColor}18`,
              color: riskColor,
              border: `1px solid ${riskColor}40`,
              boxShadow: `0 0 12px ${riskColor}20`,
            }}
          >
            {riskLevel} RISK
          </span>
        </div>
      </div>
    </div>
  );
}
