# Upstream Issues Fix Map — All 72 Open Issues, Easiest to Hardest

**Status:** Approved · **Date:** 2026-07-16 · **Author:** brainstorming session

Successor to the [improvement backlog](./2026-07-16-improvement-backlog.md)
(item 1 rejected — no Open VSX; items 2–4 shipped in 1.9.0; items 5, 7, 8
carried into the tiers below). This map broadens scope in two ways: **every**
open upstream issue is classified (not just the top-voted), and **patching a
bundled dependency is now allowed** when it beats the alternatives — forking
external packages remains out.

## Goal

Classify all **72** open issues on the archived upstream repo by whether and
how this fork can fix them, add improvements upstream never had, and order
everything easiest → hardest so releases can be sliced off the top.

### Non-goals

- **No forks of external packages.** `@styled/typescript-styled-plugin` stays
  a dependency; targeted patches (patch-package style, version-pinned) are the
  ceiling.
- **No Open VSX / distribution work** (owner decision, recorded in the
  backlog spec).
- **No fixes in this doc** — classification, evidence, and ordering only.

## Method

Evidence sources, all 2026-07-16:

1. **Issue survey:** all 72 open issues (GitHub API; PRs excluded), bodies
   fetched for the ~26 needed to classify.
2. **Editor token probes** (VS Code 1.129.0, this fork's 1.9.0 build):
   pre-1.9.0 baseline `../audit/upstream-issues-probe.json` plus today's
   post-1.9.0 run `../audit/upstream-issues-probe-post-1.9.0.json` (adds
   `gh446-call-form`, `gh407-namespace-generic`, guard cases).
3. **configurePlugin spike** (extension host, end-to-end):
   `../audit/configure-plugin-spike.json` — a styled template with `colr: red`
   produced `ts-styled-plugin 9999 Unknown property`, and
   `configurePlugin("@styled/typescript-styled-plugin", { validate: false })`
   made it disappear. The bridge is proven.
4. **Plugin source recon** (`node_modules/@styled/typescript-styled-plugin`):
   config surface `lib/_configuration.js` (`tags`, `validate`, `lint`,
   `emmet`); runtime config hook `lib/_plugin.js:27-31`
   (`onConfigurationChanged` → `updateFromPluginConfig`); completion
   translation layer `lib/_language-service.js:87-320`; emmet completions
   gated by `config.emmet` at `lib/_language-service.js:168`; interpolation
   substitution in `lib/_substituter.js`.

## Key architectural fact

**The bundled TS plugin is runtime-configurable through a public VS Code API
upstream never wired up.** The built-in TypeScript extension exposes
`getAPI(0).configurePlugin(name, config)`; our extension can pipe contributed
VS Code settings straight into the plugin from `activate()`. This turns a
whole complaint cluster (validation off, custom tags, emmet noise) into one
small in-repo feature — no tsconfig pollution (#217's exact complaint), no
fork, no patch.

## The tiers (easiest → hardest)

### Tier 0 — Documentation closes them today (hours)

| Issue            | Fix                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| #282, #364, #254 | FAQ: wrap nested/conditional CSS blocks in the ` css` `` helper — full highlighting + IntelliSense already work that way (probe-verified via #425) |
| #348             | FAQ: MDN documentation popup is a VS Code editor setting (reporter self-solved; document it)                                                       |
| #372             | FAQ: PostCSS-extension grammar conflict — document the interaction                                                                                 |
| #426             | FAQ: Yarn SDK / workspace-TypeScript setup note                                                                                                    |

Six issues answerable in a README/FAQ pass; none need code.

### Tier 1 — The settings bridge (one small-medium feature, spike-proven)

Contribute VS Code settings and forward them via `configurePlugin` in
`activate()`:

| Setting                             | Resolves                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| `styled-components.validate` (bool) | **#217** (validation off without touching tsconfig), **#373** ("none" linter option) |
| `styled-components.tags` (string[]) | **#303 IntelliSense half**, **#181** (custom tagged-template names)                  |
| `styled-components.lint.*` (object) | unknown-property escape hatch (`validProperties`), lint tuning                       |
| `styled-components.emmet` (object)  | **#331 template half** — emmet suggestions inside templates off                      |

Evidence: spike (`../audit/configure-plugin-spike.json`) + plugin source
(`_plugin.js:27-31`, `_configuration.js`). Note for implementation: interplay
between tsconfig-level plugin config and `configurePlugin` (which wins on
which key) must be pinned down by test.

### Tier 2 — Small in-repo code/grammar fixes

| Item               | Detail                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **#446**           | Remove the `styled(Component)(` call-form false positive. **Probe-verified present today** (`gh446-call-form`: highlights, but a template passed as a call argument is not valid styled-components usage). Grammar edit + snapshot gate.                     |
| **#386**           | Backtick snippet offered everywhere (comments included) — gate `src/completionItemProvider.ts` to styled context, or add a disable setting.                                                                                                                  |
| **#413, #370**     | Enter-key helper: contribute a disable setting, narrow the when-clause (`package.json` keybinding), await the racy `editor.edit` (`src/insertColonCommand.ts:75,81`). Backlog item 6. #370 needs an interactive repro before claiming the race is the cause. |
| **Backlog item 5** | Scope color swatches to styled-template ranges (`src/colorProvider.ts:32` scans whole documents) — retires the false-positive class documented in README known-limitations.                                                                                  |

### Tier 3 — Medium in-repo features

| Item     | Detail                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **#197** | Highlight styled-components in markdown code blocks — add markdown embedded scopes to the grammar's `injectTo`; needs a small spike. |
| **#269** | Code action: convert inline JSX `style={{…}}` object → styled component. Self-contained command.                                     |
| **#327** | Selector specificity on hover — investigate whether the plugin wires `doHover` through to css-languageservice; patch only if small.  |

### Tier 4 — Dependency patches (patch-package, version-pinned, no fork)

| Issue    | Patch point                                                                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#379** | `var(` completing as `var()()` — completion translation layer, `_language-service.js:87-320`; strip the inserted call parens when the trigger context already has one. |
| **#444** | `%` appended to decimal completions — same translation layer.                                                                                                          |

Cost: a patch file per fix applied at install time and shipped inside the
`.vsix`; every plugin version bump requires re-verifying patches. Keep this
tier small on principle.

### Tier 5 — Hard (large; sequence with real user feedback)

| Item                                                                                                                    | Detail                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Semantic-token provider**                                                                                             | Fixes **#303's grammar half** (custom tags follow the Tier 1 `tags` setting) and retires the 1.9.0 multiline-degradation limitation. Pairs with backlog item 7.       |
| **#186** formatting                                                                                                     | css-languageservice `format()` over template ranges; interpolation preservation is the hard part. Backlog item 8.                                                     |
| **Substituter cluster**: #308, #319, #330, #369, #434, #435, #437, #382, #440                                           | Multiline/adjacent-interpolation false errors — `_substituter.js` placeholder heuristics; redesign-level even as a patch. Last resort; upstream the fix if ever done. |
| **#216, #430** css-prop IntelliSense; **#351, #155** object-style support; **#422** theme tokens; **#396** React Native | Large, demand-unproven; revisit when users exist.                                                                                                                     |

### Not fixable here / no action

| Issue          | Reason                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| #331 HTML half | Emmet expanding HTML in the host file is VS Code core (microsoft/vscode#119736)                      |
| #432           | asp.net/HTML files — out of scope                                                                    |
| #275           | meta (call for contributors)                                                                         |
| #368           | Open VSX — rejected (owner decision, privacy)                                                        |
| #332           | plugin perf with theme props — no repro, plugin-internal, out                                        |
| #445           | reporter says "can't reproduce" — close                                                              |
| #424           | user snippets inside embedded templates — VS Code snippet scoping behavior; document workaround only |

### Needs repro before classification (19)

#380, #395, #305, #266, #433, #431, #353, #383, #212, #405, #378, #402, #312,
#161, #429, #406, #427, #334, #448. Screenshot-only or vague. Precedent says
many are stale: 8 of the 10 loudest issues plus #407 (probed today,
namespace generics — works) did not reproduce in this fork. A follow-up probe
batch resolves these cheaply.

### Already verified working or fixed (11) — no action, marketing material

#127, #159, #196, #292, #328 (fixed 1.9.0), #358, #407 (probed today), #425,
#436 (same class as #159), #442, #443.

## Why this ordering (decision)

- **Why easiest-first:** owner-directed; with zero users, cheap visible wins
  and closed upstream issues are the strongest adoption signal per hour.
- **Why the settings bridge outranks grammar fixes:** one feature resolves
  4-6 issues across the most-complained category (unwanted validation), is
  spike-proven, and touches only `package.json` + `extension.ts`.
- **Why patch-package over forking the plugin:** two known bugs do not
  justify owning a second package's release train; a pinned patch is
  reversible and visible in-repo. Cost: patches can rot on version bumps —
  accepted, gated by re-verification.
- **Why the substituter cluster is last despite 9 issues:** highest
  regression risk, hardest verification, and the Tier 0 css-helper guidance
  already gives affected users a working pattern today.

## Risks & open questions

- **configurePlugin vs tsconfig config precedence** — undetermined; pin down
  by test during Tier 1 implementation.
- **#446 removal is a behavior change** — anyone relying on call-form
  highlighting loses it; snapshot + changelog note required.
- **#370's root cause** (unawaited edit race) is read from code, not
  reproduced — Tier 2 work must start with a repro.
- **patch-package with npm lifecycle in CI/vsce** — verify the patch applies
  in the `vsce package` path before relying on it (Tier 4 gate).

## Reference table

| Artifact                               | Path                                                                  |
| -------------------------------------- | --------------------------------------------------------------------- |
| configurePlugin spike result           | `docs/superpowers/audit/configure-plugin-spike.json`                  |
| Post-1.9.0 probe results               | `docs/superpowers/audit/upstream-issues-probe-post-1.9.0.json`        |
| Pre-1.9.0 baseline probe               | `docs/superpowers/audit/upstream-issues-probe.json`                   |
| Plugin config surface                  | `node_modules/@styled/typescript-styled-plugin/lib/_configuration.js` |
| Plugin runtime-config hook             | `…/lib/_plugin.js:27-31`                                              |
| Completion translation (Tier 4 target) | `…/lib/_language-service.js:87-320`                                   |
| Substituter (Tier 5 cluster)           | `…/lib/_substituter.js`                                               |
| Predecessor backlog                    | `docs/superpowers/specs/2026-07-16-improvement-backlog.md`            |
