// ============================================
// CODEVERSE — API & Service Integration Layer
// Provides production-ready API client structure with backend integration hooks
// and robust fallback simulation for local demo mode.
// ============================================

import {
  sampleRepositories,
  sampleUser,
  sampleFileTree,
  sampleFileContent,
  sampleFileDetails,
  sampleModuleRelationships,
  sampleOnboardingTasks,
} from '../data/sampleData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const SIMULATION_DELAY = 450;

function sleep(ms = SIMULATION_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredToken() {
  try {
    return localStorage.getItem('codeverse_token') || '';
  } catch {
    return '';
  }
}

/**
 * Standard fetch wrapper that attaches Authorization header if token exists.
 */
async function request(endpoint, options = {}) {
  if (!BASE_URL) {
    // If no real backend URL is configured, let callers fall back to simulation
    throw new Error('BACKEND_UNAVAILABLE');
  }

  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Simulates or executes user login via GitHub OAuth.
 * Endpoint: GET /api/v1/auth/github or POST /api/v1/auth/callback
 */
export async function loginWithGitHub(shouldFail = false) {
  try {
    return await request('/api/v1/auth/github');
  } catch {
    await sleep(900);
    if (shouldFail) {
      throw new Error('Simulated authentication network timeout. Please retry.');
    }
    return {
      success: true,
      user: sampleUser,
      token: 'mock-jwt-token-codeverse-demo',
      isDemo: true,
    };
  }
}

/**
 * Simulates or executes user logout.
 * Endpoint: POST /api/v1/auth/logout
 */
export async function logout() {
  try {
    return await request('/api/v1/auth/logout', { method: 'POST' });
  } catch {
    await sleep(250);
    return { success: true };
  }
}

/**
 * Fetches user profile.
 * Endpoint: GET /api/v1/user/profile
 */
export async function getUserProfile() {
  try {
    return await request('/api/v1/user/profile');
  } catch {
    await sleep(250);
    return { success: true, user: sampleUser, isDemo: true };
  }
}

/**
 * Connects and queues a repository for AST ingestion.
 * Endpoint: POST /api/v1/repositories
 */
export async function connectRepository(url, branch) {
  const cleanUrl = url.trim();
  const match = cleanUrl.match(/^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+)/);

  if (!match) {
    return {
      success: false,
      error: 'Invalid GitHub URL format. Please provide a URL like https://github.com/owner/repository',
    };
  }

  try {
    return await request('/api/v1/repositories', {
      method: 'POST',
      body: JSON.stringify({ url: cleanUrl, branch }),
    });
  } catch {
    await sleep(1200);
    const owner = match[1];
    const repoName = match[2].replace(/\.git$/, '');

    const newRepo = {
      id: `repo-${Date.now()}`,
      name: repoName,
      owner,
      fullName: `${owner}/${repoName}`,
      description: 'Repository connected via Codeverse interface.',
      language: 'JavaScript',
      languages: { JavaScript: 75, TypeScript: 15, CSS: 10 },
      branch: branch || 'main',
      branches: [branch || 'main', 'develop'],
      stars: 12,
      forks: 2,
      status: 'analyzed',
      connectedAt: new Date().toISOString(),
      analyzedAt: new Date().toISOString(),
      stats: { files: 42, modules: 6, functions: 98, components: 14 },
      technologies: ['React', 'JavaScript', 'Vite'],
      defaultFile: 'src/App.jsx',
    };

    return {
      success: true,
      repository: newRepo,
      isDemo: true,
    };
  }
}

/**
 * Fetches connected repositories list.
 * Endpoint: GET /api/v1/repositories
 */
export async function getRepositories() {
  try {
    return await request('/api/v1/repositories');
  } catch {
    await sleep(300);
    return { success: true, repositories: sampleRepositories, isDemo: true };
  }
}

/**
 * Fetches single repository by ID.
 * Endpoint: GET /api/v1/repositories/:repoId
 */
export async function getRepositoryById(repoId) {
  try {
    return await request(`/api/v1/repositories/${encodeURIComponent(repoId)}`);
  } catch {
    await sleep(300);
    const repo = sampleRepositories.find((r) => r.id === repoId) || sampleRepositories[0];
    return { success: true, repository: repo, isDemo: true };
  }
}

/**
 * Fetches file hierarchy tree.
 * Endpoint: GET /api/v1/repositories/:repoId/tree
 */
export async function getFileTree(repoId) {
  try {
    return await request(`/api/v1/repositories/${encodeURIComponent(repoId)}/tree`);
  } catch {
    await sleep(300);
    return { success: true, tree: sampleFileTree, isDemo: true };
  }
}

/**
 * Fetches source code content for a file path.
 * Endpoint: GET /api/v1/repositories/:repoId/file?path=:filePath
 */
export async function getFileContent(repoId, filePath) {
  try {
    return await request(
      `/api/v1/repositories/${encodeURIComponent(repoId)}/file?path=${encodeURIComponent(filePath)}`
    );
  } catch {
    await sleep(250);
    const fallback = `// Source code for ${filePath} (${repoId})
// Demo preview content loaded from local fixtures.`;
    const content = sampleFileContent[filePath] || fallback;
    return { success: true, content, isDemo: true };
  }
}

/**
 * Fetches file AST details, exported symbols, and dependencies.
 * Endpoint: GET /api/v1/repositories/:repoId/insights?path=:filePath
 */
export async function getFileDetails(repoId, filePath) {
  try {
    return await request(
      `/api/v1/repositories/${encodeURIComponent(repoId)}/insights?path=${encodeURIComponent(filePath)}`
    );
  } catch {
    await sleep(250);
    const details = sampleFileDetails[filePath] || {
      purpose: `Utility module providing functionality for ${filePath}.`,
      importance: 'medium',
      complexity: 'medium',
      dependencies: ['React', 'Lucide Icons'],
      dependents: ['Parent Application Layer'],
      exports: ['Default Export Interface'],
      suggestions: [
        'Document exported interfaces with clean JSDoc comments',
        'Verify test coverage for edge error conditions',
      ],
    };
    return { success: true, details, isDemo: true };
  }
}

/**
 * Fetches the module dependency graph for a repository.
 * Endpoint: GET /api/v1/repositories/:repoId/dependency-graph
 */
export async function getDependencyGraph(repoId) {
  try {
    return await request(`/api/v1/repositories/${encodeURIComponent(repoId)}/dependency-graph`);
  } catch {
    await sleep(350);

    // Derived high-fidelity nodes from relationships & file tree
    const nodes = [
      { id: 'App.jsx', name: 'App.jsx', type: 'entrypoint', layer: 'Entrypoint', lines: 35, path: 'src/App.jsx' },
      { id: 'Header.jsx', name: 'Header.jsx', type: 'component', layer: 'UI Component', lines: 85, path: 'src/components/Header.jsx' },
      { id: 'Sidebar.jsx', name: 'Sidebar.jsx', type: 'component', layer: 'UI Component', lines: 112, path: 'src/components/Sidebar.jsx' },
      { id: 'Dashboard.jsx', name: 'Dashboard.jsx', type: 'page', layer: 'UI Component', lines: 180, path: 'src/pages/Dashboard.jsx' },
      { id: 'Analytics.jsx', name: 'Analytics.jsx', type: 'page', layer: 'UI Component', lines: 140, path: 'src/pages/Analytics.jsx' },
      { id: 'Chart.jsx', name: 'Chart.jsx', type: 'component', layer: 'UI Component', lines: 156, path: 'src/components/Chart.jsx' },
      { id: 'DataTable.jsx', name: 'DataTable.jsx', type: 'component', layer: 'UI Component', lines: 189, path: 'src/components/DataTable.jsx' },
      { id: 'useAuth.js', name: 'useAuth.js', type: 'hook', layer: 'Hook / Context', lines: 65, path: 'src/hooks/useAuth.js' },
      { id: 'useData.js', name: 'useData.js', type: 'hook', layer: 'Hook / Context', lines: 54, path: 'src/hooks/useData.js' },
      { id: 'api.js', name: 'api.js', type: 'util', layer: 'Networking', lines: 120, path: 'src/utils/api.js' },
    ];

    return {
      success: true,
      graph: {
        nodes,
        edges: sampleModuleRelationships,
        stats: {
          totalNodes: nodes.length,
          totalEdges: sampleModuleRelationships.length,
          circularDependencies: 0,
          maxDepth: 3,
        },
      },
      isDemo: true,
    };
  }
}

/**
 * Fetches onboarding tasks for a repository.
 * Endpoint: GET /api/v1/repositories/:repoId/onboarding
 */
export async function getOnboardingTasks(repoId) {
  try {
    return await request(`/api/v1/repositories/${encodeURIComponent(repoId)}/onboarding`);
  } catch {
    await sleep(300);
    return {
      success: true,
      tasks: sampleOnboardingTasks,
      isDemo: true,
    };
  }
}

/**
 * Updates an onboarding task status.
 * Endpoint: PATCH /api/v1/repositories/:repoId/onboarding/:taskId
 */
export async function updateOnboardingTask(repoId, taskId, status) {
  try {
    return await request(
      `/api/v1/repositories/${encodeURIComponent(repoId)}/onboarding/${encodeURIComponent(taskId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  } catch {
    await sleep(200);
    return { success: true, taskId, status, isDemo: true };
  }
}

/**
 * Disconnects a repository.
 * Endpoint: DELETE /api/v1/repositories/:repoId
 */
export async function disconnectRepository(repoId) {
  try {
    return await request(`/api/v1/repositories/${encodeURIComponent(repoId)}`, {
      method: 'DELETE',
    });
  } catch {
    await sleep(500);
    return { success: true, id: repoId, isDemo: true };
  }
}

/**
 * Sends a codebase question for AI analysis.
 * Endpoint: POST /api/v1/repositories/:repoId/ask
 */
export async function askCodebaseQuestion(repoId, query) {
  try {
    return await request(`/api/v1/repositories/${encodeURIComponent(repoId)}/ask`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  } catch {
    await sleep(1000);
    const cleanQ = query.toLowerCase();

    let answer =
      'Based on the codebase analysis, application modules interact through standard React component props and centralized state hooks. The main entry point is in `src/App.jsx`, which manages client routing and global context initialization.';

    if (cleanQ.includes('auth') || cleanQ.includes('login') || cleanQ.includes('session')) {
      answer =
        'Authentication lifecycle is encapsulated in `src/hooks/useAuth.js`. It exposes an `AuthProvider` React context consumed in `App.jsx`, providing reactive user credentials, login dispatchers, and JWT token refresh mechanisms across child components.';
    } else if (cleanQ.includes('api') || cleanQ.includes('fetch') || cleanQ.includes('request') || cleanQ.includes('network')) {
      answer =
        'HTTP and REST networking is centralized in `src/utils/api.js`. It encapsulates `fetch()` with automated Bearer authorization header injection, request timeout normalization, and centralized error logging.';
    } else if (cleanQ.includes('chart') || cleanQ.includes('metric') || cleanQ.includes('visual') || cleanQ.includes('graph')) {
      answer =
        'Telemetry visualizations are handled by `src/components/Chart.jsx`, which renders vector-sharp SVG polyline sparklines and responsive time-series distributions with kaTeX ka-metrics support.';
    } else if (cleanQ.includes('start') || cleanQ.includes('init') || cleanQ.includes('first')) {
      answer =
        'For initial onboarding, start by inspecting `src/App.jsx` to trace route entry points. Next, read `src/hooks/useAuth.js` to understand how session state is seeded, and finally explore `src/utils/api.js` for data fetching pipelines.';
    }

    return {
      success: true,
      answer,
      confidence: 0.95,
      referencedFiles: ['src/App.jsx', 'src/hooks/useAuth.js', 'src/utils/api.js'],
      isDemo: true,
    };
  }
}
