const { PDFParse } = require('pdf-parse');
const { retrieveSources, validateSourceIds, formatSourcesForClient } = require('./legalSearchService');
const { callModelInference } = require('./llmService');

// Regular expressions to detect and redact sensitive Indian personal identifiers
const AADHAAR_REGEX = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
const PAN_REGEX = /\b[A-Z]{5}\d{4}[A-Z]\b/g;
const CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const OTP_REGEX = /\b(?:otp|one[- ]time password)\s*(?:is|:)?\s*\d{4,8}\b/gi;

/**
 * Sanitizes untrusted document text by redacting sensitive identity numbers
 * per AGENTS.md data minimization requirements.
 */
function sanitizeDocumentText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(AADHAAR_REGEX, '[REDACTED AADHAAR NUMBER]')
    .replace(PAN_REGEX, '[REDACTED PAN NUMBER]')
    .replace(CARD_REGEX, '[REDACTED CARD NUMBER]')
    .replace(OTP_REGEX, '[REDACTED OTP]');
}

/**
 * Extracts raw text from an uploaded file buffer.
 * Supports PDF (.pdf) and Plain Text (.txt, .md).
 */
async function extractTextFromBuffer({ buffer, mimeType, originalname }) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty document file provided.');
  }

  const isPdf = (mimeType && mimeType.includes('pdf')) || (originalname && originalname.toLowerCase().endsWith('.pdf'));

  if (isPdf) {
    try {
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const result = await parser.getText();
      const extracted = result?.text || '';
      if (!extracted.trim()) {
        throw new Error('PDF file contains no extractable text. Scanned image-only PDFs require OCR.');
      }
      return extracted;
    } catch (err) {
      throw new Error(`Failed to parse PDF document: ${err.message}`);
    }
  }

  // Treat as text / UTF-8
  try {
    return buffer.toString('utf-8');
  } catch (err) {
    throw new Error('Could not decode text document. Please upload a valid UTF-8 text file or PDF.');
  }
}

/**
 * Deterministic fallback breakdown when external LLM is unconfigured.
 */
function generateFallbackSimplification({ sanitizedText, filename, retrievedSources }) {
  const primarySource = retrievedSources[0];
  const sampleSnippet = sanitizedText.slice(0, 300).replace(/\s+/g, ' ').trim();

  let content = `### What This Document Is\n`;
  content += `This uploaded document (**${filename || 'Legal Document'}**) contains legal clauses and terms. A preview of the opening text:\n\n> "${sampleSnippet}..."\n\n`;

  content += `### Key Clauses & Terms Decoded\n`;
  content += `1. **Contractual Terms & Obligations:** Outlines rights, duties, payments, and performance conditions binding the signatories.\n`;
  content += `2. **Notice Period & Termination:** Governs the formal procedure, timeline, and written requirements to terminate or alter the arrangement.\n`;
  content += `3. **Dispute Resolution & Jurisdiction:** Designates the applicable forum or statutory authority for resolving disagreements.\n\n`;

  content += `### Potential Cautions & Red Flags\n`;
  content += `- **Unilateral Forfeiture:** Check whether security deposits or dues are subject to unreasonable non-refundable clauses.\n`;
  content += `- **Blanket Waivers:** Be cautious of clauses requiring you to waive statutory consumer or tenant protections.\n`;
  content += `- **Onerous Notice Periods:** Verify whether lock-in periods or penalty clauses exceed standard statutory norms.\n\n`;

  if (primarySource) {
    content += `### Relevant Official Protections\n`;
    content += `Based on the content of this document, official statutory protections under **${primarySource.authority}** apply. For instance, procedures under **${primarySource.title}** govern dispute adjudication.\n\n`;
  }

  content += `### Recommended Action Steps\n`;
  content += `1. **Preserve Signed Copy:** Retain an unaltered original or counter-signed PDF copy with dates and signatures.\n`;
  content += `2. **Verify Questionable Clauses:** Seek clarification in writing for any vague financial forfeiture terms before taking irrevocable steps.\n`;
  content += `3. **Official Redressal:** If the other party attempts unlawful enforcement, dispute resolution mechanisms are available through designated authorities.\n\n`;

  content += `### Follow-Up Questions to Consider\n`;
  content += `1. Have both parties signed and dated this document, or is it an initial draft?\n`;
  content += `2. Is there a specific clause or paragraph number in this document that you find concerning?\n`;

  return content;
}

