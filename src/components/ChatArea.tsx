import { useEffect, useRef} from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { MobileHeader } from './MobileHeader';
import { ChatSession } from '../types/chat';
import { Sparkles, Stars } from 'lucide-react';

interface ChatAreaProps {
  session: ChatSession | null;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onRegenerateResponse: (messageId: string) => void;
  sessions: ChatSession[];
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  currentSessionId: string | null;
}

export function ChatArea({ 
  session, 
  isLoading, 
  onSendMessage,
  onEditMessage,
  onRegenerateResponse,
  sessions,
  onCreateSession,
  onSelectSession,
  onDeleteSession,
  currentSessionId
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const getLastUserMessageIndex = () => {
    if (!session?.messages) return -1;
    for (let i = session.messages.length - 1; i >= 0; i--) {
      if (session.messages[i].role === 'user') {
        return i;
      }
    }
    return -1;
  };

  const getLastAssistantMessageIndex = () => {
    if (!session?.messages) return -1;
    for (let i = session.messages.length - 1; i >= 0; i--) {
      if (session.messages[i].role === 'assistant') {
        return i;
      }
    }
    return -1;
  };

  if (!session) {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Mobile Header */}
        <div className="md:hidden">
          <MobileHeader
            sessions={sessions}
            currentSessionId={currentSessionId}
            onCreateSession={onCreateSession}
            onSelectSession={onSelectSession}
            onDeleteSession={onDeleteSession}
          />
        </div>

        {/* Welcome Screen */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
          <div className="text-center max-w-2xl mx-auto">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto bg-black rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Stars className="w-3 h-3 text-yellow-800" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-black bg-clip-text text-transparent mb-4">
              Hello, I'm Gemini
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              How can I help you today?
            </p>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                {
                  icon: "💡",
                  title: "Creative writing",
                  description: "Help me write a story about..."
                },
                {
                  icon: "🔍",
                  title: "Research & analysis",
                  description: "Explain the concept of..."
                },
                {
                  icon: "💻",
                  title: "Code assistance",
                  description: "Help me debug this code..."
                },
                {
                  icon: "🎯",
                  title: "Problem solving",
                  description: "I need help with..."
                }
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage(suggestion.description)}
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="text-2xl mb-2">{suggestion.icon}</div>
                  <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100">
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  const lastUserMessageIndex = getLastUserMessageIndex();
  const lastAssistantMessageIndex = getLastAssistantMessageIndex();

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader
          sessions={sessions}
          currentSessionId={currentSessionId}
          onCreateSession={onCreateSession}
          onSelectSession={onSelectSession}
          onDeleteSession={onDeleteSession}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {session.messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              onEditMessage={onEditMessage}
              onRegenerateResponse={onRegenerateResponse}
              isLastUserMessage={index === lastUserMessageIndex}
              isLastAssistantMessage={index === lastAssistantMessageIndex}
            />
          ))}
          {isLoading && (
            <div className="flex gap-4 mb-6">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-4 rounded-2xl bg-gray-50 border">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-gray-100">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}