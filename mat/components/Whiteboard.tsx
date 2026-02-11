import React, { useState, useEffect } from 'react';
import { Scenario } from '../types';
import { generateLesson } from '../services/gemini';
import { Eraser, GraduationCap, Loader2, BookOpen, ShieldAlert, Code } from 'lucide-react';

interface WhiteboardProps {
  scenario: Scenario;
  lessonTopic: string | null;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ scenario, lessonTopic }) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'lesson' | 'code'>('lesson');

  useEffect(() => {
    if (scenario.id === 'none') {
      setContent("# Welcome to Cyber Defense 101\n\n- Select a threat scenario from the panel above to begin class.\n- We will cover:\n  * Malware Logic\n  * Attack Vectors\n  * Defense Strategies\n\nSelect a scenario to start!");
      return;
    }

    const fetchLesson = async () => {
      setLoading(true);
      
      let topic = scenario.name;
      let context = scenario.pythonCode;
      
      // If a specific module topic is selected, teach that instead
      if (lessonTopic) {
          topic = `The Coding Module: ${lessonTopic}`;
          context = `Explain specifically how ${lessonTopic} is used in cybersecurity, both for offense (why malware uses it) and defense (how to detect it or use it securely). Provide code snippets using ${lessonTopic}.`;
      }

      const lessonText = await generateLesson(topic, context);
      setContent(lessonText);
      setLoading(false);
    };

    fetchLesson();
  }, [scenario.id, scenario.name, scenario.pythonCode, lessonTopic]);

  // Function to render markdown-ish text to "Handwriting"
  const renderHandwriting = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-blue-900 mb-4 underline decoration-wavy decoration-blue-300">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-red-800 mt-6 mb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 text-xl text-slate-800 mb-1 list-disc marker:text-blue-600">{line.replace('- ', '')}</li>;
      }
      if (line.trim().startsWith('```')) {
         return null; // Skip code blocks in lesson view, handled separately
      }
      return <p key={index} className="text-xl text-slate-800 mb-2 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="relative">
      {/* Frame */}
      <div className="bg-[#f0f4f8] border-[12px] border-[#8B4513] rounded-lg shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col">
        
        {/* Board Header / Tray */}
        <div className="bg-[#e2e8f0] border-b border-slate-300 p-2 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white p-1.5 rounded-md">
                    <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <span className="font-handwriting text-2xl font-bold text-slate-700 leading-none">Prof. AI's Class</span>
                    <span className="text-xs text-slate-500 font-mono">{lessonTopic ? `Topic: ${lessonTopic}` : `Scenario: ${scenario.name}`}</span>
                </div>
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={() => setMode('lesson')}
                    className={`font-handwriting text-lg px-3 py-1 rounded transition-colors ${mode === 'lesson' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'hover:bg-slate-200 text-slate-600'}`}
                >
                    <BookOpen className="w-4 h-4 inline mr-1" /> Lesson
                </button>
                <button 
                    onClick={() => setMode('code')}
                    className={`font-handwriting text-lg px-3 py-1 rounded transition-colors ${mode === 'code' ? 'bg-red-100 text-red-800 border border-red-300' : 'hover:bg-slate-200 text-slate-600'}`}
                >
                    <Code className="w-4 h-4 inline mr-1" /> Source
                </button>
                <button 
                    onClick={() => setContent("")} 
                    className="text-slate-500 hover:text-slate-800 transition-colors"
                    title="Clear Board"
                >
                    <Eraser className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Board Surface */}
        <div className="flex-1 bg-white p-6 font-handwriting relative cursor-text" 
             style={{ 
                 backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
             }}>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-2xl">Professor is writing...</p>
            </div>
          ) : (
            <div className="animate-fade-in">
                {mode === 'lesson' ? (
                    <div className="prose max-w-none">
                        {renderHandwriting(content)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold text-red-700 mb-2 border-b-2 border-red-200 inline-block">Malware Source (Python)</h3>
                            <pre className="font-mono text-sm bg-slate-100 p-4 rounded border border-slate-300 text-slate-700 whitespace-pre-wrap shadow-inner font-sans">
                                {scenario.pythonCode || "// No code available"}
                            </pre>
                             <p className="text-lg text-red-600 mt-2">
                                <span className="font-bold">Dangerous:</span> This code executes raw logic without safeguards.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-green-700 mb-2 border-b-2 border-green-200 inline-block">Defense Strategy</h3>
                            <pre className="font-mono text-sm bg-slate-100 p-4 rounded border border-slate-300 text-slate-700 whitespace-pre-wrap shadow-inner font-sans">
                                {scenario.defenseCode || "// No defense available"}
                            </pre>
                            <p className="text-lg text-green-600 mt-2">
                                <span className="font-bold">Remediation:</span> Implements validation and monitoring.
                            </p>
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* Realistic Marker Trays details */}
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-80 pointer-events-none">
              <div className="w-20 h-2 bg-red-600 rounded-full shadow-sm transform rotate-3"></div>
              <div className="w-20 h-2 bg-blue-600 rounded-full shadow-sm transform -rotate-2"></div>
              <div className="w-20 h-2 bg-black rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;