const Profile = require('../models/Profile');

exports.createOrUpdateProfile = async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { userId: req.userId },
    { ...req.body, userId: req.userId },
    { upsert: true, new: true }
  );

  res.json(profile);
};

exports.getMyProfile = async (req, res) => {
  const profile = await Profile.findOne({ userId: req.userId });
  res.json(profile);
};
