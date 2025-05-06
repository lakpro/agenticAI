const fs = require("fs");
const path = require("path");
const { readJsonFile, writeJsonFile } = require("../utils/fileUtils");

const RESPONSE_FILE_PATH = path.join(__dirname, "../data/responses.json");

// Utility to get next unique response ID
function getNextResponseId(filepath = RESPONSE_FILE_PATH) {
  const responses = readJsonFile(filepath);
  return responses.length > 0
    ? Math.max(...responses.map((r) => r.id || 1000)) + 1
    : 1000;
}

// Checks for user's pending messages and updates delivery status
function checkAndUpdateMessages(userId) {
  try {
    if (!userId) return;

    // const filePath = path.join(__dirname, "data", "responses.json");
    let messages = readJsonFile(RESPONSE_FILE_PATH);

    const pending = messages.filter(
      (msg) => msg.userId == userId && msg.delivery == "pending"
    );
    if (pending.length === 0) {
      console.log("\n📬 No pending messages.");
      return;
    }

    console.log(`\n📬 You have ${pending.length} new message(s):`);
    pending.forEach((msg) => {
      console.log(`\nQuestion: ${msg.question}`);
      console.log(`Answer: ${msg.answer}\n`);
    });

    // Mark as delivered
    const updatedMessages = messages.map((msg) =>
      msg.userId === userId && msg.delivery === "pending"
        ? { ...msg, delivery: "done" }
        : msg
    );

    writeJsonFile(RESPONSE_FILE_PATH, updatedMessages);

    // Delay before returning to chat input
    setTimeout(() => {
      "";
    }, 200); // 200ms delay fixes overwritten output
  } catch (error) {
    console.error("checkAndUpdateMessages error:", error);
  }
}

module.exports = {
  checkAndUpdateMessages,
  getNextResponseId,
};
