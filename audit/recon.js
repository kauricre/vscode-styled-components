"use strict";
const fs = require("fs");
const path = require("path");
const { resolvePluginCss, resolveLatestCss } = require("./resolve");

const plugin = resolvePluginCss();
const latest = resolveLatestCss();

// Detect validation mode: scan the plugin's shipped code for which service factory it calls.
const pluginDir = path.dirname(
  require.resolve("@styled/typescript-styled-plugin/package.json")
);
let mode = "unknown";
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|ts)$/.test(e.name)) files.push(p);
  }
})(pluginDir);
const src = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
if (/getSCSSLanguageService/.test(src)) mode = "scss";
else if (/getCSSLanguageService/.test(src)) mode = "css";

console.log(
  JSON.stringify(
    {
      pluginCssVersion: plugin.version,
      pluginCssPath: plugin.dir,
      latestCssVersion: latest.version,
      validationMode: mode,
    },
    null,
    2
  )
);
