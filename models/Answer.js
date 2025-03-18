const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    userAnswer: { type: String, required: true },
    feedback: { type: String }, // AI-generated feedback
    score: { type: Number }, // AI-generated score (0-10)
    createdAt: { type: Date, default: Date.now }
});

const Answer = mongoose.model("Answer", answerSchema);
module.exports = Answer;
