import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send, Cpu } from 'lucide-react';

interface TerminalProps {
  onCommand: (cmd: string) => void;
  history: Array<{ type: 'user' | 'system', text: string }>;
  loading: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ onCommand, history, loading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Auto-focus input on click
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onCommand(input);
    setInput('');
  };

  return (
    <div 
      className="h-full bg-black rounded-lg border border-slate-700 font-mono text-sm flex flex-col shadow-2xl overflow-hidden"
      onClick={handleContainerClick}
    >
      {/* Header */}
      <div className="bg-slate-900 p-2 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-green-500">
          <TerminalIcon className="w-4 h-4" />
          <span className="font-bold tracking-wider">ACADEMY_CLI_V1.0</span>
        </div>
        <div className="flex gap-1.5">
           <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
           <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      {/* Output Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-2 text-slate-300 custom-scrollbar"
      >
        <div className="text-slate-500 mb-4">
          Last login: {new Date().toLocaleDateString()} on ttys001<br/>
          Type "learn [language]" to begin a lesson.
        </div>

        {history.map((entry, i) => (
          <div key={i} className={`${entry.type === 'user' ? 'text-white' : 'text-green-400'}`}>
            <span className="opacity-50 mr-2">{entry.type === 'user' ? '>' : '#'}</span>
            {entry.text}
          </div>
        ))}

        {loading && (
           <div className="text-green-400 animate-pulse">
             # Processing request...
           </div>
        )}
      </div>

      {/* Input Line */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-900/50 border-t border-slate-800 flex gap-2">
        <span className="text-green-500 font-bold">{'>'}</span>
        <input 
          ref={inputRef}
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-600 caret-green-500"
          placeholder="e.g. learn python loops"
          autoFocus
        />
      </form>
    </div>
  );
};

export default Terminal;