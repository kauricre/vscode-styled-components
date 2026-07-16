"use strict";
const { findColors } = require("../src/colorMatch");
const { CORPUS } = require("./corpus");

function runColorProbe() {
  const findings = [];
  for (const entry of CORPUS.filter((e) => e.expectedLayer === "color")) {
    if (findColors(entry.css).length === 0) {
      findings.push({
        feature: entry.feature,
        layer: "color",
        probe: "color",
        symptom: "no inline color swatch produced",
        evidence: entry.css,
        fixLocation: "src/colorMatch.js / src/colorProvider.ts",
      });
    }
  }
  return findings;
}

module.exports = { runColorProbe };

if (require.main === module) {
  console.log(JSON.stringify(runColorProbe(), null, 2));
}
