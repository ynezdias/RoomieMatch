router.get('/suggestions', authMiddleware, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } }).limit(20);
  res.json(users);
});
