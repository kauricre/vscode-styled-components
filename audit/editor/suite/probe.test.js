"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { commands, Uri, window, workspace } = require("vscode");

const fixturePath = path.resolve(__dirname, "../fixture.tsx");
const map = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../fixture.map.json"), "utf8")
);
const outPath = path.resolve(
  __dirname,
  "../../../docs/superpowers/audit/editor-findings.json"
);

const scopeHasCss = (t) =>
  /(^|\s)source\.css|\.css($|\s|\.)|\.scss($|\s|\.)/.test(t);
const inRange = (line, entry) =>
  line >= entry.startLine && line <= entry.endLine;

suite("editor audit probe", () => {
  test("capture tokens + colors, write findings", async function () {
    this.timeout(60000);

    const doc = await workspace.openTextDocument(Uri.file(fixturePath));
    await window.showTextDocument(doc);

    // --- Highlighting: tokens with no CSS/SCSS scope inside a styled block are gaps. ---
    const tokens = await commands.executeCommand(
      "_workbench.captureSyntaxTokens",
      Uri.file(fixturePath)
    );
    // captureSyntaxTokens returns document-order tokens as { c, t, r } without line numbers,
    // so we re-tokenise per line by walking the document text alongside token order.
    // Simpler + robust: flag per feature using the raw CSS signature token presence in a CSS-scoped token.
    const highlighting = [];
    for (const entry of map.filter((e) => e.expectedLayer === "highlighting")) {
      const sig = signatureToken(entry.feature);
      const hit = tokens.find((tk) => tk.c && tk.c.includes(sig));
      if (!hit || !scopeHasCss(hit.t)) {
        highlighting.push({
          feature: entry.feature,
          symptom: hit
            ? `token '${sig}' not scoped as CSS (scope: ${hit.t})`
            : `token '${sig}' not found in CSS scope`,
          evidence: entry.css,
        });
      }
    }

    // --- Color: color-layer features must yield a swatch within their line span. ---
    const colors = await commands.executeCommand(
      "vscode.executeDocumentColorProvider",
      Uri.file(fixturePath)
    );
    const color = [];
    for (const entry of map.filter((e) => e.expectedLayer === "color")) {
      const swatch = (colors || []).find((c) =>
        inRange(c.range.start.line, entry)
      );
      if (!swatch) {
        color.push({
          feature: entry.feature,
          symptom: "no inline color swatch produced",
          evidence: entry.css,
        });
      }
    }

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify({ highlighting, color }, null, 2));

    // The probe's job is to RECORD findings, not to fail the run. Assert only that it produced output.
    assert.ok(fs.existsSync(outPath));
  });
});

// The most distinctive substring of each feature's CSS, used to locate its token.
function signatureToken(feature) {
  const map = {
    container: "@container",
    layer: "@layer",
    scope: "@scope",
    "starting-style": "@starting-style",
    nesting: "&",
    has: ":has",
    "popover-open": ":popover-open",
  };
  return map[feature] || feature;
}
