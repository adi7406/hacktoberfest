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

// Conversation endpoints
router.post('/conversations', handleCreateConversation);
router.get('/conversations', handleListConversations);
router.get('/conversations/:id', handleGetConversation);
router.delete('/conversations/:id', handleDeleteConversation);

module.exports = router;
