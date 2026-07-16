"use strict";
const fs = require("fs");
const path = require("path");
const { CORPUS } = require("../corpus");

// Emit one styled component per corpus entry (combined fixture, used by the color
// check) plus one single-construct fixture per highlighting-layer entry (used by the
// scope-based highlighting check, which needs each construct isolated).
function generate() {
  const dir = __dirname;

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
  fs.writeFileSync(path.join(dir, "fixture.tsx"), out);
  fs.writeFileSync(
    path.join(dir, "fixture.map.json"),
    JSON.stringify(map, null, 2)
  );

  // Per-feature highlighting fixtures: one construct per file so every token in the
  // file belongs to that construct (captureSyntaxTokens gives no positions to
  // attribute tokens by in the combined fixture).
  const hlDir = path.join(dir, "highlighting");
  fs.mkdirSync(hlDir, { recursive: true });
  for (const entry of CORPUS.filter(
    (e) => e.expectedLayer === "highlighting"
  )) {
    const single = `${header}export const C = styled.div\`\n  ${entry.css}\n\`;\n`;
    fs.writeFileSync(path.join(hlDir, `${entry.feature}.tsx`), single);
  }

  return { fixturePath: path.join(dir, "fixture.tsx"), map };
}

module.exports = { generate };

if (require.main === module) generate();
