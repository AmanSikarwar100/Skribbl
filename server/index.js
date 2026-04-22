const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { nanoid } = require("nanoid");

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

const Rooms = require('./Rooms');

// API endpoint for public rooms
const MessageHandler = require('./MessageHandler');
const messageHandler = new MessageHandler(io, Rooms);

app.get('/api/rooms', (req, res) => {
  const publicRooms = [];
  for (const room of Rooms.values()) {
    if (!room.settings.isPrivate && room.game.phase === 'lobby' && !room.isFull()) {
      publicRooms.push(room.toPublicJSON());
    }
  }
  res.json({ rooms: publicRooms });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create_room", (data, callback) => messageHandler.handleCreateRoom(socket, data, callback));
  socket.on("join_room", (data, callback) => messageHandler.handleJoinRoom(socket, data, callback));
  socket.on("start_game", () => messageHandler.handleStartGame(socket));
  socket.on("leave_room", () => messageHandler.handleLeaveRoom(socket));
  socket.on("word_selected", (data) => messageHandler.handleWordChosen(socket, data));
  socket.on("draw_start", (data) => messageHandler.handleDrawStart(socket, data));
  socket.on("draw_move", (data) => messageHandler.handleDrawMove(socket, data));
  socket.on("draw_end", (data) => messageHandler.handleDrawEnd(socket, data));
  socket.on("canvas_clear", () => messageHandler.handleCanvasClear(socket));
  socket.on("draw_undo", () => messageHandler.handleDrawUndo(socket));
  socket.on("send_message", (data, callback) => messageHandler.handleGuess(socket, data, callback));
  socket.on("chat", (data) => messageHandler.handleChat(socket, data));

  socket.on("disconnect", () => messageHandler.handleDisconnect(socket));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
