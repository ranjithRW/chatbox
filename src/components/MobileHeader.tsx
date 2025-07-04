import React, { useState } from 'react';
import { Menu, Plus, MessageSquare, Trash2, X, Sparkles } from 'lucide-react';
import { ChatSession } from '../types/chat';

interface MobileHeaderProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function MobileHeader({
  sessions,
  currentSessionId,
  onCreateSession,
  onSelectSession,
  onDeleteSession,
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentSession = sessions.find(s => s.id === currentSessionId);

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
    <>
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-black bg-clip-text text-transparent">
            {currentSession?.title || 'Gemini'}
          </h1>
        </div>

        <button
          onClick={onCreateSession}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
          
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Gemini Chat</h2>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="p-4">
              <button
                onClick={() => {
                  onCreateSession();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-black text-white rounded-[4px]"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      currentSessionId === session.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      onSelectSession(session.id);
                      setIsMenuOpen(false);
                    }}
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
        </div>
      )}
    </>
  );
}