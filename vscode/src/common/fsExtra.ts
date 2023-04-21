import * as fs from 'fs';


export function exists(path: string): boolean {
    try {
        fs.lstatSync(path);
        return true;
    } catch {
        return false;
    }
}


export function isDirectory(path: string): boolean {
    try {
        return fs.lstatSync(path).isDirectory();
    } catch {
        return false;
    }
}


export function isFile(path: string): boolean {
    try {
        return fs.lstatSync(path).isFile();
    } catch {
        return false;
    }
}
