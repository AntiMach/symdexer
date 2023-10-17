import * as fs from 'fs';


export function exists(path: string): boolean {
    try {
        fs.statSync(path);
        return true;
    } catch {
        return false;
    }
}


export function isDirectory(path: string): boolean {
    try {
        return fs.statSync(path).isDirectory();
    } catch {
        return false;
    }
}


export function isFile(path: string): boolean {
    try {
        return fs.statSync(path).isFile();
    } catch {
        return false;
    }
}
