const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  aboutMe: { type: String, maxlength: 200 },
  university: { type: String, required: true },
  city: { type: String, required: true },
  photo: String,
}, { timestamps: true })

module.exports = mongoose.model('Profile', ProfileSchema)
