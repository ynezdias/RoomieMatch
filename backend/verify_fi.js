const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

const file = 'verification_status.txt';
// Ensure absolute path
const path = require('path');
const absFile = path.resolve(__dirname, file);

console.log('Verifying connection...');

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        try {
            fs.writeFileSync(absFile, 'SUCCESS');
            console.log('SUCCESS');
        } catch (e) { console.error(e); }
        process.exit(0);
    })
    .catch(err => {
        try {
            fs.writeFileSync(absFile, 'FAILURE: ' + err.message);
            console.error('FAILURE');
        } catch (e) { console.error(e); }
        process.exit(1);
    });
