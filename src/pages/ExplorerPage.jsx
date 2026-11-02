import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  ArrowLeft,
  Info,
  Copy,
  Check,
  FileCode,
  FileJson,
  FileText,
  Braces,
  Share2,
} from 'lucide-react';
import SearchInput from '../components/SearchInput';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import {
  sampleFileTree,
  sampleFileContent,
  sampleFileDetails,
  sampleModuleRelationships,
  sampleRepositories,
} from '../data/sampleData';
import { showToast } from '../utils/toast';
import './ExplorerPage.css';

/**
 * Page 5: Codebase Structure Explorer
 * Professional IDE-style layout with tree browser, source editor viewport,
 * and secondary architectural insights inspector.
 */
export default function ExplorerPage() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState('src/App.jsx');
  const [expandedFolders, setExpandedFolders] = useState(
    new Set(['src', 'src/components', 'src/pages', 'src/hooks', 'src/utils'])
  );
  const [treeSearch, setTreeSearch] = useState('');
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(true);
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const repo = sampleRepositories.find((r) => r.id === repoId) || sampleRepositories[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setTree(sampleFileTree);
      setLoading(false);

      const queryFile = searchParams.get('file');
      if (queryFile) {
        setSelectedFileId(queryFile);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [repoId, searchParams]);

  const toggleFolder = (id) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
      return <FileCode size={14} className="cv-icon--jsx" />;
    }
    if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
      return <Braces size={14} className="cv-icon--js" />;
    }
    if (fileName.endsWith('.json')) {
      return <FileJson size={14} className="cv-icon--json" />;
    }
    if (fileName.endsWith('.css')) {
      return <FileText size={14} className="cv-icon--css" />;
    }
    if (fileName.endsWith('.md')) {
      return <FileText size={14} className="cv-icon--md" />;
    }
    return <FileText size={14} className="cv-icon--generic" />;
  };

  const visibleNodes = useMemo(() => {
    const flattenTree = (nodes, depth = 0) => {
      const flat = [];
      for (const node of nodes) {
        flat.push({ ...node, depth });
        if (node.type === 'folder' && expandedFolders.has(node.id) && node.children) {
          flat.push(...flattenTree(node.children, depth + 1));
        }
      }
      return flat;
    };

    const flat = flattenTree(tree);
    if (!treeSearch.trim()) return flat;
    const query = treeSearch.toLowerCase();
    return flat.filter((n) => n.name.toLowerCase().includes(query));
  }, [tree, expandedFolders, treeSearch]);

  const currentFileContent =
    sampleFileContent[selectedFileId] ||
    `// Source code for ${selectedFileId}
// This is a sample code preview. Real file content will be retrieved
// through the Codeverse AST parser backend service.`;

  const currentFileDetails = sampleFileDetails[selectedFileId] || {
    purpose: `Core source file providing components or utilities for ${selectedFileId}.`,
    importance: 'medium',
    complexity: 'medium',
    dependencies: ['React ecosystem modules'],
    dependents: ['Parent architectural layer'],
    exports: ['Default export interface'],
    suggestions: [
      'Document public method signatures with clear JSDoc comments',
      'Ensure unit test coverage for edge validation states',
    ],
  };

  const relevantRelationships = sampleModuleRelationships.filter((rel) => {
    const baseName = selectedFileId.split('/').pop();
    return (
      rel.from === baseName ||
      rel.to === baseName ||
      selectedFileId.includes(rel.from.replace(/\.[a-z]+$/, '')) ||
      selectedFileId.includes(rel.to.replace(/\.[a-z]+$/, ''))
    );
  });

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(currentFileContent);
    setCopied(true);
    showToast('Source copied to clipboard.', 'success', 2000);
    setTimeout(() => setCopied(false), 1800);
  };

  if (loading) {
    return <LoadingState message="Loading Codebase Explorer..." fullPage />;
  }

  const codeLines = currentFileContent.split('\n');

  return (
    <div className="cv-explorer">
      {/* Action Header */}
      <div className="cv-explorer-topbar">
        <div className="cv-explorer-topbar__left">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={14} />}
            onClick={() => navigate(`/repository/${repo.id}`)}
          >
            Overview
          </Button>

          <span className="cv-explorer-topbar__sep">/</span>
          <span className="cv-explorer-topbar__reponame">{repo.name}</span>

          <span className="cv-explorer-topbar__sep">/</span>
          <code className="cv-explorer-topbar__filepath">{selectedFileId}</code>
        </div>

        <div className="cv-explorer-topbar__right">
          <Button
            variant="secondary"
            size="sm"
            className="cv-explorer-mobile-toggle-btn"
            onClick={() => setMobileTreeOpen(!mobileTreeOpen)}
          >
            Files
          </Button>

          <Button
            variant={detailsPanelOpen ? 'primary' : 'secondary'}
            size="sm"
            icon={<Info size={13} />}
            onClick={() => setDetailsPanelOpen(!detailsPanelOpen)}
          >
            {detailsPanelOpen ? 'Hide Details' : 'View Details'}
          </Button>
        </div>
      </div>

      {/* 3-Pane Workspace */}
      <div className="cv-explorer-workspace">
        {/* Pane 1: File Tree (Left) */}
        <aside
          className={`cv-explorer-tree-pane ${mobileTreeOpen ? 'cv-explorer-tree-pane--mobile-open' : ''}`}
          aria-label="Repository File Tree"
        >
          <div className="cv-explorer-tree-head">
            <span className="cv-explorer-tree-title">FILES</span>
            <span className="cv-explorer-branch-tag">{repo.branch}</span>
          </div>

          <div className="cv-explorer-tree-search-box">
            <SearchInput
              value={treeSearch}
              onChange={setTreeSearch}
              placeholder="Search files..."
            />
          </div>

          <div className="cv-tree-scroll" role="tree">
            {visibleNodes.map((node) => {
              const isFolder = node.type === 'folder';
              const isExpanded = expandedFolders.has(node.id);
              const isSelected = selectedFileId === node.id;

              return (
                <div
                  key={node.id}
                  className={`cv-tree-node ${isSelected ? 'cv-tree-node--selected' : ''}`}
                  style={{ paddingLeft: `${node.depth * 14 + 10}px` }}
                  role="treeitem"
                  tabIndex={0}
                  aria-expanded={isFolder ? isExpanded : undefined}
                  onClick={() => {
                    if (isFolder) {
                      toggleFolder(node.id);
                    } else {
                      setSelectedFileId(node.id);
                      setMobileTreeOpen(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (isFolder) toggleFolder(node.id);
                      else setSelectedFileId(node.id);
                    }
                  }}
                >
                  <span className="cv-tree-node__toggle-icon" aria-hidden="true">
                    {isFolder ? (
                      isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />
                    ) : null}
                  </span>

                  <span className="cv-tree-node__type-icon" aria-hidden="true">
                    {isFolder ? (
                      isExpanded ? (
                        <FolderOpen size={14} className="cv-icon--folder" />
                      ) : (
                        <Folder size={14} className="cv-icon--folder" />
                      )
                    ) : (
                      getFileIcon(node.name)
                    )}
                  </span>

                  <span className="cv-tree-node__name" title={node.name}>
                    {node.name}
                  </span>

                  {!isFolder && node.size && (
                    <span className="cv-tree-node__size">{node.size}</span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Pane 2: Code Viewer (Center) */}
        <main className="cv-explorer-code-pane" aria-label="Source Code Viewer">
          <div className="cv-code-head">
            <div className="cv-code-head__meta">
              {getFileIcon(selectedFileId)}
              <span className="cv-code-head__path">{selectedFileId}</span>
              <span className="cv-code-head__lines">{codeLines.length} lines</span>
            </div>

            <div className="cv-code-head__actions">
              <button
                type="button"
                className="cv-code-copy-btn"
                onClick={handleCopyCode}
                title="Copy source code"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="cv-code-viewport">
            <div className="cv-code-line-numbers" aria-hidden="true">
              {codeLines.map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>

            <pre className="cv-code-syntax">
              <code>{currentFileContent}</code>
            </pre>
          </div>

          <div className="cv-code-footer-banner">
            <span>Demo source view · Ingestion streams from backend parser service</span>
          </div>
        </main>

        {/* Pane 3: Architectural Details & Module Relationships (Right) */}
        {detailsPanelOpen && (
          <aside className="cv-explorer-details-pane" aria-label="Module Insights">
            <div className="cv-details-head">
              <span className="cv-details-title">MODULE DETAILS</span>
              <span className="cv-details-sub">Architectural Role &amp; Dependencies</span>
            </div>

            <div className="cv-details-body">
              {/* Purpose */}
              <div className="cv-detail-card">
                <h4 className="cv-detail-label">Purpose</h4>
                <p className="cv-detail-text">{currentFileDetails.purpose}</p>
              </div>

              {/* Status Badges */}
              <div className="cv-detail-card cv-detail-card--row">
                <div>
                  <h4 className="cv-detail-label">Importance</h4>
                  <span className={`cv-badge cv-badge--${currentFileDetails.importance === 'critical' ? 'error' : currentFileDetails.importance === 'high' ? 'analyzing' : 'analyzed'}`}>
                    {currentFileDetails.importance}
                  </span>
                </div>
                <div>
                  <h4 className="cv-detail-label">Complexity</h4>
                  <span className={`cv-badge cv-badge--${currentFileDetails.complexity === 'high' ? 'error' : 'connected'}`}>
                    {currentFileDetails.complexity}
                  </span>
                </div>
              </div>

              {/* Module Relationships Diagram */}
              <div className="cv-detail-card">
                <div className="cv-detail-card__header">
                  <h4 className="cv-detail-label">Dependency Relations</h4>
                  <Share2 size={12} className="cv-detail-card__icon" />
                </div>

                <div className="cv-rel-flow-graph">
                  {relevantRelationships.length > 0 ? (
                    relevantRelationships.map((rel, idx) => (
                      <div key={idx} className="cv-rel-edge-card">
                        <span className="cv-rel-node cv-rel-node--from">
                          <code>{rel.from}</code>
                        </span>
                        <div className="cv-rel-arrow">
                          <span className="cv-rel-arrow__line" />
                          <span className="cv-rel-arrow__label">{rel.label}</span>
                          <span className="cv-rel-arrow__line" />
                        </div>
                        <span className="cv-rel-node cv-rel-node--to">
                          <code>{rel.to}</code>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="cv-rel-fallback">
                      <p>Imports for <code>{selectedFileId.split('/').pop()}</code>:</p>
                      <ul className="cv-rel-fallback-list">
                        {currentFileDetails.dependencies.map((dep) => (
                          <li key={dep}>
                            <span>•</span> <code>{dep}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Referenced By */}
              <div className="cv-detail-card">
                <h4 className="cv-detail-label">Used By (Dependents)</h4>
                <div className="cv-dep-chips">
                  {currentFileDetails.dependents.map((dep) => (
                    <span key={dep} className="cv-dep-chip">
                      <code>{dep}</code>
                    </span>
                  ))}
                </div>
              </div>

              {/* Exported Signatures */}
              <div className="cv-detail-card">
                <h4 className="cv-detail-label">Exported Interfaces</h4>
                <div className="cv-dep-chips">
                  {currentFileDetails.exports.map((exp) => (
                    <span key={exp} className="cv-dep-chip cv-dep-chip--export">
                      <code>{exp}</code>
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              {currentFileDetails.suggestions && (
                <div className="cv-detail-card">
                  <h4 className="cv-detail-label">Onboarding &amp; Refactor Notes</h4>
                  <ul className="cv-tips-list">
                    {currentFileDetails.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
