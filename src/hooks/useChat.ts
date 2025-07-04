import { useState, useEffect, useCallback } from 'react';
import { ChatSession, Message, ChatState } from '../types/chat';
import { generateResponse } from '../utils/gemini';
import { 
  saveSessions, 
  loadSessions, 
  createNewSession, 
  generateMessageId, 
  generateSessionTitle 
} from '../utils/storage';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    sessions: [],
    currentSessionId: null,
    isLoading: false,
  });

  useEffect(() => {
    const sessions = loadSessions();
    setState(prev => ({
      ...prev,
      sessions,
      currentSessionId: sessions.length > 0 ? sessions[0].id : null,
    }));
  }, []);

  const currentSession = state.sessions.find(s => s.id === state.currentSessionId);

  const saveToStorage = useCallback((sessions: ChatSession[]) => {
    saveSessions(sessions);
    setState(prev => ({ ...prev, sessions }));
  }, []);

  const createSession = useCallback(() => {
    const newSession = createNewSession();
    const updatedSessions = [newSession, ...state.sessions];
    saveToStorage(updatedSessions);
    setState(prev => ({ ...prev, currentSessionId: newSession.id }));
  }, [state.sessions, saveToStorage]);

  const selectSession = useCallback((sessionId: string) => {
    setState(prev => ({ ...prev, currentSessionId: sessionId }));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    const updatedSessions = state.sessions.filter(s => s.id !== sessionId);
    saveToStorage(updatedSessions);
    
    if (state.currentSessionId === sessionId) {
      const newCurrentId = updatedSessions.length > 0 ? updatedSessions[0].id : null;
      setState(prev => ({ ...prev, currentSessionId: newCurrentId }));
    }
  }, [state.sessions, state.currentSessionId, saveToStorage]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return;

    let sessionId = state.currentSessionId;
    let sessions = [...state.sessions];

    // Create new session if none exists
    if (!sessionId) {
      const newSession = createNewSession();
      sessions = [newSession, ...sessions];
      sessionId = newSession.id;
    }

    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    sessions[sessionIndex].messages.push(userMessage);

    // Update session title if it's the first message
    if (sessions[sessionIndex].messages.length === 1) {
      sessions[sessionIndex].title = generateSessionTitle(content);
    }

    sessions[sessionIndex].updatedAt = new Date();

    setState(prev => ({
      ...prev,
      sessions,
      currentSessionId: sessionId,
      isLoading: true,
    }));

    try {
      console.log('Attempting to generate response for:', content);
      const response = await generateResponse(content);
      console.log('Received response:', response);
      
      const assistantMessage: Message = {
        id: generateMessageId(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      const updatedSessions = [...sessions];
      const updatedSessionIndex = updatedSessions.findIndex(s => s.id === sessionId);
      updatedSessions[updatedSessionIndex].messages.push(assistantMessage);
      updatedSessions[updatedSessionIndex].updatedAt = new Date();

      saveToStorage(updatedSessions);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: generateMessageId(),
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again.`,
        role: 'assistant',
        timestamp: new Date(),
      };

      const updatedSessions = [...sessions];
      const updatedSessionIndex = updatedSessions.findIndex(s => s.id === sessionId);
      updatedSessions[updatedSessionIndex].messages.push(errorMessage);
      updatedSessions[updatedSessionIndex].updatedAt = new Date();

      saveToStorage(updatedSessions);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.sessions, state.currentSessionId, state.isLoading, saveToStorage]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!state.currentSessionId || state.isLoading) return;

    const sessions = [...state.sessions];
    const sessionIndex = sessions.findIndex(s => s.id === state.currentSessionId);
    
    if (sessionIndex === -1) return;

    const messageIndex = sessions[sessionIndex].messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) return;

    // Update the user message
    sessions[sessionIndex].messages[messageIndex].content = newContent;
    sessions[sessionIndex].messages[messageIndex].timestamp = new Date();

    // Remove all messages after the edited message (including assistant responses)
    sessions[sessionIndex].messages = sessions[sessionIndex].messages.slice(0, messageIndex + 1);
    sessions[sessionIndex].updatedAt = new Date();

    setState(prev => ({
      ...prev,
      sessions,
      isLoading: true,
    }));

    // Generate new response for the edited message
    try {
      const response = await generateResponse(newContent);
      
      const assistantMessage: Message = {
        id: generateMessageId(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      const updatedSessions = [...sessions];
      updatedSessions[sessionIndex].messages.push(assistantMessage);
      updatedSessions[sessionIndex].updatedAt = new Date();

      saveToStorage(updatedSessions);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error in editMessage:', error);
      
      const errorMessage: Message = {
        id: generateMessageId(),
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again.`,
        role: 'assistant',
        timestamp: new Date(),
      };

      const updatedSessions = [...sessions];
      updatedSessions[sessionIndex].messages.push(errorMessage);
      updatedSessions[sessionIndex].updatedAt = new Date();

      saveToStorage(updatedSessions);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.sessions, state.currentSessionId, state.isLoading, saveToStorage]);

  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!state.currentSessionId || state.isLoading) return;

    const sessions = [...state.sessions];
    const sessionIndex = sessions.findIndex(s => s.id === state.currentSessionId);
    
    if (sessionIndex === -1) return;

    const messageIndex = sessions[sessionIndex].messages.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) return;

    // Find the user message that prompted this assistant response
    let userMessageContent = '';
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (sessions[sessionIndex].messages[i].role === 'user') {
        userMessageContent = sessions[sessionIndex].messages[i].content;
        break;
      }
    }

    if (!userMessageContent) return;

    // Remove the assistant message and any messages after it
    sessions[sessionIndex].messages = sessions[sessionIndex].messages.slice(0, messageIndex);
    sessions[sessionIndex].updatedAt = new Date();

    setState(prev => ({
      ...prev,
      sessions,
      isLoading: true,
    }));

    // Generate new response
    try {
      const response = await generateResponse(userMessageContent);
      
      const assistantMessage: Message = {
        id: generateMessageId(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      const updatedSessions = [...sessions];
      updatedSessions[sessionIndex].messages.push(assistantMessage);
      updatedSessions[sessionIndex].updatedAt = new Date();

      saveToStorage(updatedSessions);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error in regenerateResponse:', error);
      
      const errorMessage: Message = {
        id: generateMessageId(),
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again.`,
        role: 'assistant',
        timestamp: new Date(),
      };

      const updatedSessions = [...sessions];
      updatedSessions[sessionIndex].messages.push(errorMessage);
      updatedSessions[sessionIndex].updatedAt = new Date();

      saveToStorage(updatedSessions);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.sessions, state.currentSessionId, state.isLoading, saveToStorage]);

  return {
    sessions: state.sessions,
    currentSession,
    isLoading: state.isLoading,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    editMessage,
    regenerateResponse,
  };
}