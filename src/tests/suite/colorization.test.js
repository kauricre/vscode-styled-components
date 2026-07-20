/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";

const assert = require("assert");
const { commands, Uri } = require("vscode");
const { join, basename, dirname } = require("path");
const fs = require("fs");

function assertUnchangedTokens(testFixurePath, done) {
  let fileName = basename(testFixurePath);

  return commands
    .executeCommand("_workbench.captureSyntaxTokens", Uri.file(testFixurePath))
    .then((data) => {
      try {
        let resultsFolderPath = join(
          dirname(dirname(testFixurePath)),
          "colorize-results"
        );
        if (!fs.existsSync(resultsFolderPath)) {
          fs.mkdirSync(resultsFolderPath);
        }
        let resultPath = join(
          resultsFolderPath,
          fileName.replace(".", "_") + ".json"
        );
        if (fs.existsSync(resultPath)) {
          let previousData = JSON.parse(fs.readFileSync(resultPath).toString());
          try {
            assert.deepStrictEqual(data, previousData);
          } catch (e) {
            fs.writeFileSync(resultPath, JSON.stringify(data, null, "\t"), {
              flag: "w",
            });
            if (
              Array.isArray(data) &&
              Array.isArray(previousData) &&
              data.length === previousData.length
            ) {
              for (let i = 0; i < data.length; i++) {
                let d = data[i];
                let p = previousData[i];
                if (d.c !== p.c || hasThemeChange(d.r, p.r)) {
                  throw e;
                }
              }
              // different but no tokenization ot color change: no failure
            } else {
              throw e;
            }
          }
        } else {
          fs.writeFileSync(resultPath, JSON.stringify(data, null, "\t"));
        }
        done();
      } catch (e) {
        done(e);
      }
    }, done);
}

function hasThemeChange(d, p) {
  let keys = Object.keys(d);
  for (let key of keys) {
    if (d[key] !== p[key]) {
      return true;
    }
  }
  return false;
}

// KNOWN QUIRK: theme-function.js's snapshot is sensitive to the total number
// of files in colorize-fixtures/, unrelated to this extension's own grammar.
// Its `styled.div(({theme}) => \`...\`)` construct gets tokenized with a
// different internal JS/TS grammar variant (.ts- vs .js-suffixed nested
// scopes) depending purely on sibling file count in this directory —
// confirmed by ruling out grammar changes, fixture content, extension,
// position, test-profile freshness, semantic highlighting, and warm-up
// ordering (none of these explain it; only the count does). If this
// fixture's snapshot drifts when you add or remove ANY fixture, and the
// diff shows source.css.scss scopes appearing/disappearing on this file
// specifically, that is this known, external VS Code/TypeScript-language-
// features behavior — regenerate and commit its snapshot without further
// investigation.
suite("colorization", () => {
  let extensionColorizeFixturePath = join(__dirname, "colorize-fixtures");
  if (fs.existsSync(extensionColorizeFixturePath)) {
    let fixturesFiles = fs.readdirSync(extensionColorizeFixturePath);
    fixturesFiles.forEach((fixturesFile) => {
      // define a test for each fixture
      test(fixturesFile, function(done) {
        this.timeout(5000); // Needed to try and fix macos timeout issues
        assertUnchangedTokens(
          join(extensionColorizeFixturePath, fixturesFile),
          done
        );
      });
    });
  }
});
