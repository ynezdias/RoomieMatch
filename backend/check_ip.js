const https = require('https');
const dns = require('dns');
const fs = require('fs');

const logFile = 'ip_check_result.txt';
// Use absolute path to be safe if cwd is weird
const path = require('path');
const absLogFile = path.resolve(__dirname, logFile);

const log = (msg) => {
    try {
        fs.appendFileSync(absLogFile, msg + '\n');
    } catch (e) {
        // ignore
    }
    console.log(msg);
};

// Clear file
fs.writeFileSync(absLogFile, '--- DIAGNOSTIC START ---\n');

// 1. Check Public IP
https.get('https://api.ipify.org', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        log('Public IP: ' + data);
    });
}).on('error', (err) => {
    log('Error fetching IP: ' + err.message);
});

// 2. Resolve DNS for Cluster
const clusterDomain = 'roomiecluster.xyogaft.mongodb.net';
// Use resolveSrv for SRV records
dns.resolveSrv(clusterDomain, (err, addresses) => {
    if (err) {
        log('DNS Resolution Error (SRV): ' + err.message);
        // Fallback to lookup
        dns.lookup(clusterDomain, (err, address, family) => {
            if (err) log('DNS Lookup Error: ' + err.message);
            else log('Cluster Domain resolves (lookup) to: ' + address);
        });
    } else {
        log('SRV Records found: ' + JSON.stringify(addresses));
    }
});
