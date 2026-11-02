import { useState } from 'react';
import { Sparkles, Send, X, FileText } from 'lucide-react';
import Button from './Button';
import { askCodebaseQuestion } from '../services/api';
import './AskQuestionsModal.css';

/**
 * Ask Questions Modal — Codebase AI Companion interactive query interface.
 */
export default function AskQuestionsModal({ open, onClose, repo }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your Codeverse Assistant for ${repo?.fullName || 'this repository'}. Ask me anything about file architecture, authentication flow, or where to begin onboarding!`,
    },
  ]);

  if (!open) return null;

  const handleAsk = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setQuery('');
    setConversation((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await askCodebaseQuestion(repo?.id, userText);
      if (res.success) {
        setConversation((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: res.answer,
            referencedFiles: res.referencedFiles,
          },
        ]);
      }
    } catch {
      setConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I encountered a temporary simulation issue. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Where is authentication handled?',
    'How do API requests communicate with the backend?',
    'Which component renders the live charts?',
  ];

  return (
    <div className="cv-ask-overlay" onClick={onClose} role="presentation">
      <div
        className="cv-ask-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cv-ask-modal__header">
          <div className="cv-ask-modal__title-box">
            <div className="cv-ask-modal__spark" aria-hidden="true">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 id="ask-modal-title" className="cv-ask-modal__title">Ask CODEVERSE</h3>
              <p className="cv-ask-modal__sub">AI Codebase Companion · Demo Simulation</p>
            </div>
          </div>
          <button
            type="button"
            className="cv-ask-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="cv-ask-modal__body">
          <div className="cv-ask-messages">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`cv-ask-msg cv-ask-msg--${msg.sender}`}
              >
                <div className="cv-ask-msg__bubble">
                  <p>{msg.text}</p>
                  {msg.referencedFiles && (
                    <div className="cv-ask-msg__refs">
                      <span className="cv-ask-msg__refs-title">Referenced modules:</span>
                      {msg.referencedFiles.map((file) => (
                        <span key={file} className="cv-ask-msg__file">
                          <FileText size={12} />
                          <code>{file}</code>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="cv-ask-msg cv-ask-msg--assistant">
                <div className="cv-ask-msg__bubble cv-ask-msg__loading">
                  <span className="cv-btn__spinner" />
                  <span>Analyzing code nodes...</span>
                </div>
              </div>
            )}
          </div>

          <div className="cv-ask-prompts">
            <span className="cv-ask-prompts__label">Suggested queries:</span>
            <div className="cv-ask-prompts__list">
              {samplePrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="cv-ask-prompt-chip"
                  onClick={() => setQuery(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleAsk} className="cv-ask-modal__footer">
          <input
            type="text"
            className="cv-ask-input"
            placeholder="Ask about project architecture, entrypoints, or functions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="primary"
            icon={<Send size={16} />}
            disabled={!query.trim() || loading}
            loading={loading}
          >
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
}
