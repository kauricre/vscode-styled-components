# Modern Color Functions in colorProvider — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Inline color swatches work for modern CSS color functions (oklch/oklab/hwb/lab/lch, relative color, and color-mix/light-dark inner colors), backed by a pure, node-testable color matcher; and the audit measures color support deterministically in node.

**Architecture:** Extract color matching into `src/colorMatch.js` (pure, culori-based) shared by `colorProvider.ts` and a new node color probe. Drop `d3-color`. Move color detection out of the unreliable Extension-Host probe.

**Tech Stack:** culori (color parsing/conversion), esbuild bundling, `node:test`, the existing `audit/` harness.

## Global Constraints

- **culori replaces d3-color.** Add `culori`; remove `d3-color` and `@types/d3-color`.
- **`src/colorMatch.js` is pure CommonJS** — no `vscode` import — so node tests and the audit can require it.
- **No `syntaxes/*.json` changes** (the `:popover-open` grammar item is separate).
- **Preserve existing swatches** (hex/rgb/hsl/named) — covered by the new unit test.
- **Color detection is node-level.** The Extension-Host editor probe keeps highlighting only; color findings come from `audit/probe-color.js`.
- **Commits:** `git commit --no-gpg-sign`; keep files prettier-clean; `docs/superpowers/audit` is prettier-ignored.
- **Branch:** `feat/color-provider` (stacked on `feat/confirm-highlighting`).

## File Structure

| File                                       | Change                                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `package.json`                             | + `culori`; − `d3-color`, `@types/d3-color`; add `src/colorMatch.test.js` to `audit:test` |
| `src/colorMatch.js` (new)                  | pure `findColors(text)` via culori                                                        |
| `src/colorMatch.test.js` (new)             | `node:test` unit tests                                                                    |
| `src/colorProvider.ts`                     | use `findColors`; culori-based presentations                                              |
| `audit/probe-color.js` (new)               | node color probe over corpus color entries                                                |
| `audit/run.js`                             | run color probe → `probe-color.json`                                                      |
| `audit/report.js` + `audit/report.test.js` | color findings from the node probe                                                        |
| `audit/editor/suite/probe.test.js`         | drop color loop (highlighting only)                                                       |
| `docs/superpowers/audit/*`                 | regenerated                                                                               |

Shape: `findColors(text) → Array<{ index:number, length:number, rgb:{r,g,b,a} }>` (channels 0–1).

---

### Task 1: `src/colorMatch.js` + culori + unit tests

**Files:** Create `src/colorMatch.js`, `src/colorMatch.test.js`; Modify `package.json`.

**Interfaces:** Produces `module.exports = { findColors }`.

- [ ] **Step 1: Add culori**

Run: `npm install culori`
Expected: `package.json` dependencies gains `culori` (^4.x); installs clean.

- [ ] **Step 2: Write the failing test `src/colorMatch.test.js`**

