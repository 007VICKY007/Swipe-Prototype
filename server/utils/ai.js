// aiGenerate.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCdumDm0-6TBJKfMX-YECcddNveR043pwU";

if (!apiKey) {
  throw new Error("GEMINI_API_KEY not found in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function aiGenerate(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text(); 
    return text;
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    throw error;
  }
}

module.exports = { aiGenerate };