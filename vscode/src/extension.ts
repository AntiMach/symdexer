import * as vscode from 'vscode';
import * as commands from './commands';


function command<T>(name: string, callback: (editor: vscode.TextEditor, ...args: any[]) => Thenable<T>, ...args: any[]) {
    return vscode.commands.registerTextEditorCommand(name, async (editor) => {
        try {
            let result = await callback(editor, ...args);
            if (typeof result === 'string') {
                vscode.window.showInformationMessage(result);
            }
        } catch (e) {
            if (e instanceof Error) {
                vscode.window.showErrorMessage(e.message);
            }
        }
    });
}


export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        command('symdexer.reset', commands.runIndex, true),
        command('symdexer.index', commands.runIndex, false),
        command('symdexer.import', commands.runImport),
        command('symdexer.locate', commands.runLocate)
    );
}

// This method is called when your extension is deactivated
export function deactivate() { }
