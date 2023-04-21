import * as fs from './fsExtra';
import * as vscode from 'vscode';


export function getProjectRoot(): string {
    const workspaces = vscode.workspace.workspaceFolders ?? [];
    if (workspaces.length === 0) {
        return process.cwd();
    }

    if (workspaces.length === 1) {
        return workspaces[0].uri.fsPath;
    }

    let rootWorkspace = workspaces[0];
    let root = undefined;

    for (const w of workspaces) {
        if (fs.exists(w.uri.fsPath)) {
            root = w.uri.fsPath;
            rootWorkspace = w;
            break;
        }
    }

    for (const w of workspaces) {
        if (root && root.length > w.uri.fsPath.length && (fs.exists(w.uri.fsPath))) {
            root = w.uri.fsPath;
            rootWorkspace = w;
        }
    }
    return rootWorkspace.uri.fsPath;
}


export function getSelectedRange(editor: vscode.TextEditor): vscode.Range {
    let range = new vscode.Range(editor.selection.start, editor.selection.end);

    if (range.isEmpty) {
        range = editor.document.getWordRangeAtPosition(editor.selection.active) ?? range;
    }

    return range;
}


export async function getSelectedText(editor: vscode.TextEditor): Promise<string | undefined> {
    let range = getSelectedRange(editor);

    if (range.isEmpty) {
        return await vscode.window.showInputBox({ placeHolder: 'Text' });
    }

    return editor.document.getText(range);
}
