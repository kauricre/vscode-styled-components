# Modern Color Functions in colorProvider — Design

**Status:** Approved (autonomous, per user grant) · **Date:** 2026-07-16

This is **workstream C** of the fixes effort. It makes the extension's inline color
swatches work for modern CSS color functions, and — because investigation showed
the audit's Extension-Host color probe is unreliable — moves color detection to a
deterministic node-level probe. Branch `feat/color-provider`, **stacked on
`feat/confirm-highlighting`** (workstream B).

## Goal

Inline color swatches appear for modern color functions in styled templates, and
the audit measures color support reliably. Close the genuine color gaps
(**oklch, oklab, relative-color**) while preserving existing swatches.

## Investigation (empirical, verify-first)

- **culori 4.0.2** (tested in scratch) parses `oklch`, `oklab`, `hwb`, `lab`, `lch`
  — but NOT `color-mix()`, relative color `rgb(from …)`, or `light-dark()`.
  `oklch(0.7 0.15 200)` is outside sRGB gamut, so conversion must clamp.
- **The shipped `colorProvider` logic** (exact source regex + `d3-color`, replicated
  in node) currently swatches: `oklch`→none, `oklab`→none,
  `color-mix(in oklch, red, blue)`→`red`,`blue` (inner names), `rgb(from red r g b)`→none,
  `light-dark(red, blue)`→`blue` (inner name). **True gaps: oklch, oklab,
  relative-color.** color-mix / light-dark already swatch their inner named colors.
- **The audit's Extension-Host color probe is unreliable.** With the extension
  active (`extActive: true`) and the document `typescriptreact`,
  `vscode.executeDocumentColorProvider` returned **0** colors for the whole fixture
  (verified with an instrumented run) — a known limitation of document-color
  providers under headless `@vscode/test-electron`. The 5 committed color findings
  are therefore largely harness artifacts, not capability gaps.

## Decision

Two coupled changes, mirroring the Probe A/B philosophy (measure in node, not the
flaky editor):

1. **Extract pure color matching to `src/colorMatch.js`** — a CommonJS module,
   `findColors(text) → Array<{ index, length, rgb: {r,g,b,a} }>` (channels 0–1),
   backed by **culori**. This is the single source of truth, importable by both the
   VS Code provider and node tests/probes (no `vscode` dependency).
2. **Detect color support in node**, not the Extension Host. A new
   `audit/probe-color.js` runs `findColors` over each color-layer corpus entry;
   Probe C (editor) keeps **highlighting only**. `run.js`/`report.js` are rewired so
   the report's color findings come from the node probe.

### Why drop the Extension-Host color check rather than fix it

`executeDocumentColorProvider` does not reliably surface a third-party document
color provider in headless test-electron (returned 0 for an active provider).
Fighting that is brittle; the provider's logic is pure and deterministic, so a
node-level check on the shared `findColors` is faithful _and_ stable — exactly how
Probe B handles diagnostics.

## Target behavior of `findColors`

For each candidate color substring, `culori.parse` → convert to sRGB → clamp to
gamut → emit a swatch. Candidate detection covers:

| Input                                    | Handling                                 | Swatch                     |
| ---------------------------------------- | ---------------------------------------- | -------------------------- |
| `#rgb`/`#rrggbb`/`#rrggbbaa`             | culori.parse                             | yes (unchanged)            |
| `rgb()/rgba()/hsl()/hsla()`              | culori.parse                             | yes (unchanged)            |
| named (after `:` or `,`)                 | culori.parse                             | yes (unchanged)            |
| `oklch()/oklab()/hwb()/lab()/lch()`      | culori.parse + clamp                     | **yes (new)**              |
| relative color `rgb(from <base> …)` etc. | parse `<base>`, swatch base              | **yes (new, approximate)** |
| `color-mix(in …, A, B)`                  | inner named/hex A,B matched individually | yes (inner colors)         |
| `light-dark(A, B)`                       | inner named/hex A,B matched individually | yes (inner colors)         |

Relative color: the resolved channel math is not computed; we swatch the **base
color** (`rgb(from red …)` → swatch `red`) as an honest approximation, documented in
code. color-mix composite value is not computed (culori can't parse the function);
its argument colors swatch individually, which is useful and matches current
behavior.

`d3-color` is **removed** (and `@types/d3-color`); culori replaces it for parsing,
conversion, and `provideColorPresentations` formatting (`formatHex`/`formatRgb`/
`formatHsl`).

## Files

| File                               | Change                                                           |
| ---------------------------------- | ---------------------------------------------------------------- |
| `package.json`                     | add `culori` dep; remove `d3-color`, `@types/d3-color`           |
| `src/colorMatch.js` (new)          | pure `findColors(text)` via culori                               |
| `src/colorProvider.ts`             | use `findColors`; culori-based presentations; no inline regex/d3 |
| `src/colorMatch.test.js` (new)     | `node:test` unit tests for `findColors`                          |
| `audit/probe-color.js` (new)       | node color probe over corpus color entries                       |
| `audit/editor/suite/probe.test.js` | remove color loop (highlighting only)                            |
| `audit/run.js`, `audit/report.js`  | wire color findings from the node probe                          |
| `docs/superpowers/audit/*`         | regenerated                                                      |

## Verification / acceptance

- `src/colorMatch.test.js` (node): `oklch`/`oklab`/hex/`rgb`/`hsl`/named → a clamped
  in-range rgb; `color-mix`/`light-dark` → their inner named colors; relative color
  → base-color swatch. These are the committed, authoritative color guards.
- `npm run audit:test` includes the new color test and stays green.
- `npm run audit` → color findings computed in node → **0** (oklch/oklab/relative
  closed; color-mix/light-dark already swatch). If any residual, it's reported with
  the reason.
- `npm run compile` builds `dist/extension.js` against culori (esbuild bundles it).
- No behavioral regression to existing hex/rgb/hsl/named swatches (covered by the
  new unit test, which the old code had none of).

### Done criteria

- Modern color functions swatch (oklch/oklab confirmed via unit test + node probe).
- Color detection is node-level and deterministic; Extension-Host probe no longer
  used for color.
- `d3-color` removed; culori added; `npm run compile` green.
- Report color count at the node-measured floor (expected 0); committed.

## Non-goals

- **No `syntaxes/*.json` changes** (that's the `:popover-open` grammar item,
  handled separately on the release track).
- **No composite color-mix computation** and **no full relative-color channel
  resolution** — approximations documented; revisit only if needed.
- No change to the diagnostics/validation/autocomplete or highlighting probes
  beyond removing the color loop from the editor probe.

## Risks

- **Touches shipped `colorProvider.ts`.** Mitigated by extracting logic to
  `colorMatch.js` with real `node:test` coverage (the file had none before) — a net
  testability improvement.
- **culori bundle size:** small and tree-shaken by esbuild; acceptable for the
  color-conversion capability.
- **Gamut clamping** of wide-gamut oklch/oklab yields an approximate sRGB swatch —
  expected and standard for an sRGB color chip.

## Reference

| File                                          | Role                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `src/colorProvider.ts:12-84`                  | current regex + d3-color logic being replaced                         |
| `src/extension.ts:30-32`                      | registers the color provider (unchanged)                              |
| `build.mjs`                                   | esbuild bundles `src/colorMatch.js` + culori into `dist/extension.js` |
| `audit/probe-corpus.js`                       | node-probe pattern `audit/probe-color.js` mirrors                     |
| scratch `probe-culori.mjs`, `probe-exact.mjs` | the empirical basis for this design                                   |
