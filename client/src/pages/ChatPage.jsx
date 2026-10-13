import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  PlusCircle,
  Clock,
  Shield,
  User,
  AlertTriangle,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  sendChatMessage,
  getConversations,
  getConversation
} from '../services/api';
import SourceCard from '../components/SourceCard';
import LegalDisclaimer from '../components/LegalDisclaimer';

const EXAMPLE_QUESTIONS = [
  {
    text: "I bought a mobile phone online that stopped working in 3 days. The seller is refusing a refund or replacement.",
    category: "consumer_complaint"
  },
  {
    text: "Money was debited from my bank account through an unauthorized UPI link 30 minutes ago. What should I do immediately?",
    category: "cybercrime"
  },
  {
    text: "My central government pension payment has been delayed for several months without explanation from the department.",
    category: "government_grievance"
  }
];

export default function ChatPage({ initialCategory, onResetCategory }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadConversationList();
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function loadConversationList() {
    try {
      const list = await getConversations();
      if (Array.isArray(list)) {
        setConversations(list);
      }
    } catch (e) {
      console.warn('Could not load conversations:', e.message);
    }
  }

  async function handleSelectConversation(id) {
    if (id === currentConversationId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const conv = await getConversation(id);
      setCurrentConversationId(conv.id);
      setMessages(conv.messages || []);
    } catch (e) {
      setErrorMessage('Could not load selected conversation.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleStartNewChat() {
    setCurrentConversationId(null);
    setMessages([]);
    setInputMessage('');
    setErrorMessage(null);
    if (onResetCategory) onResetCategory();
  }

  async function handleSendMessage(customText = null, customCat = null) {
    const textToSend = (customText !== null ? customText : inputMessage).trim();
    if (!textToSend || isLoading) return;

    const catToSend = customCat !== null ? customCat : selectedCategory;
    setErrorMessage(null);

    // Optimistically add user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        conversationId: currentConversationId,
        message: textToSend,
        category: catToSend
      });

      setCurrentConversationId(response.conversationId);

      const assistantMsg = {
        id: response.message.id,
        role: 'assistant',
        content: response.message.content,
        kind: response.message.kind,
        sources: response.sources || [],
        created_at: response.message.createdAt || new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);
      loadConversationList();
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while contacting the assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function renderFormattedContent(content) {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx}>{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
        return <p key={idx} style={{ paddingLeft: '0.75rem', fontWeight: 500 }}>{line}</p>;
      }
      if (line.startsWith('- ')) {
        return <p key={idx} style={{ paddingLeft: '0.75rem', color: 'var(--color-text-secondary)' }}>• {line.slice(2)}</p>;
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '0.5rem' }} />;
      }
      return <p key={idx}>{line}</p>;
    });
  }

  return (
    <div className="chat-layout">
      {/* Sidebar: History */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">Consultations</span>
          <button
            className="nav-btn"
            style={{ padding: '0.25rem 0.5rem' }}
            onClick={handleStartNewChat}
            title="Start New Chat"
          >
            <PlusCircle size={16} />
            <span>New</span>
          </button>
        </div>

        <div className="conversation-history-list">
          {conversations.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
              No previous consultations
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.title || 'Legal Consultation'}
                </span>
                <span className="conversation-date">
                  <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  {new Date(conv.updated_at || conv.created_at).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <LegalDisclaimer />

        <div className="chat-transcript">
          {messages.length === 0 ? (
            <div className="welcome-container">
              <h2 className="welcome-title">How can NyayaAccess assist you today?</h2>
              <p className="welcome-subtitle">
                Select an example situation below or enter your own issue to retrieve verified official procedures and helplines.
              </p>

              <div className="example-prompts">
                {EXAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    className="example-prompt-btn"
                    onClick={() => handleSendMessage(q.text, q.category)}
                  >
                    "{q.text}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={msg.id || index} className={`chat-message ${msg.role}`}>
                <div className={`message-avatar ${msg.role}`}>
                  {msg.role === 'assistant' ? <Shield size={18} /> : <User size={18} />}
                </div>

                <div className="message-bubble">
                  {msg.role === 'assistant' && msg.kind && (
                    <div className={`kind-badge ${msg.kind}`}>
                      {msg.kind === 'guidance' && <FileText size={12} />}
                      {msg.kind === 'clarification' && <HelpCircle size={12} />}
                      {msg.kind === 'insufficient_evidence' && <AlertTriangle size={12} />}
                      <span>{msg.kind.replace('_', ' ')}</span>
                    </div>
                  )}

                  <div className="message-content">
                    {renderFormattedContent(msg.content)}
                  </div>

                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="sources-section">
                      <div className="sources-header">
                        <Shield size={12} color="#16803D" />
                        <span>Verified Government Sources ({msg.sources.length})</span>
                      </div>
                      <div className="source-cards-grid">
                        {msg.sources.map((src, sIdx) => (
                          <SourceCard key={src.id || sIdx} source={src} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="chat-message assistant">
              <div className="message-avatar assistant">
                <Shield size={18} />
              </div>
              <div className="message-bubble" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Retrieving verified legal records and generating guidance...
              </div>
            </div>
          )}

          {errorMessage && (
            <div style={{
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              border: '1px solid rgba(180, 35, 24, 0.2)'
            }}>
              {errorMessage}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="chat-input-bar">
          <div className="input-container">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your legal issue, consumer grievance, or cyber incident..."
              className="chat-textarea"
              disabled={isLoading}
            />
            <button
              className="submit-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              title="Send message"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="input-hint">
            Press Enter to submit • Shift+Enter for new line
          </div>
        </div>
      </main>
    </div>
  );
}
