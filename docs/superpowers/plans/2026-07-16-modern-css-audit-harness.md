# Modern CSS Audit Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reproducible audit harness that measures this plugin's support for modern (2026-era) CSS across four layers (validation, autocomplete, highlighting, color) and emits a categorized report of every gap with its root-cause layer.

**Architecture:** Three probes feed one report. Probe A (Node) diffs the CSS-entity vocabulary of the css-languageservice copy the TS plugin *actually resolves* against the latest release. Probe B (Node) runs the diagnostic engine on a curated modern-CSS corpus. Probe C (real VS Code Extension Host) captures grammar tokens and color-provider swatches for the same corpus. A report generator merges the three JSON outputs into `.md` + `.json`.

**Tech Stack:** Plain CommonJS JavaScript (no build step for the Node probes; matches `src/tests/*.js`), `vscode-css-languageservice`, Node 18 built-in test runner (`node:test`), existing `@vscode/test-electron` + mocha for Probe C.

## Global Constraints

- **No fixes.** This harness only observes and reports. No dependency bumps to production deps, no grammar edits, no `colorProvider.ts` changes. (The `css-latest` devDependency alias in Task 1 is audit tooling, not a fix.)
- **No change to `npm test` behavior.** Probe C runs under its own `@vscode/test-electron` entry (`audit/editor/`), never swept into the existing `src/tests` suite.
- **CommonJS only** for all `audit/` code (`require`/`module.exports`), matching `src/tests/`. No TypeScript, no bundler for the probes.
- **Node engine:** repo targets Node 18 (`@types/node ^18.11`); `node:test` and `require.resolve(..., { paths })` are available and must be used as shown.
- **Report output path:** `docs/superpowers/audit/` — `report.md` + `report.json`, plus per-probe JSON (`probe-data.json`, `probe-corpus.json`, `editor-findings.json`).
- **Faithful version measurement:** Probe A/B must load the css-languageservice copy resolved *from the TS plugin's directory*, not the extension's top-level copy, and record the resolved version + path in output.
- **Layer enum (exact strings):** `'validation' | 'autocomplete' | 'highlighting' | 'color'`.

---

## File Structure

| File | Responsibility |
|---|---|
| `audit/corpus.js` | Single source of truth: the tagged modern-CSS corpus. Exports `CORPUS`, `LAYERS`. |
| `audit/resolve.js` | Resolves the css-languageservice module the TS plugin uses (version, path, module) and the `css-latest` alias. |
| `audit/probe-data.js` | Probe A: diff bundled vs latest CSS-entity vocabulary. Standalone-runnable. |
| `audit/probe-corpus.js` | Probe B: run diagnostics + completions on the corpus. Standalone-runnable. |
| `audit/report.js` | Merge probe JSON outputs → `report.md` + `report.json`. Standalone-runnable. |
| `audit/run.js` | Orchestrator: run Probe A + B, write their JSON outputs. |
| `audit/editor/generate-fixture.js` | Generate `fixture.tsx` + `fixture.map.json` from the corpus. |
| `audit/editor/run.js` | `@vscode/test-electron` entry for Probe C (mirror of `src/tests/runTests.js`). |
| `audit/editor/suite/index.js` | Mocha runner scoped to the audit editor test only. |
| `audit/editor/suite/probe.test.js` | Probe C: capture tokens + colors, write `editor-findings.json`. |
| `audit/corpus.test.js`, `audit/probe-data.test.js`, `audit/probe-corpus.test.js`, `audit/report.test.js` | `node:test` unit tests for the pure-function pieces. |
| `docs/superpowers/audit/` | Generated report + per-probe JSON (git-tracked output). |

**Shared data shapes (documented, enforced by JSDoc + tests):**

```
Layer   = 'validation' | 'autocomplete' | 'highlighting' | 'color'
CorpusEntry = { feature: string, expectedLayer: Layer, css: string, note?: string }
Finding = { feature: string, layer: Layer, probe: string, symptom: string, evidence: string, fixLocation: string }
DataDiffResult = {
  bundledVersion: string, bundledPath: string, latestVersion: string,
  missing: { properties: string[], atDirectives: string[], pseudoClasses: string[], pseudoElements: string[] }
}
```

---

### Task 1: Recon + `css-latest` alias

Resolve the open questions the spec flagged: (1) which `vscode-css-languageservice` version the TS plugin actually loads, (2) whether the plugin validates in CSS or SCSS mode (styled-components allows nesting, so SCSS is the likely mode). Install deps and add the latest-version alias used by Probe A.

**Files:**
- Create: `audit/resolve.js`
- Create: `audit/recon.js`
- Modify: `package.json` (devDependencies: add `css-latest` alias; scripts: add `audit:recon`)

