---
name: debugging-styled-components-extension
description: Use when triaging a bug report or unexpected behavior in the vscode-styled-components extension — false "unknown property/at-rule" errors, missing or wrong syntax highlighting, missing autocomplete, missing inline color swatches, or the extension failing to activate — in styled-components template literals.
---

# Debugging the vscode-styled-components extension

## Overview

Triage in this order: **(1) is the reporter on the current version? (2) reproduce it
minimally, (3) confirm it's REAL, (4) identify which of the layers owns it, (5) fix
only that layer.** Most "bugs" are stale installs, already-fixed issues, or audit-probe
artifacts — verify before touching code.

## Step 1: version first

Many reports are pre-fix installs. Check the reporter's extension version against
`CHANGELOG.md`. The v1.8.0 "modern CSS refresh" fixed whole classes of these (false
`unknown property` on modern CSS, missing oklch/color-mix swatches). If they're on an
older build, the fix is "upgrade," not a code change. **Also:** two styled-components
extensions installed at once (this fork + the original `styled-components.*`) run
conflicting providers — check for that.

## Step 2: which layer? (symptom → owner → how to verify)

| Symptom                                   | Layer / owner                                       | Confirm it's real by                                                                                                      |
| ----------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| false `unknown property/at-rule` squiggle | **validation** → `vscode-css-languageservice` (dep) | `resolvePluginCss()` (`audit/resolve.js`) → `doValidation` on the CSS                                                     |
| property/value/at-rule not suggested      | **autocomplete** → same dep                         | same resolve → `doComplete` at a position                                                                                 |
| token not colored as CSS                  | **highlighting** → `syntaxes/css.styled.json`       | open a real `.tsx`; check the token's TextMate scope (`_workbench.captureSyntaxTokens`) — NOT the audit's heuristic alone |
| no inline color chip                      | **color** → `src/colorMatch.js` (culori)            | `require('./src/colorMatch').findColors(css)`                                                                             |
| extension won't activate                  | **build/bundle** → `build.mjs` (esbuild)            | load `dist/extension.js` in node with a `vscode` stub; run `npm run audit` for the substantive layers                     |

Or just run `npm run audit` for a full sweep across validation/autocomplete/highlighting/color.

## Step 3: verify-first (non-negotiable)

The audit's editor/heuristic probes have false-positived before (highlighting; the
`text-box`/color-function value gaps). A finding or a user claim is a hypothesis. Reproduce
against the **real engine/matcher** (table above) before concluding it's a bug. If it
reproduces on the current version, it's real; if not, it's a stale install or a probe
artifact.

## Known gotchas (hard-won — check these first)

| Symptom                                                    | Cause & fix                                                                                                                                                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| activation error `Cannot find module './parser/cssParser'` | esbuild bundled `vscode-css-languageservice`'s UMD `main`. `build.mjs` needs `mainFields: ["module","main"]` (prefer ESM) **and** `await context.rebuild()` before dispose (else truncated bundle). |
| CI: `listen EINVAL` on a `.sock` path                      | AF_UNIX path > ~103 chars. `src/tests/runTests.js` sets `--user-data-dir` under `os.tmpdir()`.                                                                                                      |
| `npm test` fails after a VS Code release                   | colorization snapshots capture VS Code's built-in grammar + theme colors. The VS Code version is pinned in `runTests.js`; bump + regenerate `colorize-results/` deliberately.                       |
| real modern property flagged `unknown`                     | bump `vscode-css-languageservice`. If already latest → **upstream-data gap, not this fork's bug** (don't fork `@styled/typescript-styled-plugin`).                                                  |
| `.vsix` "works" but doesn't activate                       | `vsce package` succeeding ≠ bundle activating. Load the packaged `dist/extension.js` in node (stub `vscode`) to confirm.                                                                            |

## Fixing

Once confirmed and localized, adopting/fixing follows the same layer rules as
**refreshing-css-support** (prefer generic grammar fallbacks over hardcoded keywords;
color goes in `colorMatch.js`; validation/autocomplete is the dependency version).
Release via `RELEASING.md`.

## Architecture note

CSS intelligence has two runtime consumers of one hoisted `vscode-css-languageservice`:
the TS-server plugin `@styled/typescript-styled-plugin` (live validation/autocomplete in
`.tsx`/`.jsx`) and the extension host itself (`insertColonCommand`, bundled by esbuild).
Highlighting is entirely separate (TextMate grammar). A fix in one does nothing for another.
