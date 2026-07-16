const path = require('path');
const os = require('os');
const runTests = require('@vscode/test-electron').runTests;


async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to the extension test script
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		const launchArgs = [
			// This disables all extensions except the one being tested
			'--disable-extensions',
			// Keep the IPC socket path short: VS Code's AF_UNIX handle must be
			// under ~103 chars, which the default .vscode-test/user-data path
			// exceeds on CI runners (listen EINVAL).
			`--user-data-dir=${path.join(os.tmpdir(), 'vsc-styled-test')}`
		];

		// Download VS Code, unzip it and run the integration test.
		// Pin the version: the colorization snapshots capture VS Code's built-in
		// TS/JS grammar tokens and default-theme colours, which drift on every
		// VS Code release. Bump this (and regenerate colorize-results/) deliberately.
		await runTests({
			version: '1.129.0',
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs,
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
