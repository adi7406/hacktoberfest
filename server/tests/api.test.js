const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../server');

let server;
let baseUrl;

test.before(async () => {
  await new Promise(resolve => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise(resolve => server.close(resolve));
});

test('GET /api/health returns status ok and knowledge base info', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'nyaya-access-api');
  assert.ok(data.knowledgeBase.verifiedRecords >= 5);
});

test('POST /api/chat rejects empty message with 400', async () => {
  const res = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error.code, 'INVALID_REQUEST');
});

test('POST /api/chat returns source-grounded response for consumer grievance', async () => {
  const res = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'The seller sent a damaged product and refused my refund request',
      category: 'consumer_complaint'
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.conversationId, 'Should return conversationId');
  assert.ok(data.message.content.length > 50, 'Should return non-empty guidance');
  assert.equal(data.message.kind, 'guidance');
  assert.ok(data.sources.length > 0, 'Should include retrieved sources');
  assert.ok(data.disclaimer.includes('general legal information'));
});

test('POST /api/chat returns safe insufficient_evidence when query lacks evidence', async () => {
  const res = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Can you tell me how to build a nuclear reactor in my garage?'
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.message.kind, 'insufficient_evidence');
  assert.equal(data.sources.length, 0);
  assert.equal(data.needsClarification, true);
});

test('Conversation management endpoints work in demo mode', async () => {
  // Create conversation
  const createRes = await fetch(`${baseUrl}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test Consumer Dispute' })
  });
  assert.equal(createRes.status, 201);
  const created = await createRes.json();
  assert.ok(created.id);
  assert.equal(created.title, 'Test Consumer Dispute');

  // List conversations
  const listRes = await fetch(`${baseUrl}/conversations`);
  assert.equal(listRes.status, 200);
  const list = await listRes.json();
  assert.ok(Array.isArray(list));
  assert.ok(list.some(c => c.id === created.id));

  // Get conversation
  const getRes = await fetch(`${baseUrl}/conversations/${created.id}`);
  assert.equal(getRes.status, 200);
  const fetched = await getRes.json();
  assert.equal(fetched.id, created.id);
  assert.ok(Array.isArray(fetched.messages));
});

test('POST /api/documents/simplify rejects empty payload with 400', async () => {
  const res = await fetch(`${baseUrl}/documents/simplify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error.code, 'INVALID_REQUEST');
});

test('POST /api/documents/simplify redacts sensitive data and returns structured simplification', async () => {
  const sampleNotice = `
    LEGAL NOTICE:
    To Employee with PAN: ABCDE1234F and Aadhaar: 1234 5678 9012.
    Regarding withheld wages and salary arrears for October 2024.
    If you do not respond in 7 days, your full and final settlement will be permanently forfeited.
  `;

  const res = await fetch(`${baseUrl}/documents/simplify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: sampleNotice, filename: 'notice.txt' })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.document.simplifiedContent, 'Should have simplified markdown content');
  assert.ok(data.document.simplifiedContent.length > 50);
  // Privacy check: sensitive numbers must be redacted
  assert.ok(!data.document.sanitizedSnippet.includes('ABCDE1234F'), 'PAN must be redacted');
  assert.ok(!data.document.sanitizedSnippet.includes('1234 5678 9012'), 'Aadhaar must be redacted');
  assert.ok(data.document.sanitizedSnippet.includes('[REDACTED PAN NUMBER]'));
  assert.ok(data.document.sanitizedSnippet.includes('[REDACTED AADHAAR NUMBER]'));
  assert.ok(data.document.sources.length > 0, 'Should match statutory labour sources');
  assert.ok(data.document.disclaimer.includes('general plain-language'));
});

