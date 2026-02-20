const fs = require('fs');
try {
    const data = fs.readFileSync('verify_final_result.txt', 'utf8');
    console.log('--- FILE CONTENT ---');
    console.log(data);
} catch (e) {
    console.log('Error reading file:', e.message);
}
