"use client";
import { useMemo, useState } from "react";
import type { PatientInputs } from "@/data/modelData";
import {
  benchmarks,
  cohortExamples,
  labels,
  scoreInputs,
} from "@/data/inference";

const numericFields: {
  key: keyof PatientInputs;
  min: number;
  max: number;
  step: number;
  unit: string;
}[] = [
  { key: "age", min: 18, max: 100, step: 1, unit: "years" },
  { key: "trestbps", min: 80, max: 220, step: 1, unit: "mm Hg" },
  { key: "chol", min: 80, max: 650, step: 1, unit: "mg/dL" },
  { key: "thalch", min: 60, max: 220, step: 1, unit: "bpm" },
  { key: "oldpeak", min: 0, max: 6.2, step: 0.1, unit: "mm" },
];
const categories: { key: keyof PatientInputs; options: [string, string][] }[] =
  [
    {
      key: "sex",
      options: [
        ["Male", "Male"],
        ["Female", "Female"],
      ],
    },
    {
      key: "cp",
      options: [
        ["typical angina", "Typical angina"],
        ["atypical angina", "Atypical angina"],
        ["non-anginal", "Non-anginal"],
        ["asymptomatic", "Asymptomatic"],
      ],
    },
    {
      key: "fbs",
      options: [
        ["False", "No"],
        ["True", "Yes"],
      ],
    },
    {
      key: "restecg",
      options: [
        ["normal", "Normal"],
        ["st-t abnormality", "ST-T abnormality"],
        ["lv hypertrophy", "LV hypertrophy"],
      ],
    },
    {
      key: "exang",
      options: [
        ["False", "No"],
        ["True", "Yes"],
      ],
    },
    {
      key: "slope",
      options: [
        ["upsloping", "Upsloping"],
        ["flat", "Flat"],
        ["downsloping", "Downsloping"],
      ],
    },
    {
      key: "ca",
      options: [
        ["0.0", "0"],
        ["1.0", "1"],
        ["2.0", "2"],
        ["3.0", "3"],
      ],
    },
    {
      key: "thal",
      options: [
        ["normal", "Normal"],
        ["fixed defect", "Fixed defect"],
        ["reversable defect", "Reversible defect"],
      ],
    },
  ];
