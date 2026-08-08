# Carrier OS — Frontend Control Plane

> **Carrier OS** is an open-source, user-controlled Autonomous Career Execution Platform powered by a 17-agent OS runtime kernel.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Key Features & Control Plane Views

### 1. 📊 Executive Career Dashboard & Real-Time Execution Trace
- Live metrics: Discovered Jobs, Applications Sent, ATS Average Match Score, and Interview Invitations.
- Real-time **17-Agent Execution Trace Stream** via Socket.io websockets.
- Autonomous loop controls (Start/Pause loop, Run Cycle Now).

### 2. 🛡️ Human Approval Center
- Candidate sign-off interface for applications routed under `ASSISTED` mode or flagged by the `RiskGate` (CAPTCHA detection, high-risk portals).
- Review tailored resume summaries, cover letter drafts, ATS scores, and candidate match fit before submission.

### 3. 🔍 AI-Powered Job Discovery & Match Analysis
- Scrapes global job boards and direct career portals.
- Enriches every opportunity with match fit percentages, missing skill gaps, salary fit, and interview probabilities.

### 4. 📬 Application Tracker & Recruiter Email Sync
- 12-state application pipeline tracker (`Pending`, `Auto-Applying`, `Applied`, `Interview`, `Rejected`).
- Recruiter Communication Sync: Scans live Gmail inbox messages, classifies recruiter threads (`Interview Invitation` vs `Rejection`), and correlates status back to applications.

### 5. 📄 Resume Tailoring & ATS Optimization
- JD-specific resume tailoring with ATS score re-validation.
- Preserves master work history metrics with evidence mapping (`SUPPORTED`, `REPHRASED`, `INFERRED`, `UNSUPPORTED`).

### 6. 🎙️ AI Interview Coach & Preparation
- Technical screener preparation packs, behavioral question guides, and company culture briefings.

### 7. ⚙️ User Settings & Automation Policy Configuration
- **Policy Mode**: `MANUAL`, `ASSISTED`, `AUTOMATIC`.
- **Privacy Mode**: `STANDARD`, `PRIVATE`, `LOCAL_ONLY` (strictly blocks cloud LLMs).
- **AI Provider Selector**: OpenAI, Anthropic, Gemini, Ollama (Local), OpenRouter.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Running Carrier OS Backend (`http://localhost:3000`)

### Installation & Execution

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build
```

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Vanilla CSS + TailwindCSS + Lucide Icons
- **State Management**: TanStack React Query + React Context
- **Websockets**: Socket.io Client
- **HTTP Client**: Axios

---

## 📄 License

MIT License © 2026 Carrier OS Team
