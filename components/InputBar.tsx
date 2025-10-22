
import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, PaperClipIcon, StopIcon } from './icons';

interface InputBarProps {
  onSendMessage: (text: string, file?: File, type?: 'text' | 'voice' | 'file') => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleVoice: () => void;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading, isListening, onToggleVoice }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (!text.trim() && !file)) return;
    const submissionType = file ? 'file' : 'text';
    onSendMessage(text, file || undefined, submissionType);
    setText('');
    setFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleMicClick = () => {
    onToggleVoice();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-700/50 flex-shrink-0"
        disabled={isLoading}
      >
        <PaperClipIcon className="w-6 h-6" />
      </button>

      <div className="relative flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={file ? `Attached: ${file.name}` : "Type a message or command..."}
          className="w-full bg-slate-800/70 border border-slate-600/80 rounded-full py-2 pl-4 pr-12 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          disabled={isLoading || isListening}
        />
         <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full"
            disabled={isLoading || (!text.trim() && !file)}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleMicClick}
        className={`p-3 rounded-full transition-colors flex-shrink-0 ${isListening ? 'bg-red-500/80 text-white animate-pulse' : 'bg-slate-700/80 text-slate-300 hover:bg-cyan-500/50'}`}
        disabled={isLoading}
      >
        {isListening ? <StopIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
      </button>
    </form>
  );
};

export default InputBar;
