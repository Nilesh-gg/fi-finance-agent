const express = require('express');
const { verifyIdToken, saveUserData, getUserData } = require('../config/firebase');
const { authenticateUser } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate user with Firebase ID token
 */
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: 'ID token is required'
      });
    }

    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(idToken);
    
    // Get or create user data
    let userData = await getUserData(decodedToken.uid);
    
    if (!userData) {
      // Create new user
      userData = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: {
          currency: 'INR',
          language: 'en',
          notifications: true
        }
      };
      
      await saveUserData(decodedToken.uid, userData);
      logger.info(`New user created: ${decodedToken.uid}`);
    } else {
      // Update last login
      userData.lastLoginAt = new Date().toISOString();
      await saveUserData(decodedToken.uid, { lastLoginAt: userData.lastLoginAt });
      logger.info(`User logged in: ${decodedToken.uid}`);
    }

    res.json({
      success: true,
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        preferences: userData.preferences
      },
      message: 'Authentication successful'
    });

  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      details: error.message
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (mainly for logging purposes)
 */
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Update last logout time
    await saveUserData(userId, { 
      lastLogoutAt: new Date().toISOString() 
    });
    
    logger.info(`User logged out: ${userId}`);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      details: error.message
    });
  }
});

/**
 * GET /api/auth/profile
 * Get user profile
 */
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userData = await getUserData(userId);
    
    if (!userData) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        preferences: userData.preferences,
        createdAt: userData.createdAt,
        lastLoginAt: userData.lastLoginAt
      }
    });

  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      details: error.message
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, preferences } = req.body;
    
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    
    if (name) updateData.name = name;
    if (preferences) updateData.preferences = preferences;
    
    await saveUserData(userId, updateData);
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: error.message
    });
  }
});

/**
 * POST /api/auth/connect-fi
 * Connect user's Fi account
 */
router.post('/connect-fi', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { fiToken } = req.body;
    
    if (!fiToken) {
      return res.status(400).json({
        error: 'Fi token is required'
      });
    }
    
    // Save Fi token (encrypted in production)
    await saveUserData(userId, {
      fiToken,
      fiConnectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    logger.info(`Fi account connected for user: ${userId}`);
    
    res.json({
      success: true,
      message: 'Fi account connected successfully'
    });

  } catch (error) {
    logger.error('Error connecting Fi account:', error);
    res.status(500).json({
      error: 'Failed to connect Fi account',
      details: error.message
    });
  }
});

/**
 * DELETE /api/auth/disconnect-fi
 * Disconnect user's Fi account
 */
router.delete('/disconnect-fi', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Remove Fi token
    await saveUserData(userId, {
      fiToken: null,
      fiConnectedAt: null,
      fiDisconnectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    logger.info(`Fi account disconnected for user: ${userId}`);
    
    res.json({
      success: true,
      message: 'Fi account disconnected successfully'
    });

  } catch (error) {
    logger.error('Error disconnecting Fi account:', error);
    res.status(500).json({
      error: 'Failed to disconnect Fi account',
      details: error.message
    });
  }
});

module.exports = router;
