import React from 'react';
import { Suggestion } from '../types';
import { Lightbulb, AlertTriangle, ArrowRight, GraduationCap, X } from 'lucide-react';

interface SuggestionOverlayProps {
  suggestion: Suggestion | null;
  onDismiss: () => void;
  onLearn: (topic: string) => void;
}

const SuggestionOverlay: React.FC<SuggestionOverlayProps> = ({ suggestion, onDismiss, onLearn }) => {
  if (!suggestion) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <div className={`
        relative max-w-lg w-full p-1 rounded-xl shadow-2xl backdrop-blur-md border 
        ${suggestion.type === 'critical' 
          ? 'bg-red-950/90 border-red-500' 
          : 'bg-indigo-950/90 border-indigo-500'}
      `}>
        {/* Glowing border effect */}
        <div className={`absolute inset-0 rounded-xl blur opacity-20 ${suggestion.type === 'critical' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>

        <div className="relative bg-slate-900/80 rounded-lg p-4 flex gap-4 items-start">
          
          {/* Icon */}
          <div className={`p-3 rounded-full shrink-0 ${suggestion.type === 'critical' ? 'bg-red-900 text-red-200' : 'bg-indigo-900 text-indigo-200'}`}>
            {suggestion.type === 'critical' ? <AlertTriangle className="w-6 h-6" /> : <Lightbulb className="w-6 h-6" />}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className={`font-bold text-lg mb-1 ${suggestion.type === 'critical' ? 'text-red-300' : 'text-indigo-300'}`}>
              {suggestion.title}
            </h4>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              {suggestion.message}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              {suggestion.actionLabel && suggestion.onAction && (
                <button 
                  onClick={() => {
                    suggestion.onAction?.();
                    onDismiss();
                  }}
                  className={`flex items-center px-4 py-2 rounded text-sm font-semibold transition-all
                    ${suggestion.type === 'critical' 
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'}
                  `}
                >
                  {suggestion.actionLabel} <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
              
              {suggestion.lessonTopic && (
                <button 
                  onClick={() => {
                    onLearn(suggestion.lessonTopic!);
                    onDismiss();
                  }}
                  className="flex items-center px-4 py-2 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-all"
                >
                  <GraduationCap className="w-4 h-4 mr-2" /> Learn Logic
                </button>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button 
            onClick={onDismiss}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Avatar Badge for Professor */}
      <div className="absolute -top-3 -left-3 bg-slate-800 border border-slate-600 p-1 rounded-full shadow-lg">
         <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">AI</span>
         </div>
      </div>
    </div>
  );
};

export default SuggestionOverlay;