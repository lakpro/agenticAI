const fs = require("fs");
const axios = require("axios");
const readline = require("readline");
const express = require("express");
const { prototype } = require("stream");
const app = express();
const PORT = 3000;
const getGeminiResponse = require("./gemini.js").getGeminiResponse;
const autoUpdateKnowledge = require("./updateKnowledge.js");

let knowledge = JSON.parse(fs.readFileSync("./knowledge.json"));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

async function ask(question) {
  if (!question) return;

  const response = await getGeminiResponse(question);
  console.log("\nAI: " + response.trim());

  // Ask if the answer is not found and update knowledge
  if (response.toLowerCase().includes("i couldn't find the answer")) {
    // Send to support if not found
    rl.question(
      "\nAI: Would you like me to check with someone at the salon? (y/n) \n\nYou: ",
      async (answer) => {
        if (answer.toLowerCase() === "y") {
          console.log("\nAI: Please wait a moment while I check with someone.");
          try {
            const res = await axios.post("http://localhost:4000/help", {
              question,
            });

            if (res.status !== 200) {
              console.log(
                "\nAI: Sorry, we couldn't find the answer at the moment. Please contact us via phone or email."
              );
            }

            const answer = res.data;

            // Update knowledge base with the new answer
            autoUpdateKnowledge(answer);

            // Ask again with the new knowledge
            await ask(question);
          } catch (error) {
            console.log(
              "\nAI: Sorry, we couldn't find the answer at the moment. Please contact us via phone or email."
            );
          }
        } else {
          console.log(
            "\nAI: Okay, let me know if you have any other questions."
          );
        }
        startChat(); // Restart the chat loop
      }
    );
  }

  if (response.toLowerCase().includes("i'll connect you to a human")) {
    console.log("AI: " + response);
  }
}

function startChat() {
  rl.question("\nYou: ", async (input) => {
    if (input.toLowerCase().includes("exit")) {
      rl.close();
      return;
    }

    // readline.moveCursor(process.stdout, 0, -1); // Move cursor up
    // readline.clearLine(process.stdout, 0); // Clear current line

    await ask(input);
    startChat();
  });
}

// Show intro once
console.log("Hi, I am your AI assistant. Type 'exit' to quit.");
startChat();

app.listen(PORT);
