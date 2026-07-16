"use strict";
const { resolvePluginCss, resolveLatestCss } = require("./resolve");

const names = (list) => list.map((x) => x.name);

function diffProviders(bundledMod, latestMod) {
  const b = bundledMod.getDefaultCSSDataProvider();
  const l = latestMod.getDefaultCSSDataProvider();
  const missing = (bList, lList) => {
    const have = new Set(names(bList).map((n) => n.toLowerCase()));
    return names(lList)
      .filter((n) => !have.has(n.toLowerCase()))
      .sort();
  };
  return {
    properties: missing(b.provideProperties(), l.provideProperties()),
    atDirectives: missing(b.provideAtDirectives(), l.provideAtDirectives()),
    pseudoClasses: missing(b.providePseudoClasses(), l.providePseudoClasses()),
    pseudoElements: missing(
      b.providePseudoElements(),
      l.providePseudoElements()
    ),
  };
}

function runDataProbe() {
  const plugin = resolvePluginCss();
  const latest = resolveLatestCss();
  return {
    bundledVersion: plugin.version,
    bundledPath: plugin.dir,
    latestVersion: latest.version,
    missing: diffProviders(plugin.mod, latest.mod),
  };
}

module.exports = { diffProviders, runDataProbe };

if (require.main === module) {
  console.log(JSON.stringify(runDataProbe(), null, 2));
}
