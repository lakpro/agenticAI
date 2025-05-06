const fs = require("fs");

function autoUpdateKnowledge(updateObj) {
  const filePath = "./data/knowledge.json";
  let knowledge = {};

  // Load existing knowledge
  if (fs.existsSync(filePath)) {
    try {
      knowledge = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (error) {
      console.error("Error parsing existing knowledge.json:", error);
      knowledge = {};
    }
  }

  for (const key of Object.keys(updateObj)) {
    const incoming = updateObj[key];

    if (knowledge.hasOwnProperty(key)) {
      const existing = knowledge[key];

      // Handle array
      if (Array.isArray(existing) && Array.isArray(incoming)) {
        for (const item of incoming) {
          const idx = existing.findIndex(
            (e) => e.name?.toLowerCase() === item.name?.toLowerCase()
          );
          if (idx !== -1) {
            existing[idx] = { ...existing[idx], ...item }; // Update existing
          } else {
            existing.push(item);
          }
        }
      }

      // Handle object merge (for nested updates like contact info)
      else if (typeof existing === "object" && typeof incoming === "object") {
        knowledge[key] = { ...existing, ...incoming };
      } else {
        knowledge[key] = incoming;
      }
    } else {
      knowledge[key] = incoming;
    }
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(knowledge, null, 2));
    // console.log("✅ Knowledge base updated.");
  } catch (error) {
    console.error("Error writing to knowledge.json:", error);
  }
}

module.exports = { autoUpdateKnowledge };
