import React from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { useChat } from './hooks/useChat';

function App() {
  const {
    sessions,
    currentSession,
    isLoading,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    editMessage,
    regenerateResponse,
  } = useChat();

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSession?.id || null}
          onCreateSession={createSession}
          onSelectSession={selectSession}
          onDeleteSession={deleteSession}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea
          session={currentSession || null}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onEditMessage={editMessage}
          onRegenerateResponse={regenerateResponse}
          sessions={sessions}
          onCreateSession={createSession}
          onSelectSession={selectSession}
          onDeleteSession={deleteSession}
          currentSessionId={currentSession?.id || null}
        />
      </div>
    </div>
  );
}

export default App;