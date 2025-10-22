
import React from 'react';
import { Message, Role } from '../types';
import { UserIcon, CpuChipIcon } from './icons';

interface MessageProps {
  message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  const renderFile = () => {
    if (!message.file) return null;
    if (message.file.type.startsWith('image/')) {
      return <img src={message.file.url} alt={message.file.name} className="mt-2 rounded-lg max-w-xs max-h-64 object-cover" />;
    }
    return (
      <div className="mt-2 p-2 bg-slate-600/50 rounded-lg text-sm">
        <p className="font-medium text-slate-300">File: {message.file.name}</p>
        <p className="text-slate-400">Type: {message.file.type}</p>
      </div>
    );
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-md">
            <CpuChipIcon className="w-5 h-5 text-white" />
        </div>
      )}
      <div className={`max-w-lg p-3 rounded-xl ${isUser ? 'bg-blue-600/80 text-white rounded-br-none' : 'bg-slate-700/80 text-slate-200 rounded-bl-none'}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {renderFile()}
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center shadow-md">
            <UserIcon className="w-5 h-5 text-slate-300" />
        </div>
      )}
    </div>
  );
};

export default MessageComponent;
