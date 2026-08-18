"use client";

import React, { useState, useMemo } from "react";
import { ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Info } from "lucide-react";

export interface Contribution {
  label: string;
  impact: number;
  direction: "risk" | "protective";
}

export interface WaterfallChartProps {
  contributions: Contribution[];
}

/**
 * WaterfallChart Component
 * Bidirectional horizontal SHAP / logit biomarker attribution waterfall chart.
 * Visualizes protective factors (green, extending left) and risk factors (red, extending right)
 * relative to the zero-baseline center axis with smooth transitions and interactive tooltips.
 */
export default function WaterfallChart({ contributions = [] }: WaterfallChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Sort contributions by absolute impact descending (largest drivers at top)
  const sortedContributions = useMemo(() => {
    return [...contributions].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }, [contributions]);

  // Max impact for proportional bar normalization
  const maxImpact = useMemo(() => {
    if (sortedContributions.length === 0) return 1.0;
    const maxVal = Math.max(...sortedContributions.map((c) => Math.abs(c.impact)));
    return maxVal > 0 ? maxVal : 1.0;
  }, [sortedContributions]);

  if (!contributions || contributions.length === 0) {
    return (
      <div className="w-full p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
        <Info className="w-5 h-5 mx-auto mb-2 text-slate-500 opacity-60" />
        No biomarker attribution data available.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 select-none">
      {/* Axis Header Legend */}
      <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-800 text-[11px] font-mono">
        {/* Left Legend: Protective */}
        <div className="flex items-center justify-start gap-1.5 text-emerald-400 font-semibold pl-2">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>← PROTECTIVE (LOWERS RISK)</span>
        </div>

        {/* Right Legend: Risk Drivers */}
        <div className="flex items-center justify-end gap-1.5 text-rose-400 font-semibold pr-2">
          <span>RISK DRIVERS (RAISES RISK) →</span>
          <TrendingUp className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Axis Scale Markers */}
      <div className="relative w-full h-4 text-[10px] font-mono text-slate-400">
        <div className="absolute left-0 text-left pl-2">-{maxImpact.toFixed(1)}</div>
        <div className="absolute left-1/4 -translate-x-1/2 text-center text-slate-400">
          -{ (maxImpact / 2).toFixed(1) }
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-center font-bold text-slate-300">
          0.0 Baseline
        </div>
        <div className="absolute left-3/4 -translate-x-1/2 text-center text-slate-400">
          +{ (maxImpact / 2).toFixed(1) }
        </div>
        <div className="absolute right-0 text-right pr-2">+{maxImpact.toFixed(1)}</div>
      </div>

      {/* Chart Rows Container */}
      <div className="relative space-y-3 py-1">
        {/* Continuous Center Baseline Line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700/80 -translate-x-1/2 z-10 pointer-events-none"
          style={{
            boxShadow: "0 0 8px rgba(100, 116, 139, 0.4)",
          }}
        />

        {/* 25% and 75% subtle background grid guides */}
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-slate-800/40 -translate-x-1/2 pointer-events-none dashed" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-slate-800/40 -translate-x-1/2 pointer-events-none dashed" />

        {sortedContributions.map((item, idx) => {
          const isRisk = item.direction === "risk";
          const absImpact = Math.abs(item.impact);
          // Calculate percentage width normalized to maxImpact (capped at 96% for margin)
          const barWidthPercent = Math.min(Math.max((absImpact / maxImpact) * 94, 4), 94);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={`${item.label}-${idx}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`relative rounded-xl p-2 transition-all duration-200 cursor-pointer ${
                isHovered
                  ? "bg-slate-800/70 shadow-lg shadow-black/40 ring-1 ring-slate-700/80"
                  : "bg-slate-900/40 hover:bg-slate-800/40"
              }`}
            >
              {/* Row Grid: 2 Equal Halves meeting at the Center Line */}
              <div className="grid grid-cols-2 gap-0 items-center min-h-[38px]">
                {/* Left Side: Protective Bar (extends LEFT from Center) */}
                <div className="relative flex items-center justify-end h-8 pr-1">
                  {!isRisk && (
                    <>
                      {/* Label on the outer left edge */}
                      <span
                        className={`text-xs font-medium truncate max-w-[130px] sm:max-w-[190px] mr-auto pl-2 transition-colors ${
                          isHovered ? "text-emerald-300 font-semibold" : "text-slate-300"
                        }`}
                        title={item.label}
                      >
                        {item.label}
                      </span>

                      {/* Protective Bar extending Left from Center */}
                      <div
                        className={`h-7 rounded-l-lg flex items-center justify-start pl-2.5 transition-all duration-500 ease-out shadow-sm ${
                          isHovered
                            ? "bg-emerald-400 shadow-emerald-500/40 brightness-110"
                            : "bg-[#10b981] hover:bg-emerald-400"
                        }`}
                        style={{
                          width: `${barWidthPercent}%`,
                        }}
                      >
                        <span className="text-[11px] font-mono font-bold text-slate-950 drop-shadow-sm whitespace-nowrap">
                          -{absImpact.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Side: Risk Bar (extends RIGHT from Center) */}
                <div className="relative flex items-center justify-start h-8 pl-1">
                  {isRisk && (
                    <>
                      {/* Risk Bar extending Right from Center */}
                      <div
                        className={`h-7 rounded-r-lg flex items-center justify-end pr-2.5 transition-all duration-500 ease-out shadow-sm ${
                          isHovered
                            ? "bg-rose-400 shadow-rose-500/40 brightness-110"
                            : "bg-[#f43f5e] hover:bg-rose-400"
                        }`}
                        style={{
                          width: `${barWidthPercent}%`,
                        }}
                      >
                        <span className="text-[11px] font-mono font-bold text-white drop-shadow-sm whitespace-nowrap">
                          +{absImpact.toFixed(2)}
                        </span>
                      </div>

                      {/* Label on the outer right edge */}
                      <span
                        className={`text-xs font-medium truncate max-w-[130px] sm:max-w-[190px] ml-auto pr-2 transition-colors ${
                          isHovered ? "text-rose-300 font-semibold" : "text-slate-300"
                        }`}
                        title={item.label}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Tooltip Card on Hover */}
              {isHovered && (
                <div
                  className="mt-2.5 p-3 rounded-lg bg-slate-950/95 border border-slate-700/80 shadow-2xl text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150 relative z-30"
                  style={{
                    boxShadow: isRisk
                      ? "0 10px 25px -5px rgba(244, 63, 94, 0.25)"
                      : "0 10px 25px -5px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      {isRisk ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                        isRisk
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {isRisk ? `+${absImpact.toFixed(3)} logit` : `-${absImpact.toFixed(3)} logit`}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    {isRisk
                      ? `Exerts positive pressure on CAD log-odds (+${absImpact.toFixed(2)}). Increases predicted cardiovascular event probability.`
                      : `Exerts negative pressure on CAD log-odds (-${absImpact.toFixed(2)}). Favorable biomarker protecting against coronary disease.`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
