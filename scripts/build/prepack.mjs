import { cpSync } from "fs";

console.log('Copying public...');
cpSync('public', 'app/public', {recursive: true});