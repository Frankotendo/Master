import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- OFFLINE SIMULATION DATABASE ---
const OFFLINE_KNOWLEDGE_BASE: Record<string, string> = {
  // DevOps & Deployment
  'vercel': `# Deployment Protocol: Vercel\n\n## 1. Concept\nVercel is a cloud platform for static sites and Serverless Functions, optimized for React/Next.js.\n\n## 2. CI/CD Pipeline\nIt connects directly to Git. Every push to 'main' triggers a production deployment.\n\n## 3. CLI Deployment Code\n\`\`\`bash\n# 1. Install CLI\nnpm i -g vercel\n\n# 2. Login\nvercel login\n\n# 3. Deploy to Prod\nvercel --prod\n\`\`\`\n\n## 4. Security Note\nAlways define environment variables (API_KEYS) in the Vercel Dashboard, never commit them to Git.`,
  
  'cloudflare': `# Deployment Protocol: Cloudflare Pages\n\n## 1. Concept\nCloudflare Pages hosts frontend sites on the edge network, providing DDoS protection and low latency.\n\n## 2. Configuration\nRequires a build command (e.g., \`npm run build\`) and an output directory (e.g., \`dist\` or \`build\`).\n\n## 3. Defense Context\nCloudflare sits in front of your server, absorbing traffic spikes and blocking malicious bot requests before they reach your app.\n\n## 4. Setup\nConnect your GitHub repo to Cloudflare Dashboard and select "Create Application".`,

  // Python & Automation
  'requests': `# Python Module: Requests\n\n## 1. Concept\nThe standard library for making HTTP requests in Python. Essential for interacting with APIs and Web Services.\n\n## 2. Offensive Context\nUsed by Red Teams to interact with target web servers, brute force login forms, or test for SQL Injection.\n\n## 3. Code Example\n\`\`\`python\nimport requests\n\n# Fetch public IP (Recon)\nr = requests.get('https://api.ipify.org?format=json')\nprint(f"My IP: {r.json()['ip']}")\n\n# Custom Headers (Spoofing)\nheaders = {'User-Agent': 'SecureBrowser/1.0'}\nr = requests.get('http://target.com', headers=headers)\n\`\`\``,

  'selenium': `# Python Module: Selenium\n\n## 1. Concept\nA tool for automating web browsers. It drives a browser natively, just like a user would.\n\n## 2. Offensive Context\nUsed to bypass captchas, scrape dynamic JavaScript content, or automate credential stuffing attacks.\n\n## 3. Code Example\n\`\`\`python\nfrom selenium import webdriver\n\n# Headless Chrome (Stealth)\noptions = webdriver.ChromeOptions()\noptions.add_argument('--headless')\n\ndriver = webdriver.Chrome(options=options)\ndriver.get("http://target-site.com/login")\n\n# Find and fill password\ndriver.find_element("id", "pass").send_keys("payload")\n\`\`\``,

  // GIS & Data
  'geopandas': `# Data Science: GeoPandas\n\n## 1. Concept\nExtends pandas to allow spatial operations on geometric types. Used for mapping and geospatial analysis.\n\n## 2. Security Application\nVisualizing the physical location of IP addresses from server logs to identify the origin country of an attack (Botnet Tracing).\n\n## 3. Code Example\n\`\`\`python\nimport geopandas as gpd\nimport matplotlib.pyplot as plt\n\n# Load World Map\nworld = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))\n\n# Plot Attack Vectors\nworld.plot()\nplt.show()\n\`\`\``,
  
  // React & Frontend
  'leaflet': `# React Library: Leaflet\n\n## 1. Concept\nThe leading open-source JavaScript library for mobile-friendly interactive maps.\n\n## 2. Implementation\nUsed in dashboards to render real-time threat intelligence maps.\n\n## 3. Code Example\n\`\`\`javascript\nimport { MapContainer, TileLayer, Marker } from 'react-leaflet';\n\nfunction ThreatMap() {\n  return (\n    <MapContainer center={[51.505, -0.09]} zoom={13}>\n      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />\n      <Marker position={[51.505, -0.09]} />\n    </MapContainer>\n  );\n}\n\`\`\``,

  'react': `# Frontend Core: React Basics\n\n## 1. Component Architecture\nReact builds UI from isolated pieces of code called "components".\n\n## 2. State & Props\n- **State**: Data managed *within* the component (e.g., user input).\n- **Props**: Data passed *into* the component from a parent.\n\n## 3. Security (XSS)\nReact escapes content by default, preventing most Cross-Site Scripting (XSS) attacks. However, avoid using \`dangerouslySetInnerHTML\` unless sanitized.`,

  // Cybersecurity
  'hacking': `# Module: Ethical Hacking 101\n\n## 1. The Methodology\n1. **Reconnaissance**: Gathering info (Passive/Active).\n2. **Scanning**: Identifying open ports/services.\n3. **Exploitation**: Gaining access.\n4. **Persistence**: Maintaining access.\n5. **Clearing Tracks**: Deleting logs.\n\n## 2. Python Port Scanner (Concept)\n\`\`\`python\nimport socket\n\ntarget = "192.168.1.1"\n\ndef scan_port(port):\n    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    s.settimeout(0.5)\n    # Returns 0 if connection successful\n    if s.connect_ex((target, port)) == 0:\n        print(f"Port {port} is OPEN")\n    s.close()\n\`\`\`\n\n## 3. Warning\nUnauthorized scanning is illegal. Only test on networks you own.`
};

