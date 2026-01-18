# 🚀 Quick Start - Firebase Integration

## Prerequisites
- ✅ Firebase project created (Phase 1 complete)
- ✅ Authentication enabled
- ✅ Firestore database created
- ✅ Service account key downloaded

## 5-Minute Setup

### 1. Configure Backend Environment

Create `valora-backend/.env`:
```env
GEMINI_API_KEY=your_existing_gemini_key
PORT=5000

# Add these new lines from your Firebase service account JSON:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

### 2. Configure Frontend Environment

Create `valora-frontend/.env`:
```env
# Get these from Firebase Console > Project Settings > Web app config
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 3. Update Firestore Rules

Go to Firebase Console > Firestore > Rules, paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /interviews/{interviewId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **Publish**.

### 4. Install & Run

```bash
# Backend
cd valora-backend
npm install firebase-admin
npm start

# Frontend (new terminal)
cd valora-frontend
npm install firebase recharts @mui/material @mui/icons-material @emotion/react @emotion/styled
npm start
```

### 5. Test It Out

1. Go to `http://localhost:3000`
2. Click **Sign Up** → Create account
3. You'll be redirected to Dashboard
4. Click **Start New Interview**
5. Complete an interview
6. Check Dashboard - interview should appear with analytics!

## 🎯 What You Get

### ✅ For Guest Users (No Login)
- Take interviews immediately
- Get instant reports
- No data saved

### ✅ For Authenticated Users
- **Persistent History**: All interviews saved
- **Analytics Dashboard**: 
  - Total interviews & average score
  - Score trends over time
  - Performance by type/difficulty
  - Strengths & improvement areas
- **Progress Tracking**: See improvement over time

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if .env exists and has correct format
cat valora-backend/.env

# Ensure private key has \n characters
# Should look like: "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

### Frontend build error
```bash
# Reinstall dependencies
cd valora-frontend
rm -rf node_modules package-lock.json
npm install
```

### "Permission denied" in Firestore
- Verify rules are published
- Check user is logged in
- Inspect browser console for auth errors

### Charts not showing
- Complete at least 2 interviews
- Refresh dashboard page
- Check browser console for errors

## 📚 Full Documentation

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Detailed setup guide
- [FIREBASE_IMPLEMENTATION.md](./FIREBASE_IMPLEMENTATION.md) - Technical details
- [README.md](../README.md) - Project overview

## 🎉 Next Steps

1. ✅ Test signup/login
2. ✅ Complete a few interviews
3. ✅ Explore Dashboard analytics
4. 🚀 Deploy to production (update env vars with production Firebase config)

---

**Need Help?** Check the detailed guides above or open an issue on GitHub.
