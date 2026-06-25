module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);

    socket.on('joinEventRoom', (eventId) => {
      socket.join(`event_${eventId}`);
      console.log(`Socket ${socket.id} joined room event_${eventId}`);
    });

    socket.on('leaveEventRoom', (eventId) => {
      socket.leave(`event_${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });
};