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
| `popover-open` | 'popover-open' not found as a token | `.x:popover-open { color: red; } | observed scopes: (no matching token)` | syntaxes/*.json (TextMate grammar) |

## Color

| Feature | Symptom | Evidence | Fix location |
|---|---|---|---|
| `oklch` | no inline color swatch produced | `.x { color: oklch(0.7 0.15 200); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `oklab` | no inline color swatch produced | `.x { color: oklab(0.7 0.1 0.1); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `color-mix` | no inline color swatch produced | `.x { color: color-mix(in oklch, red, blue); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `relative-color` | no inline color swatch produced | `.x { color: rgb(from red r g b); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `light-dark` | no inline color swatch produced | `.x { color: light-dark(red, blue); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
