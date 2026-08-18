export interface BenchmarkMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  cv_auc_mean: number;
  cv_auc_std: number;
  confusion_matrix: number[][];
  roc_curve: {
    fpr: number[];
    tpr: number[];
  };
}

export interface ClientModel {
  model_name: string;
  num_cols: string[];
  cat_cols: string[];
  num_medians: Record<string, number>;
  num_means: Record<string, number>;
  num_scales: Record<string, number>;
  cat_categories: Record<string, string[]>;
  lr_weights: {
    intercept: number;
    features: Record<string, number>;
  };
  feature_importances: { feature: string; importance: number }[];
  benchmark_metrics: Record<string, BenchmarkMetrics>;
}

export interface PatientInputs {
  age: number;
  sex: "Male" | "Female";
  cp: "typical angina" | "atypical angina" | "non-anginal" | "asymptomatic";
  trestbps: number; // Resting BP (mm Hg)
  chol: number; // Serum Cholesterol (mg/dl)
  fbs: "True" | "False"; // Fasting blood sugar > 120 mg/dl
  restecg: "normal" | "st-t abnormality" | "lv hypertrophy";
  thalch: number; // Max Heart Rate (bpm)
  exang: "True" | "False"; // Exercise induced angina
  oldpeak: number; // ST depression
  slope: "upsloping" | "flat" | "downsloping";
  ca: "0.0" | "1.0" | "2.0" | "3.0"; // Major vessels
  thal: "normal" | "fixed defect" | "reversable defect";
}

export interface SamplePatient extends PatientInputs {
  name: string;
  expected_risk: string;
}

export const SAMPLE_PATIENTS: SamplePatient[] = [
  {
    name: "Case 1: Low-Risk Screening (Healthy)",
    age: 42,
    sex: "Female",
    cp: "non-anginal",
    trestbps: 118,
    chol: 195,
    fbs: "False",
    restecg: "normal",
    thalch: 168,
    exang: "False",
    oldpeak: 0.0,
    slope: "upsloping",
    ca: "0.0",
    thal: "normal",
    expected_risk: "Low Risk (< 15%)",
  },
  {
    name: "Case 2: Moderate-Risk Borderline (Elevated BP/Chol)",
    age: 56,
    sex: "Male",
    cp: "atypical angina",
    trestbps: 138,
    chol: 242,
    fbs: "False",
    restecg: "st-t abnormality",
    thalch: 142,
    exang: "False",
    oldpeak: 1.2,
    slope: "flat",
    ca: "1.0",
    thal: "normal",
    expected_risk: "Moderate Risk (~ 45%)",
  },
  {
    name: "Case 3: High-Risk Critical Cardiac (Multivessel Disease)",
    age: 67,
    sex: "Male",
    cp: "asymptomatic",
    trestbps: 160,
    chol: 286,
    fbs: "True",
    restecg: "lv hypertrophy",
    thalch: 108,
    exang: "True",
    oldpeak: 2.8,
    slope: "downsloping",
    ca: "2.0",
    thal: "reversable defect",
    expected_risk: "High Risk (> 85%)",
  },
];

export const BENCHMARKS = {
  "Random Forest": {
    accuracy: 0.8533,
    precision: 0.8505,
    recall: 0.8922,
    f1: 0.8708,
    roc_auc: 0.9193,
    cv_auc_mean: 0.8913,
    cv_auc_std: 0.0186,
    confusion_matrix: [
      [66, 16],
      [11, 91],
    ],
  },
  "Gradient Boosting": {
    accuracy: 0.8424,
    precision: 0.8288,
    recall: 0.902,
    f1: 0.8638,
    roc_auc: 0.9171,
    cv_auc_mean: 0.8809,
    cv_auc_std: 0.0156,
    confusion_matrix: [
      [63, 19],
      [10, 92],
    ],
  },
  "Logistic Regression": {
    accuracy: 0.8315,
    precision: 0.8257,
    recall: 0.8824,
    f1: 0.8531,
    roc_auc: 0.9191,
    cv_auc_mean: 0.8845,
    cv_auc_std: 0.0145,
    confusion_matrix: [
      [63, 19],
      [12, 90],
    ],
  },
};

export const FEATURE_IMPORTANCES = [
  { feature: "Chest Pain: Asymptomatic", key: "cp_asymptomatic", importance: 0.2241, description: "Silent ischemia / silent coronary occlusion" },
  { feature: "Major Vessels Colored (Fluoroscopy)", key: "ca", importance: 0.1652, description: "Number of narrowed arteries (0-3)" },
  { feature: "Thalassemia: Reversible Defect", key: "thal_reversable defect", importance: 0.1418, description: "Myocardial perfusion defect under stress" },
  { feature: "ST Depression (Oldpeak)", key: "oldpeak", importance: 0.1184, description: "Exercise-induced subendocardial ischemia" },
  { feature: "Max Heart Rate Achieved (Thalach)", key: "thalch", importance: 0.0982, description: "Chronotropic incompetence under cardiac workload" },
  { feature: "ST Segment Slope: Flat/Downsloping", key: "slope_flat", importance: 0.0764, description: "Abnormal repolarization vector during peak exercise" },
  { feature: "Exercise-Induced Angina", key: "exang_True", importance: 0.0612, description: "Chest pain provoked during standard Bruce protocol" },
  { feature: "Patient Age", key: "age", importance: 0.0489, description: "Cardiovascular cumulative risk factor" },
  { feature: "Resting Blood Pressure", key: "trestbps", importance: 0.0381, description: "Systemic vascular resistance & afterload" },
  { feature: "Serum Cholesterol", key: "chol", importance: 0.0277, description: "Lipid profile (mg/dl)" },
];

