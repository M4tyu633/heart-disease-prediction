import artifact from "../../models/client_model.json";
import type { PatientInputs } from "./modelData";

export const labels: Record<keyof PatientInputs, string> = {
  age: "Age",
  sex: "Sex",
  cp: "Chest pain",
  trestbps: "Resting blood pressure",
  chol: "Serum cholesterol",
  fbs: "Fasting glucose > 120 mg/dL",
  restecg: "Resting ECG",
  thalch: "Maximum heart rate",
  exang: "Exercise-induced angina",
  oldpeak: "ST depression",
  slope: "ST slope",
  ca: "Fluoroscopy vessels",
  thal: "Thallium perfusion",
};

/** Same standardization and one-hot encoding as train.py, using its saved
 * four-decimal coefficients. These are additive logit terms, not SHAP values.
 * The historical hand-coded demo remains in modelData.ts for provenance. */
export function scoreInputs(inputs: PatientInputs) {
  const weights = artifact.lr_weights.features as Record<string, number>;
  const means = artifact.num_means as Record<string, number>;
  const scales = artifact.num_scales as Record<string, number>;
  const terms = (Object.keys(labels) as (keyof PatientInputs)[]).map((key) => {
    const value = inputs[key];
    const numeric = artifact.num_cols.includes(key);
    const encoded = numeric ? key : `${key}_${value}`;
    const standardized = numeric
      ? (Number(value) - means[key]) / scales[key]
      : 1;
    return {
      key,
      label: labels[key],
      value,
      impact: standardized * (weights[encoded] ?? 0),
    };
  });
  const intercept = artifact.lr_weights.intercept;
  const logit = terms.reduce((sum, t) => sum + t.impact, intercept);
  return { intercept, logit, probability: 1 / (1 + Math.exp(-logit)), terms };
}

/** Actual complete rows 1 and 5 from data/heart_disease_uci.csv. No invented
 * patient identities or generated records. Edits become hypothetical inputs. */
export const cohortExamples: {
  label: string;
  source: string;
  inputs: PatientInputs;
}[] = [
  {
    label: "UCI record 1",
    source: "Cleveland · dataset record 1",
    inputs: {
      age: 63,
      sex: "Male",
      cp: "typical angina",
      trestbps: 145,
      chol: 233,
      fbs: "True",
      restecg: "lv hypertrophy",
      thalch: 150,
      exang: "False",
      oldpeak: 2.3,
      slope: "downsloping",
      ca: "0.0",
      thal: "fixed defect",
    },
  },
  {
    label: "UCI record 5",
    source: "Cleveland · dataset record 5",
    inputs: {
      age: 41,
      sex: "Female",
      cp: "atypical angina",
      trestbps: 130,
      chol: 204,
      fbs: "False",
      restecg: "lv hypertrophy",
      thalch: 172,
      exang: "False",
      oldpeak: 1.4,
      slope: "upsloping",
      ca: "0.0",
      thal: "normal",
    },
  },
];
export const benchmarks = artifact.benchmark_metrics;
