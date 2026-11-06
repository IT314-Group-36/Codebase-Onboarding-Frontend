import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Box,
  Boxes,
  Code2,
  GitBranch,
  Star,
  GitFork,
  Clock,
  FolderTree,
  MessageSquare,
  Layers,
  ArrowRight,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import AskQuestionsModal from '../components/AskQuestionsModal';
import { sampleRepositories } from '../data/sampleData';
import './RepoOverviewPage.css';

/**
 * Page 4: Repository Overview (Liquid Chrome & Amber)
 * Technical repository report detailing AST statistics, technology stack,
 * important entry files, architectural summary, and activity timeline.
 */
export default function RepoOverviewPage() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [repo, setRepo] = useState(null);
  const [askModalOpen, setAskModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const found = sampleRepositories.find((r) => r.id === repoId);
      setRepo(found || sampleRepositories[0]);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [repoId]);

  if (loading) {
    return <LoadingState message="Loading repository specifications..." fullPage />;
  }

  if (!repo) {
    return (
      <div className="cv-repo-not-found">
        <h2>Repository Not Found</h2>
        <p>The requested repository does not exist in local fixtures.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Dark Aurora accent palette for language distribution bar (warm amber, soft blue, electric blue, slate)
  const warmLangColors = ['#F5A524', '#4C9AFF', '#1F6FEB', '#C4845C', '#7B96B2'];

  const importantFilesList = [
    {
      path: 'src/App.jsx',
      type: 'Entrypoint',
      summary: 'Configures client routing, AuthProvider context wrapper, and layout scaffold.',
    },
    {
      path: 'src/utils/api.js',
      type: 'HTTP Client',
      summary: 'Centralized network wrapper handling JWT authorization injection and status normalization.',
    },
    {
      path: 'src/hooks/useAuth.js',
      type: 'Session Hook',
      summary: 'Provides reactive session status, login/logout dispatchers, and token credentials.',
    },
    {
      path: 'src/components/Chart.jsx',
      type: 'SVG Component',
      summary: 'Renders dynamic time-series sparklines with responsive vector coordinates.',
    },
    {
      path: 'package.json',
      type: 'Manifest',
      summary: 'Declares runtime ecosystem modules (React 19, Lucide, Zustand) and Vite build scripts.',
    },
  ];

  const recentTimeline = [
    { label: 'Initial AST index completed', time: '14 minutes ago', icon: <FileCheck size={14} /> },
    { label: 'Module dependency edges verified', time: '16 minutes ago', icon: <Layers size={14} /> },
    { label: '6 onboarding milestone quests generated', time: '18 minutes ago', icon: <CheckCircle2 size={14} /> },
    { label: 'GitHub branch main synchronized', time: '20 minutes ago', icon: <GitBranch size={14} /> },
  ];

  const handleOpenFileInExplorer = (filePath) => {
    navigate(`/explorer/${repo.id}?file=${encodeURIComponent(filePath)}`);
  };

  return (
    <div className="cv-repo-overview">
      {/* Workspace Header */}
      <section className="cv-ro-header">
        <div className="cv-ro-header__main">
          <div className="cv-ro-header__title-row">
            <span className="cv-ro-owner">{repo.owner} /</span>
            <h1 className="cv-ro-name">{repo.name}</h1>
            <StatusBadge status={repo.status} />
          </div>
          <p className="cv-ro-desc">{repo.description}</p>
          <div className="cv-ro-meta">
            <span className="cv-ro-meta-item">
              <GitBranch size={13} /> <code>{repo.branch}</code>
            </span>
            <span className="cv-ro-meta-item">
              <Star size={13} /> {repo.stars.toLocaleString()} stars
            </span>
            <span className="cv-ro-meta-item">
              <GitFork size={13} /> {repo.forks} forks
            </span>
            <span className="cv-ro-meta-item">
              <Clock size={13} /> Connected {new Date(repo.connectedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="cv-ro-header__actions">
          <Button
            variant="secondary"
            size="md"
            icon={<Boxes size={15} />}
            onClick={() => navigate(`/dependencies/${repo.id}`)}
          >
            Module Map
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={<CheckCircle2 size={15} />}
            onClick={() => navigate(`/onboarding/${repo.id}`)}
          >
            Onboarding
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={<MessageSquare size={15} />}
            onClick={() => navigate(`/qa/${repo.id}`)}
          >
            Codebase Q&A
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<FolderTree size={15} />}
            onClick={() => navigate(`/explorer/${repo.id}`)}
          >
            Codebase Explorer
          </Button>
        </div>
      </section>

      {/* Compact Metrics Strip */}
      <section className="cv-ro-metrics-strip" aria-label="AST Metrics">
        <div className="cv-ro-metric-cell">
          <div className="cv-ro-metric-cell__label">
            <FileText size={14} />
            <span>Files</span>
          </div>
          <span className="cv-ro-metric-cell__value">{repo.stats.files}</span>
        </div>

        <div className="cv-ro-metric-cell">
          <div className="cv-ro-metric-cell__label">
            <Box size={14} />
            <span>Modules</span>
          </div>
          <span className="cv-ro-metric-cell__value">{repo.stats.modules}</span>
        </div>

        <div className="cv-ro-metric-cell">
          <div className="cv-ro-metric-cell__label">
            <Code2 size={14} />
            <span>Functions</span>
          </div>
          <span className="cv-ro-metric-cell__value">{repo.stats.functions}</span>
        </div>

        <div className="cv-ro-metric-cell">
          <div className="cv-ro-metric-cell__label">
            <Layers size={14} />
            <span>Components</span>
          </div>
          <span className="cv-ro-metric-cell__value">{repo.stats.components}</span>
        </div>
      </section>

      {/* Grid: Languages + Architecture Digest */}
      <div className="cv-ro-grid">
        {/* Languages & Detected Technologies (Warm Accent Distribution Bar) */}
        <div className="cv-ro-card">
          <h2 className="cv-ro-card__title">Languages &amp; Technologies</h2>
          <div className="cv-ro-lang-list">
            {Object.entries(repo.languages).map(([lang, pct], idx) => {
              const barColor = warmLangColors[idx % warmLangColors.length];
              return (
                <div key={lang} className="cv-ro-lang-item">
                  <div className="cv-ro-lang-item__head">
                    <span className="cv-ro-lang-item__name">
                      <span
                        className="cv-ro-lang-item__dot"
                        style={{ backgroundColor: barColor }}
                        aria-hidden="true"
                      />
                      {lang}
                    </span>
                    <span className="cv-ro-lang-item__pct">{pct}%</span>
                  </div>
                  <div className="cv-ro-lang-track">
                    <div
                      className="cv-ro-lang-fill"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cv-ro-tech-chips">
            <span className="cv-ro-tech-label">Detected stack:</span>
            <div className="cv-ro-tech-tags">
              {repo.technologies.map((t) => (
                <span key={t} className="cv-ro-tech-tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Architecture Digest */}
        <div className="cv-ro-card">
          <h2 className="cv-ro-card__title">Architecture Summary</h2>
          <div className="cv-ro-arch-body">
            <p className="cv-ro-arch-para">
              <strong>Layered Client Architecture:</strong> This codebase utilizes Vite as an ES module bundler and React 19 for component composition.
            </p>
            <ul className="cv-ro-arch-points">
              <li>
                <strong>Data Ingestion:</strong> Requests flow through <code>src/utils/api.js</code> with centralized error handling.
              </li>
              <li>
                <strong>State &amp; Auth:</strong> Authentication state is broadcast via <code>AuthProvider</code> in <code>useAuth.js</code>.
              </li>
              <li>
                <strong>UI Visualization:</strong> High-density dashboards use vector SVG sparklines in <code>src/components/Chart.jsx</code>.
              </li>
            </ul>
            <div className="cv-ro-ai-digest-badge">
              <span>Simulated AI Analysis Digest · Ready for backend LLM inference</span>
            </div>
          </div>
        </div>

        {/* Key Files & Entry Points */}
        <div className="cv-ro-card cv-ro-card--wide">
          <div className="cv-ro-card__head-row">
            <h2 className="cv-ro-card__title">Key Files &amp; Entry Points</h2>
            <span className="cv-ro-card__sublabel">Click any file to inspect in Codebase Explorer</span>
          </div>

          <div className="cv-ro-important-files">
            {importantFilesList.map((f) => (
              <div
                key={f.path}
                className="cv-ro-file-row"
                onClick={() => handleOpenFileInExplorer(f.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenFileInExplorer(f.path)}
              >
                <div className="cv-ro-file-row__title">
                  <FileText size={15} className="cv-ro-file-row__icon" />
                  <code>{f.path}</code>
                  <span className="cv-ro-file-badge">{f.type}</span>
                </div>
                <p className="cv-ro-file-row__desc">{f.summary}</p>
                <div className="cv-ro-file-row__open" aria-hidden="true">
                  <span>Inspect</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="cv-ro-card cv-ro-card--wide">
          <h2 className="cv-ro-card__title">Recent Analysis Activity</h2>
          <div className="cv-ro-timeline">
            {recentTimeline.map((item, idx) => (
              <div key={idx} className="cv-ro-timeline__item">
                <div className="cv-ro-timeline__point" aria-hidden="true">
                  {item.icon}
                </div>
                <div className="cv-ro-timeline__content">
                  <span className="cv-ro-timeline__label">{item.label}</span>
                  <span className="cv-ro-timeline__time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ask Questions Modal */}
      <AskQuestionsModal
        open={askModalOpen}
        onClose={() => setAskModalOpen(false)}
        repo={repo}
      />
    </div>
  );
}
