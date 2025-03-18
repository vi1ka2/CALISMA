const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ThreadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  messages: [MessageSchema], // Array of messages (the first message can be the thread description)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Thread', ThreadSchema);
