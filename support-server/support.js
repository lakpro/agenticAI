const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());
const getKnowledgeBaseFormatted =
  require("./gemini.js").getKnowledgeBaseFormatted;

//cors
const cors = require("cors");
app.use(cors((origin = "localhost:5173")));

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

app.get("/api/getallrequests", (req, res) => {
  // Read the existing data
  let requestJsonData = []; // Initialize as an empty array
  try {
    const rawData = fs.readFileSync("./data/requests.json", "utf-8");
    if (rawData) {
      requestJsonData = JSON.parse(rawData);
    }
  } catch (readError) {
    if (readError.code === "ENOENT") {
      // Handle the case where the file doesn't exist yet.
      console.log("\nrequests.json does not exist, creating a new file.");
      // No need to set requestJsonData, it is already [].
    } else {
      //For other errors, throw the error
      throw readError;
    }
  }

  console.log("\nAll requests data read from requests.json.");

  // Send the data as a JSON response
  res.json(requestJsonData);
});

app.post("/request", (req, res) => {
  const { userId, userName, question, timestamp } = req.body;

  console.log("\nWe have received a new request for support.");
  console.log(`\nUser ID: ${userId}`);
  console.log(`User Name: ${userName}`);
  console.log(`Question: ${question}`);
  console.log(`Timestamp: ${timestamp}`);

  // Use try-catch for file operations
  try {
    // 1. Read the existing data
    let requestJsonData = []; // Initialize as an empty array
    try {
      const rawData = fs.readFileSync("./data/requests.json", "utf-8");
      if (rawData) {
        requestJsonData = JSON.parse(rawData);
      }
    } catch (readError) {
      if (readError.code === "ENOENT") {
        // Handle the case where the file doesn't exist yet.
        console.log("\nrequests.json does not exist, creating a new file.");
        // No need to set requestJsonData, it is already [].
      } else {
        //For other errors, throw the error
        throw readError;
      }
    }

    // 2. Determine the new request ID
    const nextReqId =
      requestJsonData.length > 0
        ? Math.max(...requestJsonData.map((r) => r.id)) + 1
        : 1000;

    console.log(`Request ID: ${nextReqId}`);

    // 3. Create the new request object
    const requestData = {
      id: nextReqId,
      userId: userId,
      userName: userName,
      question: question,
      timestamp: timestamp,
      status: "pending",
    };

    // 4. Add the new request to the array
    requestJsonData.push(requestData);

    // 5. Write the updated data back to the file
    fs.writeFileSync(
      "./data/requests.json",
      JSON.stringify(requestJsonData, null, 2),
      "utf-8" // Add encoding
    );
    console.log("\nRequest data saved to requests.json.");

    // 6. Send a success response
    res
      .status(200)
      .send({ message: "Request received and processed successfully." }); // Include a message
  } catch (error) {
    // 7. Handle errors robustly
    console.error("\nError handling request:", error);
    res
      .status(500)
      .send({ error: "Internal server error.  Failed to process request." }); // Send error response
  }
});

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
