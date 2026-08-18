"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  RefreshCw,
  Info,
  Sliders,
  BarChart3,
  Stethoscope,
  ShieldCheck,
  Zap,
  Users,
  Printer,
} from "lucide-react";
import {
  PatientInputs,
  SAMPLE_PATIENTS,
  BENCHMARKS,
  FEATURE_IMPORTANCES,
  predictHeartRisk,
} from "@/data/modelData";
import EcgMonitor from "@/components/EcgMonitor";
import RadialGauge from "@/components/RadialGauge";
import WaterfallChart from "@/components/WaterfallChart";
import PopulationModal from "@/components/PopulationModal";
import ClinicalReport from "@/components/ClinicalReport";

export default function HeartDiseaseApp() {
  const [patient, setPatient] = useState<PatientInputs>(SAMPLE_PATIENTS[1]);
  const [activeTab, setActiveTab] = useState<"calculator" | "benchmark" | "dataset">("calculator");
  const [showPopulationModal, setShowPopulationModal] = useState(false);

  // Calculate live prediction score
  const result = useMemo(() => predictHeartRisk(patient), [patient]);

  const handlePreset = (index: number) => {
    setPatient(SAMPLE_PATIENTS[index]);
  };

  const handleReset = () => {
    setPatient(SAMPLE_PATIENTS[0]);
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col selection:bg-rose-500/20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0b0e14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Heart className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">CardioSense</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-medium">
                  AI v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Coronary Artery Disease Risk Engine · UCI Dataset</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("calculator")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === "calculator"
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Preset Patient Loaders */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Load Preset Case Studies:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_PATIENTS.map((p, idx) => (
              <button
                key={p.name}
                onClick={() => handlePreset(idx)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition text-slate-300 hover:text-white"
              >
                {p.name.split(":")[0]}
              </button>
            ))}
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {activeTab === "calculator" && (
          <div className="space-y-6">
            {/* Full-Width Telemetry ECG Lead II Monitor */}
            <EcgMonitor
              heartRate={patient.thalch}
              stDepression={patient.oldpeak}
              riskPercentage={result.percentage}
              riskColor={result.riskColor}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 7 Cols: Patient Biomarkers & Clinical Parameters */}
              <div className="lg:col-span-7 space-y-6">
                {/* Section 1: Demographics & Hemodynamics */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <h2 className="font-semibold text-sm tracking-wide text-slate-200">
                      Demographics & Baseline Hemodynamics
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Panel 1 of 2</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-300 font-medium">Age</label>
                      <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-700/80 rounded-md px-2 py-0.5 focus-within:border-sky-400 transition">
                        <input
                          type="number"
                          min={20}
                          max={95}
                          value={patient.age}
                          onChange={(e) => setPatient({ ...patient, age: Math.min(95, Math.max(18, parseInt(e.target.value) || 0)) })}
                          className="w-8 bg-transparent text-right font-mono font-bold text-xs text-sky-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
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
                          className={`py-1.5 text-xs rounded-lg font-medium border transition ${
                            patient.sex === s
                              ? "bg-sky-500/20 border-sky-400 text-sky-300"
                              : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
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
                      <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-700/80 rounded-md px-2 py-0.5 focus-within:border-sky-400 transition">
                        <input
                          type="number"
                          min={80}
                          max={220}
                          value={patient.trestbps}
                          onChange={(e) => setPatient({ ...patient, trestbps: Math.min(240, Math.max(70, parseInt(e.target.value) || 0)) })}
                          className="w-10 bg-transparent text-right font-mono font-bold text-xs text-sky-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>

                  {/* Serum Cholesterol */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-300 font-medium">Serum Cholesterol (chol)</label>
                      <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-700/80 rounded-md px-2 py-0.5 focus-within:border-sky-400 transition">
                        <input
                          type="number"
                          min={100}
                          max={600}
                          value={patient.chol}
                          onChange={(e) => setPatient({ ...patient, chol: Math.min(600, Math.max(80, parseInt(e.target.value) || 0)) })}
                          className="w-10 bg-transparent text-right font-mono font-bold text-xs text-sky-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
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
                          className={`py-1.5 text-xs rounded-lg font-medium border transition ${
                            patient.fbs === v
                              ? "bg-sky-500/20 border-sky-400 text-sky-300"
                              : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
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
                      <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-700/80 rounded-md px-2 py-0.5 focus-within:border-sky-400 transition">
                        <input
                          type="number"
                          min={60}
                          max={220}
                          value={patient.thalch}
                          onChange={(e) => setPatient({ ...patient, thalch: Math.min(220, Math.max(50, parseInt(e.target.value) || 0)) })}
                          className="w-10 bg-transparent text-right font-mono font-bold text-xs text-sky-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Clinical Symptoms & Stress Biomarkers */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-rose-400" />
                    <h2 className="font-semibold text-sm tracking-wide text-slate-200">
                      Cardiac Stress Test & Diagnostic Markers
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Panel 2 of 2</span>
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
                          className={`p-2 text-xs rounded-lg font-medium border text-center transition leading-tight ${
                            patient.cp === t.id
                              ? "bg-rose-500/20 border-rose-400 text-rose-300"
                              : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
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
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-400"
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
                            className={`py-2 text-xs rounded-lg font-medium border transition ${
                              patient.exang === v
                                ? "bg-rose-500/20 border-rose-400 text-rose-300"
                                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
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
                      <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-700/80 rounded-md px-2 py-0.5 focus-within:border-rose-400 transition">
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={7.0}
                          value={patient.oldpeak}
                          onChange={(e) => setPatient({ ...patient, oldpeak: Math.min(7.0, Math.max(0, parseFloat(e.target.value) || 0)) })}
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
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
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
                            className={`py-2 text-[11px] font-semibold rounded-lg border transition ${
                              patient.slope === s.id
                                ? "bg-rose-500/20 border-rose-400 text-rose-300"
                                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
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
                            className={`py-2 text-xs font-bold rounded-lg border transition ${
                              patient.ca === v
                                ? "bg-rose-500/20 border-rose-400 text-rose-300"
                                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
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
                            className={`py-2 text-[11px] font-semibold rounded-lg border transition ${
                              patient.thal === th.id
                                ? "bg-rose-500/20 border-rose-400 text-rose-300"
                                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
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

            {/* Right 5 Cols: Real-Time Diagnostic Risk Cockpit */}
            <div className="lg:col-span-5 space-y-6">
              {/* Risk Gauge Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden shadow-2xl">
                {/* Background ambient glow */}
                <div
                  className="absolute -right-20 -top-20 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: result.riskColor }}
                />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>PREDICTED CAD RISK</span>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${result.riskColor}20`,
                      color: result.riskColor,
                      border: `1px solid ${result.riskColor}40`,
                    }}
                  >
                    {result.riskLevel} RISK
                  </span>
                </div>

                {/* Radial Speedometer Gauge */}
                <div className="py-2 flex justify-center">
                  <RadialGauge
                    percentage={result.percentage}
                    riskLevel={result.riskLevel}
                    riskColor={result.riskColor}
                  />
                </div>

                {/* Clinical Guideline Recommendation */}
                <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    {result.riskLevel === "HIGH" ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : result.riskLevel === "MODERATE" ? (
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>Clinical Action Protocol</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {result.clinicalAdvice}
                  </p>
                </div>

                {/* Action Buttons Row */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowPopulationModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-semibold transition-all duration-200 active:scale-[0.97]"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Compare Population
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-semibold transition-all duration-200 active:scale-[0.97]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Report
                  </button>
                </div>
              </div>

              {/* Patient Biomarker Attribution Waterfall */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
                      Biomarker Attribution Drivers
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">SHAP / Logit Impact</span>
                </div>

                <div className="pt-1">
                  <WaterfallChart contributions={result.contributions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {activeTab === "benchmark" && (
          <div className="space-y-8">
            {/* Benchmark Table */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-100">Supervised Learning Model Comparisons</h2>
                <p className="text-xs text-slate-400 mt-1">
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
                        <td className="py-3.5 px-4 text-sky-400">{m.cv_auc_mean.toFixed(4)} ± {m.cv_auc_std.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Importance Ranking */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">Global Feature Importance (Gradient Boosting)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Permutation & Gini impurity feature importances for predicting coronary artery disease.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {FEATURE_IMPORTANCES.map((f, i) => (
                  <div key={f.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">#{i + 1} {f.feature}</span>
                        <span className="text-slate-400 ml-2">({f.description})</span>
                      </div>
                      <span className="font-mono text-rose-400 font-bold">{(f.importance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full"
                        style={{ width: `${(f.importance / 0.23) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "dataset" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-slate-100">UCI Heart Disease Clinical Cohort</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                The dataset consolidates clinical databases from four leading cardiology research centers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {[
                  { name: "Cleveland Clinic Foundation", location: "Cleveland, USA", n: "303 patients" },
                  { name: "Hungarian Institute of Cardiology", location: "Budapest, Hungary", n: "294 patients" },
                  { name: "University Hospital", location: "Zurich, Switzerland", n: "123 patients" },
                  { name: "VA Medical Center", location: "Long Beach, USA", n: "200 patients" },
                ].map((site) => (
                  <div key={site.name} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <h4 className="text-xs font-bold text-slate-200">{site.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{site.location}</p>
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
                  <li><strong className="text-slate-200">0 (Healthy):</strong> &lt; 50% diameter stenosis in all major coronary vessels.</li>
                  <li><strong className="text-slate-200">1, 2, 3, 4 (Disease):</strong> &gt; 50% diameter stenosis in 1 to 4 major epicardial coronary arteries.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080a0f] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
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
