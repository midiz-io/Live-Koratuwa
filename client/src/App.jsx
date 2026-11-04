import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LanguageSelector from './components/LanguageSelector';
import Onboarding from './components/Onboarding';
import GardenMap from './components/GardenMap';
import AdminApp from './components/admin/AdminApp';
import TailwindTest from './components/TailwindTest';
import TailwindDiagnostic from './components/TailwindDiagnostic';
import api from './services/api';

function App() {
  const [currentView, setCurrentView] = useState('language');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [sessionKey, setSessionKey] = useState(null);
  const [visitedBoxes, setVisitedBoxes] = useState(new Set());

  // Load session from localStorage on app start
  useEffect(() => {
    const savedSession = localStorage.getItem('sessionKey');
    const savedLanguage = localStorage.getItem('gardenLanguage');
    const savedVisited = localStorage.getItem('visitedBoxes');
    
    if (savedSession && savedLanguage) {
      setSessionKey(savedSession);
      setSelectedLanguage(savedLanguage);
      setCurrentView('map');
      if (savedVisited) {
        setVisitedBoxes(new Set(JSON.parse(savedVisited)));
      }
    }
  }, []);

  const handleLanguageSelect = async (language) => {
    try {
      setSelectedLanguage(language);
      localStorage.setItem('gardenLanguage', language);
      
      // Create session via API
      const response = await api.post('/session/start', {
        language,
        ipAddress: '127.0.0.1' // Client IP will be detected by server
      });
      
      const newSessionKey = response.data.sessionKey;
      setSessionKey(newSessionKey);
      localStorage.setItem('sessionKey', newSessionKey);
      
      setCurrentView('onboarding');
    } catch (error) {
      console.error('Error creating session:', error);
      // Fallback to local session
      const fallbackSessionKey = 'local_' + Date.now();
      setSessionKey(fallbackSessionKey);
      localStorage.setItem('sessionKey', fallbackSessionKey);
      setCurrentView('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    setCurrentView('map');
  };

  const handleBoxVisit = async (boxId) => {
    const newVisitedBoxes = new Set(visitedBoxes);
    newVisitedBoxes.add(boxId);
    setVisitedBoxes(newVisitedBoxes);
    localStorage.setItem('visitedBoxes', JSON.stringify([...newVisitedBoxes]));
    
    // Record visit in database
    try {
      if (sessionKey) {
        await api.post('/visit', {
          sessionKey,
          boxId
        });
      }
    } catch (error) {
      console.error('Error recording visit:', error);
      // Continue anyway - visit is saved locally
    }
  };

  const handleResetSession = () => {
    // Clear all session data
    localStorage.removeItem('sessionKey');
    localStorage.removeItem('gardenLanguage');
    localStorage.removeItem('visitedBoxes');
    
    // Reset state
    setSessionKey(null);
    setSelectedLanguage(null);
    setVisitedBoxes(new Set());
    setCurrentView('language');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'language':
        return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} language={selectedLanguage} />;
      case 'map':
        return (
          <GardenMap 
            language={selectedLanguage}
            visitedBoxes={visitedBoxes}
            onBoxVisit={handleBoxVisit}
            onResetSession={handleResetSession}
          />
        );
      default:
        return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
    }
  };

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <Routes>
          <Route path="/" element={renderCurrentView()} />
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/test-tailwind" element={<TailwindTest />} />
          <Route path="/diagnostic" element={<TailwindDiagnostic />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;