const Message = require('../models/Message');
const Provider = require('../models/Provider');

const onlineUsers = new Map(); // userId -> socketId

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── User comes online ────────────────────────────────────────────────────
    socket.on('user:online', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit('user:status', { userId, online: true });
      console.log(`👤 User online: ${userId}`);
    });

    // ─── Join a chat room ─────────────────────────────────────────────────────
    socket.on('chat:join', ({ userId, otherUserId }) => {
      const room = [userId, otherUserId].sort().join('_');
      socket.join(room);
      console.log(`💬 Joined room: ${room}`);
    });

    // ─── Send a message ───────────────────────────────────────────────────────
    socket.on('chat:message', async (data) => {
      try {
        const { senderId, receiverId, message, bookingRef } = data;
        const chatRoom = [senderId, receiverId].sort().join('_');

        const msg = await Message.create({
          chatRoom,
          sender: senderId,
          receiver: receiverId,
          message,
          bookingRef: bookingRef || null,
        });

        await msg.populate('sender', 'name avatar');

        // Emit to everyone in the room
        io.to(chatRoom).emit('chat:message', msg);

        // Send notification to receiver if they're online but not in this room
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('chat:notification', {
            from: msg.sender,
            message: message.substring(0, 60),
            chatRoom,
          });
        }
      } catch (err) {
        socket.emit('chat:error', { message: err.message });
      }
    });

    // ─── Typing indicator ─────────────────────────────────────────────────────
    socket.on('chat:typing', ({ senderId, receiverId, isTyping }) => {
      const chatRoom = [senderId, receiverId].sort().join('_');
      socket.to(chatRoom).emit('chat:typing', { senderId, isTyping });
    });

    // ─── Mark messages as read ─────────────────────────────────────────────────
    socket.on('chat:read', async ({ chatRoom, userId }) => {
      await Message.updateMany(
        { chatRoom, receiver: userId, isRead: false },
        { isRead: true }
      );
      io.to(chatRoom).emit('chat:read', { chatRoom, userId });
    });

    // ─── Provider live location update ────────────────────────────────────────
    socket.on('provider:location', async ({ providerId, lat, lng, bookingId }) => {
      try {
        await Provider.findByIdAndUpdate(providerId, {
          liveLocation: { lat, lng, updatedAt: new Date() },
        });

        // Broadcast to anyone tracking this provider (booking room)
        if (bookingId) {
          io.to(`booking_${bookingId}`).emit('provider:location', { providerId, lat, lng });
        }
      } catch (err) {
        console.error('Location update error:', err.message);
      }
    });

    // ─── Join booking tracking room ───────────────────────────────────────────
    socket.on('booking:track', ({ bookingId }) => {
      socket.join(`booking_${bookingId}`);
    });

    // ─── Booking status notification ──────────────────────────────────────────
    socket.on('booking:statusUpdate', ({ userId, bookingId, status }) => {
      const userSocketId = onlineUsers.get(userId);
      if (userSocketId) {
        io.to(userSocketId).emit('booking:statusUpdate', { bookingId, status });
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('user:status', { userId: socket.userId, online: false });
        console.log(`❌ User offline: ${socket.userId}`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
