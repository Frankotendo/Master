import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Volume2, Loader2, X } from 'lucide-react';
import { Scenario } from '../types';

interface VoiceOrbProps {
  scenario: Scenario;
}

const VoiceOrb: React.FC<VoiceOrbProps> = ({ scenario }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState(0);
  const [mode, setMode] = useState<'listening' | 'speaking' | 'idle'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Audio Context Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // Canvas Ref for Visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup function
  const disconnect = useCallback(() => {
    if (sessionRef.current) {
        // Unfortunately no close method is documented in the snippets provided, 
        // but we should stop sending data.
        sessionRef.current = null;
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    
    activeSourcesRef.current.forEach(source => source.stop());
    activeSourcesRef.current.clear();
    
    setIsConnected(false);
    setIsConnecting(false);
    setMode('idle');
    setVolume(0);
  }, []);

  const connectToGemini = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // System Instruction based on current scenario
      const systemInstruction = `You are Professor Cyber, an expert cybersecurity tutor. 
      The user is currently analyzing the "${scenario.name}" scenario.
      
      Code Context:
      ${scenario.pythonCode}

      Your goal:
      1. Ask the user ONE clarifying question about how this specific malware works or how to stop it.
      2. Listen to their answer.
      3. Provide brief, encouraging feedback.
      4. Keep responses concise (under 2 sentences) and conversational.
      
      Start by greeting the student and asking your question about the ${scenario.name}.`;

      // Connect to Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: systemInstruction,
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            setMode('listening');
            
            // Setup Input Processing (Mic -> API)
            if (!inputContextRef.current || !streamRef.current) return;
            
            sourceRef.current = inputContextRef.current.createMediaStreamSource(streamRef.current);
            processorRef.current = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visualizer
              let sum = 0;
              for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 10, 1)); // Amplify a bit for visual
              
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            sourceRef.current.connect(processorRef.current);
            processorRef.current.connect(inputContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio) {
               setMode('speaking');
               if (!outputContextRef.current) return;
               
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContextRef.current.currentTime);
               
               const audioBytes = decode(base64Audio);
               const audioBuffer = await decodeAudioData(audioBytes, outputContextRef.current, 24000, 1);
               
               const source = outputContextRef.current.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputContextRef.current.destination);
               
               source.addEventListener('ended', () => {
                 activeSourcesRef.current.delete(source);
                 if (activeSourcesRef.current.size === 0) {
                     setMode('listening');
                 }
               });
               
               source.start(nextStartTimeRef.current);
               activeSourcesRef.current.add(source);
               nextStartTimeRef.current += audioBuffer.duration;
             }
             
             if (message.serverContent?.interrupted) {
                 activeSourcesRef.current.forEach(s => s.stop());
                 activeSourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
                 setMode('listening');
             }
          },
          onclose: () => {
            disconnect();
          },
          onerror: (e) => {
            console.error("Gemini Live Error", e);
            disconnect();
            setError("Connection lost.");
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      setError("Failed to access microphone or connect.");
      setIsConnecting(false);
    }
  };

  // --- Helper Functions for Audio (from documentation) ---
  function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // Clamp values to [-1, 1] before scaling
        const val = Math.max(-1, Math.min(1, data[i]));
        int16[i] = val < 0 ? val * 0x8000 : val * 0x7FFF;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  // --- Visualizer Animation ---
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationId: number;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (!isConnected) {
              // Idle pulsing
              const time = Date.now() / 1000;
              const radius = 20 + Math.sin(time * 2) * 2;
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
              ctx.fillStyle = '#64748b'; // Slate 500
              ctx.fill();
          } else {
              // Active reacting
              const baseRadius = 25;
              const dynamicRadius = baseRadius + (volume * 30); // React to mic volume
              
              // Outer glow
              const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius, centerX, centerY, dynamicRadius + 10);
              if (mode === 'speaking') {
                  gradient.addColorStop(0, '#3b82f6'); // Blue for AI
                  gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
              } else {
                  gradient.addColorStop(0, '#10b981'); // Green for Listening
                  gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
              }
              
              ctx.beginPath();
              ctx.arc(centerX, centerY, dynamicRadius + 5, 0, Math.PI * 2);
              ctx.fillStyle = gradient;
              ctx.fill();

              // Core
              ctx.beginPath();
              ctx.arc(centerX, centerY, baseRadius + (mode === 'speaking' ? Math.random() * 5 : volume * 10), 0, Math.PI * 2);
              ctx.fillStyle = mode === 'speaking' ? '#60a5fa' : '#34d399';
              ctx.fill();
          }
          
          animationId = requestAnimationFrame(animate);
      };
      
      animate();
      return () => cancelAnimationFrame(animationId);
  }, [isConnected, volume, mode]);


  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg flex items-center justify-between">
       <div className="flex items-center gap-4">
           {/* Visualizer Canvas */}
           <div className="relative w-16 h-16 flex items-center justify-center bg-slate-900 rounded-full border border-slate-600">
               <canvas ref={canvasRef} width="64" height="64" className="absolute top-0 left-0" />
               {!isConnected && !isConnecting && <MicOff className="w-5 h-5 text-slate-500 z-10" />}
               {isConnecting && <Loader2 className="w-6 h-6 text-cyan-400 animate-spin z-10" />}
           </div>
           
           <div>
               <h3 className="font-bold text-slate-200">Professor Cyber (Voice)</h3>
               <p className="text-xs text-slate-400">
                   {isConnecting ? "Establishing link..." : 
                    isConnected ? (mode === 'speaking' ? "Speaking..." : "Listening...") : 
                    "Disconnected"}
               </p>
               {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
           </div>
       </div>

       <div>
           {!isConnected ? (
               <button 
                onClick={connectToGemini}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
               >
                   <Mic className="w-4 h-4" />
                   Start Session
               </button>
           ) : (
               <button 
                onClick={disconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-200 rounded-lg font-medium transition-all"
               >
                   <X className="w-4 h-4" />
                   End Call
               </button>
           )}
       </div>
    </div>
  );
};

export default VoiceOrb;