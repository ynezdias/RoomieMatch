const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;

// Quick connection check
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('✅ Connection Sucessful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    });
