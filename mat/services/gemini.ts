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
      
      You are an expert Senior Software Engineer acting as a Private Tutor.
      
      SPECIALIZATION AREAS:
      1. **Web & APIs**: Python Requests, APIs, HTTP methods.
      2. **Automation**: Selenium WebDriver (Browser automation), BeautifulSoup.
      3. **GIS & Mapping**: Leaflet (React & Python/Folium), GeoPandas, Rasterio, Shapefiles.
      4. **Ethical Hacking**: Python Scapy (Packet manipulation), Socket programming, Cryptography basics.
      
      INSTRUCTIONS:
      If the user asks for "basics" or "intro" to any of these, structure the lesson as follows:
      
      # [Topic Title]: The Basics
      
      ## 1. What & Why?
      (One sentence definition. e.g., "GeoPandas extends pandas to allow spatial operations on geometric types.")
      
      ## 2. Installation
      (The exact command: \`npm install leaflet react-leaflet\` or \`pip install geopandas rasterio\`)
      
      ## 3. Hello World (Code)
      (The simplest functional code snippet to prove it works. MUST be accurate and clean.)
      
      ## 4. Real-World Application
      (e.g., "Used by analysts to visualize malware C2 server locations on a map.")
      
      ## 5. Mini Challenge
      (A small task, e.g., "Write a script to fetch your public IP using Requests.")
      
      Tone: Academic, precise, and practical.`,
    });
    return response.text || "System Error: Tutor offline.";
  } catch (error) {
    return "Connection to Academy Mainframe failed.";
  }
}