# AI-Powered Interview Assistant (Crisp) For SWIPE

This project is an **AI-powered Interview Assistant** built with **React**.  
It provides a seamless experience for both **Interviewees** (candidates) and **Interviewers** (recruiters), enabling automated, fair, and interactive interviews.  

The app supports **resume parsing, AI-driven interview question flow, scoring, and interviewer dashboard visualization** — making the entire interview process automated, structured, and consistent.

---

## 🎯 Goals

- Provide an **interview simulation** platform for candidates (chat-based).
- Allow recruiters to **monitor candidate performance** via a dashboard.
- Automate **resume parsing**, **missing field collection**, **AI question generation**, **timed answers**, and **final scoring**.
- Ensure **synchronized state** between Interviewee and Interviewer views.

---

## 🚀 Features

### 👩‍💻 Interviewee (Chat Interface)

1. **Resume Upload**
   - Upload PDF (mandatory) / DOCX (optional).
   - Extracts **Name, Email, Phone** automatically.

2. **Missing Fields Collection**
   - If resume misses any required fields, chatbot prompts candidate before starting interview.
   - Example: *"We couldn’t find your phone number. Please provide it before we proceed."*

3. **AI-Powered Interview**
   - 6 Questions auto-generated:
     - **2 Easy** (20s each).
     - **2 Medium** (60s each).
     - **2 Hard** (120s each).
   - One question at a time with **timer + progress bar**.
   - Candidate answers in chat.
   - Auto-progress to next question when:
     - Answer is given, or
     - Timer runs out.

4. **Final Evaluation**
   - AI assigns **scores per answer**.
   - AI generates **short candidate summary** (skills, communication, overall performance).
   - Score + Summary synced to interviewer dashboard.

---

### 🧑‍🏫 Interviewer (Dashboard)

1. **Candidate List**
   - Displays candidates ordered by **final score**.
   - Includes Name, Email, Score, and Summary.

2. **Candidate Detail View**
   - Full chat history (questions + answers).
   - Score breakdown per question.
   - Final summary.

3. **Dashboard Controls**
   - **Search** candidates.
   - **Sort** by score / name.
   - Responsive table for quick navigation.

---

## 🛠️ Tech Stack

- **Frontend:** React (Hooks + Functional Components)
- **State Management:** Redux + redux-persist (local persistence in browser via IndexedDB/LocalStorage)
- **UI Framework:** Ant Design (modern, responsive components)
- **File Parsing:**
  - `pdf-parse` for PDF.
  - `docx` package for DOCX.
- **AI Layer:** 
  - OpenAI / LLM integration for **question generation**, **answer evaluation**, and **summary writing**.
- **Storage:** Local persistence for candidate data (can be extended to backend DB).

---

## 🧑‍💻 Running Locally

### 1. Clone Repository
```bash
git clone <repo_url>
cd interview-assistant-crisp
```

### 2. Run Server

```
cd server
npm install
npm start
```

### 3. Run Client
```
cd client
npm install
npm start
```
