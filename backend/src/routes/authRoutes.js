const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

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
    process.env.JWT_SECRET
  )

  res.json({ token, user: { id: user._id, email } })
})

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(400).json({ msg: 'Invalid credentials' })

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET
  )

  res.json({ token, user: { id: user._id, email } })
})

module.exports = router
