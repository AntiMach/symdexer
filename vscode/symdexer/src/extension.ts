import * as vscode from 'vscode';

import {spawn} from 'child_process';


function runInit() {
	return new Promise<string>((resolve, reject) => {
		const proc = spawn("symdexer", ["init"]);

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

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('symdexer.init', () => {
			runInit().then(v => {
				vscode.window.showInformationMessage(v);
			}, e => {
				vscode.window.showErrorMessage(e);
			});
		}),
		vscode.commands.registerCommand('symdexer.cache', () => {
			vscode.window.showInformationMessage('Hello World from symdexer!');
		}),
		vscode.commands.registerCommand('symdexer.find', () => {
			vscode.window.showInformationMessage('Hello World from symdexer!');
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
