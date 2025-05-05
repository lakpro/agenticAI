const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());
const getKnowledgeBaseFormatted =
  require("./gemini.js").getKnowledgeBaseFormatted;

function extractJsonFromCodeBlock(response) {
  const match = response.match(/```json([\s\S]*?)```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (err) {
      console.error("JSON parse error:", err);
    }
  }
  return null;
}

app.post("/help", (req, res) => {
  const { question } = req.body;

  console.log("\nWe have received a new request for support.");
  console.log(`\nQuestion: ${question}`);

  // Create a fresh readline instance per request
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`\nAnswer": `, async (answer) => {
    if (answer.toLowerCase() === "ignore") {
      console.log("\nThe request has been ignored.");
      return res.status(404).send(); // No content, end request
    }

    let result = await getKnowledgeBaseFormatted(answer);
    // console.log("AI (learned):", result);

    let formattedResult = extractJsonFromCodeBlock(result);

    // console.log("Formatted Result:", formattedResult);

    res.json(formattedResult);
    rl.close();
    console.log("\nThank you. The knowledge base has been updated.");
  });
});

console.log("Welcome to the support server. Listening on port 4000.");

app.listen(4000);
