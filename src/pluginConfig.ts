import { ExtensionContext, extensions, workspace } from "vscode";

const PLUGIN_ID = "@styled/typescript-styled-plugin";
const SECTION = "styled-components";

// Forward the extension's settings to the bundled TS server plugin. The
// built-in TypeScript extension exposes configurePlugin(), which reaches the
// plugin's onConfigurationChanged (lib/_plugin.js) at runtime — no tsconfig
// required.
async function pushConfig(): Promise<void> {
  const tsExt = extensions.getExtension("vscode.typescript-language-features");
  if (!tsExt) {
    return;
  }
  await tsExt.activate();
  const api = tsExt.exports?.getAPI?.(0);
  if (!api?.configurePlugin) {
    return;
  }
  const cfg = workspace.getConfiguration(SECTION);
  api.configurePlugin(PLUGIN_ID, {
    validate: cfg.get<boolean>("validate"),
    tags: cfg.get<string[]>("tags"),
    lint: cfg.get<Record<string, unknown>>("lint"),
    emmet: cfg.get<Record<string, unknown>>("emmet"),
  });
}

export function registerPluginConfig(context: ExtensionContext): void {
  void pushConfig();
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(SECTION)) {
        void pushConfig();
      }
    })
  );
}
