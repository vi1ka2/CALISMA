const axios = require("axios");

const chatWithAI = async (req, res) => {
  try {
    const { userMessage } = req.body;

    // 1. Validate input
    if (!userMessage) {
      return res.status(400).json({ message: "userMessage is required" });
    }

    // 2. Build the prompt for Gemini
    const prompt = `User says: "${userMessage}". Provide a helpful, concise response.`;

    // 3. Call Google Gemini
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY, // stored in .env
        },
      }
    );

    // 4. Extract AI response text
    const aiText = response.data.candidates[0].content.parts[0].text;

    // 5. Send it back to the frontend
    return res.json({ reply: aiText });
  } catch (error) {
    console.error("Error in chatWithAI:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { chatWithAI };
