"use strict";
const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const { diffProviders, runDataProbe } = require("./probe-data");

// Fake css-languageservice modules exposing only getDefaultCSSDataProvider().
function fakeMod(props, ats, pcs, pes) {
  return {
    getDefaultCSSDataProvider: () => ({
      provideProperties: () => props.map((name) => ({ name })),
      provideAtDirectives: () => ats.map((name) => ({ name })),
      providePseudoClasses: () => pcs.map((name) => ({ name })),
      providePseudoElements: () => pes.map((name) => ({ name })),
    }),
  };
}

test("diffProviders returns entities present in latest but absent in bundled", () => {
  const bundled = fakeMod(["color"], ["@media"], [":hover"], ["::before"]);
  const latest = fakeMod(
    ["color", "overlay"],
    ["@media", "@container"],
    [":hover", ":has"],
    ["::before", "::backdrop"]
  );
  const d = diffProviders(bundled, latest);
  assert.deepStrictEqual(d.properties, ["overlay"]);
  assert.deepStrictEqual(d.atDirectives, ["@container"]);
  assert.deepStrictEqual(d.pseudoClasses, [":has"]);
  assert.deepStrictEqual(d.pseudoElements, ["::backdrop"]);
});

test("diff is case-insensitive and ignores order", () => {
  const bundled = fakeMod(["Color"], [], [], []);
  const latest = fakeMod(["color"], [], [], []);
  assert.deepStrictEqual(diffProviders(bundled, latest).properties, []);
});

test("runDataProbe reports a repo-relative bundledPath", () => {
  const result = runDataProbe();
  assert.ok(!path.isAbsolute(result.bundledPath));
});
