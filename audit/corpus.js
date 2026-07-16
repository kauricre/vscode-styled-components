"use strict";

/** @type {Array<'validation'|'autocomplete'|'highlighting'|'color'>} */
const LAYERS = ["validation", "autocomplete", "highlighting", "color"];

// expectedLayer routes Probe C behaviour. Probe B runs doValidation on EVERY entry
// regardless of tag, so validation diagnostics are captured for color/highlighting
// entries too. Autocomplete coverage comes from Probe A's missing-vocabulary diff,
// so there are no 'autocomplete'-tagged entries here by design.
const CORPUS = [
  // --- validation (property/value vocabulary) ---
  {
    feature: "overlay",
    expectedLayer: "validation",
    css: ".x { overlay: auto; }",
    note: "reported regression",
  },
  {
    feature: "field-sizing",
    expectedLayer: "validation",
    css: ".x { field-sizing: content; }",
  },
  {
    feature: "text-wrap-balance",
    expectedLayer: "validation",
    css: ".x { text-wrap: balance; }",
  },
  {
    feature: "content-visibility",
    expectedLayer: "validation",
    css: ".x { content-visibility: auto; }",
  },
  {
    feature: "text-box",
    expectedLayer: "validation",
    css: ".x { text-box: trim-both cap alphabetic; }",
  },
  {
    feature: "animation-timeline",
    expectedLayer: "validation",
    css: ".x { animation-timeline: scroll(root block); }",
  },
  {
    feature: "anchor-name",
    expectedLayer: "validation",
    css: ".x { anchor-name: --a; }",
  },
  {
    feature: "subgrid",
    expectedLayer: "validation",
    css: ".x { grid-template-rows: subgrid; }",
  },
  {
    feature: "transition-behavior",
    expectedLayer: "validation",
    css: ".x { transition-behavior: allow-discrete; }",
  },
  {
    feature: "property-at-rule",
    expectedLayer: "validation",
    css: "@property --a { syntax: '<color>'; inherits: false; initial-value: red; }",
  },

  // --- color (modern color functions; also exercise validation) ---
  {
    feature: "oklch",
    expectedLayer: "color",
    css: ".x { color: oklch(0.7 0.15 200); }",
  },
  {
    feature: "oklab",
    expectedLayer: "color",
    css: ".x { color: oklab(0.7 0.1 0.1); }",
  },
  {
    feature: "color-mix",
    expectedLayer: "color",
    css: ".x { color: color-mix(in oklch, red, blue); }",
  },
  {
    feature: "relative-color",
    expectedLayer: "color",
    css: ".x { color: rgb(from red r g b); }",
  },
  {
    feature: "light-dark",
    expectedLayer: "color",
    css: ".x { color: light-dark(#ffffff, #000000); }",
  },

  // --- highlighting (at-rules / modern selectors) ---
  {
    feature: "container",
    expectedLayer: "highlighting",
    css: ".wrap { container-type: inline-size; } @container (min-width: 400px) { .x { color: red; } }",
  },
  {
    feature: "layer",
    expectedLayer: "highlighting",
    css: "@layer base { .x { color: red; } }",
  },
  {
    feature: "scope",
    expectedLayer: "highlighting",
    css: "@scope (.x) to (.y) { .z { color: red; } }",
  },
  {
    feature: "starting-style",
    expectedLayer: "highlighting",
    css: "@starting-style { .x { opacity: 0; } }",
  },
  {
    feature: "nesting",
    expectedLayer: "highlighting",
    css: ".x { & .y { color: red; } }",
  },
  {
    feature: "has",
    expectedLayer: "highlighting",
    css: ".x:has(> .y) { color: red; }",
  },
  {
    feature: "popover-open",
    expectedLayer: "highlighting",
    css: ".x:popover-open { color: red; }",
  },
];

module.exports = { CORPUS, LAYERS };