// Procedural Generator for Unknown Topics
const generateProceduralLesson = (input: string): string => {
  const title = input.replace(/teach|learn|basics|python|react/gi, '').trim().toUpperCase() || "UNKNOWN PROTOCOL";
  
  return `# Analysis Module: ${title}\n\n## 1. System Status\nConnection to Mainframe is restricted. Initializing local heuristic analysis for **${title}**.\n\n## 2. Theoretical Concept\n${title} refers to a specific logic structure in computing. In a security context, understanding this allows for better defense surface mapping.\n\n## 3. Simulated Code Block\n\`\`\`python\n# Heuristic analysis wrapper for ${title}\ndef analyze_vector(target):\n    print(f"Initializing scan for {title}...")\n    \n    if validate_input(target):\n        return "Secure"\n    else:\n        return "Vulnerable"\n\`\`\`\n\n## 4. Recommendation\nPlease verify API Uplink for deep-dive analysis. Loading cached data only.`;
};

// --- API WRAPPERS ---

export const getSecurityAdvice = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "You are a Malware Analysis Instructor. Keep answers short, tactical, and related to defense.",
      }
    });
    return response.text || "No analysis available.";
  } catch (error) {
    return "Advisor Offline. Ensure Firewall is enabled and Systems are Patched.";
  }
};

export const analyzeThreatScenario = async (scenario: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this malware behavior: ${scenario}. Explain the persistence mechanism and fileless techniques used.`,
        });
        return response.text || "Analysis failed.";
    } catch (error) {
        return "Analysis Unavailable: Simulation Mode Active.";
    }
}

export const generateLesson = async (topic: string, codeContext: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Teach a class about: ${topic}. Context: ${codeContext}. Use whiteboard style with H1 headers.`,
    });
    return response.text || "Class is dismissed (Error generating lesson).";
  } catch (error) {
    // Whiteboard Fallback
    return `# Offline Mode: ${topic}\n\n## System Alert\nThe Professor is currently unavailable due to network restrictions.\n\n## Cached Data\n- Verify your security configuration.\n- Review the source code in the 'Source' tab.\n- Ensure API keys are configured for live tuition.`;
  }
}

export const generateCodingLesson = async (input: string): Promise<string> => {
  try {
    // Attempt Live AI Generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user typed: "${input}". You are a Coding Tutor.
      Structure:
      # [Topic]
      ## 1. What is it?
      ## 2. How to use it?
      ## 3. Code Example (Python or JS)
      ## 4. Security/Real-world Context
      `,
    });
    return response.text || "System Error: Tutor offline.";
  } catch (error) {
    // --- SILENT FAILOVER TO OFFLINE KNOWLEDGE BASE ---
    console.warn("API Connection Failed. Switching to Simulation Mode.");
    
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('vercel')) return OFFLINE_KNOWLEDGE_BASE['vercel'];
    if (lowerInput.includes('cloudflare')) return OFFLINE_KNOWLEDGE_BASE['cloudflare'];
    if (lowerInput.includes('requests')) return OFFLINE_KNOWLEDGE_BASE['requests'];
    if (lowerInput.includes('selenium')) return OFFLINE_KNOWLEDGE_BASE['selenium'];
    if (lowerInput.includes('geo') || lowerInput.includes('pandas')) return OFFLINE_KNOWLEDGE_BASE['geopandas'];
    if (lowerInput.includes('leaflet') || lowerInput.includes('map')) return OFFLINE_KNOWLEDGE_BASE['leaflet'];
    if (lowerInput.includes('react')) return OFFLINE_KNOWLEDGE_BASE['react'];
    if (lowerInput.includes('hack') || lowerInput.includes('ethical')) return OFFLINE_KNOWLEDGE_BASE['hacking'];
    
    // Fallback for unknown input
    return generateProceduralLesson(input);
  }
}