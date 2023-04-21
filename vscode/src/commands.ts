import * as vscode from 'vscode';

import * as vsapi from './common/vsapi';
import * as config from './common/config';
import * as subproc from './common/subproc';


interface Symbol {
    symbol?: string;
    module?: string;
    path?: string;
}

type QuickPickSymbol = vscode.QuickPickItem & Symbol;


export async function runIndex(_: vscode.TextEditor, reset: boolean): Promise<string> {
    let packages = config.packages();
    let symdexer = subproc.symdexer('index', ...packages, ...(reset ? ['-r'] : []));

    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        cancellable: false,
        title: 'Indexing workspace',
    }, async (prog, token) => {
        return new Promise((resolve, reject) => {
            symdexer.on('success', () => {
                resolve('Done indexing');
            });

            symdexer.on('error', err => {
                reject(new Error(err));
            });

            token.onCancellationRequested(() => {
                symdexer.emit('kill');
                resolve('Cancelled indexing');
            });
        });
    });
}


async function runImportLike(editor: vscode.TextEditor, command: string): Promise<QuickPickSymbol> {
    let word = await vsapi.getSelectedText(editor);

    if (word === undefined) {
        // eslint-disable-next-line no-throw-literal
        throw new Error();
    }

    let types: string[] = config.types(command);
    let fuzzy: boolean = config.fuzzy(command);

    let output = await subproc.symdexerAsync(
        'locate',
        word,
        ...(types ? ['-t', ...types] : []),
        ...(fuzzy ? ['-f'] : [])
    );

    let lines = output.split(/\r?\n/).filter(v => v);

    if (lines.length === 0) {
        // eslint-disable-next-line no-throw-literal
        throw new Error('Not found');
    }

    let items: QuickPickSymbol[] = [];

    for (let i = 0; i < lines.length; i += 3) {
        let [symbol, module, path] = lines.slice(i, i + 3);

        items.push({
            label: `import ${symbol}`,
            detail: `from ${module}`,
            symbol, module, path
        });
    }

    let selection = await vscode.window.showQuickPick(items, { title: 'Select symbol' });

    if (selection === undefined) {
        // eslint-disable-next-line no-throw-literal
        throw new Error();
    }

    return selection;
}


export async function runImport(editor: vscode.TextEditor): Promise<void> {
    let { module, symbol } = await runImportLike(editor, 'import');

    await editor.edit(eb => {
        eb.insert(new vscode.Position(0, 0), `from ${module} import ${symbol}\n`);
        eb.replace(vsapi.getSelectedRange(editor), symbol!);
    });
}


export async function runLocate(editor: vscode.TextEditor): Promise<void> {
    let { path } = await runImportLike(editor, 'locate');

    await vscode.window.showTextDocument(
        await vscode.workspace.openTextDocument(
            vscode.Uri.file(path!)
        )
    );
}
