# Improvement Backlog — Landscape Map

**Status:** Approved · **Date:** 2026-07-16 · **Author:** brainstorming session

This is a **ranked backlog**, not a feature design. Each item picked from it gets
its own brainstorm → spec → plan cycle. Ranking optimizes for **adoption**: with
zero users, feedback is the scarcest resource, and every other prioritization
runs blind until installs exist.

## Goal

Map everything this fork cannot do, does badly, or could add — with each claim
verified against the fork as it exists on `main` today — and rank the items so
the next several releases are already sequenced.

### Non-goals

- **No fixes in this doc.** Scope, evidence, and ranking only.
- **No work outside this repo.** Bugs living in `@styled/typescript-styled-plugin`
  are listed as out-of-scope, not planned (owner decision, 2026-07-16).
- **No unverified marketing claims.** "Works in this fork" is proven below;
  "broken in upstream 1.7.8" is NOT proven and stays an open question (item 9).

## Method

Three evidence sources, all run 2026-07-16:

1. **Upstream issue survey.** All **72** open issues on
   `styled-components/vscode-styled-components` (GitHub API, single page,
   PRs excluded), ranked by 👍 reactions.
2. **Editor token probe.** For the top-👍 highlighting issues, fixtures
   were generated from the exact repro code in each issue (screenshot-only
   repros `#328`/`#292` were decoded from their screenshots) and tokenized in
   VS Code 1.129.0 with the dev extension loaded, via
   `_workbench.captureSyntaxTokens` — same mechanism as
   `audit/editor/suite/probe.test.js`. Pass = every sentinel CSS property gets
   a `property-name` scope AND a sentinel `const AFTER_OK` after the component
   carries no leaked `css.styled`/`string.template` scope.
   Raw results: `docs/superpowers/audit/upstream-issues-probe.json` (11 entries:
   1 control + 10 fixtures covering 8 issues).
3. **Direct checks.** `findColors()` on non-CSS lines (node),
   `doValidation()` on `container-type` (bundled css-languageservice 6.3.10),
   Open VSX registry API search.

## Headline finding

**8 of the 10 loudest upstream issues do not reproduce in this fork.** The
upstream tracker overstates today's brokenness — issues stayed open because the
repo was unmaintained, not because the bugs all still exist.

| Issue | 👍  | Shape probed                                                 | Verdict in fork                                                           |
| ----- | --- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| #159  | 37  | `styled.div<{…}>`, `styled.div<Props>`, `styled<{…}>('div')` | **works** (all 3 variants)                                                |
| #292  | 37  | multiline `.attrs((props) => ({ …spreads }))`                | **works**                                                                 |
| #358  | 15  | multiline `<{ … }>` type argument                            | **works**                                                                 |
| #425  | 14  | nested `` css` ` `` helper inside interpolation              | **works** (incl. CSS after the interpolation and the following component) |
| #127  | 10  | `styled(Stylable("div"))`                                    | **works**                                                                 |
| #442  | 9   | type params breaking following code                          | **works** (no scope leak past closing backtick)                           |
| #328  | 9   | multiline `styled(\n Component \n)` call                     | **BROKEN** — template stays `string.template.tsx`                         |
| #303  | 9   | aliased import `myStyled.div`                                | **BROKEN** (feature gap — zero highlighting)                              |
| #443  | 8   | `container-type` "unknown property"                          | **fixed** — `doValidation` returns `[]` on 6.3.10                         |
| #196  | 4   | `` memo(styled.div`…`) ``                                    | **works**                                                                 |

## The backlog

### Tier 1 — Distribution

**1. Publish to Open VSX.**
Verified via the Open VSX API: upstream `styled-components.vscode-styled-components`
is on Open VSX **frozen at 1.7.8 with 81,628 downloads**. 1.7.8 is the version
with the documented TypeScript 5 IntelliSense clash (README troubleshooting)
and none of the 2026-CSS data. That stale build is the default install for
every Cursor / VSCodium / Windsurf user today; this fork is absent from the
registry. Fix: claim namespace, add a publish step to
`.github/workflows/release.yml`. **Effort: small. Highest adoption-per-effort
item on the list.**

