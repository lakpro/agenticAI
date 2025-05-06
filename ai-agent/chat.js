const readline = require("readline");
const prompt = require("prompt-sync")({ sigint: true });
const { getGeminiResponse } = require("./gemini");
const axios = require("axios");
const { checkAndUpdateMessages } = require("./utils/messageUtils.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

global.currentUser = null;

function inputVal(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function ask(question) {
  if (!question) return;

  const response = await getGeminiResponse(question);
  console.log("\nAI: " + response.trim());

  const lowerResp = response.toLowerCase();

  if (lowerResp.includes("i couldn't find the answer")) {
    const answer = await inputVal(
      "\nAI: Would you like me to check with someone at the salon? (y/n): "
    );

    if (answer.toLowerCase() === "y") {
      console.log("\nAI: Please wait a moment while I check with someone.");

      try {
        const res = await axios.post("http://localhost:4000/request", {
          userId: currentUser.id,
          userName: currentUser.username,
          question,
          timestamp: new Date().toISOString(),
        });

        if (res.status !== 200) {
          console.log(
            "\nAI: Sorry, we couldn't find the answer at the moment. Please contact us via phone or email."
          );
        } else {
          console.log(
            "\nAI: I've sent your question to the support team. They will get back to you shortly."
          );
        }
      } catch (error) {
        console.log(
          "\nAI: Sorry, we couldn't find the answer at the moment. Please contact us via phone or email."
        );
      }
    } else {
      console.log("\nAI: Okay, let me know if you have any other questions.");
    }

    startChat(); // restart chat loop
    return;
  }

  if (lowerResp.includes("i'll connect you to a human")) {
    console.log("AI: " + response);
  }
}

function startChat() {
  rl.question("\nYou: ", async (input) => {
    if (input.toLowerCase() === "exit") {
      currentUser = null;
      return main();
    }
    await ask(input);
    startChat();
  });
}

async function main() {
  console.log("\n📲 1. Login\n📝 2. Signup");
  const choice = await inputVal("Choose (1/2): ");

  const auth = require("./auth");

  if (choice === "1") {
    const username = await inputVal("\nUsername: ");
    const password = prompt("Password: ", { echo: "" });
    currentUser = auth.login(username, password);
  } else if (choice === "2") {
    const username = await inputVal("\nUsername: ");
    const password = prompt("Password: ", { echo: "" });
    currentUser = auth.signup(username, password);
  } else {
    console.log("❌ Invalid option. Please choose 1 or 2.");
    return main(); // restart the main prompt
  }

  if (currentUser) {
    console.log(`\n👋 Welcome, ${currentUser.username}!`);
    checkAndUpdateMessages(currentUser.id);
    startChat();
  } else {
    // console.log("❌ Invalid credentials");
    main();
  }
}

module.exports = { startChat, inputVal, main, rl };
