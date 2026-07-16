# Modern CSS Audit Harness — Design

**Status:** Approved · **Date:** 2026-07-16 · **Author:** brainstorming session

## Goal

Build a reproducible audit harness that measures how well this fork of
`vscode-styled-components` supports modern (2026-era) CSS, and emits a
**categorized report** naming each gap, its symptom, and its root-cause layer.

The report is the deliverable. It exists to answer one question with evidence:
_where, exactly, is the plugin behind, and what would fix each gap?_

### Non-goals (this spec)

- **No fixes.** No dependency bumps, no TextMate grammar edits, no
  `colorProvider` changes. The audit only _observes and reports_.
- **No editor UX changes.** We do not touch activation, commands, or settings.
- **No new runtime features.** The harness is dev/CI tooling, not shipped in the
  packaged extension.

Fixes become a **follow-up spec** informed by this report — e.g. we will know
whether bumping `vscode-css-languageservice` alone resolves most validation
gaps _before_ writing any fix code.

## How it works today

This repository has **two independent layers** that a naive reader conflates:

| Concern                                           | Who owns it                                                                                             | Lives in                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Syntax highlighting                               | TextMate grammars in **this repo**                                                                      | `syntaxes/*.json`                                                                                                    |
| "expand template string" snippet                  | This repo                                                                                               | `src/completionItemProvider.ts`                                                                                      |
| Inline color swatches                             | This repo                                                                                               | `src/colorProvider.ts` (+ `d3-color`)                                                                                |
| Colon/semicolon-on-Enter helper                   | This repo                                                                                               | `src/insertColonCommand.ts` (only in-repo importer of `vscode-css-languageservice`, via `getDefaultCSSDataProvider`) |
| **CSS validation** ("unknown property: overlay")  | **`@styled/typescript-styled-plugin`** (a TypeScript Server plugin, registered at `package.json:68-73`) | separate package + `vscode-css-languageservice`                                                                      |
| **CSS autocomplete** (property/value suggestions) | Same TS Server plugin                                                                                   | separate package + `vscode-css-languageservice`                                                                      |

**Verified:** `grep -rn "Diagnostic" src/` returns nothing. This repository
emits **zero CSS diagnostics of its own**. The `overlay` red-squiggle the user
reported is produced by the TS Server plugin running `vscode-css-languageservice`,
whose property knowledge comes from MDN Data (README line 68).

Relevant pinned versions (`package.json`):

- `vscode-css-languageservice`: `^6.2.1` (line 91) — extension's top-level copy
- `@styled/typescript-styled-plugin`: `^1.0.0` (line 70)

The **diagnostic path uses the `vscode-css-languageservice` bundled inside the
TS plugin**, which may differ from the extension's top-level `^6.2.1`. The
harness must resolve and report the version the plugin _actually_ uses, or it
measures the wrong dictionary.

## Analysis

Different bug classes have different root causes and therefore different fix
locations. **A single "catch all issues" pass must be split by layer**, because
a fix in one layer does nothing for another:

- Highlighting gaps → TextMate grammar (this repo)
- Validation / autocomplete gaps → css-languageservice data version (dependency)
- Color-swatch gaps → `colorProvider.ts` (this repo)

Two complementary detection strategies cover this:

- **Data-diff** answers _"what is in the plugin's dictionary?"_ — exhaustive for
  the validation/autocomplete vocabulary, but blind to highlighting and color.
- **Behavioral corpus** answers _"given realistic modern CSS, what does the
  plugin actually do?"_ — catches value-level, selector-level, highlighting, and
  color behavior that raw data-diff misses.

**Conclusion: we need both, and the behavioral corpus must run through the real
Extension Host for the two layers (highlighting, color) that cannot be measured
any other way.**

## Decision

**Hybrid probes.** Use cheap deterministic Node scripts where the engine is a
plain library; use the real Extension Host only where it is genuinely required.

### Why not "everything through the real Extension Host"

TS-server diagnostics are asynchronous and warm-up-dependent. Driving all four
layers through `@vscode/test-electron` makes the whole suite flaky, slow, and
hard to diff. We pay that tax only for the layers that require it.

### Why not "everything as pure Node proxies"

Highlighting and color swatches cannot be measured without the real grammar
tokenizer and `colorProvider`. A pure-Node harness structurally cannot cover two
of the four target layers.

### Why not "true plugin-level diagnostics" for Probe B

Driving `@styled/typescript-styled-plugin` itself (a full TS `LanguageService`
with the plugin loaded, incl. `${...}` interpolation plumbing) is heavier to
build and more flake-prone. The diagnostic **engine** is `vscode-css-languageservice`;
calling it directly reproduces the squiggle-producing logic faithfully enough to
catch the vocabulary/value/selector gaps we care about. Probe C covers true
end-to-end behavior for the layers that need it. **Chosen: engine-level proxy.**

## Target architecture

Three probes feeding one report.

### Probe A — Data-diff (Node, no editor)

Enumerate every CSS entity the plugin's **bundled** css-languageservice knows —
properties, at-directives, pseudo-classes, pseudo-elements — via
`getDefaultCSSDataProvider()`, and diff against the **latest** css-languageservice
installed under an npm alias
(`"css-latest": "npm:vscode-css-languageservice@latest"`).

- **Input:** the two data providers (bundled vs latest).
- **Output:** the exhaustive vocabulary gap — entities the latest knows that the
  bundled version does not. This alone explains and quantifies the `overlay` bug.
