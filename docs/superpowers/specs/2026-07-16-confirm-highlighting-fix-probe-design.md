# Confirm Highlighting + Fix Probe C Heuristic — Design

**Status:** Approved · **Date:** 2026-07-16 · **Author:** brainstorming session

This is **workstream B** of the fixes effort scoped from the modern-CSS audit.
Investigation showed the 6 highlighting findings are almost certainly **heuristic
false positives** — the grammar (`syntaxes/css.styled.json`) already highlights all
six. So B is not a grammar fix; it is an _empirical confirmation_ plus a _fix to
the probe that mis-reported them_.

## Goal

Prove the 6 highlighting findings are false positives by capturing the **actual
TextMate scopes** of each construct, fix Probe C's highlighting check so it stops
false-positiving, and close workstream B via a re-audit. Expected outcome:
highlighting drops to ~0 with **zero grammar edits**.

### Non-goals

- **No `syntaxes/*.json` changes.** The grammar already handles all six (verified):
  `at_rule_custom` (`css.styled.json:36,362`) is live and scopes any `@<name>` block
  as `keyword.control.at-rule.css`; `selector_pseudo_class` (`:1124-1130`) delegates
  `:has()`/`:popover-open` to the current built-in `source.css`.
- **No feature-specific highlighting "polish"** (the option not chosen).
- **No color-probe changes.** The color check (`probe.test.js:56-68`) is correct and
  stays as-is; the combined `fixture.tsx` it relies on is unchanged.
- **No fixes to the extension itself** (`src/`).

## How it works today (the bug)

`audit/editor/suite/probe.test.js:37-49` computes highlighting gaps like this:

```js
const sig = signatureToken(entry.feature); // e.g. "@container"
const hit = tokens.find((tk) => tk.c && tk.c.includes(sig));
if (!hit || !scopeHasCss(hit.t)) {
  /* flag as gap */
}
```

`signatureToken` returns `@container`, `:has`, etc. (`:79-90`). The bug: the grammar
tokenizes `@container` as **two** tokens — `@` and `container` — each scoped
`keyword.control.at-rule.css`. No single token's text contains the substring
`@container`, so `hit` is `undefined` and the construct is flagged — **even though it
is fully CSS-scoped**. The check conflates "signature substring absent from one
token" with "not highlighted." All 6 findings arise this way.

`generate-fixture.js` emits one **combined** `fixture.tsx` (all corpus entries) plus
`fixture.map.json` with per-entry line spans. `captureSyntaxTokens` returns
document-order tokens as `{ c, t, r }` with **no positions**, so the current code
cannot attribute a token to a specific entry — which is why it fell back to the
fragile substring search.

## Decision: scope-based detection with per-feature isolation

Two coupled changes:

1. **Per-feature highlighting fixtures.** `generate-fixture.js` additionally emits one
   tiny `.tsx` per highlighting-layer corpus entry at
   `audit/editor/highlighting/<feature>.tsx` — a single styled component containing
   just that construct. Because each file contains only one construct, **every token
   in it belongs to that feature**, eliminating the attribution problem without
   needing token positions. The combined `fixture.tsx` stays for the color check.

2. **Scope-based gap rule.** `probe.test.js`'s highlighting loop opens each
   per-feature file, runs `captureSyntaxTokens`, and decides:

   - Match tokens whose text contains the feature's **identifier** (the `@`-less /
     `:`-less core: `container`, `layer`, `scope`, `starting-style`, `has`,
     `popover-open`, and `&` for nesting).
   - **Real gap** = none of those matching tokens carries a `.css`/`.scss` scope
     (reuse the existing `scopeHasCss` at `probe.test.js:16-17`) — i.e. the construct
     fell through to plain `string.template`/`meta.embedded`.
   - Record the **observed scopes** of the matching tokens in every finding's
     `evidence`, gap or not, so the report shows real data.

   Using the identifier (not the `@`/`:`-prefixed signature) makes token-splitting
   irrelevant; per-feature isolation means an identifier match can only come from the
   construct under test, so "a CSS-scoped match exists → highlighted" is sound.

### Why per-feature files rather than fixing attribution in the combined fixture

`captureSyntaxTokens` gives no positions, so in the combined fixture an identifier
like `container` also appears in the `container-type` property of a _different_
entry — a CSS-scoped match there could mask a real gap in the `@container` entry
(false negative). Per-feature isolation removes that ambiguity and yields a clean,
citable token dump per construct. The generated files are cheap and git/prettier-
ignored.

## The change (files)

- `audit/editor/generate-fixture.js`: emit `audit/editor/highlighting/<feature>.tsx`
  for each highlighting-layer entry (in addition to the existing combined fixture).
- `audit/editor/suite/probe.test.js`: replace the highlighting loop (`:36-49`) and the
  `signatureToken` map (`:79-90`) with the identifier + per-feature-file + scope rule.
  Leave the color loop and the final "file written" assertion unchanged.
- `.gitignore` **and** `.prettierignore`: add `audit/editor/highlighting/` (generated;
  `prettier --check .` lints untracked files, so both are needed — same pattern as
  `fixture.tsx`).

## Verification / acceptance

- `AUDIT_DATE=2026-07-16 npm run audit` (runs Probe C in the Extension Host). The
  corrected probe reports **highlighting 0** — all six confirmed CSS-scoped. Any
  construct genuinely not CSS-scoped on this VS Code (1.129.0) is reported as a real
  residual **with its actual observed scope** — the truth, not an assumed zero.
- `npm run audit:test` stays green (harness unit tests unchanged).
- Inspect the regenerated `docs/superpowers/audit/report.md`: Highlighting section
  empty (or listing only genuine residuals); the finding `evidence` now shows real
  scopes.

### Done criteria

- Probe C uses per-feature fixtures + scope-based detection; no substring `signatureToken`.
- `npm run audit` reports highlighting at the true floor (expected 0); report committed.
- `npm run audit:test` green.
- `git status` clean — generated `audit/editor/highlighting/` is ignored, not committed.
- **Zero `syntaxes/*.json` changes.**

## Risks

- **Low.** Change is confined to the audit harness (`audit/editor/`). No grammar, no
  extension source, no color-probe change.
- **If a construct really is not CSS-scoped** (e.g. `:popover-open` on an older
  built-in `source.css`): the probe reports it honestly as a residual with evidence.
  On VS Code 1.129.0 this is not expected, but the design reports rather than hides it.
- **Extension Host flakiness:** Probe C already runs successfully with the
  `--user-data-dir` workaround in `audit/editor/run.js`; unchanged here.

## Reference

| File / path                                    | Role                                                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `audit/editor/suite/probe.test.js:36-49,79-90` | Buggy substring highlighting check — replaced                                                                       |
| `audit/editor/suite/probe.test.js:16-17`       | `scopeHasCss` — reused by the new rule                                                                              |
| `audit/editor/generate-fixture.js`             | Emits combined fixture; extended to emit per-feature highlighting fixtures                                          |
| `syntaxes/css.styled.json:36,362,1124-1130`    | Grammar proof the 6 are highlighted (generic at-rule catch-all + `source.css` pseudo delegation) — **not modified** |
| `docs/superpowers/audit/report.md`             | Regenerated; Highlighting section should be ~empty                                                                  |
