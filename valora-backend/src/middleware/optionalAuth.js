const { auth } = require('../config/firebase');

/**
 * Optional authentication middleware
 * Adds user info if token is present, but doesn't block unauthenticated requests
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            try {
                const decodedToken = await auth.verifyIdToken(token);
                req.user = {
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    name: decodedToken.name || decodedToken.email
                };
                console.log(`   ✅ Authenticated user: ${req.user.email}`);
            } catch (verifyError) {
                console.log(`   ⚠️ Invalid token: ${verifyError.message}`);
                // Continue as guest user
            }
        } else {
            console.log('   ℹ️ No authentication token provided - guest mode');
        }
        
        next();
    } catch (error) {
        console.error('Error in optional auth middleware:', error);
        // Don't block the request, continue as guest
        next();
    }
}

module.exports = { optionalAuth };
