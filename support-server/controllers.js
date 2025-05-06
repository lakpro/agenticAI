const fs = require("fs");
const axios = require("axios");
const { extractJsonFromCodeBlock } = require("./utils");
const { getKnowledgeBaseFormatted } = require("./gemini");
const { readRequests, writeRequests } = require("./dataService");

async function markResolved(req, res) {
  const req_id = req.body.req_id;
  console.log("Marking resolved: ", req_id);

  try {
    let requestJsonData = await readRequests();
    const requestIndex = requestJsonData.findIndex((req) => req.id === req_id);

    if (requestIndex === -1)
      return res.status(404).json({ error: "Request not found." });

    requestJsonData[requestIndex].status = "resolved";
    await writeRequests(requestJsonData);

    res.json({
      message: "Request updated successfully.",
      request: requestJsonData[requestIndex],
    });
  } catch (error) {
    res.status(500).json({ error: "Error processing the request." });
  }
}

async function markRejected(req, res) {
  const req_id = req.body.req_id;
  console.log("Marking rejected: ", req_id);

  try {
    let requestJsonData = await readRequests();
    const requestIndex = requestJsonData.findIndex((req) => req.id === req_id);

    if (requestIndex === -1)
      return res.status(404).json({ error: "Request not found." });

    const rejectedRequest = requestJsonData[requestIndex];
    rejectedRequest.status = "rejected";

    await writeRequests(requestJsonData);

    const agentResponse = await axios.post("http://localhost:3000/reject", {
      info: rejectedRequest,
    });

    res.json({
      message: "Request marked as rejected and forwarded to agent.",
      request: rejectedRequest,
      agentResponse: agentResponse.data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update request or notify agent." });
  }
}

async function getAllRequests(req, res) {
  try {
    const requestJsonData = await readRequests();
    res.json(requestJsonData);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve requests." });
  }
}

async function resolveRequest(req, res) {
  const req_id = req.body.req_id;
  console.log("Backend received resolve req id: ", req_id);

  try {
    let requestJsonData = await readRequests();
    const targetRequest = requestJsonData.find((item) => item.id === req_id);

    if (!targetRequest)
      return res.status(404).send({ error: "Request ID not found." });

    const response = await axios.post("http://localhost:3000/resolve", {
      info: targetRequest,
    });

    res.status(200).json({
      message: "Request forwarded to agent successfully.",
      agentResponse: response.data,
    });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal server error. Failed to process request." });
  }
}

async function addRequest(req, res) {
  const { userId, userName, question, timestamp } = req.body;
  console.log("\nWe have received a new request for support.");

  try {
    let requestJsonData = await readRequests();
    const nextReqId =
      requestJsonData.length > 0
        ? Math.max(...requestJsonData.map((r) => r.id)) + 1
        : 1000;

    const requestData = {
      id: nextReqId,
      userId,
      userName,
      question,
      timestamp,
      status: "pending",
    };

    requestJsonData.push(requestData);
    await writeRequests(requestJsonData);

    res
      .status(200)
      .send({ message: "Request received and processed successfully." });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal server error. Failed to process request." });
  }
}

async function helpRequest(req, res) {
  const { question } = req.body;
  console.log("\nWe have received a new request for support.");

  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`\nAnswer: `, async (answer) => {
    if (answer.toLowerCase() === "ignore") {
      console.log("\nThe request has been ignored.");
      return res.status(404).send();
    }

    let result = await getKnowledgeBaseFormatted(answer);
    let formattedResult = extractJsonFromCodeBlock(result);

    res.json(formattedResult);
    rl.close();
    console.log("\nThank you. The knowledge base has been updated.");
  });
}

async function addKnowledge(req, res) {
  const info = req.body.info;
  console.log("\nWe have received a new request to update knowledge base.");

  console.log(info);

  try {
    let result = await getKnowledgeBaseFormatted(info);
    console.log("result", result);
    let formattedResult = extractJsonFromCodeBlock(result);
    console.log(formattedResult);
    if (!formattedResult)
      return res.status(400).send({
        error:
          "Invalid response from getKnowledgeBaseFormatted. Expected JSON.",
      });

    const response = await axios.post("http://localhost:3000/updateknowledge", {
      info: formattedResult,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
}

module.exports = {
  markResolved,
  markRejected,
  getAllRequests,
  resolveRequest,
  addRequest,
  helpRequest,
  addKnowledge,
};
