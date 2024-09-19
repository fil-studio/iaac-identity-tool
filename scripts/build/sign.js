const { config } = require('dotenv');
const { execSync } = require('node:child_process');

config();

const id = process.env.APPLE_TEAM_ID;
const app = 'iaac';

console.log('Signing MacOs Apps with Developer ID:', id, '...');

if(process.argv[2] && process.argv[2].indexOf('intel') > -1) {
    console.log('Processing intel version...')
    execSync(`codesign --force --deep --sign "${id}" packaged/${app}-darwin-x64/${app}.app`);
} else {
    console.log('Processing apple silicon version...')
    execSync(`codesign --force --deep --sign "${id}" packaged/${app}-darwin-arm64/${app}.app`);
}