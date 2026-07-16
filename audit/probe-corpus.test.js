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

test("the reported overlay property produces an 'Unknown property' diagnostic on the stale engine", () => {
  const diags = validateCss(mod, ".x { overlay: auto; }", "scss");
  assert.ok(
    diags.some((d) => /unknown property/i.test(d.message)),
    JSON.stringify(diags)
  );
});
