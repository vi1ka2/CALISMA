const express = require("express");
const { chatWithAI } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/chat
router.post("/", protect, chatWithAI);

module.exports = router;
