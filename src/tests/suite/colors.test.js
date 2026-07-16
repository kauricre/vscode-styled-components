"use strict";
const assert = require("assert");
const vscode = require("vscode");

suite("color provider language coverage", () => {
  test("swatches appear in a plain-TypeScript untitled document", async function () {
    this.timeout(30000);
    const ext = vscode.extensions.getExtension(
      "kauricre.vscode-styled-components-modern"
    );
    assert.ok(ext, "extension not found by id");
    await ext.activate();

    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      // oklch: not matched by VS Code's built-in default color provider — only our provider can produce this swatch.
      content:
        'import styled from "styled-components";\n' +
        "export const Box = styled.div`\n" +
        "  color: oklch(62% 0.19 25);\n" +
        "`;\n",
    });
    const colors = await vscode.commands.executeCommand(
      "vscode.executeDocumentColorProvider",
      doc.uri
    );
    assert.strictEqual(
      colors.length,
      1,
      `expected 1 swatch in untitled typescript doc, got ${colors.length}`
    );
  });
});
