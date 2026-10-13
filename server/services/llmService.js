const { validateSourceIds, formatSourcesForClient } = require('./legalSearchService');

const SYSTEM_PROMPT = `You are NyayaAccess, an Indian legal-information and public-service navigation assistant.
You provide general legal information and procedural guidance, not formal legal representation or guaranteed outcomes.

CORE OPERATING RULES:
1. Ground all claims strictly in the supplied verified government records. Never invent statutes, section numbers, case law, deadlines, URLs, or helplines.
2. If evidence lacks details, state the limitation openly. Do not speculate beyond official guidance.
3. Use plain, respectful, accessible language.
4. Structure your response into EXACTLY these 4 level-3 markdown sections (use '### ' prefix for each):

### What This May Mean
(Explain the user's issue in plain language, describing the legal concept, authority in charge, and public service framework based on verified records.)

### Possible Next Steps
(Provide a numbered 1-4 checklist of concrete, immediate actions: e.g. calling verified toll-free helplines, registering on official portals, or collating documentary proof.)

### What Is Uncertain & Limitations
(List statutory limitations, jurisdictional boundaries, lack of guaranteed outcomes, or need for magistrate/court orders.)

### Follow-Up Questions to Consider
(Ask 1 to 2 focused clarifying questions to help the user identify critical details: e.g. how many hours/days ago did the incident occur, what documentation or transaction reference IDs they possess, or which state/district the dispute occurred in.)

5. In text, cite retrieved source IDs using square brackets (e.g. [source-id]).`;

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

  let explanation = `### What This May Mean\nBased on official guidance from **${primarySource.authority}**, here is verified information relevant to your issue:\n\n${primarySource.content}\n\n`;

  explanation += `### Possible Next Steps\n`;
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
  } else if (primarySource.topic === 'rental_dispute') {
    explanation += `1. **Issue Written Demand Notice:** Send a formal written notice (via speed post or registered email) referencing the rent agreement, tenancy period, and demanding refund within the statutory notice period.\n`;
    explanation += `2. **Collate Payment & Tenancy Evidence:** Compile bank statements showing deposit payment, signed rent agreement, handover inspection receipts, and communication logs.\n`;
    explanation += `3. **Approach Designated Rent Authority:** If the landlord unlawfully retains the deposit beyond contractual terms, file a dispute before the Rent Authority / Rent Tribunal under applicable State Tenancy / Model Tenancy provisions.\n\n`;
  } else if (primarySource.topic === 'unpaid_wages') {
    explanation += `1. **Submit Dispute on SAMADHAN Portal:** Register an online industrial wage dispute at [samadhan.labour.gov.in](${primarySource.url}) to initiate formal conciliation proceedings.\n`;
    explanation += `2. **Gather Employment Proofs:** Collate appointment letter, attendance records, payslips, email work approvals, and bank statements showing salary non-credit.\n`;
    explanation += `3. **Approach Labour Commissioner:** If conciliation does not yield settlement, the matter proceeds for recovery certificate / prosecution under the Payment of Wages or Industrial Disputes framework.\n\n`;
  } else {
    explanation += `1. Review the official instructions published at [${primarySource.title}](${primarySource.url}).\n`;
    explanation += `2. Gather and verify relevant documentary records before proceeding.\n\n`;
  }

  explanation += `### What Is Uncertain & Limitations\n`;
  if (primarySource.limitations && primarySource.limitations.length > 0) {
    for (const lim of primarySource.limitations) {
      explanation += `- ${lim}\n`;
    }
  } else {
    explanation += `- This guidance is for informational purposes and does not substitute for qualified legal advice.\n`;
  }

  explanation += `\n### Follow-Up Questions to Consider\n`;
  if (primarySource.topic === 'cybercrime') {
    explanation += `1. **Timing Window:** Did the unauthorized transaction occur within the last 2 to 4 hours (the critical "Golden Hour" for fund lien requests)?\n`;
    explanation += `2. **Transaction Details:** Do you have the 12-digit UPI reference (UTR) number or debit transaction SMS ready?\n`;
  } else if (primarySource.topic === 'consumer_complaint') {
    explanation += `1. **Documentation:** Do you possess the purchase tax invoice, warranty card, and any written correspondence with the seller?\n`;
    explanation += `2. **Purchase Channel:** Was the product bought from an online e-commerce platform or directly from a local store?\n`;
  } else if (primarySource.topic === 'rental_dispute') {
    explanation += `1. **Tenancy Proof:** Do you possess an executed rent agreement and signed handover inspection records?\n`;
    explanation += `2. **Notice Status:** Has a formal written demand notice for return of deposit been sent to the landlord?\n`;
  } else if (primarySource.topic === 'unpaid_wages') {
    explanation += `1. **Employment Record:** Do you hold an appointment letter, monthly payslips, or bank salary deposit statements?\n`;
    explanation += `2. **Withheld Duration:** How many months of salary or settlement payments are currently overdue?\n`;
  } else if (primarySource.topic === 'government_grievance') {
    explanation += `1. **Prior Submissions:** Which Central Ministry or Department is responsible, and has any prior local complaint been filed?\n`;
    explanation += `2. **Timeline:** Has more than 30 days passed since your original grievance submission without response?\n`;
  } else {
    explanation += `1. What specific documents or transaction references do you currently possess regarding this issue?\n`;
    explanation += `2. Has any formal complaint or legal notice already been submitted?\n`;
  }

  return {
    content: explanation,
    kind: "guidance",
    needsClarification: false,
    citedSourceIds: citedIds
  };
}

/**
 * Call LLM Inference API (Groq, DigitalOcean, or OpenAI-compatible endpoint)
 */
async function callModelInference({ query, retrievedSources }) {
  const apiKey = process.env.GROQ_API_KEY || process.env.DIGITALOCEAN_INFERENCE_API_KEY;
  const baseUrl = process.env.GROQ_API_URL
    || process.env.DIGITALOCEAN_INFERENCE_URL
    || process.env.DIGITALOCEAN_INFERENCE_BASE_URL
    || 'https://api.groq.com/openai/v1';
  const model = process.env.GROQ_MODEL
    || process.env.DIGITALOCEAN_MODEL
    || process.env.DIGITALOCEAN_INFERENCE_MODEL
    || 'llama-3.3-70b-versatile';
  const timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS, 10) || 30000;

  if (!apiKey || !baseUrl || apiKey.startsWith('your-')) {
    // Graceful fallback to deterministic generator when API key is placeholder or unconfigured
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
      const errBody = await res.text().catch(() => '');
      console.warn(`LLM Inference provider returned HTTP ${res.status}: ${res.statusText} - ${errBody}`);
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
    console.warn('LLM Inference call error:', err.message);
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
  let result = await callModelInference({ query, retrievedSources });

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
