import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getKnowledgeBaseFormatted(userInput) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Given this current knowledge base:
{
    "question": "answer",
    "services": [
        {"name":"service name",
        "price":"service price",}],
}

Convert this instruction to JSON string: "${userInput}"

If it is service, the follow service format, else normal key value format.
Do not include the sample knowledge base in the response.
Make sure that the final output is a valid stringified JSON.
`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error:", error);
    return "An error occurred.";
  }
}
