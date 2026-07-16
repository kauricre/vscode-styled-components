# vscode-styled-components-modern

> **Actively-maintained fork** of the archived
> [styled-components/vscode-styled-components](https://github.com/styled-components/vscode-styled-components),
> refreshed for 2026 CSS standards: modern properties, at-rules (`@container`,
> `@scope`, `@starting-style`, …), color functions (`oklch()`, `oklab()`,
> `color-mix()`, relative color), and newer pseudo-classes (`:popover-open`)
> are recognised, highlighted, and (where applicable) colour-swatched.
> See the [CHANGELOG](./CHANGELOG.md) and
> [why this fork](#why-this-fork) below.
>
> Source: https://github.com/kauricre/vscode-styled-components

Syntax highlighting and IntelliSense for [styled-components](https://github.com/styled-components/styled-components).

![Syntax highlighting in action](demo.gif)

Uses a CSS grammar built on top of [language-sass](https://github.com/atom/language-sass) and [language-css](https://github.com/atom/language-css).

## Install

**VS Code** — press `Ctrl+P` / `Cmd+P` and enter:

```
ext install kauricre.vscode-styled-components-modern
```

**From source:**

```
npm install && npx vsce package
```

then run **Extensions: Install from VSIX…** on the generated `.vsix`.

## Why this fork

The upstream extension was archived; its last release (1.7.8, 2023) predates
modern CSS. This fork:

- **Knows 2026 CSS.** Bundled CSS language service updated (6.2.4 → 6.3.10);
  a [reproducible audit](./docs/superpowers/audit/report.md) shows 0
  validation / autocomplete / highlighting / color findings against a
  modern-CSS corpus.
- **Verified against upstream's loudest bug reports.** We generated fixtures
  from the exact repro code of the top-voted upstream highlighting issues and
  token-probed this fork (VS Code 1.129.0, 2026-07-16, pre-1.9.0 baseline —
  [raw results](./docs/superpowers/audit/upstream-issues-probe.json)).
  Verified working in this fork: TypeScript generics on `styled.div<{…}>`
  (upstream #159; #442 via the probe's `afterLeaked` no-scope-leak
  measurement), multiline prop types (#358), `.attrs()` with
  props callbacks (#292), nested `` css`…` `` helpers (#425), wrapped calls
  like `styled(hof("div"))` (#127, #196). Multiline `styled( Component )`
  calls (#328) show as broken in that baseline probe and are fixed in 1.9.0,
  with a regression fixture
  (`src/tests/suite/colorize-fixtures/multiline-styled-call.ts`) guarding
  the fix.
- **Covers more file types.** Color swatches and the template snippet work in
  plain `.ts` / `.js` files (the `styles.ts` pattern), `.vue`, `.svelte`, and
  untitled buffers — not just `.tsx`/`.jsx` on disk.

## Known limitations

- **Custom tagged-template names** (e.g. `import myStyled from
"styled-components"`) don't highlight — planned, tracked as backlog item 7
  in [the improvement backlog](./docs/superpowers/specs/2026-07-16-improvement-backlog.md).
- **Syntax colouring after multiline component definitions:** when a
  multiline `styled(…)` call, multiline `.attrs(…)`, or multiline generic
  type argument is highlighted, the TypeScript syntax colouring of code
  after that component can be slightly degraded — a TextMate grammar
  architecture limit inherited from upstream's continuation patterns.
- **Colour swatches outside styled templates:** colour decorations are
  currently document-wide, so colour-shaped text outside styled templates —
  hex strings, URL fragments like `/docs#aabbcc`, issue references in
  comments — can get a swatch. Scoping swatches to styled templates is
  tracked as backlog item 5 in
  [the improvement backlog](./docs/superpowers/specs/2026-07-16-improvement-backlog.md).
- Some IntelliSense quirks live in the bundled
  [`@styled/typescript-styled-plugin`](https://github.com/styled-components/typescript-styled-plugin),
  not this extension, and are not fixable here: `var(` completing as
  `var()()` (upstream #379), `%` appended to decimal completions (#444),
  'identifier expected' after a template followed by a pseudo-element (#440),
  Yarn SDK setups (#426).
- **Emmet expanding HTML in CSS-in-JS** is a VS Code core issue
  ([microsoft/vscode#119736](https://github.com/microsoft/vscode/issues/119736)).

## Features

- Syntax highlighting for styled components in JavaScript and TypeScript.
- Detailed CSS IntelliSense while working in styled strings.
- Syntax error reporting.

## Usage

The styled-components extension adds highlighting and IntelliSense for styled-component template strings in JavaScript and TypeScript. See [plugin configuration](https://github.com/styled-components/typescript-styled-plugin#configuration) for information on configuring the linter and other language features.

## Raising an issue

Please raise issues at
https://github.com/kauricre/vscode-styled-components/issues. Check the list
first; vote with a 👍 — most-voted issues get prioritised.

## Contributing

see [Contributing](./CONTRIBUTING.md)

## Troubleshooting

### There's no syntax highlighting?

Highlighting requires the default import to be named `styled` (custom names
are a planned feature — see Known limitations). Also make sure the file's
language is `typescript(react)` / `javascript(react)`, `vue`, or `svelte`.

### Emmet tab completion isn't working

Be sure to include `"emmet.triggerExpansionOnTab": true` in your VSCode settings to enable tab completion.\*\* More settings and instructions can be found [here](https://code.visualstudio.com/docs/editor/emmet).

### Emmet is auto completing HTML tags instead of CSS

This is an upstream issue in VSCode unfortunately. The root cause is here: https://github.com/microsoft/vscode/issues/119736 which itself was raised from https://github.com/microsoft/vscode/issues/51537. There was an [issue raised](https://github.com/styled-components/vscode-styled-components/issues/191) in this repo but there's nothing that can be done on our end.

### I get "unknown property: X" on a property I know is valid

Property look up comes from the [css language service](https://github.com/microsoft/vscode-css-languageservice) which in turn comes from [MDN Data](https://github.com/mdn/data). If its a custom property, or something that is not in MDN you can add your own property like so: https://github.com/microsoft/typescript-styled-plugin/issues/58#issuecomment-444733368

If however you believe this property is standard and thus missing you can raise this issue with either one of the above projects; please check for any raised issue first.

### Intellisense is not working!

#### It hasn't worked since updating to v1.7.8!

This is due to a clash between TypeScript 5.0.0 and this extension. When VSCode released March 2023 that had TypeScript 5.X set by default which 1.7.8 supports but lower versions don't.
So, if you're not getting intellisense its most likely because you've updated the extension but haven't updated your version of TypeScript yet. The quick option is to downgrade to v1.7.5, the long term option is to migrate to TypeScript 5.X
See: https://github.com/styled-components/vscode-styled-components/issues/387

If it's not the above, See these issues:

- https://github.com/styled-components/vscode-styled-components/issues/357
- https://github.com/styled-components/vscode-styled-components/issues/343
