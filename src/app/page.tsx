"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Info,
  Sliders,
  BarChart3,
  Stethoscope,
  ShieldCheck,
  Zap,
  Users,
  Printer,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  PatientInputs,
  SAMPLE_PATIENTS,
  BENCHMARKS,
  FEATURE_IMPORTANCES,
  predictHeartRisk,
} from "@/data/modelData";
import EcgMonitor from "@/components/EcgMonitor";
import CadProbabilityCard from "@/components/CadProbabilityCard";
import ActivePatientProfileCard from "@/components/ActivePatientProfileCard";
import ShapDrivers from "@/components/ShapDrivers";
import PopulationModal from "@/components/PopulationModal";
import ClinicalReport from "@/components/ClinicalReport";

export default function HeartDiseaseApp() {
  // Default to Case 3 (the showcase high-risk critical case featured in design mockup)
  const [patient, setPatient] = useState<PatientInputs>(SAMPLE_PATIENTS[2]);
  const [activeTab, setActiveTab] = useState<"station" | "benchmark" | "dataset">("station");
  const [showPopulationModal, setShowPopulationModal] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Live real-time risk prediction
  const result = useMemo(() => predictHeartRisk(patient), [patient]);

  const handlePreset = (index: number) => {
    setPatient(SAMPLE_PATIENTS[index]);
  };

  const handleReset = () => {
    setPatient(SAMPLE_PATIENTS[2]);
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080a10]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/25 ring-1 ring-rose-400/30">
              <Heart className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">CardioSense</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-medium">
                  AI v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Coronary Artery Disease Risk Engine · UCI Dataset
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 bg-[#0e121a] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("station")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === "station"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Patient Station
            </button>
            <button
              onClick={() => setActiveTab("benchmark")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === "benchmark"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Model Benchmarks
            </button>
            <button
              onClick={() => setActiveTab("dataset")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === "dataset"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              Dataset & Features
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === "station" && (
          <div className="space-y-8">
            {/* ========================================================================= */}
            {/* 1. HERO CLINICAL HUD (FAITHFUL REPRODUCTION OF THE PHOTO DESIGN)        */}
            {/* ========================================================================= */}
            <div className="relative rounded-2xl bg-[#0a0d14] border border-slate-800/90 shadow-2xl p-6 sm:p-8 bg-hud-grid overflow-hidden">
              {/* HUD Corner Brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-rose-500/60 pointer-events-none" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-rose-500/60 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-rose-500/60 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-rose-500/60 pointer-events-none" />

              {/* Main Title & Subtitle */}
              <div className="space-y-1 mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                  Heart Disease Prediction
                </h1>
                <div className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
                  SCIKIT-LEARN · GRADIENT BOOSTING · SHAP ATTRIBUTION
                </div>
              </div>

              {/* Status Metadata Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-4 mb-6 rounded-xl bg-[#080b11]/90 border border-slate-800/80 text-xs font-mono">
                <div className="flex items-center gap-2 text-rose-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                  <span>CARDIOSENSE AI · UCI CLINICAL COHORT (920 PATIENTS)</span>
                </div>
                <div className="text-slate-400 font-medium">
                  ROC-AUC: <span className="text-slate-200 font-bold">0.919</span> · RECALL:{" "}
                  <span className="text-slate-200 font-bold">89.2%</span>
                </div>
              </div>

              {/* Split 2-Column Cockpit Deck */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column (5 Cols): CAD Probability + Active Patient Profile */}
                <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
                  <CadProbabilityCard
                    percentage={result.percentage}
                    riskLevel={result.riskLevel}
                    riskColor={result.riskColor}
                  />

                  <ActivePatientProfileCard patient={patient} />
                </div>

                {/* Right Column (7 Cols): Local SHAP / Logit Feature Drivers */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0e121a]/95 border border-slate-800/80 shadow-2xl flex flex-col justify-between">
                  <ShapDrivers contributions={result.contributions} />
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. CASE STUDY PRESET SELECTOR & QUICK ACTIONS                             */}
            {/* ========================================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c1017] border border-slate-800/90 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>LOAD PRESET CASE STUDIES:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {SAMPLE_PATIENTS.map((p, idx) => (
                  <button
                    key={p.name}
                    onClick={() => handlePreset(idx)}
                    className="text-xs px-3.5 py-1.5 rounded-lg bg-[#141a24] hover:bg-slate-700/80 border border-slate-700/80 transition text-slate-300 hover:text-white font-medium cursor-pointer"
                  >
                    {p.name.split(":")[0]}
                  </button>
                ))}
                <button
                  onClick={handleReset}
                  className="text-xs px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. ECG LEAD II TELEMETRY MONITOR                                         */}
            {/* ========================================================================= */}
            <EcgMonitor
              heartRate={patient.thalch}
              stDepression={patient.oldpeak}
              riskPercentage={result.percentage}
              riskColor={result.riskColor}
            />

            {/* ========================================================================= */}
            {/* 4. INTERACTIVE CLINICAL PARAMETER TUNING CONSOLE                          */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-400" />
                  <h2 className="font-bold text-sm text-slate-200 tracking-wide uppercase font-mono">
                    Live Patient Parameter Tuning Console
                  </h2>
                </div>
                <button
                  onClick={() => setShowControls(!showControls)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono transition cursor-pointer"
                >
                  {showControls ? "Hide Controls" : "Show Controls"}
                  {showControls ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showControls && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Panel 1: Baseline Hemodynamics & Demographics */}
                  <div className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800/90 space-y-5 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rose-400" />
                        <h3 className="font-semibold text-xs tracking-wider text-slate-200 uppercase font-mono">
                          Demographics & Baseline Hemodynamics
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">Panel 1 of 2</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Age */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-300 font-medium">Age</label>
                          <div className="flex items-center gap-1 bg-[#121620] border border-slate-700/80 rounded-md px-2 py-0.5 focus-within:border-rose-500 transition">
                            <input
                              type="number"
                              min={20}
                              max={95}
                              value={patient.age}
                              onChange={(e) =>
                                setPatient({
                                  ...patient,
                                  age: Math.min(95, Math.max(18, parseInt(e.target.value) || 0)),
                                })
                              }
                              className="w-8 bg-transparent text-right font-mono font-bold text-xs text-rose-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[11px] text-slate-400">yrs</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={28}
                          max={78}
                          value={patient.age}
                          onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      {/* Sex */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">Biological Sex</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["Male", "Female"] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setPatient({ ...patient, sex: s })}
                              className={`py-1.5 text-xs rounded-lg font-medium border transition cursor-pointer ${
                                patient.sex === s
                                  ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                                  : "bg-[#141a24] border-slate-800 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Resting Blood Pressure */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-300 font-medium">Resting BP (trestbps)</label>
                          <div className="flex items-center gap-1 bg-[#121620] border border-slate-700/80 rounded-md px-2 py-0.5 focus-within:border-rose-500 transition">
                            <input
                              type="number"
                              min={80}
                              max={220}
                              value={patient.trestbps}
                              onChange={(e) =>
                                setPatient({
                                  ...patient,
                                  trestbps: Math.min(240, Math.max(70, parseInt(e.target.value) || 0)),
                                })
                              }
                              className="w-10 bg-transparent text-right font-mono font-bold text-xs text-rose-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[11px] text-slate-400">mm Hg</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={90}
                          max={200}
                          value={patient.trestbps}
                          onChange={(e) => setPatient({ ...patient, trestbps: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      {/* Serum Cholesterol */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-300 font-medium">Serum Cholesterol (chol)</label>
                          <div className="flex items-center gap-1 bg-[#121620] border border-slate-700/80 rounded-md px-2 py-0.5 focus-within:border-rose-500 transition">
                            <input
                              type="number"
                              min={100}
                              max={600}
                              value={patient.chol}
                              onChange={(e) =>
                                setPatient({
                                  ...patient,
                                  chol: Math.min(600, Math.max(80, parseInt(e.target.value) || 0)),
                                })
                              }
                              className="w-10 bg-transparent text-right font-mono font-bold text-xs text-rose-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[11px] text-slate-400">mg/dl</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={120}
                          max={450}
                          value={patient.chol}
                          onChange={(e) => setPatient({ ...patient, chol: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      {/* Fasting Blood Sugar */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">Fasting Blood Sugar &gt; 120 mg/dl</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["False", "True"] as const).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setPatient({ ...patient, fbs: v })}
                              className={`py-1.5 text-xs rounded-lg font-medium border transition cursor-pointer ${
                                patient.fbs === v
                                  ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                                  : "bg-[#141a24] border-slate-800 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {v === "True" ? "Yes (> 120)" : "Normal (≤ 120)"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Max Heart Rate */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-300 font-medium">Max Heart Rate (thalach)</label>
                          <div className="flex items-center gap-1 bg-[#121620] border border-slate-700/80 rounded-md px-2 py-0.5 focus-within:border-rose-500 transition">
                            <input
                              type="number"
                              min={60}
                              max={220}
                              value={patient.thalch}
                              onChange={(e) =>
                                setPatient({
                                  ...patient,
                                  thalch: Math.min(220, Math.max(50, parseInt(e.target.value) || 0)),
                                })
                              }
                              className="w-10 bg-transparent text-right font-mono font-bold text-xs text-rose-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[11px] text-slate-400">bpm</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={70}
                          max={205}
                          value={patient.thalch}
                          onChange={(e) => setPatient({ ...patient, thalch: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Panel 2: Diagnostic & Stress Markers */}
                  <div className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800/90 space-y-5 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-rose-400" />
                        <h3 className="font-semibold text-xs tracking-wider text-slate-200 uppercase font-mono">
                          Cardiac Stress Test & Diagnostic Markers
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">Panel 2 of 2</span>
                    </div>

                    <div className="space-y-4">
                      {/* Chest Pain Type */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">Chest Pain Type (cp)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: "typical angina", label: "Typical Angina" },
                            { id: "atypical angina", label: "Atypical Angina" },
                            { id: "non-anginal", label: "Non-Anginal" },
                            { id: "asymptomatic", label: "Asymptomatic (Silent)" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setPatient({ ...patient, cp: t.id as any })}
                              className={`p-2 text-xs rounded-lg font-medium border text-center transition leading-tight cursor-pointer ${
                                patient.cp === t.id
                                  ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                                  : "bg-[#141a24] border-slate-800 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Resting ECG */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-300">Resting ECG</label>
                          <select
                            value={patient.restecg}
                            onChange={(e) => setPatient({ ...patient, restecg: e.target.value as any })}
                            className="w-full bg-[#121620] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition cursor-pointer"
                          >
                            <option value="normal">Normal</option>
                            <option value="st-t abnormality">ST-T Wave Abnormality</option>
                            <option value="lv hypertrophy">Left Ventricular Hypertrophy</option>
                          </select>
                        </div>

                        {/* Exercise-Induced Angina */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-300">Exercise-Induced Angina</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(["False", "True"] as const).map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setPatient({ ...patient, exang: v })}
                                className={`py-2 text-xs rounded-lg font-medium border transition cursor-pointer ${
                                  patient.exang === v
                                    ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                                    : "bg-[#141a24] border-slate-800 text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                {v === "True" ? "Yes (Provoked)" : "No (None)"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ST Depression (Oldpeak) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="text-slate-300 font-medium">ST Depression (oldpeak)</label>
                          <div className="flex items-center gap-1 bg-[#121620] border border-slate-700/80 rounded-md px-2 py-0.5 focus-within:border-rose-500 transition">
                            <input
                              type="number"
                              step="0.1"
                              min={0}
                              max={7.0}
                              value={patient.oldpeak}
                              onChange={(e) =>
                                setPatient({
                                  ...patient,
                                  oldpeak: Math.min(7.0, Math.max(0, parseFloat(e.target.value) || 0)),
                                })
                              }
                              className="w-10 bg-transparent text-right font-mono font-bold text-xs text-rose-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[11px] text-slate-400">mm</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={60}
                          value={Math.round(patient.oldpeak * 10)}
                          onChange={(e) => setPatient({ ...patient, oldpeak: parseInt(e.target.value) / 10 })}
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Slope of ST Segment */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-300">ST Slope</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: "upsloping", label: "Up" },
                              { id: "flat", label: "Flat" },
                              { id: "downsloping", label: "Down" },
                            ].map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setPatient({ ...patient, slope: s.id as any })}
                                className={`py-2 text-[11px] font-semibold rounded-lg border transition cursor-pointer ${
                                  patient.slope === s.id
                                    ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                                    : "bg-[#141a24] border-slate-800 text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Fluoroscopy Vessels */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-300">Major Vessels (ca)</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {["0.0", "1.0", "2.0", "3.0"].map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setPatient({ ...patient, ca: v as any })}
                                className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                                  patient.ca === v
                                    ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                                    : "bg-[#141a24] border-slate-800 text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                {v.split(".")[0]}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Thalassemia */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-300">Thalassemia</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: "normal", label: "Normal" },
                              { id: "fixed defect", label: "Fixed" },
                              { id: "reversable defect", label: "Revers." },
                            ].map((th) => (
                              <button
                                key={th.id}
                                type="button"
                                onClick={() => setPatient({ ...patient, thal: th.id as any })}
                                className={`py-2 text-[11px] font-semibold rounded-lg border transition cursor-pointer ${
                                  patient.thal === th.id
                                    ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                                    : "bg-[#141a24] border-slate-800 text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                {th.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 5. CLINICAL ACTION PROTOCOL & MODALS                                     */}
            {/* ========================================================================= */}
            <div className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800/90 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.riskLevel === "HIGH" ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  ) : result.riskLevel === "MODERATE" ? (
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide font-mono">
                    Clinical Action Protocol & Recommendations
                  </h3>
                </div>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase"
                  style={{
                    backgroundColor: `${result.riskColor}20`,
                    color: result.riskColor,
                    border: `1px solid ${result.riskColor}40`,
                  }}
                >
                  {result.riskLevel} PRIORITY
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {result.clinicalAdvice}
              </p>

              <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setShowPopulationModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 text-xs font-semibold transition-all duration-200 active:scale-[0.97] cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  Compare Population (N=920)
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141a24] hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-semibold transition-all duration-200 active:scale-[0.97] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Clinical Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODEL BENCHMARKS TAB                                                      */}
        {/* ========================================================================= */}
        {activeTab === "benchmark" && (
          <div className="space-y-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1017] border border-slate-800/90 space-y-6 shadow-xl bg-hud-grid">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Supervised Learning Model Comparisons
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Trained on 920 international patient records across 4 clinical hospitals. Evaluated on strict 20% holdout test split and 5-fold cross-validation.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="py-3 px-4">Model Architecture</th>
                      <th className="py-3 px-4">Accuracy</th>
                      <th className="py-3 px-4">Precision</th>
                      <th className="py-3 px-4">Recall</th>
                      <th className="py-3 px-4">F1 Score</th>
                      <th className="py-3 px-4">Holdout ROC-AUC</th>
                      <th className="py-3 px-4">5-Fold CV AUC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {Object.entries(BENCHMARKS).map(([mName, m]) => (
                      <tr key={mName} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-sans font-semibold text-slate-200 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          {mName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{(m.accuracy * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4 text-slate-300">{(m.precision * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-bold">{(m.recall * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4 text-slate-300">{(m.f1 * 100).toFixed(1)}%</td>
                        <td className="py-3.5 px-4 text-rose-400 font-bold">{m.roc_auc.toFixed(4)}</td>
                        <td className="py-3.5 px-4 text-sky-400">
                          {m.cv_auc_mean.toFixed(4)} ± {m.cv_auc_std.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Importance Ranking */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1017] border border-slate-800/90 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Global Feature Importance (Gradient Boosting)
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Permutation &amp; Gini impurity feature importances for predicting coronary artery disease.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {FEATURE_IMPORTANCES.map((f, i) => (
                  <div key={f.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">
                          #{i + 1} {f.feature}
                        </span>
                        <span className="text-slate-400 ml-2">({f.description})</span>
                      </div>
                      <span className="font-mono text-rose-400 font-bold">
                        {(f.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#121620] h-2 rounded-full overflow-hidden border border-slate-800/80">
                      <div
                        className="bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 h-full rounded-full shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                        style={{ width: `${(f.importance / 0.23) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DATASET & FEATURES TAB                                                    */}
        {/* ========================================================================= */}
        {activeTab === "dataset" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1017] border border-slate-800/90 space-y-6 shadow-xl bg-hud-grid">
              <h2 className="text-xl font-bold text-white tracking-tight">
                UCI Heart Disease Clinical Cohort (920 Patients)
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                The dataset consolidates clinical databases from four leading international cardiology research centers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {[
                  { name: "Cleveland Clinic Foundation", location: "Cleveland, USA", n: "303 patients" },
                  { name: "Hungarian Institute of Cardiology", location: "Budapest, Hungary", n: "294 patients" },
                  { name: "University Hospital", location: "Zurich, Switzerland", n: "123 patients" },
                  { name: "VA Medical Center", location: "Long Beach, USA", n: "200 patients" },
                ].map((site) => (
                  <div key={site.name} className="p-4 rounded-xl bg-[#121620] border border-slate-800/80 space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">{site.name}</h4>
                    <p className="text-[11px] text-slate-400">{site.location}</p>
                    <p className="text-xs font-mono text-rose-400 mt-2 font-semibold">{site.n}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-800 pt-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Diagnostic Clinical Target</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The angiographic gold standard outcome is coronary artery diameter narrowing:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                  <li>
                    <strong className="text-slate-200">0 (Healthy):</strong> &lt; 50% diameter stenosis in all major coronary vessels.
                  </li>
                  <li>
                    <strong className="text-slate-200">1, 2, 3, 4 (Disease):</strong> &gt; 50% diameter stenosis in 1 to 4 major epicardial coronary arteries.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#06080d] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-sans">
          <div>
            Developed by <strong className="text-slate-200">Matthew Labrador</strong> · CardioSense Clinical ML
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://matthewlabrador.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="text-rose-400 hover:text-rose-300 transition"
            >
              ← Back to Portfolio
            </a>
          </div>
        </div>
      </footer>

      {/* Population Comparison Modal */}
      <PopulationModal
        isOpen={showPopulationModal}
        onClose={() => setShowPopulationModal(false)}
        patient={patient}
      />

      {/* Hidden Print-Optimized Clinical Report */}
      <ClinicalReport patient={patient} result={result} />
    </div>
  );
}
