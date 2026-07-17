// Mock Demo Data for Guest Mode
export const DEMO_PROJECT = {
  id: 'demo',
  name: 'Welcome & Demo Project',
  description: 'This is a read-only local demo project. Log in or create an account to create your own projects, upload files, and run AI generation!'
};

export const DEMO_FILES = [
  {
    filename: 'main.py',
    content: `import math\n\nclass Calculator:\n    def add(self, a, b):\n        \"\"\"Adds two numbers together\"\"\"\n        return a + b\n    \n    def sqrt(self, x):\n        \"\"\"Returns the square root of a number\"\"\"\n        return math.sqrt(x)`
  },
  {
    filename: 'api.js',
    content: `import axios from 'axios';\n\nexport const fetchWeather = async (city) => {\n  // Fetches weather data for a specific city\n  const response = await axios.get(\`/api/weather?city=\${city}\`);\n  return response.data;\n};`
  }
];

export const DEMO_DOCUMENTS = {
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

export const DEMO_HEALTH = {
  score: 75,
  suggestions: [
    'Add type signatures to Calculator methods in main.py',
    'Add parameter details to api.js:fetchWeather'
  ]
};
