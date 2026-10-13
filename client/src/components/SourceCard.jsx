import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function SourceCard({ source }) {
  if (!source) return null;

  return (
    <div className="source-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span className="source-card-title">{source.title}</span>
        <ShieldCheck size={14} color="#16803D" style={{ flexShrink: 0, marginTop: '2px' }} title="Verified Official Source" />
      </div>

      <div className="source-card-authority">{source.authority}</div>

      {source.sectionOrTopic && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
          Reference: {source.sectionOrTopic}
        </div>
      )}

      {source.jurisdiction && (
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
          Jurisdiction: {source.jurisdiction}
        </div>
      )}

      {source.sourceUrl && (
        <a
          href={source.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="source-card-link"
        >
          <span>Visit Official Portal</span>
          <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}
