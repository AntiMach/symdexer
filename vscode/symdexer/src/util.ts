import * as fs from 'fs';
import { spawn } from 'child_process';

import * as vscode from 'vscode';
import * as config from './config';

export function runCommand(cwd: string, ...args: string[]) {
    return new Promise<string>((resolve, reject) => {
        const proc = spawn(args[0], args.slice(1), {
            cwd: cwd,
            env: {
                ...process.env,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                VENV_DIR: config.getVenvDir()
            }
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
    let cwd = await getProjectRoot();
    let conf = config.getCacheFile();

    return await runCommand(cwd, 'python', config.SCRIPT_PATH, '-c', conf, ...args);
}

export function showBusy<T>(title: string, promise: Promise<T>) {
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

async function pathExists(path: string): Promise<boolean> {
    return new Promise(resolve => {
        fs.access(path, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}

export async function getProjectRoot(): Promise<string> {
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
        if (await pathExists(w.uri.fsPath)) {
            root = w.uri.fsPath;
            rootWorkspace = w;
            break;
        }
    }

    for (const w of workspaces) {
        if (root && root.length > w.uri.fsPath.length && (await pathExists(w.uri.fsPath))) {
            root = w.uri.fsPath;
            rootWorkspace = w;
        }
    }
    return rootWorkspace.uri.fsPath;
}

export function getSelectedText(editor: vscode.TextEditor): string {
    let range = new vscode.Range(editor.selection.start, editor.selection.end);

    if (range.isEmpty) {
        range = editor.document.getWordRangeAtPosition(editor.selection.active)!;
    }

    return editor.document.getText(range);
}
