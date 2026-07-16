# Generic Pseudo-Class Fallback (`:popover-open`) — Design

**Status:** Approved (autonomous, per user grant) · **Date:** 2026-07-16

The one genuine highlighting gap workstream B surfaced. Small, single-rule grammar
change; the plan is folded into the Implementation section below (disproportionate
to split for a one-rule edit). Branch `feat/popover-grammar`, stacked on
`feat/color-provider`.

## Goal

`.x:popover-open` (and any future/unknown pseudo-class) is highlighted as a
pseudo-class, not misparsed. Verified by the (now scope-based) highlighting probe:
highlighting **1 → 0**.

## How it works today (the gap)

`syntaxes/css.styled.json` `selector_pseudo_class` (~:1080) matches `nth-*`
explicitly, then delegates to `source.css#pseudo-classes` / `#pseudo-elements` /
`#functional-pseudo-classes`. Those built-in lists are fixed and predate
`:popover-open`, so it matches nothing there — and there is **no generic
fallback**. Unconsumed, `:popover-open` is misparsed by SCSS property rules
(observed scopes `punctuation.separator.key-value.scss`, `meta.property-value.scss`).

## Decision

Add a **generic single-colon pseudo-class pattern** as the LAST entry in
`selector_pseudo_class.patterns`, so the specific matchers win first and only
genuinely-unknown pseudo-classes fall through to it.

### Why not add `:popover-open` to a hardcoded list

Brittle — the next new pseudo-class (`:has-slotted`, `:state()`, …) breaks again.
A generic fallback fixes the whole class of "pseudo-class newer than the bundled
`source.css` list" once.

## Implementation

Insert as the final pattern of `selector_pseudo_class` (after the
`source.css#functional-pseudo-classes` include):

```json
{
  "match": "(?<!:)(:)([a-zA-Z][\\w-]*)",
  "captures": {
    "1": { "name": "punctuation.definition.entity.css" },
    "2": { "name": "entity.other.attribute-name.pseudo-class.css" }
  }
}
```

- `(?<!:)` ensures it never matches the second colon of a `::pseudo-element`
  (and `::before` is matched by `source.css#pseudo-elements`, tried earlier, so it
  never reaches this rule anyway).
- Placed last → `:hover`, `:has()`, `nth-child()` etc. are still claimed by their
  specific matchers; only unknown simple pseudo-classes hit this.
- Only reachable via `#selectors` (selector context), so it cannot fire inside a
  property value.

## Verification

- `node audit/editor/generate-fixture.js` then `AUDIT_DATE=2026-07-16 npm run audit`
  → highlighting summary **0** (the `popover-open` per-feature fixture now yields a
  `pseudo-class`-scoped token). Report summary `{v:0,a:0,h:0,c:0}`.
- The other highlighting features (`@container`/`@layer`/`@scope`/`@starting-style`/
  `:has`/nesting) stay non-gaps (no regression) — the probe checks all of them.
- `npm run audit:test` unchanged (19/19; grammar isn't unit-tested).
- Manual reasoning: `:hover` (source.css list), `::before` (pseudo-element),
  `:has(...)` (functional) all still match their specific rules before the fallback.

### Done criteria

- Generic pseudo-class fallback present in `selector_pseudo_class`.
- Re-audit highlighting **0**; no other highlighting regression; report committed.
- `syntaxes/css.styled.json` remains valid JSON (`node -e "require('./syntaxes/css.styled.json')"`).

## Non-goals

- No color/validation/autocomplete changes. No other grammar rules touched.

## Risk

- **Low but grammar-precedence-sensitive.** Mitigated by placing the rule last and
  by the highlighting probe verifying every corpus construct after the change — a
  regression in any would show as a new highlighting finding.
