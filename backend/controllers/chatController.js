const Message = require('../models/Message');
const Provider = require('../models/Provider');
const User = require('../models/User');

const getChatRoom = (userId, providerUserId) => {
  return [userId, providerUserId].sort().join('_');
};

// @POST /api/chat/send
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message, bookingRef } = req.body;
    const chatRoom = getChatRoom(req.user.id, receiverId);

    const msg = await Message.create({
      chatRoom,
      sender: req.user.id,
      receiver: receiverId,
      message,
      bookingRef: bookingRef || null,
    });

    await msg.populate('sender', 'name avatar');
    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @GET /api/chat/:otherUserId — Get conversation
exports.getConversation = async (req, res) => {
  try {
    const chatRoom = getChatRoom(req.user.id, req.params.otherUserId);
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ chatRoom })
      .populate('sender', 'name avatar')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      { chatRoom, receiver: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/chat/conversations — All chats
exports.getConversations = async (req, res) => {
  try {
    // Get all unique chat rooms for this user
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$chatRoom', lastMessage: { $first: '$$ROOT' }, unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$isRead', false] }] }, 1, 0] } } } },
    ]);

    // Populate other user info
    const populated = await Promise.all(messages.map(async (conv) => {
      const otherUserId = conv._id.split('_').find(id => id !== req.user.id);
      const otherUser = await User.findById(otherUserId).select('name avatar role');
      return { ...conv, otherUser };
    }));

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/chat/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user.id, isRead: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
