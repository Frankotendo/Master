import React, { useState } from 'react';
import Terminal from './Terminal';
import Blackboard from './Blackboard';
import { generateCodingLesson } from '../services/gemini';
import { Shield, Terminal as TerminalIcon, BookOpen, Bug } from 'lucide-react';

const CodeAcademy: React.FC = () => {
  const [history, setHistory] = useState<Array<{ type: 'user' | 'system', text: string }>>([]);
  
  // Updated content to focus on Cybersecurity
  const [boardContent, setBoardContent] = useState<string>(
`# Cyber Defense Academy

## Mission
Initialize advanced threat analysis protocols. Master the logic behind the code to build impenetrable defenses.

## Core Curricula:
- **Network Forensics**: Python Scapy, Socket Programming, Traffic Analysis
- **Malware Analysis**: Cryptography basics, Persistence mechanisms (Registry/WMI)
- **Defensive Scripting**: Log parsing, File Integrity Monitoring (FIM)

## Generator Status: ONLINE
The Academy Generator is active. 
- **Auto-Run**: Lessons generate immediately upon command.
- **Coverage**: Capable of analyzing any threat vector input.

## Quick Start
Type any topic to generate a module:
- \`teach stealth persistence\`
- \`teach kernel hooks\`
- \`teach polymorphic code\`

## Safety Warning
All code is for educational defense purposes only. Do not execute on unauthorized networks.`
  );
  
  const [loading, setLoading] = useState(false);

  const handleCommand = async (cmd: string) => {
    setHistory(prev => [...prev, { type: 'user', text: cmd }]);
    setLoading(true);

    try {
        // AI Call
        const lesson = await generateCodingLesson(cmd);
        
        setBoardContent(lesson);
        setHistory(prev => [...prev, { type: 'system', text: `Accessing Knowledge Base: "${cmd}"...` }]);
    } catch (e) {
        setHistory(prev => [...prev, { type: 'system', text: `Error: Uplink failed. Switching to Local Heuristics.` }]);
    } finally {
        setLoading(false);
    }
  };

  const modules = [
    { label: "Scapy (Packet Ops)", cmd: "teach python scapy basics" },
    { label: "Socket Networking", cmd: "teach python socket programming" },
    { label: "Crypto/Ransom", cmd: "teach python cryptography basics" },
    { label: "Log Forensics", cmd: "teach python log analysis regex" },
    { label: "Persistence", cmd: "teach malware persistence registry" },
    { label: "Firewall Rules", cmd: "teach iptables defense logic" },
    { label: "Web Requests", cmd: "teach python requests security" },
    { label: "Port Scanning", cmd: "teach python nmap basics" },
  ];

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
       {/* Left Column: Terminal & Quick Library */}
       <div className="lg:col-span-1 flex flex-col gap-4 h-full">
           <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shrink-0">
              <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                  <TerminalIcon className="w-5 h-5" />
                  Terminal Access
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                  Execute commands to access the Defense Knowledge Base.
              </p>
           </div>
           
           <div className="flex-1 min-h-0">
             <Terminal 
               onCommand={handleCommand} 
               history={history} 
               loading={loading}
             />
           </div>

           {/* Quick Library Panel */}
           <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shrink-0">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                 <BookOpen className="w-4 h-4 text-cyan-400" />
                 Defense Modules
              </h3>
              <div className="grid grid-cols-2 gap-2">
                 {modules.map((mod) => (
                    <button
                      key={mod.label}
                      onClick={() => handleCommand(mod.cmd)}
                      disabled={loading}
                      className="text-xs text-left p-2 rounded bg-slate-700/50 hover:bg-slate-600 border border-slate-600 hover:border-cyan-500/50 transition-all text-slate-300 hover:text-white truncate"
                      title={mod.label}
                    >
                      <Bug className="w-3 h-3 inline mr-1 opacity-50" />
                      {mod.label}
                    </button>
                 ))}
              </div>
           </div>
       </div>

       {/* Right Column: Blackboard */}
       <div className="lg:col-span-2 h-full">
          <Blackboard content={boardContent} loading={loading} />
       </div>
    </div>
  );
};

export default CodeAcademy;
