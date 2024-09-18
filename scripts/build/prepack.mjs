import { cpSync, rmSync } from "fs";

console.log('Deleting tmp...');
try {
    rmSync('app/tmp', {recursive: true});
} catch(e) {}

console.log('Copying public...');
cpSync('public', 'app/public', {recursive: true});