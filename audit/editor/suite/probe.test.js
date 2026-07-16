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

const inRange = (line, entry) =>
  line >= entry.startLine && line <= entry.endLine;

suite("editor audit probe", () => {
  test("capture tokens + colors, write findings", async function () {
    this.timeout(60000);

    // --- Highlighting: one construct per file (captureSyntaxTokens has no
    // positions), so every token in a per-feature fixture belongs to that construct.
    // A construct is a real gap only if NO token carries the scope-kind the grammar
    // is expected to assign it (at-rule / pseudo-class / tag.reference). Checking
    // for the scope kind — rather than matching the identifier's text — avoids
    // false negatives when the grammar splits an identifier across tokens, and
    // false positives from short identifiers matching unrelated CSS tokens. ---
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
      const want = expectedScope(entry.feature);
      const scoped = (tokens || []).filter((tk) => tk.t && tk.t.includes(want));
      if (scoped.length === 0) {
        const dump = (tokens || [])
          .filter((tk) => tk.c && tk.c.trim())
          .map((tk) => `${tk.c.trim()}→${tk.t}`)
          .join(" | ");
        highlighting.push({
          feature: entry.feature,
          symptom: `no token scoped '${want}' — construct not recognized`,
          evidence: `${entry.css} | observed tokens: ${dump}`,
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

// The scope-kind a correctly-highlighted construct must produce.
function expectedScope(feature) {
  const kinds = {
    container: "at-rule",
    layer: "at-rule",
    scope: "at-rule",
    "starting-style": "at-rule",
    has: "pseudo-class",
    "popover-open": "pseudo-class",
    nesting: "tag.reference",
  };
  return kinds[feature] || feature;
}
