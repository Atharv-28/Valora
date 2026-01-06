# Valora Backend

Backend server for Valora AI Interview Platform powered by Google Gemini.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

3. Get your Gemini API key from: https://makersuite.google.com/app/apikey

4. Start the server:
```bash
npm run dev
```

## Project Structure

```
valora-backend/
├── src/
│   ├── server.js              # Main server file
│   ├── controllers/           # Request handlers
│   │   └── interviewController.js
│   ├── routes/                # API routes
│   │   └── interviewRoutes.js
│   └── services/              # Business logic
│       ├── geminiService.js   # Gemini AI integration
│       └── resumeService.js   # Resume parsing
├── uploads/                   # Uploaded resumes (auto-created)
├── .env                      # Environment variables
├── .env.example              # Example env file
└── package.json
```

## API Endpoints

### POST /api/interview/init
Initialize a new interview session
- Body: FormData with `resume` (PDF), `jobDescription`, `jobPosition`, `interviewType`
- Returns: `sessionId` and first interview question

### POST /api/interview/message
Send a message in an active interview
- Body: `{ sessionId, message, context }`
- Returns: AI interviewer response

### POST /api/interview/end
End an interview session
- Body: `{ sessionId }`
- Returns: Session statistics

### GET /api/interview/status
Get server status
- Returns: Active session count

### GET /health
Health check endpoint
