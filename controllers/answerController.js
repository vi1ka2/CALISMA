const Answer = require("../models/Answer");
const Question = require("../models/Question");
const axios = require("axios");

// POST /api/answers/analyze
// Analyzes the user's answer with AI, saves the answer & feedback in the database.
const analyzeAnswer = async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;
    const userId = req.user.id; // Extract user ID from JWT

    if (!questionId || !userAnswer) {
      return res.status(400).json({ message: "Question ID and user answer are required" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Prompt for AI model
    const prompt = `Evaluate the following answer on a scale of 0-10 and provide constructive feedback.

    **Question:** ${question.questionText}
    **User's Answer:** ${userAnswer}

    Provide feedback in this format:
    Score: [0-10]
    Feedback: [Detailed explanation of strengths and improvements]
    `;

    // Call Google Gemini (replace with your AI endpoint)
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;

    // Extract Score and Feedback
    const scoreMatch = aiResponse.match(/Score: (\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    const feedbackMatch = aiResponse.match(/Feedback: (.+)/s);
    let feedback = "No feedback provided.";
    if (feedbackMatch) {
      feedback = feedbackMatch[1].trim();
    } else {
      // Maybe look for other patterns or return a default message
      const altMatch = aiResponse.match(/Observations: (.+)/s);
      if (altMatch) {
        feedback = altMatch[1].trim();
      }
    }
    

    // Save in the database
    const newAnswer = new Answer({ userId, questionId, userAnswer, feedback, score });
    await newAnswer.save();

    return res.status(201).json(newAnswer);
  } catch (error) {
    console.error("Error analyzing answer:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/answers/user
// Fetches all answers for the logged-in user, including question text.
const getUserAnswers = async (req, res) => {
  try {
    // userId comes from JWT (authMiddleware)
    const userId = req.user.id;

    // Find all answers by this user, populate question text, sort by most recent
    const answers = await Answer.find({ userId })
      .populate("questionId", "questionText")
      .sort({ createdAt: -1 });

    return res.status(200).json(answers);
  } catch (error) {
    console.error("Error fetching user answers:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { analyzeAnswer, getUserAnswers };