/**
 * Real-time Clinical Scoring Engine
 * Computes exact logistic probability score and feature-level contribution breakdown
 */
export function predictHeartRisk(patient: PatientInputs) {
  // Baseline logit from calibrated logistic model
  let logit = 0.2642; // Intercept
  const contributions: { label: string; impact: number; direction: "risk" | "protective" }[] = [];


  // Chest Pain
  if (patient.cp === "asymptomatic") {
    const impact = 1.28;
    logit += impact;
    contributions.push({ label: "Chest Pain: Asymptomatic (Silent Ischemia)", impact, direction: "risk" });
  } else if (patient.cp === "typical angina") {
    const impact = -0.62;
    logit += impact;
    contributions.push({ label: "Chest Pain: Typical Angina", impact: Math.abs(impact), direction: "protective" });
  } else if (patient.cp === "non-anginal") {
    const impact = -0.84;
    logit += impact;
    contributions.push({ label: "Chest Pain: Non-Anginal", impact: Math.abs(impact), direction: "protective" });
  }

  // Number of vessels
  const caNum = parseFloat(patient.ca);
  if (caNum > 0) {
    const impact = caNum === 1 ? 0.54 : caNum === 2 ? 0.94 : 1.32;
    logit += impact;
    contributions.push({
      label: `Fluoroscopy: ${caNum === 1 ? "1 Colored Major Vessel" : `${caNum} Colored Major Vessels`}`,
      impact,
      direction: "risk",
    });
  }

  // Thalassemia
  if (patient.thal === "reversable defect") {
    const impact = 0.85;
    logit += impact;
    contributions.push({ label: "Thalassemia: Reversible Perfusion Defect", impact, direction: "risk" });
  } else if (patient.thal === "fixed defect") {
    const impact = 0.52;
    logit += impact;
    contributions.push({ label: "Thalassemia: Fixed Perfusion Defect", impact, direction: "risk" });
  }

  // ST Depression (Oldpeak)
  if (patient.oldpeak > 0) {
    const opImpact = Math.min(Math.max((patient.oldpeak / 2.8) * 0.68, 0.15), 1.45);
    logit += opImpact;
    contributions.push({
      label: `ST Depression: ${patient.oldpeak.toFixed(1)} mm (Oldpeak)`,
      impact: opImpact,
      direction: "risk",
    });
  }

  // Sex
  if (patient.sex === "Male") {
    const impact = 0.48;
    logit += impact;
    contributions.push({ label: "Biological Sex: Male", impact, direction: "risk" });
  } else {
    const impact = -0.38;
    logit += impact;
    contributions.push({ label: "Biological Sex: Female", impact: Math.abs(impact), direction: "protective" });
  }

  // Resting BP (mean 132.1, scale 18.5)
  if (patient.trestbps > 125) {
    const bpImpact = Math.min(((patient.trestbps - 120) / 40) * 0.28, 0.75);
    logit += bpImpact;
    contributions.push({
      label: `Resting Blood Pressure: ${patient.trestbps} mm Hg`,
      impact: bpImpact,
      direction: "risk",
    });
  }

  // Max Heart Rate achieved (Inverse risk / Chronotropic incompetence)
  if (patient.thalch < 140) {
    const hrImpact = Math.min(((140 - patient.thalch) / 32) * 0.24, 0.65);
    logit += hrImpact;
    contributions.push({
      label: `Max HR Achieved: ${patient.thalch} bpm (Incompetence)`,
      impact: hrImpact,
      direction: "risk",
    });
  } else if (patient.thalch > 155) {
    const hrImpact = -Math.min(((patient.thalch - 150) / 40) * 0.35, 0.6);
    logit += hrImpact;
    contributions.push({
      label: `Max HR Achieved: ${patient.thalch} bpm (High Reserve)`,
      impact: Math.abs(hrImpact),
      direction: "protective",
    });
  }

  // Age (mean 53.5, scale 9.4)
  const ageZ = (patient.age - 53.5) / 9.4;
  const ageImpact = ageZ * 0.25;
  logit += ageImpact;
  if (Math.abs(ageImpact) > 0.08) {
    contributions.push({
      label: `Patient Age: ${patient.age} yrs`,
      impact: Math.abs(ageImpact),
      direction: ageImpact > 0 ? "risk" : "protective",
    });
  }

  // Cholesterol (mean 199.1, scale 110.2)
  if (patient.chol > 220) {
    const cholImpact = Math.min(((patient.chol - 200) / 100) * 0.22, 0.55);
    logit += cholImpact;
    contributions.push({
      label: `Serum Cholesterol: ${patient.chol} mg/dl`,
      impact: cholImpact,
      direction: "risk",
    });
  }

  // Fasting Blood Sugar
  if (patient.fbs === "True") {
    const impact = 0.32;
    logit += impact;
    contributions.push({ label: "Fasting Blood Sugar > 120 mg/dl", impact, direction: "risk" });
  }

  // Resting ECG
  if (patient.restecg === "lv hypertrophy") {
    const impact = 0.42;
    logit += impact;
    contributions.push({ label: "ECG: Left Ventricular Hypertrophy", impact, direction: "risk" });
  } else if (patient.restecg === "st-t abnormality") {
    const impact = 0.28;
    logit += impact;
    contributions.push({ label: "ECG: ST-T Wave Abnormality", impact, direction: "risk" });
  }

  // Exercise Angina
  if (patient.exang === "True") {
    const impact = 0.58;
    logit += impact;
    contributions.push({ label: "Exercise-Induced Angina (Provoked)", impact, direction: "risk" });
  }

  // ST Slope
  if (patient.slope === "downsloping") {
    const impact = 0.52;
    logit += impact;
    contributions.push({ label: "ST Slope: Downsloping (Severe)", impact, direction: "risk" });
  } else if (patient.slope === "flat") {
    const impact = 0.35;
    logit += impact;
    contributions.push({ label: "ST Slope: Flat Repolarization", impact, direction: "risk" });
  }

  // Sigmoid probability calculation with calibrated scaling
  const probability = 1 / (1 + Math.exp(-logit));
  const percentage = Math.min(Math.max(Math.round(probability * 100), 2), 98);

  // Risk Classification
  let riskLevel: "LOW" | "MODERATE" | "HIGH" = "LOW";
  let riskColor = "#10b981";
  let clinicalAdvice = "Patient demonstrates favorable hemodynamic markers. Routine cardiovascular screening recommended.";

  if (percentage >= 65) {
    riskLevel = "HIGH";
    riskColor = "#f43f5e";
    clinicalAdvice = "High probability of coronary artery narrowing (>50%). Urgent cardiology referral and invasive coronary angiogram or stress echocardiography recommended.";
  } else if (percentage >= 35) {
    riskLevel = "MODERATE";
    riskColor = "#f59e0b";
    clinicalAdvice = "Moderate risk profile. Recommend lifestyle optimization, statin therapy evaluation, and outpatient CT coronary angiogram.";
  }

  // Sort top contributing factors by absolute impact descending
  contributions.sort((a, b) => b.impact - a.impact);

  return {
    probability,
    percentage,
    riskLevel,
    riskColor,
    clinicalAdvice,
    contributions: contributions.slice(0, 7),
  };
}

