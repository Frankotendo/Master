import React, { useState } from 'react';
import Terminal from './Terminal';
import Blackboard from './Blackboard';
import { generateCodingLesson } from '../services/gemini';
import { Cpu, BookOpen } from 'lucide-react';

const CodeAcademy: React.FC = () => {
  const [history, setHistory] = useState<Array<{ type: 'user' | 'system', text: string }>>([]);
  
  // Updated default content with New Modules Guide
  const [boardContent, setBoardContent] = useState<string>(
`# Academy v2.1: Deployment Ready

## Newly Added Curricula:
- **GIS & Mapping**: Leaflet (React/Python), GeoPandas, Rasterio
- **Automation**: Selenium WebDriver
- **Deployment**: Vercel & Cloudflare (React)
- **Cybersecurity**: Ethical Hacking Basics

## Quick Start
Select a module from the "Quick Library" panel (bottom left) or type:
- \`teach deployment vercel\`
- \`teach deployment cloudflare\`
- \`teach geopandas basics\`
- \`teach hacking basics\`

## Code Execution
- **Web**: Run React code in your local VS Code environment.
- **Python**: Run scripts via \`python3 script.py\`.
- **Install**: Remember to \`pip install\` or \`npm install\` the required packages shown in lessons.`
  );
  
  const [loading, setLoading] = useState(false);

  const handleCommand = async (cmd: string) => {
    setHistory(prev => [...prev, { type: 'user', text: cmd }]);
    setLoading(true);

    // AI Call
    const lesson = await generateCodingLesson(cmd);
    
    setBoardContent(lesson);
    setHistory(prev => [...prev, { type: 'system', text: `Lesson generated for: "${cmd}"` }]);
    setLoading(false);
  };

  const modules = [
    { label: "Requests (API)", cmd: "teach python requests basics" },
    { label: "Leaflet (React)", cmd: "teach react leaflet basics" },
    { label: "Deploy: Vercel", cmd: "teach deployment vercel react" },
    { label: "Deploy: Cloudflare", cmd: "teach deployment cloudflare react" },
    { label: "Selenium (Auto)", cmd: "teach python selenium basics" },
    { label: "GeoPandas (GIS)", cmd: "teach python geopandas basics" },
    { label: "Hacking 101", cmd: "teach ethical hacking basics python" },
    { label: "React Basics", cmd: "teach react basics" },
  ];

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
       {/* Left Column: Terminal & Quick Library */}
       <div className="lg:col-span-1 flex flex-col gap-4 h-full">
           <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shrink-0">
              <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  DevOps Training
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                  Master the languages of creation, defense, and deployment.
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
                 Quick Library
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