"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { CORPUS, LAYERS } = require("./corpus");

test("LAYERS is the exact four-layer enum", () => {
  assert.deepStrictEqual([...LAYERS].sort(), [
    "autocomplete",
    "color",
    "highlighting",
    "validation",
  ]);
});

test("every entry has a feature, a valid layer, and non-empty css", () => {
  for (const e of CORPUS) {
    assert.ok(e.feature, "feature missing");
    assert.ok(
      LAYERS.includes(e.expectedLayer),
      `bad layer for ${e.feature}: ${e.expectedLayer}`
    );
    assert.ok(
      typeof e.css === "string" && e.css.trim().length > 0,
      `empty css for ${e.feature}`
    );
    assert.ok(
      !e.css.includes("${"),
      `corpus css must be interpolation-free: ${e.feature}`
    );
  }
});

test("feature names are unique", () => {
  const seen = new Set();
  for (const e of CORPUS) {
    assert.ok(!seen.has(e.feature), `duplicate feature: ${e.feature}`);
    seen.add(e.feature);
  }
});

test("covers the overlay regression and at least one entry per non-autocomplete layer", () => {
  assert.ok(
    CORPUS.some((e) => e.feature === "overlay"),
    "missing overlay case"
  );
  for (const layer of ["validation", "color", "highlighting"]) {
    assert.ok(
      CORPUS.some((e) => e.expectedLayer === layer),
      `no corpus entry for layer ${layer}`
    );
  }
});
