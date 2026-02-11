import React from 'react';
import { SecurityConfig, LogEntry, ScenarioType, MalwareParams } from '../types';
import { ShieldCheck, Eye, Lock, Activity, Bug, Skull, Bot, Zap, RefreshCw, Cpu, BookOpen, Code, Terminal, Info } from 'lucide-react';

interface ControlPanelProps {
  config: SecurityConfig;
  logs: LogEntry[];
  currentScenario: ScenarioType;
  malwareParams: MalwareParams;
  onToggleConfig: (key: keyof SecurityConfig) => void;
  onSetPatchLevel: (level: 'low' | 'medium' | 'high') => void;
  onSelectScenario: (scenario: ScenarioType) => void;
  onUpdateParams: (params: Partial<MalwareParams>) => void;
  onSelectLessonTopic: (topic: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  config, 
  logs, 
  currentScenario,
  malwareParams,
  onToggleConfig, 
  onSetPatchLevel,
  onSelectScenario,
  onUpdateParams,
  onSelectLessonTopic
}) => {
  // Define recommended skills based on scenario
  const getSkills = () => {
    switch (currentScenario) {
        case 'worm': return [
            { name: 'Python: Socket', type: 'module' },
            { name: 'Python: Ipaddress', type: 'module' },
            { name: 'Lang: C++ (Winsock)', type: 'lang' }
        ];
        case 'ransomware': return [
            { name: 'Python: Cryptography', type: 'module' },
            { name: 'Python: OS/Path', type: 'module' },
            { name: 'Lang: Rust (Safety)', type: 'lang' }
        ];
        case 'botnet': return [
            { name: 'Python: Requests', type: 'module' },
            { name: 'Python: Threading', type: 'module' },
            { name: 'Lang: Go (Concurrency)', type: 'lang' }
        ];
        case 'fileless': return [
            { name: 'PowerShell Scripting', type: 'lang' },
            { name: 'Python: WinReg', type: 'module' },
            { name: 'Python: Ctypes', type: 'module' }
        ];
        default: return [];
    }
  };

  const getPolymorphismTip = (val: number) => {
    if (val < 30) return "Static Signature: Easily caught by traditional Antivirus.";
    if (val < 75) return "Obfuscated: Requires heuristic analysis to detect.";
    return "Metamorphic: Rewrites code structure. Bypasses most static AV.";
  };

  const getAggressionTip = (val: number) => {
    if (val < 30) return "Stealth Mode: Low network noise, hard for IDS to spot.";
    if (val < 75) return "Standard Spread: Balanced infection rate.";
    return "Noisy / Flood: Rapid spread, but triggers IDS alerts immediately.";
  };

  const skills = getSkills();

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center text-white">
          <Bug className="w-6 h-6 mr-2 text-rose-500" />
          Threat Scenario Generator
        </h2>
        
        {/* Scenario Types */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          <button onClick={() => onSelectScenario('none')} className={`p-2 rounded border text-xs font-medium transition-all ${currentScenario === 'none' ? 'bg-slate-600 border-slate-400 text-white' : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700'}`}>Idle</button>
          <button onClick={() => onSelectScenario('worm')} className={`p-2 rounded border text-xs font-medium transition-all flex flex-col items-center gap-1 ${currentScenario === 'worm' ? 'bg-orange-900/40 border-orange-500 text-orange-200' : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700'}`}><Activity className="w-4 h-4" /> Worm</button>
          <button onClick={() => onSelectScenario('ransomware')} className={`p-2 rounded border text-xs font-medium transition-all flex flex-col items-center gap-1 ${currentScenario === 'ransomware' ? 'bg-purple-900/40 border-purple-500 text-purple-200' : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700'}`}><Skull className="w-4 h-4" /> Ransom</button>
          <button onClick={() => onSelectScenario('botnet')} className={`p-2 rounded border text-xs font-medium transition-all flex flex-col items-center gap-1 ${currentScenario === 'botnet' ? 'bg-red-900/40 border-red-500 text-red-200' : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700'}`}><Bot className="w-4 h-4" /> Botnet</button>
          <button onClick={() => onSelectScenario('fileless')} className={`p-2 rounded border text-xs font-medium transition-all flex flex-col items-center gap-1 ${currentScenario === 'fileless' ? 'bg-cyan-900/40 border-cyan-500 text-cyan-200' : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700'}`}><Cpu className="w-4 h-4" /> Fileless</button>
        </div>

        {/* Threat Builder Controls */}
        {currentScenario !== 'none' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Configure Malware Logic
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Polymorphism (Bypass AV)</span>
                      <span>{malwareParams.polymorphism}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={malwareParams.polymorphism} 
                      onChange={(e) => onUpdateParams({ polymorphism: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 flex items-start gap-1">
                        <Info className="w-3 h-3 shrink-0 mt-0.5" />
                        {getPolymorphismTip(malwareParams.polymorphism)}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Aggression (Spread Speed)</span>
                      <span>{malwareParams.aggression}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={malwareParams.aggression} 
                      onChange={(e) => onUpdateParams({ aggression: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                     <p className="text-[10px] text-slate-500 mt-1 flex items-start gap-1">
                        <Info className="w-3 h-3 shrink-0 mt-0.5" />
                        {getAggressionTip(malwareParams.aggression)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 pt-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 flex items-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Auto-Run / Persistence
                        </span>
                        <button 
                        onClick={() => onUpdateParams({ persistence: !malwareParams.persistence })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${malwareParams.persistence ? 'bg-rose-500' : 'bg-slate-600'}`}
                        >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${malwareParams.persistence ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-start gap-1">
                        <Info className="w-3 h-3 shrink-0 mt-0.5" />
                        {malwareParams.persistence 
                            ? "Active: Malware writes to Registry/Startup keys. Will re-infect after deletion." 
                            : "Inactive: Malware resides in memory only. Cleared by process termination."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skill Tree / Curriculum */}
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                 <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-blue-400" /> Recommended Skills
                 </h3>
                 <div className="space-y-2">
                    {skills.length > 0 ? skills.map((skill, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelectLessonTopic(skill.name)}
                            className="w-full text-left p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-between group transition-all"
                        >
                            <span className="text-xs font-mono text-slate-300 group-hover:text-blue-300">{skill.name}</span>
                            {skill.type === 'module' ? <Code className="w-3 h-3 text-slate-500" /> : <Terminal className="w-3 h-3 text-slate-500" />}
                        </button>
                    )) : (
                        <div className="text-xs text-slate-500 italic p-2">Select a scenario to see relevant coding modules.</div>
                    )}
                 </div>
              </div>
          </div>
        )}
      </div>

      {/* Security Layers */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-lg font-semibold mb-4 text-slate-300">Defense Controls</h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => onToggleConfig('firewallEnabled')}
              className={`flex-1 p-3 rounded-lg border flex items-center justify-between transition-all ${config.firewallEnabled ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-100' : 'bg-slate-700/30 border-slate-600 text-slate-400'}`}
            >
              <div className="text-xs font-medium">Firewall</div>
              <div className={`w-2 h-2 rounded-full ${config.firewallEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </button>
            <button
              onClick={() => onToggleConfig('idsEnabled')}
              className={`flex-1 p-3 rounded-lg border flex items-center justify-between transition-all ${config.idsEnabled ? 'bg-blue-900/30 border-blue-500/50 text-blue-100' : 'bg-slate-700/30 border-slate-600 text-slate-400'}`}
            >
              <div className="text-xs font-medium">IDS</div>
              <div className={`w-2 h-2 rounded-full ${config.idsEnabled ? 'bg-blue-400' : 'bg-slate-600'}`} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleConfig('antivirusEnabled')}
              className={`flex-1 p-3 rounded-lg border flex items-center justify-between transition-all ${config.antivirusEnabled ? 'bg-purple-900/30 border-purple-500/50 text-purple-100' : 'bg-slate-700/30 border-slate-600 text-slate-400'}`}
            >
              <div className="text-xs font-medium">AV Scanner</div>
              <div className={`w-2 h-2 rounded-full ${config.antivirusEnabled ? 'bg-purple-400' : 'bg-slate-600'}`} />
            </button>
             <div className="flex-1 px-3 py-2 rounded-lg border bg-slate-700/30 border-slate-600 text-slate-300 flex flex-col justify-center">
              <div className="flex items-center text-xs font-medium mb-1">
                <Lock className="w-3 h-3 mr-1" /> Patch Level
              </div>
              <select 
                value={config.patchingLevel}
                onChange={(e) => onSetPatchLevel(e.target.value as 'low' | 'medium' | 'high')}
                className="bg-slate-800 border-slate-600 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-64 flex flex-col">
        <h2 className="text-lg font-bold mb-3 text-slate-200">System Logs</h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-sm custom-scrollbar">
          {logs.length === 0 && <div className="text-slate-500 italic">Ready for simulation...</div>}
          {logs.map((log) => (
            <div key={log.id} className={`flex items-start p-2 rounded ${
              log.type === 'alert' ? 'bg-red-900/20 text-red-300 border-l-2 border-red-500' :
              log.type === 'warning' ? 'bg-yellow-900/20 text-yellow-300 border-l-2 border-yellow-500' :
              log.type === 'success' ? 'bg-green-900/20 text-green-300 border-l-2 border-green-500' :
              'text-slate-400 border-l-2 border-slate-600'
            }`}>
              <span className="text-xs opacity-60 mr-2 min-w-[50px]">{log.timestamp}</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;