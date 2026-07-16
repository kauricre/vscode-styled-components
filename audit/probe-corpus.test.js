"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { resolvePluginCss } = require("./resolve");
const { validateCss } = require("./probe-corpus");

const { mod } = resolvePluginCss();

test("known-good CSS produces no diagnostics", () => {
  const diags = validateCss(mod, ".x { color: red; }", "scss");
  assert.strictEqual(diags.length, 0);
});

test("a genuinely unknown property still produces an 'Unknown property' diagnostic (detection mechanism works, version-independent)", () => {
  const diags = validateCss(
    mod,
    ".x { xyzzy-not-a-real-property: 1; }",
    "scss"
  );
  assert.ok(
    diags.some((d) => /unknown property/i.test(d.message)),
    JSON.stringify(diags)
  );
});

test("the previously-unknown 'overlay' property is recognized after the css-languageservice bump (no unknown-property diagnostic)", () => {
  const diags = validateCss(mod, ".x { overlay: auto; }", "scss");
  assert.ok(
    !diags.some((d) => /unknown property/i.test(d.message)),
    JSON.stringify(diags)
  );
});
