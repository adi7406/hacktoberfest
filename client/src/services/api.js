const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function sendChatMessage({ conversationId, message, category }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, message, category })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to send message');
  }
  return data;
}

export async function getConversations() {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function getConversation(id) {
  const res = await fetch(`${API_BASE}/conversations/${id}`);
  if (!res.ok) throw new Error('Failed to load conversation');
  return res.json();
}

export async function deleteConversation(id) {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
  return res.json();
}
