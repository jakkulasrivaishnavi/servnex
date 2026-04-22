const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getConversations, getUnreadCount } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/send', sendMessage);
router.get('/conversations', getConversations);
router.get('/unread', getUnreadCount);
router.get('/:otherUserId', getConversation);

module.exports = router;
