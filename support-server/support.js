const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());
const getKnowledgeBaseFormatted =
  require("./gemini.js").getKnowledgeBaseFormatted;

const axios = require("axios");

//cors
const cors = require("cors");
// app.use(cors((origin = "localhost:5173")));

app.use(cors());

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

app.put("/api/mark_resolved", (req, res) => {
  const req_id = req.body.req_id;

  console.log("Marking resolved: ", req_id);

  let requestJsonData = [];
  try {
    const rawData = fs.readFileSync("./data/requests.json", "utf-8");
    requestJsonData = rawData ? JSON.parse(rawData) : [];
  } catch (readError) {
    if (readError.code === "ENOENT") {
      return res.status(404).json({ error: "No requests found." });
    } else {
      return res.status(500).json({ error: "Error reading file." });
    }
  }

  // Find the request by ID
  const requestIndex = requestJsonData.findIndex((req) => req.id === req_id);

  if (requestIndex === -1) {
    return res.status(404).json({ error: "Request not found." });
  }

  console.log("Resolving request", requestJsonData[requestIndex]);

  // Update status
  requestJsonData[requestIndex].status = "resolved";

  // Save back to file
  try {
    fs.writeFileSync(
      "./data/requests.json",
      JSON.stringify(requestJsonData, null, 2)
    );
    res.json({
      message: "Request updated successfully.",
      request: requestJsonData[requestIndex],
    });
  } catch (writeError) {
    res.status(500).json({ error: "Error writing to file." });
  }
});

app.put("/api/mark_rejected", async (req, res) => {
  const req_id = req.body.req_id;
  console.log("Marking rejected: ", req_id);

  let requestJsonData = [];
  try {
    const rawData = fs.readFileSync("./data/requests.json", "utf-8");
    requestJsonData = rawData ? JSON.parse(rawData) : [];
  } catch (readError) {
    if (readError.code === "ENOENT") {
      return res.status(404).json({ error: "No requests found." });
    } else {
      return res.status(500).json({ error: "Error reading file." });
    }
  }

  const requestIndex = requestJsonData.findIndex((req) => req.id === req_id);

  if (requestIndex === -1) {
    return res.status(404).json({ error: "Request not found." });
  }

  const rejectedRequest = requestJsonData[requestIndex];
  rejectedRequest.status = "rejected";

  try {
    // Step 1: Save the update locally
    fs.writeFileSync(
      "./data/requests.json",
      JSON.stringify(requestJsonData, null, 2)
    );

    // Step 2: Notify agent on port 3000
    const agentResponse = await axios.post("http://localhost:3000/reject", {
      info: rejectedRequest,
    });

    // Step 3: Respond back
    res.json({
      message: "Request marked as rejected and forwarded to agent.",
      request: rejectedRequest,
      agentResponse: agentResponse.data,
    });
  } catch (error) {
    console.error("Error updating or notifying:", error);
    res
      .status(500)
      .json({ error: "Failed to update request or notify agent." });
  }
});

app.get("/api/getallrequests", (req, res) => {
  // Read the existing data
  let requestJsonData = [];
  try {
    const rawData = fs.readFileSync("./data/requests.json", "utf-8");
    if (rawData) {
      requestJsonData = JSON.parse(rawData);
    }
  } catch (readError) {
    if (readError.code === "ENOENT") {
      console.log("\nrequests.json does not exist, creating a new file.");
    } else {
      throw readError;
    }
  }

  console.log("\nAll requests data read from requests.json.");

  // Send the data as a JSON response
  res.json(requestJsonData);
});

app.post("/api/resolve", async (req, res) => {
  //   const req_id = req.params.req_id; // Correct way to access route param
  //   const req_id = 0;
  const req_id = req.body.req_id;

  console.log("Backend recieved resolve req id: ", req_id);

  try {
    // Step 1: Read the existing data
    let requestJsonData = [];

    try {
      const rawData = fs.readFileSync("./data/requests.json", "utf-8");
      if (rawData) {
        requestJsonData = JSON.parse(rawData);
      }
    } catch (readError) {
      if (readError.code === "ENOENT") {
        console.log("\nrequests.json does not exist, creating a new file.");
      } else {
        throw readError;
      }
    }

    // Step 2: Find the request by ID
    const targetRequest = requestJsonData.find((item) => item.id === req_id);

    if (!targetRequest) {
      return res.status(404).send({ error: "Request ID not found." });
    }

    console.log("\n✅ Found Request:", targetRequest);

    // Step 3: Send it to the agent
    const response = await axios.post("http://localhost:3000/resolve", {
      info: targetRequest,
    });

    // Step 4: Send success response
    res.status(200).json({
      message: "Request forwarded to agent successfully.",
      agentResponse: response.data,
    });
  } catch (error) {
    console.error("\nError handling request:", error);
    res.status(500).send({
      error: "Internal server error. Failed to process request.",
    });
  }
});

app.post("/request", (req, res) => {
  const { userId, userName, question, timestamp } = req.body;

  console.log("\nWe have received a new request for support.");
  console.log(`\nUser ID: ${userId}`);
  console.log(`User Name: ${userName}`);
  console.log(`Question: ${question}`);
  console.log(`Timestamp: ${timestamp}`);

  try {
    // 1. Read the existing data
    let requestJsonData = [];
    try {
      const rawData = fs.readFileSync("./data/requests.json", "utf-8");
      if (rawData) {
        requestJsonData = JSON.parse(rawData);
      }
    } catch (readError) {
      if (readError.code === "ENOENT") {
        console.log("\nrequests.json does not exist, creating a new file.");
      } else {
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
      "utf-8"
    );
    console.log("\nRequest data saved to requests.json.");

    // 6. Send a success response
    res
      .status(200)
      .send({ message: "Request received and processed successfully." });
  } catch (error) {
    // 7. Handle errors
    console.error("\nError handling request:", error);
    res
      .status(500)
      .send({ error: "Internal server error.  Failed to process request." });
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

app.post("/api/addknowledge", async (req, res) => {
  const info = req.body.info;

  console.log("Info:", info);
  console.log("\nWe have received a new request to update knowledge base.");

  try {
    let result = await getKnowledgeBaseFormatted(info);
    console.log("AI (learned):", result);

    let formattedResult = extractJsonFromCodeBlock(result);
    if (!formattedResult) {
      return res.status(400).send({
        error:
          "Invalid response from getKnowledgeBaseFormatted.  Expected JSON.",
      });
    }

    console.log("Formatted Result:", formattedResult);

    const response = await axios.post("http://localhost:3000/updateknowledge", {
      info: formattedResult,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error in /api/addknowledge", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

console.log("Welcome to the support server. Listening on port 4000.");

app.listen(4000);
