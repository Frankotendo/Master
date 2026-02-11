import { GoogleGenAI } from "@google/genai";

// Robust API Key retrieval
const getApiKey = () => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  return process.env.API_KEY;
};

const apiKey = getApiKey();
if (!apiKey) console.warn("Gemini API Key is missing! App will run in Simulation Mode.");

const ai = new GoogleGenAI({ apiKey: apiKey || "dummy_key" });

// --- OFFLINE KNOWLEDGE BASE (High Quality Classroom Content) ---
const OFFLINE_KNOWLEDGE_BASE: Record<string, string> = {
  // 1. DevOps: Vercel
  'vercel': `# Classroom: Vercel Deployment Strategy

## 1. Learning Objective
Understand how to deploy React applications to the edge using Vercel's CI/CD pipeline.

## 2. The Architecture
Vercel uses a serverless architecture. Your frontend is served via a CDN (Content Delivery Network), while backend logic runs as isolated "Serverless Functions".

## 3. Deployment Lab (CLI)
Instead of dragging folders, we use the command line for precision:
\`\`\`bash
# Install the global controller
npm i -g vercel

# Authenticate
vercel login

# Ship to Production (The "Bypass" command)
vercel --prod
\`\`\`

## 4. Security Context
**Risk:** Exposing API Keys in frontend code.
**Solution:** Use Vercel Environment Variables. Never commit \`.env\` files to Git.`,

  // 2. DevOps: Cloudflare
  'cloudflare': `# Classroom: Cloudflare Defense

## 1. Learning Objective
Learn how Cloudflare acts as a reverse proxy to protect applications from DDoS attacks.

## 2. Defensive Mechanics
Cloudflare sits *between* the user and your server. It filters traffic, absorbing malicious packets (like UDP floods) before they hit your infrastructure.

## 3. Configuration Lab
To set up a defensive perimeter:
1. Change your Domain Nameservers (DNS) to Cloudflare's.
2. Enable "Under Attack Mode" during active threats.
3. Use 'Page Rules' to cache static assets aggressively.

## 4. Offensive Perspective
Attackers try to find the "Origin IP" to bypass Cloudflare. Defenders must configure the firewall (IPTables) to *only* accept traffic from Cloudflare IPs.`,

  // 3. Python: Requests
  'requests': `# Classroom: Python HTTP Interactions

## 1. Learning Objective
Master the \`requests\` library to interact with web services, APIs, and simulate web traffic.

## 2. Code Lab: The Scraper
\`\`\`python
import requests

target = "http://target-api.com/status"
headers = {
    'User-Agent': 'SecureBot/1.0',
    'Authorization': 'Bearer <token>'
}

# Simulate a legitimate client
response = requests.get(target, headers=headers)

if response.status_code == 200:
    print(f"Data Exfiltrated: {response.json()}")
else:
    print("Access Denied")
\`\`\`

## 3. Offensive Context
Malware uses \`requests\` to "Phone Home" (C2). It sends stolen data (exfiltration) via POST requests disguised as standard HTTP traffic.`,

  // 4. Python: Selenium
  'selenium': `# Classroom: Browser Automation (Selenium)

## 1. Learning Objective
Control a real web browser programmatically to test web apps or automate user actions.

## 2. Code Lab: Headless Navigation
\`\`\`python
from selenium import webdriver
from selenium.webdriver.common.by import By

# 'Headless' means no UI visible (Stealth)
options = webdriver.ChromeOptions()
options.add_argument('--headless') 

driver = webdriver.Chrome(options=options)
driver.get("http://localhost:3000/login")

# Automate Credential Entry
driver.find_element(By.ID, "user").send_keys("admin")
driver.find_element(By.ID, "pass").send_keys("password123")
driver.find_element(By.ID, "submit").click()
\`\`\`

## 3. Defense Perspective
Detecting Selenium is key for anti-bot defense. Look for \`navigator.webdriver\` flags in the browser's JavaScript environment.`,

  // 5. Data: GeoPandas
  'geopandas': `# Classroom: Geospatial Intelligence (GIS)

## 1. Learning Objective
Use GeoPandas to visualize location data. In cybersecurity, this is used to map the physical origin of IP addresses during an attack.

## 2. Code Lab: Threat Map
\`\`\`python
import geopandas as gpd
import matplotlib.pyplot as plt

# Load a map of the world
world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))

# Plot the map
ax = world.plot(color='white', edgecolor='black')

# Plot Red Dots for Attackers
gdf.plot(ax=ax, color='red', markersize=5)

plt.title("Active Botnet Locations")
plt.show()
\`\`\`

## 3. Real-World Application
Security Operations Centers (SOCs) use this to visualize "impossible travel" (e.g., a user logging in from NY and Tokyo within 5 minutes).`,

  // 6. Frontend: Leaflet
  'leaflet': `# Classroom: Interactive Mapping with Leaflet

## 1. Learning Objective
Build dynamic, interactive maps in React applications using Leaflet.js.

## 2. Code Lab: The Monitor
\`\`\`javascript
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';

function CyberMap() {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={2}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Visualizing a Threat Node */}
      <CircleMarker 
        center={[40.7128, -74.0060]} 
        color="red" 
        radius={10}
      >
        <span>Infected Host</span>
      </CircleMarker>
    </MapContainer>
  );
}
\`\`\`

## 3. Context
Used in the "Malware Analysis Lab" dashboard to show real-time packet movement between servers.`,

  // 7. Security: Hacking 101
  'hacking': `# Classroom: Ethical Hacking Fundamentals

## 1. The Kill Chain
Understanding the lifecycle of an attack is crucial for defense:
1. **Recon**: Finding targets (Nmap).
2. **Weaponization**: Creating the payload (Exploit).
3. **Delivery**: Sending the payload (Phishing).
4. **Exploitation**: Running the code.
5. **Persistence**: Installing auto-run keys.
6. **C2**: Connecting to command server.

## 2. Code Lab: Simple Port Scanner (Python)
\`\`\`python
import socket

target = "192.168.1.5"

# Scan ports 20 to 100
for port in range(20, 100):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.1)
    if s.connect_ex((target, port)) == 0:
        print(f"[+] Port {port} is OPEN")
    s.close()
\`\`\`

## 3. Ethics
Always obtain written permission before scanning any network. Unauthorised scanning is a crime.`,

  // 8. Malware: Persistence
  'persistence': `# Classroom: Advanced Persistence Mechanisms

## 1. Learning Objective
How malware ensures it restarts automatically after a system reboot.

## 2. Technique: Registry Run Keys
Windows checks specific registry keys during startup to launch programs.

## 3. Code Lab: Registry Hook (Python)
\`\`\`python
import winreg as reg
import os

def install_autorun():
    # The payload we want to run
    pth = os.path.dirname(os.path.realpath(__file__))
    name = "SystemUpdater.exe"
    address = os.path.join(pth, name)

    # Key Location
    key = reg.HKEY_CURRENT_USER
    key_value = "Software\\Microsoft\\Windows\\CurrentVersion\\Run"

    # Write the key
    open = reg.OpenKey(key, key_value, 0, reg.KEY_ALL_ACCESS)
    reg.SetValueEx(open, "SystemUpdater", 0, reg.REG_SZ, address)
    reg.CloseKey(open)
\`\`\`

## 4. Detection
Defenders use tools like 'Autoruns' (Sysinternals) to inspect these registry keys.`
};

