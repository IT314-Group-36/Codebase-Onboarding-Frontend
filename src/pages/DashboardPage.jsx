import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Layers,
  Box,
  CheckCircle,
  Plus,
  Info,
  Check,
  Clock,
  Circle,
  Filter,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import RepositoryCard from '../components/RepositoryCard';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import Button from '../components/Button';
import {
  sampleRepositories,
  dashboardStats,
  sampleOnboardingTasks,
  sampleUser,
} from '../data/sampleData';
import { showToast } from '../utils/toast';
import './DashboardPage.css';

/**
 * Page 2: Main Dashboard
 * Information-dense developer workspace displaying connected repositories,
 * onboarding progress, and architectural metrics.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tasks, setTasks] = useState(sampleOnboardingTasks);
  const [simulateEmpty, setSimulateEmpty] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRepos(sampleRepositories);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus =
            t.status === 'completed'
              ? 'in-progress'
              : t.status === 'in-progress'
              ? 'pending'
              : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    showToast('Task status updated (demo state).', 'info');
  };

  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.language.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || repo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  if (loading) {
    return <LoadingState message="Loading dashboard..." fullPage />;
  }

  return (
    <div className="cv-dashboard">
      {/* Top Header & Primary Action */}
      <section className="cv-dashboard-header">
        <div className="cv-dashboard-header__copy">
          <div className="cv-dashboard-header__title-row">
            <h1 className="cv-dashboard-title">Dashboard</h1>
            <span className="cv-dashboard-user-pill">
              {sampleUser.name} · {sampleUser.plan}
            </span>
          </div>
          <p className="cv-dashboard-subtitle">
            Overview of connected repositories, AST analysis status, and onboarding milestones.
          </p>
        </div>

        <div className="cv-dashboard-header__actions">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setSimulateEmpty(!simulateEmpty)}
            title="Toggle between populated demo data and empty state to test UX"
          >
            {simulateEmpty ? 'Populated View' : 'Empty State'}
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => navigate('/connect')}
          >
            Connect Repository
          </Button>
        </div>
      </section>

      {/* Demo Disclaimer */}
      <div className="cv-dashboard-demo-strip">
        <Info size={14} className="cv-dashboard-demo-strip__icon" />
        <span>
          <strong>Demo environment:</strong> Repository metrics and AST trees reflect simulated local fixtures.
        </span>
      </div>

      {/* Metric Cards Ribbon */}
      <section className="cv-dashboard-stats" aria-label="Summary Statistics">
        <StatCard
          icon={<GitBranch size={18} />}
          label="Connected Repositories"
          value={simulateEmpty ? 0 : dashboardStats.connectedRepos}
          sublabel="2 GitHub organizations"
        />
        <StatCard
          icon={<Layers size={18} />}
          label="Mapped Modules"
          value={simulateEmpty ? 0 : dashboardStats.importantModules}
          sublabel="Across active repositories"
        />
        <StatCard
          icon={<Box size={18} />}
          label="Indexed Functions"
          value={simulateEmpty ? 0 : '735'}
          sublabel="AST syntax nodes"
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          label="Onboarding Progress"
          value={simulateEmpty ? '0%' : `${progressPercent}%`}
          sublabel={`${completedCount} of ${tasks.length} tasks ready`}
        />
      </section>

      {/* Content Split: Repositories (Left) & Onboarding (Right) */}
      <div className="cv-dashboard-layout">
        {/* Left: Repositories */}
        <section className="cv-dashboard-repos" aria-label="Repository List">
          <div className="cv-dashboard-section-head">
            <div>
              <h2 className="cv-section-title">Repositories</h2>
              <p className="cv-section-desc">Select a repository to explore structure and dependency paths.</p>
            </div>

            {!simulateEmpty && (
              <div className="cv-dashboard-controls">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter repos..."
                  className="cv-dashboard-search-box"
                />

                <div className="cv-dashboard-filter-select">
                  <Filter size={13} className="cv-dashboard-filter-icon" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter repositories by status"
                  >
                    <option value="all">All</option>
                    <option value="analyzed">Analyzed</option>
                    <option value="analyzing">Analyzing</option>
                    <option value="connected">Connected</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {simulateEmpty || filteredRepos.length === 0 ? (
            <EmptyState
              title={simulateEmpty ? 'No Repositories Connected' : 'No matching repositories'}
              description={
                simulateEmpty
                  ? 'Connect your first GitHub repository to parse directory hierarchies and generate onboarding paths.'
                  : `No repositories matched "${searchQuery}". Clear your search query to see all repositories.`
              }
              actionLabel={simulateEmpty ? 'Connect Repository' : 'Clear Filter'}
              onAction={() => (simulateEmpty ? navigate('/connect') : setSearchQuery(''))}
            />
          ) : (
            <div className="cv-dashboard-repo-cards">
              {filteredRepos.map((repo) => (
                <RepositoryCard key={repo.id} repo={repo} />
              ))}
            </div>
          )}
        </section>

        {/* Right: Onboarding Roadmap */}
        <section className="cv-dashboard-sidebar-panel" aria-label="Onboarding Roadmap">
          <div className="cv-dashboard-section-head">
            <div>
              <h2 className="cv-section-title">Onboarding Journey</h2>
              <p className="cv-section-desc">Recommended milestones for unfamiliar code.</p>
            </div>
          </div>

          <div className="cv-onboarding-card">
            <div className="cv-onboarding-progress-block">
              <div className="cv-onboarding-progress-row">
                <span className="cv-onboarding-progress-label">Completion</span>
                <span className="cv-onboarding-progress-value">{progressPercent}%</span>
              </div>
              <div className="cv-progress-track">
                <div
                  className="cv-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="cv-onboarding-milestone-text">
                {completedCount} of {tasks.length} milestones complete
              </span>
            </div>

            <div className="cv-onboarding-task-list">
              {tasks.map((task) => {
                const isDone = task.status === 'completed';
                const isInProg = task.status === 'in-progress';
                return (
                  <div
                    key={task.id}
                    className={`cv-task-row cv-task-row--${task.status}`}
                    onClick={() => handleToggleTask(task.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleToggleTask(task.id)}
                    title="Click to cycle status"
                  >
                    <div className="cv-task-row__status" aria-hidden="true">
                      {isDone ? (
                        <Check size={12} />
                      ) : isInProg ? (
                        <Clock size={11} />
                      ) : (
                        <Circle size={10} />
                      )}
                    </div>
                    <div className="cv-task-row__body">
                      <span className="cv-task-row__title">{task.title}</span>
                      <div className="cv-task-row__meta">
                        <span className="cv-task-row__category">{task.category}</span>
                        <span className={`cv-diff-chip cv-diff-chip--${task.difficulty}`}>
                          {task.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cv-onboarding-tip">
              <span>Tip: Click any task to toggle status between completed, in-progress, and pending.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
