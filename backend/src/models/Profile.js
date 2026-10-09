const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    aboutMe: { type: String, maxlength: 1000 },
    university: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    country: String,
    lookingFor: { type: String, enum: ['roommate', 'room'], default: 'roommate' },
    isDemo: { type: Boolean, default: false },
    seedBatch: String,
    budget: { type: Number, min: 0, max: 5000, default: 1000 },
    smoking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    furniture: { type: Boolean, default: false },
    photo: String,
  },
  { timestamps: true }
)

module.exports = mongoose.model('Profile', ProfileSchema)
