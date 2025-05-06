const {
  markResolved,
  markRejected,
  getAllRequests,
  resolveRequest,
  addRequest,
  helpRequest,
  addKnowledge,
} = require("./controllers");

function setupRoutes(app) {
  app.put("/api/mark_resolved", markResolved);
  app.put("/api/mark_rejected", markRejected);
  app.get("/api/getallrequests", getAllRequests);
  app.post("/api/resolve", resolveRequest);
  app.post("/request", addRequest);
  app.post("/help", helpRequest);
  app.post("/api/addknowledge", addKnowledge);
}

module.exports = { setupRoutes };
