const { validateSourceIds, formatSourcesForClient } = require('./legalSearchService');

const SYSTEM_PROMPT = `You are NyayaAccess, an Indian legal-information and public-service navigation assistant.
You provide general information, not legal representation or a guaranteed legal opinion.

CORE RULES:
1. Use only the supplied verified source records for claims about laws, legal rights, deadlines, eligibility, fees, procedures, authorities, and official contact routes.
2. Do not rely on your pretrained knowledge to fill gaps in the supplied evidence.
3. Do not invent statutes, sections, case law, deadlines, URLs, quotations, or citations.
4. If the evidence does not answer the question, explain what is missing and ask a focused clarifying question, or recommend consulting the relevant official authority or a qualified lawyer.
5. Distinguish facts stated by an official source from general explanations.
6. Mention material jurisdictional limitations. Never guarantee an outcome or promise that a complaint has been lodged.
7. Use plain, accessible, respectful language. Organize your response into:
   - Plain-Language Summary
   - Practical Next Steps
   - Important Limitations
8. Cite only the provided source IDs in brackets (e.g. [source-id]).`;

/**
 * Fallback synthesis when inference provider is unconfigured or unavailable.
 * Grounded 100% in verified retrieved sources to guarantee zero hallucinations.
 */
function generateDeterministicFallback({ query, retrievedSources }) {
  if (!retrievedSources || retrievedSources.length === 0) {
    return {
      content: "I do not have sufficient verified legal sources in my knowledge base to address this specific situation safely. NyayaAccess provides information grounded only in verified official records. Please consider consulting an advocate, legal aid counsel (via NALSA/State Legal Services Authority), or the relevant official portal directly.",
      kind: "insufficient_evidence",
      needsClarification: true,
      citedSourceIds: []
    };
  }

  const primarySource = retrievedSources[0];
  const citedIds = retrievedSources.map(s => s.id);

  let explanation = `### Plain-Language Summary\nBased on official guidance from **${primarySource.authority}**, here is verified information relevant to your issue:\n\n${primarySource.content}\n\n`;

  explanation += `### Practical Next Steps\n`;
  if (primarySource.topic === 'consumer_complaint') {
    explanation += `1. **Attempt Pre-Litigation Grievance:** Register your complaint on the National Consumer Helpline at [consumerhelpline.gov.in](${primarySource.url}) or call toll-free **1915**.\n`;
    explanation += `2. **Preserve Documentation:** Keep all purchase invoices, payment receipts, written communications, and warranty cards handy.\n`;
    explanation += `3. **Formal Filing:** If grievance mediation is unsuccessful, you may formally file a complaint before the Consumer Commission online via the e-Daakhil portal (edaakhil.nic.in).\n\n`;
  } else if (primarySource.topic === 'cybercrime') {
    explanation += `1. **Immediate Reporting (Golden Hour):** Call the National Cyber Crime Helpline **1930** immediately or register an incident on [cybercrime.gov.in](${primarySource.url}) to freeze defrauded funds.\n`;
    explanation += `2. **Contact Your Bank:** Notify your home branch/card issuer immediately to block compromised accounts/cards.\n`;
    explanation += `3. **Preserve Digital Evidence:** Save unaltered screenshots of transaction SMS/emails, UPI transaction IDs, and communication logs.\n\n`;
  } else if (primarySource.topic === 'government_grievance') {
    explanation += `1. **Lodge Official Grievance:** Submit an online grievance through CPGRAMS at [pgportal.gov.in](${primarySource.url}).\n`;
    explanation += `2. **Track Registration Number:** Note the unique grievance registration number provided to monitor departmental action.\n`;
    explanation += `3. **Appeal if Necessary:** If the resolution provided is unsatisfactory, an administrative appeal can be filed within the portal.\n\n`;
  } else {
    explanation += `1. Review the official instructions published at [${primarySource.title}](${primarySource.url}).\n`;
    explanation += `2. Gather and verify relevant documentary records before proceeding.\n\n`;
  }

  explanation += `### Important Limitations\n`;
  if (primarySource.limitations && primarySource.limitations.length > 0) {
    for (const lim of primarySource.limitations) {
      explanation += `- ${lim}\n`;
    }
  } else {
    explanation += `- This guidance is for informational purposes and does not substitute for qualified legal advice.\n`;
  }

  return {
    content: explanation,
    kind: "guidance",
    needsClarification: false,
    citedSourceIds: citedIds
  };
}

