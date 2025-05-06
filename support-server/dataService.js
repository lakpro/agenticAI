const fs = require("fs");
const filePath = "./data/requests.json";

async function readRequests() {
  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    return rawData ? JSON.parse(rawData) : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("\nrequests.json does not exist, creating a new file.");
    }
    throw error;
  }
}

async function writeRequests(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing requests data:", error);
    throw error;
  }
}

module.exports = { readRequests, writeRequests };
