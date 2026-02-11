import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Node, Packet, SecurityConfig } from '../types';
import { Shield, Server, Monitor, Router, AlertTriangle, Lock, Bot, RefreshCw } from 'lucide-react';

interface NetworkMapProps {
  nodes: Node[];
  packets: Packet[];
  config: SecurityConfig;
  onNodeClick: (node: Node) => void;
}

const NetworkMap: React.FC<NetworkMapProps> = ({ nodes, packets, config, onNodeClick }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getNodeIcon = (node: Node) => {
    // Override icon for infected states
    if (node.status === 'encrypted') return <Lock className="w-6 h-6 text-purple-300" />;
    if (node.status === 'bot') return <Bot className="w-6 h-6 text-red-300" />;

    switch (node.type) {
      case 'server': return <Server className="w-6 h-6 text-indigo-400" />;
      case 'firewall': return <Shield className={`w-8 h-8 ${config.firewallEnabled ? 'text-green-400' : 'text-gray-500'}`} />;
      case 'router': return <Router className="w-6 h-6 text-blue-400" />;
      default: return <Monitor className="w-6 h-6 text-slate-300" />;
    }
  };

  const getNodeColor = (status: string) => {
    if (status === 'infected') return 'stroke-orange-500 fill-orange-900/50';
    if (status === 'encrypted') return 'stroke-purple-500 fill-purple-900/50';
    if (status === 'bot') return 'stroke-red-500 fill-red-900/50';
    if (status === 'scanning') return 'stroke-yellow-500 fill-yellow-900/50';
    return 'stroke-cyan-500 fill-cyan-900/30';
  };

  return (
    <div ref={containerRef} className="relative w-full h-[500px] bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner">
      <div className="absolute top-4 left-4 z-10 bg-slate-800/80 p-3 rounded-lg backdrop-blur-sm border border-slate-600">
        <h3 className="text-sm font-semibold text-slate-200">Network Map</h3>
        <p className="text-xs text-slate-400">Live Traffic Visualization</p>
      </div>

      <svg width="100%" height="100%">
        {/* Connections */}
        {nodes.map((node) => {
          const centerNode = nodes.find(n => n.type === 'router');
          if (!centerNode || node.id === centerNode.id) return null;
          
          return (
            <line
              key={`link-${node.id}`}
              x1={`${centerNode.x}%`}
              y1={`${centerNode.y}%`}
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              className="stroke-slate-700"
              strokeWidth="2"
            />
          );
        })}

        {/* Packets */}
        {packets.map((packet) => {
          const source = nodes.find(n => n.id === packet.sourceId);
          const target = nodes.find(n => n.id === packet.targetId);
          if (!source || !target) return null;

          const x = source.x + (target.x - source.x) * (packet.progress / 100);
          const y = source.y + (target.y - source.y) * (packet.progress / 100);

          let color = 'fill-blue-400';
          if (packet.type === 'malware') color = 'fill-orange-500';
          if (packet.type === 'data_exfil') color = 'fill-red-600';
          if (packet.type === 'probe') color = 'fill-yellow-400';
          if (packet.blocked) color = 'fill-gray-500';

          return (
            <circle
              key={packet.id}
              cx={`${x}%`}
              cy={`${y}%`}
              r={packet.blocked ? 3 : 5}
              className={`${color} transition-all duration-75`}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
            <g 
                key={node.id} 
                onClick={() => onNodeClick(node)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
            >
                <circle
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r="24"
                    className={`${getNodeColor(node.status)} stroke-2`}
                />
                <foreignObject x={`${node.x - 3}%`} y={`${node.y - 4}%`} width="40" height="40">
                   <div className="flex items-center justify-center h-full">
                       {getNodeIcon(node)}
                   </div>
                </foreignObject>
                <text 
                    x={`${node.x}%`} 
                    y={`${node.y + 8}%`} 
                    textAnchor="middle" 
                    className="fill-slate-400 text-xs font-mono select-none"
                >
                    {node.label}
                </text>
                 {(node.status !== 'secure') && (
                    <foreignObject x={`${node.x + 2}%`} y={`${node.y - 5}%`} width="20" height="20">
                         <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                    </foreignObject>
                 )}
                 {/* Persistence Indicator */}
                 {node.isPersistent && (
                    <foreignObject x={`${node.x - 6}%`} y={`${node.y - 5}%`} width="20" height="20">
                         <div className="bg-rose-900 rounded-full p-0.5" title="Persistent Threat Detected">
                             <RefreshCw className="w-4 h-4 text-rose-400 animate-spin-slow" />
                         </div>
                    </foreignObject>
                 )}
            </g>
        ))}
      </svg>
    </div>
  );
};

export default NetworkMap;