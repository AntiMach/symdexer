import * as vscode from 'vscode';
import * as path from 'path';
import { spawn } from 'child_process';


function runCommand(cwd: string, ...args: string[]) {
	return new Promise<string>((resolve, reject) => {
		const proc = spawn(args[0], args.slice(1), {
			cwd: cwd
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


function showBusy<T>(title: string, promise: Promise<T>) {
	return new Promise<T>((resolve, reject) => {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
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


async function getWorkspace(): Promise<string> {
	if (vscode.workspace.workspaceFolders?.length === 1) {
		return vscode.workspace.workspaceFolders[0].uri.fsPath;
	}

	let f = await vscode.window.showWorkspaceFolderPick();
	return f!.uri.fsPath;
}


function getConfigFile(): string {
	return vscode.workspace.getConfiguration("symdexer")!.get("configFile")!;
}

async function runInit(): Promise<string> {
	let cwd = await getWorkspace();
	let conf = getConfigFile();

	let result = await runCommand(cwd, 'symdexer', '-s', conf, 'init');
	
	vscode.window.showTextDocument(
		await vscode.workspace.openTextDocument(
			path.join(cwd, conf)
		)
	);

	return result;
}

async function runCache(): Promise<string> {
	let cwd = await getWorkspace();
	let conf = getConfigFile();
	
	return await showBusy(
		'Indexing workspace',
		runCommand(cwd, 'symdexer', '-s', conf, 'reset-cache')
	);
}

async function runFind(editor: vscode.TextEditor): Promise<string> {
	let cwd = await getWorkspace();
	let conf = getConfigFile();

	let pos = editor.selection.anchor;
	let range = editor.document.getWordRangeAtPosition(pos)!;
	let word = editor.document.getText(range);

	let result = await runCommand(cwd, 'symdexer', '-s', conf, 'find', word);
	let items = result.split("\n").filter(v => v !== "");

	if (items.length === 0) {
		return 'no items found';
	}

	let selection = await vscode.window.showQuickPick(items, {
		title: 'Results'
	}) ?? '';

	if (selection === '') {
		return '';
	}

	await editor.edit(eb => {
		eb.insert(new vscode.Position(0, 0), selection + '\n');
	});

	return '';
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('symdexer.init', () => {
			runInit().then(
				vscode.window.showInformationMessage,
				vscode.window.showErrorMessage,
			);
		}),
		vscode.commands.registerCommand('symdexer.cache', () => {
			runCache().then(
				vscode.window.showInformationMessage,
				vscode.window.showErrorMessage
			);
		}),
		vscode.commands.registerTextEditorCommand('symdexer.find', (editor, edit) => {
			runFind(editor).then(
				vscode.window.showInformationMessage,
				vscode.window.showErrorMessage
			);
		}),
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
