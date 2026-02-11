import React, { useState } from 'react';
import { Scenario } from '../types';
import { Code, Shield, Bug } from 'lucide-react';

interface CodeViewerProps {
  scenario: Scenario;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ scenario }) => {
  const [activeTab, setActiveTab] = useState<'malware' | 'defense'>('malware');

  if (scenario.id === 'none') {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-64 flex flex-col items-center justify-center text-slate-500">
        <Code className="w-12 h-12 mb-3 opacity-50" />
        <p>Select a Malware Scenario to analyze its code structure.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 h-96 flex flex-col overflow-hidden">
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('malware')}
          className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'malware' 
              ? 'bg-red-900/20 text-red-400 border-b-2 border-red-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="w-4 h-4" /> Malware Logic (Python)
        </button>
        <button
          onClick={() => setActiveTab('defense')}
          className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'defense' 
              ? 'bg-emerald-900/20 text-emerald-400 border-b-2 border-emerald-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" /> Defense Logic (Secure Pattern)
        </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs md:text-sm relative custom-scrollbar">
        <pre className="text-slate-300">
          <code>
            {activeTab === 'malware' ? scenario.pythonCode : scenario.defenseCode}
          </code>
        </pre>
      </div>
      <div className="p-3 bg-slate-900 border-t border-slate-700 text-xs text-slate-400">
        {activeTab === 'malware' 
          ? "⚠️ Educational Use Only: Conceptual representation of malware behavior." 
          : "✅ Best Practice: Standard implementation of defense mechanisms."}
      </div>
    </div>
  );
};

export default CodeViewer;