import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Link2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Compass,
  RotateCcw,
  FileCode,
} from 'lucide-react';
import GithubIcon from '../components/GithubIcon';
import Button from '../components/Button';
import { sampleAnalysisSteps } from '../data/sampleData';
import { showToast } from '../utils/toast';
import './ConnectRepoPage.css';

/**
 * Page 3: Connect Repository
 * Clean, form-focused developer ingestion workflow with validation,
 * restrained progress stepping, and clear next actions.
 */
export default function ConnectRepoPage() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('https://github.com/facebook/react');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [urlError, setUrlError] = useState('');
  const [phase, setPhase] = useState('form'); // 'form' | 'analyzing' | 'success' | 'error'
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [connectedRepoId, setConnectedRepoId] = useState('repo-001');

  const sampleBranches = [
    'main',
    'master',
    'develop',
    'staging',
    'feature/onboarding-v1',
    'release/v2.4',
  ];

  const validateUrl = (url) => {
    if (!url.trim()) {
      return 'Repository URL is required.';
    }
    const githubRegex = /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/;
    if (!githubRegex.test(url.trim())) {
      return 'Please enter a valid GitHub repository URL (e.g. https://github.com/facebook/react).';
    }
    return '';
  };

  const handleStartAnalysis = (forceError = false) => {
    const error = validateUrl(repoUrl);
    if (error && !forceError) {
      setUrlError(error);
      return;
    }
    setUrlError('');
    setPhase('analyzing');
    setCurrentStepIndex(0);
    setCompletedSteps([]);

    let stepIdx = 0;
    const steps = sampleAnalysisSteps;

    const runStep = () => {
      if (forceError && stepIdx === 2) {
        setTimeout(() => {
          setPhase('error');
          showToast('Analysis paused: Simulated rate-limit response.', 'error');
        }, 700);
        return;
      }

      if (stepIdx < steps.length) {
        setCurrentStepIndex(stepIdx);
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, stepIdx]);
          stepIdx++;
          runStep();
        }, steps[stepIdx].duration * 0.7); // slightly snappier
      } else {
        setPhase('success');
        setConnectedRepoId('repo-001');
        showToast('Repository parsed and AST ready.', 'success');
      }
    };

    runStep();
  };

  return (
    <div className="cv-connect-page">
      <div className="cv-connect-header">
        <h1 className="cv-connect-title">Connect Repository</h1>
        <p className="cv-connect-desc">
          Enter a GitHub repository URL to index its directory structure, dependencies, and onboarding tasks.
        </p>
      </div>

      {/* GitHub Connection Status */}
      <div className="cv-connect-status-box">
        <div className="cv-connect-status-box__icon">
          <GithubIcon size={18} />
        </div>
        <div className="cv-connect-status-box__body">
          <div className="cv-connect-status-box__title-row">
            <span>GitHub Connection</span>
            <span className="cv-status-pill cv-status-pill--demo">Demo Mode (Unlinked OAuth)</span>
          </div>
          <p className="cv-connect-status-box__note">
            Real OAuth tokens are not required during frontend preview. Any valid GitHub URL can be tested.
          </p>
        </div>
      </div>

      {/* PHASE 1: Form Input */}
      {phase === 'form' && (
        <div className="cv-connect-card">
          <div className="cv-connect-field">
            <label htmlFor="repo-url-input" className="cv-connect-label">
              <span>Repository URL</span>
              <span className="cv-connect-req">*</span>
            </label>
            <div className="cv-connect-input-wrap">
              <Link2 size={16} className="cv-connect-input-icon" />
              <input
                id="repo-url-input"
                type="url"
                className={`cv-connect-input ${urlError ? 'cv-connect-input--error' : ''}`}
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setUrlError('');
                }}
              />
            </div>
            {urlError ? (
              <p className="cv-connect-error-text">
                <AlertCircle size={13} />
                <span>{urlError}</span>
              </p>
            ) : (
              <p className="cv-connect-hint-text">
                Public repositories or authorized GitHub organizations.
              </p>
            )}
          </div>

          <div className="cv-connect-field">
            <label htmlFor="branch-select" className="cv-connect-label">
              <span>Target Branch</span>
            </label>
            <div className="cv-connect-input-wrap">
              <GitBranch size={16} className="cv-connect-input-icon" />
              <select
                id="branch-select"
                className="cv-connect-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                {sampleBranches.map((b) => (
                  <option key={b} value={b}>
                    {b} {b === 'main' || b === 'master' ? '(default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cv-connect-actions">
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight size={16} />}
              onClick={() => handleStartAnalysis(false)}
            >
              Connect &amp; Analyze
            </Button>

            <button
              type="button"
              className="cv-connect-simulate-error-btn"
              onClick={() => handleStartAnalysis(true)}
            >
              Simulate Ingestion Error
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: Restrained Step Progress */}
      {phase === 'analyzing' && (
        <div className="cv-connect-card">
          <div className="cv-connect-progress-head">
            <div className="cv-btn__spinner" />
            <div>
              <h3>Parsing Repository Structure</h3>
              <p>Analyzing AST definitions, imports, and component trees...</p>
            </div>
          </div>

          <div className="cv-connect-stepper">
            {sampleAnalysisSteps.map((step, idx) => {
              const isCompleted = completedSteps.includes(idx);
              const isActive = currentStepIndex === idx && !isCompleted;
              return (
                <div
                  key={step.id}
                  className={`cv-step-row ${isCompleted ? 'cv-step-row--done' : ''} ${isActive ? 'cv-step-row--active' : ''}`}
                >
                  <div className="cv-step-indicator" aria-hidden="true">
                    {isCompleted ? (
                      <CheckCircle2 size={16} />
                    ) : isActive ? (
                      <div className="cv-step-spinner" />
                    ) : (
                      <span className="cv-step-dot" />
                    )}
                  </div>
                  <div className="cv-step-content">
                    <span className="cv-step-label">{step.label}</span>
                    {isActive && <span className="cv-step-status">Indexing...</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PHASE 3: Success State */}
      {phase === 'success' && (
        <div className="cv-connect-card cv-connect-card--success">
          <div className="cv-connect-result-icon cv-connect-result-icon--success" aria-hidden="true">
            <CheckCircle2 size={36} />
          </div>
          <h2>Repository Connected</h2>
          <p className="cv-connect-result-desc">
            AST indexing is complete for <code>{repoUrl}</code> on branch <code>{selectedBranch}</code>.
            File hierarchy and dependency relations are ready.
          </p>

          <div className="cv-connect-result-buttons">
            <Button
              variant="primary"
              size="md"
              icon={<Compass size={16} />}
              onClick={() => navigate(`/repository/${connectedRepoId}`)}
            >
              Repository Overview
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<FileCode size={16} />}
              onClick={() => navigate(`/explorer/${connectedRepoId}`)}
            >
              Codebase Explorer
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPhase('form');
                setCompletedSteps([]);
              }}
            >
              Connect Another
            </Button>
          </div>
        </div>
      )}

      {/* PHASE 4: Error State */}
      {phase === 'error' && (
        <div className="cv-connect-card cv-connect-card--error">
          <div className="cv-connect-result-icon cv-connect-result-icon--error" aria-hidden="true">
            <AlertCircle size={36} />
          </div>
          <h2>Connection Interrupted</h2>
          <p className="cv-connect-result-desc">
            Simulation encountered a rate limit or unreachable repository endpoint.
          </p>

          <div className="cv-connect-result-buttons">
            <Button
              variant="primary"
              size="md"
              icon={<RotateCcw size={16} />}
              onClick={() => setPhase('form')}
            >
              Try Again
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
