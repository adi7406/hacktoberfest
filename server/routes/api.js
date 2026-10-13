const express = require('express');
const router = express.Router();

const { validateChatRequest } = require('../middleware/validateRequest');
const { handleChat } = require('../controllers/chatController');
const {
  handleCreateConversation,
  handleListConversations,
  handleGetConversation,
  handleDeleteConversation
} = require('../controllers/conversationController');
const { getKnowledgeBaseSummary } = require('../services/legalSearchService');

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max document size
});
const { handleSimplifyDocument } = require('../controllers/documentController');

// GET /api/health
router.get('/health', (req, res) => {
  const kbSummary = getKnowledgeBaseSummary();
  res.status(200).json({
    status: 'ok',
    service: 'nyaya-access-api',
    knowledgeBase: {
      verifiedRecords: kbSummary.totalVerifiedRecords,
      topics: kbSummary.supportedTopics
    }
  });
});

// POST /api/chat
router.post('/chat', validateChatRequest, handleChat);

// POST /api/documents/simplify
router.post('/documents/simplify', upload.single('document'), handleSimplifyDocument);

// Conversation endpoints
router.post('/conversations', handleCreateConversation);
router.get('/conversations', handleListConversations);
router.get('/conversations/:id', handleGetConversation);
router.delete('/conversations/:id', handleDeleteConversation);

module.exports = router;
