const fs = require('fs');
const p = process.argv[2];
if (!p) { console.error('Usage: node convert-to-utf8.js <file>'); process.exit(1); }
try {
    const latin = fs.readFileSync(p, 'latin1');
    fs.writeFileSync(p, latin, 'utf8');
    console.log('Converted to UTF-8:', p);
} catch (e) {
    console.error('Error converting', p, e);
    process.exit(1);
}
