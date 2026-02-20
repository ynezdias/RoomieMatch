const https = require('https');
const fs = require('fs');

const logFile = 'ip_check_result_v2.txt';
const path = require('path');
const absLogFile = path.resolve(__dirname, logFile);

// 1. Check Public IP
https.get('https://api.ipify.org', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync(absLogFile, 'Public IP: ' + data);
        console.log('Public IP:', data);
    });
}).on('error', (err) => {
    console.error('Error fetching IP:', err.message);
});
