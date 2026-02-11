import React from 'react';
import { Loader2 } from 'lucide-react';

interface BlackboardProps {
  content: string;
  loading: boolean;
}

const Blackboard: React.FC<BlackboardProps> = ({ content, loading }) => {
  
  const renderChalkContent = (text: string) => {
    if (!text) return <div className="text-white/30 italic text-center mt-20 text-2xl font-handwriting">Waiting for instructor...</div>;

    return text.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl text-white mb-6 underline decoration-wavy decoration-white/50 font-bold">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl text-yellow-200 mt-8 mb-3 font-bold border-b border-white/20 inline-block">{line.replace('## ', '')}</h2>;
      }
      // Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <li key={index} className="ml-6 text-xl text-white/90 mb-2 list-disc marker:text-yellow-200">{line.replace(/^[-*] /, '')}</li>;
      }
      // Code Blocks (Simple detection)
      if (line.includes('```')) return null; // Skip fence lines
      if (line.match(/^(\s{4}|\t)/) || line.includes('def ') || line.includes('import ') || line.includes('const ') || line.includes('function') || line.includes('class ') || line.includes('return') || line.includes(';')) {
         return <div key={index} className="font-mono text-lg text-green-300 ml-4 my-1 bg-white/5 px-2 rounded w-fit">{line}</div>;
      }
      
      return <p key={index} className="text-xl text-white/90 mb-2 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Board Frame */}
      <div className="flex-1 bg-[#2b2b2b] border-[16px] border-[#5d4037] rounded-lg shadow-2xl relative overflow-hidden flex flex-col">
        {/* Chalk Dust Texture Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-scales.png")' }}>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-8 font-handwriting overflow-y-auto custom-scrollbar bg-[#1a2e1a] relative">
             {/* Random chalk smudges */}
             <div className="absolute top-10 left-20 w-32 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>
             <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>

             {loading ? (
                 <div className="h-full flex flex-col items-center justify-center text-white/50">
                     <Loader2 className="w-12 h-12 animate-spin mb-4" />
                     <p className="text-2xl font-handwriting">Writing on board...</p>
                 </div>
             ) : (
                 <div className="relative z-10">
                     {renderChalkContent(content)}
                 </div>
             )}
        </div>

        {/* Chalk Tray */}
        <div className="h-4 bg-[#4e342e] border-t border-[#3e2723] flex items-end px-12 relative shadow-inner">
            <div className="w-16 h-2 bg-white rounded-sm opacity-80 mb-1 transform rotate-1"></div>
            <div className="w-12 h-2 bg-yellow-200 rounded-sm opacity-80 mb-1 ml-4 transform -rotate-2"></div>
            <div className="w-8 h-6 bg-[#3e2723] ml-auto mb-1 rounded flex items-center justify-center shadow-lg">
                <span className="text-[10px] text-white/50">Eraser</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Blackboard;