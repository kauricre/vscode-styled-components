"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { findColors } = require("./colorMatch");

const strs = (text) => findColors(text).map((c) => c.str);
const inGamut = (c) =>
  [c.rgb.r, c.rgb.g, c.rgb.b].every((v) => v >= 0 && v <= 1);

test("existing formats still swatch", () => {
  assert.deepStrictEqual(strs(".x { color: #ff0000; }"), ["#ff0000"]);
  assert.deepStrictEqual(strs(".x { color: rgb(255, 0, 153); }"), [
    "rgb(255, 0, 153)",
  ]);
  assert.deepStrictEqual(strs(".x { color: hsl(60, 100%, 50%); }"), [
    "hsl(60, 100%, 50%)",
  ]);
  assert.deepStrictEqual(strs(".x { color: red; }"), ["red"]);
});

test("oklch / oklab / hwb swatch and are clamped in-gamut", () => {
  for (const css of [
    ".x { color: oklch(0.7 0.15 200); }",
    ".x { color: oklab(0.7 0.1 0.1); }",
    ".x { color: hwb(194 0% 0%); }",
  ]) {
    const found = findColors(css);
    assert.strictEqual(found.length, 1, css);
    assert.ok(inGamut(found[0]), `out of gamut: ${css}`);
  }
});

test("color-mix and light-dark swatch their inner colors", () => {
  assert.deepStrictEqual(
    strs(".x { color: color-mix(in oklch, red, blue); }").sort(),
    ["blue", "red"]
  );
  assert.deepStrictEqual(strs(".x { color: light-dark(red, blue); }").sort(), [
    "blue",
    "red",
  ]);
});

test("relative color swatches its base color", () => {
  assert.deepStrictEqual(strs(".x { color: rgb(from red r g b); }"), ["red"]);
});

test("non-colors produce no swatch", () => {
  assert.deepStrictEqual(findColors(".x { width: 10px; }"), []);
  assert.deepStrictEqual(findColors(".x { display: block; }"), []);
});

test("swatch index/length locate the substring", () => {
  const css = ".x { color: oklch(0.7 0.15 200); }";
  const [c] = findColors(css);
  assert.strictEqual(
    css.slice(c.index, c.index + c.length),
    "oklch(0.7 0.15 200)"
  );
});
