"use client";

import React from "react";
import { PatientInputs, getActivePatientSummary } from "@/data/modelData";

export interface ActivePatientProfileCardProps {
  patient: PatientInputs;
}

export default function ActivePatientProfileCard({
  patient,
}: ActivePatientProfileCardProps) {
  const summary = getActivePatientSummary(patient);

  return (
    <div className="w-full p-6 rounded-2xl bg-[#0e121a]/95 border border-slate-800/80 shadow-2xl relative overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          ACTIVE PATIENT PROFILE
        </span>
      </div>

      {/* Profile Key-Value Pairs */}
      <div className="space-y-3 text-xs">
        {/* Demographics */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Demographics
          </div>
          <div className="font-bold text-slate-100 mt-0.5 tracking-tight">
            {summary.demographics}
          </div>
        </div>

        {/* Hemodynamics */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Hemodynamics
          </div>
          <div className="font-bold text-slate-100 mt-0.5 tracking-tight">
            {summary.hemodynamics}
          </div>
        </div>

        {/* Cardiac Stress */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Cardiac Stress
          </div>
          <div className="font-bold text-slate-100 mt-0.5 tracking-tight">
            {summary.cardiacStress}
          </div>
        </div>

        {/* Diagnostic Tests */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Diagnostic Tests
          </div>
          <div className="font-bold text-slate-100 mt-0.5 tracking-tight">
            {summary.diagnosticHits}
          </div>
        </div>
      </div>
    </div>
  );
}