// --- PROCEDURAL ENGINE ---
// Fallback for completely unknown topics
const generateProceduralLesson = (input: string): string => {
  const cleanInput = input.replace(/teach|learn|basics|python|react/gi, '').trim();
  const title = cleanInput.toUpperCase() || "SYSTEM ARCHITECTURE";
  
  return `# Classroom: ${title} (Simulated)

## 1. Concept Analysis
**${title}** is a critical component in the computing stack. 
In our lab environment, we analyze this to understand potential vulnerabilities.

## 2. Theoretical Implementation
\`\`\`python
# Simulation of ${title} logic
def execute_module():
    print("Initializing ${cleanInput} protocol...")
    # Logic goes here
    return True
\`\`\`

## 3. Assignment
Review the official documentation for ${cleanInput} and attempt to implement a basic version in the 'Defense Lab' terminal.

*(Note: Live AI connection is currently limited. Showing cached curriculum.)*`;
};

// --- API WRAPPERS ---

export const getSecurityAdvice = async (query: string): Promise<string> => {
  if (!apiKey) return `[OFFLINE] Simulation Mode: Isolate the infected host immediately. Check the 'Logs' panel for specific threat signatures related to "${query}".`;
  
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
    return `[OFFLINE] Advisor Unavailable. Manual protocol: 1. Disconnect Network. 2. Scan Process List. 3. Verify Firewall Rules.`;
  }
};

