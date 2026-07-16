import esbuild from "esbuild";

const production = process.argv[2] === "--production";
const watch = process.argv[2] === "--watch";
const context = await esbuild
  .context({
    entryPoints: ["./src/extension.ts"],
    bundle: true,
    outdir: "dist",
    external: ["vscode"],
    format: "cjs",
    sourcemap: !production,
    minify: production,
    platform: "node",
    // Prefer packages' ESM builds: vscode-css-languageservice's "main" is a
    // UMD/AMD bundle whose internal define([...]) relative requires esbuild
    // can't inline, which breaks activation; its "module" (ESM) bundles cleanly.
    mainFields: ["module", "main"],
    target: "ES2022",
    plugins: [
      {
        name: "watch",
        setup(build) {
          build.onEnd(() => {
            if (watch) console.log("build finished");
          });
          build.onStart(() => {
            if (watch) console.log("building...");
          });
        },
      },
    ],
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

if (watch) {
  await context.watch();
} else {
  await context.rebuild();
  await context.dispose();
}
