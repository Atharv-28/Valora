# Valora - Complete Setup Guide

## Backend Setup

### 1. Install Backend Dependencies
```bash
cd valora-backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `valora-backend` directory:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key
NODE_ENV=development
```

**Get your Gemini API key:** https://makersuite.google.com/app/apikey

### 3. Start Backend Server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

---

## Frontend Setup

### 1. Install Frontend Dependencies (if needed)
```bash
cd valora-frontend
npm install
```

### 2. Configure API URL (Optional)
Create or update `.env` in `valora-frontend`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Start Frontend
```bash
npm start
```

The app will run on `http://localhost:3000`

---

## Testing the Interview Flow

1. **Start Interview**: Click "Start mock interview" on home page
2. **Fill Form**: 
   - Upload your resume (PDF)
   - Paste job description
   - Select position level (Intern/Junior/Senior)
   - Select interview type (Technical/HR)
3. **Grant Permissions**: Accept camera/microphone access
4. **Interview**: 
   - Click "Start Speaking" to begin
   - Speak your answers naturally
   - AI will respond via voice
   - Transcript shows conversation history
5. **End Interview**: Click the red phone icon

---

## Browser Compatibility

- **Chrome/Edge**: ✅ Full support (recommended)
- **Firefox**: ⚠️ Limited speech recognition support
- **Safari**: ⚠️ May need webkit prefixes

---

## Troubleshooting

### Backend Issues:
- **"GEMINI_API_KEY is not set"**: Add API key to `.env` file
- **Port 5000 in use**: Change `PORT` in `.env`
- **PDF parsing errors**: Ensure `pdf-parse` is installed

### Frontend Issues:
- **Speech recognition not working**: Use Chrome/Edge browser
- **API connection failed**: Check backend is running on correct port
- **Camera/mic not working**: Grant browser permissions

---

## Project Structure

```
valora-backend/
├── src/
│   ├── server.js                    # Main server
│   ├── controllers/
│   │   └── interviewController.js   # Request handlers
│   ├── routes/
│   │   └── interviewRoutes.js       # API endpoints
│   └── services/
│       ├── geminiService.js         # Gemini AI integration
│       └── resumeService.js         # PDF parsing
├── uploads/                         # Resume storage
└── .env                            # Environment variables

valora-frontend/
├── src/
│   ├── pages/
│   │   ├── interview.js            # Interview UI
│   │   ├── startInterview.js       # Setup form
│   │   └── home.js                 # Landing page
│   └── services/
│       ├── speechToText.js         # Speech recognition
│       ├── textToSpeech.js         # Voice synthesis
│       └── interviewApi.js         # API client
```

---

## API Endpoints

- `POST /api/interview/init` - Start interview session
- `POST /api/interview/message` - Send user message
- `POST /api/interview/end` - End session
- `GET /api/interview/status` - Check server status
- `GET /health` - Health check
