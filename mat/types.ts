export interface Node {
  id: string;
  x: number;
  y: number;
  type: 'server' | 'client' | 'firewall' | 'router';
  status: 'secure' | 'infected' | 'scanning' | 'encrypted' | 'bot';
  isPersistent?: boolean;
  label: string;
}

export interface Packet {
  id: string;
  sourceId: string;
  targetId: string;
  progress: number;
  type: 'legitimate' | 'malware' | 'probe' | 'data_exfil';
  blocked: boolean;
  blockedBy?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
}

export interface SecurityConfig {
  firewallEnabled: boolean;
  idsEnabled: boolean;
  antivirusEnabled: boolean;
  patchingLevel: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type ScenarioType = 'none' | 'worm' | 'ransomware' | 'botnet' | 'fileless';

export interface MalwareParams {
  polymorphism: number; // 0-100: Reduces AV detection
  aggression: number; // 0-100: Increases spread speed vs IDS detection
  persistence: boolean; // Enables Auto-Run / Re-infection
}

export interface Scenario {
  id: ScenarioType;
  name: string;
  description: string;
  pythonCode: string;
  defenseCode: string;
}

export interface Suggestion {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'improvement';
  actionLabel?: string;
  onAction?: () => void;
  lessonTopic?: string;
}