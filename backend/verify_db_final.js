const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;

console.log('Testing connection with 0.0.0.0/0 whitelist...');

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('✅ Connection Sucessful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    });
