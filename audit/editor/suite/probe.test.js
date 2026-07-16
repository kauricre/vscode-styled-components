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

    // --- Highlighting: one construct per file (captureSyntaxTokens has no
    // positions), so every token in a per-feature fixture belongs to that construct.
    // A construct is a real gap only if the tokens carrying its identifier have NO
    // CSS/SCSS scope. (The old substring check failed because the grammar splits
    // "@container" into "@" + "container" — no single token contains "@container".) ---
    const highlighting = [];
    for (const entry of map.filter((e) => e.expectedLayer === "highlighting")) {
      const file = path.resolve(
        __dirname,
        "../highlighting",
        `${entry.feature}.tsx`
      );
      const hlDoc = await workspace.openTextDocument(Uri.file(file));
      await window.showTextDocument(hlDoc);
      const tokens = await commands.executeCommand(
        "_workbench.captureSyntaxTokens",
        Uri.file(file)
      );
      const id = identifier(entry.feature);
      const matches = (tokens || []).filter((tk) => tk.c && tk.c.includes(id));
      const cssMatches = matches.filter((tk) => scopeHasCss(tk.t));
      if (cssMatches.length === 0) {
        highlighting.push({
          feature: entry.feature,
          symptom: matches.length
            ? `'${id}' tokens present but none CSS-scoped`
            : `'${id}' not found as a token`,
          evidence: `${entry.css} | observed scopes: ${
            matches.map((m) => m.t).join(" || ") || "(no matching token)"
          }`,
        });
      }
    }

    // --- Color: color-layer features must yield a swatch within their line span
    // in the combined fixture. ---
    const colorDoc = await workspace.openTextDocument(Uri.file(fixturePath));
    await window.showTextDocument(colorDoc);
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

// The distinctive identifier of each construct (without @ or :), used to locate its
// tokens in the construct's own per-feature fixture.
function identifier(feature) {
  const ids = {
    container: "container",
    layer: "layer",
    scope: "scope",
    "starting-style": "starting-style",
    nesting: "&",
    has: "has",
    "popover-open": "popover-open",
  };
  return ids[feature] || feature;
}
