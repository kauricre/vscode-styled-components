# Modern CSS Audit Report

**Generated:** 2026-07-16
**Plugin css-languageservice:** 6.2.4 (`node_modules/vscode-css-languageservice`)
**Latest css-languageservice:** 6.3.10
**Editor probe ran:** yes

## Summary

| Layer | Findings |
|---|---|
| Validation | 10 |
| Autocomplete | 151 |
| Highlighting | 6 |
| Color | 4 |

## Validation

| Feature | Symptom | Evidence | Fix location |
|---|---|---|---|
| `overlay` | Unknown property: 'overlay' | `.x { overlay: auto; }  (severity 2)` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `field-sizing` | Unknown property: 'field-sizing' | `.x { field-sizing: content; }  (severity 2)` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-wrap-balance` | Unknown property: 'text-wrap' | `.x { text-wrap: balance; }  (severity 2)` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-box` | Unknown property: 'text-box' | `.x { text-box: trim-both cap alphabetic; }  (severity 2)` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `anchor-name` | Unknown property: 'anchor-name' | `.x { anchor-name: --a; }  (severity 2)` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `transition-behavior` | Unknown property: 'transition-behavior' | `.x { transition-behavior: allow-discrete; }  (severity 2)` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `container` | Unknown property: 'container-type' | `.wrap { container-type: inline-size; } @container (min-width: 400px) { .x { color: red; } }  (severity 2)` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `container` | Unknown at rule @container | `.wrap { container-type: inline-size; } @container (min-width: 400px) { .x { color: red; } }  (severity 2)` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `scope` | Unknown at rule @scope | `@scope (.x) to (.y) { .z { color: red; } }  (severity 2)` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `starting-style` | Unknown at rule @starting-style | `@starting-style { .x { opacity: 0; } }  (severity 2)` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |

## Autocomplete

| Feature | Symptom | Evidence | Fix location |
|---|---|---|---|
| `alignment-baseline` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `anchor-name` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `anchor-scope` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `animation-range` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `animation-range-end` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `animation-range-start` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `animation-trigger` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `base-palette` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `baseline-shift` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `baseline-source` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `caret-animation` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `column-height` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `column-wrap` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `container` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `container-name` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `container-type` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-block-end-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-block-start-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-bottom-left-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-bottom-right-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-bottom-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-end-end-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-end-start-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-inline-end-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-inline-start-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-left-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-right-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-start-end-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-start-start-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-top-left-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-top-right-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `corner-top-shape` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `cx` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `cy` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `d` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `dominant-baseline` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `dynamic-range-limit` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `field-sizing` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `font-palette` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `font-synthesis-position` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `font-synthesis-small-caps` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `font-synthesis-style` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `font-synthesis-weight` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `font-variant-emoji` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `font-width` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `hyphenate-limit-chars` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `interactivity` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `interest-delay` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `interest-delay-end` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `interest-delay-start` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `interpolate-size` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `navigation` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `object-view-box` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `overlay` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `override-colors` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `page` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `page-orientation` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `position-anchor` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `position-area` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `position-try` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `position-try-fallbacks` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `position-try-order` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `position-visibility` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `r` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `reading-flow` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `reading-order` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `rx` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `ry` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `scroll-initial-target` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `scroll-marker-group` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `scroll-target-group` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `stroke-color` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-autospace` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-box` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-box-edge` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-box-trim` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-decoration-inset` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-spacing-trim` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-wrap` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-wrap-mode` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `text-wrap-style` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `timeline-scope` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `timeline-trigger` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `timeline-trigger-exit-range` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `timeline-trigger-exit-range-end` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `timeline-trigger-exit-range-start` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `timeline-trigger-name` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `timeline-trigger-range` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `timeline-trigger-range-end` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `timeline-trigger-range-start` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `timeline-trigger-source` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `transition-behavior` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `trigger-scope` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `types` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `vector-effect` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `view-timeline` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `view-timeline-axis` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `view-timeline-inset` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `view-timeline-name` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `view-transition-class` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `view-transition-name` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `white-space-collapse` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `x` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `y` | not in plugin property vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `@container` | not in plugin at-directive vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `@document` | not in plugin at-directive vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `@font-palette-values` | not in plugin at-directive vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `@position-try` | not in plugin at-directive vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `@scope` | not in plugin at-directive vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `@starting-style` | not in plugin at-directive vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `@view-transition` | not in plugin at-directive vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:-moz-any` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:-ms-lang` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:-webkit-any` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:active-view-transition` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:active-view-transition-type` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:autofill` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:buffering` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:has-slotted` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:host-context` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:lang` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:matches` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:modal` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:muted` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:not` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:nth-child` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:nth-last-child` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:nth-last-of-type` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:nth-of-type` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:open` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:popover-open` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:seeking` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:stalled` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:state` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:target-current` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:volume-locked` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `:xr-overlay` | not in plugin pseudo-class vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::checkmark` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::details-content` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::file-selector-button` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::highlight` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::picker` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::picker-icon` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::scroll-marker` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::scroll-marker-group` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::view-transition` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::view-transition-group` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::view-transition-image-pair` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::view-transition-new` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |
| `::view-transition-old` | not in plugin pseudo-element vocabulary (no validation, no completion) | `present in css-languageservice 6.3.10, absent in 6.2.4` | dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin |

## Highlighting

| Feature | Symptom | Evidence | Fix location |
|---|---|---|---|
| `container` | token '@container' not found in CSS scope | `.wrap { container-type: inline-size; } @container (min-width: 400px) { .x { color: red; } }` | syntaxes/*.json (TextMate grammar) |
| `layer` | token '@layer' not found in CSS scope | `@layer base { .x { color: red; } }` | syntaxes/*.json (TextMate grammar) |
| `scope` | token '@scope' not found in CSS scope | `@scope (.x) to (.y) { .z { color: red; } }` | syntaxes/*.json (TextMate grammar) |
| `starting-style` | token '@starting-style' not found in CSS scope | `@starting-style { .x { opacity: 0; } }` | syntaxes/*.json (TextMate grammar) |
| `has` | token ':has' not found in CSS scope | `.x:has(> .y) { color: red; }` | syntaxes/*.json (TextMate grammar) |
| `popover-open` | token ':popover-open' not found in CSS scope | `.x:popover-open { color: red; }` | syntaxes/*.json (TextMate grammar) |

## Color

| Feature | Symptom | Evidence | Fix location |
|---|---|---|---|
| `oklch` | no inline color swatch produced | `.x { color: oklch(0.7 0.15 200); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `oklab` | no inline color swatch produced | `.x { color: oklab(0.7 0.1 0.1); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `color-mix` | no inline color swatch produced | `.x { color: color-mix(in oklch, red, blue); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
| `relative-color` | no inline color swatch produced | `.x { color: rgb(from red r g b); }` | src/colorProvider.ts (regex + d3-color do not handle this color syntax) |
