import React, { useState } from 'react';
import { User, Sparkles, AlertCircle, Edit3, RotateCcw, Send, X, Check } from 'lucide-react';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateResponse?: (messageId: string) => void;
  isLastUserMessage?: boolean;
  isLastAssistantMessage?: boolean;
}

export function MessageBubble({ 
  message, 
  onEditMessage, 
  onRegenerateResponse,
  isLastUserMessage,
  isLastAssistantMessage 
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const isUser = message.role === 'user';
  const isError = message.content.includes('Sorry, I encountered an error');
  
  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content && onEditMessage) {
      onEditMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={`group flex gap-4 ${isUser ? 'flex-row-reverse' : ''} mb-8 relative`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-black text-white' 
          : isError
          ? 'bg-red-100 text-red-600'
          : 'bg-black text-white'
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] text-sm md:text-base"
              autoFocus
            />
            <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || editContent === message.content}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Check className="w-3 h-3" />
                Save & Send
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={`inline-block max-w-full ${
              isUser 
                ? 'bg-black text-white px-4 py-3 rounded-2xl rounded-tr-md' 
                : isError
                ? 'bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-2xl rounded-tl-md'
                : 'bg-gray-50 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-md border'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {message.content}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className={`flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
              isUser ? 'justify-end' : 'justify-start'
            }`}>
              {isUser && isLastUserMessage && onEditMessage && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Edit message"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              )}
              
              {!isUser && isLastAssistantMessage && onRegenerateResponse && !isError && (
                <button
                  onClick={() => onRegenerateResponse(message.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3 h-3" />
                  Regenerate
                </button>
              )}
            </div>
          </>
        )}
        
        <div className={`text-xs text-gray-500 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}