import React from 'react';
import {
  BookOpen,
  ListChecks,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

/**
 * Safely parses inline markdown (bold **text**, italics *text*, [link text](url), and bare URLs)
 * and returns React elements without using dangerouslySetInnerHTML.
 */
export function parseInlineMarkdown(text) {
  if (!text || typeof text !== 'string') return text;

  // Regex matching:
  // 1. Bold: **...**
  // 2. Markdown link: [text](https://...)
  // 3. Bare URL: https://... or http://...
  // 4. Italics: *...*
  const regex = /(\*\*.*?\*\*|\[.*?\]\(https?:\/\/[^\s\)]+\)|https?:\/\/[^\s<>'")\]]+|\*[^*]+?\*)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldContent = token.slice(2, -2);
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-navy">
          {boldContent}
        </strong>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkText = token.slice(1, token.indexOf(']('));
      const url = token.slice(token.indexOf('](') + 2, -1);
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-legal-link"
        >
          <span>{linkText}</span>
          <ExternalLink size={11} style={{ display: 'inline', marginLeft: '2px', verticalAlign: 'baseline' }} />
        </a>
      );
    } else if (token.startsWith('http://') || token.startsWith('https://')) {
      let cleanUrl = token;
      let trailingPunctuation = '';
      if (/[.,;:)]$/.test(cleanUrl)) {
        trailingPunctuation = cleanUrl.slice(-1);
        cleanUrl = cleanUrl.slice(0, -1);
      }
      parts.push(
        <React.Fragment key={`bare-${match.index}`}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-legal-link"
          >
            <span>{cleanUrl.replace(/^https?:\/\//, '')}</span>
            <ExternalLink size={11} style={{ display: 'inline', marginLeft: '2px', verticalAlign: 'baseline' }} />
          </a>
          {trailingPunctuation}
        </React.Fragment>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const italicContent = token.slice(1, -1);
      parts.push(
        <em key={`em-${match.index}`} style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
          {italicContent}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/**
 * Detects whether a given line is a section heading.
 * Supports:
 * - Markdown headings: ### Heading or ## Heading
 * - Standalone bold lines: **Heading** or **Heading:** or **1. Heading**
 */
function isSectionHeading(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // 1. Markdown ### or ## or #
  if (/^#{1,3}\s+/.test(trimmed)) {
    return trimmed.replace(/^#{1,3}\s+/, '').replace(/\*\*/g, '').replace(/:$/, '').trim();
  }

  // 2. Standalone bold line: **What This May Mean** or **Possible Next Steps** or **1. Possible Next Steps**
  const boldMatch = trimmed.match(/^\s*(?:\d+\.\s*)?\*\*([^*]+)\*\*:?\s*$/);
  if (boldMatch) {
    const candidate = boldMatch[1].trim();
    const lower = candidate.toLowerCase();
    if (
      lower.includes('mean') ||
      lower.includes('next steps') ||
      lower.includes('what to do') ||
      lower.includes('step') ||
      lower.includes('uncertain') ||
      lower.includes('limitation') ||
      lower.includes('question') ||
      lower.includes('follow-up') ||
      lower.includes('clarif') ||
      lower.includes('consider') ||
      lower.includes('summary') ||
      lower.includes('action')
    ) {
      return candidate.replace(/:$/, '').trim();
    }
  }

  return null;
}

/**
 * Splits response text into structured sections by markdown headings or standalone bold titles.
 */
function parseSections(text) {
  const sections = [];
  const lines = text.split('\n');
  let currentSection = { title: null, lines: [] };

  for (const line of lines) {
    const heading = isSectionHeading(line);
    if (heading) {
      if (currentSection.title || currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: heading,
        lines: []
      };
    } else {
      currentSection.lines.push(line);
    }
  }

  if (currentSection.title || currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

export default function GuidanceContent({ content, kind }) {
  if (!content) return null;

  // Handle special message kinds
  if (kind === 'insufficient_evidence') {
    return (
      <div className="insufficient-evidence-card">
        <div className="callout-header">
          <AlertCircle size={18} className="callout-icon" />
          <span className="callout-title">Insufficient Official Evidence in Knowledge Base</span>
        </div>
        <p className="callout-text">{parseInlineMarkdown(content)}</p>
      </div>
    );
  }

  if (kind === 'clarification') {
    return (
      <div className="clarification-card">
        <div className="callout-header">
          <HelpCircle size={18} className="callout-icon" />
          <span className="callout-title">Clarification Needed</span>
        </div>
        <p className="callout-text">{parseInlineMarkdown(content)}</p>
      </div>
    );
  }

  const sections = parseSections(content);

  // If text does not contain heading-based sections, render cleanly formatted lines
  if (sections.length <= 1 && !sections[0]?.title) {
    return (
      <div className="guidance-generic-flow">
        {content.split('\n').map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="spacer" />;
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return (
              <li key={idx} className="generic-list-item">
                {parseInlineMarkdown(line.replace(/^[-•]\s*/, ''))}
              </li>
            );
          }
          return (
            <p key={idx} className="generic-paragraph">
              {parseInlineMarkdown(line)}
            </p>
          );
        })}
      </div>
    );
  }

  return (
    <div className="guidance-structured-flow">
      {sections.map((section, sIdx) => {
        const titleLower = (section.title || '').toLowerCase();

        // 1. "What This May Mean" or Summary Section
        if (titleLower.includes('what this may mean') || titleLower.includes('summary') || titleLower.includes('explanation') || titleLower.includes('mean')) {
          return (
            <div key={sIdx} className="guidance-section-block section-meaning">
              <div className="guidance-section-header">
                <div className="section-icon-badge badge-meaning">
                  <BookOpen size={15} />
                </div>
                <h3 className="section-heading-text">{section.title}</h3>
              </div>
              <div className="section-body">
                {section.lines.map((l, lIdx) => {
                  if (!l.trim()) return <div key={lIdx} className="paragraph-spacer" />;
                  return (
                    <p key={lIdx} className="meaning-paragraph">
                      {parseInlineMarkdown(l)}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        }

        // 2. "Possible Next Steps" Section (Actionable Checklist)
        if (titleLower.includes('next steps') || titleLower.includes('step') || titleLower.includes('practical') || titleLower.includes('action') || titleLower.includes('what to do')) {
          // Parse numbered or bulleted steps
          const steps = [];
          let currentStep = null;

          for (const line of section.lines) {
            const stepMatch = line.match(/^(\d+)\.\s+(.*)/);
            if (stepMatch) {
              if (currentStep) steps.push(currentStep);
              currentStep = {
                number: stepMatch[1],
                text: stepMatch[2]
              };
            } else if (currentStep && line.trim()) {
              currentStep.text += ' ' + line.trim();
            } else if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
              if (currentStep) steps.push(currentStep);
              currentStep = {
                number: '•',
                text: line.trim().replace(/^[-•]\s*/, '')
              };
            }
          }
          if (currentStep) steps.push(currentStep);

          return (
            <div key={sIdx} className="guidance-section-block section-steps">
              <div className="guidance-section-header">
                <div className="section-icon-badge badge-steps">
                  <ListChecks size={15} />
                </div>
                <h3 className="section-heading-text">{section.title}</h3>
              </div>
              <div className="steps-list-container">
                {steps.map((st, stIdx) => (
                  <div key={stIdx} className="step-card-item">
                    <div className="step-number-pill">{st.number}</div>
                    <div className="step-card-content">
                      {parseInlineMarkdown(st.text)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // 3. "What Is Uncertain & Limitations" Section
        if (titleLower.includes('uncertain') || titleLower.includes('limitations') || titleLower.includes('exceptions')) {
          return (
            <div key={sIdx} className="guidance-section-block section-limitations">
              <div className="limitations-callout-box">
                <div className="limitations-header">
                  <AlertTriangle size={16} className="limitations-icon" />
                  <span className="limitations-title">{section.title}</span>
                </div>
                <ul className="limitations-list">
                  {section.lines
                    .filter(l => l.trim().length > 0)
                    .map((l, lIdx) => {
                      const cleanLine = l.replace(/^[-•*]\s*/, '');
                      return (
                        <li key={lIdx} className="limitation-item">
                          {parseInlineMarkdown(cleanLine)}
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          );
        }

        // 4. "Follow-up Questions to Consider" / "Clarifying Questions" Section
        if (titleLower.includes('question') || titleLower.includes('clarif') || titleLower.includes('consider')) {
          const questions = [];
          let currentQ = null;

          for (const line of section.lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const qMatch = trimmed.match(/^(\d+\.|[-•*])\s+(.*)/);
            if (qMatch) {
              if (currentQ) questions.push(currentQ);
              currentQ = qMatch[2];
            } else if (currentQ) {
              currentQ += ' ' + trimmed;
            } else {
              questions.push(trimmed);
            }
          }
          if (currentQ) questions.push(currentQ);

          return (
            <div key={sIdx} className="guidance-section-block section-questions">
              <div className="guidance-section-header">
                <div className="section-icon-badge badge-questions">
                  <HelpCircle size={15} />
                </div>
                <h3 className="section-heading-text">{section.title}</h3>
              </div>
              <div className="questions-container">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="question-card-item">
                    <HelpCircle size={14} className="question-icon" />
                    <div className="question-card-content">
                      {parseInlineMarkdown(q)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Fallback for any other custom section title (e.g. Source notes)
        return (
          <div key={sIdx} className="guidance-section-block">
            {section.title && <h3 className="section-heading-text">{section.title}</h3>}
            <div className="section-body">
              {section.lines.map((l, lIdx) => (
                <p key={lIdx} className="generic-paragraph">
                  {parseInlineMarkdown(l)}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
