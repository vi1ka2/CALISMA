const express = require("express");
const { analyzeAnswer, getUserAnswers } = require("../controllers/answerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/answers/analyze (for submitting and analyzing answers)
router.post("/analyze", protect, analyzeAnswer);

// GET /api/answers/user (for retrieving all answers of the logged-in user)
router.get("/user", protect, getUserAnswers);

module.exports = router;



