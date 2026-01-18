# Valora — AI Mock Interview Platform

Valora is a mock interview platform powered by Google AI. It transforms your PDF Resume and Job Description into a live, vocal technical or HR-style interview. Valora now includes Firebase authentication and persistent storage, allowing users to track their interview history and view detailed analytics on their dashboard.

> Current implementation includes AI-driven interview flow (resume parsing + Gemini 2.5 Flash conversational interview), browser-based speech features, Firebase authentication, and analytics dashboard. Computer vision features are on the roadmap.

## Features

- **AI Interviewer**: Generates tailored questions from your resume and job description using Google Gemini 2.5 Flash
- **Resume Parsing**: Extracts text and key info from uploaded PDF resumes
- **Voice Interaction**: Speak answers; AI responds with concise follow-up questions
- **Interview Types**: Technical, HR, or Hybrid interviews with adjustable difficulty (Easy, Medium, Hard)
- **Time Limits**: Choose from 5, 10, 15, 30, or 45-minute interview sessions
- **Comprehensive Reports**: AI-generated evaluation with scores, strengths, and improvement areas
- **🔥 Firebase Authentication**: Sign up, log in, and secure your interview data
- **🔥 Persistent Storage**: All interviews saved to Firestore for authenticated users
- **🔥 Analytics Dashboard**: View your interview history, score trends, and performance metrics
- **Guest Mode**: Try interviews without creating an account (data not saved)

## Tech Stack

- **Backend**: Node.js, Express, Multer, pdf-parse, Firebase Admin SDK
- **AI**: @google/generative-ai (Gemini 2.5 Flash)
- **Frontend**: React (CRA), React Router, Material-UI, Recharts
- **Speech**: Web Speech API (Recognition) + Web Speech Synthesis
- **Database**: Firestore (Cloud Firestore)
- **Authentication**: Firebase Authentication
- **Vision** (Planned): Google Cloud Vision API

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
- 🔥 Firebase project with Authentication and Firestore enabled
- Optional (Roadmap): Google Cloud Vision API for behavioral analysis

### Quick Setup

**For detailed Firebase setup instructions, see [Docs/FIREBASE_SETUP.md](Docs/FIREBASE_SETUP.md) or [Docs/QUICK_START.md](Docs/QUICK_START.md)**

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

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"
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

2) Configure environment variables

Create `.env` in `valora-frontend`:

```env
REACT_APP_API_URL=http://localhost:5000

# Firebase Client SDK
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
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
- Visit the app at `http://localhost:3000`
- **Guest Mode**: Start interview immediately without login
- **Authenticated Mode**: Sign up/login to save history and view analytics

## API Reference

Base URL: `http://localhost:5000`

### Interview Endpoints (Public - work for both guest and authenticated users)

- POST `/api/interview/init`
  - FormData: `resume` (PDF), `jobDescription`, `jobPosition`, `interviewType`, `timeLimit`, `difficulty`
  - Returns: `{ success, sessionId, message, resumeInfo }`

- POST `/api/interview/message`
  - Body: `{ sessionId, message, timeRemaining }`
  - Returns: `{ success, message }`

- POST `/api/interview/end`
  - Body: `{ sessionId }`
  - Returns: `{ success, message, sessionInfo }`

- GET `/api/interview/report/:sessionId`
  - Returns: `{ success, report }` (auto-saves to Firestore if user is authenticated)

- GET `/api/interview/status`
  - Returns: `{ success, activeSessions }`

### User Endpoints (Protected - require authentication)

- GET `/api/user/interviews`
  - Headers: `Authorization: Bearer <firebase-id-token>`
  - Returns: `{ success, count, interviews }`

- GET `/api/user/interviews/:interviewId`
  - Headers: `Authorization: Bearer <firebase-id-token>`
  - Returns: `{ success, interview }`

- GET `/api/user/analytics`
  - Headers: `Authorization: Bearer <firebase-id-token>`
  - Returns: `{ success, analytics }` (total, averageScore, scoresByType, scoresByDifficulty, recentTrend, topSkills, areasToImprove)

- POST `/api/user/profile`
  - Headers: `Authorization: Bearer <firebase-id-token>`
  - Body: `{ name, email }`
  - Returns: `{ success, message }`

### Health Check

- GET `/health`
  - Returns: server status and Gemini configuration flag