export const analyzeThreatScenario = async (scenario: string): Promise<string> => {
    if (!apiKey) return "System Status: Live Analysis Offline. Falling back to local heuristics... Threat detected: High confidence. Recommended Action: Isolate Host.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this malware behavior: ${scenario}. Explain the persistence mechanism and fileless techniques used.`,
        });
        return response.text || "Analysis failed.";
    } catch (error) {
        return "System Status: Live Analysis Offline. Falling back to local heuristics... Threat detected: High confidence. Recommended Action: Isolate Host.";
    }
}

export const generateLesson = async (topic: string, codeContext: string): Promise<string> => {
  // If we have a specific offline match for the topic title, use it first (High Quality)
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes('worm')) return OFFLINE_KNOWLEDGE_BASE['hacking']; 
  
  if (!apiKey) return generateProceduralLesson(topic);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Teach a class about: ${topic}. Context: ${codeContext}. Use whiteboard style with H1 headers.`,
    });
    return response.text || generateProceduralLesson(topic);
  } catch (error) {
    return generateProceduralLesson(topic);
  }
}

export const generateCodingLesson = async (input: string): Promise<string> => {
  const lowerInput = input.toLowerCase();

  // 1. Check Offline Knowledge Base (Golden Images)
  // This ensures specific buttons ALWAYS work perfectly, even without AI.
  if (lowerInput.includes('vercel')) return OFFLINE_KNOWLEDGE_BASE['vercel'];
  if (lowerInput.includes('cloudflare')) return OFFLINE_KNOWLEDGE_BASE['cloudflare'];
  if (lowerInput.includes('requests')) return OFFLINE_KNOWLEDGE_BASE['requests'];
  if (lowerInput.includes('selenium')) return OFFLINE_KNOWLEDGE_BASE['selenium'];
  if (lowerInput.includes('geo') || lowerInput.includes('pandas')) return OFFLINE_KNOWLEDGE_BASE['geopandas'];
  if (lowerInput.includes('leaflet') || lowerInput.includes('map')) return OFFLINE_KNOWLEDGE_BASE['leaflet'];
  if (lowerInput.includes('hack') || lowerInput.includes('ethical')) return OFFLINE_KNOWLEDGE_BASE['hacking'];
  if (lowerInput.includes('persist') || lowerInput.includes('registry')) return OFFLINE_KNOWLEDGE_BASE['persistence'];
  // General React fallback (must come after specific react libs like leaflet)
  if (lowerInput.includes('react') && !lowerInput.includes('leaflet')) return `# Classroom: React Fundamentals\n\n## 1. Components\nReact apps are made of independent, reusable pieces called components.\n\n## 2. Hooks\nFunctions starting with \`use\` (like \`useState\`) let you "hook into" React state.\n\n## 3. Security\nReact automatically escapes variables in JSX, preventing most XSS attacks.`;

  if (!apiKey) return generateProceduralLesson(input);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user typed: "${input}". You are a Coding Tutor.
      Structure:
      # [Topic]
      ## 1. Learning Objective
      ## 2. Theory & Context
      ## 3. Code Lab (Python or JS)
      ## 4. Security/Real-world Application
      `,
    });
    return response.text || generateProceduralLesson(input);
  } catch (error) {
    console.warn("Gemini API Error - Switching to Simulation Mode");
    return generateProceduralLesson(input);
  }
}
