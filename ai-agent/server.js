const fs = require("fs");
const axios = require("axios");
const readline = require("readline");
const express = require("express");
const { prototype } = require("stream");
const app = express();
const PORT = 3000;
const getGeminiResponse = require("./gemini.js").getGeminiResponse;
const autoUpdateKnowledge = require("./updateKnowledge.js");
const { signup, login, getCurrentUser } = require("./auth");

const cors = require("cors");
const { error } = require("console");
// app.use(cors({ origin: "http://localhost:4000" }));
app.use(cors());
// let knowledge = JSON.parse(fs.readFileSync("./knowledge.json"));

// Middleware to parse JSON
app.use(express.json());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

app.post("/reject", (req, res) => {
  const { info } = req.body;

  if (!info) {
    return res.status(400).send({ error: "Missing 'info' in request body" });
  }

  console.log("\n❌ Reject received:", info);

  const { userId, question } = info;
  const timestamp = new Date();

  try {
    // Step 1: Read existing responses
    let responseJsonData = [];
    try {
      const rawData = fs.readFileSync("./data/responses.json", "utf-8");
      if (rawData) {
        responseJsonData = JSON.parse(rawData);
      }
    } catch (readError) {
      if (readError.code === "ENOENT") {
        console.log("responses.json does not exist. Creating new one.");
      } else {
        throw readError;
      }
    }

    // Step 2: Generate new response ID
    const nextResId =
      responseJsonData.length > 0
        ? Math.max(...responseJsonData.map((r) => r.id)) + 1
        : 1000;

    // Step 3: Create rejection entry
    const rejectedResponse = {
      id: nextResId,
      userId,
      question,
      answer:
        "Your question was either incomplete or unclear. Please feel free to ask again with more specific or relevant information.",
      timestamp,
      status: "rejected",
      delivery: "pending",
    };

    // Step 4: Add to responses
    responseJsonData.push(rejectedResponse);

    // Step 5: Write to file
    fs.writeFileSync(
      "./data/responses.json",
      JSON.stringify(responseJsonData, null, 2),
      "utf-8"
    );

    console.log(`Rejected response saved with ID: ${nextResId}`);

    // Step 6: Send confirmation
    res.status(200).send({
      status: "rejected",
      message: "Request was rejected and logged successfully.",
    });
  } catch (error) {
    console.error("Error saving rejected response:", error);
    res.status(500).send({ error: "Internal server error while rejecting." });
  }
});

app.post("/resolve", async (req, res) => {
  const { info } = req.body;

  if (!info) {
    return res.status(400).send({ error: "Missing 'info' in request body" });
  }

  console.log("\nWe recieved ", info);

  const result = await getGeminiResponse(info.question);

  console.log("AI response", result);

  if (result.toLowerCase().includes("i couldn't find the answer")) {
    return res
      .status(200)
      .send({ status: "rejected", message: "Could not find an answer." });
  } else {
    // add to the responses.json

    const { userId, userName, question } = info;

    const timestamp = new Date();

    try {
      // 1. Read the existing data
      let responseJsonData = [];
      try {
        const rawData = fs.readFileSync("./data/responses.json", "utf-8");
        if (rawData) {
          responseJsonData = JSON.parse(rawData);
        }
      } catch (readError) {
        if (readError.code === "ENOENT") {
          console.log("\nresponses.json does not exist, creating a new file.");
        } else {
          throw readError;
        }
      }

      // 2. Determine the new request ID
      const nextResId =
        responseJsonData.length > 0
          ? Math.max(...responseJsonData.map((r) => r.id)) + 1
          : 1000;

      console.log(`Request ID: ${nextResId}`);

      // 3. Create the new request object
      const responseData = {
        id: nextResId,
        userId: userId,
        question: question,
        answer: result,
        timestamp: timestamp,
        status: "resolved",
        delivery: "pending",
      };

      // 4. Add the new request to the array
      responseJsonData.push(responseData);

      // 5. Write the updated data back to the file
      fs.writeFileSync(
        "./data/responses.json",
        JSON.stringify(responseJsonData, null, 2),
        "utf-8"
      );
      console.log("\nRequest data saved to responses.json.");

      // 6. Send a success response
      res.status(200).send({
        status: "accepted",
        message: "Request received and processed successfully.",
      });
    } catch (error) {
      // 7. Handle errors
      console.error("\nError handling request:", error);
      res
        .status(500)
        .send({ error: "Internal server error.  Failed to process request." });
    }
  }
});

app.post("/updateknowledge", (req, res) => {
  const { info } = req.body;

  if (!info) {
    return res.status(400).send({ error: "Missing 'info' in request body" });
  }

  console.log("\nWe recieved ", info);
  autoUpdateKnowledge(info);
  res.status(200).send("OK");
});

async function ask(question) {
  if (!question) return;
  //   console.log(question);
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
            console.log("currentUser", currentUser);
            const res = await axios.post("http://localhost:4000/request", {
              userId: currentUser.id,
              userName: currentUser.username,
              question: question,
              timestamp: new Date().toISOString(),
            });

            if (res.status !== 200) {
              console.log(
                "\nAI: Sorry, we couldn't find the answer at the moment. Please contact us via phone or email."
              );
            }

            console.log(
              "\nAI: I've sent your question to the support team. They will get back to you shortly."
            );

            // const answer = res.data;

            // Update knowledge base with the new answer
            // autoUpdateKnowledge(answer);

            // Ask again with the new knowledge
            // await ask(question);
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

// Promisified version of rl.question for async handling
function inputVal(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
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

let currentUser = null;

async function main() {
  //   const user = getCurrentUser();
  //   if (user) {
  //     console.log(`👋 Welcome back, ${user.username}!`);
  //     // rl.close();
  //     startChat();
  //     return;
  //   }
  if (currentUser) {
    console.log(`👋 Welcome back, ${currentUser.username}!`);
    startChat();
    return;
  }

  console.log("📲 1. Login\n📝 2. Signup");
  const choice = await inputVal("Choose an option (1/2): ");

  if (choice === "1") {
    const username = await inputVal("Username: ");
    const password = await inputVal("Password: ");
    // console.log(username, password);
    const user = login(username, password);
    if (user) {
      currentUser = user;
      console.log(`\n👋 Welcome back, ${user.username}!`);
      startChat();
      return;
    }
  } else if (choice === "2") {
    const username = await inputVal("Username: ");
    const password = await inputVal("Password: ");
    // console.log(username, password);
    const user = signup(username, password);
    if (user) {
      currentUser = user;
      console.log(`\n👋 Welcome onboard, ${user.username}!`);
      startChat();
      return;
    }
  } else {
    console.log("❌ Invalid option");
  }

  main();
}

// Show intro once
console.log("Hi, I am your AI assistant. Type 'exit' to quit.");
main();
// startChat();

app.listen(PORT);