export default function CardioSense() {
  const [example, setExample] = useState(0);
  const [inputs, setInputs] = useState<PatientInputs>({
    ...cohortExamples[0].inputs,
  });
  const [edited, setEdited] = useState(false);
  const [changed, setChanged] = useState<keyof PatientInputs | null>(null);
  const result = useMemo(() => scoreInputs(inputs), [inputs]);
  const baseline = useMemo(
    () => scoreInputs(cohortExamples[example].inputs),
    [example],
  );
  const delta = (result.probability - baseline.probability) * 100;
  const sorted = [...result.terms].sort(
    (a, b) => Math.abs(b.impact) - Math.abs(a.impact),
  );
  const max = Math.max(1, ...sorted.map((t) => Math.abs(t.impact)));
  function update(key: keyof PatientInputs, value: string | number) {
    setInputs((p) => ({ ...p, [key]: value }));
    setEdited(true);
    setChanged(key);
  }
  function load(index: number) {
    setExample(index);
    setInputs({ ...cohortExamples[index].inputs });
    setEdited(false);
    setChanged(null);
  }
  return (
    <>
      <header className="cs-nav">
        <a className="cs-brand" href="#station">
          Cardio<span>Sense</span>
          <small>Risk instrument / 01</small>
        </a>
        <nav aria-label="Main">
          <a href="#station">Instrument</a>
          <a href="#validation">Model & evidence</a>
          <a href="https://matthewlabrador.vercel.app/">Portfolio ↗</a>
        </nav>
      </header>
      <main id="station">
        <div className="cs-intro">
          <div>
            <p className="cs-label">
              UCI Heart Disease / Research demonstration
            </p>
            <h1>What moved the score?</h1>
            <p>
              Change a biomarker. Follow its contribution through to the model
              output.
            </p>
          </div>
          <span className="local-badge">● Computed in your browser</span>
        </div>
        <div className="cs-source">
          <div>
            <strong>
              {edited ? "Modified inputs" : cohortExamples[example].label}
            </strong>
            <span>
              {edited
                ? `Hypothetical variation of ${cohortExamples[example].label.toLowerCase()}`
                : cohortExamples[example].source}
            </span>
          </div>
          <div className="example-controls">
            {cohortExamples.map((e, i) => (
              <button
                key={e.label}
                aria-pressed={example === i && !edited}
                onClick={() => load(i)}
              >
                {e.label}
              </button>
            ))}
            <button onClick={() => load(example)}>Reset inputs</button>
          </div>
        </div>
        <div className="cs-instrument">
          <section className="cs-inputs" aria-labelledby="inputs-title">
            <div className="panel-heading">
              <span>01 / Input</span>
              <h2 id="inputs-title">Biomarkers</h2>
            </div>
            <div className="numeric-inputs">
              {numericFields.map((f) => (
                <label
                  key={f.key}
                  className={changed === f.key ? "changed" : ""}
                >
                  <span>{labels[f.key]}</span>
                  <div>
                    <input
                      aria-label={labels[f.key]}
                      type="number"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={Number(inputs[f.key])}
                      onChange={(e) => {
                        if (
                          e.target.value !== "" &&
                          Number.isFinite(e.target.valueAsNumber)
                        )
                          update(
                            f.key,
                            Math.min(
                              f.max,
                              Math.max(f.min, e.target.valueAsNumber),
                            ),
                          );
                      }}
                    />
                    <small>{f.unit}</small>
                  </div>
                  <input
                    aria-label={`${labels[f.key]} slider`}
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={Number(inputs[f.key])}
                    onChange={(e) => update(f.key, Number(e.target.value))}
                  />
                </label>
              ))}
            </div>
            <details className="diagnostic-inputs" open>
              <summary>Diagnostic markers</summary>
              <div>
                {categories.map((f) => (
                  <label key={f.key}>
                    <span>{labels[f.key]}</span>
                    <select
                      aria-label={labels[f.key]}
                      value={String(inputs[f.key])}
                      onChange={(e) => update(f.key, e.target.value)}
                    >
                      {f.options.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </details>
          </section>
          <section
            className="cs-attribution"
            aria-labelledby="contribution-title"
          >
            <div className="panel-heading">
              <span>02 / Attribution</span>
              <h2 id="contribution-title">Every term, accounted for.</h2>
            </div>
            <p className="chart-note">
              Signed contributions to log-odds. Left lowers the score; right
              raises it.
            </p>
            <div className="driver-axis">
              <span>← Lower</span>
              <span>0</span>
              <span>Higher →</span>
            </div>
            <ol className="drivers">
              {sorted.map((t) => (
                <li
                  key={t.key}
                  className={changed === t.key ? "active-driver" : ""}
                >
                  <div>
                    <span>{t.label}</span>
                    <strong>
                      {t.impact >= 0 ? "+" : ""}
                      {t.impact.toFixed(3)}
                    </strong>
                  </div>
                  <div className="driver-track">
                    <span
                      style={{
                        left:
                          t.impact >= 0
                            ? "50%"
                            : `${50 - (Math.abs(t.impact) / max) * 48}%`,
                        width: `${(Math.abs(t.impact) / max) * 48}%`,
                      }}
                      className={t.impact >= 0 ? "positive" : "negative"}
                    />
                  </div>
                </li>
              ))}
            </ol>
            <div className="logit-equation">
              <span>Intercept {result.intercept.toFixed(3)}</span>
              <span>
                + terms {(result.logit - result.intercept).toFixed(3)}
              </span>
              <strong>= logit {result.logit.toFixed(3)}</strong>
            </div>
            <p className="chart-note">
              Exact additive terms from the exported coefficients. These are not
              SHAP values or causal effects.
            </p>
          </section>
          <aside className="cs-output" aria-labelledby="output-title">
            <div className="panel-heading">
              <span>03 / Output</span>
              <h2 id="output-title">Model probability</h2>
            </div>
            <div className="probability" aria-live="polite">
              <strong>{(result.probability * 100).toFixed(1)}</strong>
              <span>%</span>
            </div>
            <p className="output-target">
              UCI disease target
              <br />
              <span>Angiographic narrowing &gt;50%</span>
            </p>
            <div className="probability-track">
              <span style={{ width: `${result.probability * 100}%` }} />
            </div>
            <div className="probability-scale">
              <span>0%</span>
              <span>100%</span>
            </div>
            <div className="score-change">
              <strong>
                {delta > 0 ? "+" : ""}
                {delta.toFixed(1)} <small>pp</small>
              </strong>
              <span>from the selected UCI example</span>
            </div>
            <p className="current-change">
              {changed
                ? `Last changed: ${labels[changed]}`
                : "Move an input to inspect the change."}
            </p>
            <div className="model-identity">
              <span>Logistic Regression</span>
              <p>
                Saved preprocessing + exported coefficients. No server request.
              </p>
            </div>
            <p className="research-note">
              A research model on a historical cohort. This score is not a
              diagnosis, treatment recommendation, or estimate of future cardiac
              events.
            </p>
          </aside>
        </div>
        <section id="validation" className="cs-validation">
          <div>
            <p className="cs-label">Evidence / Separate from the live score</p>
            <h2>The model behind the instrument.</h2>
            <p>
              The browser uses the Logistic Regression export from this
              repository. The research compared three classifiers on the
              920-record, four-hospital UCI dataset. Holdout results and
              cross-validation results are reported separately.
            </p>
            <p>
              The export stores coefficients rounded to four decimals. Local
              attribution shows standardized numeric terms and active one-hot
              categorical terms; it does not run the tree models or a SHAP
              explainer.
            </p>
            <a href="https://github.com/M4tyu633/heart-disease-prediction">
              Inspect the source & training pipeline ↗
            </a>
          </div>
          <div className="benchmark-list">
            {Object.entries(benchmarks).map(([name, m]) => (
              <article key={name}>
                <h3>{name}</h3>
                <dl>
                  <div>
                    <dt>Holdout AUC</dt>
                    <dd>{m.roc_auc.toFixed(3)}</dd>
                  </div>
                  <div>
                    <dt>Recall</dt>
                    <dd>{(m.recall * 100).toFixed(1)}%</dd>
                  </div>
                  <div>
                    <dt>5-fold CV AUC</dt>
                    <dd>
                      {m.cv_auc_mean.toFixed(3)} ± {m.cv_auc_std.toFixed(3)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </main>
      <div className="mobile-result" aria-live="polite">
        <span>
          {changed ? labels[changed] : "Model probability"}
          <small>
            {changed
              ? `Contribution ${result.terms.find((t) => t.key === changed)!.impact.toFixed(3)} log-odds`
              : "Logistic Regression · Research demo"}
          </small>
        </span>
        <strong>{(result.probability * 100).toFixed(1)}%</strong>
      </div>
      <footer className="cs-footer">
        <span>CardioSense / Matthew Labrador</span>
        <a href="https://matthewlabrador.vercel.app/work/heart-disease-prediction">
          The project story ↗
        </a>
      </footer>
    </>
  );
}
