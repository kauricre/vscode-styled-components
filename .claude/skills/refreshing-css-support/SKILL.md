---
name: refreshing-css-support
description: Use when adopting newer CSS into the vscode-styled-components extension or checking whether it has fallen behind — a new property, at-rule, selector/pseudo-class, or color function that isn't recognized (false "unknown" error), autocompleted, highlighted, or color-swatched in styled template literals.
---

# Refreshing CSS support

## Overview

The extension supports CSS in **four independent layers**, each owned by a different
place in the repo. Refreshing = **measure with the audit harness, confirm the gap is
real, then fix only the owning layer.** Do not guess which layer; the audit tells you.

## The four layers (who owns each gap)

| Layer            | Symptom when behind                              | Owner / fix location                                             |
| ---------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| **Validation**   | false `unknown property/at-rule` squiggle        | `vscode-css-languageservice` (a dependency) — bump it            |
| **Autocomplete** | new property/value/at-rule not suggested         | same `vscode-css-languageservice` dependency                     |
| **Highlighting** | token not colored as CSS (renders as plain text) | `syntaxes/css.styled.json` (TextMate grammar)                    |
| **Color swatch** | no inline color chip on a color value            | `src/colorMatch.js` (culori); `src/colorProvider.ts` consumes it |

Validation + autocomplete come from ONE hoisted `vscode-css-languageservice` copy used
by both the TS-server plugin (`@styled/typescript-styled-plugin`) and the extension.

## Workflow

1. **Add each feature to the corpus** — `audit/corpus.js`, tagged with its
   `expectedLayer` (`validation` | `color` | `highlighting`; autocomplete is covered by
   the data-diff, no entry needed). Keep the `css` interpolation-free.
2. **Measure** — `npm run audit`, then read `docs/superpowers/audit/report.md`. It lists
   every gap by layer with a suggested fix location. (Probe A = exhaustive vocabulary
   diff; Probe B = engine diagnostics; node color probe; editor probe = highlighting.)
3. **Verify-first (the load-bearing step).** A finding is a _hypothesis_, not a fact —
   the editor/heuristic probes have false-positived before. Confirm the gap is real:
   reproduce in a real `.tsx`, or check the actual engine (`node -e` via
   `audit/resolve.js`'s `resolvePluginCss()` → `doValidation`/`doComplete`). Never fix an
   unconfirmed finding.
4. **Fix in the owning layer** (table above). See "Fix rules" below.
5. **Re-verify** — `npm run audit` → target layer back to **0**; `npm run audit:test`;
   `npm test` (colorization, pinned to a VS Code version); `npm run compile` builds and
   the bundle activates.
6. **Release** — see `RELEASING.md` (version bump, CHANGELOG, publisher, GitHub Release).

## Fix rules (the judgment that's easy to get wrong)

- **Validation/autocomplete:** bump `vscode-css-languageservice` in `package.json`, then
  `npm install`. If it's already at the latest and the feature is _still_ missing, that's
  an **upstream-data gap, not this fork's bug** — document it (CHANGELOG/report), do NOT
  fork `@styled/typescript-styled-plugin` (it has no custom-data hook; forking was
  rejected — see `docs/superpowers/specs/2026-07-16-css-languageservice-bump-design.md`).
- **Highlighting:** add a **generic fallback** rule to `syntaxes/css.styled.json`, never a
  hardcoded keyword. At-rules (`at_rule_custom`) and pseudo-classes (the `:popover-open`
  fix, commit precedent in `docs/superpowers/specs/…popover-open…`) already work this way;
  match that pattern (place the fallback LAST so specific rules win first).
- **Color:** extend `findColors` in `src/colorMatch.js` (culori parses oklch/oklab/hwb/…;
  functions it can't parse — color-mix/light-dark/relative — degrade to their inner/base
  colors). Add a `src/colorMatch.test.js` case.

## Common mistakes

- **Hardcoding a keyword** into a grammar list instead of a fallback → re-breaks on the
  next new feature. Use a fallback.
- **Skipping verify-first** → "fixing" something already supported, or editing the wrong
  layer. The `text-box` value-completion gap looks like our bug but is upstream data.
- **Trusting a single probe.** Cross-check: Probe A (data) vs Probe B (diagnostics) vs the
  editor probe can disagree; the node probes are deterministic, the editor heuristics are
  not (that's why highlighting/color findings must be confirmed).
- **Forgetting to re-pin/regenerate colorization snapshots** if you bump the tested VS
  Code version (`src/tests/runTests.js`) — they capture VS Code's own theme colors.
