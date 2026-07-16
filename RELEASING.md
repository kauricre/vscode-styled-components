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
**1.8.0**). Use semver: new backward-compatible features → minor bump.

## Publish — Option A: GitHub Release (CI, recommended)

`.github/workflows/release.yml` runs `vsce publish -p $VSCE_TOKEN` when a GitHub
Release is **published**.

1. In the fork's GitHub repo: **Settings → Secrets and variables → Actions** → add
   secret `VSCE_TOKEN` = your PAT.
2. Ensure `publisher` is set (not the placeholder) and the version is bumped, on the
   default branch.
3. Create a Git tag and a **GitHub Release** for it (e.g. `v1.8.0`). Publishing the
   release triggers the workflow, which builds and publishes to the Marketplace.

## Publish — Option B: manual

```
npm install
npx vsce login kauricre              # paste the PAT when prompted
npx vsce publish                     # or: npx vsce publish minor
```

## Build a local .vsix (no Marketplace)

```
npm install
npx vsce package                     # → kauricre.vscode-styled-components-<version>.vsix
```

Install via **Extensions: Install from VSIX…**. `.vsix` files are git-ignored.

## Sanity checks before releasing

- `npm run compile` — builds `dist/extension.js`.
- `npm run audit` — the modern-CSS audit; expect 0 findings across all layers
  (validation, autocomplete, highlighting, color).
- `npm run audit:test` — harness unit tests pass.
