const test = require('node:test');
const assert = require('node:assert/strict');
const {
  retrieveSources,
  validateSourceIds,
  formatSourcesForClient,
  getKnowledgeBaseSummary
} = require('../services/legalSearchService');

test('Knowledge base summary reports verified records', () => {
  const summary = getKnowledgeBaseSummary();
  assert.ok(summary.totalVerifiedRecords >= 5, 'Should have at least 5 verified records');
  assert.ok(summary.supportedTopics.includes('consumer_complaint'));
  assert.ok(summary.supportedTopics.includes('cybercrime'));
  assert.ok(summary.supportedTopics.includes('government_grievance'));
});

test('Retrieves consumer complaint sources for product/warranty issue', () => {
  const results = retrieveSources({
    query: 'I bought a laptop from an online store and it broke after 2 days. The seller refuses to refund or honor warranty.',
    category: 'consumer_complaint'
  });

  assert.ok(results.length > 0, 'Should find matching records');
  const foundConsumer = results.some(r => r.topic === 'consumer_complaint');
  assert.equal(foundConsumer, true, 'At least one record should be in consumer_complaint topic');
  assert.equal(results[0].status, 'verified', 'Retrieved record must be verified');
});

test('Retrieves cybercrime 1930 helpline for unauthorized UPI transaction', () => {
  const results = retrieveSources({
    query: 'Someone tricked me with a phishing link and money was debited from my bank account via UPI 1 hour ago',
    category: 'cybercrime'
  });

  assert.ok(results.length > 0, 'Should find matching cybercrime records');
  const found1930 = results.some(r => r.id === 'cybercrime-financial-fraud-1930');
  assert.equal(found1930, true, 'Should prioritize 1930 helpline for urgent cyber financial fraud');
});

test('Retrieves CPGRAMS for central ministry / pension grievance', () => {
  const results = retrieveSources({
    query: 'My father pension has been delayed by the central government department for 6 months',
    category: 'government_grievance'
  });

  assert.ok(results.length > 0, 'Should find CPGRAMS record');
  assert.equal(results[0].id, 'cpgrams-public-grievance-portal');
});

test('Returns empty array for completely unrelated query', () => {
  const results = retrieveSources({
    query: 'How to bake a chocolate cake with strawberries',
    category: null
  });

  assert.equal(results.length, 0, 'Should not match irrelevant culinary query to legal records');
});

test('Validates cited source IDs strictly against retrieved set', () => {
  const mockRetrieved = [
    { id: 'consumer-helpline-nch', title: 'NCH' },
    { id: 'cybercrime-financial-fraud-1930', title: '1930' }
  ];

  // Model claims one real source and one hallucinated source
  const claimedIds = ['consumer-helpline-nch', 'fake-law-statute-999', 'unretrieved-source'];
  const validated = validateSourceIds(claimedIds, mockRetrieved);

  assert.equal(validated.length, 1);
  assert.equal(validated[0].id, 'consumer-helpline-nch');
});

test('Formats sources for client matching API contract', () => {
  const mockRecords = [
    {
      id: 'consumer-helpline-nch',
      title: 'National Consumer Helpline',
      sectionReference: 'NCH Portal',
      url: 'https://consumerhelpline.gov.in/',
      jurisdiction: ['India'],
      authority: 'Dept of Consumer Affairs',
      limitations: ['Pre-litigation grievance platform']
    }
  ];

  const formatted = formatSourcesForClient(mockRecords);
  assert.equal(formatted.length, 1);
  assert.equal(formatted[0].id, 'consumer-helpline-nch');
  assert.equal(formatted[0].title, 'National Consumer Helpline');
  assert.equal(formatted[0].sourceUrl, 'https://consumerhelpline.gov.in/');
  assert.equal(formatted[0].jurisdiction, 'India');
  assert.ok(Array.isArray(formatted[0].limitations));
});
