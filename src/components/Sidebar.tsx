import React from 'react';
import { Plus, MessageSquare, Trash2, Sparkles } from 'lucide-react';
import { ChatSession } from '../types/chat';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function Sidebar({ 
  sessions, 
  currentSessionId, 
  onCreateSession, 
  onSelectSession, 
  onDeleteSession 
}: SidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-black bg-clip-text text-transparent">
            Gemini Chat
          </h1>
        </div>
        <button
          onClick={onCreateSession}
          className="w-full flex items-center gap-3 px-4 py-3 bg-black text-white rounded-[4px]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                currentSessionId === session.id
                  ? 'bg-white border border-blue-200 shadow-sm'
                  : 'hover:bg-white hover:shadow-sm'
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">{session.title}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(session.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}