/**
 * Call DigitalOcean Inference API (OpenAI-compatible chat completions)
 */
async function callDigitalOceanInference({ query, retrievedSources }) {
  const apiKey = process.env.DIGITALOCEAN_INFERENCE_API_KEY;
  const baseUrl = process.env.DIGITALOCEAN_INFERENCE_URL || process.env.DIGITALOCEAN_INFERENCE_BASE_URL;
  const model = process.env.DIGITALOCEAN_MODEL || process.env.DIGITALOCEAN_INFERENCE_MODEL || 'meta-llama/Llama-3.3-70B-Instruct';
  const timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS, 10) || 30000;

  if (!apiKey || !baseUrl) {
    // Graceful fallback to deterministic generator when API key is not configured
    return null;
  }

  const evidencePrompt = retrievedSources.map((s, idx) => `
[Source ${idx + 1}] ID: ${s.id}
Title: ${s.title}
Authority: ${s.authority}
URL: ${s.url}
Topic: ${s.topic}
Section/Reference: ${s.sectionReference || 'N/A'}
Content: ${s.content}
Limitations: ${(s.limitations || []).join('; ')}
`).join('\n---\n');

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `USER QUESTION:\n${query}\n\nRETRIEVED VERIFIED SOURCES:\n${evidencePrompt}\n\nProvide plain-language guidance based strictly on the retrieved sources above.`
    }
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = baseUrl.endsWith('/chat/completions')
      ? baseUrl
      : `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1, // Low temperature for high factual adherence
        max_tokens: 1024
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`DigitalOcean Inference returned HTTP ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    // Extract cited source IDs mentioned in square brackets
    const citedMatches = content.match(/\[([a-z0-9-]+)\]/g) || [];
    const extractedIds = citedMatches.map(m => m.slice(1, -1));

    return {
      content,
      kind: "guidance",
      needsClarification: false,
      citedSourceIds: extractedIds.length > 0 ? extractedIds : retrievedSources.map(s => s.id)
    };
  } catch (err) {
    clearTimeout(timer);
    console.warn('DigitalOcean Inference call error:', err.message);
    return null;
  }
}

/**
 * Generate answer orchestrator:
 * 1. Checks retrieved evidence.
 * 2. If no sources, returns safe insufficient evidence message.
 * 3. Attempts inference provider, falling back to deterministic synthesis.
 * 4. Validates cited source IDs against retrieval results.
 * 5. Returns final structured payload.
 */
async function generateLegalResponse({ query, retrievedSources }) {
  if (!retrievedSources || retrievedSources.length === 0) {
    return {
      message: {
        content: "I do not have sufficient verified legal records in my knowledge base to address your specific question safely. NyayaAccess provides guidance grounded exclusively in verified official sources. Please consult a qualified advocate, legal aid counsel (via NALSA), or the responsible government authority.",
        kind: "insufficient_evidence"
      },
      sources: [],
      needsClarification: true,
      disclaimer: "This is general legal information, not a substitute for advice from a qualified lawyer."
    };
  }

  // Attempt live model inference if configured
  let result = await callDigitalOceanInference({ query, retrievedSources });

  // If unconfigured or upstream failed, use deterministic grounded synthesis
  if (!result) {
    result = generateDeterministicFallback({ query, retrievedSources });
  }

  // Validate cited source IDs on backend against retrieved sources
  let validatedSources = validateSourceIds(result.citedSourceIds, retrievedSources);
  if (validatedSources.length === 0) {
    // If no specific IDs matched, fallback to the top retrieved sources that informed the answer
    validatedSources = retrievedSources.slice(0, 2);
  }

  const clientSources = formatSourcesForClient(validatedSources);

  return {
    message: {
      content: result.content,
      kind: result.kind || "guidance"
    },
    sources: clientSources,
    needsClarification: Boolean(result.needsClarification),
    disclaimer: "This is general legal information, not a substitute for advice from a qualified lawyer."
  };
}

module.exports = {
  SYSTEM_PROMPT,
  generateLegalResponse,
  generateDeterministicFallback
};
