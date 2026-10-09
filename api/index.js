const connectDatabase = require('../backend/src/config/database')
const app = require('../backend/src/app')

module.exports = async (req, res) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res
      .status(503)
      .json({ msg: 'Server configuration incomplete.', code: 'CONFIGURATION_ERROR' })
  }
  try {
    await connectDatabase()
  } catch {
    return res
      .status(503)
      .json({
        msg: 'Database unavailable. Please try again shortly.',
        code: 'DATABASE_UNAVAILABLE',
      })
  }
  return app(req, res)
}
