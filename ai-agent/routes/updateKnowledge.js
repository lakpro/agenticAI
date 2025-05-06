// routes/updateknowledge.js
const express = require("express");
const { autoUpdateKnowledge } = require("../updateKnowledge");

const router = express.Router();

router.post("/", (req, res) => {
  const { info } = req.body;

  try {
    autoUpdateKnowledge(info);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Update knowledge error:", error.message);
    res.status(500).send("Error updating knowledge.");
  }
});

module.exports = router;
