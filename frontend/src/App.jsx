import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import AppHeader from './components/AppHeader.jsx';
import AppModals from './components/AppModals.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import WorkspaceDashboard from './components/WorkspaceDashboard.jsx';
import ToastStack from './components/ToastStack.jsx';
import SplashLandingPage from './components/SplashLandingPage.jsx';
import AuthPage from './components/AuthPage.jsx';

// Resolve Backend and AI service URLs dynamically
const HOST_IP = window.location.hostname || 'localhost';
const BACKEND_URL = `http://${HOST_IP}:8080`;
const AI_SERVICE_URL = `http://${HOST_IP}:5000`;

// Mock Demo Data for Guest Mode
const DEMO_PROJECT = {
  id: 'demo',
  name: 'Welcome & Demo Project',
  description: 'This is a read-only local demo project. Log in or create an account to create your own projects, upload files, and run AI generation!'
};

const DEMO_FILES = [
  {
    filename: 'main.py',
    content: `import math\n\nclass Calculator:\n    def add(self, a, b):\n        \"\"\"Adds two numbers together\"\"\"\n        return a + b\n    \n    def sqrt(self, x):\n        \"\"\"Returns the square root of a number\"\"\"\n        return math.sqrt(x)`
  },
  {
    filename: 'api.js',
    content: `import axios from 'axios';\n\nexport const fetchWeather = async (city) => {\n  // Fetches weather data for a specific city\n  const response = await axios.get(\`/api/weather?city=\${city}\`);\n  return response.data;\n};`
  }
];

const DEMO_DOCUMENTS = {
  api: `# API Documentation - Demo Project\n\nThis is a preview of the generated API documentation for the demo project.\n\n## Python module: \`main.py\`\n### Class: \`Calculator\`\nHelper class for basic arithmetic operations.\n\n#### Method: \`add(self, a, b)\`\n*   **Arguments:** \`a\` (number), \`b\` (number)\n*   **Returns:** Sum of the two parameters.\n\n#### Method: \`sqrt(self, x)\`\n*   **Arguments:** \`x\` (number)\n*   **Returns:** Square root of \`x\`.\n\n---\n\n## JavaScript module: \`api.js\`\n### Function: \`fetchWeather(city)\`\nFetches current weather information from the system endpoint.\n*   **Arguments:** \`city\` (string)\n*   **Returns:** Promise resolving to weather object.`,
  readme: `# Demo Project README\n\nWelcome to the Demo Project! This is a simple preview showing how Dokari structures your generated document.\n\n## Features\n- Mathematical utility classes in Python.\n- Weather API integration functions in ES6 JavaScript.\n\n## Setup Instructions\n1. Clone the repository.\n2. Install dependencies:\n   \`\`\`bash\n   npm install\n   pip install -r requirements.txt\n   \`\`\`\n3. Run test suites.`,
  architecture: `graph TD
    subgraph Frontend ["React SPA Client"]
        AppNode["App.jsx"] --> MainNode["main.jsx"]
    end
    subgraph AI_Service ["Python Flask AI"]
        AppPy["app.py API"] --> AiProcessorPy["ai_processor.py"]
    end
    subgraph Backend ["PHP Web Service"]
        IndexPhp["index.php Router"] --> DB[("Database Store")]
    end
    AppNode -->|JSON API| AppPy
    AppNode -->|Auth / Storage| IndexPhp
    style Frontend fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#ffffff
    style AI_Service fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#ffffff
    style Backend fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#ffffff`
};

const DEMO_HEALTH = {
  score: 75,
  suggestions: [
    'Add type signatures to Calculator methods in main.py',
    'Add parameter details to api.js:fetchWeather'
  ]
};

