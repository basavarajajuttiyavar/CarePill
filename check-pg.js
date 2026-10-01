
const fs = require('fs');
console.log('Reading pgpass...');
const p1 = process.env.APPDATA + '\\pgadmin\\pgpass';
const p2 = process.env.APPDATA + '\\postgresql\\pgpass.conf';

if (fs.existsSync(p1)) { console.log('p1:', fs.readFileSync(p1, 'utf8')); }
if (fs.existsSync(p2)) { console.log('p2:', fs.readFileSync(p2, 'utf8')); }
console.log('Done');
