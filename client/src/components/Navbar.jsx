import React from 'react';
import { Scale, MessageSquare, History, Home } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  return (
    <header className="header">
      <div className="brand-wrapper" onClick={() => setActivePage('landing')}>
        <div className="brand-badge">
          <Scale size={18} />
        </div>
        <div>
          <div className="brand-title">NyayaAccess</div>
          <div className="brand-subtitle">Indian Legal & Public Service Assistant</div>
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-btn ${activePage === 'landing' ? 'active' : ''}`}
          onClick={() => setActivePage('landing')}
        >
          <Home size={16} />
          <span>Home</span>
        </button>
        <button
          className={`nav-btn ${activePage === 'chat' ? 'active' : ''}`}
          onClick={() => setActivePage('chat')}
        >
          <MessageSquare size={16} />
          <span>Legal Assistant</span>
        </button>
      </nav>
    </header>
  );
}
