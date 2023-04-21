import * as vscode from 'vscode';

import * as vsapi from './common/vsapi';
import * as subproc from './common/subproc';
import * as config from './common/config';


class ImportLikeResult {
    names: string[];
    modules: string[];
    paths: string[];

    constructor(names: string[], modules: string[], paths: string[]) {
        this.names = names;
        this.modules = modules;
        this.paths = paths;
    }

    empty() {
        return !this.names.length || !this.modules.length || !this.paths.length;
    }

    imports() {
        let max = Math.min(this.names.length, this.modules.length);
        let result = [];

        for (let i = 0; i < max; i++) {
            result.push(`from ${this.modules[i]} import ${this.names[i]}`);
        }

        return result;
    }
}


async function runImportLike(editor: vscode.TextEditor, command: string): Promise<ImportLikeResult> {
    let types: string[] = config.types(command);
    let fuzzy: boolean = config.fuzzy(command);

    let output = await subproc.runSymdexer(
        'locate',
        vsapi.getSelectedText(editor),
        ...(types ? ['-t', ...types] : []),
        ...(fuzzy ? ['-f'] : [])
    );

    let items = output.split(/\r?\n/).filter(v => v);

    let result: [string[], string[], string[]] = [[], [], []];

    for (let i = 0; i < items.length; i++) {
        result[i % 3].push(items[i]);
    }

    return new ImportLikeResult(...result);
}


export async function runIndex(reset: boolean): Promise<string> {
    let packages = config.packages();

    await vsapi.showBusy(
        'Indexing workspace',
        subproc.runSymdexer('index', ...packages, ...(reset ? ['-r'] : []))
    );

    return 'Done indexing';
}


export async function runImport(editor: vscode.TextEditor): Promise<string> {
    let result = await runImportLike(editor, 'import');

    if (result.empty()) {
        return 'No items found';
    }

    let imports = result.imports();

    let selection = await vscode.window.showQuickPick(imports, { title: 'Results' }) ?? '';
    let name = result.names[imports.indexOf(selection)];

    if (name) {
        await editor.edit(eb => {
            eb.insert(new vscode.Position(0, 0), selection + '\n');
            eb.replace(vsapi.getSelectedRange(editor), name);
        });
    }

    return '';
}


export async function runLocate(editor: vscode.TextEditor): Promise<string> {
    let result = await runImportLike(editor, 'locate');

    if (result.empty()) {
        return 'No items found';
    }

    let selection = await vscode.window.showQuickPick(result.modules, { title: 'Results' }) ?? '';
    let path = result.paths[result.modules.indexOf(selection)];

    if (path) {
        await vscode.window.showTextDocument(
            await vscode.workspace.openTextDocument(
                vscode.Uri.file(path)
            )
        );
    }

    return '';
}
