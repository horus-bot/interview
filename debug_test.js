const fs = require('fs');
try {
    const t = require('typescript');
    fs.writeFileSync('debug.txt', 'TS is present. Version: ' + t.version);
} catch (e) {
    fs.writeFileSync('debug.txt', 'Error: ' + e.message + '\n' + e.stack);
}
