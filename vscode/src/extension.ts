import * as vscode from 'vscode';
import * as commands from './commands';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('symdexer.reset', () => {
			commands.runIndex(true).then(
				vscode.window.showInformationMessage,
				vscode.window.showErrorMessage
			);
		}),
		vscode.commands.registerCommand('symdexer.index', () => {
			commands.runIndex(false).then(
				vscode.window.showInformationMessage,
				vscode.window.showErrorMessage
			);
		}),
		vscode.commands.registerTextEditorCommand('symdexer.find', editor => {
			commands.runFind(editor).then(
				vscode.window.showInformationMessage,
				vscode.window.showErrorMessage
			);
		}),
		vscode.commands.registerTextEditorCommand('symdexer.locate', editor => {
			commands.runLocate(editor).then(
				vscode.window.showInformationMessage,
				vscode.window.showErrorMessage
			);
		}),
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
