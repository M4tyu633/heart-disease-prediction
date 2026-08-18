"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Users,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  Sliders,
  ShieldAlert,
} from "lucide-react";
import { PatientInputs, POPULATION_STATS } from "@/data/modelData";

export interface PopulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientInputs;
}

interface NumericComparison {
  key: keyof typeof POPULATION_STATS;
  label: string;
  unit: string;
  patientVal: number;
  mean: number;
  median: number;
  sd: number;
  min: number;
  max: number;
  zScore: number;
  isOutlier: boolean;
  direction: "elevated" | "depressed" | "normal";
}

export default function PopulationModal({
  isOpen,
  onClose,
  patient,
}: PopulationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Compute numeric statistics & comparisons
  const comparisons: NumericComparison[] = useMemo(() => {
    const list: {
      key: keyof typeof POPULATION_STATS;
      label: string;
      unit: string;
      patientVal: number;
    }[] = [
      { key: "age", label: "Age", unit: "years", patientVal: patient.age },
      {
        key: "trestbps",
        label: "Resting Blood Pressure",
        unit: "mm Hg",
        patientVal: patient.trestbps,
      },
      {
        key: "chol",
        label: "Serum Cholesterol",
        unit: "mg/dl",
        patientVal: patient.chol,
      },
      {
        key: "thalch",
        label: "Max Heart Rate (thalach)",
        unit: "bpm",
        patientVal: patient.thalch,
      },
      {
        key: "oldpeak",
        label: "ST Depression (oldpeak)",
        unit: "mm",
        patientVal: patient.oldpeak,
      },
    ];

    return list.map((item) => {
      const stat = POPULATION_STATS[item.key];
      const zScore = (item.patientVal - stat.mean) / stat.sd;
      const isOutlier = Math.abs(zScore) > 1.0;
      const direction =
        zScore > 1.0 ? "elevated" : zScore < -1.0 ? "depressed" : "normal";

      return {
        ...item,
        mean: stat.mean,
        median: stat.median,
        sd: stat.sd,
        min: stat.min,
        max: stat.max,
        zScore,
        isOutlier,
        direction,
      };
    });
  }, [patient]);

  const outlierCount = comparisons.filter((c) => c.isOutlier).length;

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-4xl bg-[#0e121a] border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/90 bg-[#141a24]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="modal-title"
                className="text-lg font-bold text-slate-100 tracking-tight"
              >
                Patient vs. Population Comparison
              </h2>
              <p className="text-xs text-slate-400">
                Benchmark against 920 patients from the multi-center UCI Heart
                Disease dataset
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[calc(85vh-140px)] overflow-y-auto space-y-6">
          {/* Numeric Biomarkers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Continuous Hemodynamic & Stress Biomarkers
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Population Range & Mean (±1 SD)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {comparisons.map((c) => {
                // Calculate percentage position along [min, max]
                const range = c.max - c.min;
                const patientPercent = Math.min(
                  Math.max(((c.patientVal - c.min) / range) * 100, 0),
                  100
                );
                const meanPercent = Math.min(
                  Math.max(((c.mean - c.min) / range) * 100, 0),
                  100
                );
                const lowerSdPercent = Math.min(
                  Math.max(((c.mean - c.sd - c.min) / range) * 100, 0),
                  100
                );
                const upperSdPercent = Math.min(
                  Math.max(((c.mean + c.sd - c.min) / range) * 100, 0),
                  100
                );
                const sdWidth = upperSdPercent - lowerSdPercent;

                const isSevere = Math.abs(c.zScore) > 2.0;

                return (
                  <div
                    key={c.key}
                    className={`p-4 rounded-xl border transition-all ${
                      c.isOutlier
                        ? isSevere
                          ? "bg-rose-950/15 border-rose-500/40"
                          : "bg-amber-950/15 border-amber-500/40"
                        : "bg-slate-900/60 border-slate-800/80"
                    }`}
                  >
                    {/* Top Row: Label, Values, Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-200">
                          {c.label}
                        </span>
                        {c.isOutlier ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                              isSevere
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            }`}
                          >
                            {c.direction === "elevated" ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {c.zScore > 0 ? "+" : ""}
                            {c.zScore.toFixed(2)}σ (
                            {c.direction === "elevated" ? "Elevated" : "Depressed"}
                            )
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Normal ({c.zScore > 0 ? "+" : ""}
                            {c.zScore.toFixed(2)}σ)
                          </span>
                        )}
                      </div>

                      {/* Numeric summary */}
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-slate-400">
                          Pop Mean:{" "}
                          <strong className="text-slate-200 font-mono">
                            {c.mean} {c.unit}
                          </strong>
                        </span>
                        <span className="text-slate-500">|</span>
                        <span
                          className={`font-bold ${
                            c.isOutlier
                              ? isSevere
                                ? "text-rose-400"
                                : "text-amber-400"
                              : "text-sky-400"
                          }`}
                        >
                          Patient: {c.patientVal} {c.unit}
                        </span>
                      </div>
                    </div>

                    {/* Visual Comparison Track */}
                    <div className="relative pt-6 pb-2">
                      {/* Bar Track Container */}
                      <div className="relative w-full h-3.5 bg-slate-800/90 rounded-full overflow-visible border border-slate-700/60">
                        {/* Normal Range Band (Mean ± 1 SD) */}
                        <div
                          className="absolute top-0 bottom-0 bg-slate-700/50 border-x border-slate-600/70"
                          style={{
                            left: `${lowerSdPercent}%`,
                            width: `${sdWidth}%`,
                          }}
                          title={`Normal Range (±1 SD): ${(c.mean - c.sd).toFixed(1)} to ${(c.mean + c.sd).toFixed(1)} ${c.unit}`}
                        />

                        {/* Patient Value Filled Bar */}
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            c.isOutlier
                              ? isSevere
                                ? "bg-gradient-to-r from-rose-600 to-rose-400"
                                : "bg-gradient-to-r from-amber-600 to-amber-400"
                              : "bg-gradient-to-r from-sky-600 to-sky-400"
                          }`}
                          style={{ width: `${patientPercent}%` }}
                        />

                        {/* Population Mean Vertical Marker Line */}
                        <div
                          className="absolute top-[-6px] bottom-[-6px] w-0.5 bg-slate-300 z-10 shadow-sm"
                          style={{ left: `${meanPercent}%` }}
                        >
                          {/* Mean Label Tooltip above */}
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-400 whitespace-nowrap bg-slate-800 px-1 py-0.5 rounded border border-slate-700">
                            μ {c.mean}
                          </div>
                        </div>

                        {/* Patient Pin / Value Indicator */}
                        <div
                          className={`absolute -bottom-1 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 border-[#0e121a] z-20 shadow-md ${
                            c.isOutlier
                              ? isSevere
                                ? "bg-rose-400 ring-2 ring-rose-500/40"
                                : "bg-amber-400 ring-2 ring-amber-500/40"
                              : "bg-sky-300 ring-2 ring-sky-500/40"
                          }`}
                          style={{ left: `${patientPercent}%` }}
                        />
                      </div>

                      {/* Scale Labels below track */}
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2">
                        <span>
                          Min: {c.min} {c.unit}
                        </span>
                        <span className="text-slate-400">
                          Normal Band (±1 SD): {(c.mean - c.sd).toFixed(1)} –{" "}
                          {(c.mean + c.sd).toFixed(1)}
                        </span>
                        <span>
                          Max: {c.max} {c.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categorical Parameters Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <Sliders className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Categorical & Qualitative Clinical Profile
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Sex */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  Biological Sex
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    {patient.sex}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      patient.sex === "Male"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    }`}
                  >
                    {patient.sex === "Male" ? "Higher CAD Base" : "Lower CAD Base"}
                  </span>
                </div>
              </div>

              {/* Chest Pain Type */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  Chest Pain (CP)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 capitalize">
                    {patient.cp}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      patient.cp === "asymptomatic"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {patient.cp === "asymptomatic" ? "High Risk" : "Typical/Other"}
                  </span>
                </div>
              </div>

              {/* Fasting Blood Sugar */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  Fasting Sugar &gt; 120
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    {patient.fbs === "True" ? "Yes (> 120)" : "Normal (≤ 120)"}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      patient.fbs === "True"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {patient.fbs === "True" ? "Hyperglycemic" : "Normal"}
                  </span>
                </div>
              </div>

              {/* Resting ECG */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  Resting ECG
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 capitalize">
                    {patient.restecg}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      patient.restecg !== "normal"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {patient.restecg === "normal" ? "Normal" : "Abnormal"}
                  </span>
                </div>
              </div>

              {/* Exercise Induced Angina */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  Exercise Angina (exang)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    {patient.exang === "True" ? "Provoked (Yes)" : "None (No)"}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      patient.exang === "True"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {patient.exang === "True" ? "Positive" : "Negative"}
                  </span>
                </div>
              </div>

              {/* ST Segment Slope */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  ST Slope
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 capitalize">
                    {patient.slope}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      patient.slope === "downsloping"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : patient.slope === "flat"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {patient.slope}
                  </span>
                </div>
              </div>

              {/* Major Vessels (ca) */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  Major Vessels (ca: 0-3)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    {patient.ca} Vessels
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      parseFloat(patient.ca) > 0
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {parseFloat(patient.ca) > 0 ? "Stenosed" : "0 Vessels"}
                  </span>
                </div>
              </div>

              {/* Thalassemia */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  Thalassemia
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 capitalize">
                    {patient.thal}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      patient.thal === "reversable defect"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : patient.thal === "fixed defect"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {patient.thal === "normal" ? "Normal" : "Defect"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="px-6 py-4 bg-[#141a24]/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                outlierCount > 0
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {outlierCount > 0 ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                {outlierCount > 0
                  ? `${outlierCount} of ${comparisons.length} continuous biomarkers deviate > 1.0 SD from population mean`
                  : `All continuous biomarkers are within normal population distribution (±1.0 SD)`}
              </div>
              <p className="text-[11px] text-slate-400">
                {outlierCount > 0
                  ? "Significant standard deviation divergence indicates atypical hemodynamic stress or ischemia."
                  : "Biomarker values fall within standard epidemiological reference ranges."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