Implementation references:
- Interview Router: [valora-backend/src/routes/interviewRoutes.js](valora-backend/src/routes/interviewRoutes.js)
- User Router: [valora-backend/src/routes/userRoutes.js](valora-backend/src/routes/userRoutes.js)
- Controller: [valora-backend/src/controllers/interviewController.js](valora-backend/src/controllers/interviewController.js)
- Gemini Service: [valora-backend/src/services/geminiService.js](valora-backend/src/services/geminiService.js)
- Firestore Service: [valora-backend/src/services/firestoreService.js](valora-backend/src/services/firestoreService.js)
- Resume Parsing: [valora-backend/src/services/resumeService.js](valora-backend/src/services/resumeService.js)
- Report Generation: [valora-backend/src/services/reportService.js](valora-backend/src/services/reportService.js)

## Frontend Usage

- Home/Landing: [valora-frontend/src/pages/home.js](valora-frontend/src/pages/home.js)
- Interview Setup: [valora-frontend/src/pages/startInterview.js](valora-frontend/src/pages/startInterview.js)
- Interview Session: [valora-frontend/src/pages/interview.js](valora-frontend/src/pages/interview.js)
- 🔥 Dashboard: [valora-frontend/src/pages/dashboard.js](valora-frontend/src/pages/dashboard.js)
- 🔥 Login/Signup: [valora-frontend/src/pages/login.js](valora-frontend/src/pages/login.js), [valora-frontend/src/pages/signup.js](valora-frontend/src/pages/signup.js)
- API Client: [valora-frontend/src/services/interviewApi.js](valora-frontend/src/services/interviewApi.js)
- 🔥 User API Client: [valora-frontend/src/services/userApi.js](valora-frontend/src/services/userApi.js)
- Speech-to-Text: Browser Web Speech API — [valora-frontend/src/services/speechToText.js](valora-frontend/src/services/speechToText.js)
- Text-to-Speech: Web Speech Synthesis — [valora-frontend/src/services/textToSpeech.js](valora-frontend/src/services/textToSpeech.js)
- 🔥 Auth Context: [valora-frontend/src/contexts/AuthContext.js](valora-frontend/src/contexts/AuthContext.js)

## Environment Variables

- Backend (`valora-backend/.env`):
  - `PORT`: default `5000`
  - `GEMINI_API_KEY`: API key from Google AI Studio
  - `NODE_ENV`: `development` or `production`
  - 🔥 `FIREBASE_PROJECT_ID`: Firebase project ID
  - 🔥 `FIREBASE_CLIENT_EMAIL`: Service account email
  - 🔥 `FIREBASE_PRIVATE_KEY`: Service account private key

- Frontend (`valora-frontend/.env`):
  - `REACT_APP_API_URL`: backend base URL (e.g., `http://localhost:5000`)
  - 🔥 `REACT_APP_FIREBASE_API_KEY`: Firebase web API key
  - 🔥 `REACT_APP_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
  - 🔥 `REACT_APP_FIREBASE_PROJECT_ID`: Firebase project ID
  - 🔥 `REACT_APP_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
  - 🔥 `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
  - 🔥 `REACT_APP_FIREBASE_APP_ID`: Firebase app ID

See [.env.example](./.env.example) files in each directory for templates.

## Documentation

- 📚 [FIREBASE_SETUP.md](Docs/FIREBASE_SETUP.md) - Detailed Firebase setup guide
- 🚀 [QUICK_START.md](Docs/QUICK_START.md) - 5-minute Firebase setup
- 📋 [FIREBASE_IMPLEMENTATION.md](Docs/FIREBASE_IMPLEMENTATION.md) - Technical implementation details
- 📖 [SETUP.md](SETUP.md) - General setup instructions
- 🏗️ [Architecture Diagram](Docs/architecture-diagram.md) - System architecture

## Roadmap

- ✅ ~~Integrate Firebase Authentication~~
- ✅ ~~Persist sessions in Firestore~~
- ✅ ~~Build user dashboard with historical stats and analytics~~
- 🔜 Google Cloud Speech-to-Text and Text-to-Speech for higher fidelity voice features
- 🔜 Google Cloud Vision API for facial expression and confidence analysis
- 🔜 Export interview reports as PDF
- 🔜 Email notifications
- 🔜 Improve resume parsing via NLP for richer candidate profiling

## Credits

External services and libraries used:
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
