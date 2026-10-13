const { retrieveSources } = require('../services/legalSearchService');
const { generateLegalResponse } = require('../services/llmService');
const {
  createConversation,
  getConversation,
  addMessage
} = require('../services/conversationService');

async function handleChat(req, res, next) {
  try {
    const { conversationId, message, category } = req.body;
    const userId = req.user?.id || 'demo-user';

    // 1. Resolve or establish conversation
    let currentConversationId = conversationId;
    if (currentConversationId) {
      const existing = await getConversation({ id: currentConversationId, userId });
      if (!existing) {
        // If specified conversation does not exist, initialize a new one per contract
        const newConv = await createConversation({
          userId,
          title: message.slice(0, 40) + (message.length > 40 ? '...' : '')
        });
        currentConversationId = newConv.id;
      }
    } else {
      const newConv = await createConversation({
        userId,
        title: message.slice(0, 40) + (message.length > 40 ? '...' : '')
      });
      currentConversationId = newConv.id;
    }

    // 2. Persist user message
    await addMessage({
      conversationId: currentConversationId,
      role: 'user',
      content: message,
      kind: 'user_prompt',
      sources: []
    });

    // 3. Retrieval phase: Fetch verified legal evidence
    const retrievedSources = retrieveSources({
      query: message,
      category,
      limit: 3
    });

    // 4. Generation phase: Grounded response with citation enforcement
    const aiResponse = await generateLegalResponse({
      query: message,
      retrievedSources
    });

    // 5. Persist assistant message
    const savedAssistantMsg = await addMessage({
      conversationId: currentConversationId,
      role: 'assistant',
      content: aiResponse.message.content,
      kind: aiResponse.message.kind,
      sources: aiResponse.sources
    });

    // 6. Return response conforming to API_SPECIFICATION.md
    return res.status(200).json({
      conversationId: currentConversationId,
      message: {
        id: savedAssistantMsg.id,
        role: savedAssistantMsg.role,
        content: savedAssistantMsg.content,
        kind: savedAssistantMsg.kind,
        createdAt: savedAssistantMsg.created_at
      },
      sources: aiResponse.sources,
      needsClarification: aiResponse.needsClarification,
      disclaimer: aiResponse.disclaimer
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleChat
};
