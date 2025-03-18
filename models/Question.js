const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    topic: { type: String, required: true }, // e.g., Data Structures, JavaScript
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    questionText: { type: String, required: true },
    answer: { type: String }, // Optional: Can store model-generated answer
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
