import { spawn } from 'child_process';

import * as vsapi from './vsapi';
import * as python from './python';
import * as config from './config';
import { EventEmitter } from 'events';


declare interface ProcessEventEmitter {
    on(eventName: 'kill', listener: () => void): void;
    on(eventName: 'line', listener: (line: string) => void): void;
    on(eventName: 'error', listener: (result: string) => void): void;
    on(eventName: 'success', listener: (result: string) => void): void;

    emit(eventName: 'kill'): void;
    emit(eventName: 'line', line: string): void;
    emit(eventName: 'error', result: string): void;
    emit(eventName: 'success', result: string): void;
}


export function run(...args: string[]): ProcessEventEmitter {
    let emitter: ProcessEventEmitter = new EventEmitter();

    let env = { ...process.env };

    if (config.useVenv()) {
        env.VENV_DIR = config.venvDir();
    }

    const proc = spawn(args[0], args.slice(1), {
        cwd: vsapi.getProjectRoot(),
        env: env
    });

    let part = "";
    let stdout = "";
    let stderr = "";

    proc.stdout.on('data', chunk => {
        stdout += chunk;
        part += chunk;

        let lines = part.split(/\r?\n/);
        [part] = lines.splice(lines.length - 1);

        for (let line of lines) {
            if (line) {
                emitter.emit('line', line);
            }
        }
    });

    proc.stderr.on('data', chunk => {
        stderr += chunk;
    });

    proc.on('close', code => {
        if (code === 0) {
            emitter.emit('success', stdout);
        }
        else {
            emitter.emit('error', stderr);
        }
    });

    proc.on('error', (err) => {
        emitter.emit('error', err.message);
    });

    emitter.on('kill', () => {
        proc.kill('SIGINT');
    });

    return emitter;
}


export function symdexer(...args: string[]): ProcessEventEmitter {
    return run(
        python.getInterpreter(),
        config.SCRIPT_PATH,
        '-c', config.cacheFile(),
        ...args
    );
}


export function symdexerAsync(...args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        let emitter = symdexer(...args);

        emitter.on('error', reject);
        emitter.on('success', resolve);
    });
}
