import * as path from 'path';
import { spawn } from 'child_process';

import * as fs from './fsExtra';
import * as vsapi from './vsapi';
import * as config from './config';


export function run(cwd: string, ...args: string[]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let env = { ...process.env };

        if (config.useVenv()) {
            env.VENV_DIR = config.venvDir();
        }

        const proc = spawn(args[0], args.slice(1), {
            cwd: cwd,
            env: env
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


export function runSymdexer(...args: string[]): Promise<string> {
    let cwd = vsapi.getProjectRoot();
    let conf = config.cacheFile();

    return run(cwd, findPythonInterpreter(), config.SCRIPT_PATH, '-c', conf, ...args);
}


export function findPythonInterpreter(): string {
    let bins = config.interpreter();

    let PATH = (process.env.PATH ?? '').split(path.delimiter);
    PATH.unshift(vsapi.getProjectRoot());

    let PATHEXT = process.env.PATHEXT?.split(path.delimiter) ?? [];
    PATHEXT.unshift('');

    for (let dir of PATH) {
        if (!fs.isDirectory(dir)) {
            continue;
        }

        for (let bin of bins) {
            for (let ext of PATHEXT) {
                let loc = path.join(dir, `${bin}${ext}`);

                if (fs.isFile(loc)) {
                    return loc;
                }
            }
        }
    }

    throw new Error('Could not find a valid interpreter');
}
