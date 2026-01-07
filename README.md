# Valora — AI Mock Interview Platform

Valora is a mock interview platform powered by Google AI. It transforms your PDF Resume and Job Description into a live, vocal technical or HR-style interview. Alongside conversation quality, Valora aims to analyze tone, facial expressions, and confidence to deliver a comprehensive final report with a score and a dashboard of historical performance.

> Current implementation focuses on AI-driven interview flow (resume parsing + Gemini 2.5 Flash conversational interview) and browser-based speech features. Computer vision and Firebase features are on the roadmap.

## Features

- AI Interviewer: Generates tailored questions from your resume and job description using Google Gemini 2.5 Flash.
- Resume Parsing: Extracts text and key info from uploaded PDF resumes.
- Voice Interaction: Speak answers; AI responds with concise follow-up questions.
- Session Tracking: Start, message, and end interview with session stats.
- Dashboard (Planned): Historical attempt statistics and insights.
- Behavior Analysis (Planned): Tone, facial expressions, and confidence scoring via Vision AI.

## Tech Stack

- Backend: Node.js, Express, Multer, pdf-parse
- AI: @google/generative-ai (Gemini 2.5 Flash)
- Frontend: React (CRA), React Router, MUI
- Speech (Current): Web Speech API (Recognition) + Web Speech Synthesis
- Data (Planned): Firebase (Firestore)
- Vision (Planned): Google Cloud Vision API

## Architecture

- System overview and diagrams:
  - See [Docs/architecture-diagram.md](Docs/architecture-diagram.md)
  - Source diagrams: [Docs/architecture.drawio](Docs/architecture.drawio) and [Docs/Use-case-diagram.drawio](Docs/Use-case-diagram.drawio)

## Project Structure

```
Valora/
├── SETUP.md
├── Docs/
│   ├── architecture-diagram.md
│   ├── architecture.drawio
│   └── Use-case-diagram.drawio
├── valora-backend/
│   ├── package.json
│   ├── README.md
│   ├── src/
│   │   ├── server.js
│   │   ├── controllers/
│   │   │   └── interviewController.js
│   │   ├── routes/
│   │   │   └── interviewRoutes.js
│   │   └── services/
│   │       ├── geminiService.js
│   │       └── resumeService.js
│   └── uploads/
└── valora-frontend/
    ├── package.json
    ├── README.md
    └── src/
        ├── pages/
        ├── components/
        └── services/
```

## Setup

### Prerequisites
- Node.js 18+ and npm
- A Google AI/Gemini API key (via Google AI Studio)
- Optional (Roadmap): Google Cloud project + service account for Speech-to-Text, Text-to-Speech, and Vision APIs; Firebase project for persistence

### Backend

1) Install dependencies

```bash
cd valora-backend
npm install
```

2) Configure environment variables

Create `.env` in `valora-backend`:

```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key
NODE_ENV=development
```

3) Start the server

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### Frontend

1) Install dependencies

```bash
cd valora-frontend
npm install
```

2) Configure API URL (optional)

Create or update `.env` in `valora-frontend`:

```env
REACT_APP_API_URL=http://localhost:5000
```

3) Start the app

```bash
npm start
```

Frontend runs at `http://localhost:3000`.

## Running Locally

- Use two terminals (or run one after the other):
  - Terminal A: start backend in `valora-backend`
  - Terminal B: start frontend in `valora-frontend`
- Visit the app at `http://localhost:3000` and start a mock interview.

## API Reference

Base URL: `http://localhost:5000`

- POST `/api/interview/init`
  - FormData: `resume` (PDF), `jobDescription` (string), `jobPosition` (string), `interviewType` (string)
  - Returns: `{ success, sessionId, message, resumeInfo }`

- POST `/api/interview/message`
  - Body: `{ sessionId, message, context }`
  - Returns: `{ success, message }`

- POST `/api/interview/end`
  - Body: `{ sessionId }`
  - Returns: `{ success, message, sessionInfo }`

- GET `/api/interview/status`
  - Returns: `{ success, activeSessions }`

- GET `/health`
  - Returns: server status and Gemini configuration flag

Implementation references:
- Router: [valora-backend/src/routes/interviewRoutes.js](valora-backend/src/routes/interviewRoutes.js)
- Controller: [valora-backend/src/controllers/interviewController.js](valora-backend/src/controllers/interviewController.js)
- Gemini integration: [valora-backend/src/services/geminiService.js](valora-backend/src/services/geminiService.js)
- Resume parsing: [valora-backend/src/services/resumeService.js](valora-backend/src/services/resumeService.js)

## Frontend Usage

- API client: [valora-frontend/src/services/interviewApi.js](valora-frontend/src/services/interviewApi.js)
- Speech-to-Text (current): Browser Web Speech API — [valora-frontend/src/services/speechToText.js](valora-frontend/src/services/speechToText.js)
- Text-to-Speech (current): Web Speech Synthesis — [valora-frontend/src/services/textToSpeech.js](valora-frontend/src/services/textToSpeech.js)

## Environment Variables

- Backend (`valora-backend/.env`):
  - `PORT`: default `5000`
  - `GEMINI_API_KEY`: API key from Google AI Studio
  - `NODE_ENV`: `development` or `production`

- Frontend (`valora-frontend/.env`):
  - `REACT_APP_API_URL`: backend base URL (e.g., `http://localhost:5000`)

- Roadmap (for future cloud integrations):
  - `GOOGLE_APPLICATION_CREDENTIALS`: path to service account JSON (Windows example: `C:\path\to\key.json`)
  - Firebase config keys: `REACT_APP_FIREBASE_API_KEY`, etc.

## Roadmap

- Integrate Google Cloud Speech-to-Text and Text-to-Speech for higher fidelity voice features
- Add Google Cloud Vision API for facial expression and confidence analysis
- Persist sessions and analytics in Firebase (Firestore)
- Build user dashboard with historical stats and final reports
- Improve resume parsing via NLP for richer candidate profiling

## Credits

External services and libraries used or planned:
- Google Generative AI (Gemini 2.5 Flash): https://ai.google.dev
- Google AI Studio (API keys): https://makersuite.google.com
- Web Speech API (Recognition): https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Web Speech Synthesis: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- Express: https://expressjs.com/
- Multer: https://github.com/expressjs/multer
- pdf-parse: https://www.npmjs.com/package/pdf-parse
- React & CRA: https://react.dev/ and https://create-react-app.dev/
- MUI: https://mui.com/
- React Router: https://reactrouter.com/
- Planned: Google Cloud Speech-to-Text, Text-to-Speech, Vision AI, Firebase

Please ensure you comply with terms of use for all external services.

## Security & Privacy

- Do not commit `.env` or credentials to source control.
- For cloud APIs (roadmap), use service accounts and store keys securely.
- Uploaded resumes are stored in `valora-backend/uploads/` on the server; secure and manage retention as needed.

## Contributing

- Fork and create a feature branch.
- Keep changes focused and documented.
- Open a PR describing the feature and testing steps.

## License

This project’s license is not specified. Add a LICENSE if required for distribution.
