const { verifyIdToken } = require('../config/firebase');
const { logger } = require('../utils/logger');

/**
 * Middleware to authenticate user using Firebase ID token
 */
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No authorization token provided',
        message: 'Please provide a valid Bearer token'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({
        error: 'Invalid authorization format',
        message: 'Token must be in format: Bearer <token>'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(idToken);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      email_verified: decodedToken.email_verified,
      firebase: decodedToken
    };

    next();

  } catch (error) {
    logger.error('Authentication middleware error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please refresh your authentication token'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Token revoked',
        message: 'Your session has been revoked. Please log in again'
      });
    }
    
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message || 'Invalid or expired token'
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
async function optionalAuthentication(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, but continue without authentication
      req.user = null;
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      req.user = null;
      return next();
    }

    // Try to verify the token
    const decodedToken = await verifyIdToken(idToken);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      email_verified: decodedToken.email_verified,
      firebase: decodedToken
    };

    next();

  } catch (error) {
    logger.warn('Optional authentication failed:', error);
    req.user = null;
    next();
  }
}

/**
 * Middleware to check if user has required permissions
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    // Check if user has the required permission
    // This would be extended based on your permission system
    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      error: 'Insufficient permissions',
      message: `You don't have permission to ${permission}`
    });
  };
}

/**
 * Middleware to check if user's email is verified
 */
function requireEmailVerification(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      error: 'Email verification required',
      message: 'Please verify your email address to access this feature'
    });
  }

  next();
}

module.exports = {
  authenticateUser,
  optionalAuthentication,
  requirePermission,
  requireEmailVerification
};
