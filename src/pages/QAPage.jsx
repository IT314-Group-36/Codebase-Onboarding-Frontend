import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Sparkles,
  ArrowLeft,
  GitBranch,
  FolderTree,
  FileCode,
  ExternalLink,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { askCodebaseQuestion, getRepositoryById } from '../services/api';
import LoadingState from '../components/LoadingState';
import Button from '../components/Button';
import './QAPage.css';

const INITIAL_MESSAGES = [
  {
    id: 'msg-init',
    sender: 'assistant',
    text: "Hello! I am your CODEVERSE Codebase Companion. I've indexed this repository's syntax tree and module dependency graph. Ask me anything about how the architecture is structured, where specific lifecycles are handled, or where to start onboarding.",
    confidence: 0.98,
    referencedFiles: ['src/App.jsx', 'package.json'],
    timestamp: 'Just now',
  },
];

const SUGGESTED_QUESTIONS = [
  'How is authentication handled in this repository?',
  'Where is the HTTP / API client configured?',
  'What are the dependencies of the Chart component?',
  'Give me a step-by-step onboarding walkthrough',
];

/**
 * Page: Dedicated AI Codebase Q&A Interface
 * Full-page intelligent codebase assistant with multi-turn conversation history,
 * suggested prompts, confidence indicators, and deep links into source files.
 */
export default function QAPage() {
  const { repoId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [repo, setRepo] = useState(null);
  const [inputQuery, setInputQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const messagesEndRef = useRef(null);
  const messageSeqRef = useRef(1);

  useEffect(() => {
    let isMounted = true;
    async function loadRepo() {
      setLoading(true);
      try {
        const res = await getRepositoryById(repoId);
        if (isMounted && res.success) {
          setRepo(res.repository);
        }
      } catch (err) {
        console.error('Failed to load repo for QA:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRepo();
    return () => {
      isMounted = false;
    };
  }, [repoId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const handleSend = useCallback(async (queryText) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isAsking) return;

    messageSeqRef.current += 1;
    const currentSeq = messageSeqRef.current;

    const userMsg = {
      id: `usr-${currentSeq}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsAsking(true);

    try {
      const res = await askCodebaseQuestion(repoId, q);
      messageSeqRef.current += 1;
      const aiMsg = {
        id: `ai-${messageSeqRef.current}`,
        sender: 'assistant',
        text: res.answer || 'I parsed the codebase AST but did not locate matching symbols for that query.',
        confidence: res.confidence || 0.92,
        referencedFiles: res.referencedFiles || ['src/App.jsx'],
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      messageSeqRef.current += 1;
      const errorMsg = {
        id: `err-${messageSeqRef.current}`,
        sender: 'assistant',
        text: 'Encountered a network timeout communicating with the codebase intelligence provider. Please retry.',
        confidence: 0,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  }, [inputQuery, isAsking, repoId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        sender: 'assistant',
        text: 'Conversation history cleared. How else can I assist your codebase exploration?',
        confidence: 1.0,
        referencedFiles: ['src/App.jsx'],
        timestamp: 'Just now',
      },
    ]);
  };

  if (loading) {
    return <LoadingState message="Connecting to codebase intelligence assistant..." fullPage />;
  }

  const effectiveRepo = repo || {
    id: repoId,
    name: 'react-dashboard',
    owner: 'alexrivera',
    branch: 'main',
  };

  return (
    <div className="cv-qa-page">
      {/* Top Header */}
      <header className="cv-qa-header">
        <div className="cv-qa-header__left">
          <button
            type="button"
            className="cv-qa-back-btn"
            onClick={() => navigate(`/repository/${repoId}`)}
            title="Back to Repository Overview"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="cv-qa-title-row">
              <span className="cv-qa-owner">{effectiveRepo.owner} /</span>
              <h1 className="cv-qa-name">{effectiveRepo.name}</h1>
              <span className="cv-qa-branch-chip">
                <GitBranch size={12} /> {effectiveRepo.branch}
              </span>
            </div>
            <p className="cv-qa-subtitle">AI Codebase Intelligence & AST Architecture Q&A</p>
          </div>
        </div>

        <div className="cv-qa-header__actions">
          <Button
            variant="secondary"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={handleClearChat}
          >
            Clear Thread
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<FolderTree size={14} />}
            onClick={() => navigate(`/explorer/${repoId}`)}
          >
            Code Explorer
          </Button>
        </div>
      </header>

      {/* Main Conversation Container */}
      <div className="cv-qa-body">
        {/* Suggested Prompt Chips */}
        <div className="cv-qa-suggestions">
          <span className="cv-qa-suggestions__title">
            <Sparkles size={13} />
            <span>Suggested Inquiries:</span>
          </span>
          <div className="cv-qa-suggestions__chips">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                type="button"
                className="cv-qa-chip"
                onClick={() => handleSend(q)}
                disabled={isAsking}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed */}
        <div className="cv-qa-feed">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`cv-qa-msg ${isUser ? 'cv-qa-msg--user' : 'cv-qa-msg--assistant'}`}
              >
                <div className="cv-qa-msg__avatar">
                  {isUser ? 'ME' : <Sparkles size={15} />}
                </div>

                <div className="cv-qa-msg__content">
                  <div className="cv-qa-msg__bubble">
                    <p className="cv-qa-msg__text">{msg.text}</p>

                    {/* Referenced Files Chips */}
                    {msg.referencedFiles && msg.referencedFiles.length > 0 && (
                      <div className="cv-qa-msg__files">
                        <span className="cv-qa-msg__files-label">Referenced Files:</span>
                        <div className="cv-qa-msg__files-list">
                          {msg.referencedFiles.map((file) => (
                            <button
                              key={file}
                              type="button"
                              className="cv-qa-file-chip"
                              onClick={() =>
                                navigate(`/explorer/${repoId}?file=${encodeURIComponent(file)}`)
                              }
                              title={`Deep-link to ${file} in Code Explorer`}
                            >
                              <FileCode size={12} />
                              <code>{file}</code>
                              <ExternalLink size={10} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="cv-qa-msg__meta">
                    <span className="cv-qa-msg__time">{msg.timestamp}</span>
                    {!isUser && msg.confidence && (
                      <span className="cv-qa-msg__conf">
                        <CheckCircle2 size={11} style={{ color: 'var(--cv-success)' }} />
                        <span>{Math.round(msg.confidence * 100)}% Confidence</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isAsking && (
            <div className="cv-qa-msg cv-qa-msg--assistant">
              <div className="cv-qa-msg__avatar">
                <Sparkles size={15} />
              </div>
              <div className="cv-qa-msg__content">
                <div className="cv-qa-msg__bubble cv-qa-msg__bubble--typing">
                  <span className="cv-qa-typing-dot" />
                  <span className="cv-qa-typing-dot" />
                  <span className="cv-qa-typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="cv-qa-input-strip">
          <form
            className="cv-qa-input-box"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="cv-qa-input-field"
              placeholder="Ask about architecture, functions, hooks, state flow..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAsking}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Send size={15} />}
              disabled={!inputQuery.trim() || isAsking}
            >
              Ask
            </Button>
          </form>
          <div className="cv-qa-input-footer">
            <span>Press <strong>Enter</strong> to send. All responses synthesized from local repository AST intelligence.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
