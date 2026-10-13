const {
  createConversation,
  listConversations,
  getConversation,
  deleteConversation
} = require('../services/conversationService');

async function handleCreateConversation(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user';
    const { title } = req.body || {};
    const conv = await createConversation({
      userId,
      title: title || 'New conversation'
    });
    res.status(201).json(conv);
  } catch (err) {
    next(err);
  }
}

async function handleListConversations(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user';
    const list = await listConversations({ userId });
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
}

async function handleGetConversation(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user';
    const { id } = req.params;
    const conv = await getConversation({ id, userId });
    if (!conv) {
      return res.status(404).json({
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'The requested conversation was not found.'
        }
      });
    }
    res.status(200).json(conv);
  } catch (err) {
    next(err);
  }
}

async function handleDeleteConversation(req, res, next) {
  try {
    const userId = req.user?.id || 'demo-user';
    const { id } = req.params;
    const deleted = await deleteConversation({ id, userId });
    if (!deleted) {
      return res.status(404).json({
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'The requested conversation was not found.'
        }
      });
    }
    res.status(200).json({ success: true, message: 'Conversation deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleCreateConversation,
  handleListConversations,
  handleGetConversation,
  handleDeleteConversation
};
