const path = require('path');
const fs = require('fs');

const DATA_FILE_PATH = path.join(__dirname, '..', 'data', 'legalData.json');

// Stop words that carry little legal/semantic meaning
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from',
  'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'can', 'will', 'just', 'should', 'now', 'i', 'my', 'me', 'we', 'our',
  'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their',
  'has', 'have', 'had', 'having', 'do', 'does', 'did', 'done',
  'get', 'got', 'getting', 'make', 'made', 'making'
]);

function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

let cachedRecords = null;

function loadKnowledgeBase() {
  if (cachedRecords) {
    return cachedRecords;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('legalData.json must contain a JSON array of records');
    }
    // Only verified records are loaded for retrieval
    cachedRecords = parsed.filter(record => record && record.status === 'verified');
    return cachedRecords;
  } catch (err) {
    console.error('Failed to load legal knowledge base:', err.message);
    return [];
  }
}

// Reset cache for testing or hot reloading
function reloadKnowledgeBase() {
  cachedRecords = null;
  return loadKnowledgeBase();
}

/**
 * Deterministic retrieval engine
 * @param {Object} options
 * @param {string} options.query - User prompt or search query
 * @param {string} [options.category] - Explicit category if provided
 * @param {number} [options.limit=3] - Maximum records to return
 * @returns {Array<Object>} List of scored verified records
 */
function retrieveSources({ query = '', category = null, limit = 3 }) {
  const records = loadKnowledgeBase();
  if (!records || records.length === 0) {
    return [];
  }

  const queryTokens = tokenize(query);
  const normalizedCategory = category ? category.trim().toLowerCase() : null;

  const scoredRecords = [];

  for (const record of records) {
    // Safety check: Never retrieve non-verified records
    if (record.status !== 'verified') {
      continue;
    }

    let score = 0;
    const recordTopic = (record.topic || '').toLowerCase();

    // 1. Category alignment bonus
    const categoryMatch = Boolean(normalizedCategory && (recordTopic === normalizedCategory || recordTopic.includes(normalizedCategory)));
    if (categoryMatch) {
      score += 15;
    }

    // 2. Token match scoring
    const titleTokens = tokenize(record.title || '');
    const contentTokens = tokenize(record.content || '');

    let titleScore = 0;
    let keywordScore = 0;

    for (const token of queryTokens) {
      if (titleTokens.includes(token)) {
        titleScore += 8;
      }
    }

    // Keyword matching: distinguish single-token vs multi-word keyword phrases
    for (const kw of record.keywords || []) {
      const kwTokens = tokenize(kw);
      if (kwTokens.length === 1) {
        if (queryTokens.includes(kwTokens[0])) {
          keywordScore += 6;
        }
      } else if (kwTokens.length > 1) {
        const matched = kwTokens.filter(t => queryTokens.includes(t));
        if (matched.length === kwTokens.length) {
          keywordScore += 12; // All tokens of the multi-word keyword matched
        } else if (matched.length > 0) {
          keywordScore += matched.length * 3; // Partial match
        }
      }
    }

    // Topical anchor rule: If neither category, nor title, nor keywords matched,
    // the query has no topical link to this record. Do not allow pure body text false positives.
    if (!categoryMatch && titleScore === 0 && keywordScore === 0) {
      continue;
    }

    score += titleScore + keywordScore;

    // Content tokens match
    let contentMatches = 0;
    for (const token of queryTokens) {
      if (contentTokens.includes(token)) {
        contentMatches++;
      }
    }
    score += contentMatches * 2;

    // 3. Exact phrase match bonus
    const lowerQuery = query.toLowerCase().trim();
    if (lowerQuery.length > 4) {
      if ((record.title || '').toLowerCase().includes(lowerQuery)) {
        score += 20;
      }
      for (const kw of record.keywords || []) {
        if (lowerQuery.includes(kw.toLowerCase())) {
          score += 10;
        }
      }
    }

    // Minimum threshold to prevent returning irrelevant sources
    if (score >= 6) {
      scoredRecords.push({
        ...record,
        _relevanceScore: score
      });
    }
  }

  // Sort by score descending
  scoredRecords.sort((a, b) => b._relevanceScore - a._relevanceScore);

  return scoredRecords.slice(0, Math.max(1, limit));
}

/**
 * Validates that cited source IDs exist in the retrieved set.
 * Returns only verified, actually-retrieved source records.
 */
function validateSourceIds(claimedIds = [], retrievedRecords = []) {
  if (!Array.isArray(claimedIds) || !Array.isArray(retrievedRecords)) {
    return [];
  }

  const retrievedMap = new Map();
  for (const rec of retrievedRecords) {
    if (rec && rec.id) {
      retrievedMap.set(rec.id, rec);
    }
  }

  const validSources = [];
  for (const id of claimedIds) {
    if (retrievedMap.has(id)) {
      validSources.push(retrievedMap.get(id));
    }
  }

  return validSources;
}

/**
 * Format records for API client response per API_SPECIFICATION.md
 */
function formatSourcesForClient(records = []) {
  return records.map(rec => ({
    id: rec.id,
    title: rec.title,
    sectionOrTopic: rec.sectionReference || rec.topic,
    sourceUrl: rec.url,
    jurisdiction: Array.isArray(rec.jurisdiction) ? rec.jurisdiction.join(', ') : (rec.jurisdiction || 'India'),
    authority: rec.authority,
    limitations: rec.limitations || []
  }));
}

/**
 * Returns knowledge base metadata
 */
function getKnowledgeBaseSummary() {
  const records = loadKnowledgeBase();
  const topics = [...new Set(records.map(r => r.topic))];
  return {
    totalVerifiedRecords: records.length,
    supportedTopics: topics
  };
}

module.exports = {
  retrieveSources,
  validateSourceIds,
  formatSourcesForClient,
  getKnowledgeBaseSummary,
  reloadKnowledgeBase,
  tokenize
};
