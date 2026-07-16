"use strict";
const { parse, converter, clampRgb } = require("culori");

const toRgb = converter("rgb");

const FUNC =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\((?:[^()]*|\([^()]*\))*\)/gi;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
// Named colour after ':' , ',' or '('. The '(' also swatches the FIRST colour
// argument of any function (color-mix/light-dark, but also e.g. the first stop of
// a gradient) and makes `transparent` swatch — an intentional superset of the old
// allowlist. culori.parse gates it, so non-colour words (all, block, url…) match nothing.
const NAMED = /(?<=[:,(]\s*)[a-zA-Z]+(?![\w-])/g;
const REL =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(\s*from\s+([a-zA-Z]+|#[0-9a-fA-F]{3,8})/gi;

function toChip(str) {
  const parsed = parse(str);
  if (!parsed) return undefined;
  const rgb = clampRgb(toRgb(parsed));
  if (!rgb) return undefined;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  return {
    r: clamp(rgb.r),
    g: clamp(rgb.g),
    b: clamp(rgb.b),
    a: rgb.alpha === undefined ? 1 : rgb.alpha,
  };
}

// Find every renderable colour in a line of CSS. Returns document-order
// { index, length, str, rgb } entries; overlapping candidates are dropped.
function findColors(text) {
  const found = [];
  const overlaps = (i, len) =>
    found.some((f) => i < f.index + f.length && i + len > f.index);
  const add = (index, length, str) => {
    if (overlaps(index, length)) return;
    const rgb = toChip(str);
    if (rgb) found.push({ index, length, str, rgb });
  };
  let m;
  FUNC.lastIndex = 0;
  while ((m = FUNC.exec(text))) add(m.index, m[0].length, m[0]);
  REL.lastIndex = 0;
  while ((m = REL.exec(text))) {
    const base = m[1];
    add(m.index + m[0].length - base.length, base.length, base);
  }
  HEX.lastIndex = 0;
  while ((m = HEX.exec(text))) add(m.index, m[0].length, m[0]);
  NAMED.lastIndex = 0;
  while ((m = NAMED.exec(text))) add(m.index, m[0].length, m[0]);
  return found.sort((a, b) => a.index - b.index);
}

module.exports = { findColors };