- **Fidelity note:** resolves the css-languageservice copy the **TS plugin**
  uses (nested `node_modules/@styled/typescript-styled-plugin/node_modules/…`
  if present, else the hoisted copy) and records that version in the report.

### Probe B — Corpus diagnostics (Node, engine-level proxy)

Run `doValidation()` at the **bundled** version on the extracted CSS of each
corpus case.

- **Input:** each corpus fixture's CSS body (interpolations stripped/placeholdered
  with a simple, documented extraction).
- **Output:** which modern features get false diagnostics, with the exact
  diagnostic message. Catches **value-level** (`color: oklch(...)`), **at-rule**
  (`@container`), and **selector-level** (nesting `&`, `:has()`) gaps that Probe
  A misses.

### Probe C — Highlighting + color (real Extension Host)

Extend the existing mocha / `@vscode/test-electron` suite (already used for
colorization at `src/tests/`). Feed the corpus `.tsx` through the real grammar
tokenizer and `colorProvider`.

- **Input:** corpus fixtures as `.tsx` documents opened in the Extension Host.
- **Output:** modern syntax that fails to tokenize as CSS (highlighting gaps),
  and modern color syntax (`oklch()`, `color-mix()`, relative colors) that
  produces no color swatch.

### The corpus

A tagged set of modern-CSS-in-`styled` fixtures (`.tsx`), each declaring
`{ feature, expectedLayer }`. The same fixtures feed Probe B and Probe C.

Starter set (2026 Baseline-ish):

- `overlay`
- `@container` + container queries
- `@layer`
- CSS nesting (`&`)
- `:has()`, `:is()`, `:where()`
- `oklch()`, `oklab()`
- `color-mix()`
- relative color syntax (`rgb(from …)`)
- `light-dark()`
- `text-wrap: balance` / `pretty`
- `subgrid`
- `field-sizing`
- `@property`
- `@scope`
- `@starting-style`
- `transition-behavior: allow-discrete`
- scroll-driven animations (`animation-timeline`, `scroll()`, `view()`)
- anchor positioning (`anchor-name`, `position-anchor`)
- `content-visibility`
- `:popover-open`

Each feature must classify into **exactly one** `expectedLayer`
(`validation` | `autocomplete` | `highlighting` | `color`) so a failure points
straight at the fix location. A feature may appear in more than one fixture if
it legitimately exercises more than one layer.

### Location, running, output

- New `audit/` directory. Corpus fixtures placed so `src/tests/` can reuse them
  for Probe C.
- npm scripts: `audit:data` (A), `audit:corpus` (B), `audit:editor` (C), and
  `audit` (all three).
- **Report output:**
  - `docs/superpowers/audit/YYYY-MM-DD-report.md` — human-readable, categorized
    by layer. Each finding: _feature · symptom · root-cause layer · evidence
    (exact diagnostic message / missing token) · suggested fix location_. Plus
    summary counts per layer (e.g. "N properties missing from bundled data").
  - `docs/superpowers/audit/YYYY-MM-DD-report.json` — machine-readable, for
    diffing and future regression tracking.

## Verification / done criteria

- On a fresh `npm install`, `npm run audit` runs to completion and produces both
  the `.md` and `.json` report.
- The report **reproduces the `overlay` symptom** and names its root cause
  (stale bundled css-languageservice data).
- **Every corpus feature** appears in the report, classified into exactly one
  layer.
- Probe C runs in the existing `@vscode/test-electron` harness without breaking
  the current colorization tests.
- The report records the **actual css-languageservice version the TS plugin
  resolves**, not just the top-level `^6.2.1`.

## Risks & open questions

- **Bundled-version resolution.** If npm hoists css-languageservice so the plugin
  shares the top-level copy, Probe A's "bundled vs latest" is really "top-level
  vs latest." The harness must detect and state which case holds. _Mitigation:_
  resolve via `require.resolve` from the plugin's entry and report the resolved
  path + version.
- **CSS extraction fidelity (Probe B).** The engine-level proxy strips/placeholders
  `${...}` interpolations with a simple heuristic, not the plugin's exact logic.
  Accepted tradeoff (see Decision). _Mitigation:_ keep fixtures interpolation-light
  where the feature under test allows, and document the extraction rule.
- **TS-server timing (Probe C).** Diagnostics via the real plugin are async; we
  deliberately keep diagnostics in Probe B (Node) and limit Probe C to
  highlighting + color, which the existing suite already handles synchronously.
- **Corpus completeness.** The starter set is not exhaustive; Probe A's data-diff
  is the exhaustive backstop for the validation/autocomplete vocabulary. The
  report should `log`/note that the corpus is a curated sample for the
  highlighting/color layers.

## Reference table

| File / path                     | Role                                                                   |
| ------------------------------- | ---------------------------------------------------------------------- |
| `package.json:68-73`            | Registers `@styled/typescript-styled-plugin` as a TS Server plugin     |
| `package.json:91`               | Extension's top-level `vscode-css-languageservice ^6.2.1`              |
| `src/extension.ts:17-43`        | Extension activation — completion, color, colon helper; no diagnostics |
| `src/colorProvider.ts`          | Owns inline color swatches (Probe C target)                            |
| `src/insertColonCommand.ts:2`   | Only in-repo `vscode-css-languageservice` import                       |
| `syntaxes/*.json`               | TextMate grammars — owns highlighting (Probe C target)                 |
| `src/tests/`                    | Existing `@vscode/test-electron` + mocha suite (Probe C host)          |
| `audit/` (new)                  | Harness scripts + corpus                                               |
| `docs/superpowers/audit/` (new) | Report output (`.md` + `.json`)                                        |
