const Question = require("../models/Question");
const axios = require("axios");

const generateQuestion = async (req, res) => {
    try {
        const { topic, difficulty } = req.body;

        if (!topic || !difficulty) {
            return res.status(400).json({ message: "Topic and difficulty are required" });
        }

        const prompt = `Generate a ${difficulty} level interview question for the topic "${topic}".`;

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

        const questionText = response.data.candidates[0].content.parts[0].text;

        const newQuestion = new Question({ topic, difficulty, questionText });
        await newQuestion.save();

        res.status(201).json(newQuestion);
    } catch (error) {
        console.error("Error generating question:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { generateQuestion };