**Interfaces:**
- Produces: `audit/resolve.js` exports `resolvePluginCss()` → `{ version, dir, mod }` (the plugin's css-languageservice), `resolveLatestCss()` → `{ version, mod }`.

- [ ] **Step 1: Install dependencies and the latest-version alias**

```bash
npm install
npm install --save-dev "css-latest@npm:vscode-css-languageservice@latest"
```

Expected: `package.json` devDependencies now contains `"css-latest": "npm:vscode-css-languageservice@^<latest>"`; `node_modules/css-latest` exists.

- [ ] **Step 2: Write `audit/resolve.js`**

```js
"use strict";
const path = require("path");

// Resolve the css-languageservice copy the TS plugin actually loads.
function resolvePluginCss() {
  const pluginPkg = require.resolve("@styled/typescript-styled-plugin/package.json");
  const pluginDir = path.dirname(pluginPkg);
  const cssPkgPath = require.resolve("vscode-css-languageservice/package.json", {
    paths: [pluginDir],
  });
  const dir = path.dirname(cssPkgPath);
  const version = require(cssPkgPath).version;
  return { version, dir, mod: require(dir) };
}

function resolveLatestCss() {
  return {
    version: require("css-latest/package.json").version,
    mod: require("css-latest"),
  };
}

module.exports = { resolvePluginCss, resolveLatestCss };
```

- [ ] **Step 3: Write `audit/recon.js`**

```js
"use strict";
const fs = require("fs");
const path = require("path");
const { resolvePluginCss, resolveLatestCss } = require("./resolve");

const plugin = resolvePluginCss();
const latest = resolveLatestCss();

// Detect validation mode: scan the plugin's shipped code for which service factory it calls.
const pluginDir = path.dirname(require.resolve("@styled/typescript-styled-plugin/package.json"));
let mode = "unknown";
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|ts)$/.test(e.name)) files.push(p);
  }
})(pluginDir);
const src = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
if (/getSCSSLanguageService/.test(src)) mode = "scss";
else if (/getCSSLanguageService/.test(src)) mode = "css";

console.log(JSON.stringify({
  pluginCssVersion: plugin.version,
  pluginCssPath: plugin.dir,
  latestCssVersion: latest.version,
  validationMode: mode,
}, null, 2));
```

- [ ] **Step 4: Add the `audit:recon` script to `package.json`**

In the `"scripts"` block add:

```json
"audit:recon": "node audit/recon.js"
```

- [ ] **Step 5: Run recon and record findings**

Run: `npm run audit:recon`
Expected: JSON printed with a concrete `pluginCssVersion` (e.g. `6.2.x`), a `latestCssVersion` greater than it, and `validationMode` of `"scss"` or `"css"`. **Record the `validationMode` value — Task 4 uses it as the default mode.** If `validationMode` is `"unknown"`, default Task 4 to `"scss"` (styled-components permits nesting) and note it in the report.

- [ ] **Step 6: Commit**

```bash
git add audit/resolve.js audit/recon.js package.json package-lock.json
git commit --no-gpg-sign -m "audit: resolve plugin css-languageservice + add latest alias"
```

---

### Task 2: Corpus module

The single source of truth for modern-CSS test cases. Consumed by Probe B and (via generator) Probe C.

**Files:**
- Create: `audit/corpus.js`
- Test: `audit/corpus.test.js`

**Interfaces:**
- Produces: `module.exports = { CORPUS, LAYERS }` where `CORPUS: CorpusEntry[]`, `LAYERS: Layer[]`.
- Consumes: nothing.

- [ ] **Step 1: Write the failing test `audit/corpus.test.js`**

```js
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { CORPUS, LAYERS } = require("./corpus");

test("LAYERS is the exact four-layer enum", () => {
  assert.deepStrictEqual([...LAYERS].sort(), ["autocomplete", "color", "highlighting", "validation"]);
});

test("every entry has a feature, a valid layer, and non-empty css", () => {
  for (const e of CORPUS) {
    assert.ok(e.feature, "feature missing");
    assert.ok(LAYERS.includes(e.expectedLayer), `bad layer for ${e.feature}: ${e.expectedLayer}`);
    assert.ok(typeof e.css === "string" && e.css.trim().length > 0, `empty css for ${e.feature}`);
    assert.ok(!e.css.includes("${"), `corpus css must be interpolation-free: ${e.feature}`);
  }
});

test("feature names are unique", () => {
  const seen = new Set();
  for (const e of CORPUS) {
    assert.ok(!seen.has(e.feature), `duplicate feature: ${e.feature}`);
    seen.add(e.feature);
  }
});

test("covers the overlay regression and at least one entry per non-autocomplete layer", () => {
  assert.ok(CORPUS.some((e) => e.feature === "overlay"), "missing overlay case");
  for (const layer of ["validation", "color", "highlighting"]) {
    assert.ok(CORPUS.some((e) => e.expectedLayer === layer), `no corpus entry for layer ${layer}`);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test audit/corpus.test.js`
Expected: FAIL — `Cannot find module './corpus'`.

- [ ] **Step 3: Write `audit/corpus.js`**

```js
"use strict";

/** @type {Array<'validation'|'autocomplete'|'highlighting'|'color'>} */
const LAYERS = ["validation", "autocomplete", "highlighting", "color"];

// expectedLayer routes Probe C behaviour. Probe B runs doValidation on EVERY entry
// regardless of tag, so validation diagnostics are captured for color/highlighting
// entries too. Autocomplete coverage comes from Probe A's missing-vocabulary diff,
// so there are no 'autocomplete'-tagged entries here by design.
const CORPUS = [
  // --- validation (property/value vocabulary) ---
  { feature: "overlay", expectedLayer: "validation", css: ".x { overlay: auto; }", note: "reported regression" },
  { feature: "field-sizing", expectedLayer: "validation", css: ".x { field-sizing: content; }" },
  { feature: "text-wrap-balance", expectedLayer: "validation", css: ".x { text-wrap: balance; }" },
  { feature: "content-visibility", expectedLayer: "validation", css: ".x { content-visibility: auto; }" },
  { feature: "text-box", expectedLayer: "validation", css: ".x { text-box: trim-both cap alphabetic; }" },
  { feature: "animation-timeline", expectedLayer: "validation", css: ".x { animation-timeline: scroll(root block); }" },
  { feature: "anchor-name", expectedLayer: "validation", css: ".x { anchor-name: --a; }" },
  { feature: "subgrid", expectedLayer: "validation", css: ".x { grid-template-rows: subgrid; }" },
  { feature: "transition-behavior", expectedLayer: "validation", css: ".x { transition-behavior: allow-discrete; }" },
  { feature: "property-at-rule", expectedLayer: "validation", css: "@property --a { syntax: '<color>'; inherits: false; initial-value: red; }" },

  // --- color (modern color functions; also exercise validation) ---
  { feature: "oklch", expectedLayer: "color", css: ".x { color: oklch(0.7 0.15 200); }" },
  { feature: "oklab", expectedLayer: "color", css: ".x { color: oklab(0.7 0.1 0.1); }" },
  { feature: "color-mix", expectedLayer: "color", css: ".x { color: color-mix(in oklch, red, blue); }" },
  { feature: "relative-color", expectedLayer: "color", css: ".x { color: rgb(from red r g b); }" },
  { feature: "light-dark", expectedLayer: "color", css: ".x { color: light-dark(#ffffff, #000000); }" },

  // --- highlighting (at-rules / modern selectors) ---
  { feature: "container", expectedLayer: "highlighting", css: ".wrap { container-type: inline-size; } @container (min-width: 400px) { .x { color: red; } }" },
  { feature: "layer", expectedLayer: "highlighting", css: "@layer base { .x { color: red; } }" },
  { feature: "scope", expectedLayer: "highlighting", css: "@scope (.x) to (.y) { .z { color: red; } }" },
  { feature: "starting-style", expectedLayer: "highlighting", css: "@starting-style { .x { opacity: 0; } }" },
  { feature: "nesting", expectedLayer: "highlighting", css: ".x { & .y { color: red; } }" },
  { feature: "has", expectedLayer: "highlighting", css: ".x:has(> .y) { color: red; }" },
  { feature: "popover-open", expectedLayer: "highlighting", css: ".x:popover-open { color: red; }" },
];

module.exports = { CORPUS, LAYERS };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test audit/corpus.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add audit/corpus.js audit/corpus.test.js
git commit --no-gpg-sign -m "audit: add modern-CSS corpus"
```

---

### Task 3: Probe A — data-diff

Diff the CSS-entity vocabulary (properties, at-directives, pseudo-classes, pseudo-elements) between the plugin's css-languageservice and the latest release. This is the exhaustive vocabulary gap and directly feeds the autocomplete layer.

**Files:**
- Create: `audit/probe-data.js`
- Test: `audit/probe-data.test.js`

**Interfaces:**
- Consumes: `resolve.js` `resolvePluginCss()`, `resolveLatestCss()`.
- Produces: `diffProviders(bundledMod, latestMod)` → `{ properties, atDirectives, pseudoClasses, pseudoElements }` (each a sorted `string[]` of names present in latest but absent in bundled); `runDataProbe()` → `DataDiffResult`.

- [ ] **Step 1: Write the failing test `audit/probe-data.test.js`**

```js
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { diffProviders } = require("./probe-data");

// Fake css-languageservice modules exposing only getDefaultCSSDataProvider().
function fakeMod(props, ats, pcs, pes) {
  return {
    getDefaultCSSDataProvider: () => ({
      provideProperties: () => props.map((name) => ({ name })),
      provideAtDirectives: () => ats.map((name) => ({ name })),
      providePseudoClasses: () => pcs.map((name) => ({ name })),
      providePseudoElements: () => pes.map((name) => ({ name })),
    }),
  };
}

test("diffProviders returns entities present in latest but absent in bundled", () => {
  const bundled = fakeMod(["color"], ["@media"], [":hover"], ["::before"]);
  const latest = fakeMod(["color", "overlay"], ["@media", "@container"], [":hover", ":has"], ["::before", "::backdrop"]);
  const d = diffProviders(bundled, latest);
  assert.deepStrictEqual(d.properties, ["overlay"]);
  assert.deepStrictEqual(d.atDirectives, ["@container"]);
  assert.deepStrictEqual(d.pseudoClasses, [":has"]);
  assert.deepStrictEqual(d.pseudoElements, ["::backdrop"]);
});

test("diff is case-insensitive and ignores order", () => {
  const bundled = fakeMod(["Color"], [], [], []);
  const latest = fakeMod(["color"], [], [], []);
  assert.deepStrictEqual(diffProviders(bundled, latest).properties, []);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test audit/probe-data.test.js`
Expected: FAIL — `Cannot find module './probe-data'`.

- [ ] **Step 3: Write `audit/probe-data.js`**

```js
"use strict";
const { resolvePluginCss, resolveLatestCss } = require("./resolve");

const names = (list) => list.map((x) => x.name);

function diffProviders(bundledMod, latestMod) {
  const b = bundledMod.getDefaultCSSDataProvider();
  const l = latestMod.getDefaultCSSDataProvider();
  const missing = (bList, lList) => {
    const have = new Set(names(bList).map((n) => n.toLowerCase()));
    return names(lList)
      .filter((n) => !have.has(n.toLowerCase()))
      .sort();
  };
  return {
    properties: missing(b.provideProperties(), l.provideProperties()),
    atDirectives: missing(b.provideAtDirectives(), l.provideAtDirectives()),
    pseudoClasses: missing(b.providePseudoClasses(), l.providePseudoClasses()),
    pseudoElements: missing(b.providePseudoElements(), l.providePseudoElements()),
  };
}

function runDataProbe() {
  const plugin = resolvePluginCss();
  const latest = resolveLatestCss();
  return {
    bundledVersion: plugin.version,
    bundledPath: plugin.dir,
    latestVersion: latest.version,
    missing: diffProviders(plugin.mod, latest.mod),
  };
}

module.exports = { diffProviders, runDataProbe };

if (require.main === module) {
  console.log(JSON.stringify(runDataProbe(), null, 2));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test audit/probe-data.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify the real diff reproduces the `overlay` gap**

Run: `node audit/probe-data.js`
Expected: JSON where `missing.properties` includes `"overlay"` (and likely `field-sizing`, `text-wrap`, etc.), `missing.atDirectives` includes `"@container"`/`"@layer"`, confirming the plugin's vocabulary is behind latest.

- [ ] **Step 6: Add the `audit:data` script and commit**

Add to `"scripts"`: `"audit:data": "node audit/probe-data.js"`

```bash
git add audit/probe-data.js audit/probe-data.test.js package.json
git commit --no-gpg-sign -m "audit: add Probe A css-vocabulary data-diff"
```

---

### Task 4: Probe B — corpus diagnostics

Run the diagnostic engine (the same `vscode-css-languageservice` the plugin uses) on every corpus entry and record diagnostics. Catches value-level and selector-level gaps that Probe A's name-only diff misses.

**Files:**
- Create: `audit/probe-corpus.js`
- Test: `audit/probe-corpus.test.js`

**Interfaces:**
- Consumes: `resolve.js` `resolvePluginCss()`; `corpus.js` `CORPUS`.
- Produces: `validateCss(mod, css, mode)` → `Diagnostic[]`; `runCorpusProbe()` → `Finding[]` (each finding `layer: 'validation'`, `probe: 'corpus-diagnostics'`).

- [ ] **Step 1: Write the failing test `audit/probe-corpus.test.js`**

```js
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { resolvePluginCss } = require("./resolve");
const { validateCss } = require("./probe-corpus");

const { mod } = resolvePluginCss();

test("known-good CSS produces no diagnostics", () => {
  const diags = validateCss(mod, ".x { color: red; }", "scss");
  assert.strictEqual(diags.length, 0);
});

test("the reported overlay property produces an 'Unknown property' diagnostic on the stale engine", () => {
  const diags = validateCss(mod, ".x { overlay: auto; }", "scss");
  assert.ok(diags.some((d) => /unknown property/i.test(d.message)), JSON.stringify(diags));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test audit/probe-corpus.test.js`
Expected: FAIL — `Cannot find module './probe-corpus'`.

- [ ] **Step 3: Write `audit/probe-corpus.js`**

Replace `DEFAULT_MODE` with the `validationMode` recorded in Task 1 Step 5 if it was `"css"`; otherwise leave `"scss"`.

```js
"use strict";
const { resolvePluginCss } = require("./resolve");
const { CORPUS } = require("./corpus");

const DEFAULT_MODE = "scss"; // set from Task 1 recon; scss is the styled-components default

function getService(mod, mode) {
  return mode === "css" ? mod.getCSSLanguageService() : mod.getSCSSLanguageService();
}

function validateCss(mod, css, mode = DEFAULT_MODE) {
  const service = getService(mod, mode);
  const doc = mod.TextDocument.create("untitled://embedded." + mode, mode, 1, css);
  const stylesheet = service.parseStylesheet(doc);
  return service.doValidation(doc, stylesheet);
}

function runCorpusProbe(mode = DEFAULT_MODE) {
  const { mod } = resolvePluginCss();
  /** @type {Array<object>} */
  const findings = [];
  for (const entry of CORPUS) {
    const diags = validateCss(mod, entry.css, mode);
    for (const d of diags) {
      findings.push({
        feature: entry.feature,
        layer: "validation",
        probe: "corpus-diagnostics",
        symptom: d.message,
        evidence: `${entry.css}  (severity ${d.severity})`,
        fixLocation: "dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin",
      });
    }
  }
  return findings;
}

module.exports = { validateCss, runCorpusProbe, DEFAULT_MODE };

if (require.main === module) {
  console.log(JSON.stringify(runCorpusProbe(), null, 2));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test audit/probe-corpus.test.js`
Expected: PASS (2 tests). If the "known-good" test fails because SCSS mode reports something unexpected, confirm the Task 1 mode; if the engine genuinely flags nothing for `.x { color: red; }` in `css` mode either, keep `scss`.

- [ ] **Step 5: Add the `audit:corpus` script and commit**

Add to `"scripts"`: `"audit:corpus": "node audit/probe-corpus.js"`

```bash
git add audit/probe-corpus.js audit/probe-corpus.test.js package.json
git commit --no-gpg-sign -m "audit: add Probe B corpus diagnostics"
```

---

### Task 5: Report generator

Merge probe JSON outputs into a human-readable `report.md` and a machine-readable `report.json`, categorized by layer. Tolerant of a missing editor-findings file (Probe C may not have run).

**Files:**
- Create: `audit/report.js`
- Test: `audit/report.test.js`

**Interfaces:**
- Consumes: `probe-data.json`, `probe-corpus.json`, `editor-findings.json` (from `docs/superpowers/audit/`); `corpus.js` `CORPUS`.
- Produces: `buildReport({ dataDiff, corpusFindings, editorFindings, corpus, dateISO })` → `{ md: string, json: object }`; `writeReport(outDir, dateISO)` → writes files.

- [ ] **Step 1: Write the failing test `audit/report.test.js`**

```js
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { buildReport } = require("./report");

const fixture = {
  dateISO: "2026-07-16",
  corpus: [{ feature: "overlay", expectedLayer: "validation", css: ".x { overlay: auto; }" }],
  dataDiff: {
    bundledVersion: "6.2.1", bundledPath: "/x", latestVersion: "6.9.0",
    missing: { properties: ["overlay"], atDirectives: ["@container"], pseudoClasses: [], pseudoElements: [] },
  },
  corpusFindings: [{ feature: "overlay", layer: "validation", probe: "corpus-diagnostics", symptom: "Unknown property: 'overlay'", evidence: ".x { overlay: auto; }", fixLocation: "dependency" }],
  editorFindings: { color: [{ feature: "oklch", symptom: "no color swatch", evidence: "oklch(...)" }], highlighting: [] },
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test audit/report.test.js`
Expected: FAIL — `Cannot find module './report'`.

- [ ] **Step 3: Write `audit/report.js`**

```js
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
        fixLocation: "dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin",
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
  for (const layer of ["highlighting", "color"]) {
    for (const f of (editorFindings && editorFindings[layer]) || []) {
      out.push({
        feature: f.feature,
        layer,
        probe: "editor",
        symptom: f.symptom,
        evidence: f.evidence,
        fixLocation:
          layer === "color"
            ? "src/colorProvider.ts (regex + d3-color do not handle this color syntax)"
            : "syntaxes/*.json (TextMate grammar)",
      });
    }
  }
  return out;
}

function buildReport({ dataDiff, corpusFindings, editorFindings, corpus = CORPUS, dateISO }) {
  const findings = [
    ...corpusFindings,
    ...autocompleteFindings(dataDiff),
    ...editorToFindings(editorFindings),
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
      .map((f) => `| \`${f.feature}\` | ${f.symptom} | \`${f.evidence}\` | ${f.fixLocation} |`)
      .join("\n");
    return `## ${title}\n\n| Feature | Symptom | Evidence | Fix location |\n|---|---|---|---|\n${body}\n`;
  };

  const md = [
    `# Modern CSS Audit Report`,
    ``,
    `**Generated:** ${dateISO}`,
    `**Plugin css-languageservice:** ${dataDiff.bundledVersion} (\`${dataDiff.bundledPath}\`)`,
    `**Latest css-languageservice:** ${dataDiff.latestVersion}`,
    `**Editor probe ran:** ${json.editorProbeRan ? "yes" : "no (highlighting/color layers not measured this run)"}`,
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
  const corpusFindings = readJsonIfExists(path.join(outDir, "probe-corpus.json")) || [];
  const editorFindings = readJsonIfExists(path.join(outDir, "editor-findings.json"));
  if (!dataDiff) throw new Error("probe-data.json missing — run audit/run.js first");

  const { md, json } = buildReport({ dataDiff, corpusFindings, editorFindings, dateISO });
  fs.writeFileSync(path.join(outDir, "report.md"), md);
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(json, null, 2));
  return json;
}

module.exports = { buildReport, writeReport, autocompleteFindings };

if (require.main === module) {
  const outDir = path.resolve(__dirname, "../docs/superpowers/audit");
  const dateISO = process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10);
  const json = writeReport(outDir, dateISO);
  console.log(`report written: ${json.summary.validation + json.summary.autocomplete + json.summary.highlighting + json.summary.color} findings`);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test audit/report.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add audit/report.js audit/report.test.js
git commit --no-gpg-sign -m "audit: add report generator"
```

---

### Task 6: Orchestrator + `npm run audit` (Probes A + B + report)

Wire Probes A and B into one run that writes their JSON outputs, then generate the report. This delivers a working, shippable audit for two of the four layers even before Probe C exists.

**Files:**
- Create: `audit/run.js`
- Modify: `package.json` (scripts: `audit`, `audit:test`)

**Interfaces:**
- Consumes: `probe-data.js` `runDataProbe()`, `probe-corpus.js` `runCorpusProbe()`, `report.js` `writeReport()`.
- Produces: writes `docs/superpowers/audit/probe-data.json` and `probe-corpus.json`.

- [ ] **Step 1: Write `audit/run.js`**

```js
"use strict";
const fs = require("fs");
const path = require("path");
const { runDataProbe } = require("./probe-data");
const { runCorpusProbe } = require("./probe-corpus");

const outDir = path.resolve(__dirname, "../docs/superpowers/audit");
fs.mkdirSync(outDir, { recursive: true });

const data = runDataProbe();
fs.writeFileSync(path.join(outDir, "probe-data.json"), JSON.stringify(data, null, 2));

const corpus = runCorpusProbe();
fs.writeFileSync(path.join(outDir, "probe-corpus.json"), JSON.stringify(corpus, null, 2));

console.log(
  `Probe A: ${data.missing.properties.length} missing properties, ${data.missing.atDirectives.length} missing at-directives (bundled ${data.bundledVersion} vs latest ${data.latestVersion})`
);
console.log(`Probe B: ${corpus.length} corpus diagnostics`);
```

- [ ] **Step 2: Add scripts to `package.json`**

Add to `"scripts"`:

```json
"audit:test": "node --test audit/corpus.test.js audit/probe-data.test.js audit/probe-corpus.test.js audit/report.test.js",
"audit": "node audit/run.js && node audit/report.js"
```

- [ ] **Step 3: Run the full unit suite**

Run: `npm run audit:test`
Expected: PASS — all four test files green.

- [ ] **Step 4: Run the audit and verify the report reproduces `overlay`**

Run: `AUDIT_DATE=2026-07-16 npm run audit`
Expected: prints Probe A/B counts; creates `docs/superpowers/audit/report.md`, `report.json`, `probe-data.json`, `probe-corpus.json`. Open `report.md` and confirm: a `## Validation` row for `overlay` with an "Unknown property" symptom, and the version delta header shows the stale bundled version vs newer latest.

- [ ] **Step 5: Commit**

```bash
git add audit/run.js package.json docs/superpowers/audit/
git commit --no-gpg-sign -m "audit: orchestrate Probes A+B and generate report"
```

---

### Task 7: Probe C — editor highlighting + color

Capture real grammar tokens and color-provider swatches for the corpus inside a VS Code Extension Host, and write `editor-findings.json` for the report. Runs under its own `@vscode/test-electron` entry so `npm test` is unaffected.

**Files:**
- Create: `audit/editor/generate-fixture.js`
- Create: `audit/editor/run.js`
- Create: `audit/editor/suite/index.js`
- Create: `audit/editor/suite/probe.test.js`
- Modify: `package.json` (scripts: `audit:editor`; extend `audit` to include it)

**Interfaces:**
- Consumes: `corpus.js` `CORPUS`; VS Code commands `_workbench.captureSyntaxTokens` and `vscode.executeDocumentColorProvider`.
- Produces: `audit/editor/fixture.tsx`, `audit/editor/fixture.map.json`, `docs/superpowers/audit/editor-findings.json` with shape `{ highlighting: Finding[], color: Finding[] }`.

- [ ] **Step 1: Write `audit/editor/generate-fixture.js`**

```js
"use strict";
const fs = require("fs");
const path = require("path");
const { CORPUS } = require("../corpus");

// Emit one styled component per corpus entry and record each entry's line span,
// so Probe C can attribute tokens/colors back to a feature by line number.
function generate() {
  const header = "import styled from 'styled-components';\n\n";
  let out = header;
  const map = [];
  CORPUS.forEach((entry, i) => {
    const startLine = out.split("\n").length - 1; // 0-based line of the `styled` open
    const block = `export const C${i} = styled.div\`\n  ${entry.css}\n\`;\n\n`;
    out += block;
    const endLine = out.split("\n").length - 2;
    map.push({ feature: entry.feature, expectedLayer: entry.expectedLayer, css: entry.css, startLine, endLine });
  });
  const dir = __dirname;
  fs.writeFileSync(path.join(dir, "fixture.tsx"), out);
  fs.writeFileSync(path.join(dir, "fixture.map.json"), JSON.stringify(map, null, 2));
  return { fixturePath: path.join(dir, "fixture.tsx"), map };
}

module.exports = { generate };

if (require.main === module) generate();
```

- [ ] **Step 2: Write `audit/editor/suite/index.js`** (mocha runner scoped to this one test)

```js
"use strict";
const path = require("path");
const Mocha = require("mocha");

function run() {
  const mocha = new Mocha({ ui: "tdd", timeout: 60000 });
  mocha.addFile(path.resolve(__dirname, "probe.test.js"));
  return new Promise((resolve, reject) => {
    try {
      mocha.run((failures) => (failures ? reject(new Error(`${failures} failed`)) : resolve()));
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.run = run;
```

- [ ] **Step 3: Write `audit/editor/run.js`** (Extension Host entry; mirrors `src/tests/runTests.js`)

```js
"use strict";
const path = require("path");
const { runTests } = require("@vscode/test-electron");
const { generate } = require("./generate-fixture");

async function main() {
  generate(); // (re)write fixture.tsx + fixture.map.json before launching VS Code
  try {
    await runTests({
      extensionDevelopmentPath: path.resolve(__dirname, "../../"),
      extensionTestsPath: path.resolve(__dirname, "./suite/index"),
      launchArgs: ["--disable-extensions"],
    });
  } catch (err) {
    console.error("Editor probe failed", err);
    process.exit(1);
  }
}
main();
```

- [ ] **Step 4: Write `audit/editor/suite/probe.test.js`**

```js
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { commands, Uri, window, workspace } = require("vscode");

const fixturePath = path.resolve(__dirname, "../fixture.tsx");
const map = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../fixture.map.json"), "utf8"));
const outPath = path.resolve(__dirname, "../../../docs/superpowers/audit/editor-findings.json");

const scopeHasCss = (t) => /(^|\s)source\.css|\.css($|\s|\.)|\.scss($|\s|\.)/.test(t);
const inRange = (line, entry) => line >= entry.startLine && line <= entry.endLine;

suite("editor audit probe", () => {
  test("capture tokens + colors, write findings", async function () {
    this.timeout(60000);

    const doc = await workspace.openTextDocument(Uri.file(fixturePath));
    await window.showTextDocument(doc);

    // --- Highlighting: tokens with no CSS/SCSS scope inside a styled block are gaps. ---
    const tokens = await commands.executeCommand("_workbench.captureSyntaxTokens", Uri.file(fixturePath));
    // captureSyntaxTokens returns document-order tokens as { c, t, r } without line numbers,
    // so we re-tokenise per line by walking the document text alongside token order.
    // Simpler + robust: flag per feature using the raw CSS signature token presence in a CSS-scoped token.
    const highlighting = [];
    for (const entry of map.filter((e) => e.expectedLayer === "highlighting")) {
      const sig = signatureToken(entry.feature);
      const hit = tokens.find((tk) => tk.c && tk.c.includes(sig));
      if (!hit || !scopeHasCss(hit.t)) {
        highlighting.push({
          feature: entry.feature,
          symptom: hit ? `token '${sig}' not scoped as CSS (scope: ${hit.t})` : `token '${sig}' not found in CSS scope`,
          evidence: entry.css,
        });
      }
    }

    // --- Color: color-layer features must yield a swatch within their line span. ---
    const colors = await commands.executeCommand("vscode.executeDocumentColorProvider", Uri.file(fixturePath));
    const color = [];
    for (const entry of map.filter((e) => e.expectedLayer === "color")) {
      const swatch = (colors || []).find((c) => inRange(c.range.start.line, entry));
      if (!swatch) {
        color.push({
          feature: entry.feature,
          symptom: "no inline color swatch produced",
          evidence: entry.css,
        });
      }
    }

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify({ highlighting, color }, null, 2));

    // The probe's job is to RECORD findings, not to fail the run. Assert only that it produced output.
    assert.ok(fs.existsSync(outPath));
  });
});

// The most distinctive substring of each feature's CSS, used to locate its token.
function signatureToken(feature) {
  const map = {
    container: "@container",
    layer: "@layer",
    scope: "@scope",
    "starting-style": "@starting-style",
    nesting: "&",
    has: ":has",
    "popover-open": ":popover-open",
  };
  return map[feature] || feature;
}
```

- [ ] **Step 5: Add scripts to `package.json`**

Update `"scripts"`:

```json
"audit:editor": "npm run compile && node audit/editor/run.js",
"audit": "node audit/run.js && npm run audit:editor && node audit/report.js"
```

- [ ] **Step 6: Generate the fixture and sanity-check it**

Run: `node audit/editor/generate-fixture.js`
Expected: `audit/editor/fixture.tsx` contains one `styled.div` per corpus entry; `audit/editor/fixture.map.json` lists each `feature` with numeric `startLine`/`endLine`.

- [ ] **Step 7: Run the editor probe**

Run: `npm run audit:editor`
Expected: VS Code downloads (first run) and launches; the test writes `docs/superpowers/audit/editor-findings.json`. Confirm `color` contains `oklch`, `oklab`, `color-mix`, `relative-color`, `light-dark` (colorProvider.ts:12-28 matches none of these), proving the color-layer gaps are real.

- [ ] **Step 8: Run the full audit end-to-end**

Run: `AUDIT_DATE=2026-07-16 npm run audit`
Expected: `report.md` now shows non-empty `## Color` and (likely) `## Highlighting` sections in addition to Validation/Autocomplete; `report.json` `editorProbeRan` is `true`.

- [ ] **Step 9: Confirm `npm test` is unaffected**

Run: `npm test`
Expected: the existing colorization suite runs exactly as before; no audit test is picked up (the audit editor test lives under `audit/editor/`, outside the `src/tests` glob).

- [ ] **Step 10: Commit**

```bash
git add audit/editor/ package.json docs/superpowers/audit/
git commit --no-gpg-sign -m "audit: add Probe C editor highlighting + color probe"
```

---

## Self-Review

**1. Spec coverage**

| Spec requirement | Task |
|---|---|
| Probe A data-diff (bundled vs latest, exhaustive vocabulary) | Task 3 |
| Probe B corpus diagnostics (engine-level proxy) | Task 4 |
| Probe C highlighting + color via real Extension Host | Task 7 |
| Tagged corpus, one layer per entry, feeds B and C | Task 2 (+ generator in Task 7) |
| Resolve + report the css-languageservice version the plugin *actually* uses | Task 1 (`resolve.js`), surfaced in Task 3/5 output |
| All four layers (validation, autocomplete, highlighting, color) | validation → T4; autocomplete → T3 via `autocompleteFindings` (T5); highlighting/color → T7 |
| Report `.md` + `.json`, categorized by layer, with fix location | Task 5 |
| npm scripts `audit:data`/`audit:corpus`/`audit:editor`/`audit` | Tasks 3, 4, 6, 7 |
| Fresh `npm install` → `npm run audit` produces report reproducing `overlay` | Tasks 1 + 6 (Step 4) |
| `npm test` behavior unchanged | Task 7 Step 9 |
| Non-goal: no fixes | Global Constraints; every task only reads/reports |

**2. Placeholder scan:** No "TBD"/"TODO"/"implement later". Every code step contains complete, runnable code. The one documented tunable — `DEFAULT_MODE` in `probe-corpus.js` — is set from Task 1's recorded recon value, with an explicit fallback rule.

**3. Type consistency:** `Finding` fields (`feature`, `layer`, `probe`, `symptom`, `evidence`, `fixLocation`) are identical across `probe-corpus.js`, `report.js` (`autocompleteFindings`, `editorToFindings`). `DataDiffResult` shape produced by `runDataProbe` (Task 3) matches what `buildReport`/`writeReport` consume (Task 5) and what `report.test.js` asserts. `diffProviders` returns `{ properties, atDirectives, pseudoClasses, pseudoElements }` in both the test fake and the report's `autocompleteFindings`. Corpus `expectedLayer` values are all within `LAYERS`, enforced by `corpus.test.js`.

## Known limitations (carried from spec, surfaced in the report)

- **Highlighting heuristic is coarse.** `_workbench.captureSyntaxTokens` returns document-order tokens without line numbers; Probe C flags a feature when its signature token is absent from any CSS-scoped token. This can over- or under-report; the report notes highlighting findings are heuristic and warrant human confirmation.
- **Corpus is a curated sample** for highlighting/color; Probe A is the exhaustive backstop for validation/autocomplete vocabulary.
- **Probe B extraction** is engine-level (corpus CSS is interpolation-free by construction), not the plugin's exact `${...}` handling — an accepted fidelity tradeoff.
