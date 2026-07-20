"use strict";
const assert = require("assert");
const vscode = require("vscode");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pollDiags(uri, predicate, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const diags = vscode.languages.getDiagnostics(uri);
    if (predicate(diags)) return diags;
    await sleep(1000);
  }
  return vscode.languages.getDiagnostics(uri);
}

const isStyledDiag = (d) =>
  /styled/i.test(String(d.source || "")) || String(d.code) === "9999";

suite("settings bridge (configurePlugin)", () => {
  test("styled-components.validate=false disables plugin diagnostics", async function () {
    this.timeout(120000);
    const ext = vscode.extensions.getExtension(
      "kauricre.vscode-styled-components-modern"
    );
    assert.ok(ext, "extension not found by id");
    await ext.activate();

    const doc = await vscode.workspace.openTextDocument({
      language: "typescriptreact",
      content:
        'import styled from "styled-components";\n' +
        "export const Box = styled.div`\n" +
        "  colr: red;\n" +
        "`;\n",
    });
    await vscode.window.showTextDocument(doc);

    let diags = await pollDiags(doc.uri, (ds) => ds.some(isStyledDiag), 60000);
    assert.ok(
      diags.some(isStyledDiag),
      "expected a ts-styled-plugin diagnostic with default settings, got: " +
        diags.map((d) => `${d.source}|${d.code}`).join(",")
    );

    await vscode.workspace
      .getConfiguration("styled-components")
      .update("validate", false, vscode.ConfigurationTarget.Global);
    await sleep(2000);
    // Nudge the TS server to recompute diagnostics for the open file.
    await vscode.window.activeTextEditor.edit((e) =>
      e.insert(new vscode.Position(3, 0), " ")
    );
    diags = await pollDiags(doc.uri, (ds) => !ds.some(isStyledDiag), 30000);
    assert.ok(
      !diags.some(isStyledDiag),
      "expected no ts-styled-plugin diagnostics after validate=false"
    );

    // Reset for other suites (temp profile, but keep the host clean anyway).
    await vscode.workspace
      .getConfiguration("styled-components")
      .update("validate", undefined, vscode.ConfigurationTarget.Global);
  });
});
