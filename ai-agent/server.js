const express = require("express");
const cors = require("cors");
const readline = require("readline");
const prompt = require("prompt-sync")({ sigint: true });

const { login, signup } = require("./auth");
const { inputVal, main, rl } = require("./chat");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/reject", require("./routes/reject"));
app.use("/resolve", require("./routes/resolve"));
app.use("/updateknowledge", require("./routes/updateKnowledge"));

// Server start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("\nHi, I am your AI assistant. Type 'exit' to logout.");
  main(); // CLI entry
});
