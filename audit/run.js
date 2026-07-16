"use strict";
const fs = require("fs");
const path = require("path");
const { runDataProbe } = require("./probe-data");
const { runCorpusProbe } = require("./probe-corpus");

const outDir = path.resolve(__dirname, "../docs/superpowers/audit");
fs.mkdirSync(outDir, { recursive: true });

const data = runDataProbe();
fs.writeFileSync(
  path.join(outDir, "probe-data.json"),
  JSON.stringify(data, null, 2)
);

const corpus = runCorpusProbe();
fs.writeFileSync(
  path.join(outDir, "probe-corpus.json"),
  JSON.stringify(corpus, null, 2)
);

console.log(
  `Probe A: ${data.missing.properties.length} missing properties, ${data.missing.atDirectives.length} missing at-directives (bundled ${data.bundledVersion} vs latest ${data.latestVersion})`
);
console.log(`Probe B: ${corpus.length} corpus diagnostics`);