// Local Q&A Knowledge Base for Dokari Help Chatbot
const DOKARI_KNOWLEDGE = [
  {
    keywords: ["what is", "about", "website", "system", "dokari", "purpose", "info", "general"],
    answer: "Dokari is an AI-powered technical documentation assistant. It analyzes your codebase to compute documentation health scores, generates comprehensive API docs and READMEs, builds architecture diagrams, and offers interactive code suggestions without using emojis or unnecessary clutter."
  },
  {
    keywords: ["help", "how to use", "how does this work", "guide", "tutorial", "instructions", "workspace", "dashboard", "features", "use"],
    answer: "You can use Dokari to analyze your code and generate documentation. In your workspace: 1. Upload source files (Python, JS, PHP, etc.) using the 'Upload Files' button. 2. View your 'Doc Health' rating and click 'Fix' on suggestions to copy generated docstrings. 3. Navigate to the 'Generate' tab to build your README.md or API docs, which can be exported to PDF."
  },
  {
    keywords: ["upload", "add", "file", "files", "source", "code", "import", "projects", "create project", "new project"],
    answer: "To document a project, navigate to your workspace and use the 'Upload Files' button. You can upload multiple code files (Python, PHP, JavaScript, etc.). Once uploaded, Dokari will scan them to calculate your Health Score and generate documentation. If you want to create multiple projects, click the project selector in the top-left and click 'New Project'."
  },
  {
    keywords: ["health", "score", "gauge", "rating", "analyzer", "quality", "metric", "measurement", "percent", "percentage"],
    answer: "The Dokari Health Score measures documentation coverage (comment density, docstring presence, and clarity) on a scale of 0 to 100. Check the 'Doc Health' sidebar to see specific suggestions for improvement."
  },
  {
    keywords: ["fix", "suggestion", "apply docstring", "generate fix", "recommendation", "docstring", "comment", "proposal", "improve"],
    answer: "If the Health Analyzer suggests improvements (e.g., 'Add class docstring'), click the 'Fix' button next to that suggestion. Dokari will generate a copyable, professional docstring or comment block to paste into your code."
  },
  {
    keywords: ["readme", "read me", "generate readme", "documentation", "doc", "docs"],
    answer: "To generate a README.md, upload your files in the workspace, verify the files summary, and click 'Generate README.md'. You will receive a complete, standard markdown README tailored to your project structure."
  },
  {
    keywords: ["api doc", "api documentation", "generate api", "route", "endpoints", "endpoint"],
    answer: "Upload your code files containing routes or functions, and click 'Generate API Docs'. Dokari will analyze the arguments, methods, and returns to produce a standard, comprehensive API specification in markdown."
  },
  {
    keywords: ["pdf", "export", "download", "save"],
    answer: "Once any documentation (API Docs or README) is generated, you can click 'Export PDF' at the bottom of the editor. This triggers a server-side PDF conversion and starts a download of your file."
  },
  {
    keywords: ["register", "login", "sign in", "account", "signup", "sign up", "log in", "auth", "username", "password", "session", "user"],
    answer: "You can click the 'Sign In' or 'Register' button on the navbar. Having an account allows you to create private projects, persist files, and manage your custom workspace. Write actions are locked in guest mode until you register."
  },
  {
    keywords: ["guest", "demo", "view only", "read only", "preview", "anonymous", "signin", "login"],
    answer: "Dokari provides a preloaded 'Welcome & Demo Project' in Guest Mode so you can preview the UI, explore features, view health gauges, and chat. To upload custom files or create new projects, please sign in or register."
  },
  {
    keywords: ["diagram", "architecture", "visualize", "map", "dependency", "dependencies", "imports", "flowchart", "relation", "structure"],
    answer: "You can generate an architecture diagram of your codebase. Dokari parses files to map imports, classes, and helper dependencies, generating a clean PNG architecture diagram for your documentation."
  }
];

const findLocalAnswer = (question) => {
  const query = question.toLowerCase().trim();
  
  // 1. Handle common greetings
  const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "yo", "greetings"];
  if (greetings.some(g => query === g || query.startsWith(g + " ") || query.endsWith(" " + g))) {
    return "Hello! I am the Dokari Companion. How can I assist you with using the Dokari documentation platform today? You can ask me how to upload files, generate READMEs, verify API specifications, or check documentation health.";
  }

  // 2. Handle thank you / compliments
  const compliments = ["thank you", "thanks", "awesome", "great", "cool", "perfect", "good job"];
  if (compliments.some(c => query.includes(c))) {
    return "You're very welcome! Please let me know if you have any other questions about how Dokari works or if you need assistance generating documentation.";
  }

  // 3. Score each knowledge item based on keyword matches
  let bestMatch = null;
  let highestScore = 0;

  for (const item of DOKARI_KNOWLEDGE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (query.includes(kw)) {
        // Higher weight if the keyword is matched as a full word boundary
        const regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (regex.test(query)) {
          score += 3;
        } else {
          score += 1;
        }
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore > 0) {
    return bestMatch.answer;
  }

  // 4. Fallback for non-related topics
  return "I noticed your question might be about a topic outside the scope of this platform. As the Dokari Companion, I specialize in help queries about Dokari itself! \n\nDokari is an automated technical documentation workspace. It lets you upload source files, tracks code documentation health, and generates professional API specifications, README.md files, and architecture diagrams.\n\nCould you please ask me about one of these features or how to use the workspace?";
};

// DecryptedText component for scrambled text reveal effects
function DecryptedText({ text, interval = 25, delay = 0, hoverTrigger = false }) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-";

  const runAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    let iteration = 0;
    
    const timer = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(timer);
        setIsAnimating(false);
      }
      
      iteration += 1;
    }, interval);
  };

  useEffect(() => {
    if (hoverTrigger) return;
    const timeout = setTimeout(() => {
      runAnimation();
    }, delay);
    return () => clearTimeout(timeout);
  }, [text]);

  const handleMouseEnter = () => {
    if (hoverTrigger) {
      runAnimation();
    }
  };

  return (
    <span onMouseEnter={handleMouseEnter} style={{ display: 'inline-block' }}>
      {displayText}
    </span>
  );
}



