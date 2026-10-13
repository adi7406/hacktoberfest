import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Copy,
  Check,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { simplifyDocumentFile } from '../services/api';
import GuidanceContent from '../components/GuidanceContent';
import SourceCard from '../components/SourceCard';
import LegalDisclaimer from '../components/LegalDisclaimer';

export default function DocumentSimplifierPage({ onContinueInChat }) {
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5MB limit. Please upload a smaller document.');
      return;
    }

    setFile(selected);
    setErrorMessage(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (dropped.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5MB limit. Please upload a smaller document.');
      return;
    }

    setFile(dropped);
    setErrorMessage(null);
  }

  async function handleSimplify() {
    if (activeTab === 'upload' && !file) {
      setErrorMessage('Please select a document file (.pdf or .txt) to simplify.');
      return;
    }
    if (activeTab === 'paste' && !pastedText.trim()) {
      setErrorMessage('Please paste the legal document text to simplify.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let res;
      if (activeTab === 'upload') {
        res = await simplifyDocumentFile({ file });
      } else {
        res = await simplifyDocumentFile({
          text: pastedText.trim(),
          filename: 'Pasted Agreement / Notice'
        });
      }
      setResult(res);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to simplify document. Please verify the file and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setPastedText('');
    setResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleCopy() {
    if (!result?.simplifiedContent) return;
    navigator.clipboard.writeText(result.simplifiedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="main-content" style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="hero-pill" style={{ margin: '0 auto 0.75rem' }}>
          <Shield size={13} />
          <span>Grounded Document Simplifier</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-dark-navy)', marginBottom: '0.5rem' }}>
          Decode Legal Documents in Plain Words
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', maxWidth: '640px', margin: '0 auto' }}>
          Upload a tenancy agreement, employment offer, consumer notice, or contract. NyayaAccess decodes complex clauses, flags onerous conditions, and grounds rights in official Indian statutes.
        </p>
      </div>

      <LegalDisclaimer />

      {/* Main Card: Upload or Paste Input */}
      {!result ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginTop: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          {/* Tab Selection */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <button
              className={`nav-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
              style={{ padding: '0.5rem 1rem' }}
            >
              <UploadCloud size={16} />
              <span>Upload PDF or Text</span>
            </button>
            <button
              className={`nav-btn ${activeTab === 'paste' ? 'active' : ''}`}
              onClick={() => { setActiveTab('paste'); setErrorMessage(null); }}
              style={{ padding: '0.5rem 1rem' }}
            >
              <FileText size={16} />
              <span>Paste Text Directly</span>
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--color-border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: file ? 'var(--color-soft-blue)' : 'var(--color-page)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.md"
                  style={{ display: 'none' }}
                />
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--color-primary-blue)', border: '1px solid var(--color-border)' }}>
                  <UploadCloud size={24} />
                </div>
                {file ? (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary-navy)' }}>{file.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      {(file.size / 1024).toFixed(1)} KB • Click or drop a different file to replace
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-dark-navy)' }}>
                      Click to choose or drag & drop your document
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      Supports PDF (.pdf) and plain text (.txt) up to 5MB
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the clauses, rental agreement, appointment notice, or consumer terms here..."
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-strong)',
                  fontSize: '0.90625rem',
                  lineHeight: '1.5',
                  fontFamily: 'inherit',
                  color: 'var(--color-text-primary)',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
                {pastedText.length} characters entered
              </div>
            </div>
          )}

          {/* Privacy Minimization Banner */}
          <div style={{ marginTop: '1.25rem', padding: '0.625rem 0.875rem', background: 'var(--color-soft-blue)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(36, 87, 167, 0.15)', fontSize: '0.78125rem', color: 'var(--color-primary-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={14} color="#16803D" />
            <span>
              <strong>Automated Privacy Redaction:</strong> Any 12-digit Aadhaar, PAN, card numbers, or OTPs are automatically masked before AI processing.
            </span>
          </div>

          {errorMessage && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', border: '1px solid rgba(180, 35, 24, 0.2)' }}>
              {errorMessage}
            </div>
          )}

          {/* Action Button */}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              className="btn-primary"
              onClick={handleSimplify}
              disabled={isLoading || (activeTab === 'upload' && !file) || (activeTab === 'paste' && !pastedText.trim())}
              style={{ minWidth: '180px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Simplifying Document...</span>
                </>
              ) : (
                <>
                  <span>Simplify Document</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Result Header Bar */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-soft-blue)', color: 'var(--color-primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-dark-navy)' }}>
                  {result.filename}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Analyzed {result.sanitizedTextLength} characters • Grounded in {result.sources?.length || 0} official records
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="copy-message-btn"
                onClick={handleCopy}
                title="Copy breakdown to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={12} color="#16803D" />
                    <span style={{ color: '#16803D' }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy Breakdown</span>
                  </>
                )}
              </button>
              <button
                className="btn-secondary"
                onClick={handleReset}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
              >
                <span>Upload Another</span>
              </button>
            </div>
          </div>

          {/* Structured Guidance Sections */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <GuidanceContent content={result.simplifiedContent} kind="guidance" />
          </div>

          {/* Official Government Citations */}
          {result.sources && result.sources.length > 0 && (
            <div className="sources-section" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div className="sources-header">
                <Shield size={14} color="#16803D" />
                <span style={{ fontWeight: 700 }}>Verified Government Frameworks & Portals ({result.sources.length})</span>
              </div>
              <div className="source-cards-grid" style={{ marginTop: '0.75rem' }}>
                {result.sources.map((src, idx) => (
                  <SourceCard key={src.id || idx} source={src} />
                ))}
              </div>
            </div>
          )}

          {/* Continue in Legal Chat Action */}
          <div style={{ background: 'var(--color-page)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-dark-navy)' }}>
                Have follow-up questions about this document?
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Take this document breakdown directly into our conversational assistant to ask specific questions about clauses.
              </div>
            </div>
            {onContinueInChat && (
              <button
                className="btn-primary"
                onClick={() => onContinueInChat(`I have uploaded my document "${result.filename}". Please help me understand how to proceed.`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem' }}
              >
                <MessageSquare size={16} />
                <span>Discuss in Chat</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
