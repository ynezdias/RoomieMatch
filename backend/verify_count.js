require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./src/models/User')

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        const count = await User.countDocuments()
        console.log(`Total users in DB: ${count}`)
        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}
verify()
