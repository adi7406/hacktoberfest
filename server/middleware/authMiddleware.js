function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // When Supabase token is passed, attach user identity
    // If JWT decoding/verification is needed with Supabase client:
    req.user = { id: token.slice(0, 36) || 'auth-user', token };
  } else {
    // Graceful fallback for hackathon MVP demo mode
    req.user = { id: 'demo-user', isDemo: true };
  }

  next();
}

module.exports = authMiddleware;
