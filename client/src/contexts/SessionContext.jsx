import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [sessionKey, setSessionKey] = useState(null);
  const [language, setLanguage] = useState('en');
  const [visitedBoxes, setVisitedBoxes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session on app load
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      setLoading(true);
      
      // Check if sessionKey exists in localStorage
      const savedSessionKey = localStorage.getItem('sessionKey');
      const savedLanguage = localStorage.getItem('language') || 'en';
      
      if (savedSessionKey) {
        // Use existing session
        setSessionKey(savedSessionKey);
        setLanguage(savedLanguage);
        await loadVisitedBoxes(savedSessionKey);
      } else {
        // Create new session - will be done after language selection
        setLanguage(savedLanguage);
      }
      
    } catch (error) {
      console.error('Session initialization error:', error);
      setError('Failed to initialize session');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (selectedLanguage) => {
    try {
      const response = await axios.post('/api/session/start', {
        ipAddress: '127.0.0.1', // Will be auto-detected by backend
        language: selectedLanguage
      });

      const { sessionKey: newSessionKey } = response.data;
      
      // Save to localStorage and state
      localStorage.setItem('sessionKey', newSessionKey);
      localStorage.setItem('language', selectedLanguage);
      setSessionKey(newSessionKey);
      setLanguage(selectedLanguage);
      
      // Load visited boxes for this session
      await loadVisitedBoxes(newSessionKey);
      
      return newSessionKey;
    } catch (error) {
      console.error('Session creation error:', error);
      setError('Failed to create session');
      throw error;
    }
  };

  const loadVisitedBoxes = async (sessionKeyToUse = sessionKey) => {
    if (!sessionKeyToUse) return;
    
    try {
      const response = await axios.get(`/api/boxes?sessionKey=${sessionKeyToUse}`);
      const boxes = response.data;
      
      // Extract visited box IDs
      const visitedIds = boxes
        .filter(box => box.visited)
        .map(box => box.id);
      
      setVisitedBoxes(new Set(visitedIds));
    } catch (error) {
      console.error('Failed to load visited boxes:', error);
    }
  };

  const markBoxAsVisited = async (boxId) => {
    if (!sessionKey) return;
    
    try {
      await axios.post('/api/visit', {
        sessionKey,
        boxId
      });
      
      // Update local state
      setVisitedBoxes(prev => new Set([...prev, boxId]));
      
      // Reload visited boxes to ensure consistency
      await loadVisitedBoxes();
      
    } catch (error) {
      console.error('Failed to mark box as visited:', error);
    }
  };

  const isBoxVisited = (boxId) => {
    return visitedBoxes.has(boxId);
  };

  const value = {
    sessionKey,
    language,
    visitedBoxes,
    loading,
    error,
    createSession,
    markBoxAsVisited,
    isBoxVisited,
    loadVisitedBoxes
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};