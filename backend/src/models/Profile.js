const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  aboutMe: String,
  university: String,
  city: String,

  photo: String, // ✅ ADD THIS

  location: {
    lat: Number,
    lng: Number,
  },

  budget: {
    min: Number,
    max: Number,
  },

  lifestyle: {
    smoking: Boolean,
    pets: Boolean,
    sleepSchedule: String,
  },

  utilitiesIncluded: Boolean,
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
