import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function LegalDisclaimer({ customText }) {
  return (
    <div className="disclaimer-banner" role="status">
      <AlertCircle size={15} style={{ flexShrink: 0 }} />
      <span>
        {customText || 'NyayaAccess provides general public legal information grounded in verified official sources. It is not a law firm, lawyer, or court, and does not provide formal legal representation.'}
      </span>
    </div>
  );
}
