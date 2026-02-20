import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);

const io = new Server(server, {
  path: "/socketio",
  cors: {
    origin: true,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("chat:join", (chatId) => socket.join(`chat:${chatId}`));
  socket.on("chat:leave", (chatId) => socket.leave(`chat:${chatId}`));
});

app.post("/publish/message", (req, res) => {
  const { chatId, message } = req.body || {};
  if (!chatId || !message) return res.status(400).json({ ok: false });

  io.to(`chat:${chatId}`).emit("message:new", { chatId, ...message });
  res.json({ ok: true });
});

server.listen(process.env.PORT || 3001);
