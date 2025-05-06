function extractJsonFromCodeBlock(response) {
  const match = response.match(/```json([\s\S]*?)```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (err) {
      console.error("JSON parse error:", err);
    }
  }
  return null;
}

module.exports = { extractJsonFromCodeBlock };