```js
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { findColors } = require("./colorMatch");

const strs = (text) => findColors(text).map((c) => c.str);
const inGamut = (c) =>
  [c.rgb.r, c.rgb.g, c.rgb.b].every((v) => v >= 0 && v <= 1);

test("existing formats still swatch", () => {
  assert.deepStrictEqual(strs(".x { color: #ff0000; }"), ["#ff0000"]);
  assert.deepStrictEqual(strs(".x { color: rgb(255, 0, 153); }"), [
    "rgb(255, 0, 153)",
  ]);
  assert.deepStrictEqual(strs(".x { color: hsl(60, 100%, 50%); }"), [
    "hsl(60, 100%, 50%)",
  ]);
  assert.deepStrictEqual(strs(".x { color: red; }"), ["red"]);
});

test("oklch / oklab / hwb swatch and are clamped in-gamut", () => {
  for (const css of [
    ".x { color: oklch(0.7 0.15 200); }",
    ".x { color: oklab(0.7 0.1 0.1); }",
    ".x { color: hwb(194 0% 0%); }",
  ]) {
    const found = findColors(css);
    assert.strictEqual(found.length, 1, css);
    assert.ok(inGamut(found[0]), `out of gamut: ${css}`);
  }
});

test("color-mix and light-dark swatch their inner colors", () => {
  assert.deepStrictEqual(
    strs(".x { color: color-mix(in oklch, red, blue); }").sort(),
    ["blue", "red"]
  );
  assert.deepStrictEqual(strs(".x { color: light-dark(red, blue); }").sort(), [
    "blue",
    "red",
  ]);
});

test("relative color swatches its base color", () => {
  assert.deepStrictEqual(strs(".x { color: rgb(from red r g b); }"), ["red"]);
});

test("non-colors produce no swatch", () => {
  assert.deepStrictEqual(findColors(".x { width: 10px; }"), []);
  assert.deepStrictEqual(findColors(".x { display: block; }"), []);
});

test("swatch index/length locate the substring", () => {
  const css = ".x { color: oklch(0.7 0.15 200); }";
  const [c] = findColors(css);
  assert.strictEqual(
    css.slice(c.index, c.index + c.length),
    "oklch(0.7 0.15 200)"
  );
});
```

- [ ] **Step 3: Run the test — RED**

Run: `node --test src/colorMatch.test.js`
Expected: FAIL — `Cannot find module './colorMatch'`.

- [ ] **Step 4: Write `src/colorMatch.js`**

```js
"use strict";
const { parse, converter, clampRgb } = require("culori");

const toRgb = converter("rgb");

const FUNC =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\((?:[^()]*|\([^()]*\))*\)/gi;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
// named colour after ':' , ',' or '(' — the last catches first args of
// color-mix()/light-dark(); culori.parse filters out non-colour words.
const NAMED = /(?<=[:,(]\s*)[a-zA-Z]+(?![\w-])/g;
const REL =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(\s*from\s+([a-zA-Z]+|#[0-9a-fA-F]{3,8})/gi;

function toChip(str) {
  const parsed = parse(str);
  if (!parsed) return undefined;
  const rgb = clampRgb(toRgb(parsed));
  if (!rgb) return undefined;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  return {
    r: clamp(rgb.r),
    g: clamp(rgb.g),
    b: clamp(rgb.b),
    a: rgb.alpha === undefined ? 1 : rgb.alpha,
  };
}

// Find every renderable colour in a line of CSS. Returns document-order
// { index, length, str, rgb } entries; overlapping candidates are dropped.
function findColors(text) {
  const found = [];
  const overlaps = (i, len) =>
    found.some((f) => i < f.index + f.length && i + len > f.index);
  const add = (index, length, str) => {
    if (overlaps(index, length)) return;
    const rgb = toChip(str);
    if (rgb) found.push({ index, length, str, rgb });
  };
  let m;
  FUNC.lastIndex = 0;
  while ((m = FUNC.exec(text))) add(m.index, m[0].length, m[0]);
  REL.lastIndex = 0;
  while ((m = REL.exec(text))) {
    const base = m[1];
    add(m.index + m[0].length - base.length, base.length, base);
  }
  HEX.lastIndex = 0;
  while ((m = HEX.exec(text))) add(m.index, m[0].length, m[0]);
  NAMED.lastIndex = 0;
  while ((m = NAMED.exec(text))) add(m.index, m[0].length, m[0]);
  return found.sort((a, b) => a.index - b.index);
}

module.exports = { findColors };
```

- [ ] **Step 5: Run the test — GREEN**

Run: `node --test src/colorMatch.test.js`
Expected: all tests pass.

- [ ] **Step 6: Add to the audit unit-test script**

In `package.json` `scripts`, extend `audit:test` to include `src/colorMatch.test.js`:
`"audit:test": "node --test audit/corpus.test.js audit/probe-data.test.js audit/probe-corpus.test.js audit/report.test.js src/colorMatch.test.js"`

Run: `npm run audit:test`
Expected: all suites pass (13 + 6 new).

- [ ] **Step 7: Commit**