/**
 * End-to-end document simplification pipeline:
 * 1. Sanitizes document text (redacting Aadhaar, PAN, card numbers).
 * 2. Retrieves matching verified legal knowledge base records.
 * 3. Prompts LLM for plain-language simplification with statutory grounding.
 * 4. Validates cited sources.
 */
async function simplifyDocument({ buffer, mimeType, originalname, rawText = null }) {
  let text = rawText;
  if (!text && buffer) {
    text = await extractTextFromBuffer({ buffer, mimeType, originalname });
  }

  if (!text || text.trim().length === 0) {
    throw new Error('No readable text found to simplify.');
  }

  const sanitized = sanitizeDocumentText(text.trim());
  const truncatedForPrompt = sanitized.slice(0, 6000); // 6k char budget for prompt efficiency

  // Retrieve relevant verified sources based on document content
  const retrievedSources = retrieveSources({ query: truncatedForPrompt.slice(0, 500), limit: 3 });

  const evidencePrompt = retrievedSources.map((s, idx) => `
[Source ${idx + 1}] ID: ${s.id}
Title: ${s.title}
Authority: ${s.authority}
URL: ${s.url}
Topic: ${s.topic}
Content: ${s.content}
Limitations: ${(s.limitations || []).join('; ')}
`).join('\n---\n');

  const simplificationPrompt = `You are NyayaAccess, an Indian legal navigation and document simplification assistant.
A user has uploaded a legal or contractual document titled "${originalname || 'Document'}".

YOUR TASK:
Explain this document in simple, accessible, plain English for a non-lawyer.
Organize your response into EXACTLY these 5 level-3 markdown sections (use '### ' prefix for each):

### What This Document Is
(Explain what type of document this appears to be, who the parties are, and its primary purpose in everyday words.)

### Key Clauses & Terms Decoded
(Break down the most important clauses, payment terms, notice periods, or legal conditions in plain language.)

### Potential Cautions & Red Flags
(Highlight any clauses that appear strict, one-sided, involve financial penalties, or restrict user rights.)

### Relevant Official Protections
(Explain how Indian statutory frameworks or verified dispute mechanisms protect the user based on the retrieved sources below.)

### Recommended Action Steps
(Provide a 1-4 numbered checklist of what the user should verify, clarify in writing, or preserve.)

### Follow-Up Questions to Consider
(Ask 1 to 2 focused questions to understand the user's specific concern with this document.)

DOCUMENT TEXT:
${truncatedForPrompt}

RETRIEVED VERIFIED SOURCES:
${evidencePrompt || 'None'}

Cite any relevant retrieved source IDs in brackets (e.g. [source-id]).`;

  let responseContent = null;
  const liveResult = await callModelInference({
    query: simplificationPrompt,
    retrievedSources
  });

  if (liveResult && liveResult.content) {
    responseContent = liveResult.content;
  } else {
    responseContent = generateFallbackSimplification({
      sanitizedText: sanitized,
      filename: originalname,
      retrievedSources
    });
  }

  const validatedSources = validateSourceIds(
    retrievedSources.map(s => s.id),
    retrievedSources
  );

  return {
    filename: originalname || 'Uploaded Document',
    sanitizedTextLength: sanitized.length,
    sanitizedSnippet: sanitized.slice(0, 500),
    simplifiedContent: responseContent,
    sources: formatSourcesForClient(validatedSources),
    disclaimer: 'This document simplification provides general plain-language explanations for informational purposes and does not substitute for qualified legal review by an advocate.'
  };
}

module.exports = {
  sanitizeDocumentText,
  extractTextFromBuffer,
  simplifyDocument
};
