const express = require("express");
const fs = require("fs");
const {
  checkAndUpdateMessages,
  getNextResponseId,
} = require("../utils/messageUtils");
const path = require("path");
const { readJsonFile, writeJsonFile } = require("../utils/fileUtils");
const { startChat } = require("../chat");
const router = express.Router();

const RESPONSE_FILE_PATH = path.join(__dirname, "../data/responses.json");

router.post("/", (req, res) => {
  const { info } = req.body;
  if (!info || !info.userId || !info.question) {
    return res.status(400).json({ error: "Missing 'info' in request body" });
  }

  const newEntry = {
    id: getNextResponseId(),
    userId: info.userId,
    question: info.question,
    answer: "Your question was either incomplete or unclear...",
    timestamp: new Date(),
    status: "rejected",
    delivery: "pending",
  };

  const responses = readJsonFile(RESPONSE_FILE_PATH);
  responses.push(newEntry);
  writeJsonFile(RESPONSE_FILE_PATH, responses);

  res.status(200).json({ status: "rejected", message: "Logged successfully." });

  if (global.currentUser) {
    checkAndUpdateMessages(info.userId);
    startChat();
  }
});

module.exports = router;
