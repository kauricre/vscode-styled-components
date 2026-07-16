# Bump `vscode-css-languageservice` — Design

**Status:** Approved · **Date:** 2026-07-16 · **Author:** brainstorming session

This is **sub-project A** of the fixes effort scoped from the modern-CSS audit
(`docs/superpowers/audit/report.md`). Workstreams B (grammar/highlighting) and C
(colorProvider) are deferred to their own brainstorms, informed by the re-audit
this sub-project produces.

## Goal

Clear the **161** validation + autocomplete findings by updating the CSS-knowledge
engine both the extension and the bundled TS plugin share, and verify the drop
with a re-audit.

### Non-goals

- **No grammar edits** (`syntaxes/*.json`) — that is workstream B.
- **No `colorProvider.ts` changes** — that is workstream C.
- **No unrelated dependency bumps** (esbuild, typescript, prettier, mocha, etc.).
- **No extension version / changelog bump** — a release decision, likely batched
  after B + C.
- **Do not remove the `css-latest` dev alias** — it is what makes Probe A's
  re-audit a meaningful bundled-vs-latest check.
- **No plugin fork.** See "Why no plugin fork" below.

## How it works today

Verified on `main` (post-merge of the audit harness):

- `@styled/typescript-styled-plugin` declares `vscode-css-languageservice: ^6.2.4`
  and has **no nested copy** in its `node_modules` — it loads the **hoisted**
  top-level `node_modules/vscode-css-languageservice`.
- The extension declares `vscode-css-languageservice: ^6.2.1` (`package.json`).
- npm resolves **one hoisted copy** (currently `6.2.4`) that satisfies both ranges.
- The extension's _own_ use of the library is `getDefaultCSSDataProvider` in
  `src/insertColonCommand.ts`. esbuild (`build.mjs`, `bundle: true`) inlines that
  into `dist/extension.js` at compile time.
- The **plugin** loads css-languageservice from `node_modules` at runtime (it is a
  `typescriptServerPlugins` contribution, not part of the esbuild bundle), and its
  `doValidation`/`doComplete` calls are what produce the `unknown property`
  diagnostics and the autocomplete list.

**Conclusion:** the property/value vocabulary both consumers use comes from this
single hoisted copy. Its version (`6.2.4`) predates 2026 CSS features such as
`overlay`, `field-sizing`, `@container`, hence the false diagnostics.

## Why no plugin fork

Because the plugin has no nested copy and its range (`^6.2.4`) is satisfied by any
`6.x ≥ 6.2.4`, bumping the **extension's** range to a newer 6.x makes npm hoist a
single newer copy that both consumers resolve. The plugin picks it up with no
change to the plugin package. The audit report's "fix inside
@styled/typescript-styled-plugin" wording overstated the location — the fix is in
this repo's `package.json`.

## The change

1. **`package.json`:** change `vscode-css-languageservice` from `^6.2.1` to a caret
   on the current latest 6.x release (the implementation plan pins the exact
   version it resolves at install time, e.g. `^6.4.0`). Caret matches the repo's
   existing convention and lets future compatible CSS-data updates flow in.
2. **`npm install`:** re-resolve so the hoisted copy is the newer 6.x. Confirm no
   nested `vscode-css-languageservice` appears under
   `node_modules/@styled/typescript-styled-plugin/`.
3. **`npm run compile`:** rebuild `dist/extension.js` so the bundled copy used by
   `insertColonCommand`'s data provider also updates.

If no newer 6.x exists than what is already installed, the sub-project is a no-op
for behavior and should be reported as such rather than forcing a change.

## Verification

The reason this sub-project exists as "bump + re-audit" rather than a blind bump:

- **`npm run audit`** on the new engine. **Acceptance:** Validation and
  Autocomplete findings drop to the new engine's floor — expected ~0. Each
  residual finding is a 2026 feature the latest upstream data still lacks; it is
  documented in the re-audit report as an **upstream-data gap, not a defect of
  this fork** (we cannot make the engine validate words it does not know).
- **`npm run audit:test`** stays green (12/12) — the harness itself is unchanged.
- **Extension self-use check:** confirm `getDefaultCSSDataProvider` in
  `src/insertColonCommand.ts` still resolves and the colon/semicolon helper builds
  (the css-languageservice public API is stable across the 6.x major).
- **Regenerate and commit** the updated `docs/superpowers/audit/` artifacts so the
  report reflects the post-bump state; the version-delta header should now show the
  bundled version equal to (or at parity with) `css-latest`.

### Done criteria

- `package.json` `vscode-css-languageservice` is a caret on the latest 6.x, and
  `npm install` produces a single hoisted copy at that version (no nested copy).
- `npm run audit` reports Validation + Autocomplete at the engine floor (expected
  0; any residual explicitly listed as upstream gaps).
- `npm run audit:test` 12/12; `npm run compile` succeeds.
- The updated audit report is committed.

## Risks

- **Low, single-major bump.** `6.2 → 6.x` keeps the same major, so the plugin's
  `parseStylesheet`/`doValidation`/`doComplete` and the extension's
  `getDefaultCSSDataProvider` API calls are stable.
- **Transitive drift:** the `css-latest` alias already pulled
  `vscode-languageserver-types`/`-textdocument` forward within range during the
  audit; a matching bump of the real dep only aligns with that. No production
  `package.json` version beyond css-languageservice changes.
- **Residual findings expected, not feared:** some at-rule (`@scope`,
  `@starting-style`) and value-level (`text-wrap: balance`) findings may or may not
  be covered by the latest 6.x data. The re-audit reports the real number; we do
  not assume zero.

## Reference

| File / path                                      | Role                                                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `package.json`                                   | The single line changed (`vscode-css-languageservice` range)                                       |
| `src/insertColonCommand.ts`                      | Extension's only direct css-languageservice use (`getDefaultCSSDataProvider`) — bundled by esbuild |
| `build.mjs`                                      | Bundles css-languageservice into `dist/extension.js` at compile time                               |
| `node_modules/@styled/typescript-styled-plugin/` | Plugin; loads hoisted css-languageservice at runtime; must stay copy-free (no nested dep)          |
| `docs/superpowers/audit/report.md`               | Source of the 161 findings; regenerated as verification                                            |
| `audit/`                                         | The harness re-run for verification (`npm run audit`, `npm run audit:test`)                        |
