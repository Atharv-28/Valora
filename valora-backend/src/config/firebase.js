const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn('⚠️ Firebase credentials not configured in .env');
} else {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
        
        console.log('✅ Firebase Admin initialized');
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error.message);
    }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
