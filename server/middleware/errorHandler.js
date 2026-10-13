function errorHandler(err, req, res, next) {
  console.error('API Error:', err.message || err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const errorMessage = err.isPublic
    ? err.message
    : (statusCode === 500 ? 'An unexpected error occurred. Please try again.' : err.message);

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: errorMessage
    }
  });
}

module.exports = errorHandler;
