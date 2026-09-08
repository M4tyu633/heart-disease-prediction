// Run with node scripts/check-inference.cjs. Independent Python summation of the
// saved export supplies the golden values; no model training or API calls.
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const ts = require("typescript");
const artifact = require("../models/client_model.json");
const source = fs.readFileSync(
  require.resolve("../src/data/inference.ts"),
  "utf8",
);
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const exportsObject = {};
vm.runInNewContext(js, { exports: exportsObject, require: () => artifact });
const { scoreInputs, cohortExamples } = exportsObject;
const expected = [0.5373962384423067, 0.025246208409483446];
for (let i = 0; i < 2; i++) {
  const result = scoreInputs(cohortExamples[i].inputs);
  assert.ok(Math.abs(result.probability - expected[i]) < 1e-12);
  assert.equal(result.terms.length, 13);
  assert.ok(
    Math.abs(
      result.intercept +
        result.terms.reduce((s, t) => s + t.impact, 0) -
        result.logit,
    ) < 1e-12,
  );
}
const initial = scoreInputs(cohortExamples[0].inputs);
const changed = scoreInputs({ ...cohortExamples[0].inputs, oldpeak: 3.3 });
assert.ok(changed.probability > initial.probability);
assert.ok(
  Math.abs(
    changed.logit -
      initial.logit -
      artifact.lr_weights.features.oldpeak / artifact.num_scales.oldpeak,
  ) < 1e-12,
);
for (const [key, values] of Object.entries(artifact.cat_categories)) {
  for (const raw of values) {
    const value =
      typeof raw === "boolean"
        ? raw
          ? "True"
          : "False"
        : key === "ca"
          ? Number(raw).toFixed(1)
          : String(raw);
    const actual = scoreInputs({
      ...cohortExamples[0].inputs,
      [key]: value,
    }).terms.find((t) => t.key === key).impact;
    assert.equal(actual, artifact.lr_weights.features[`${key}_${value}`]);
  }
}
// Confirm displayed cohort examples match actual CSV rows, rather than presets.
const lines = fs
  .readFileSync(require.resolve("../data/heart_disease_uci.csv"), "utf8")
  .trim()
  .split(/\r?\n/);
const headers = lines[0].split(",");
for (const [i, rowId] of [1, 5].entries()) {
  const row = Object.fromEntries(
    lines[rowId].split(",").map((v, j) => [headers[j], v]),
  );
  for (const [key, value] of Object.entries(cohortExamples[i].inputs)) {
    if (typeof value === "number" || key === "ca")
      assert.equal(Number(value), Number(row[key]));
    else assert.equal(String(value).toLowerCase(), row[key].toLowerCase());
  }
}
console.log(
  "PASS: Python reference scores, all categorical encodings, additive contributions, biomarker response, and real cohort provenance.",
);
