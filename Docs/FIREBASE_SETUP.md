# 🔥 Firebase Integration Setup Guide

This guide will help you set up Firebase for user authentication and interview persistence in Valora.

## 📋 Prerequisites

- Firebase account (free tier is sufficient)
- Node.js and npm installed
- Valora backend and frontend projects

## 🚀 Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name (e.g., "valora-interviews")
4. Disable Google Analytics (optional)
5. Click **Create Project**

### 2. Enable Firebase Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **Get Started**
3. Click **Email/Password** under Sign-in providers
4. Enable **Email/Password**
5. Click **Save**

### 3. Create Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click **Create Database**
3. Choose **Start in production mode**
4. Select a location close to your users
5. Click **Enable**

### 4. Update Firestore Security Rules

1. Go to **Firestore Database → Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Interviews collection - users can only access their own interviews
    match /interviews/{interviewId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **Publish**

### 5. Get Frontend Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon (</>)
4. Register app with nickname (e.g., "valora-frontend")
5. Copy the `firebaseConfig` object

### 6. Configure Frontend

1. Create `.env` file in `valora-frontend` directory:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 7. Generate Service Account for Backend

1. In Firebase Console, go to **Project Settings → Service Accounts**
2. Click **Generate New Private Key**
3. Click **Generate Key** - a JSON file will be downloaded

### 8. Configure Backend

1. Open the downloaded JSON file
2. Create `.env` file in `valora-backend` directory:

```env
# Existing Gemini API key
GEMINI_API_KEY=your_existing_gemini_key
PORT=5000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important:** Keep the private key in quotes and preserve the `\n` characters

### 9. Install Dependencies

```bash
# Backend (if not already installed)
cd valora-backend
npm install firebase-admin

# Frontend (if not already installed)
cd valora-frontend
npm install firebase recharts @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### 10. Start the Application

```bash
# Terminal 1 - Backend
cd valora-backend
npm start

# Terminal 2 - Frontend
cd valora-frontend
npm start
```

## ✅ Testing the Integration

### Test Authentication

1. Go to `http://localhost:3000`
2. Click **Sign Up**
3. Create a new account with email/password
4. You should be redirected to the Dashboard
5. Check Firebase Console → Authentication - you should see your user

### Test Interview Persistence

1. From Dashboard, click **Start New Interview**
2. Complete an interview
3. View the report
4. Go back to Dashboard - the interview should appear in your history
5. Check Firebase Console → Firestore Database - you should see:
   - `users` collection with your user document
   - `interviews` collection with your interview document

### Test Analytics

1. Complete 2-3 interviews with different:
   - Interview types (Technical, HR, Hybrid)
   - Difficulty levels (Easy, Medium, Hard)
2. Go to Dashboard
3. You should see:
   - Total interviews count
   - Average score
   - Score trend line chart
   - Scores by type pie chart
   - Scores by difficulty bar chart
   - Top skills and areas to improve

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env` files private and never commit them to Git
- Use environment variables for all sensitive data
- Rotate service account keys periodically
- Use Firestore security rules to protect user data

### ❌ DON'T:
- Hardcode API keys or secrets in code
- Share service account JSON files
- Commit `.env` files to version control
- Use production keys in development

## 🎭 Guest Mode vs Authenticated Mode

### Guest Mode (No Login)
- Can take interviews
- Reports shown immediately
- No history saved
- No analytics available

### Authenticated Mode (Logged In)
- Can take interviews
- Reports shown immediately
- Interview history saved to Firestore
- Analytics dashboard with graphs
- Track progress over time

## 🐛 Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that `REACT_APP_FIREBASE_API_KEY` is correct
- Ensure API key is enabled in Firebase Console

### "Permission denied" in Firestore
- Verify Firestore security rules are published
- Check that user is authenticated before accessing data

### "Default app already exists"
- Firebase is initialized multiple times
- Check that `firebase.js` is only imported once

### Backend can't connect to Firebase
- Verify `FIREBASE_PRIVATE_KEY` has proper newlines (`\n`)
- Ensure private key is wrapped in double quotes
- Check that service account has necessary permissions

### Charts not displaying
- Ensure you have completed at least 1-2 interviews
- Check browser console for errors
- Verify `recharts` is installed

## 📚 API Endpoints

### Protected Endpoints (Require Authentication)
```
GET  /api/user/interviews          - Get all user interviews
GET  /api/user/interviews/:id      - Get specific interview
GET  /api/user/analytics           - Get user analytics
POST /api/user/interviews          - Save interview
POST /api/user/profile             - Update user profile
```

### Public Endpoints (Work for both authenticated and guest users)
```
POST /api/interview/init           - Initialize interview
POST /api/interview/message        - Send message
POST /api/interview/end            - End interview
GET  /api/interview/report/:id     - Get report (auto-saves if authenticated)
```

## 🎨 Dashboard Features

### Statistics Cards
- 🎯 Total Interviews - Count of all completed interviews
- ⭐ Average Score - Overall average across all interviews
- 💪 Top Skills - Most frequently mentioned strengths
- 📈 Recent Trend - Whether scores are improving or declining

### Charts
- **Score Trend** - Line chart showing score progression over time
- **Scores by Type** - Pie chart comparing Technical vs HR vs Hybrid
- **Scores by Difficulty** - Bar chart showing performance by difficulty level

### Skills Analysis
- **Top Strengths** - Top 5 skills identified across all interviews
- **Areas to Improve** - Top 5 weaknesses to work on

### Interview History Table
- Date, Position, Type, Difficulty, Score
- Click "View Report" to see full detailed report

## 🔄 Data Flow

1. User signs up/logs in → Firebase Authentication
2. User takes interview → In-memory session (backend)
3. Interview completes → Report generated
4. Backend checks if user authenticated → Saves to Firestore
5. Dashboard loads → Fetches interviews + analytics from Firestore
6. Charts render → Uses Recharts library

## 📝 Collections Structure

### `users` Collection
```javascript
{
  userId: "firebase-uid",
  email: "user@example.com",
  name: "User Name",
  createdAt: timestamp,
  lastLoginAt: timestamp
}
```

### `interviews` Collection
```javascript
{
  id: "auto-generated-id",
  userId: "firebase-uid",
  sessionId: "uuid",
  jobPosition: "Software Engineer",
  interviewType: "technical",
  difficulty: "medium",
  timeLimit: "15",
  duration: "14:32",
  report: {
    overallScore: 8.5,
    technicalScore: 9,
    communicationScore: 8,
    questionAnalysis: [...],
    strengths: [...],
    improvements: [...]
  },
  transcript: [...],
  createdAt: timestamp
}
```

## 🎯 Next Steps

1. Test authentication flow
2. Complete a few interviews while logged in
3. Check Dashboard analytics
4. Verify Firestore data in Firebase Console
5. Customize Firestore security rules if needed
6. Deploy to production (update env variables)

## 💡 Tips

- Use different accounts to test multi-user scenarios
- Complete interviews with varying scores to see charts populate
- Guest mode is perfect for quick demos
- Authenticated mode is for users who want to track progress
- Analytics become more meaningful with 5+ interviews

---

**Need Help?** Check the main [SETUP.md](../SETUP.md) for general setup instructions.
