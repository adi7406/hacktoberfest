import React from 'react';
import { ShoppingBag, ShieldAlert, Landmark, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  }
];

export default function LandingPage({ onStartChat }) {
  return (
    <div className="main-content">
      <section className="hero-section">
        <div className="hero-pill">
          <CheckCircle2 size={13} />
          <span>Verified Indian Legal Knowledge Base</span>
        </div>

        <h1 className="hero-title">
          Understand Your Legal Rights.<br />
          Backed by Verified Official Portals.
        </h1>

        <p className="hero-description">
          Describe your legal issue or public grievance in plain language.
          NyayaAccess retrieves verified official government guidelines, outlines practical next steps, and provides direct links to dispute resolution portals.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onStartChat(null)}>
            <span>Get Legal Help</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

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
    </div>
  );
}