```bash
git add src/colorMatch.js src/colorMatch.test.js package.json package-lock.json
git commit --no-gpg-sign -m "colorMatch: pure culori-based findColors with modern color functions"
```

---

### Task 2: Rewire `colorProvider.ts` onto `findColors`; drop d3-color

**Files:** Modify `src/colorProvider.ts`, `package.json`.

**Interfaces:** Consumes `findColors` from `./colorMatch`.

- [ ] **Step 1: Rewrite `src/colorProvider.ts`**

```ts
import {
  Color,
  TextDocument,
  ColorInformation,
  Range,
  ColorPresentation,
} from "vscode";
import { formatHex, formatRgb, formatHsl } from "culori";
const { findColors } = require("./colorMatch");

export const colorProvider = {
  provideColorPresentations(color: Color) {
    const rgb = {
      mode: "rgb" as const,
      r: color.red,
      g: color.green,
      b: color.blue,
      alpha: color.alpha,
    };
    return [
      new ColorPresentation(formatHex(rgb)),
      new ColorPresentation(formatRgb(rgb)),
      new ColorPresentation(formatHsl(rgb)),
    ];
  },
  provideDocumentColors(document: TextDocument) {
    const colors: ColorInformation[] = [];
    for (let i = 0; i < document.lineCount; i++) {
      const text = document.lineAt(i).text;
      for (const c of findColors(text)) {
        colors.push(
          new ColorInformation(
            new Range(i, c.index, i, c.index + c.length),
            new Color(c.rgb.r, c.rgb.g, c.rgb.b, c.rgb.a)
          )
        );
      }
    }
    return colors;
  },
};
```

- [ ] **Step 2: Remove d3-color from `package.json`**

Delete `"d3-color": "^3.1.0"` from dependencies and `"@types/d3-color": "^3.1.0"` from devDependencies.

Run: `npm install`
Expected: lockfile updates; `node_modules/d3-color` removed (or de-duped away).

- [ ] **Step 3: Compile**

Run: `npm run compile`
Expected: builds `dist/extension.js` with no error (culori bundled, no d3-color import remains). If TypeScript complains about the `require` for colorMatch, keep it as `const { findColors } = require("./colorMatch");` (esbuild resolves it; the file is JS).

- [ ] **Step 4: Sanity-check bundle contains no d3-color**

Run: `grep -c "d3-color" dist/extension.js || echo "0 (d3-color gone)"`
Expected: `0`.

- [ ] **Step 5: Confirm unit tests still pass**

Run: `npm run audit:test`
Expected: all pass (colorMatch tests unaffected).

- [ ] **Step 6: Commit**

```bash
git add src/colorProvider.ts package.json package-lock.json
git commit --no-gpg-sign -m "colorProvider: use findColors + culori presentations; drop d3-color"
```

---

### Task 3: Node color probe + report wiring; drop editor color loop

**Files:** Create `audit/probe-color.js`; Modify `audit/run.js`, `audit/report.js`, `audit/report.test.js`, `audit/editor/suite/probe.test.js`.

**Interfaces:** `audit/probe-color.js` produces `runColorProbe() → Finding[]` (`layer: "color"`).

- [ ] **Step 1: Write `audit/probe-color.js`**

```js
"use strict";
const { findColors } = require("../src/colorMatch");
const { CORPUS } = require("./corpus");

function runColorProbe() {
  const findings = [];
  for (const entry of CORPUS.filter((e) => e.expectedLayer === "color")) {
    if (findColors(entry.css).length === 0) {
      findings.push({
        feature: entry.feature,
        layer: "color",
        probe: "color",
        symptom: "no inline color swatch produced",
        evidence: entry.css,
        fixLocation: "src/colorMatch.js / src/colorProvider.ts",
      });
    }
  }
  return findings;
}

module.exports = { runColorProbe };

if (require.main === module) {
  console.log(JSON.stringify(runColorProbe(), null, 2));
}
```

- [ ] **Step 2: Wire into `audit/run.js`**

