
import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageComponent from './Message';
import InputBar from './InputBar';
import { ChartBarIcon, XMarkIcon, MinusIcon, StopIcon } from './icons';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  isListening: boolean;
  liveTranscript: string;
  suggestions: string[];
  onSendMessage: (text: string, file?: File, type?: 'text' | 'voice' | 'file') => void;
  onSuggestionClick: (suggestion: string) => void;
  onViewChange: () => void;
  onToggleVoice: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  isListening,
  liveTranscript,
  suggestions,
  onSendMessage,
  onSuggestionClick,
  onViewChange,
  onToggleVoice,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <div className="w-full max-w-3xl h-[90vh] max-h-[800px] bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-600/50">
      {/* Window Header */}
      <header className="flex items-center justify-between p-3 bg-slate-900/70 border-b border-slate-700/50 select-none">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
            D
          </div>
          <h1 className="text-xl font-bold text-slate-200">DAMIEN OS</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onViewChange} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors" title="Dashboard">
            <ChartBarIcon className="w-5 h-5 text-slate-400" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-700/50 transition-colors" title="Minimize">
            <MinusIcon className="w-5 h-5 text-slate-400" />
          </button>
          <button className="p-2 rounded-full hover:bg-red-500/50 transition-colors" title="Close">
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <MessageComponent key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <div className="flex items-center gap-2 text-slate-400">
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      
      {/* Suggestions and Input */}
      <footer className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        {isListening && (
            <div className="text-center text-cyan-400 mb-2 italic flex items-center justify-center gap-2">
                <StopIcon className="w-4 h-4 text-red-500 animate-pulse" />
                Listening... "{liveTranscript}"
            </div>
        )}
        {suggestions.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-2 mb-3">
                {suggestions.map((s, i) => (
                    <button key={i} onClick={() => onSuggestionClick(s)} className="px-3 py-1 bg-slate-700/80 text-slate-300 rounded-full text-sm hover:bg-cyan-500/50 transition-colors">
                        {s}
                    </button>
                ))}
            </div>
        )}
        <InputBar onSendMessage={onSendMessage} isLoading={isLoading} isListening={isListening} onToggleVoice={onToggleVoice} />
      </footer>
    </div>
  );
};

export default ChatWindow;
