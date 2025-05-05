import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getGeminiResponse(userInput) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const knowledge = JSON.parse(
    fs.readFileSync("./data/knowledge.json", "utf-8")
  );

  const prompt = `
You are a salon chatbot designed to answer user questions based on the provided salon knowledge. Respond in a friendly and helpful tone, using proper English sentences.

Here's the salon's knowledge base, in JSON format:
${JSON.stringify(knowledge, null, 2)}

Your task is to use the information in the knowledge base to answer the user's question.  Pay close attention to the following:

-   Opening Hours: The opening_hours specify the days and times the salon is open.  If a user asks about an appointment on a day not listed or outside the hours, clearly state that the salon is closed.  The days of the week are: Mon, Tue, Wed, Thu, Fri, Sat, Sun.
-   Appointments: The appointments field tells the user how to book an appointment (e.g., Call or book via website).  Include this information when it is relevant to the user's query.
-   Specific Questions: Answer the user's specific question based on the knowledge base.  For example, if the user asks for a price of a service, provide the price.

If the information is not in the knowledge base, respond with: I couldn't find the answer.
If the user asks to connect with a real person, respond with: I'll connect you to a human.

Example Interaction:

User: Can I get a haircut at 10am on Tuesday?
Response: Yes, we are open on Tuesday at 10am. Our opening hours are Mon-Sat, 9 AM - 7 PM.

User: Are you open on Sunday?
Response: We are closed on Sunday. Our opening hours are Mon-Sat, 9 AM - 7 PM. 

User asked: ${userInput}\
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
