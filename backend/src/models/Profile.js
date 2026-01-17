// const mongoose = require('mongoose')

// const ProfileSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       unique: true, // 🔥 one profile per user
//     },

//     aboutMe: {
//       type: String,
//       maxlength: 200,
//     },

//     university: {
//       type: String,
//       required: true,
//     },

//     city: {
//       type: String,
//       required: true,
//     },

//     photo: {
//       type: String,
//     },

//     location: {
//       lat: Number,
//       lng: Number,
//     },

//     budget: {
//       min: Number,
//       max: Number,
//     },

//     lifestyle: {
//       smoking: Boolean,
//       pets: Boolean,
//       sleepSchedule: String,
//     },

//     utilitiesIncluded: Boolean,
//   },
//   { timestamps: true }
// )

// module.exports = mongoose.model('Profile', ProfileSchema)
const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  aboutMe: String,
  university: String,
  city: String,
  photo: String,
})

module.exports = mongoose.model('Profile', ProfileSchema)
