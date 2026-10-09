const mongoose = require('mongoose')
mongoose.set('bufferCommands', false)
let pending
async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection
  if (!pending) {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required')
    if (process.env.DNS_SERVERS)
      require('node:dns').setServers(
        process.env.DNS_SERVERS.split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      )
    pending = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .finally(() => {
        pending = undefined
      })
  }
  await pending
  return mongoose.connection
}
module.exports = connectDatabase
