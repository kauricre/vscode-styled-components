"use strict";
const os = require("os");
const path = require("path");
const { runTests } = require("@vscode/test-electron");
const { generate } = require("./generate-fixture");

async function main() {
  generate(); // (re)write fixture.tsx + fixture.map.json before launching VS Code
  try {
    await runTests({
      extensionDevelopmentPath: path.resolve(__dirname, "../../"),
      extensionTestsPath: path.resolve(__dirname, "./suite/index"),
      // Default --user-data-dir lives under this repo's (long) absolute path, whose
      // instance-lock IPC socket path can exceed macOS's ~103-char AF_UNIX limit.
      // Point it at a short tmp dir instead; this only affects VS Code's scratch
      // profile data, not the probe's behavior.
      launchArgs: [
        "--disable-extensions",
        `--user-data-dir=${path.join(
          os.tmpdir(),
          "vscode-audit-editor-user-data"
        )}`,
      ],
    });
  } catch (err) {
    console.error("Editor probe failed", err);
    process.exit(1);
  }
}
main();
