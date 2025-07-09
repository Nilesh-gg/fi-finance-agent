const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');
const { logger } = require('../utils/logger');

let firestore;
let auth;

/**
 * Initialize Firebase Admin SDK
 */
async function initializeFirebase() {
  try {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
        ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
        : {
            project_id: process.env.FIREBASE_PROJECT_ID,
            // Add other service account details as needed
          };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }

    // Initialize Firestore
    firestore = new Firestore({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    // Initialize Auth
    auth = admin.auth();

    logger.info('Firebase services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

/**
 * Get Firestore instance
 */
function getFirestore() {
  if (!firestore) {
    throw new Error('Firestore not initialized. Call initializeFirebase() first.');
  }
  return firestore;
}

/**
 * Get Firebase Auth instance
 */
function getAuth() {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Call initializeFirebase() first.');
  }
  return auth;
}

/**
 * Verify Firebase ID token
 */
async function verifyIdToken(idToken) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Save user data to Firestore
 */
async function saveUserData(userId, userData) {
  try {
    const userRef = firestore.collection('users').doc(userId);
    await userRef.set(userData, { merge: true });
    logger.info(`User data saved for user: ${userId}`);
  } catch (error) {
    logger.error('Failed to save user data:', error);
    throw error;
  }
}

/**
 * Get user data from Firestore
 */
async function getUserData(userId) {
  try {
    const userRef = firestore.collection('users').doc(userId);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    return doc.data();
  } catch (error) {
    logger.error('Failed to get user data:', error);
    throw error;
  }
}

/**
 * Save financial insight to Firestore
 */
async function saveInsight(userId, insight) {
  try {
    const insightsRef = firestore.collection('insights');
    const docRef = await insightsRef.add({
      userId,
      ...insight,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    logger.info(`Insight saved with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logger.error('Failed to save insight:', error);
    throw error;
  }
}

/**
 * Get user insights from Firestore
 */
async function getUserInsights(userId, limit = 50) {
  try {
    const insightsRef = firestore.collection('insights')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);
    
    const snapshot = await insightsRef.get();
    const insights = [];
    
    snapshot.forEach(doc => {
      insights.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return insights;
  } catch (error) {
    logger.error('Failed to get user insights:', error);
    throw error;
  }
}

/**
 * Save conversation to Firestore
 */
async function saveConversation(userId, conversation) {
  try {
    const conversationsRef = firestore.collection('conversations');
    const docRef = await conversationsRef.add({
      userId,
      ...conversation,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    logger.info(`Conversation saved with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logger.error('Failed to save conversation:', error);
    throw error;
  }
}

/**
 * Get user conversations from Firestore
 */
async function getUserConversations(userId, limit = 20) {
  try {
    const conversationsRef = firestore.collection('conversations')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);
    
    const snapshot = await conversationsRef.get();
    const conversations = [];
    
    snapshot.forEach(doc => {
      conversations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return conversations;
  } catch (error) {
    logger.error('Failed to get user conversations:', error);
    throw error;
  }
}

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  verifyIdToken,
  saveUserData,
  getUserData,
  saveInsight,
  getUserInsights,
  saveConversation,
  getUserConversations
};
