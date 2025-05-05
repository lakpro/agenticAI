import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Use process.env

export async function getGeminiResponse(userInput) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Correct model name
  const knowledge = JSON.parse(fs.readFileSync("./knowledge.json", "utf-8"));

  const prompt = `
You are a salon chatbot. Answer using only the information below.
If the answer is not found, respond with: "Let me check with someone working at Salon."
If the user has asked to connect with a real person, respond with: "I'll connect you to a human."

Salon Knowledge:
${JSON.stringify(knowledge, null, 2)}

User asked: "${userInput}"
`;

  try {
    const result = await model.generateContent({
      // Use the object format
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });
    const response = await result.response; // Await the response
    return response.text();
  } catch (error) {
    console.error("Error:", error);
    return "An error occurred."; // Handle the error appropriately
  }
}
