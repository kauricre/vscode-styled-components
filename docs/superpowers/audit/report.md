# Modern CSS Audit Report

**Generated:** 2026-07-16
**Plugin css-languageservice:** 6.3.10 (`node_modules/vscode-css-languageservice`)
**Latest css-languageservice:** 6.3.10
**Editor probe ran:** yes

## Summary

| Layer | Findings |
|---|---|
| Validation | 0 |
| Autocomplete | 0 |
| Highlighting | 1 |
| Color | 5 |

> Note: Highlighting findings are heuristic (token-scope detection) and warrant human confirmation. The corpus is a curated sample for the highlighting/color layers; Probe A's data-diff is the exhaustive backstop for validation/autocomplete.

## Validation

_No findings._

## Autocomplete

_No findings._

## Highlighting

| Feature | Symptom | Evidence | Fix location |
|---|---|---|---|
| `popover-open` | no token scoped 'pseudo-class' — construct not recognized | `.x:popover-open { color: red; } | observed tokens: import→source.tsx meta.import.tsx keyword.control.import.tsx | styled→source.tsx meta.import.tsx variable.other.readwrite.alias.tsx | from→source.tsx meta.import.tsx keyword.control.from.tsx | '→source.tsx meta.import.tsx string.quoted.single.tsx punctuation.definition.string.begin.tsx | styled-components→source.tsx meta.import.tsx string.quoted.single.tsx | '→source.tsx meta.import.tsx string.quoted.single.tsx punctuation.definition.string.end.tsx | ;→source.tsx punctuation.terminator.statement.tsx | export→source.tsx meta.var.expr.tsx keyword.control.export.tsx | const→source.tsx meta.var.expr.tsx storage.type.tsx | C→source.tsx meta.var.expr.tsx meta.var-single-variable.expr.tsx meta.definition.variable.tsx variable.other.constant.tsx | =→source.tsx meta.var.expr.tsx keyword.operator.assignment.tsx | styled→source.tsx meta.var.expr.tsx variable.other.object.ts | .→source.tsx meta.var.expr.tsx punctuation.accessor.ts | div→source.tsx meta.var.expr.tsx variable.other.property.ts | `→source.tsx meta.var.expr.tsx punctuation.definition.string.template.begin.js string.template.js | .→source.tsx meta.var.expr.tsx source.css.scss entity.other.attribute-name.class.css punctuation.definition.entity.css | x→source.tsx meta.var.expr.tsx source.css.scss entity.other.attribute-name.class.css | :→source.tsx meta.var.expr.tsx source.css.scss punctuation.separator.key-value.scss | popover→source.tsx meta.var.expr.tsx source.css.scss meta.property-value.scss | -→source.tsx meta.var.expr.tsx source.css.scss meta.property-value.scss support.constant.mathematical-symbols.scss | open {→source.tsx meta.var.expr.tsx source.css.scss meta.property-value.scss | color→source.tsx meta.var.expr.tsx source.css.scss meta.property-value.scss support.constant.property-value.css | :→source.tsx meta.var.expr.tsx source.css.scss meta.property-value.scss | red→source.tsx meta.var.expr.tsx source.css.scss meta.property-value.scss support.constant.color.w3c-standard-color-name.css | ;→source.tsx meta.var.expr.tsx source.css.scss punctuation.terminator.rule.scss | }→source.tsx meta.var.expr.tsx source.css.scss | `→source.tsx meta.var.expr.tsx punctuation.definition.string.template.end.js string.template.js | ;→source.tsx punctuation.terminator.statement.tsx` | syntaxes/*.json (TextMate grammar) |

## Color

| Feature | Symptom | Evidence | Fix location |
|---|---|---|---|
| `oklch` | no inline color swatch produced | `.x { color: oklch(0.7 0.15 200); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `oklab` | no inline color swatch produced | `.x { color: oklab(0.7 0.1 0.1); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `color-mix` | no inline color swatch produced | `.x { color: color-mix(in oklch, red, blue); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `relative-color` | no inline color swatch produced | `.x { color: rgb(from red r g b); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `light-dark` | no inline color swatch produced | `.x { color: light-dark(red, blue); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
