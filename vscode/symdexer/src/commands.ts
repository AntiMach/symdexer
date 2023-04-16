import * as vscode from 'vscode';
import * as config from './config';
import * as util from './util';

export async function runIndex(reset: boolean): Promise<string> {
    let packages = config.getPackages();

    return await util.showBusy(
        'Indexing workspace',
        util.runSymdexer('index', ...(reset ? ['-r'] : []), ...packages)
    );
}

export async function runFind(editor: vscode.TextEditor): Promise<string> {
    let fuzzy = config.getFuzzy();
    let types = config.getTypes();
    let word = util.getSelectedText(editor);

    let result = await util.runSymdexer('find', ...(fuzzy ? ['-f'] : []), word, ...(types ? ['-t', ...types] : []));
    let items = result.split("\n").filter(v => v !== "");

    if (items.length === 0) {
        return 'No items found';
    }

    let selection = await vscode.window.showQuickPick(items, {
        title: 'Results'
    }) ?? '';

    if (selection === '') {
        return '';
    }

    await editor.edit(eb => {
        eb.insert(new vscode.Position(0, 0), selection + '\n');
    });

    return '';
}

export async function runLocate(editor: vscode.TextEditor): Promise<string> {
    let fuzzy = config.getFuzzy();
    let types = config.getTypes();
    let word = util.getSelectedText(editor);

    let result = await util.runSymdexer('locate', ...(fuzzy ? ['-f'] : []), word, ...(types ? ['-t', ...types] : []));
    let items = result.split(/\r\n|\n/).filter(v => v !== "");

    if (items.length === 0) {
        return 'No references found';
    }

    let modules = items.filter((_, i) => i % 3 === 1);
    let paths = items.filter((_, i) => i % 3 === 2);

    let selection = await vscode.window.showQuickPick(modules, {
        title: 'Results'
    }) ?? '';

    if (selection === '') {
        return '';
    }


    let path = vscode.Uri.file(paths[modules.indexOf(selection)]);

    await vscode.window.showTextDocument(
        await vscode.workspace.openTextDocument(path)
    );

    return '';
}
