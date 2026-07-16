# Releasing

> **Publisher:** `package.json` `publisher` is set to **`kauricre`**. It must match a
> VS Code Marketplace publisher you own (see
> `https://marketplace.visualstudio.com/manage/publishers/`) or publishing will fail.

## Prerequisites (one-time)

1. A VS Code Marketplace **publisher** (create at the Marketplace management page).
2. Set `package.json` `"publisher"` to that id.
3. A **Personal Access Token** (Azure DevOps) with **Marketplace → Manage** scope.

## Version

Bump `version` in `package.json` and add a `CHANGELOG.md` entry (this repo is at
**1.9.0**). Use semver: new backward-compatible features → minor bump.

## Publish (manual)

> Releases are published **manually by the maintainer** — an owner decision.
> Do not (re)add CI auto-publish workflows. Tag + GitHub Release are still
> created afterwards for the record, but they do not trigger anything.

```
npm install
npx vsce login kauricre              # paste the PAT when prompted
npx vsce publish                     # or: npx vsce publish minor
```

## Build a local .vsix (no Marketplace)

```
npm install
npx vsce package                     # → vscode-styled-components-modern-<version>.vsix
```

Install via **Extensions: Install from VSIX…**. `.vsix` files are git-ignored.

## Sanity checks before releasing

- `npm run compile` — builds `dist/extension.js`.
- `npm run audit` — the modern-CSS audit; expect 0 findings across all layers
  (validation, autocomplete, highlighting, color).
- `npm run audit:test` — harness unit tests pass.
