const express = require("express");
const cors = require("cors");
const { setupRoutes } = require("./routes");

const app = express();
app.use(express.json());
app.use(cors());

// Set up routes
setupRoutes(app);

console.log("Welcome to the support server. Listening on port 4000.");
app.listen(4000);
