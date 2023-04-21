import * as fs from './fsExtra';
import * as vscode from 'vscode';


export function showBusy<T>(title: string, promise: Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            cancellable: false,
            title: title,
        }, async (prog) => {
            prog.report({ increment: 0 });

            try {
                resolve(await promise);
            }
            catch (err) {
                reject(err);
            }

            prog.report({ increment: 100 });
        });
    });
}


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
        range = editor.document.getWordRangeAtPosition(editor.selection.active)!;
    }

    return range;
}


export function getSelectedText(editor: vscode.TextEditor): string {
    return editor.document.getText(getSelectedRange(editor));
}
