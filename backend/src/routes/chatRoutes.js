const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const {
  sendMessage,
  getMessages,
} = require('../controllers/chatController');

router.get('/:matchId', auth, getMessages);
router.post('/', auth, sendMessage);

module.exports = router;
