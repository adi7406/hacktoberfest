const crypto = require('crypto');

// In-memory store for demo mode
const memoryConversations = new Map();
const memoryMessages = new Map();

function generateUuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      supabaseClient = createClient(url, key);
      return supabaseClient;
    } catch (err) {
      console.warn('Supabase client initialization skipped:', err.message);
    }
  }
  return null;
}

async function createConversation({ userId = 'demo-user', title = 'New conversation' }) {
  const sb = getSupabaseClient();
  const id = generateUuid();
  const now = new Date().toISOString();

  if (sb && userId !== 'demo-user') {
    try {
      const { data, error } = await sb
        .from('conversations')
        .insert([{ id, user_id: userId, title: title.slice(0, 120), created_at: now, updated_at: now }])
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase createConversation failed, falling back to memory:', e.message);
    }
  }

  const conversation = {
    id,
    user_id: userId,
    title: title.slice(0, 120),
    created_at: now,
    updated_at: now
  };
  memoryConversations.set(id, conversation);
  memoryMessages.set(id, []);
  return conversation;
}

async function listConversations({ userId = 'demo-user' }) {
  const sb = getSupabaseClient();
  if (sb && userId !== 'demo-user') {
    try {
      const { data, error } = await sb
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase listConversations failed, falling back to memory:', e.message);
    }
  }

  const list = [];
  for (const conv of memoryConversations.values()) {
    if (conv.user_id === userId) {
      list.push(conv);
    }
  }
  return list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

async function getConversation({ id, userId = 'demo-user' }) {
  const sb = getSupabaseClient();
  if (sb && userId !== 'demo-user') {
    try {
      const { data: conv, error: convErr } = await sb
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      if (!convErr && conv) {
        const { data: msgs } = await sb
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: true });
        return { ...conv, messages: msgs || [] };
      }
    } catch (e) {
      console.warn('Supabase getConversation failed, falling back to memory:', e.message);
    }
  }

  const conv = memoryConversations.get(id);
  if (!conv || (conv.user_id !== userId && userId !== 'demo-user')) {
    return null;
  }
  const msgs = memoryMessages.get(id) || [];
  return { ...conv, messages: msgs };
}

async function deleteConversation({ id, userId = 'demo-user' }) {
  const sb = getSupabaseClient();
  if (sb && userId !== 'demo-user') {
    try {
      const { error } = await sb
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase deleteConversation failed:', e.message);
    }
  }

  const conv = memoryConversations.get(id);
  if (conv && (conv.user_id === userId || userId === 'demo-user')) {
    memoryConversations.delete(id);
    memoryMessages.delete(id);
    return true;
  }
  return false;
}

async function addMessage({ conversationId, role, content, kind = 'guidance', sources = [] }) {
  const msgId = generateUuid();
  const now = new Date().toISOString();

  const message = {
    id: msgId,
    conversation_id: conversationId,
    role,
    content,
    kind,
    sources,
    created_at: now
  };

  const sb = getSupabaseClient();
  if (sb) {
    try {
      await sb
        .from('messages')
        .insert([{
          id: msgId,
          conversation_id: conversationId,
          role,
          content,
          kind,
          sources,
          created_at: now
        }]);
      await sb
        .from('conversations')
        .update({ updated_at: now })
        .eq('id', conversationId);
    } catch (e) {
      console.warn('Supabase addMessage failed, relying on memory:', e.message);
    }
  }

  if (!memoryMessages.has(conversationId)) {
    memoryMessages.set(conversationId, []);
  }
  memoryMessages.get(conversationId).push(message);

  const conv = memoryConversations.get(conversationId);
  if (conv) {
    conv.updated_at = now;
  }

  return message;
}

module.exports = {
  createConversation,
  listConversations,
  getConversation,
  deleteConversation,
  addMessage,
  generateUuid
};
