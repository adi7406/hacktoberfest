const SUPPORTED_CATEGORIES = new Set([
  'unpaid_wages',
  'rental_dispute',
  'consumer_complaint',
  'banking_payment',
  'ecommerce',
  'family_maintenance',
  'cybercrime',
  'government_grievance'
]);

const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH, 10) || 2000;

function validateChatRequest(req, res, next) {
  const { message, category } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Please enter a message and try again.'
      }
    });
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Message cannot be empty.'
      }
    });
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return res.status(413).json({
      error: {
        code: 'MESSAGE_TOO_LONG',
        message: `Message exceeds maximum allowed length of ${MAX_MESSAGE_LENGTH} characters.`
      }
    });
  }

  req.body.message = trimmed;

  if (category) {
    const normCategory = category.trim().toLowerCase();
    if (SUPPORTED_CATEGORIES.has(normCategory)) {
      req.body.category = normCategory;
    } else {
      // Unrecognized category is ignored or defaulted to null per spec
      req.body.category = null;
    }
  } else {
    req.body.category = null;
  }

  next();
}

module.exports = {
  validateChatRequest,
  SUPPORTED_CATEGORIES,
  MAX_MESSAGE_LENGTH
};