After the Probe B block, add:

```js
const { runColorProbe } = require("./probe-color");
const colorFindings = runColorProbe();
fs.writeFileSync(
  path.join(outDir, "probe-color.json"),
  JSON.stringify(colorFindings, null, 2)
);
console.log(`Probe color: ${colorFindings.length} color findings`);
```

- [ ] **Step 3: Update `audit/report.js`**

- In `writeReport`, read `probe-color.json` (tolerate missing) and pass it to `buildReport` as `colorFindings`.
- In `buildReport({ dataDiff, corpusFindings, editorFindings, colorFindings = [], corpus, dateISO })`, build the findings list from `corpusFindings` + `autocompleteFindings(dataDiff)` + highlighting-only `editorToFindings(editorFindings)` + `colorFindings`.
- Change `editorToFindings` to emit only the `highlighting` layer (color now comes from `colorFindings`).

- [ ] **Step 4: Update `audit/report.test.js`**

Adjust the fixture: move the color entry out of `editorFindings` into a new `colorFindings` array passed to `buildReport`; keep the existing assertions (`summary.color === 1`, `## Color` section present).

```js
// in the fixture object:
editorFindings: { highlighting: [] },
colorFindings: [
  { feature: "oklch", layer: "color", probe: "color", symptom: "no inline color swatch produced", evidence: "...", fixLocation: "..." },
],
```

- [ ] **Step 5: Drop the color loop from `audit/editor/suite/probe.test.js`**

Remove the color section (the `colorDoc`/`executeDocumentColorProvider` block and the `color` array) and `inRange`; write only `{ highlighting }` to `editor-findings.json`.

- [ ] **Step 6: Run unit tests**

Run: `npm run audit:test`
Expected: all pass (report.test.js updated).

- [ ] **Step 7: Full audit**

Run: `AUDIT_DATE=2026-07-16 npm run audit`
Expected: Probe color reports **0** findings (oklch/oklab/relative now swatch; color-mix/light-dark inner colors swatch). Report summary: `validation 0, autocomplete 0, highlighting 1, color 0`.

Run: `node -e "const j=require('./docs/superpowers/audit/report.json'); console.log(JSON.stringify(j.summary))"`
Expected: `{"validation":0,"autocomplete":0,"highlighting":1,"color":0}`. If color ≠ 0, list the residual and its reason.

- [ ] **Step 8: Commit**

```bash
git add audit/probe-color.js audit/run.js audit/report.js audit/report.test.js audit/editor/suite/probe.test.js docs/superpowers/audit/
git commit --no-gpg-sign -m "audit: node color probe (reliable); drop flaky editor color check"
```

---

## Self-Review

**Spec coverage:** colorMatch extraction (T1) · culori swap + colorProvider (T1,T2) · d3-color removal (T2) · node color probe + report wiring (T3) · editor probe highlighting-only (T3) · verification via unit test + re-audit (T1,T3). All spec items mapped.

**Placeholder scan:** T1 code is complete and prototype-validated. T2 colorProvider is complete. T3 describes exact edits with the new module fully coded and the report/test changes specified with the fixture shape.

**Type/name consistency:** `findColors(text) → {index,length,str,rgb:{r,g,b,a}}` used identically in colorProvider (Range + Color) and probe-color. `Finding` shape (`feature,layer,probe,symptom,evidence,fixLocation`) matches report.js. `runColorProbe` name consistent T3 S1/S2.

## Risks & notes

- **culori API:** `parse`, `converter('rgb')`, `clampRgb`, `formatHex/Rgb/Hsl` — all verified present in culori 4.0.2 via scratch prototype.
- **light-dark first arg:** the `(` in the NAMED lookbehind is what makes both args swatch; the test asserts `["blue","red"]`.
- **relative color** swatches the base only (approximation; documented in `colorMatch.js` comment via the REL rule).
- **Extension-Host color** is intentionally no longer measured; if `executeDocumentColorProvider` reliability improves upstream, a future editor cross-check could be re-added.
