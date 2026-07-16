---
name: verifying-extension-activation
description: Use before packaging/releasing the vscode-styled-components extension, after any change to build.mjs / bundler config / dependencies, or to confirm an activation fix — when you need proof the built bundle actually loads and activates, not just that the build command exited 0 or "Cannot find module" appears at runtime.
---

# Verifying extension activation

## Overview

**A green `npm run compile` (or `vsce package`) proves the bundle was _written_, not
that it _loads_.** esbuild happily emits a valid-looking bundle that throws at runtime
— e.g. an unresolved `require("./parser/cssParser")` left behind when it pulls a
dependency's UMD/AMD `main` instead of ESM, or a truncated bundle. The only cheap proof
the extension will activate for a user: **load `dist/extension.js` in Node with a stubbed
`vscode` and call `activate()`.**

## When to run

- Before every `vsce package` / publish.
- After any change to `build.mjs`, the bundler, `mainFields`, or a bundled dependency.
- To confirm a suspected activation fix is actually fixed (RED→GREEN).

## Why the usual checks DON'T catch it

| Check                                 | Why it misses a broken activation                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run compile`                     | Exits **0** on a bad bundle — esbuild doesn't error on a shadowed/unresolved runtime `require`.      |
| `npm test` / `npm run audit` (editor) | Exercise the TextMate **grammar** via `captureSyntaxTokens` — declarative, never calls `activate()`. |
| `npm run audit:test`                  | Tests probe logic against `node_modules`, not the packaged bundle.                                   |
| `vsce package` succeeding             | Packages files; never loads them.                                                                    |

None load the shipped entry module. So all can be green while the extension is DOA.

## The check (copy-paste)

Run after building `dist/extension.js`:

```bash
node -e '
const M = require("module"), orig = M._load;
// Recursive stub: any vscode API access returns a callable/constructable proxy;
// extensions.all → [] so activate()'"'"'s conflict check doesn'"'"'t trip.
const vscode = new Proxy(function () {}, {
  get: (_, p) => (p === "all" ? [] : vscode),
  apply: () => ({ dispose() {} }),
  construct: () => ({}),
});
M._load = (r, ...a) => (r === "vscode" ? vscode : orig.apply(M, [r, ...a]));
const ext = require("./dist/extension.js"); // throws here if the bundle has an unresolved require
ext.activate({ subscriptions: [] });        // throws here on a real activate() bug
console.log("OK: bundle loads and activate() runs");
'
```

**Pass:** prints `OK`. **Fail:** any throw.

- `Cannot find module './...'` → the bundler left an unresolved require (check `build.mjs` `mainFields` / that deps' ESM builds are bundled).
- a throw from inside `activate()` → a genuine activation bug in the extension code.

For the packaged artifact, unzip the `.vsix` and run the same check against its
`extension/dist/extension.js` — packaging can differ from a local build.

## Common mistakes

- **Trusting "compile ok" / "vsce packaged".** Neither loads the bundle. Always run the check.
- **Too-thin `vscode` stub.** If the stub lacks `all → []`, `activate()` may throw on the
  conflicting-extension check and look like a real failure — use the recursive proxy above.
- **Checking only the local `dist/`, not the `.vsix`.** Verify the packaged bundle before publish.

Related: **debugging-styled-components-extension** (activation gotchas), **refreshing-css-support** (release verify step).
