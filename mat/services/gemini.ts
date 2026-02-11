import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Static Knowledge Base (Offline Fallback)
const FALLBACK_LESSONS: Record<string, string> = {
  'scapy': `# Network Defense: Scapy\n\n## 1. Concept\nScapy is a powerful interactive packet manipulation program used for network analysis and security auditing.\n\n## 2. Offensive Context\nAttackers may use Scapy to craft malformed packets to bypass firewalls or scan networks stealthily.\n\n## 3. Defense Analysis Code\n\`\`\`python\nfrom scapy.all import *\n\n# Detect TCP SYN Flood Pattern\ndef monitor_traffic(pkt):\n    if TCP in pkt and pkt[TCP].flags == 'S':\n        print(f"ALERT: SYN Packet detected from {pkt[IP].src}")\n\n# Sniff network traffic (Requires Admin)\n# sniff(filter="tcp", prn=monitor_traffic, count=10)\n\`\`\`\n\n## 4. Hardening\nImplement stateful firewall inspection and Rate Limiting on edge routers.`,
  
  'socket': `# Network Sockets & C2\n\n## 1. Concept\nSockets are the fundamental endpoints for network data exchange between machines.\n\n## 2. Offensive Context\nMalware often uses raw sockets to establish Command & Control (C2) channels to exfiltrate data.\n\n## 3. Defense Analysis Code\n\`\`\`python\nimport socket\n\n# Check for open ports (Reconnaissance Defense)\ndef audit_port(ip, port):\n    try:\n        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n        s.settimeout(0.5)\n        if s.connect_ex((ip, port)) == 0:\n            print(f"Port {port} is OPEN - Verify Service!")\n        s.close()\n    except Exception as e: print(e)\n\`\`\`\n\n## 4. Hardening\nAdopt a "Deny All" inbound firewall policy and use Allow-lists for outbound traffic.`,
  
  'ransomware': `# Ransomware Logic & Defense\n\n## 1. Concept\nRansomware encrypts user data using cryptographic algorithms to demand extortion payments.\n\n## 2. Offensive Context\nIt typically generates a random symmetric key (AES) for files and encrypts that key with an asymmetric public key (RSA).\n\n## 3. Defense Logic (Entropy)\n\`\`\`python\nimport math\n\n# High entropy often indicates encryption/compression\ndef calculate_shannon_entropy(data):\n    if not data: return 0\n    entropy = 0\n    for x in range(256):\n        p_x = float(data.count(bytes([x]))) / len(data)\n        if p_x > 0:\n            entropy += - p_x * math.log(p_x, 2)\n    return entropy\n\`\`\`\n\n## 4. Hardening\nMaintain 3-2-1 Offline Backups and enable File Integrity Monitoring (FIM).`
};

export const getSecurityAdvice = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "You are a Malware Analysis Instructor specializing in Modern Threats. Explain concepts like Fileless Malware, Living-off-the-Land (LotL), and Persistence mechanisms (Registry Run Keys, Scheduled Tasks, WMI). When asked about defense, focus on Behavior Monitoring, EDR (Endpoint Detection & Response), and Least Privilege. Provide conceptual Python or PowerShell examples for educational purposes only. Do NOT provide functional exploits.",
      }
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return "Analyst AI offline. Check network connection.";
  }
};

export const analyzeThreatScenario = async (scenario: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this malware behavior: ${scenario}. Explain the persistence mechanism and fileless techniques used, and how an EDR solution would detect it.`,
        });
        return response.text || "Analysis failed.";
    } catch (error) {
        return "Analysis unavailable. Manual review required.";
    }
}

export const generateLesson = async (topic: string, codeContext: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Teach a class about: ${topic}.
      
      Contextual Code to reference or explain:
      ${codeContext}
      
      Format the response as if writing on a whiteboard. 
      1. Use H1 (#) for the Lesson Title.
      2. Use bullet points for key concepts.
      3. Create a simple ASCII diagram or flow chart if relevant.
      4. Create a "Why this Module?" section explaining its role in cybersecurity (e.g. why Python socket is used for C2).
      5. Create a "DEFENSE LAB" section explaining how to stop it or how to use the module for defense (e.g. Scapy for packet analysis).
      
      Keep it punchy, educational, and visual. Use "Marker" style tone.`,
    });
    return response.text || "Class is dismissed (Error generating lesson).";
  } catch (error) {
    // Basic Fallback for Whiteboard
    return `# System Maintenance\n\nThe Professor is currently offline.\n\nPlease utilize the Terminal for specific module queries or check back later.\n\nError: Connection Timeout`;
  }
}

export const generateCodingLesson = async (input: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user typed this command in the learning terminal: "${input}".
      
      You are an expert Cybersecurity Instructor acting as a Private Tutor.
      
      SPECIALIZATION AREAS:
      1. **Network Defense**: Python Scapy, Socket programming, Traffic analysis.
      2. **Malware Analysis**: Understanding Ransomware logic (Cryptography), C2 communications (Requests), Persistence.
      3. **Forensics**: Log parsing (Regex), File analysis.
      4. **Secure Coding**: Input validation, Error handling, Principle of Least Privilege.
      
      INSTRUCTIONS:
      Structure the lesson as follows:
      
      # [Topic Title]: Defense Protocol
      
      ## 1. Concept
      (Definition and security relevance.)
      
      ## 2. Offensive Context
      (How attackers use this, e.g. "Malware uses Sockets to connect to C2 servers.")
      
      ## 3. Defense / Analysis Code
      (Python snippet to detect or analyze this behavior. MUST be accurate.)
      
      ## 4. Hardening
      (How to secure against this.)
      
      Tone: Serious, tactical, and educational. No functional exploits, only analysis/defense code.`,
    });
    return response.text || "System Error: Tutor offline.";
  } catch (error) {
    // Check for offline fallback content
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('scapy')) return FALLBACK_LESSONS['scapy'];
    if (lowerInput.includes('socket')) return FALLBACK_LESSONS['socket'];
    if (lowerInput.includes('ransom') || lowerInput.includes('crypto')) return FALLBACK_LESSONS['ransomware'];
    
    return "Connection to Academy Mainframe failed. Offline Knowledge Base unavailable for this specific topic. \n\nTry: 'teach python scapy basics' or 'teach python socket programming'.";
  }
}
