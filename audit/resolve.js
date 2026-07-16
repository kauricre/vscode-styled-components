"use strict";
const path = require("path");

// Resolve the css-languageservice copy the TS plugin actually loads.
function resolvePluginCss() {
  const pluginPkg = require.resolve(
    "@styled/typescript-styled-plugin/package.json"
  );
  const pluginDir = path.dirname(pluginPkg);
  const cssPkgPath = require.resolve(
    "vscode-css-languageservice/package.json",
    {
      paths: [pluginDir],
    }
  );
  const dir = path.dirname(cssPkgPath);
  const version = require(cssPkgPath).version;
  return { version, dir, mod: require(dir) };
}

function resolveLatestCss() {
  return {
    version: require("css-latest/package.json").version,
    mod: require("css-latest"),
  };
}

module.exports = { resolvePluginCss, resolveLatestCss };
