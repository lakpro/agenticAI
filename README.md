# agenticAI

**agenticAI** is a human-in-the-loop AI assistant system that leverages the LLM and a structured Knowledge Base to handle and learn from user questions. It supports both synchronous and asynchronous workflows with optional human supervision.

---
# ⚠️ In Progress: Asynchronous Agent with RAG (v3)

The knowledge base (KB) is being chunked and converted into embeddings, which are then stored in a vector database.

When a user submits a query, it is also embedded and searched (using Approximate Nearest Neighbor – ANN) within the vector database to retrieve the top-k relevant results.

These results are then augmented with the prompt and user query before being passed to the LLM to generate a more accurate final response.

![Agentic AI v3](https://github.com/user-attachments/assets/b79db802-8e8c-4d6a-95ea-825539336e44)

---

# 🚀 Asynchronous Agent (v2)


## 🔁 Workflow Explanation

1. **User logs in**, and their info is stored in `UD` (User Data).  
2. `LOGIN → UD`: User data is stored on the server.  
3. `UD → USER`: User data is sent back to the client session.  
4. The **user asks a question** to the AI Agent.  
5. The question is sent to `LLM` and added to a pre-written prompt.  
6. The **AI Agent attempts to answer** using the `KB` with the help of LLM.  
7. Based on the outcome, the AI Agent **makes a decision**.  
8. If the answer is available, it is sent directly to the user.

**If the answer is _not found_:**

**i.** The question is added to the `REQ` queue.  
**ii.** A **Supervisor reviews** the pending `REQ` entries.  
**iii.** If needed, the Supervisor adds relevant info to the `KB`.  
**iv.** `LLM` converts the info into consistent, valid JSON.  
**v.** The JSON is sent to the AI Agent to update the `KB`.

### If the Supervisor clicks **RESOLVE**:

**vi.** The response is sent back to the AI Agent.  
**5.** The AI Agent re-runs the process using `LLM` and the updated `KB`.  
**vii.** If an answer is finalized, it is added to `RES`.

### If the Supervisor clicks **REJECT**:

**vi.** The rejected question is sent to the AI Agent.  
**vii.** The AI Agent adds it to `RES` without generating a new answer.

**ix.** If the **user is online**, the resolved answer is sent instantly.  
**ix.** If the **user is offline**, it is queued and delivered on the next login.


> 🧠 **Note:** All updates to the KB go through the AI Agent and Gemini for consistent formatting and validation.

---


## 📘 Glossary

- **KB**: Knowledge Base
- **UD**: User Data
- **REQ**: Unresolved questions pending review
- **RES**: Responses mapped to users
- **LLM**: Large Language Model
- **SUPERVISOR**: A human reviewer who verifies or resolves questions
- **AI AGENT**: The chatbot system that handles user interaction


![Agentic AI v2](https://github.com/user-attachments/assets/2b21a776-a2f9-4215-b764-f4f3f4456c86)
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



## 🛠️ How to Run This Project

Project structure:

```
agenticAi/
├── ai-agent/           # Main AI agent service
├── support-server/     # Backend support API
├── support-frontend/   # Frontend (Vite + React + Tailwind)
```

### 1. `ai-agent`
This is the core AI service using the Gemini API.

**Steps to run:**
```bash
cd ai-agent
npm install
node server.js
```

### 2. `support-server`
Backend service that handles support logic and API requests.

**Steps to run:**
```bash
cd support-server
npm install
node support.js
```

### 3. `support-frontend`
Frontend built with Vite, React, and Tailwind CSS.

**Steps to run:**
```bash
cd support-frontend
npm install
npm run dev
```


### 🔑 Environment Variables

For both `ai-agent` and `support-server`, create a `.env` file in each directory and add your Gemini API key (from [Google AI Console](https://aistudio.google.com/app/apikey)):

```env
GEMINI_API_KEY=your_api_key_here
```

> 🚨 All three services must be running simultaneously for the app to function properly.

---


## ⚙️ Scalability Suggestions

1. Currently, only one request from a supervisor is handled at a time.
   - Introduce **Message Queues** to scale request handling.
2. For multiple users, supervisors, or live agents:
   - Implement **session-based** or **room-based** architecture.
3. If complexity grows:
   - Migrate to a **microservice architecture**.

---


## 🚀 Future Developments

1. Integrate **live chat** with human agents.
2. Convert to a **multi-agent system** and integrate **calendar booking**.
3. Use **RAG (Retrieval-Augmented Generation)** for better context-aware responses.

---


# ⚙️ Synchronous Agent (v1)

## 🧩 Server Roles

### 1. ai-agent

- Main chatbot server.
- Handles user interactions directly.
- Uses `knowledge.json` for generating answers.
- Integrates with LLM for reasoning and replies.

### 2. support-server

- Handles unresolved questions.
- Human supervisor types the correct response.
- Gemini reformats and sends the entry back to `ai-agent`.
- Answer is added to `knowledge.json`.
- The question is re-evaluated, and the final answer is returned to the user.

## 📘 Glossary

- **KB**: Knowledge Base
- **LLM**: Large Language Model

![Agentic AI v1](https://github.com/user-attachments/assets/ac709057-1ac5-4a5f-9dc6-3ccb1aaf4e60)
*AgenticAI v1 – Synchronous KB Update and Reply*

---
## APP WORKING SCREENSHOTS
![image](https://github.com/user-attachments/assets/b0997b71-604d-4ab2-8dbb-d9a649f1ae4a)
![image](https://github.com/user-attachments/assets/580c7f93-e991-4a61-806d-0b046c178d16)
![image](https://github.com/user-attachments/assets/b44df91b-e810-4555-895a-aa240b81f356)

