import * as vscode from 'vscode';
import * as path from 'path';


export const EXTENSION_ROOT_DIR =
    path.basename(__dirname) === 'common' ?
        path.dirname(path.dirname(__dirname)) :
        path.dirname(__dirname);

export const SCRIPT_PATH = path.join(EXTENSION_ROOT_DIR, 'bundled', 'tool', `script.py`);


export function interpreter(): string[] {
    return vscode.workspace.getConfiguration('symdexer').get('interpreter') ?? [
        'python3',
        'python',
    ];
}


export function venvDir(): string {
    return vscode.workspace.getConfiguration('symdexer').get('venvDir') ?? '.venv';
}


export function useVenv(): boolean {
    return vscode.workspace.getConfiguration('symdexer').get('useVenv') ?? true;
}


export function cacheFile(): string {
    return vscode.workspace.getConfiguration('symdexer').get('cacheFile') ?? 'symdex.db';
}


export function packages(): string[] {
    return vscode.workspace.getConfiguration('symdexer').get('packages') ?? [];
}


export function fuzzy(command: string): boolean {
    return vscode.workspace.getConfiguration(`symdexer.${command}`).get('fuzzy')!;
}


export function types(command: string): string[] {
    return vscode.workspace.getConfiguration(`symdexer.${command}`).get('types')!;
}