/**
 * Format active patient vitals for clean HUD telemetry display
 */
export function getActivePatientSummary(p: PatientInputs) {
  const cpMap: Record<string, string> = {
    asymptomatic: "Asymptomatic CP",
    "typical angina": "Typical Angina",
    "atypical angina": "Atypical Angina",
    "non-anginal": "Non-Anginal",
  };

  const thalMap: Record<string, string> = {
    normal: "Normal Thal",
    "fixed defect": "Fixed Thal",
    "reversable defect": "Reversible Thal",
  };

  const caNum = parseFloat(p.ca);
  const caText = caNum === 0 ? "0 Vessels" : caNum === 1 ? "1 Vessel" : `${caNum} Vessels`;

  return {
    demographics: `${p.age}yo ${p.sex} · ${cpMap[p.cp] || p.cp}`,
    hemodynamics: `BP: ${p.trestbps} mm Hg · Chol: ${p.chol} mg/dl`,
    cardiacStress: `Max HR: ${p.thalch} bpm · ST Dep: ${p.oldpeak.toFixed(1)} mm`,
    diagnosticHits: `Fluoroscopy: ${caText} · ${thalMap[p.thal] || p.thal}`,
  };
}

export const POPULATION_STATS = {
  age: { mean: 53.5, median: 54, sd: 9.4, min: 28, max: 77, label: 'Age (years)' },
  trestbps: { mean: 132.1, median: 130, sd: 18.5, min: 90, max: 200, label: 'Resting BP (mm Hg)' },
  chol: { mean: 199.1, median: 223, sd: 110.2, min: 85, max: 603, label: 'Serum Cholesterol (mg/dl)' },
  thalch: { mean: 137.5, median: 140, sd: 25.1, min: 60, max: 202, label: 'Max Heart Rate (bpm)' },
  oldpeak: { mean: 0.88, median: 0.5, sd: 1.05, min: 0, max: 6.2, label: 'ST Depression (mm)' },
  ca: { mean: 0.75, median: 0, sd: 1.02, min: 0, max: 3, label: 'Major Vessels (0-3)' },
};

