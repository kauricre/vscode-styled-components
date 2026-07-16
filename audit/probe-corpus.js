"use strict";
const { resolvePluginCss } = require("./resolve");
const { CORPUS } = require("./corpus");

const DEFAULT_MODE = "scss"; // set from Task 1 recon; scss is the styled-components default

function getService(mod, mode) {
  return mode === "css"
    ? mod.getCSSLanguageService()
    : mod.getSCSSLanguageService();
}

function validateCss(mod, css, mode = DEFAULT_MODE) {
  const service = getService(mod, mode);
  const doc = mod.TextDocument.create(
    "untitled://embedded." + mode,
    mode,
    1,
    css
  );
  const stylesheet = service.parseStylesheet(doc);
  return service.doValidation(doc, stylesheet);
}

function runCorpusProbe(mode = DEFAULT_MODE) {
  const { mod } = resolvePluginCss();
  /** @type {Array<object>} */
  const findings = [];
  for (const entry of CORPUS) {
    const diags = validateCss(mod, entry.css, mode);
    for (const d of diags) {
      findings.push({
        feature: entry.feature,
        layer: "validation",
        probe: "corpus-diagnostics",
        symptom: d.message,
        evidence: `${entry.css}  (severity ${d.severity})`,
        fixLocation:
          "dependency: bump vscode-css-languageservice inside @styled/typescript-styled-plugin",
      });
    }
  }
  return findings;
}

module.exports = { validateCss, runCorpusProbe, DEFAULT_MODE };

if (require.main === module) {
  console.log(JSON.stringify(runCorpusProbe(), null, 2));
}
