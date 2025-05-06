const express = require("express");
const fs = require("fs");
const path = require("path");
const { getGeminiResponse } = require("../gemini");
const {
  checkAndUpdateMessages,
  getNextResponseId,
} = require("../utils/messageUtils");
const { startChat } = require("../chat");

const RESPONSE_FILE_PATH = path.join(__dirname, "../data/responses.json");

const { readJsonFile, writeJsonFile } = require("../utils/fileUtils");

const router = express.Router();

router.post("/", async (req, res) => {
  const { info } = req.body;

  if (!info || !info.userId || !info.question) {
    return res.status(400).json({ error: "Missing 'info' in request body" });
  }

  try {
    const result = await getGeminiResponse(info.question);

    if (result.toLowerCase().includes("i couldn't find the answer")) {
      return res.status(200).json({
        status: "rejected",
        message: "Could not find an answer.",
      });
    }

    const newEntry = {
      id: getNextResponseId(),
      userId: info.userId,
      question: info.question,
      answer: result,
      timestamp: new Date(),
      status: "resolved",
      delivery: "pending",
    };

    const responses = readJsonFile(RESPONSE_FILE_PATH);
    responses.push(newEntry);
    writeJsonFile(RESPONSE_FILE_PATH, responses);

    res.status(200).json({
      status: "accepted",
      message: "Request received and processed successfully.",
    });

    if (global.currentUser) {
      checkAndUpdateMessages(info.userId);
      startChat();
    }
  } catch (err) {
    console.error("Error resolving question:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
