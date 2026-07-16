"use strict";
const fs = require("fs");
const path = require("path");
const { CORPUS } = require("../corpus");

// Emit one styled component per corpus entry and record each entry's line span,
// so Probe C can attribute tokens/colors back to a feature by line number.
function generate() {
  const header = "import styled from 'styled-components';\n\n";
  let out = header;
  const map = [];
  CORPUS.forEach((entry, i) => {
    const startLine = out.split("\n").length - 1; // 0-based line of the `styled` open
    const block = `export const C${i} = styled.div\`\n  ${entry.css}\n\`;\n\n`;
    out += block;
    const endLine = out.split("\n").length - 2;
    map.push({
      feature: entry.feature,
      expectedLayer: entry.expectedLayer,
      css: entry.css,
      startLine,
      endLine,
    });
  });
  const dir = __dirname;
  fs.writeFileSync(path.join(dir, "fixture.tsx"), out);
  fs.writeFileSync(
    path.join(dir, "fixture.map.json"),
    JSON.stringify(map, null, 2)
  );
  return { fixturePath: path.join(dir, "fixture.tsx"), map };
}

module.exports = { generate };

if (require.main === module) generate();
