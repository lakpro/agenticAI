const fs = require("fs");
const axios = require("axios");
const readline = require("readline");
const express = require("express");
const app = express();
const PORT = 3000;
const getGeminiResponse = require("./gemini.js").getGeminiResponse;

let knowledge = JSON.parse(fs.readFileSync("./knowledge.json"));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

async function ask(question) {
  const response = await getGeminiResponse(question);
  console.log("AI: " + response);
}

function startChat() {
  rl.question("You: ", async (input) => {
    if (input.toLowerCase().includes("exit")) {
      rl.close();
      return;
    }

    readline.moveCursor(process.stdout, 0, -1); // Move cursor up
    readline.clearLine(process.stdout, 0); // Clear current line

    await ask(input);
    setTimeout(startChat, 500); // loop
  });
}

// Show intro once
console.log("Hi, I am your AI assistant. Type 'exit' to quit.");
startChat();
