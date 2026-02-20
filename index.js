import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://collectify-corp.vercel.app/"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("chat:join", (chatId) => {
    socket.join(`chat:${chatId}`);
  });

  socket.on("chat:leave", (chatId) => {
    socket.leave(`chat:${chatId}`);
  });
});

app.use(express.json());

app.post("/publish/message", (req, res) => {
  const { chatId, message } = req.body;

  io.to(`chat:${chatId}`).emit("message:new", {
    chatId,
    ...message,
  });

  res.json({ ok: true });
});

server.listen(process.env.PORT || 3001);
