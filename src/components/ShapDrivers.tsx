"use client";

import React from "react";

export interface Contribution {
  label: string;
  impact: number;
  direction: "risk" | "protective";
}

export interface ShapDriversProps {
  contributions: Contribution[];
}

export default function ShapDrivers({ contributions = [] }: ShapDriversProps) {
  // Max impact reference for proportional bar width
  const maxImpact =
    contributions.length > 0
      ? Math.max(...contributions.map((c) => Math.abs(c.impact)), 1.3)
      : 1.3;

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-[11px] font-mono tracking-wider">
        <span className="text-slate-400 font-semibold uppercase">
          LOCAL SHAP / LOGIT FEATURE DRIVERS
        </span>
        <span className="text-slate-400 font-semibold uppercase">
          CONTRIBUTION
        </span>
      </div>

      {/* Driver Rows */}
      <div className="space-y-4 pt-3 flex-1">
        {contributions.map((item, idx) => {
          const absImpact = Math.abs(item.impact);
          const isRisk = item.direction === "risk";
          const percentWidth = Math.min(
            Math.max((absImpact / maxImpact) * 92, 8),
            98
          );
          const sign = isRisk ? "+" : "-";

          return (
            <div key={`${item.label}-${idx}`} className="group space-y-1.5">
              {/* Label & Value Row */}
              <div className="flex items-baseline justify-between text-xs gap-3">
                <span className="font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                  {item.label}
                </span>
                <span
                  className={`font-mono font-bold tracking-tight text-xs flex-shrink-0 ${
                    isRisk ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {sign} {absImpact.toFixed(2)}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isRisk
                      ? "bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                      : "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  }`}
                  style={{ width: `${percentWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