**2. README + Marketplace positioning.**
The README is still substantially upstream's: troubleshooting links point at
upstream issues, there is no "why this fork" comparison, `demo.gif` predates
the fork. The probe table above is publishable evidence for a "verified
working" list. **Constraint: claims must say "verified working in this fork",
not "fixed vs upstream", until item 9 runs.** Effort: small.

### Tier 2 — Confirmed in-repo bugs

**3. `.ts` / `.vue` / `.svelte` parity for extension features.**
The grammar injects into `source.ts`, `source.vue`, `source.svelte`
(`package.json:68-76`), but activation (`package.json:47-50`) and the provider
selector (`src/extension.ts:12-15`) cover only `typescriptreact` /
`javascriptreact` on the `file` scheme. **The common `styles.ts` pattern gets
highlighting but no color swatches and no snippet**; untitled buffers get
nothing from the providers. Fix: extend `activationEvents` + `documentSelector`.
Effort: small.

**4. `#328` — multiline `styled(…)` call breaks highlighting (9👍, reproduced).**
Root cause identified: the continuation pattern at
`syntaxes/styled-components.json:78` — regex `(?:}>|\)\))` followed by the
opening backtick — only rescues a line starting `}>` (multiline generics) or
`))` (multiline attrs). A lone `)` before the backtick has no rule, so the
template never enters `source.css.styled` (probe token dump: contents stay
`string.template.tsx`). Fix: one added alternative to that pattern.
**Risk: false positives on unrelated close-paren + backtick lines — gate with
the existing audit corpus plus a new probe fixture.** Effort: small-medium.

**5. Color swatches appear outside styled templates (reproduced).**
`provideDocumentColors` scans **every line of the whole document**
(`src/colorProvider.ts:32`), unscoped. Verified: `const id = "#ff0000";` in
plain TS yields a swatch; any `#rgb`-shaped substring (e.g. a URL fragment
`"/docs#aabbcc"`) matches `HEX` in `src/colorMatch.js:8`. Named colors are
accidentally safer (`src/colorMatch.js:13` lookbehind requires `[:,(]` and
quotes block it). Fix: restrict scanning to styled-template ranges — begin/end
pattern matching already exists in `src/insertColonCommand.ts:44-64` to build
on. Also removes the per-edit full-document regex cost. Effort: medium.

**6. Enter-key helper: global, racy, non-disableable (`#413`, `#370` — the two
in-repo IntelliSense complaints).**
The contributed keybinding intercepts Enter in **all** JS/TS files whenever the
suggest widget is open (`package.json:97-103`). Per accepted suggestion it
regex-scans the full document text before the cursor
(`src/insertColonCommand.ts:38-64`), and fires `cursorLeft` after an
**unawaited** `editor.edit` (`src/insertColonCommand.ts:75,81`) — the plausible
cause of #370's cursor-jump. No setting can disable any of it. Fix: contribute
a `styled-components.enterKeyHelper` setting, add `config.…` to the
when-clause, await the edit. Effort: small-medium.

### Tier 3 — New capabilities (bigger bets; decide after users exist)

