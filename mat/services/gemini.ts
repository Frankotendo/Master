
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    return "Unable to connect to the Analyst AI.";
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
        return "Analysis unavailable.";
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
    return "The Professor is currently unavailable.";
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
    return "Connection to Academy Mainframe failed.";
  }
}
