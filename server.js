const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answerRoutes");
const chatRoutes = require("./routes/chatRoutes");
const forumRoutes = require('./routes/forumRoutes');
const http = require('http');
const socketIo = require('socket.io');
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    // Broadcast the message to all clients
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
app.use('/api/forum', forumRoutes);

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/chat", chatRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
