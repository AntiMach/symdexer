import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

import * as vscode from 'vscode';
import * as config from './config';


function getEnvironment(cwd: string): NodeJS.ProcessEnv {
	if (!config.getUseVenv()) {
		return process.env;
	}

	let venv = config.getVenvDir();
	let sep;

	if (process.platform === 'win32') {
		venv = path.resolve(cwd, venv, 'Scripts');
		sep = ';';
	} else {
		venv = path.resolve(cwd, venv, 'bin');
		sep = ':';
	}

	if (!fs.existsSync(venv)) {
		return process.env;
	}

	return {
		...process.env,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		PATH: `${venv}${sep}${process.env.PATH}`
	};
}


export function runCommand(cwd: string, ...args: string[]) {
	return new Promise<string>((resolve, reject) => {
		const proc = spawn(args[0], args.slice(1), {
			cwd: cwd,
			env: getEnvironment(cwd)
		});

		let result = "";
		let error = "";

		proc.stdout.on('data', chunk => {
			result += chunk;
		});

		proc.stderr.on('data', chunk => {
			error += chunk;
		});

		proc.on('close', code => {
			if (code === 0) {
				resolve(result);
			}
			else {
				reject(error);
			}
		});

		proc.on('error', (err) => {
			reject(err.message);
		});
	});
}


export async function runSymdexer(...args: string[]) {
	let cwd = await pickWorkspace();
	let conf = config.getCacheFile();

	return await runCommand(cwd, 'symdexer', '-c', conf, ...args);
}


export function showBusy<T>(title: string, promise: Promise<T>) {
	return new Promise<T>((resolve, reject) => {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			cancellable: false,
			title: title,
		}, async (prog) => {
			prog.report({increment: 0});

			let result: any, cb;

			try {
				result = await promise;
				cb = resolve;
			}
			catch (err) {
				result = err;
				cb = reject;
			}

			prog.report({increment: 100});

			cb(result);
		});
	});
}


export async function pickWorkspace(): Promise<string> {
	if (vscode.workspace.workspaceFolders?.length === 1) {
		return vscode.workspace.workspaceFolders[0].uri.fsPath;
	}

	let f = await vscode.window.showWorkspaceFolderPick();
	return f!.uri.fsPath;
}


export function getSelectedText(editor: vscode.TextEditor): string {
	let range = new vscode.Range(editor.selection.start, editor.selection.end);

	if (range.isEmpty) {
		range = editor.document.getWordRangeAtPosition(editor.selection.active)!;
	}

	return editor.document.getText(range);
}
