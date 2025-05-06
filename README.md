# agenticAI

**agenticAI** is a human-in-the-loop AI chatbot system that leverages the Gemini API and a structured knowledge base (KB) to handle and learn from user questions. It supports both synchronous and asynchronous workflows with optional human supervision.

---

# 🚀 Asynchronous Agent (v2)

## 🔁 Workflow Explanation

1. **User logs in**, and their info is stored in `UD` (User Data).  
2. `LOGIN → UD`: User data is stored on the server.  
3. `UD → USER`: User data is sent back to the client session.  
4. The **user asks a question** to the AI Agent.  
5. The question is sent to `GEMINI` and added to a pre-written prompt.  
6. The **AI Agent attempts to answer** using the `KB` with the help of Gemini API.  
7. Based on the outcome, the AI Agent **makes a decision**.  
8. If the answer is available, it is sent directly to the user.

**If the answer is _not found_:**

- **i.** The question is added to the `REQ` queue.  
- **ii.** A **Supervisor reviews** the pending `REQ` entries.  
- **iii.** If needed, the Supervisor adds relevant info to the `KB`.  
- **iv.** `GEMINI` converts the info into consistent, valid JSON.  
- **v.** The JSON is sent to the AI Agent to update the `KB`.

### If the Supervisor clicks **RESOLVE**:

- **vi.** The response is sent back to the AI Agent.  
- **5.** The AI Agent re-runs the process using `GEMINI` and the updated `KB`.  
- **vii.** If an answer is finalized, it is added to `RES`.

### If the Supervisor clicks **REJECT**:

- **vi.** The rejected question is sent to the AI Agent.  
- **vii.** The AI Agent adds it to `RES` without generating a new answer.

**ix.** If the **user is online**, the resolved answer is sent instantly.  
**ix.** If the **user is offline**, it is queued and delivered on the next login.

> 🧠 **Note:** All updates to the KB go through the AI Agent and Gemini for consistent formatting and validation.

---

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


# How can we improve this model further?

### 1. Using Multi-Agent Systems
![Multi-Agent Systems](https://github.com/user-attachments/assets/a86077b4-2947-4cac-9d5a-c0a8561bcb8f)

### 2. Using RAG (Retrieval-Augmented Generation)
RAG retrieves only the required info for the user query.
![RAG](https://github.com/user-attachments/assets/0a68a430-0a04-4d1d-a514-b8387dc12afc)

### 3. Using Agentic RAG
RAG plus intelligent decision-making retrieval
![Agentic RAG](https://github.com/user-attachments/assets/f5fe7187-ea76-4b75-a80d-5e67eedbf07f)

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
