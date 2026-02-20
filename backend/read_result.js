const fs = require('fs');
try {
    const data = fs.readFileSync('verify_result.txt', 'utf8'); // or 'utf16le' if needed
    console.log('--- FILE CONTENT ---');
    console.log(data);
} catch (e) {
    // If utf8 fails, try binary or ignore
    console.log('Error reading file:', e.message);
}
