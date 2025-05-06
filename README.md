# agenticAI

**agenticAI** is a human-in-the-loop AI chatbot system that leverages the Gemini API and a structured knowledge base (KB) to handle and learn from user questions. It supports both synchronous and asynchronous workflows with optional human supervision.

---

# 🚀 Asynchronous Agent (v2)

## 🔁 Workflow Explanation

1. **User logs in**, and their info is stored in `UD` (User Data).
2. `LOGIN → UD`: User data is stored on the server.
3. `UD → USER`: User data is sent back to the client session.
4. The **user asks a question** to the AI agent.
5. The **AI Agent attempts to answer** using the `KB` with the help of the Gemini API.
6. If the answer is **not found**, the question is sent to the `REQ` queue.
7. A **Supervisor reviews** the pending `REQ` entries and adds relevant data to the knowledge base.
8. If the Supervisor clicks **RESOLVE**:
   - The response is sent back to the AI agent.
   - The AI updates the KB through Gemini.
   - The finalized answer is added to the `RES` file.
9. If the Supervisor clicks **REJECT**:
   - The AI is informed not to update the KB.
   - The original question and rejection status are added to `RES`.
10. If the **user is online**, the resolved answer is sent instantly.
11. If the **user is offline**, the response is queued and delivered on next login.

> 🧠 **Note:** All updates to the KB go through the AI Agent and Gemini for consistent formatting and validation.

## 📘 Glossary

- **KB**: Knowledge Base
- **UD**: User Data
- **REQ**: Unresolved questions pending review
- **RES**: Responses mapped to users
- **GEMINI**: The LLM used for language understanding and generation
- **SUPERVISOR**: A human reviewer who verifies or resolves questions
- **AI AGENT**: The chatbot system that handles user interaction

![Agentic AI v2](https://github.com/user-attachments/assets/20769bd9-14a5-4f27-a336-39ef624447d1)
*AgenticAI v2 – Async Update and Communication*

---

# ⚙️ Synchronous Agent (v1)

## 🧩 Server Roles

### 1. ai-agent

- Main chatbot server.
- Handles user interactions directly.
- Uses `knowledge.json` for generating answers.
- Integrates with Gemini API for reasoning and replies.

### 2. support-server

- Handles unresolved questions.
- Human supervisor types the correct response.
- Gemini reformats and sends the entry back to `ai-agent`.
- Answer is added to `knowledge.json`.
- The question is re-evaluated and the final answer is returned to the user.

## 📘 Glossary

- **KB**: Knowledge Base
- **GEMINI**: LLM used for processing and generation

![Agentic AI v1](https://github.com/user-attachments/assets/880d9a18-ec0a-428c-a984-f43125539e5b)
*AgenticAI v1 – Synchronous KB Update and Reply*

---
