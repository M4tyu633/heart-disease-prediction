"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  FileText,
  Heart,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { PatientInputs } from "@/data/modelData";

export interface ClinicalReportProps {
  patient: PatientInputs;
  result: {
    percentage: number;
    riskLevel: "LOW" | "MODERATE" | "HIGH";
    riskColor: string;
    clinicalAdvice: string;
    contributions: {
      label: string;
      impact: number;
      direction: "risk" | "protective";
    }[];
  };
}

/**
 * Global print handler triggering native browser print engine
 */
export function handlePrint() {
  if (typeof window !== "undefined") {
    window.print();
  }
}

/**
 * Interactive UI Trigger Button for generating/printing clinical report
 */
export function PrintReportButton({
  onClick = handlePrint,
  className = "",
  label = "Generate Clinical Report",
}: {
  onClick?: () => void;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border border-rose-500/30 shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-all cursor-pointer ${className}`}
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

/**
 * Print-Optimized Clinical Report Component
 * Hidden on regular screen view, cleanly styled in black/white with print-safe accents for paper/PDF output
 */
export default function ClinicalReport({ patient, result }: ClinicalReportProps) {
  const [reportDate, setReportDate] = useState<string>("");
  const [reportId, setReportId] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setReportDate(
      now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    // Generate deterministic-looking clinical reference ID
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    setReportId(`CS-CAD-${now.getFullYear()}-${randomHex}`);
  }, []);

  const getPrintRiskBadgeStyle = () => {
    if (result.riskLevel === "HIGH") {
      return {
        bg: "#fee2e2",
        border: "#dc2626",
        text: "#991b1b",
      };
    }
    if (result.riskLevel === "MODERATE") {
      return {
        bg: "#fef3c7",
        border: "#d97706",
        text: "#92400e",
      };
    }
    return {
      bg: "#d1fae5",
      border: "#059669",
      text: "#065f46",
    };
  };

  const badgeStyle = getPrintRiskBadgeStyle();

  return (
    <>
      {/* Embedded print stylesheet */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body {
                background: #ffffff !important;
                color: #0f172a !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              @page {
                margin: 12mm 15mm 15mm 15mm;
                size: A4 portrait;
              }
              .clinical-report-root {
                display: block !important;
              }
            }
          `,
        }}
      />

      {/* Hidden print container */}
      <div
        className="clinical-report-root hidden print:block bg-white text-slate-900 font-sans p-2 max-w-4xl mx-auto"
        id="clinical-printable-report"
      >
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                  CardioSense AI
                </h1>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Clinical Risk Assessment Report
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Coronary Artery Disease (CAD) Machine Learning Risk Stratification Engine
            </p>
          </div>

          <div className="text-right text-xs space-y-1 font-mono">
            <div>
              <span className="text-slate-500">Report Ref: </span>
              <strong className="text-slate-900">{reportId || "CS-CAD-2025-001"}</strong>
            </div>
            <div>
              <span className="text-slate-500">Date: </span>
              <span className="text-slate-800">{reportDate || "March 15, 2025"}</span>
            </div>
            <div>
              <span className="text-slate-500">Cohort Basis: </span>
              <span className="text-slate-800">UCI Multi-Center (N=920)</span>
            </div>
          </div>
        </div>

        {/* Executive Risk Stratification Banner */}
        <div
          className="p-4 rounded-xl mb-6 flex items-center justify-between border-2"
          style={{
            backgroundColor: badgeStyle.bg,
            borderColor: badgeStyle.border,
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {result.riskLevel === "HIGH" ? (
                <AlertTriangle className="w-5 h-5 text-red-700" />
              ) : result.riskLevel === "MODERATE" ? (
                <TrendingUp className="w-5 h-5 text-amber-700" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              )}
              <span
                className="text-xs font-black tracking-widest uppercase"
                style={{ color: badgeStyle.text }}
              >
                Diagnostic CAD Classification
              </span>
            </div>
            <div className="text-2xl font-black tracking-tight" style={{ color: badgeStyle.text }}>
              {result.riskLevel} RISK PROFILE
            </div>
            <p className="text-xs font-medium text-slate-800">
              Estimated probability of coronary artery stenosis &gt; 50%
            </p>
          </div>

          <div className="text-right">
            <div
              className="text-4xl font-black font-mono tracking-tight"
              style={{ color: badgeStyle.text }}
            >
              {result.percentage}%
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Predicted Likelihood
            </span>
          </div>
        </div>

        {/* Section: Patient Demographics & Clinical Profile */}
        <div className="mb-6 space-y-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-700" />
            Patient Clinical Demographics & Baseline Parameters
          </h2>

          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-slate-50/80">
                  <td className="py-2 px-3 font-semibold text-slate-700 w-1/4">
                    Age & Biological Sex:
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-900 w-1/4">
                    {patient.age} years · {patient.sex}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-700 w-1/4">
                    Chest Pain Type (cp):
                  </td>
                  <td className="py-2 px-3 text-slate-900 capitalize w-1/4">
                    {patient.cp}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-700">
                    Resting Blood Pressure:
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-900">
                    {patient.trestbps} mm Hg
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-700">
                    Resting ECG:
                  </td>
                  <td className="py-2 px-3 text-slate-900 capitalize">
                    {patient.restecg}
                  </td>
                </tr>

                <tr className="bg-slate-50/80">
                  <td className="py-2 px-3 font-semibold text-slate-700">
                    Serum Cholesterol:
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-900">
                    {patient.chol} mg/dl
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-700">
                    Exercise Induced Angina:
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-900">
                    {patient.exang === "True" ? "Yes (Positive)" : "No (Negative)"}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-700">
                    Fasting Blood Sugar &gt; 120:
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-900">
                    {patient.fbs === "True" ? "Yes (> 120 mg/dl)" : "No (Normal)"}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-700">
                    ST Depression (oldpeak):
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-900">
                    {patient.oldpeak.toFixed(1)} mm
                  </td>
                </tr>

                <tr className="bg-slate-50/80">
                  <td className="py-2 px-3 font-semibold text-slate-700">
                    Max Heart Rate Achieved:
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-900">
                    {patient.thalch} bpm
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-700">
                    Peak ST Segment Slope:
                  </td>
                  <td className="py-2 px-3 text-slate-900 capitalize">
                    {patient.slope}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-700">
                    Fluoroscopy Vessels (ca):
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-900">
                    {patient.ca} Major Vessels Colored
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-700">
                    Thalassemia Scan:
                  </td>
                  <td className="py-2 px-3 text-slate-900 capitalize">
                    {patient.thal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Top Biomarker Contributors */}
        <div className="mb-6 space-y-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
            Top Biomarker Attribution Drivers (Logit / Odds Impact)
          </h2>

          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                <tr>
                  <th className="py-2 px-3 w-12 font-semibold">Rank</th>
                  <th className="py-2 px-3 font-semibold">Biomarker / Clinical Factor</th>
                  <th className="py-2 px-3 w-32 font-semibold">Effect Direction</th>
                  <th className="py-2 px-3 w-28 text-right font-semibold">Attribution Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {result.contributions.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/60" : ""}>
                    <td className="py-2 px-3 font-mono text-slate-500 font-semibold">
                      #{idx + 1}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {item.label}
                    </td>
                    <td className="py-2 px-3">
                      {item.direction === "risk" ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700 text-[11px]">
                          ▲ Risk Elevating
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-[11px]">
                          ▼ Protective Factor
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {item.direction === "risk" ? "+" : "-"}
                      {item.impact.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Clinical Recommendation */}
        <div className="mb-6 space-y-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
            Clinical Recommendation & Suggested Next Steps
          </h2>
          <div className="p-4 rounded-lg bg-slate-50 border-l-4 border-slate-900 text-slate-800 text-xs leading-relaxed space-y-1">
            <div className="font-bold text-slate-950">Action Protocol:</div>
            <p>{result.clinicalAdvice}</p>
          </div>
        </div>

        {/* Clinician Review & Sign-off */}
        <div className="grid grid-cols-2 gap-8 pt-4 pb-6 border-t border-slate-300 text-xs">
          <div className="space-y-6">
            <div className="text-slate-500 font-semibold uppercase text-[10px]">
              Attending Clinician / Reviewer:
            </div>
            <div className="border-b border-slate-400 w-3/4 pt-4" />
            <div className="text-slate-500 text-[11px]">Signature / Stamp</div>
          </div>
          <div className="space-y-6">
            <div className="text-slate-500 font-semibold uppercase text-[10px]">
              Review Date & Action Initiated:
            </div>
            <div className="border-b border-slate-400 w-3/4 pt-4" />
            <div className="text-slate-500 text-[11px]">Date / Facility ID</div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="border-t-2 border-slate-900 pt-3 text-[10px] text-slate-500 leading-tight">
          <p>
            <strong>Disclaimer:</strong> This report is generated by an AI model trained on the
            UCI Heart Disease dataset (920 patients). It is intended for educational and research
            purposes only and should not replace professional medical evaluation.
          </p>
        </div>
      </div>
    </>
  );
}
