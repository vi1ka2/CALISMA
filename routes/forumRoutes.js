const express = require('express');
const Thread = require('../models/Thread');
const router = express.Router();

// GET /api/forum/threads - List all threads
router.get('/threads', async (req, res) => {
  try {
    const threads = await Thread.find().sort({ createdAt: -1 });
    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/forum/threads/:id - Get details of a single thread (including messages)
router.get('/threads/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    res.json(thread);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/forum/threads - Create a new thread
router.post('/threads', async (req, res) => {
  const { title, message, author } = req.body;
  try {
    const newThread = new Thread({
      title,
      author,
      messages: [{ text: message, author }] // Using the initial message as the thread content
    });
    await newThread.save();
    res.status(201).json(newThread);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/forum/threads/:id/replies - Post a reply to a thread
router.post('/threads/:id/replies', async (req, res) => {
  const { text, author } = req.body;
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    const reply = { text, author };
    thread.messages.push(reply);
    await thread.save();
    // Return the reply (or the updated thread, if you prefer)
    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