export default function App() {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [scrolled, setScrolled] = useState(false);

  // View Router State ('landing' | 'dashboard' | 'auth')
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      return 'dashboard';
    }
    if (window.location.hash === '#dashboard') return 'dashboard';
    if (window.location.hash === '#auth' || window.location.hash === '#login' || window.location.hash === '#signup') return 'auth';
    return 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#dashboard') {
        setCurrentView('dashboard');
      } else if (window.location.hash === '#auth' || window.location.hash === '#login' || window.location.hash === '#signup') {
        setCurrentView('auth');
      } else if (window.location.hash === '' || window.location.hash === '#home' || window.location.hash === '#features' || window.location.hash === '#pricing') {
        setCurrentView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToView = (view) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      window.location.hash = '#dashboard';
    } else if (view === 'auth') {
      window.location.hash = '#auth';
    } else {
      if (!window.location.hash || window.location.hash === '#dashboard' || window.location.hash === '#auth') {
        window.location.hash = '#home';
      }
    }
  };

  // Scroll listener for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth States
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error parsing user state:", e);
    }
    return { username: 'Guest Developer', id: 'demo' };
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsModel, setSettingsModel] = useState(() => localStorage.getItem('apiModel') || 'gemini-2.5-flash');
  const [settingsDisplayName, setSettingsDisplayName] = useState(() => localStorage.getItem('displayName') || '');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // App States
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [documents, setDocuments] = useState({ api: '', readme: '', architecture: '' });
  const [diagramUrl, setDiagramUrl] = useState('');
  const [activeTab, setActiveTab] = useState('api');
  const [generating, setGenerating] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [selectedFileInspector, setSelectedFileInspector] = useState(null);

  // AI Chatbot States
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am the Dokari Companion. Ask me any question about how to use the Dokari platform, upload files, check documentation health, or generate files.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Documentation Health States
  const [docHealthScore, setDocHealthScore] = useState(DEMO_HEALTH.score);
  const [docHealthSuggestions, setDocHealthSuggestions] = useState(DEMO_HEALTH.suggestions);
  const [healthLoading, setHealthLoading] = useState(false);
  const [docFixProposal, setDocFixProposal] = useState('');
  const [selectedFixSuggestion, setSelectedFixSuggestion] = useState('');
  const [showFixModal, setShowFixModal] = useState(false);
  const [fixingLoading, setFixingLoading] = useState(false);

  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [projectTemplate, setProjectTemplate] = useState('empty');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState([]);

  // File Input Ref
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // Sync HTML class list with theme changes
  useEffect(() => {
    document.documentElement.className = theme + '-mode';
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load projects list on startup / when user changes
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProjectId('demo');
      setCurrentProject(null);
      setUploadedFiles([]);
      setDocuments({ api: '', readme: '' });
      setDiagramUrl('');
      setDocHealthScore(0);
      setDocHealthSuggestions([]);
    }
  }, [user]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Handle Loading files & documents when project changes
  useEffect(() => {
    if (!currentProjectId) {
      setCurrentProject(null);
      setUploadedFiles([]);
      setDocuments({ api: '', readme: '' });
      setDiagramUrl('');
      setDocHealthScore(0);
      setDocHealthSuggestions([]);
      return;
    }

    if (currentProjectId === 'demo') {
      setCurrentProject(DEMO_PROJECT);
      setUploadedFiles(DEMO_FILES);
      setDocuments(DEMO_DOCUMENTS);
      setDiagramUrl('');
      setDocHealthScore(DEMO_HEALTH.score);
      setDocHealthSuggestions(DEMO_HEALTH.suggestions);
      setChatMessages([
        { sender: 'ai', text: 'Hello! I am the Dokari Companion. Ask me any question about how to use the Dokari platform, upload files, check documentation health, or generate files.' }
      ]);
      return;
    }

    if (!user) return;

    const headers = {
      'Authorization': String(user.id)
    };

    // 1. Fetch Project Details
    fetch(`${BACKEND_URL}/api/projects/${currentProjectId}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load project details');
        return res.json();
      })
      .then(project => {
        setCurrentProject(project);
        setBackendOnline(true);
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load project details', 'error');
      });

    // 2. Fetch Project Files
    fetch(`${BACKEND_URL}/api/projects/${currentProjectId}/files`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load files');
        return res.json();
      })
      .then(files => {
        const mapped = files.map(f => ({
          filename: f.filename,
          content: f.content || ''
        }));
        setUploadedFiles(mapped);
        localStorage.setItem(`dokari_files_${currentProjectId}`, JSON.stringify(mapped));
        fetchDocHealth(mapped);
      })
      .catch(err => {
        console.error(err);
        const cached = localStorage.getItem(`dokari_files_${currentProjectId}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setUploadedFiles(parsed);
            fetchDocHealth(parsed);
          } catch (e) {}
        } else {
          showToast('Failed to load project files', 'error');
        }
      });

    // 3. Fetch Project Documents
    fetch(`${BACKEND_URL}/api/projects/${currentProjectId}/documents`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load documents');
        return res.json();
      })
      .then(docs => {
        let apiContent = '';
        let readmeContent = '';
        let architectureContent = '';

        docs.forEach(doc => {
          if (doc.type === 'api') apiContent = doc.content;
          if (doc.type === 'readme') readmeContent = doc.content;
          if (doc.type === 'architecture') architectureContent = doc.content;
        });

        setDocuments({ api: apiContent, readme: readmeContent, architecture: architectureContent });
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to load project documents', 'error');
      });
  }, [currentProjectId, user]);

  // Mermaid dynamic renderer hook
  useEffect(() => {
    if (activeTab === 'architecture' && documents.architecture && !documents.architecture.startsWith('IMAGE_URL:') && window.mermaid) {
      try {
        const container = document.getElementById('mermaid-container');
        if (container) {
          container.removeAttribute('data-processed');
          container.innerHTML = `<pre class="mermaid" style="background: transparent; border: none; margin: 0; padding: 0;">${documents.architecture}</pre>`;
          window.mermaid.initialize({
            startOnLoad: false,
            theme: theme === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true, htmlLabels: true }
          });
          window.mermaid.run({
            nodes: document.querySelectorAll('.mermaid'),
          });
        }
      } catch (e) {
        console.error("Mermaid error:", e);
      }
    }
  }, [activeTab, documents.architecture, theme]);

  // Utility to show toasts
  const showToast = (message, type = 'info', action = null, duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, action, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  // Toggle Theme handler
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const triggerAuthPrompt = (message = 'Authentication required to use this feature.') => {
    showToast(message, 'warning');
    setAuthMode('login');
    navigateToView('auth');
  };

  // Handle Authentication (Login / Signup)
  const handleAuth = (e) => {
    e.preventDefault();
    if (!authUsername.trim() || !authPassword.trim()) {
      showToast('Please fill out all fields', 'warning');
      return;
    }

    setAuthLoading(true);
    const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    
    fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: authUsername, password: authPassword })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || 'Authentication failed'); });
        }
        return res.json();
      })
      .then(data => {
        setAuthLoading(false);
        if (authMode === 'signup') {
          showToast('Registration successful! Please login.', 'success');
          setAuthMode('login');
          setAuthPassword('');
        } else {
          showToast(`Welcome back, ${data.username}!`, 'success');
          const userData = { id: data.id, username: data.username };
           setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          navigateToView('dashboard');
          setAuthUsername('');
          setAuthPassword('');
        }
      })
      .catch(err => {
        setAuthLoading(false);
        console.error(err);
        showToast(err.message || 'Authentication error', 'error');
      });
  };

  const confirmLogout = () => {
    setUser({ username: 'Guest Developer', id: 'demo' });
    setCurrentProjectId('demo');
    localStorage.removeItem('user');
    navigateToView('landing');
    setShowLogoutModal(false);
    showToast('Logged out successfully', 'info');
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!settingsPassword.trim()) {
      if (settingsDisplayName.trim()) {
        localStorage.setItem('displayName', settingsDisplayName.trim());
      } else {
        localStorage.removeItem('displayName');
      }
      localStorage.setItem('apiModel', settingsModel);
      showToast('Settings saved successfully', 'success');
      setShowSettingsModal(false);
      return;
    }

    if (settingsPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    setSettingsLoading(true);
    fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': String(user.id)
      },
      body: JSON.stringify({ password: settingsPassword })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || 'Failed to update profile'); });
        }
        return res.json();
      })
      .then(data => {
        setSettingsLoading(false);
        if (settingsDisplayName.trim()) {
          localStorage.setItem('displayName', settingsDisplayName.trim());
        } else {
          localStorage.removeItem('displayName');
        }
        localStorage.setItem('apiModel', settingsModel);
        showToast('Password and profile settings updated successfully', 'success');
        setSettingsPassword('');
        setShowSettingsModal(false);
      })
      .catch(err => {
        setSettingsLoading(false);
        showToast(err.message, 'danger');
      });
  };

  const loadProjects = () => {
    if (!user || user.id === 'demo') {
      setBackendOnline(true);
      return;
    }
    fetch(`${BACKEND_URL}/api/projects`, {
      headers: { 'Authorization': String(user.id) }
    })
      .then(res => {
        if (!res.ok) throw new Error('Backend Offline');
        return res.json();
      })
      .then(data => {
        setProjects(data);
        setBackendOnline(true);
        if (Array.isArray(data) && data.length > 0) {
          if (!currentProjectId || currentProjectId === 'demo') {
            setCurrentProjectId(data[0].id);
          }
        }
      })
      .catch(err => {
        if (backendOnline) {
          setBackendOnline(false);
          showToast(`Unable to connect to PHP backend.`, 'error');
        }
      });
  };

  // Create Project
  const createProject = (e) => {
    e.preventDefault();
    if (!user) {
      triggerAuthPrompt('Please sign in or register to create custom projects.');
      return;
    }

    if (!newProjectName.trim()) {
      showToast('Please enter a project name', 'warning');
      return;
    }

    fetch(`${BACKEND_URL}/api/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': String(user.id)
      },
      body: JSON.stringify({ name: newProjectName, description: newProjectDesc })
    })
      .then(res => {
        if (!res.ok) throw new Error('Create failed');
        return res.json();
      })
      .then(response => {
        if (response.error) throw new Error(response.error);
        
        showToast(`Project "${newProjectName}" created successfully!`, 'success');
        setNewProjectName('');
        setNewProjectDesc('');
        setShowNewProjectModal(false);
        setCurrentProjectId(response.id);
        loadProjects();
      })
      .catch(err => {
        console.error(err);
        showToast(err.message || 'Failed to create project', 'error');
      });
  };

  // Delete Project
  const deleteCurrentProject = () => {
    if (currentProjectId === 'demo') {
      showToast('The demo project cannot be deleted.', 'warning');
      return;
    }
    if (!user) {
      triggerAuthPrompt('Please sign in to manage projects.');
      return;
    }

    if (!currentProjectId || !currentProject) return;

    if (!confirm(`Are you sure you want to delete project "${currentProject.name}"? This will permanently delete all uploaded files and generated documents.`)) {
      return;
    }

    fetch(`${BACKEND_URL}/api/projects/${currentProjectId}`, {
      method: 'DELETE',
      headers: { 'Authorization': String(user.id) }
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        return res.json();
      })
      .then(() => {
        showToast(`Project "${currentProject.name}" deleted successfully.`, 'success');
        setCurrentProjectId(null);
        loadProjects();
      })
      .catch(err => {
        console.error(err);
        showToast('Failed to delete project', 'error');
      });
  };

  // Fetch Doc Health Score & Suggestions from Python AI Service
  const fetchDocHealth = (filesList) => {
    if (!filesList || filesList.length === 0) {
      setDocHealthScore(0);
      setDocHealthSuggestions(['No files uploaded yet. Upload files to calculate your health score.']);
      return;
    }

    setHealthLoading(true);
    fetch(`${AI_SERVICE_URL}/generate/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files_content: filesList })
    })
      .then(res => {
        if (!res.ok) throw new Error('Health check failed');
        return res.json();
      })
      .then(data => {
        setDocHealthScore(data.score);
        setDocHealthSuggestions(data.suggestions);
        setHealthLoading(false);
      })
      .catch(err => {
        console.error(err);
        setDocHealthScore(50);
        setDocHealthSuggestions(['Failed to run documentation static analysis.']);
        setHealthLoading(false);
      });
  };

  // Handle local File Reading & DB Upload
  const handleFiles = (filesList) => {
    if (!user) {
      triggerAuthPrompt('Please sign in to upload your project files.');
      return;
    }
    if (!currentProjectId || currentProjectId === 'demo') {
      showToast('Please select or create a custom project first!', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('project_id', currentProjectId);

    let filesReadCount = 0;
    const filesToRead = filesList.length;
    const tempUploadedFiles = [];

    setUploading(true);
    showToast(`Reading ${filesList.length} file(s)...`, 'info');

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      formData.append('files[]', file);
      formData.append('files', file);

      const reader = new FileReader();
      reader.onload = (e) => {
        tempUploadedFiles.push({
          filename: file.name,
          content: e.target.result
        });
        filesReadCount++;

        if (filesReadCount === filesToRead) {
          uploadFiles(formData, tempUploadedFiles);
        }
      };
      reader.onerror = () => {
        filesReadCount++;
        if (filesReadCount === filesToRead) {
          uploadFiles(formData, tempUploadedFiles);
        }
      };
      reader.readAsText(file);
    }
  };

  const uploadFiles = (formData, tempFiles) => {
    if (!user) return;
    showToast('Uploading files...', 'info');

    // Always merge read files into workspace state immediately so features remain operational
    let newFilesList = [];
    setUploadedFiles(prev => {
      const merged = [...prev];
      tempFiles.forEach(tf => {
        const idx = merged.findIndex(uf => uf.filename === tf.filename);
        if (idx !== -1) {
          merged[idx] = tf;
        } else {
          merged.push(tf);
        }
      });
      newFilesList = merged;
      localStorage.setItem(`dokari_files_${currentProjectId}`, JSON.stringify(newFilesList));
      return merged;
    });

    fetch(`${BACKEND_URL}/api/upload.php`, {
      method: 'POST',
      headers: { 'Authorization': String(user.id) },
      body: formData
    })
      .then(async res => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Upload failed');
        }
        return data;
      })
      .then(response => {
        showToast(`${tempFiles.length} file(s) uploaded & synced!`, 'success');
        setUploading(false);
        fetchDocHealth(newFilesList);
      })
      .catch(err => {
        console.warn('Network sync notice:', err);
        showToast(`${tempFiles.length} file(s) loaded into workspace.`, 'success');
        setUploading(false);
        fetchDocHealth(newFilesList);
      });
  };

  // Delete uploaded file from workspace
  const deleteFile = (filename) => {
    if (currentProjectId === 'demo') {
      showToast('Cannot delete files in demo mode', 'warning');
      return;
    }
    const fileToDelete = uploadedFiles.find(f => f.filename === filename);
    if (!fileToDelete) return;

    const updated = uploadedFiles.filter(f => f.filename !== filename);
    setUploadedFiles(updated);
    if (currentProjectId) {
      localStorage.setItem(`dokari_files_${currentProjectId}`, JSON.stringify(updated));
    }
    if (selectedFileInspector && selectedFileInspector.filename === filename) {
      setSelectedFileInspector(null);
    }
    
    // Sync deletion to database backend
    if (user && user.id !== 'demo') {
      fetch(`${BACKEND_URL}/api/projects/${currentProjectId}/files?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: { 'Authorization': String(user.id) }
      })
        .then(async res => {
          const text = await res.text();
          console.log('DELETE response status:', res.status, 'body:', text);
          try {
            return JSON.parse(text);
          } catch(e) {
            return { error: 'Invalid JSON response', body: text };
          }
        })
        .then(data => {
          console.log('Backend delete synced successfully:', data);
        })
        .catch(err => {
          console.warn('Backend delete sync warning:', err);
        });
    }

    showToast(
      `Deleted "${filename}"`,
      'info',
      () => {
        setUploadedFiles(prev => {
          if (prev.some(f => f.filename === fileToDelete.filename)) return prev;
          const restored = [...prev, fileToDelete];
          if (currentProjectId) {
            localStorage.setItem(`dokari_files_${currentProjectId}`, JSON.stringify(restored));
          }
          fetchDocHealth(restored);

          // Sync restoration back to database backend
          if (user && user.id !== 'demo') {
            const formData = new FormData();
            formData.append('project_id', String(currentProjectId));
            const blob = new Blob([fileToDelete.content], { type: 'text/plain' });
            formData.append('files[]', blob, fileToDelete.filename);

            fetch(`${BACKEND_URL}/api/upload.php`, {
              method: 'POST',
              headers: { 'Authorization': String(user.id) },
              body: formData
            })
              .then(res => res.json())
              .then(data => {
                console.log('Backend sync restore success:', data);
              })
              .catch(err => {
                console.warn('Backend sync restore warning:', err);
              });
          }

          return restored;
        });
      },
      5000
    );

    fetchDocHealth(updated);
  };

  // Generate Documentation
  const generateDocumentation = () => {
    if (!user) {
      triggerAuthPrompt('Please sign in or sign up to run AI generation.');
      return;
    }
    if (!currentProjectId || currentProjectId === 'demo') {
      showToast('Please select or create a custom project first!', 'warning');
      return;
    }
    if (uploadedFiles.length === 0) {
      showToast('Please upload some source files first!', 'warning');
      return;
    }

    setGenerating(true);
    showToast('AI is generating documentation...', 'info');

    const filesContentArray = uploadedFiles.map(f => ({
      name: f.filename,
      content: f.content
    }));

    if (activeTab === 'api') {
      fetch(`${AI_SERVICE_URL}/generate/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: currentProjectId, files_content: filesContentArray })
      })
        .then(res => {
          if (!res.ok) throw new Error('Generation failed');
          return res.json();
        })
        .then(data => {
          const mdContent = data.documentation;
          setDocuments(prev => ({ ...prev, api: mdContent }));
          return saveDocToDB('api', mdContent);
        })
        .catch(err => {
          console.error(err);
          showToast('Failed to generate API docs.', 'error');
          setGenerating(false);
        });
    } else if (activeTab === 'readme') {
      fetch(`${AI_SERVICE_URL}/generate/readme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_info: { name: currentProject.name, description: currentProject.description },
          files_content: filesContentArray
        })
      })
        .then(res => {
          if (!res.ok) throw new Error('Generation failed');
          return res.json();
        })
        .then(data => {
          const mdContent = data.readme;
          setDocuments(prev => ({ ...prev, readme: mdContent }));
          return saveDocToDB('readme', mdContent);
        })
        .catch(err => {
          console.error(err);
          showToast('Failed to generate README.', 'error');
          setGenerating(false);
        });
    } else if (activeTab === 'architecture') {
      const code_structure = {
        project_name: currentProject.name,
        files: uploadedFiles.map(f => ({
          filename: f.filename,
          content: f.content
        }))
      };

      fetch(`${AI_SERVICE_URL}/generate/diagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_structure })
      })
        .then(res => {
          if (!res.ok) throw new Error('Diagram generation failed');
          return res.json();
        })
        .then(data => {
          let finalCode = "";
          if (data.mermaid_code) {
            finalCode = data.mermaid_code;
          } else if (data.diagram_url) {
            const mappedUrl = data.diagram_url.replace('localhost', HOST_IP);
            finalCode = `IMAGE_URL:${mappedUrl}`;
          } else {
            finalCode = `graph TD\n    ErrorNode[No valid diagram data returned from AI service]`;
          }

          setDocuments(prev => ({
            ...prev,
            architecture: finalCode
          }));
          showToast('Architecture Diagram generated successfully!', 'success');
          setGenerating(false);
          return saveDocToDB('architecture', finalCode);
        })
        .catch(err => {
          console.error(err);
          showToast('Failed to generate Architecture Diagram.', 'error');
          setGenerating(false);
        });
    }
  };

  // Save generated document to database
  const saveDocToDB = (type, content) => {
    if (!user) return;
    return fetch(`${BACKEND_URL}/api/projects/${currentProjectId}/documents`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': String(user.id)
      },
      body: JSON.stringify({ type, content, format: 'markdown' })
    })
      .then(res => {
        if (!res.ok) throw new Error('Save failed');
        return res.json();
      })
      .then(() => {
        showToast('Documentation saved to project database!', 'success');
        setGenerating(false);
      });
  };

  // AI Q&A Companion Chat Handler - Runs 100% locally to answer questions about Dokari itself
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsgText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsgText }]);
    setChatLoading(true);

    setTimeout(() => {
      const answer = findLocalAnswer(userMsgText);
      setChatMessages(prev => [...prev, { sender: 'ai', text: answer }]);
      setChatLoading(false);
    }, 400);
  };

  // Generate code docstring fix modal
  const generateDocFix = (suggestion) => {
    setSelectedFixSuggestion(suggestion);
    setShowFixModal(true);
    setFixingLoading(true);
    setDocFixProposal('');

    const filesPayload = uploadedFiles.map(f => ({
      name: f.filename,
      content: f.content
    }));

    fetch(`${AI_SERVICE_URL}/generate/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files_content: filesPayload,
        question: `Generate the precise comment or docstring to fix this technical recommendation: "${suggestion}". Return ONLY the code block or comments, with no extra text or markdown explanations. Make sure it is clean.`,
        chat_history: []
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Fix failed');
        return res.json();
      })
      .then(data => {
        setDocFixProposal(data.answer);
        setFixingLoading(false);
      })
      .catch(err => {
        console.error(err);
        setDocFixProposal('Failed to generate fix recommendations.');
        setFixingLoading(false);
      });
  };

  // Copy fix to clipboard
  const copyDocFix = () => {
    if (!docFixProposal) return;
    navigator.clipboard.writeText(docFixProposal).then(() => {
      showToast('Copied documentation fix to clipboard!', 'success');
    });
  };

  // Clipboard Copier
  const copyToClipboard = () => {
    const content = documents[activeTab];
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
      showToast('Copied markdown to clipboard!', 'success');
    });
  };

  // Export File Download Handler
  const exportDoc = (format) => {
    const content = documents[activeTab];
    if (!content) return;

    if (format === 'markdown') {
      const element = document.createElement("a");
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `dokari_${activeTab}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast('Markdown downloaded!', 'success');
    } else if (format === 'pdf') {
      showToast('Generating PDF file...', 'info');
      fetch(`${AI_SERVICE_URL}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format: 'pdf' })
      })
        .then(res => {
          if (!res.ok) throw new Error('PDF Generation failed');
          return res.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `dokari_${activeTab}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          showToast('PDF downloaded successfully!', 'success');
        })
        .catch(err => {
          console.error(err);
          showToast('Failed to export PDF.', 'error');
        });
    }
  };

  // File Drag-Drop Event handlers
  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => {
    setDragOver(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!user) {
      triggerAuthPrompt('Please sign in to upload your project files.');
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleCreateProjectBtnClick = () => {
    if (!user) {
      triggerAuthPrompt('Please sign in to create new projects.');
    } else {
      setShowNewProjectModal(true);
    }
  };

  // Style score color
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'health-excellent';
    if (score >= 50) return 'health-average';
    return 'health-poor';
  };

  return (
    <div className="app-container">
      <ToastStack toasts={toasts} />
      {currentView !== 'auth' && (
        <AppHeader
          user={user}
          backendOnline={backendOnline}
          settingsDisplayName={settingsDisplayName}
          currentProjectId={currentProjectId}
          projects={projects}
          theme={theme}
          scrolled={scrolled}
          toggleTheme={toggleTheme}
          handleCreateProjectBtnClick={handleCreateProjectBtnClick}
          setCurrentProjectId={setCurrentProjectId}
          setShowSettingsModal={setShowSettingsModal}
          setShowLogoutModal={setShowLogoutModal}
          setAuthMode={setAuthMode}
          currentView={currentView}
          navigateToView={navigateToView}
        />
      )}

      {currentView === 'dashboard' && (
        <WorkspaceDashboard
          currentProjectId={currentProjectId}
          currentProject={currentProject}
          uploadedFiles={uploadedFiles}
          documents={documents}
          activeTab={activeTab}
          generating={generating}
          fileSearchQuery={fileSearchQuery}
          setFileSearchQuery={setFileSearchQuery}
          dragOver={dragOver}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          user={user || { username: 'Guest Developer', id: 'demo' }}
          fileInputRef={fileInputRef}
          uploading={uploading}
          showToast={showToast}
          handleFiles={handleFiles}
          deleteFile={deleteFile}
          generateDocumentation={generateDocumentation}
          copyToClipboard={copyToClipboard}
          exportDoc={exportDoc}
          generateDocFix={generateDocFix}
          deleteCurrentProject={deleteCurrentProject}
          handleCreateProjectBtnClick={handleCreateProjectBtnClick}
          docHealthScore={docHealthScore}
          docHealthSuggestions={docHealthSuggestions}
          healthLoading={healthLoading}
          setActiveTab={setActiveTab}
          setSelectedFileInspector={setSelectedFileInspector}
          projects={projects}
          setCurrentProjectId={setCurrentProjectId}
          triggerAuthPrompt={triggerAuthPrompt}
        />
      )}

      {currentView === 'landing' && (
        <SplashLandingPage
          onLoginClick={() => { setAuthMode('login'); navigateToView('auth'); }}
          onRegisterClick={() => { setAuthMode('signup'); navigateToView('auth'); }}
          onGetStarted={() => navigateToView('dashboard')}
        />
      )}

      {currentView === 'auth' && (
        <AuthPage
          authMode={authMode}
          setAuthMode={setAuthMode}
          authUsername={authUsername}
          setAuthUsername={setAuthUsername}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authLoading={authLoading}
          handleAuth={handleAuth}
          showToast={showToast}
          onBackToHome={() => navigateToView('landing')}
        />
      )}

      <AppModals
        showLogoutModal={showLogoutModal}
        showNewProjectModal={showNewProjectModal}
        showSettingsModal={showSettingsModal}
        showFixModal={showFixModal}
        selectedFileInspector={selectedFileInspector}
        settingsDisplayName={settingsDisplayName}
        settingsModel={settingsModel}
        settingsPassword={settingsPassword}
        settingsLoading={settingsLoading}
        newProjectName={newProjectName}
        newProjectDesc={newProjectDesc}
        projectTemplate={projectTemplate}
        fixingLoading={fixingLoading}
        docFixProposal={docFixProposal}
        selectedFixSuggestion={selectedFixSuggestion}
        currentProject={currentProject}
        user={user}
        setShowLogoutModal={setShowLogoutModal}
        confirmLogout={confirmLogout}
        createProject={createProject}
        setSettingsDisplayName={setSettingsDisplayName}
        setSettingsModel={setSettingsModel}
        setSettingsPassword={setSettingsPassword}
        setShowSettingsModal={setShowSettingsModal}
        handleUpdateProfile={handleUpdateProfile}
        setNewProjectName={setNewProjectName}
        setNewProjectDesc={setNewProjectDesc}
        setProjectTemplate={setProjectTemplate}
        setShowNewProjectModal={setShowNewProjectModal}
        copyDocFix={copyDocFix}
        deleteFile={deleteFile}
        setSelectedFileInspector={setSelectedFileInspector}
        setShowFixModal={setShowFixModal}
        showToast={showToast}
      />

      <ChatWidget
        showChatWidget={showChatWidget}
        setShowChatWidget={setShowChatWidget}
        chatMessages={chatMessages}
        chatLoading={chatLoading}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendChatMessage={sendChatMessage}
        chatEndRef={chatEndRef}
        uploadedFiles={uploadedFiles}
      />
    </div>
  );
}

