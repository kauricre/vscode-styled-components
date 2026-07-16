"use strict";
const fs = require("fs");
const path = require("path");
const { CORPUS } = require("./corpus");

function autocompleteFindings(dataDiff) {
  const out = [];
  const push = (kind, list) => {
    for (const name of list) {
      out.push({
        feature: name,
        layer: "autocomplete",
        probe: "data-diff",
        symptom: `not in plugin ${kind} vocabulary (no validation, no completion)`,
        evidence: `present in css-languageservice ${dataDiff.latestVersion}, absent in ${dataDiff.bundledVersion}`,
        fixLocation:
          "dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin",
      });
    }
  };
  push("property", dataDiff.missing.properties);
  push("at-directive", dataDiff.missing.atDirectives);
  push("pseudo-class", dataDiff.missing.pseudoClasses);
  push("pseudo-element", dataDiff.missing.pseudoElements);
  return out;
}

function editorToFindings(editorFindings) {
  const out = [];
  for (const f of (editorFindings && editorFindings.highlighting) || []) {
    out.push({
      feature: f.feature,
      layer: "highlighting",
      probe: "editor",
      symptom: f.symptom,
      evidence: f.evidence,
      fixLocation: "syntaxes/*.json (TextMate grammar)",
    });
  }
  return out;
}

function buildReport({
  dataDiff,
  corpusFindings,
  editorFindings,
  colorFindings = [],
  corpus = CORPUS,
  dateISO,
}) {
  const findings = [
    ...corpusFindings,
    ...autocompleteFindings(dataDiff),
    ...editorToFindings(editorFindings),
    ...colorFindings,
  ];
  const summary = { validation: 0, autocomplete: 0, highlighting: 0, color: 0 };
  for (const f of findings) summary[f.layer]++;

  const json = {
    generated: dateISO,
    bundledVersion: dataDiff.bundledVersion,
    bundledPath: dataDiff.bundledPath,
    latestVersion: dataDiff.latestVersion,
    corpusSize: corpus.length,
    editorProbeRan: !!editorFindings,
    summary,
    findings,
  };

  const layerSection = (title, layer) => {
    const rows = findings.filter((f) => f.layer === layer);
    if (rows.length === 0) return `## ${title}\n\n_No findings._\n`;
    const body = rows
      .map(
        (f) =>
          `| \`${f.feature}\` | ${f.symptom} | \`${f.evidence}\` | ${f.fixLocation} |`
      )
      .join("\n");
    return `## ${title}\n\n| Feature | Symptom | Evidence | Fix location |\n|---|---|---|---|\n${body}\n`;
  };

  const md = [
    `# Modern CSS Audit Report`,
    ``,
    `**Generated:** ${dateISO}`,
    `**Plugin css-languageservice:** ${dataDiff.bundledVersion} (\`${dataDiff.bundledPath}\`)`,
    `**Latest css-languageservice:** ${dataDiff.latestVersion}`,
    `**Editor probe ran:** ${
      json.editorProbeRan
        ? "yes"
        : "no (highlighting/color layers not measured this run)"
    }`,
    ``,
    `## Summary`,
    ``,
    `| Layer | Findings |`,
    `|---|---|`,
    `| Validation | ${summary.validation} |`,
    `| Autocomplete | ${summary.autocomplete} |`,
    `| Highlighting | ${summary.highlighting} |`,
    `| Color | ${summary.color} |`,
    ``,
    `> Note: Highlighting findings are heuristic (token-scope detection) and warrant human confirmation. The corpus is a curated sample for the highlighting/color layers; Probe A's data-diff is the exhaustive backstop for validation/autocomplete.`,
    ``,
    layerSection("Validation", "validation"),
    layerSection("Autocomplete", "autocomplete"),
    layerSection("Highlighting", "highlighting"),
    layerSection("Color", "color"),
  ].join("\n");

  return { md, json };
}

function readJsonIfExists(p) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
}

function writeReport(outDir, dateISO) {
  const dataDiff = readJsonIfExists(path.join(outDir, "probe-data.json"));
  const corpusFindings =
    readJsonIfExists(path.join(outDir, "probe-corpus.json")) || [];
  const editorFindings = readJsonIfExists(
    path.join(outDir, "editor-findings.json")
  );
  const colorFindings =
    readJsonIfExists(path.join(outDir, "probe-color.json")) || [];
  if (!dataDiff)
    throw new Error("probe-data.json missing — run audit/run.js first");

  const { md, json } = buildReport({
    dataDiff,
    corpusFindings,
    editorFindings,
    colorFindings,
    dateISO,
  });
  fs.writeFileSync(path.join(outDir, "report.md"), md);
  fs.writeFileSync(
    path.join(outDir, "report.json"),
    JSON.stringify(json, null, 2)
  );
  return json;
}

module.exports = { buildReport, writeReport, autocompleteFindings };

if (require.main === module) {
  const outDir = path.resolve(__dirname, "../docs/superpowers/audit");
  const dateISO =
    process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10);
  const json = writeReport(outDir, dateISO);
  console.log(
    `report written: ${
      json.summary.validation +
      json.summary.autocomplete +
      json.summary.highlighting +
      json.summary.color
    } findings`
  );
}