**7. `#303` — configurable custom tag names (9👍, gap reproduced).**
Aliased `myStyled.div` templates get zero highlighting (probe: template stays
`string.template.tsx`). **TextMate grammars are static contributions — a
setting cannot feed a grammar regex at runtime.** Realistic designs:
regenerate the grammar JSON from configuration and prompt a reload, or layer a
semantic-token provider. Effort: large. Highest-demand genuine feature
(#303 + predecessor #224).

**8. CSS formatting inside templates (`#186`).**
`vscode-css-languageservice` ships `format()`; upstream never wired it up.
Hard part: mapping ranges through interpolations without destroying them.
Effort: large. True differentiator over upstream and the 1.7.0-era forks.

**9. Comparison audit vs upstream 1.7.8.**
Re-run the 11-fixture probe against upstream's published grammar so item 2 can
claim "fixed vs upstream" with evidence. The probe already exists; this is
wiring it to a second grammar. Effort: small.

## Already fixed — no action, marketing material for item 2

- The 8 probe passes in the table above.
- `#443` `container-type` (validation clean on 6.3.10).
- The entire 2026-CSS refresh: `docs/superpowers/audit/report.md` shows
  **0 findings** across validation / autocomplete / highlighting / color.

## Out of scope (live in `@styled/typescript-styled-plugin`)

`#379` (`var()()` double parens), `#444` (`%` appended to decimals), `#440`
('identifier expected' with pseudo-element), `#426` (yarn SDK). Listed for
README's known-issues section; not fixable in this repo per the scope decision.
Emmet-in-CSS complaints (`#331`) are VS Code core
(`microsoft/vscode#119736`) — also out of scope.

## Why adoption-first (decision)

- **Why not technical-debt-first:** the audit harness already guards the CSS
  layer; the remaining debt (color scoping, enter helper) is user-visible and
  therefore already captured inside the adoption ranking.
- **Why not differentiation-first:** items 7/8 are the largest efforts on the
  list with zero users to validate demand; both stay ranked but sequenced
  after distribution and quick fixes.
- **Cost of the choice:** Tier 3 features slip at least one release cycle, and
  the fork's pitch stays "alive and correct" rather than "does more" until then.

## Recommended sequencing

Release N: items **1 + 2 + 3 + 4** (all small; ships as "on Open VSX, with
fixes upstream never shipped"). Release N+1: items **5 + 6** (polish). Then
pick 7 vs 8 with real-user feedback, running 9 alongside item 2 whenever it
lands.

## Risks & open questions

- **Fork-vs-upstream deltas are unproven** (item 9): some probe passes may also
  pass in upstream 1.7.8; issues may simply have been left open. Blocks only
  the phrasing of item 2, nothing else.
- **`#328` fix regression surface:** the lone-`)` continuation could match
  unrelated tagged templates; must be corpus-gated (item 4 risk note).
- **`#370` root cause is diagnosed, not proven:** the unawaited-edit race is
  read from code, not reproduced interactively. Item 6's plan needs a repro
  step before claiming the fix.
- ~~Open VSX namespace ownership~~ — verified 2026-07-16: the `kauricre`
  namespace is unclaimed on Open VSX (`GET /api/kauricre` → not found), so
  item 1 has no squatting obstacle; it does add a one-time namespace-claim step.

## Reference table

| Artifact                               | Path                                                |
| -------------------------------------- | --------------------------------------------------- |
| Probe raw results (11 fixtures)        | `docs/superpowers/audit/upstream-issues-probe.json` |
| Existing audit report (0 findings)     | `docs/superpowers/audit/report.md`                  |
| Continuation pattern (#328 root cause) | `syntaxes/styled-components.json:78`                |
| Grammar injection targets              | `package.json:68-76`                                |
| Activation events / keybinding         | `package.json:47-50`, `package.json:97-103`         |
| Provider selector                      | `src/extension.ts:12-15`                            |
| Unscoped color scan                    | `src/colorProvider.ts:32`, `src/colorMatch.js:8`    |
| Enter-helper scan + race               | `src/insertColonCommand.ts:38-64,75,81`             |

### Failing fixtures (verbatim, for reproduction)

`#328` — multiline call:

```tsx
import styled from "styled-components";

const Base = styled.div`
  color: red;
`;

export const NewContainer = styled(Base)`
  box-sizing: border-box;
`;
```

`#303` — aliased import:

```tsx
import myStyled from "styled-components";

export const T = myStyled.div`
  box-sizing: border-box;
`;
```
