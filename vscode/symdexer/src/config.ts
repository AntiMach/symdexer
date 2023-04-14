import * as vscode from 'vscode';


export function getCacheFile(): string {
	return vscode.workspace.getConfiguration("symdexer")!.get("cacheFile")!;
}

export function getPackages(): string[] {
	return vscode.workspace.getConfiguration("symdexer")!.get("packages")!;
}

export function getFuzzy(): boolean {
	return vscode.workspace.getConfiguration("symdexer")!.get("fuzzy")!;
}

export function getTypes(): string[] {
	return vscode.workspace.getConfiguration("symdexer")!.get("types")!;
}

export function getUseVenv(): boolean {
	return vscode.workspace.getConfiguration("symdexer")!.get("useVenv")!;
}

export function getVenvDir(): string {
	return vscode.workspace.getConfiguration("symdexer")!.get("venvDir")!;
}