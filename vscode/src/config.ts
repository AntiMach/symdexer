import * as vscode from 'vscode';
import * as path from 'path';


const folderName = path.basename(__dirname);

export const EXTENSION_ROOT_DIR =
	folderName === 'common' ?
		path.dirname(path.dirname(__dirname)) :
		path.dirname(__dirname);

export const SCRIPT_PATH = path.join(EXTENSION_ROOT_DIR, 'bundled', 'tool', `script.py`);


export function getCacheFile(): string {
	return vscode.workspace.getConfiguration('symdexer').get('cacheFile') ?? 'symdex.db';
}

export function getPackages(): string[] {
	return vscode.workspace.getConfiguration('symdexer').get('packages') ?? [];
}

export function getFuzzy(): boolean {
	return vscode.workspace.getConfiguration('symdexer').get('fuzzy') ?? false;
}

export function getTypes(): string[] {
	return vscode.workspace.getConfiguration('symdexer').get('types') ?? ['defines', 'imports', 'assigns'];
}

export function getVenvDir(): string {
	return vscode.workspace.getConfiguration('symdexer').get('venvDir') ?? '.venv';
}