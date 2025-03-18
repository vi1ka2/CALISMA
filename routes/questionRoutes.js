const express = require("express");
const { generateQuestion } = require("../controllers/questionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", protect, generateQuestion);

module.exports = router;
