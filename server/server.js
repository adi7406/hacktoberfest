const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();


const apiRouter = require('./routes/api');
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (origin === CLIENT_ORIGIN || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Attach user authentication / demo identity
app.use(authMiddleware);

// Mount API routes
app.use('/api', apiRouter);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested API endpoint was not found.'
    }
  });
});

// Centralized error handler
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`NyayaAccess API running on port ${PORT}`);
    console.log(`Allowed client origin: ${CLIENT_ORIGIN}`);
  });
}

module.exports = app;
