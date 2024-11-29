const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Chat = require("./models/Chat");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/user");
const matchRoutes = require("./routes/match");
const chatRoutes = require("./routes/chat");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chats", chatRoutes);

// Create an HTTP server and set up Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for sendMessage event
  socket.on("sendMessage", async (msg) => {
    const { chatid, sender, message } = msg;

    // Save the message to the database
    let chat = await Chat.findOne({ chatid });
    if (!chat) {
      chat = new Chat({ chatid, chats: [{ sender, message }] });
    } else {
      chat.chats.push({ sender, message });
    }
    await chat.save();

    // Broadcast the message to other users in the chat
    io.emit("receiveMessage", { sender: { _id: sender, username: msg.senderUsername }, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
