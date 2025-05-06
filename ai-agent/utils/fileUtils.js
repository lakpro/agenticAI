const fs = require("fs");
const path = require("path");

// Utility to read JSON file
function readJsonFile(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      return [];
    }
    const data = fs.readFileSync(filepath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading JSON file:", err);
    return [];
  }
}

// Utility to write JSON file
function writeJsonFile(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing JSON file:", err);
  }
}

module.exports = {
  readJsonFile,
  writeJsonFile,
};
