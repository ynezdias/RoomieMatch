const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// REGISTER
router.post('/register', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = req.body.password
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ msg: 'Enter a name, valid email, and password of at least 8 characters.' })
  }

  const existing = await User.findOne({ email })
  if (existing) return res.status(400).json({ msg: 'User exists' })

  const hashed = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    email,
    password: hashed,
  })

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ token, user: { id: user._id, _id: user._id, email: user.email, name: user.name, isDemo: user.isDemo } })
})

// LOGIN
router.post('/login', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = req.body.password
  if (!email || typeof password !== 'string' || !password) return res.status(400).json({ msg: 'Email and password are required.' })

  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(400).json({ msg: 'Invalid credentials' })

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ token, user: { id: user._id, _id: user._id, email: user.email, name: user.name, isDemo: user.isDemo } })
})

module.exports = router
