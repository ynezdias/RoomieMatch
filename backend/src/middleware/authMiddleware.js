const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = {
      id: decoded.id,
    }

    console.log('✅ AUTH USER SET:', req.user)

    next()
  } catch (err) {
    console.error('❌ JWT ERROR:', err.message)
    res.status(401).json({ message: 'Invalid token' })
  }
}
