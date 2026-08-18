"use client";

import React from "react";

export interface CadProbabilityCardProps {
  percentage: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  riskColor: string;
}

export default function CadProbabilityCard({
  percentage = 86,
  riskLevel = "HIGH",
  riskColor = "#f43f5e",
}: CadProbabilityCardProps) {
  const clamped = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="w-full p-6 rounded-2xl bg-[#0e121a]/95 border border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between select-none">
      {/* Background ambient glow */}
      <div
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: riskColor }}
      />

      {/* Top Header & Risk Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          PREDICTED CAD PROBABILITY
        </span>
        <span
          className="text-[11px] font-mono px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-all duration-300"
          style={{
            backgroundColor: `${riskColor}15`,
            color: riskColor,
            border: `1px solid ${riskColor}40`,
            boxShadow: `0 0 12px ${riskColor}20`,
          }}
        >
          {riskLevel} RISK
        </span>
      </div>

      {/* Big Number & Subtitle */}
      <div className="flex flex-wrap items-baseline gap-4 my-2">
        <span
          className="text-5xl sm:text-6xl font-black tracking-tight leading-none transition-colors duration-500 font-sans"
          style={{
            color: riskColor,
            textShadow: `0 0 25px ${riskColor}40`,
          }}
        >
          {clamped}%
        </span>
        <span className="text-xs font-mono text-slate-400 pb-1">
          probability of &gt;50% stenosis
        </span>
      </div>

      {/* Segmented Linear Progress Bar */}
      <div className="space-y-2 mt-4">
        <div className="relative w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
          {/* 35% and 65% threshold divider lines */}
          <div className="absolute left-[35%] top-0 bottom-0 w-0.5 bg-slate-700/80 z-10" />
          <div className="absolute left-[65%] top-0 bottom-0 w-0.5 bg-slate-700/80 z-10" />

          {/* Filled Progress Bar */}
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${clamped}%`,
              backgroundColor: riskColor,
              boxShadow: `0 0 12px ${riskColor}`,
            }}
          />
        </div>

        {/* Segment Labels */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-0.5">
          <span>0% Healthy</span>
          <span className="pl-4">35% Moderate</span>
          <span>65% Critical</span>
        </div>
      </div>
    </div>
  );
}
