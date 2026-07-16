"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { buildReport } = require("./report");

const fixture = {
  dateISO: "2026-07-16",
  corpus: [
    {
      feature: "overlay",
      expectedLayer: "validation",
      css: ".x { overlay: auto; }",
    },
  ],
  dataDiff: {
    bundledVersion: "6.2.1",
    bundledPath: "/x",
    latestVersion: "6.9.0",
    missing: {
      properties: ["overlay"],
      atDirectives: ["@container"],
      pseudoClasses: [],
      pseudoElements: [],
    },
  },
  corpusFindings: [
    {
      feature: "overlay",
      layer: "validation",
      probe: "corpus-diagnostics",
      symptom: "Unknown property: 'overlay'",
      evidence: ".x { overlay: auto; }",
      fixLocation: "dependency",
    },
  ],
  editorFindings: {
    color: [
      { feature: "oklch", symptom: "no color swatch", evidence: "oklch(...)" },
    ],
    highlighting: [],
  },
};

test("report json summarises counts per layer and echoes version delta", () => {
  const { json } = buildReport(fixture);
  assert.strictEqual(json.bundledVersion, "6.2.1");
  assert.strictEqual(json.latestVersion, "6.9.0");
  assert.strictEqual(json.summary.validation, 1);
  assert.strictEqual(json.summary.autocomplete, 2); // missing properties + at-directives
  assert.strictEqual(json.summary.color, 1);
});

test("markdown reproduces the overlay finding and names the fix location", () => {
  const { md } = buildReport(fixture);
  assert.match(md, /overlay/);
  assert.match(md, /Unknown property/);
  assert.match(md, /6\.2\.1.*6\.9\.0|6\.2\.1/);
  assert.match(md, /## Validation/);
  assert.match(md, /## Autocomplete/);
  assert.match(md, /## Color/);
});

test("markdown states the heuristic/curated-sample caveat", () => {
  const { md } = buildReport(fixture);
  assert.match(md, /heuristic/i);
  assert.match(md, /curated sample/i);
  assert.match(md, /Probe A/);
});
