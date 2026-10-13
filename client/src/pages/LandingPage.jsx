import React from 'react';
import {
  ShoppingBag,
  ShieldAlert,
  Landmark,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  BookOpen,
  Compass,
  Briefcase,
  Home,
  ExternalLink,
  Lock,
  FileText
} from 'lucide-react';

const VERIFIED_CATEGORIES = [
  {
    id: 'consumer_complaint',
    title: 'Consumer Complaints',
    icon: ShoppingBag,
    description: 'Defective products, refusal of refund, deficiency in e-commerce or retail services, and National Consumer Helpline procedures.',
    verifiedTag: 'National Consumer Helpline & e-Daakhil'
  },
  {
    id: 'cybercrime',
    title: 'Cybercrime & Financial Fraud',
    icon: ShieldAlert,
    description: 'Unauthorized UPI/bank transfers, phishing, online scams, 1930 Golden Hour helpline, and cyber police complaint filing.',
    verifiedTag: 'Helpline 1930 & MHA Portal'
  },
  {
    id: 'government_grievance',
    title: 'Public Services & CPGRAMS',
    icon: Landmark,
    description: 'Central government administrative delays, pensions, public sector banking grievances, and DARPG portal appeals.',
    verifiedTag: 'CPGRAMS Portal (pgportal.gov.in)'
  },
  {
    id: 'rental_dispute',
    title: 'Tenancy & Security Deposits',
    icon: Home,
    description: 'Withholding of residential security deposit, unlawful eviction threats, and dispute adjudication under Rent Authorities.',
    verifiedTag: 'Model Tenancy Act & State Rent Authorities'
  },
  {
    id: 'unpaid_wages',
    title: 'Unpaid Wages & Salary Delays',
    icon: Briefcase,
    description: 'Unpaid salary dues, delayed settlements, unlawful wage deductions, and industrial conciliation through the Labour Commissioner.',
    verifiedTag: 'SAMADHAN Labour Portal (samadhan.labour.gov.in)'
  }
];

export default function LandingPage({ onStartChat, onOpenSimplifier }) {
  return (
    <div className="main-content">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <CheckCircle2 size={13} />
          <span>Source-Grounded Indian Legal Navigation</span>
        </div>

        <h1 className="hero-title">
          Understand your options.<br />
          Find the right next step.
        </h1>

        <p className="hero-description">
          Describe your legal issue or public grievance in everyday language.
          NyayaAccess retrieves verified official government guidelines, explains relevant rights in plain words, and connects you directly to official dispute portals.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onStartChat(null)}>
            <span>Get Legal Help</span>
            <ArrowRight size={16} />
          </button>
          <button
            className="btn-secondary"
            onClick={onOpenSimplifier}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileText size={16} />
            <span>Simplify Legal Document</span>
          </button>
        </div>
      </section>

      {/* Document Simplifier Spotlight Banner */}
      <section style={{ maxWidth: '1040px', margin: '0 auto 2.5rem auto', padding: '0 1.5rem', width: '100%' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(36, 87, 167, 0.05) 0%, rgba(36, 87, 167, 0.02) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem 1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem'
        }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
              <FileText size={14} />
              <span>Document Intelligence</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--color-text-primary)' }}>
              Have a legal notice, agreement, or formal letter to understand?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Upload a PDF or paste complex contract text. NyayaAccess redacts personal identifiers (Aadhaar, PAN, card numbers), decodes confusing legalese, flags critical clauses, and matches official remedies.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={onOpenSimplifier}
            style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
          >
            <FileText size={15} style={{ marginRight: '0.375rem' }} />
            Try Document Simplifier
          </button>
        </div>
      </section>

      {/* 2. Category Shortcuts */}
      <section className="categories-container">
        <div className="section-label">Supported Legal Pathways</div>
        <div className="category-grid">
          {VERIFIED_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => onStartChat(cat.id)}
              >
                <div className="category-icon-wrapper">
                  <Icon size={20} />
                </div>
                <h3 className="category-title">{cat.title}</h3>
                <p className="category-description">{cat.description}</p>
                <div className="category-footer">
                  <span>{cat.verifiedTag}</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Three-Step How It Works (FRONTEND_DESIGN.md Section 4.1) */}
      <section style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>How It Works</div>
          <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, marginBottom: '2.5rem' }}>
            A structured path from confusion to clear action
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '1.5rem', background: 'var(--color-page)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-soft-blue)', color: 'var(--color-primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '1rem' }}>
                <FileSearch size={18} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Describe the Issue</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Explain your problem in simple words. Answer focused follow-up questions if important jurisdictional facts are missing.
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--color-page)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-soft-blue)', color: 'var(--color-primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '1rem' }}>
                <BookOpen size={18} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Review Verified Evidence</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                The assistant searches our curated knowledge base of official acts and government portals, presenting plain explanations backed by official links.
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--color-page)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-soft-blue)', color: 'var(--color-primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '1rem' }}>
                <Compass size={18} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Take Cautious Next Steps</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Receive a practical checklist: toll-free helplines, official grievance URLs, documentation requirements, and when to seek an advocate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Transparency & Privacy Section */}
      <section style={{ maxWidth: '1040px', margin: '0 auto', padding: '3.5rem 1.5rem', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div className="section-label">Trust & Transparency</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
              Responsible AI for Legal Navigation
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              NyayaAccess does not guess or generate unsupported legal conclusions from model memory.
              Every guidance point is grounded in human-verified records from official gazettes and portals.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
                <CheckCircle2 size={16} color="#16803D" />
                <span>Zero fabricated statutes or fake helpline numbers</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
                <CheckCircle2 size={16} color="#16803D" />
                <span>Explicit uncertainty indicators when records are insufficient</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
                <Lock size={16} color="#2457A7" />
                <span>Privacy by default: no Aadhaar, PAN, or passwords collected</span>
              </li>
            </ul>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Verified Official Portals</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Direct access to trusted public grievance and dispute resolution mechanisms:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: 'var(--color-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span>National Consumer Helpline (NCH 1915)</span>
                <ExternalLink size={13} />
              </a>
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: 'var(--color-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span>National Cyber Crime Portal (Helpline 1930)</span>
                <ExternalLink size={13} />
              </a>
              <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: 'var(--color-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span>CPGRAMS Central Public Grievances</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Institutional Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            NyayaAccess — Public Legal Information & Navigation Assistant
          </p>
          <p>
            Disclaimer: NyayaAccess provides general public legal information grounded in verified official sources. It is not a law firm, lawyer, court, or government authority, and does not provide formal legal representation or legal opinions.
          </p>
        </div>
      </footer>
    </div>
  );
}
