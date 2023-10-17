import * as path from 'path';
import * as vscode from 'vscode';

import * as fs from './fsExtra';
import * as vsapi from './vsapi';
import * as config from './config';


let cachedInterpreter: string | undefined = undefined;


vscode.workspace.onDidChangeConfiguration(config => {
    if (config.affectsConfiguration('symdexer.interpreter')) {
        cachedInterpreter = undefined;
    };
});


function cachePythonInterpreter(): string | undefined {
    let bins: string[] = config.interpreter();

    let envPath = (process.env.PATH ?? '').split(path.delimiter);
    envPath.unshift(vsapi.getProjectRoot());

    let envPathExt = process.env.PATHEXT?.split(path.delimiter) ?? [];
    envPathExt.unshift('');

    for (let dir of envPath) {
        for (let bin of bins) {
            for (let ext of envPathExt) {
                let loc = path.join(dir, `${bin}${ext}`);

                if (fs.isFile(loc)) {
                    return loc;
                }
            }
        }
    }
}


export function getInterpreter(): string {
    if (cachedInterpreter === undefined) {
        cachedInterpreter = cachePythonInterpreter();
    }

    if (cachedInterpreter === undefined || !fs.isFile(cachedInterpreter)) {
        cachedInterpreter = undefined;
        throw new Error('Could not find a valid interpreter');
    }

    return cachedInterpreter;
}
